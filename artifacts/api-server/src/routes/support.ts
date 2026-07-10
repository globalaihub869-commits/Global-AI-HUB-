import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getUserById } from "../lib/users.js";
import {
  createTicket, listAllTickets, listUserTickets, updateTicket,
  createReview, getFeaturedReviews, getSupportStats, checkSpam,
} from "../lib/support-store.js";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: "UNAUTHENTICATED", message: "Sign in required" }); return; }
  const user = getUserById(userId);
  if (!user) { res.status(401).json({ error: "UNAUTHENTICATED", message: "Sign in required" }); return; }
  res.locals.currentUser = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: "UNAUTHENTICATED", message: "Sign in required" }); return; }
  const user = getUserById(userId);
  if (!user || user.role !== "admin") { res.status(403).json({ error: "FORBIDDEN", message: "Admin access required" }); return; }
  res.locals.currentUser = user;
  next();
}

/** POST /support/tickets — Create a ticket (authenticated, anti-spam protected). */
router.post("/support/tickets", requireAuth, (req, res) => {
  const ip = req.ip ?? "unknown";
  if (checkSpam(ip)) {
    res.status(429).json({ error: "RATE_LIMITED", message: "Too many tickets. Please wait a few minutes before submitting again." });
    return;
  }
  const { issue } = req.body as { issue?: string };
  if (!issue || !issue.trim()) {
    res.status(400).json({ error: "MISSING_ISSUE", message: "Issue description is required" });
    return;
  }
  const user = res.locals.currentUser as { id: string; email: string; name: string; plan: string };
  const ticket = createTicket({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    issue: issue.trim(),
    isVip: user.plan === "enterprise",
  });
  req.log.info({ userId: user.id, ticketId: ticket.id, isVip: ticket.isVip }, "support ticket created");
  res.status(201).json({ ticket });
});

/** GET /support/tickets/mine — My tickets (authenticated). */
router.get("/support/tickets/mine", requireAuth, (req, res) => {
  const user = res.locals.currentUser as { id: string };
  res.json({ tickets: listUserTickets(user.id) });
});

/** GET /support/tickets — All tickets (admin). */
router.get("/support/tickets", requireAdmin, (_req, res) => {
  res.json({ tickets: listAllTickets(200), stats: getSupportStats() });
});

/** PATCH /support/tickets/:id — Update status / add quick reply (admin). */
router.patch("/support/tickets/:id", requireAdmin, (req, res) => {
  const { id } = req.params as { id: string };
  const { status, adminReply } = req.body as { status?: string; adminReply?: string };
  const allowed = ["Open", "Pending", "Resolved", "Archived"];
  if (status && !allowed.includes(status)) {
    res.status(400).json({ error: "INVALID_STATUS", message: `status must be one of ${allowed.join(", ")}` });
    return;
  }
  const ticket = updateTicket(id, {
    status: status as Parameters<typeof updateTicket>[1]["status"],
    adminReply,
  });
  if (!ticket) { res.status(404).json({ error: "NOT_FOUND", message: "Ticket not found" }); return; }
  req.log.info({ ticketId: id, status, hasReply: !!adminReply }, "ticket updated by admin");
  res.json({ ticket });
});

/** POST /support/reviews — Submit a review (authenticated, 1-5 stars). */
router.post("/support/reviews", requireAuth, (req, res) => {
  const { rating, comment } = req.body as { rating?: number; comment?: string };
  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    res.status(400).json({ error: "INVALID_RATING", message: "rating must be an integer 1–5" });
    return;
  }
  if (!comment || !comment.trim()) {
    res.status(400).json({ error: "MISSING_COMMENT", message: "comment is required" });
    return;
  }
  const user = res.locals.currentUser as { id: string; name: string };
  const review = createReview({ userId: user.id, userName: user.name, rating, comment: comment.trim().slice(0, 400) });
  req.log.info({ userId: user.id, rating }, "review submitted");
  res.status(201).json({ review });
});

/** GET /support/reviews/featured — Featured 4-5 star reviews (public, for testimonials). */
router.get("/support/reviews/featured", (_req, res) => {
  res.json({ reviews: getFeaturedReviews(4, 9) });
});

export default router;
