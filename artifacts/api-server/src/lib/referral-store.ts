import { randomBytes } from "crypto";
import type { PlanTier } from "./users.js";
import { getTierLimits, isAtLimit } from "./plan-limits.js";

/**
 * "Smart Growth" (SG) Viral Referral Engine.
 *
 * Every user gets a stable referral code. When a new user signs up with
 * someone's code, the referrer is credited SG reward points — capped per
 * rolling 30-day window based on their Subscription Tier Lock limits, so
 * higher tiers unlock more viral growth potential.
 */

const REWARD_POINTS_PER_INVITE = 25;
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

interface RewardEvent {
  invitedUserId: string;
  invitedEmail: string;
  points: number;
  createdAt: number;
}

interface ReferralRecord {
  code: string;
  ownerUserId: string;
  rewardEvents: RewardEvent[];
}

const recordsByOwner = new Map<string, ReferralRecord>();
const codeToOwner = new Map<string, string>();

function generateCode(): string {
  let code: string;
  do {
    code = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  } while (codeToOwner.has(code));
  return code;
}

export function getReferralOwnerId(code: string): string | undefined {
  return codeToOwner.get(code.trim().toUpperCase());
}

export function getOrCreateReferralCode(userId: string): string {
  let record = recordsByOwner.get(userId);
  if (!record) {
    const code = generateCode();
    record = { code, ownerUserId: userId, rewardEvents: [] };
    recordsByOwner.set(userId, record);
    codeToOwner.set(code, userId);
  }
  return record.code;
}

function pointsEarnedInWindow(record: ReferralRecord): number {
  const cutoff = Date.now() - WINDOW_MS;
  return record.rewardEvents.filter((e) => e.createdAt >= cutoff).reduce((sum, e) => sum + e.points, 0);
}

export type RedeemResult =
  | { status: "ok"; ownerUserId: string; pointsAwarded: number }
  | { status: "invalid_code" }
  | { status: "self_referral" }
  | { status: "capped"; ownerUserId: string };

/**
 * Redeems a referral code at signup time. Strictly enforces the SG monthly
 * reward cap defined by the referrer's current Subscription Tier Lock — once
 * a referrer hits their cap, further invites still register but earn 0
 * points until the rolling window frees up capacity.
 */
export function redeemReferral(
  code: string,
  invitedUserId: string,
  invitedEmail: string,
  ownerPlan: PlanTier,
): RedeemResult {
  const ownerUserId = codeToOwner.get(code.trim().toUpperCase());
  if (!ownerUserId) return { status: "invalid_code" };
  if (ownerUserId === invitedUserId) return { status: "self_referral" };

  const record = recordsByOwner.get(ownerUserId);
  if (!record) return { status: "invalid_code" };

  const limits = getTierLimits(ownerPlan);
  const earnedSoFar = pointsEarnedInWindow(record);

  if (isAtLimit(earnedSoFar, limits.referralRewardsPerMonth)) {
    record.rewardEvents.unshift({ invitedUserId, invitedEmail, points: 0, createdAt: Date.now() });
    return { status: "capped", ownerUserId };
  }

  let points = REWARD_POINTS_PER_INVITE;
  if (limits.referralRewardsPerMonth !== null) {
    const remaining = limits.referralRewardsPerMonth - earnedSoFar;
    points = Math.min(points, remaining);
  }

  record.rewardEvents.unshift({ invitedUserId, invitedEmail, points, createdAt: Date.now() });
  return { status: "ok", ownerUserId, pointsAwarded: points };
}

export function getReferralStats(userId: string, plan: PlanTier) {
  const code = getOrCreateReferralCode(userId);
  const record = recordsByOwner.get(userId)!;
  const limits = getTierLimits(plan);
  const pointsThisWindow = pointsEarnedInWindow(record);
  const totalPointsEarned = record.rewardEvents.reduce((sum, e) => sum + e.points, 0);

  return {
    code,
    totalInvites: record.rewardEvents.length,
    totalPointsEarned,
    pointsThisWindow,
    monthlyCap: limits.referralRewardsPerMonth,
    capped: isAtLimit(pointsThisWindow, limits.referralRewardsPerMonth),
    recentInvites: record.rewardEvents.slice(0, 10),
  };
}

export function getAdminReferralSummary() {
  let totalInvites = 0;
  let totalPointsAwarded = 0;
  const topReferrers: { userId: string; code: string; invites: number; points: number }[] = [];

  for (const record of recordsByOwner.values()) {
    totalInvites += record.rewardEvents.length;
    const points = record.rewardEvents.reduce((sum, e) => sum + e.points, 0);
    totalPointsAwarded += points;
    if (record.rewardEvents.length > 0) {
      topReferrers.push({ userId: record.ownerUserId, code: record.code, invites: record.rewardEvents.length, points });
    }
  }

  topReferrers.sort((a, b) => b.points - a.points);

  return {
    totalReferralCodes: recordsByOwner.size,
    totalInvites,
    totalPointsAwarded,
    topReferrers: topReferrers.slice(0, 10),
  };
}
