import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getUserById, toPublic } from "../lib/users.js";
import {
  listListings,
  listMarketplaceActivity,
  getVendorDashboardStats,
  purchaseListing,
} from "../lib/marketplace-store.js";

const router: IRouter = Router();

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "You must be signed in" });
    return;
  }
  const user = await getUserById(userId);
  if (!user) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "You must be signed in" });
    return;
  }
  res.locals.currentUser = user;
  next();
}

router.get("/marketplace/listings", (req, res) => {
  const { category, subcategory, search } = req.query as Record<string, string | undefined>;
  const results = listListings({ category, subcategory, search });
  res.json({ listings: results, total: results.length });
});

router.get("/marketplace/activity", (req, res) => {
  const { after } = req.query as Record<string, string | undefined>;
  res.json({ events: listMarketplaceActivity(after) });
});

router.get("/marketplace/vendor-stats", requireAuth, (_req, res) => {
  const user = res.locals.currentUser as { walletBalanceUsd: number };
  res.json({ ...getVendorDashboardStats(), walletBalanceUsd: user.walletBalanceUsd });
});

router.post("/marketplace/listings/:id/purchase", requireAuth, async (req, res) => {
  const user = res.locals.currentUser as { id: string };
  const { id } = req.params as { id: string };
  const result = await purchaseListing(user.id, id);

  if (result.status === "not_found") {
    res.status(404).json({ error: "NOT_FOUND", message: "Listing not found" });
    return;
  }
  if (result.status === "insufficient_balance") {
    res.status(400).json({ error: "INSUFFICIENT_BALANCE", message: "Not enough trial wallet balance", walletBalanceUsd: result.walletBalanceUsd });
    return;
  }

  const refreshedUser = (await getUserById(user.id))!;
  req.log.info({ userId: user.id, listingId: id }, "marketplace listing purchased");
  res.status(200).json({ listing: result.listing, walletBalanceUsd: result.walletBalanceUsd, user: toPublic(refreshedUser) });
});

export default router;
