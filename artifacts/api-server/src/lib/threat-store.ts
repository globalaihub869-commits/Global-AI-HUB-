import { randomUUID } from "crypto";
import { publishLiveEvent } from "./live-events.js";

export type ThreatType = "brute_force" | "bot_signature" | "rate_abuse" | "exploit_attempt";
export type ThreatSeverity = "low" | "medium" | "high" | "critical";

/**
 * "Hacker Action Log" entry. Every unauthorized action, bad request, or
 * exploit attempt is recorded here in full detail BEFORE any automatic
 * block is triggered, so the owner always has a complete audit trail —
 * including the pre-block warning attempts that preceded a hard block.
 */
export interface ThreatEvent {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  ip: string;
  userId?: string;
  method: string;
  path: string;
  action: string;
  reason: string;
  /** true once the offending IP has actually been hard-blocked. */
  blocked: boolean;
  /** true when this event is a strict pre-block warning, not yet a block. */
  preBlockWarning: boolean;
  /** how many suspicious attempts this IP has racked up so far (for warnings). */
  attemptNumber: number;
  createdAt: number;
}

const BOT_UA_PATTERNS = [
  /curl\//i,
  /python-requests/i,
  /wget/i,
  /scrapy/i,
  /sqlmap/i,
  /nikto/i,
  /^$/,
];

const EXPLOIT_PATTERNS = [
  /\.\.\//,
  /<script/i,
  /union\s+select/i,
  /drop\s+table/i,
  /\/etc\/passwd/i,
  /wp-admin/i,
  /\.env$/i,
];

const RATE_WINDOW_MS = 10_000;
const RATE_LIMIT = 40;
const FAILED_LOGIN_LIMIT = 5;
const FAILED_LOGIN_WINDOW_MS = 5 * 60 * 1000;
const BLOCK_DURATION_MS = 30 * 60 * 1000;
/** Number of strict warnings a suspicious IP gets before it is hard-blocked. */
const PRE_BLOCK_WARNING_LIMIT = 2;

interface IpActivity {
  requestTimestamps: number[];
  failedLogins: number[];
  suspicionCount: number;
}

const ipActivity = new Map<string, IpActivity>();
const blockedIps = new Map<string, { until: number; reason: string }>();
const threatLog: ThreatEvent[] = [];
const MAX_LOG = 500;

function getActivity(ip: string): IpActivity {
  let activity = ipActivity.get(ip);
  if (!activity) {
    activity = { requestTimestamps: [], failedLogins: [], suspicionCount: 0 };
    ipActivity.set(ip, activity);
  }
  return activity;
}

function recordThreat(event: Omit<ThreatEvent, "id" | "createdAt">): ThreatEvent {
  const full: ThreatEvent = { ...event, id: randomUUID(), createdAt: Date.now() };
  threatLog.unshift(full);
  if (threatLog.length > MAX_LOG) threatLog.length = MAX_LOG;

  if (full.blocked) {
    publishLiveEvent({
      type: "threat_blocked",
      title: "Threat auto-blocked",
      message: `${full.ip} — ${full.reason}`,
    });
  }

  return full;
}

function blockIp(ip: string, reason: string) {
  blockedIps.set(ip, { until: Date.now() + BLOCK_DURATION_MS, reason });
}

/** "1-Click IP Unblock" override for the owner — immediately lifts a block and resets its suspicion history. */
export function unblockIp(ip: string): boolean {
  const existed = blockedIps.delete(ip);
  ipActivity.delete(ip);
  if (existed) {
    publishLiveEvent({
      type: "ip_unblocked",
      title: "IP manually unblocked",
      message: `${ip} was unblocked by the admin owner override`,
    });
  }
  return existed;
}

export function isBlocked(ip: string): boolean {
  const entry = blockedIps.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.until) {
    blockedIps.delete(ip);
    return false;
  }
  return true;
}

export interface RequestCheckInput {
  ip: string;
  method: string;
  url: string;
  userAgent?: string;
  userId?: string;
}

const SENSITIVE_AUTH_PATHS = [/^\/api\/auth\/(login|signup)/];

/**
 * Logs every suspicious/unauthorized action in full detail (the "Hacker
 * Action Log") BEFORE deciding whether to warn or hard-block. The first
 * `PRE_BLOCK_WARNING_LIMIT` suspicious attempts from an IP only trigger a
 * strict pre-block warning (surfaced to the offending client via the
 * `X-Security-Warning` response header so the UI can show a warning banner);
 * only once the limit is exceeded does the IP actually get hard-blocked.
 */
function recordSuspiciousAction(input: {
  ip: string;
  method: string;
  url: string;
  userId?: string;
  type: ThreatType;
  severity: ThreatSeverity;
  action: string;
  blockReason: string;
}): ThreatEvent {
  const { ip, method, url, userId, type, severity, action, blockReason } = input;
  const activity = getActivity(ip);
  activity.suspicionCount += 1;
  const attemptNumber = activity.suspicionCount;

  if (attemptNumber <= PRE_BLOCK_WARNING_LIMIT) {
    return recordThreat({
      type,
      severity,
      ip,
      userId,
      method,
      path: url,
      action,
      reason: `Pre-block warning ${attemptNumber}/${PRE_BLOCK_WARNING_LIMIT}: ${action}`,
      blocked: false,
      preBlockWarning: true,
      attemptNumber,
    });
  }

  blockIp(ip, blockReason);
  return recordThreat({
    type,
    severity,
    ip,
    userId,
    method,
    path: url,
    action,
    reason: blockReason,
    blocked: true,
    preBlockWarning: false,
    attemptNumber,
  });
}

export function inspectRequest(input: RequestCheckInput): ThreatEvent | null {
  const { ip, method, url, userAgent, userId } = input;
  const now = Date.now();

  if (isBlocked(ip)) return null;

  const activity = getActivity(ip);
  activity.requestTimestamps.push(now);
  activity.requestTimestamps = activity.requestTimestamps.filter((t) => now - t < RATE_WINDOW_MS);

  // Bot-signature blocking is scoped to sensitive auth endpoints only (a common
  // credential-stuffing target). We deliberately do NOT hard-block scripted
  // user-agents on every route: legitimate API clients, health checks, and the
  // shared dev/preview proxy can share an IP with normal browser traffic, so a
  // blanket block here would risk taking down real users too.
  const isSensitivePath = SENSITIVE_AUTH_PATHS.some((p) => p.test(url));
  if (isSensitivePath && userAgent !== undefined && BOT_UA_PATTERNS.some((p) => p.test(userAgent))) {
    return recordSuspiciousAction({
      ip,
      method,
      url,
      userId,
      type: "bot_signature",
      severity: "medium",
      action: `Scripted/bot user-agent on auth endpoint: "${userAgent || "(empty)"}"`,
      blockReason: "Known bot / scripted user-agent signature on auth endpoint",
    });
  }

  if (EXPLOIT_PATTERNS.some((p) => p.test(url))) {
    return recordSuspiciousAction({
      ip,
      method,
      url,
      userId,
      type: "exploit_attempt",
      severity: "critical",
      action: `Exploit / path traversal attempt targeting "${url}"`,
      blockReason: `Blocked exploit attempt targeting "${url}"`,
    });
  }

  if (activity.requestTimestamps.length > RATE_LIMIT) {
    blockIp(ip, "Excessive request rate");
    return recordThreat({
      type: "rate_abuse",
      severity: "high",
      ip,
      userId,
      method,
      path: url,
      action: `Excessive request rate: ${activity.requestTimestamps.length} requests in ${RATE_WINDOW_MS / 1000}s`,
      reason: `Blocked after ${activity.requestTimestamps.length} requests in ${RATE_WINDOW_MS / 1000}s`,
      blocked: true,
      preBlockWarning: false,
      attemptNumber: activity.requestTimestamps.length,
    });
  }

  return null;
}

export function recordFailedLogin(ip: string, userId?: string): ThreatEvent | null {
  const now = Date.now();
  const activity = getActivity(ip);
  activity.failedLogins.push(now);
  activity.failedLogins = activity.failedLogins.filter((t) => now - t < FAILED_LOGIN_WINDOW_MS);

  if (activity.failedLogins.length >= FAILED_LOGIN_LIMIT) {
    blockIp(ip, "Repeated failed login attempts (brute force)");
    const attemptNumber = activity.failedLogins.length;
    activity.failedLogins = [];
    return recordThreat({
      type: "brute_force",
      severity: "high",
      ip,
      userId,
      method: "POST",
      path: "/api/auth/login",
      action: `${FAILED_LOGIN_LIMIT}+ failed login attempts within ${FAILED_LOGIN_WINDOW_MS / 60_000} minutes`,
      reason: `Blocked after ${FAILED_LOGIN_LIMIT}+ failed login attempts`,
      blocked: true,
      preBlockWarning: false,
      attemptNumber,
    });
  }
  return null;
}

export function getThreatSummary() {
  const now = Date.now();
  const activeBlocks = Array.from(blockedIps.entries())
    .filter(([, v]) => v.until > now)
    .map(([ip, v]) => ({ ip, reason: v.reason, expiresAt: v.until }));

  return {
    totalThreatsBlocked: threatLog.filter((t) => t.blocked).length,
    totalPreBlockWarnings: threatLog.filter((t) => t.preBlockWarning).length,
    activeBlockedIps: activeBlocks.length,
    blockedIpList: activeBlocks,
    recentThreats: threatLog.slice(0, 25),
  };
}

export function getLatestThreat(): ThreatEvent | undefined {
  return threatLog[0];
}

/** Full "Hacker Action Log" — every unauthorized action, warning, and block, most recent first. */
export function getActionLog(limit = 200): ThreatEvent[] {
  return threatLog.slice(0, limit);
}
