import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { randomUUID } from "crypto";
import { db, paymentSubmissionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getUserById, upgradeUserPlan, toPublic } from "../lib/users.js";
import { PLANS, getPlan } from "../lib/billing-store.js";
import { publishLiveEvent } from "../lib/live-events.js";
import { createInvoice } from "../lib/nowpayments.js";

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

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }
  const user = await getUserById(userId);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "FORBIDDEN", message: "Admin access required" });
    return;
  }
  res.locals.currentUser = user;
  next();
}

router.get("/billing/plans", (_req, res) => {
  res.json({ plans: PLANS });
});

// ── NOWPayments: create a hosted invoice ─────────────────────────────────────
router.post("/billing/nowpayments/create-invoice", requireAuth, async (req, res) => {
  const user = res.locals.currentUser;
  const { plan } = req.body as { plan?: string };

  if (!plan || !getPlan(plan as never) || plan === "free") {
    res.status(400).json({ error: "INVALID_PLAN", message: "plan must be pro or enterprise" });
    return;
  }

  const planData = getPlan(plan as never)!;
  const submissionId = randomUUID();

  // Create a pending submission row so the IPN handler can look it up by order_id
  await db.insert(paymentSubmissionsTable).values({
    id: submissionId,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    plan,
    amountUsdt: planData.priceUsdt,
    txId: submissionId,   // placeholder; real txId comes via IPN
    status: "pending",
  });

  const productionDomain = "https://globalaihubco.com";
  const invoice = await createInvoice({
    price_amount: planData.priceUsd,
    price_currency: "usd",
    order_id: submissionId,
    order_description: `Global AI Hub — ${planData.name} Plan`,
    ipn_callback_url: `${productionDomain}/api/ipn`,
    success_url: `${productionDomain}/dashboard?payment=success`,
    cancel_url: `${productionDomain}/pricing?payment=cancelled`,
    is_fixed_rate: false,
    is_fee_paid_by_user: false,
  });

  publishLiveEvent({
    type: "purchase",
    title: "New Payment Initiated",
    message: `${user.email} opened NOWPayments checkout for ${plan} plan ($${planData.priceUsd})`,
  });

  res.status(201).json({ invoiceUrl: invoice.invoice_url, orderId: submissionId });
});

router.post("/billing/submit-txid", requireAuth, async (req, res) => {
  const user = res.locals.currentUser;
  const { plan, txId } = req.body as { plan?: string; txId?: string };

  if (!plan || !getPlan(plan as never) || plan === "free") {
    res.status(400).json({ error: "INVALID_PLAN", message: "plan must be pro or enterprise" });
    return;
  }
  if (!txId || !txId.trim()) {
    res.status(400).json({ error: "MISSING_TXID", message: "txId is required" });
    return;
  }

  const planData = getPlan(plan as never)!;
  const id = randomUUID();

  try {
    await db.insert(paymentSubmissionsTable).values({
      id,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      plan,
      amountUsdt: planData.priceUsdt,
      txId: txId.trim(),
      status: "pending",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      res.status(409).json({ error: "DUPLICATE_TXID", message: "This transaction ID has already been submitted." });
      return;
    }
    throw err;
  }

  publishLiveEvent({
    type: "purchase",
    title: "New Payment Pending",
    message: `${user.email} submitted TxID for ${plan} plan — awaiting approval`,
  });

  res.status(201).json({ message: "Submission received. Your plan will be activated once payment is verified." });
});

router.get("/billing/pending-payments", requireAdmin, async (_req, res) => {
  const submissions = await db
    .select()
    .from(paymentSubmissionsTable)
    .orderBy(desc(paymentSubmissionsTable.submittedAt));
  res.json({ submissions });
});

router.post("/billing/approve-payment/:id", requireAdmin, async (req, res) => {
  const { id } = req.params as { id: string };

  const rows = await db.select().from(paymentSubmissionsTable).where(eq(paymentSubmissionsTable.id, id));
  const submission = rows[0];
  if (!submission) {
    res.status(404).json({ error: "NOT_FOUND", message: "Payment submission not found" });
    return;
  }
  if (submission.status !== "pending") {
    res.status(409).json({ error: "ALREADY_PROCESSED", message: `Payment is already ${submission.status}` });
    return;
  }

  await db
    .update(paymentSubmissionsTable)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(eq(paymentSubmissionsTable.id, id));

  const user = await upgradeUserPlan(submission.userId, submission.plan as "pro" | "enterprise");
  if (!user) {
    res.status(404).json({ error: "USER_NOT_FOUND" });
    return;
  }

  publishLiveEvent({
    type: "purchase",
    title: "Payment Approved",
    message: `${submission.userEmail} activated ${submission.plan} plan ($${submission.amountUsdt} USDT)`,
  });

  res.json({ submission: { ...submission, status: "approved" }, user: toPublic(user) });
});

router.post("/billing/reject-payment/:id", requireAdmin, async (req, res) => {
  const { id } = req.params as { id: string };

  const rows = await db.select().from(paymentSubmissionsTable).where(eq(paymentSubmissionsTable.id, id));
  const submission = rows[0];
  if (!submission) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }
  if (submission.status !== "pending") {
    res.status(409).json({ error: "ALREADY_PROCESSED", message: `Payment is already ${submission.status}` });
    return;
  }

  await db
    .update(paymentSubmissionsTable)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(eq(paymentSubmissionsTable.id, id));

  res.json({ submission: { ...submission, status: "rejected" } });
});

export default router;
