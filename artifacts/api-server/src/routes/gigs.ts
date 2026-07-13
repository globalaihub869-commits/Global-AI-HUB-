import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getUserById, toPublic } from "../lib/users.js";
import { listGigs, getGig, purchaseGig, addGigReview } from "../lib/gigs-store.js";
import { recordActivity } from "../lib/social-store.js";
import { db } from "@workspace/db";
import { interactionsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";

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

router.get("/gigs", (req, res) => {
  const { category, search } = req.query as Record<string, string | undefined>;
  const results = listGigs({ category, search });
  res.json({ gigs: results, total: results.length });
});

router.get("/gigs/:id", (req, res) => {
  const gig = getGig(req.params.id as string);
  if (!gig) {
    res.status(404).json({ error: "NOT_FOUND", message: "Gig not found" });
    return;
  }
  res.json({ gig });
});

router.post("/gigs/:id/purchase", requireAuth, async (req, res) => {
  const user = res.locals.currentUser as { id: string; name: string };
  const { id } = req.params as { id: string };
  const result = await purchaseGig(user.id, id);

  if (result.status === "not_found") {
    res.status(404).json({ error: "NOT_FOUND", message: "Gig not found" });
    return;
  }
  if (result.status === "insufficient_balance") {
    res.status(400).json({ error: "INSUFFICIENT_BALANCE", message: "Not enough trial wallet balance", walletBalanceUsd: result.walletBalanceUsd });
    return;
  }

  const refreshedUser = (await getUserById(user.id))!;
  req.log.info({ userId: user.id, gigId: id }, "gig purchased");
  res.status(200).json({ gig: result.gig, walletBalanceUsd: result.walletBalanceUsd, user: toPublic(refreshedUser) });
});

router.post("/gigs/:id/review", requireAuth, (req, res) => {
  const user = res.locals.currentUser as { name: string };
  const { id } = req.params as { id: string };
  const { rating, comment } = req.body as { rating?: number; comment?: string };
  if (!rating || rating < 1 || rating > 5 || !comment) {
    res.status(400).json({ error: "MISSING_FIELDS", message: "rating (1-5) and comment are required" });
    return;
  }
  const review = addGigReview(id, user.name, rating, comment);
  if (!review) {
    res.status(404).json({ error: "NOT_FOUND", message: "Gig not found" });
    return;
  }
  res.status(201).json({ review });
});

router.post("/gigs/:id/share", requireAuth, (req, res) => {
  const user = res.locals.currentUser as { id: string; name: string };
  const { id } = req.params as { id: string };
  const gig = getGig(id);
  if (!gig) {
    res.status(404).json({ error: "NOT_FOUND", message: "Gig not found" });
    return;
  }
  recordActivity("like", user.name, `${gig.title} (shared)`);
  req.log.info({ userId: user.id, gigId: id }, "gig shared for hub points");
  res.status(200).json({ pointsAwarded: 5 });
});

router.get("/gigs/activity-log", async (_req: Request, res: Response): Promise<void> => {
  const allGigs = listGigs({});

  type AggRow = { entityId: string; cnt: number };

  const shareRows: AggRow[] = await db
    .select({ entityId: interactionsTable.entityId, cnt: count() })
    .from(interactionsTable)
    .where(and(eq(interactionsTable.entityType, "gig"), eq(interactionsTable.action, "share")))
    .groupBy(interactionsTable.entityId)
    .catch((): AggRow[] => []);

  const likeRows: AggRow[] = await db
    .select({ entityId: interactionsTable.entityId, cnt: count() })
    .from(interactionsTable)
    .where(and(eq(interactionsTable.entityType, "gig"), eq(interactionsTable.action, "like")))
    .groupBy(interactionsTable.entityId)
    .catch((): AggRow[] => []);

  const shareMap = Object.fromEntries(shareRows.map((r) => [r.entityId, Number(r.cnt)]));
  const likeMap = Object.fromEntries(likeRows.map((r) => [r.entityId, Number(r.cnt)]));

  const totalReviews = allGigs.reduce((s, g) => s + g.reviewCount, 0);
  const totalShares = shareRows.reduce((s, r) => s + Number(r.cnt), 0);
  const totalLikes = likeRows.reduce((s, r) => s + Number(r.cnt), 0);

  const log = allGigs.map((g) => ({
    id: g.id,
    title: g.title,
    seller: g.seller,
    category: g.category,
    priceUsd: g.priceUsd,
    rating: g.rating,
    reviewCount: g.reviewCount,
    likes: likeMap[g.id] ?? 0,
    shares: shareMap[g.id] ?? 0,
  }));

  res.json({
    stats: {
      totalGigs: allGigs.length,
      totalReviews,
      totalLikes,
      totalShares,
    },
    log,
  });
});

export default router;
