import type { PlanTier } from "./users.js";

/**
 * Central Subscription Tier Lock configuration.
 *
 * Every feature that should be gated by plan tier reads its limit from here,
 * so enforcement stays consistent across the API surface. `null` means
 * unlimited for that tier.
 */
export interface TierLimits {
  /** Max AI Sandbox code executions (lifetime, resets are not implemented). */
  sandboxExecutions: number | null;
  /** Max No-Code Builder widgets a user may create. */
  noCodeWidgets: number | null;
  /** Max SG referral-reward credits a user may earn per rolling 30-day window. */
  referralRewardsPerMonth: number | null;
}

export const PLAN_LIMITS: Record<PlanTier, TierLimits> = {
  free: {
    sandboxExecutions: 5,
    noCodeWidgets: 3,
    referralRewardsPerMonth: 3,
  },
  pro: {
    sandboxExecutions: null,
    noCodeWidgets: 20,
    referralRewardsPerMonth: 15,
  },
  enterprise: {
    sandboxExecutions: null,
    noCodeWidgets: null,
    referralRewardsPerMonth: null,
  },
};

export function getTierLimits(plan: PlanTier): TierLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

/** True when `count` has reached or exceeded `limit` (null = unlimited, never locked). */
export function isAtLimit(count: number, limit: number | null): boolean {
  return limit !== null && count >= limit;
}
