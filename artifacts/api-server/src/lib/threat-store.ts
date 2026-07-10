import { randomUUID } from "crypto";

export type ThreatType = "brute_force" | "bot_signature" | "rate_abuse" | "exploit_attempt";
export type ThreatSeverity = "low" | "medium" | "high" | "critical";

export interface ThreatEvent {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  ip: string;
  userId?: string;
  reason: string;
  blocked: boolean;
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

interface IpActivity {
  requestTimestamps: number[];
  failedLogins: number[];
}

const ipActivity = new Map<string, IpActivity>();
const blockedIps = new Map<string, { until: number; reason: string }>();
const threatLog: ThreatEvent[] = [];
const MAX_LOG = 200;

function getActivity(ip: string): IpActivity {
  let activity = ipActivity.get(ip);
  if (!activity) {
    activity = { requestTimestamps: [], failedLogins: [] };
    ipActivity.set(ip, activity);
  }
  return activity;
}

function recordThreat(event: Omit<ThreatEvent, "id" | "createdAt">): ThreatEvent {
  const full: ThreatEvent = { ...event, id: randomUUID(), createdAt: Date.now() };
  threatLog.unshift(full);
  if (threatLog.length > MAX_LOG) threatLog.length = MAX_LOG;
  return full;
}

function blockIp(ip: string, reason: string) {
  blockedIps.set(ip, { until: Date.now() + BLOCK_DURATION_MS, reason });
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

export function inspectRequest(input: RequestCheckInput): ThreatEvent | null {
  const { ip, url, userAgent, userId } = input;
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
    blockIp(ip, "Known bot / scripted user-agent signature on auth endpoint");
    return recordThreat({
      type: "bot_signature",
      severity: "medium",
      ip,
      userId,
      reason: `Blocked scripted/bot user-agent on auth endpoint: "${userAgent || "(empty)"}"`,
      blocked: true,
    });
  }

  if (EXPLOIT_PATTERNS.some((p) => p.test(url))) {
    blockIp(ip, "Exploit / path traversal attempt detected");
    return recordThreat({
      type: "exploit_attempt",
      severity: "critical",
      ip,
      userId,
      reason: `Blocked exploit attempt targeting "${url}"`,
      blocked: true,
    });
  }

  if (activity.requestTimestamps.length > RATE_LIMIT) {
    blockIp(ip, "Excessive request rate");
    return recordThreat({
      type: "rate_abuse",
      severity: "high",
      ip,
      userId,
      reason: `Blocked after ${activity.requestTimestamps.length} requests in ${RATE_WINDOW_MS / 1000}s`,
      blocked: true,
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
    activity.failedLogins = [];
    return recordThreat({
      type: "brute_force",
      severity: "high",
      ip,
      userId,
      reason: `Blocked after ${FAILED_LOGIN_LIMIT}+ failed login attempts`,
      blocked: true,
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
    totalThreatsBlocked: threatLog.length,
    activeBlockedIps: activeBlocks.length,
    blockedIpList: activeBlocks,
    recentThreats: threatLog.slice(0, 25),
  };
}

export function getLatestThreat(): ThreatEvent | undefined {
  return threatLog[0];
}
