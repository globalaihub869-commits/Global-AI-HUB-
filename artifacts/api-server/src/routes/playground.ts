import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getUserById } from "../lib/users.js";
import {
  FREE_EXECUTION_LIMIT,
  getUsage,
  executeSandboxCode,
  createWidgetChecked,
  listWidgets,
  getAdminActivitySummary,
} from "../lib/playground-store.js";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  const user = userId ? getUserById(userId) : undefined;
  if (!user) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "You must be signed in" });
    return;
  }
  res.locals.currentUser = user;
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

router.get("/playground/usage", requireAuth, (req, res) => {
  const userId = req.session.userId!;
  const user = getUserById(userId)!;
  res.json(getUsage(userId, user.plan));
});

router.post("/playground/execute", requireAuth, (req, res) => {
  const { code } = req.body as { code?: string };
  if (typeof code !== "string" || !code.trim()) {
    res.status(400).json({ error: "MISSING_CODE", message: "code is required" });
    return;
  }
  const userId = req.session.userId!;
  const user = getUserById(userId)!;
  const result = executeSandboxCode(userId, user.plan, code);

  if (result.status === "locked") {
    res.status(403).json({
      error: "USAGE_LIMIT_REACHED",
      message: `Free plan is limited to ${FREE_EXECUTION_LIMIT} sandbox executions. Upgrade to Pro for unlimited access.`,
      executionCount: result.executionCount,
      limit: result.limit,
    });
    return;
  }

  res.json(result);
});

router.post("/playground/widgets", requireAuth, (req, res) => {
  const { name, type, description } = req.body as { name?: string; type?: string; description?: string };
  if (!name?.trim() || !type?.trim()) {
    res.status(400).json({ error: "MISSING_FIELDS", message: "name and type are required" });
    return;
  }
  const userId = req.session.userId!;
  const user = getUserById(userId)!;
  const result = createWidgetChecked(userId, user.plan, name.trim(), type.trim(), (description ?? "").trim());

  if (result.status === "locked") {
    res.status(403).json({
      error: "USAGE_LIMIT_REACHED",
      message: `${user.plan === "free" ? "Free" : "Pro"} plan is limited to ${result.limit} No-Code Builder widgets. Upgrade your plan for more.`,
      widgetCount: result.widgetCount,
      limit: result.limit,
    });
    return;
  }

  res.status(201).json({ widget: result.widget });
});

router.get("/playground/widgets", requireAuth, (req, res) => {
  const userId = req.session.userId!;
  res.json({ widgets: listWidgets(userId) });
});

router.get("/playground/admin/activity", requireAuth, requireAdmin, (_req, res) => {
  res.json(getAdminActivitySummary());
});

export default router;
