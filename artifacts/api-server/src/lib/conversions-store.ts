import { randomUUID } from "crypto";
import type { PlanTier } from "./users.js";
import { logger } from "./logger.js";
import { db, conversionsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

export interface ConversionEvent {
  id: string;
  userId: string;
  userEmail: string;
  plan: PlanTier;
  amountUsdt: number;
  createdAt: number;
}

const HIGH_VALUE_THRESHOLD_USDT = 50;

const conversions: ConversionEvent[] = [];
const MAX_LOG = 200;

function persistConversion(event: ConversionEvent): void {
  db.insert(conversionsTable)
    .values({
      id: event.id,
      userId: event.userId,
      userEmail: event.userEmail,
      plan: event.plan,
      amountUsdt: event.amountUsdt,
      createdAt: event.createdAt,
    })
    .onConflictDoNothing()
    .catch((err) => logger.error({ err }, "Failed to persist conversion event"));
}

/** Load existing conversion events from DB into memory. Called once at startup. */
export async function bootstrapConversionsStore(): Promise<void> {
  try {
    const rows = await db
      .select()
      .from(conversionsTable)
      .orderBy(desc(conversionsTable.createdAt))
      .limit(MAX_LOG);

    for (const row of rows) {
      conversions.push({
        id: row.id,
        userId: row.userId,
        userEmail: row.userEmail,
        plan: row.plan as PlanTier,
        amountUsdt: row.amountUsdt,
        createdAt: row.createdAt,
      });
    }

    logger.info({ count: conversions.length }, "Conversions store bootstrapped from DB");
  } catch (err) {
    logger.error({ err }, "Failed to bootstrap conversions store from DB");
  }
}

export function recordConversion(input: {
  userId: string;
  userEmail: string;
  plan: PlanTier;
  amountUsdt: number;
}): ConversionEvent {
  const event: ConversionEvent = { ...input, id: randomUUID(), createdAt: Date.now() };
  conversions.unshift(event);
  if (conversions.length > MAX_LOG) conversions.length = MAX_LOG;
  persistConversion(event);
  return event;
}

export function getExecutiveSummaryRaw() {
  return { conversions };
}

export function getExecutiveSummary() {
  const highValue = conversions.filter((c) => c.amountUsdt >= HIGH_VALUE_THRESHOLD_USDT);
  const totalRevenueUsdt = conversions.reduce((sum, c) => sum + c.amountUsdt, 0);
  const enterpriseCount = conversions.filter((c) => c.plan === "enterprise").length;
  const proCount = conversions.filter((c) => c.plan === "pro").length;

  return {
    totalConversions: conversions.length,
    highValueConversions: highValue.length,
    totalRevenueUsdt,
    enterpriseCount,
    proCount,
    recentConversions: conversions.slice(0, 10),
  };
}
