import { Router, type IRouter, type Request, type Response } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { db, paymentSubmissionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { upgradeUserPlan } from "../lib/users.js";
import { publishLiveEvent } from "../lib/live-events.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

// NOWPayments sends a SHA-512 HMAC signature in the x-nowpayments-sig header.
// We verify against the raw request body sorted by key (their spec requirement).
function verifyIpnSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) {
    logger.warn("NOWPAYMENTS_IPN_SECRET not set — skipping IPN signature verification");
    return false;
  }
  try {
    // NOWPayments spec: sort the parsed payload keys, stringify, then HMAC-SHA-512
    const parsed = JSON.parse(rawBody) as Record<string, unknown>;
    const sortedKeys = Object.keys(parsed).sort();
    const sorted: Record<string, unknown> = {};
    for (const k of sortedKeys) sorted[k] = parsed[k];
    const expected = createHmac("sha512", secret)
      .update(JSON.stringify(sorted))
      .digest("hex");
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// IPN statuses from NOWPayments that mean the payment is complete
const CONFIRMED_STATUSES = new Set([
  "finished",
  "confirmed",
  "partially_paid", // treat partial as complete — adjust if you need strict full-amount checks
]);

router.post("/ipn", async (req: Request, res: Response): Promise<void> => {
  const signature = (req.headers["x-nowpayments-sig"] as string | undefined) ?? "";
  const rawBody = JSON.stringify(req.body); // body-parser has already parsed it

  if (!verifyIpnSignature(rawBody, signature)) {
    logger.warn({ signature }, "IPN signature verification failed");
    res.status(401).json({ error: "INVALID_SIGNATURE" });
    return;
  }

  const payload = req.body as {
    payment_id?: string | number;
    payment_status?: string;
    order_id?: string;       // we set this to our paymentSubmissionsTable.id
    price_amount?: number;
    price_currency?: string;
    actually_paid?: number;
    pay_currency?: string;
    outcome_amount?: number;
  };

  req.log.info({ payment_id: payload.payment_id, status: payload.payment_status }, "NOWPayments IPN received");

  if (!payload.payment_status || !payload.order_id) {
    res.status(400).json({ error: "MISSING_FIELDS" });
    return;
  }

  if (!CONFIRMED_STATUSES.has(payload.payment_status)) {
    // Not yet final — acknowledge receipt and wait for next callback
    res.json({ received: true, action: "waiting" });
    return;
  }

  // Look up the matching order (order_id = our internal payment submission id)
  const rows = await db
    .select()
    .from(paymentSubmissionsTable)
    .where(eq(paymentSubmissionsTable.id, payload.order_id));

  const submission = rows[0];
  if (!submission) {
    logger.error({ order_id: payload.order_id }, "IPN order_id not found in DB");
    res.status(404).json({ error: "ORDER_NOT_FOUND" });
    return;
  }

  if (submission.status === "approved") {
    // Already processed — idempotent acknowledgement
    res.json({ received: true, action: "already_processed" });
    return;
  }

  // Upgrade user plan in DB
  await db
    .update(paymentSubmissionsTable)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(eq(paymentSubmissionsTable.id, submission.id));

  const upgraded = await upgradeUserPlan(submission.userId, submission.plan as "pro" | "enterprise");
  if (!upgraded) {
    logger.error({ userId: submission.userId }, "IPN: upgradeUserPlan returned null");
    res.status(500).json({ error: "UPGRADE_FAILED" });
    return;
  }

  publishLiveEvent({
    type: "purchase",
    title: "Payment Auto-Confirmed",
    message: `${submission.userEmail} → ${submission.plan} plan via NOWPayments IPN ($${submission.amountUsdt})`,
  });

  req.log.info({ userId: submission.userId, plan: submission.plan }, "IPN: plan upgraded automatically");
  res.json({ received: true, action: "upgraded" });
});

export default router;
