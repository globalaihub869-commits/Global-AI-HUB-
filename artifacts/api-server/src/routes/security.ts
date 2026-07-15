import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getUserById } from "../lib/users.js";
import {
  getThreatSummary,
  getActionLog,
  getCaptchaLog,
  unblockIp,
  permanentBlockIp,
  whitelistCaptchaIp,
} from "../lib/threat-store.js";
import { getExecutiveSummary } from "../lib/conversions-store.js";
import { subscribeLiveEvents } from "../lib/live-events.js";
import { getRequestsPerMin, getErrorRate, getTrafficHistory } from "../lib/request-stats.js";
import { db, usersTable, interactionsTable } from "@workspace/db";
import { count } from "drizzle-orm";

const router: IRouter = Router();

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "You must be signed in" });
    return;
  }
  const user = await getUserById(userId);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "FORBIDDEN", message: "Admin access required" });
    return;
  }
  next();
}

// ── Tab 1 data: Threats & Bot Logs ───────────────────────────────────────────

router.get("/security/threats", requireAdmin, (_req, res) => {
  res.json(getThreatSummary());
});

router.get("/security/action-log", requireAdmin, (_req, res) => {
  res.json({ actions: getActionLog(200) });
});

/** Permanently block an IP (no expiry) — Tab 1 "Permanently Block" button. */
router.post("/security/permanent-block", requireAdmin, (req, res) => {
  const { ip } = req.body as { ip?: string };
  if (!ip || !ip.trim()) {
    res.status(400).json({ error: "MISSING_IP", message: "ip is required" });
    return;
  }
  permanentBlockIp(ip.trim());
  res.json({ ip: ip.trim(), permanentlyBlocked: true });
});

/** Unblock an IP (temporary lift) — existing 1-Click Unblock. */
router.post("/security/unblock-ip", requireAdmin, (req, res) => {
  const { ip } = req.body as { ip?: string };
  if (!ip || !ip.trim()) {
    res.status(400).json({ error: "MISSING_IP", message: "ip is required" });
    return;
  }
  const wasBlocked = unblockIp(ip.trim());
  res.json({ ip: ip.trim(), wasBlocked });
});

// ── Tab 2 data: User Verification Logs ───────────────────────────────────────

/** Returns all CAPTCHA-challenged users for Tab 2. */
router.get("/security/captcha-log", requireAdmin, (_req, res) => {
  res.json({ entries: getCaptchaLog(200) });
});

/** Whitelist an IP from Tab 2 — marks as trusted, never challenged again. */
router.post("/security/whitelist-ip", requireAdmin, (req, res) => {
  const { ip } = req.body as { ip?: string };
  if (!ip || !ip.trim()) {
    res.status(400).json({ error: "MISSING_IP", message: "ip is required" });
    return;
  }
  whitelistCaptchaIp(ip.trim());
  res.json({ ip: ip.trim(), whitelisted: true });
});

// ── Shared endpoints ──────────────────────────────────────────────────────────

router.get("/security/executive-summary", requireAdmin, (_req, res) => {
  res.json(getExecutiveSummary());
});

router.get("/admin/realtime-stats", requireAdmin, async (_req, res): Promise<void> => {
  const [usersRow] = await db.select({ total: count() }).from(usersTable);
  const [interactionsRow] = await db.select({ total: count() }).from(interactionsTable);
  const actionLog = getActionLog(8);
  res.json({
    totalUsers: usersRow?.total ?? 0,
    totalInteractions: interactionsRow?.total ?? 0,
    requestsPerMin: getRequestsPerMin(),
    errorRate: getErrorRate(),
    trafficHistory: getTrafficHistory(),
    recentEvents: actionLog.map((e) => ({
      id: e.id,
      text: `${e.severity.toUpperCase()}: ${e.method} ${e.path} from ${e.ip}`,
    })),
  });
});

router.get("/security/live-stream", requireAdmin, (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  res.write(": connected\n\n");

  const unsubscribe = subscribeLiveEvents((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
  }, 20_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});

export default router;
