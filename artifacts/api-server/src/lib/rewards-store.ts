export type EarnAction =
  | "like"
  | "comment"
  | "share"
  | "bookmark"
  | "tool_visited"
  | "watched_news"
  | "video_generated"
  | "chat_message"
  | "job_posted"
  | "job_applied";

export interface TokenBalance {
  balance: number;
  level: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  tokens: number;
  level: string;
  isCurrentUser: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: "badge" | "credit" | "spotlight" | "swag" | "priority";
}

const ACTION_VALUES: Record<EarnAction, number> = {
  like: 5,
  comment: 8,
  share: 10,
  bookmark: 10,
  tool_visited: 4,
  watched_news: 6,
  video_generated: 15,
  chat_message: 6,
  job_posted: 12,
  job_applied: 8,
};

const LEVELS: { threshold: number; label: string }[] = [
  { threshold: 0, label: "Bronze" },
  { threshold: 100, label: "Silver" },
  { threshold: 300, label: "Gold" },
  { threshold: 700, label: "Platinum" },
];

export const REWARDS_CATALOG: Reward[] = [
  { id: "spotlight-tool", name: "Spotlight a Tool", description: "Feature a tool of your choice on the homepage for 24 hours.", cost: 150, icon: "spotlight" },
  { id: "profile-badge", name: "Verified Contributor Badge", description: "Unlock an animated badge on your public profile.", cost: 80, icon: "badge" },
  { id: "job-boost", name: "Job Post Boost", description: "Pin your next job listing to the top of the board for 3 days.", cost: 220, icon: "priority" },
  { id: "hub-credit", name: "$10 Hub Credit", description: "Redeemable simulated credit toward premium tool listings.", cost: 400, icon: "credit" },
  { id: "swag-pack", name: "Global AI Hub Swag Pack", description: "A simulated redemption for hub-branded merch.", cost: 600, icon: "swag" },
];

interface UserRecord {
  userId: string;
  name: string;
  tokens: number;
  isSeed: boolean;
}

const users = new Map<string, UserRecord>();

const SEED_USERS: { name: string; tokens: number }[] = [
  { name: "Priya S.", tokens: 845 },
  { name: "Marcus T.", tokens: 612 },
  { name: "Lena K.", tokens: 480 },
  { name: "Devon R.", tokens: 315 },
  { name: "Aisha N.", tokens: 210 },
  { name: "Kenji M.", tokens: 140 },
  { name: "Sofia G.", tokens: 95 },
];

for (const seed of SEED_USERS) {
  const id = `seed:${seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  users.set(id, { userId: id, name: seed.name, tokens: seed.tokens, isSeed: true });
}

export function levelFor(tokens: number): string {
  let label = LEVELS[0]!.label;
  for (const tier of LEVELS) {
    if (tokens >= tier.threshold) label = tier.label;
  }
  return label;
}

function ensureUser(userId: string, name: string): UserRecord {
  let record = users.get(userId);
  if (!record) {
    record = { userId, name, tokens: 0, isSeed: false };
    users.set(userId, record);
  } else {
    record.name = name;
  }
  return record;
}

export function getBalance(userId: string, name: string): TokenBalance {
  const record = ensureUser(userId, name);
  return { balance: record.tokens, level: levelFor(record.tokens) };
}

export function pointsForAction(action: EarnAction): number {
  return ACTION_VALUES[action] ?? 0;
}

export function awardTokens(userId: string, name: string, action: EarnAction): TokenBalance {
  const record = ensureUser(userId, name);
  record.tokens += pointsForAction(action);
  return { balance: record.tokens, level: levelFor(record.tokens) };
}

export function getLeaderboard(currentUserId: string | null, limit = 10): LeaderboardEntry[] {
  const sorted = [...users.values()].sort((a, b) => b.tokens - a.tokens);
  return sorted.slice(0, limit).map((u, index) => ({
    rank: index + 1,
    userId: u.userId,
    name: u.name,
    tokens: u.tokens,
    level: levelFor(u.tokens),
    isCurrentUser: u.userId === currentUserId,
  }));
}

export function listRewards(): Reward[] {
  return REWARDS_CATALOG;
}

export type RedeemResult =
  | { status: "ok"; balance: number; reward: Reward }
  | { status: "not_found" }
  | { status: "insufficient_balance"; balance: number; reward: Reward };

export function redeemReward(userId: string, name: string, rewardId: string): RedeemResult {
  const reward = REWARDS_CATALOG.find((r) => r.id === rewardId);
  if (!reward) return { status: "not_found" };
  const record = ensureUser(userId, name);
  if (record.tokens < reward.cost) return { status: "insufficient_balance", balance: record.tokens, reward };
  record.tokens -= reward.cost;
  return { status: "ok", balance: record.tokens, reward };
}
