import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getUserById } from "../lib/users.js";
import { getThreatSummary } from "../lib/threat-store.js";
import { getExecutiveSummary } from "../lib/conversions-store.js";

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

export default router;
