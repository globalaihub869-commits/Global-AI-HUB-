import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getUserById, toPublic } from "../lib/users.js";
import { listGigs, getGig, purchaseGig, addGigReview } from "../lib/gigs-store.js";
import { recordActivity } from "../lib/social-store.js";

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

export default router;
