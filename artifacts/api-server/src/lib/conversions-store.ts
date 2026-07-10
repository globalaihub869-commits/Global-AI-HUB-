import { randomUUID } from "crypto";
import type { PlanTier } from "./users.js";

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

export function recordConversion(input: {
  userId: string;
  userEmail: string;
  plan: PlanTier;
  amountUsdt: number;
}): ConversionEvent {
  const event: ConversionEvent = { ...input, id: randomUUID(), createdAt: Date.now() };
  conversions.unshift(event);
  if (conversions.length > MAX_LOG) conversions.length = MAX_LOG;
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
