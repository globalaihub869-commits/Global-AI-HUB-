import { randomUUID } from "crypto";
import { publishLiveEvent } from "./live-events.js";
import { logger } from "./logger.js";
import { db, threatEventsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

export type ThreatType = "brute_force" | "bot_signature" | "rate_abuse" | "exploit_attempt";
export type ThreatSeverity = "low" | "medium" | "high" | "critical";

/**
 * Tab 1 — "Threats & Bot Logs"
 * High-risk events: exploit attempts, bot signatures, brute-force, hard rate-limit blocks.
 * These are automatically blocked with no CAPTCHA challenge.
 */
export interface ThreatEvent {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  ip: string;
  country: string;
  userId?: string;
  method: string;
  path: string;
  action: string;
  reason: string;
  /** true once the offending IP has been hard-blocked. */
  blocked: boolean;
  /** true when this is a pre-block warning (only used for soft rate-limit in legacy path). */
  preBlockWarning: boolean;
  attemptNumber: number;
  permanentBlock: boolean;
  createdAt: number;
}

/**
 * Tab 2 — "User Verification Logs"
 * Real users who hit the soft rate-limit and were shown the CAPTCHA challenge.
 * These are never auto-blocked; the admin can whitelist them instantly.
 */
export interface CaptchaLogEntry {
  id: string;
  ip: string;
  country: string;
  reason: string;
  solved: boolean;
  whitelisted: boolean;
  challengedAt: number;
}

// ── Admin whitelist ───────────────────────────────────────────────────────────
export const WHITELISTED_EMAILS = new Set([
  "faisalmiraj313@gmail.com",
]);

/** IPs that have been explicitly trusted (e.g. after a whitelisted-email login or Tab 2 whitelist button). */
const trustedIps = new Set<string>();
/** IPs that have been whitelisted via Tab 2 "Whitelist IP" — tracked separately so the log can reflect the status. */
const captchaWhitelistedIps = new Set<string>();

export function isEmailWhitelisted(email: string): boolean {
  return WHITELISTED_EMAILS.has(email.toLowerCase().trim());
}

export function isIpTrusted(ip: string): boolean {
  return trustedIps.has(ip);
}

/** Mark an IP as permanently trusted (admin login bypass). */
export function trustIp(ip: string): void {
  trustedIps.add(ip);
  blockedIps.delete(ip);
  ipActivity.delete(ip);
  logger.info({ ip }, "IP trusted — admin whitelist login");
}

export function clearIpSuspicion(ip: string): void {
  blockedIps.delete(ip);
  ipActivity.delete(ip);
}

// ── Threat-detection constants & patterns ─────────────────────────────────────
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
  /\/\.git\//i,
  /\/config\./i,
  /exec\(/i,
  /base64_decode/i,
  /alert\(/i,
];

const RATE_WINDOW_MS = 10_000;
/** Soft threshold → CAPTCHA challenge logged in Tab 2, request allowed through with warning banner. */
const RATE_SOFT_LIMIT = 25;
/** Hard threshold → immediate IP block, logged in Tab 1. */
const RATE_HARD_LIMIT = 50;
const FAILED_LOGIN_LIMIT = 5;
const FAILED_LOGIN_WINDOW_MS = 5 * 60 * 1000;
const BLOCK_DURATION_MS = 30 * 60 * 1000;

interface IpActivity {
  requestTimestamps: number[];
  failedLogins: number[];
  captchaChallengeCount: number;
}

const ipActivity = new Map<string, IpActivity>();
const blockedIps = new Map<string, { until: number; reason: string; permanent: boolean }>();

/** Tab 1 — Threats & Bot Logs (hacking, exploits, bots, hard rate-limit blocks) */
const threatLog: ThreatEvent[] = [];
/** Tab 2 — User Verification Logs (legit users who hit soft rate-limit, shown CAPTCHA) */
const captchaLog: CaptchaLogEntry[] = [];

const MAX_LOG = 500;

function getActivity(ip: string): IpActivity {
  let activity = ipActivity.get(ip);
  if (!activity) {
    activity = { requestTimestamps: [], failedLogins: [], captchaChallengeCount: 0 };
    ipActivity.set(ip, activity);
  }
  return activity;
}

function persistThreatEvent(event: ThreatEvent): void {
  db.insert(threatEventsTable)
    .values({
      id: event.id,
      type: event.type,
      severity: event.severity,
      ip: event.ip,
      userId: event.userId,
      method: event.method,
      path: event.path,
      action: event.action,
      reason: event.reason,
      blocked: event.blocked,
      preBlockWarning: event.preBlockWarning,
      attemptNumber: event.attemptNumber,
      createdAt: event.createdAt,
    })
    .onConflictDoNothing()
    .catch((err) => logger.error({ err }, "Failed to persist threat event"));
}

function recordThreat(event: Omit<ThreatEvent, "id" | "createdAt">): ThreatEvent {
  const full: ThreatEvent = { ...event, id: randomUUID(), createdAt: Date.now() };
  threatLog.unshift(full);
  if (threatLog.length > MAX_LOG) threatLog.length = MAX_LOG;
  persistThreatEvent(full);

  if (full.blocked) {
    publishLiveEvent({
      type: "threat_blocked",
      title: "Threat auto-blocked",
      message: `${full.ip} — ${full.reason}`,
    });
  }
  return full;
}

function blockIp(ip: string, reason: string, permanent = false) {
  blockedIps.set(ip, {
    until: permanent ? Number.MAX_SAFE_INTEGER : Date.now() + BLOCK_DURATION_MS,
    reason,
    permanent,
  });
}

/** Record a CAPTCHA challenge for Tab 2 — does NOT add to threatLog, does NOT block. */
function recordCaptchaChallenge(ip: string, method: string, url: string, reason: string): ThreatEvent {
  if (!captchaLog.find((e) => e.ip === ip)) {
    // Only add one captcha entry per IP per session (de-duplicate by IP)
    const entry: CaptchaLogEntry = {
      id: randomUUID(),
      ip,
      country: "Unknown",
      reason,
      solved: false,
      whitelisted: captchaWhitelistedIps.has(ip),
      challengedAt: Date.now(),
    };
    captchaLog.unshift(entry);
    if (captchaLog.length > MAX_LOG) captchaLog.length = MAX_LOG;
  }

  // Return a synthetic ThreatEvent so app.ts can set X-Security-Warning header
  // (shows the "Are you human?" warning banner on the frontend)
  return {
    id: randomUUID(),
    type: "rate_abuse",
    severity: "low",
    ip,
    country: "Unknown",
    method,
    path: url,
    action: `Soft rate-limit — CAPTCHA challenge: ${reason}`,
    reason: `CAPTCHA challenge: ${reason}`,
    blocked: false,
    preBlockWarning: true,
    attemptNumber: 1,
    permanentBlock: false,
    createdAt: Date.now(),
  };
}

/** 1-Click IP Unblock override for the owner. */
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

/** Permanently block an IP from Tab 1 (no expiry). */
export function permanentBlockIp(ip: string): void {
  blockIp(ip, "Admin permanent block", true);
  recordThreat({
    type: "exploit_attempt",
    severity: "critical",
    ip,
    country: "Unknown",
    method: "ADMIN",
    path: "/admin",
    action: `Admin permanently blocked IP: ${ip}`,
    reason: `Permanently blocked by admin`,
    blocked: true,
    preBlockWarning: false,
    attemptNumber: 0,
    permanentBlock: true,
  });
  publishLiveEvent({
    type: "threat_blocked",
    title: "IP Permanently Blocked",
    message: `${ip} permanently blocked by admin`,
  });
}

/** Whitelist an IP from Tab 2 — marks it trusted, removes from blocked, updates captchaLog entry. */
export function whitelistCaptchaIp(ip: string): void {
  captchaWhitelistedIps.add(ip);
  trustedIps.add(ip);
  blockedIps.delete(ip);
  ipActivity.delete(ip);
  // Mark any existing captcha log entries for this IP as whitelisted
  for (const entry of captchaLog) {
    if (entry.ip === ip) {
      entry.whitelisted = true;
      entry.solved = true; // They've been verified by admin decision
    }
  }
  publishLiveEvent({
    type: "ip_unblocked",
    title: "IP Whitelisted",
    message: `${ip} whitelisted — will never be challenged again`,
  });
  logger.info({ ip }, "IP whitelisted from CAPTCHA log by admin");
}

export function isBlocked(ip: string): boolean {
  const entry = blockedIps.get(ip);
  if (!entry) return false;
  if (!entry.permanent && Date.now() > entry.until) {
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
 * Automatic threat discrimination:
 *
 * CLEAR HACKING PATTERNS → immediate auto-block, logged in Tab 1 (no CAPTCHA, no warnings):
 *   - Bot user-agents on auth endpoints (credential stuffing)
 *   - Exploit / path traversal patterns in URL
 *   - Brute-force login attempts (handled separately via recordFailedLogin)
 *   - Hard rate-limit (50+ requests in 10s)
 *
 * NORMAL FAST BROWSING → soft CAPTCHA challenge, logged in Tab 2:
 *   - Soft rate-limit (25–49 requests in 10s) — typical VPN/proxy burst, not malicious
 */
export function inspectRequest(input: RequestCheckInput): ThreatEvent | null {
  const { ip, method, url, userAgent, userId } = input;
  const now = Date.now();

  if (isBlocked(ip)) return null;

  const activity = getActivity(ip);
  activity.requestTimestamps.push(now);
  activity.requestTimestamps = activity.requestTimestamps.filter((t) => now - t < RATE_WINDOW_MS);

  // ── Bot signatures on sensitive auth paths → immediate auto-block (Tab 1) ─
  const isSensitivePath = SENSITIVE_AUTH_PATHS.some((p) => p.test(url));
  if (isSensitivePath && userAgent !== undefined && BOT_UA_PATTERNS.some((p) => p.test(userAgent))) {
    blockIp(ip, "Known bot / scripted user-agent signature on auth endpoint");
    return recordThreat({
      type: "bot_signature",
      severity: "high",
      ip,
      country: "Unknown",
      userId,
      method,
      path: url,
      action: `Bot user-agent on auth endpoint: "${userAgent || "(empty)"}"`,
      reason: "Auto-blocked: Known bot / scripted user-agent on auth endpoint",
      blocked: true,
      preBlockWarning: false,
      attemptNumber: 1,
      permanentBlock: false,
    });
  }

  // ── Exploit / path traversal patterns → immediate auto-block (Tab 1) ──────
  if (EXPLOIT_PATTERNS.some((p) => p.test(url))) {
    blockIp(ip, `Blocked exploit attempt targeting "${url}"`);
    return recordThreat({
      type: "exploit_attempt",
      severity: "critical",
      ip,
      country: "Unknown",
      userId,
      method,
      path: url,
      action: `Exploit / injection attempt targeting "${url}"`,
      reason: `Auto-blocked: exploit / path traversal attempt targeting "${url}"`,
      blocked: true,
      preBlockWarning: false,
      attemptNumber: 1,
      permanentBlock: false,
    });
  }

  const reqCount = activity.requestTimestamps.length;

  // ── Hard rate-limit → immediate auto-block (Tab 1) ───────────────────────
  if (reqCount > RATE_HARD_LIMIT) {
    blockIp(ip, "Excessive request rate — hard block");
    return recordThreat({
      type: "rate_abuse",
      severity: "high",
      ip,
      country: "Unknown",
      userId,
      method,
      path: url,
      action: `Hard rate-limit exceeded: ${reqCount} requests in ${RATE_WINDOW_MS / 1000}s`,
      reason: `Auto-blocked: ${reqCount} requests in ${RATE_WINDOW_MS / 1000}s window`,
      blocked: true,
      preBlockWarning: false,
      attemptNumber: reqCount,
      permanentBlock: false,
    });
  }

  // ── Soft rate-limit → CAPTCHA challenge, logged in Tab 2 ─────────────────
  if (reqCount > RATE_SOFT_LIMIT) {
    activity.captchaChallengeCount += 1;
    return recordCaptchaChallenge(
      ip,
      method,
      url,
      `${reqCount} requests in ${RATE_WINDOW_MS / 1000}s — please verify you are human`,
    );
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
      country: "Unknown",
      userId,
      method: "POST",
      path: "/api/auth/login",
      action: `${FAILED_LOGIN_LIMIT}+ failed login attempts within ${FAILED_LOGIN_WINDOW_MS / 60_000} minutes`,
      reason: `Auto-blocked: ${FAILED_LOGIN_LIMIT}+ failed login attempts`,
      blocked: true,
      preBlockWarning: false,
      attemptNumber,
      permanentBlock: false,
    });
  }
  return null;
}

export function getThreatSummary() {
  const now = Date.now();
  const activeBlocks = Array.from(blockedIps.entries())
    .filter(([, v]) => v.permanent || v.until > now)
    .map(([ip, v]) => ({ ip, reason: v.reason, expiresAt: v.until, permanent: v.permanent }));

  return {
    totalThreatsBlocked: threatLog.filter((t) => t.blocked).length,
    totalCaptchaChallenges: captchaLog.length,
    activeBlockedIps: activeBlocks.length,
    blockedIpList: activeBlocks,
    recentThreats: threatLog.slice(0, 25),
  };
}

export function getLatestThreat(): ThreatEvent | undefined {
  return threatLog[0];
}

/** Full Threats & Bot Logs (Tab 1) — every auto-blocked event, most recent first. */
export function getActionLog(limit = 200): ThreatEvent[] {
  return threatLog.slice(0, limit);
}

/** User Verification Logs (Tab 2) — every CAPTCHA-challenged user, most recent first. */
export function getCaptchaLog(limit = 200): CaptchaLogEntry[] {
  return captchaLog.slice(0, limit);
}

/** Load recent threat events from DB into memory at startup. */
export async function bootstrapThreatStore(): Promise<void> {
  try {
    const rows = await db
      .select()
      .from(threatEventsTable)
      .orderBy(desc(threatEventsTable.createdAt))
      .limit(MAX_LOG);

    for (const row of rows) {
      threatLog.push({
        id: row.id,
        type: row.type as ThreatType,
        severity: row.severity as ThreatSeverity,
        ip: row.ip,
        country: "Unknown",
        userId: row.userId ?? undefined,
        method: row.method,
        path: row.path,
        action: row.action,
        reason: row.reason,
        blocked: row.blocked,
        preBlockWarning: row.preBlockWarning,
        attemptNumber: row.attemptNumber,
        permanentBlock: false,
        createdAt: row.createdAt,
      });
    }

    logger.info({ count: threatLog.length }, "Threat store bootstrapped from DB");
  } catch (err) {
    logger.error({ err }, "Failed to bootstrap threat store from DB");
  }
}
