import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getUserById } from "../lib/users.js";
import { getAnalyticsOverview } from "../lib/analytics-store.js";

const router: IRouter = Router();

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  const user = userId ? await getUserById(userId) : undefined;
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "FORBIDDEN", message: "Admin access required" });
    return;
  }
  next();
}

router.get("/analytics/overview", requireAdmin, (_req, res) => {
  res.json(getAnalyticsOverview());
});

export default router;
