import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getUserById } from "../lib/users.js";
import { getThreatSummary, getActionLog, unblockIp } from "../lib/threat-store.js";
import { getExecutiveSummary } from "../lib/conversions-store.js";
import { subscribeLiveEvents } from "../lib/live-events.js";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "You must be signed in" });
    return;
  }
  const user = getUserById(userId);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "FORBIDDEN", message: "Admin access required" });
    return;
  }
  next();
}

router.get("/security/threats", requireAdmin, (_req, res) => {
  res.json(getThreatSummary());
});

router.get("/security/executive-summary", requireAdmin, (_req, res) => {
  res.json(getExecutiveSummary());
});

// Full "Hacker Action Log" — every unauthorized action, bad request, and
// exploit attempt with full detail (timestamp, IP, action), including
// pre-block warnings that preceded a hard block.
router.get("/security/action-log", requireAdmin, (_req, res) => {
  res.json({ actions: getActionLog(200) });
});

// "1-Click IP Unblock" override for ultimate owner control.
router.post("/security/unblock-ip", requireAdmin, (req, res) => {
  const { ip } = req.body as { ip?: string };
  if (!ip || !ip.trim()) {
    res.status(400).json({ error: "MISSING_IP", message: "ip is required" });
    return;
  }
  const wasBlocked = unblockIp(ip.trim());
  res.json({ ip: ip.trim(), wasBlocked });
});

// Live Audio/Visual Push Notifications feed via Server-Sent Events —
// streams "threat_blocked", "purchase", and "ip_unblocked" events to the
// Super Admin Dashboard in real time.
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
