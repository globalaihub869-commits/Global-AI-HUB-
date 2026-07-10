import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getUserById, upgradeUserPlan, toPublic } from "../lib/users.js";
import {
  PLANS,
  getPlan,
  createCheckoutSession,
  getCheckoutSession,
  verifyCheckoutSession,
  type Network,
} from "../lib/billing-store.js";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "You must be signed in" });
    return;
  }
  const user = getUserById(userId);
  if (!user) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "You must be signed in" });
    return;
  }
  res.locals.currentUser = user;
  next();
}

router.get("/billing/plans", (_req, res) => {
  res.json({ plans: PLANS });
});

router.post("/billing/checkout", requireAuth, (req, res) => {
  const { plan, network } = req.body as { plan?: string; network?: Network };
  if (!plan || !getPlan(plan as never) || plan === "free") {
    res.status(400).json({ error: "INVALID_PLAN", message: "plan must be pro or enterprise" });
    return;
  }
  if (!network || !["TRC20", "ERC20"].includes(network)) {
    res.status(400).json({ error: "INVALID_NETWORK", message: "network must be TRC20 or ERC20" });
    return;
  }
  const userId = req.session.userId!;
  const session = createCheckoutSession(userId, plan as never, network);
  res.status(201).json({ session });
});

router.get("/billing/checkout/:id", requireAuth, (req, res) => {
  const id = req.params["id"] as string;
  const session = getCheckoutSession(id);
  if (!session || session.userId !== req.session.userId) {
    res.status(404).json({ error: "SESSION_NOT_FOUND" });
    return;
  }
  res.json({ session });
});

router.post("/billing/verify", requireAuth, (req, res) => {
  const { sessionId, txId } = req.body as { sessionId?: string; txId?: string };
  if (!sessionId || !txId) {
    res.status(400).json({ error: "MISSING_FIELDS", message: "sessionId and txId are required" });
    return;
  }
  const userId = req.session.userId!;
  const result = verifyCheckoutSession(sessionId, userId, txId);

  switch (result.status) {
    case "not_found":
      res.status(404).json({ error: "SESSION_NOT_FOUND" });
      return;
    case "forbidden":
      res.status(403).json({ error: "FORBIDDEN" });
      return;
    case "expired":
      res.status(410).json({ error: "SESSION_EXPIRED", message: "This payment window has expired. Start a new checkout." });
      return;
    case "invalid_txid":
      res.status(400).json({ error: "INVALID_TXID", message: "That transaction hash could not be verified on-chain" });
      return;
    case "confirmed": {
      const user = upgradeUserPlan(userId, result.session.plan);
      if (!user) {
        res.status(404).json({ error: "USER_NOT_FOUND" });
        return;
      }
      res.json({ session: result.session, user: toPublic(user) });
      return;
    }
  }
});

export default router;
