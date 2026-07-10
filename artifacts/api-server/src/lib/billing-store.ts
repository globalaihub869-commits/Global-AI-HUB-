import { randomUUID, randomBytes } from "crypto";
import type { PlanTier } from "./users.js";

export type Network = "TRC20" | "ERC20";

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  priceUsd: number;
  priceUsdt: number;
  tagline: string;
  features: string[];
}

export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    priceUsd: 0,
    priceUsdt: 0,
    tagline: "Explore the hub with essential tools",
    features: [
      "Browse AI tool directory",
      "Read daily AI news",
      "Basic Hub Points rewards",
      "Community chat access",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceUsd: 19,
    priceUsdt: 19,
    tagline: "For power users who live in the AI ecosystem",
    features: [
      "Everything in Free",
      "Advanced filters & personalized feed",
      "Early access to new tools",
      "Gold Pro Member badge & profile glow",
      "2x AI Hub Token earning rate",
      "Priority job board placement",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceUsd: 99,
    priceUsdt: 99,
    tagline: "For teams and organizations scaling with AI",
    features: [
      "Everything in Pro",
      "Team seats & shared dashboards",
      "Dedicated account support",
      "Custom AI tool integrations",
      "Verified Enterprise badge",
      "API rate-limit boost",
    ],
  },
];

interface CheckoutSession {
  id: string;
  userId: string;
  plan: PlanTier;
  network: Network;
  walletAddress: string;
  amountUsdt: number;
  status: "pending" | "confirmed" | "expired";
  createdAt: number;
  expiresAt: number;
  txId?: string;
}

const sessions = new Map<string, CheckoutSession>();

const SESSION_TTL_MS = 15 * 60 * 1000;

function generateWalletAddress(network: Network): string {
  const bytes = randomBytes(20).toString("hex");
  return network === "TRC20" ? `T${bytes.slice(0, 33).toUpperCase()}` : `0x${bytes}`;
}

export function getPlan(id: PlanTier): PlanDefinition | undefined {
  return PLANS.find((p) => p.id === id);
}

export function createCheckoutSession(
  userId: string,
  plan: PlanTier,
  network: Network,
): CheckoutSession {
  const def = getPlan(plan);
  if (!def) throw new Error("INVALID_PLAN");
  const now = Date.now();
  const session: CheckoutSession = {
    id: randomUUID(),
    userId,
    plan,
    network,
    walletAddress: generateWalletAddress(network),
    amountUsdt: def.priceUsdt,
    status: "pending",
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  sessions.set(session.id, session);
  return session;
}

export function getCheckoutSession(id: string): CheckoutSession | undefined {
  return sessions.get(id);
}

export type VerifyResult =
  | { status: "confirmed"; session: CheckoutSession }
  | { status: "expired" }
  | { status: "not_found" }
  | { status: "invalid_txid" }
  | { status: "forbidden" };

export function verifyCheckoutSession(
  id: string,
  userId: string,
  txId: string,
): VerifyResult {
  const session = sessions.get(id);
  if (!session) return { status: "not_found" };
  if (session.userId !== userId) return { status: "forbidden" };
  if (Date.now() > session.expiresAt) {
    session.status = "expired";
    return { status: "expired" };
  }
  // Simulated TxID validation: must look like a plausible on-chain hash (hex, 16+ chars).
  const trimmed = txId.trim();
  if (!/^[a-fA-F0-9]{16,}$/.test(trimmed)) {
    return { status: "invalid_txid" };
  }
  session.status = "confirmed";
  session.txId = trimmed;
  return { status: "confirmed", session };
}
