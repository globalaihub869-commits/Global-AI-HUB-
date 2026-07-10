import { randomUUID } from "crypto";
import { debitWallet, getUserById } from "./users.js";

export type GigCategory = "ChatGPT Prompts" | "Midjourney/Sora" | "Business" | "Coding";

export interface GigReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Gig {
  id: string;
  title: string;
  seller: string;
  category: GigCategory;
  priceUsd: number;
  deliveryDays: number;
  rating: number;
  reviewCount: number;
  description: string;
  accentColor: string;
  reviews: GigReview[];
}

const ACCENTS = [
  "rgba(168,85,247,0.6)",
  "rgba(34,211,238,0.6)",
  "rgba(236,72,153,0.6)",
  "rgba(34,197,94,0.6)",
];

function avgRating(reviews: GigReview[]): number {
  if (reviews.length === 0) return 5;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}

const gigsSeed: Omit<Gig, "rating" | "reviewCount">[] = [
  {
    id: "gig-chatgpt-viral-hooks",
    title: "I will write 50 viral ChatGPT hook prompts for your niche",
    seller: "Lena K.",
    category: "ChatGPT Prompts",
    priceUsd: 18,
    deliveryDays: 1,
    description: "Custom-tailored hook and CTA prompt packs to boost engagement on any platform.",
    accentColor: ACCENTS[0]!,
    reviews: [
      { id: randomUUID(), author: "Marcus T.", rating: 5, comment: "Delivered in hours, insane quality.", createdAt: "2026-07-01T10:00:00.000Z" },
      { id: randomUUID(), author: "Devon R.", rating: 5, comment: "Boosted my engagement by 40%.", createdAt: "2026-07-03T10:00:00.000Z" },
      { id: randomUUID(), author: "Sofia N.", rating: 4, comment: "Great value, a couple prompts needed tweaks.", createdAt: "2026-07-05T10:00:00.000Z" },
    ],
  },
  {
    id: "gig-midjourney-brand-kit",
    title: "I will design a Midjourney brand visual prompt kit",
    seller: "Formless Studio",
    category: "Midjourney/Sora",
    priceUsd: 45,
    deliveryDays: 3,
    description: "A consistent, on-brand set of Midjourney prompts for logos, mockups, and social art.",
    accentColor: ACCENTS[1]!,
    reviews: [
      { id: randomUUID(), author: "Priya S.", rating: 5, comment: "Exactly the aesthetic I wanted.", createdAt: "2026-06-28T10:00:00.000Z" },
      { id: randomUUID(), author: "Aisha M.", rating: 5, comment: "Super consistent style across renders.", createdAt: "2026-07-02T10:00:00.000Z" },
    ],
  },
  {
    id: "gig-sora-cinematic-scripts",
    title: "I will craft cinematic Sora video generation scripts",
    seller: "Verbatim Labs",
    category: "Midjourney/Sora",
    priceUsd: 35,
    deliveryDays: 2,
    description: "Shot-by-shot Sora prompt scripts for ads, trailers, and short films.",
    accentColor: ACCENTS[1]!,
    reviews: [
      { id: randomUUID(), author: "Tomás G.", rating: 4, comment: "Cinematic quality, minor revisions needed.", createdAt: "2026-06-30T10:00:00.000Z" },
      { id: randomUUID(), author: "Wei L.", rating: 5, comment: "Client loved the trailer output.", createdAt: "2026-07-04T10:00:00.000Z" },
    ],
  },
  {
    id: "gig-business-pitch-deck-prompts",
    title: "I will generate an investor-ready pitch deck with AI prompts",
    seller: "Launchpad AI",
    category: "Business",
    priceUsd: 60,
    deliveryDays: 4,
    description: "Full pitch deck narrative, financial prompts, and design direction using AI tooling.",
    accentColor: ACCENTS[2]!,
    reviews: [
      { id: randomUUID(), author: "Marcus T.", rating: 5, comment: "Closed our seed round with this deck.", createdAt: "2026-06-25T10:00:00.000Z" },
      { id: randomUUID(), author: "Lena K.", rating: 5, comment: "Professional and fast turnaround.", createdAt: "2026-07-01T10:00:00.000Z" },
      { id: randomUUID(), author: "Devon R.", rating: 4, comment: "Solid structure, needed minor edits.", createdAt: "2026-07-06T10:00:00.000Z" },
    ],
  },
  {
    id: "gig-coding-agent-prompts",
    title: "I will build custom AI coding agent prompt chains",
    seller: "Nimbus AI",
    category: "Coding",
    priceUsd: 55,
    deliveryDays: 3,
    description: "Reusable prompt chains for autonomous coding agents to ship features end-to-end.",
    accentColor: ACCENTS[3]!,
    reviews: [
      { id: randomUUID(), author: "Wei L.", rating: 5, comment: "Cut our dev time in half.", createdAt: "2026-06-27T10:00:00.000Z" },
      { id: randomUUID(), author: "Sofia N.", rating: 5, comment: "Extremely well documented chains.", createdAt: "2026-07-03T10:00:00.000Z" },
    ],
  },
  {
    id: "gig-debugging-prompt-pack",
    title: "I will optimize your debugging & code-review prompt library",
    seller: "Echofy Devs",
    category: "Coding",
    priceUsd: 22,
    deliveryDays: 2,
    description: "A tuned prompt library for faster bug triage and automated code review comments.",
    accentColor: ACCENTS[3]!,
    reviews: [
      { id: randomUUID(), author: "Priya S.", rating: 4, comment: "Useful, though some prompts are LLM-specific.", createdAt: "2026-06-29T10:00:00.000Z" },
    ],
  },
];

const gigs: Gig[] = gigsSeed.map((g) => ({ ...g, rating: avgRating(g.reviews), reviewCount: g.reviews.length }));

export function listGigs(params: { category?: string; search?: string }): Gig[] {
  let results = gigs;
  if (params.category && params.category !== "All") {
    results = results.filter((g) => g.category === params.category);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (g) => g.title.toLowerCase().includes(q) || g.seller.toLowerCase().includes(q),
    );
  }
  return results;
}

export function getGig(id: string): Gig | undefined {
  return gigs.find((g) => g.id === id);
}

export type GigPurchaseResult =
  | { status: "ok"; gig: Gig; walletBalanceUsd: number }
  | { status: "not_found" }
  | { status: "insufficient_balance"; walletBalanceUsd: number };

export function purchaseGig(userId: string, gigId: string): GigPurchaseResult {
  const gig = getGig(gigId);
  if (!gig) return { status: "not_found" };
  const user = getUserById(userId);
  if (!user) return { status: "not_found" };

  const updated = debitWallet(userId, gig.priceUsd);
  if (!updated) return { status: "insufficient_balance", walletBalanceUsd: user.walletBalanceUsd };

  return { status: "ok", gig, walletBalanceUsd: updated.walletBalanceUsd };
}

export function addGigReview(gigId: string, author: string, rating: number, comment: string): GigReview | null {
  const gig = getGig(gigId);
  if (!gig) return null;
  const review: GigReview = { id: randomUUID(), author, rating: Math.min(5, Math.max(1, rating)), comment: comment.slice(0, 300), createdAt: new Date().toISOString() };
  gig.reviews = [review, ...gig.reviews].slice(0, 20);
  gig.reviewCount = gig.reviews.length;
  gig.rating = avgRating(gig.reviews);
  return review;
}
