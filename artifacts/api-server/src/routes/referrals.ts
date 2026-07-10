import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getUserById } from "../lib/users.js";
import { getReferralStats, getAdminReferralSummary } from "../lib/referral-store.js";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  const user = userId ? getUserById(userId) : undefined;
  if (!user) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "You must be signed in" });
    return;
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  const user = userId ? getUserById(userId) : undefined;
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "FORBIDDEN", message: "Admin access required" });
    return;
  }
  next();
}

router.get("/referrals/me", requireAuth, (req, res) => {
  const userId = req.session.userId!;
  const user = getUserById(userId)!;
  res.json(getReferralStats(userId, user.plan));
});

router.get("/referrals/admin-summary", requireAuth, requireAdmin, (_req, res) => {
  res.json(getAdminReferralSummary());
});

export default router;
