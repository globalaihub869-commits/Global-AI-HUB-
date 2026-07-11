import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";

export type ProfileType = "developer" | "business" | "student";
export type Role = "admin" | "user";
export type PlanTier = "free" | "pro" | "enterprise";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  profileType: ProfileType | null;
  role: Role;
  createdAt: Date;
  plan: PlanTier;
  planActivatedAt: Date | null;
  walletBalanceUsd: number;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  profileType: ProfileType | null;
  role: Role;
  createdAt: string;
  plan: PlanTier;
  planActivatedAt: string | null;
  walletBalanceUsd: number;
}

export const TRIAL_WALLET_STARTING_BALANCE = 5.0;

const ADMIN_EMAIL = "faisalmiraj313@gmail.com";

function rowToUser(row: typeof usersTable.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    profileType: row.profileType as ProfileType | null,
    role: row.role as Role,
    createdAt: row.createdAt,
    plan: row.plan as PlanTier,
    planActivatedAt: row.planActivatedAt ?? null,
    walletBalanceUsd: row.walletBalanceUsd,
  };
}

export function toPublic(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    profileType: user.profileType,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    plan: user.plan,
    planActivatedAt: user.planActivatedAt ? user.planActivatedAt.toISOString() : null,
    walletBalanceUsd: Math.round(user.walletBalanceUsd * 100) / 100,
  };
}

export async function createUser(
  email: string,
  name: string,
  password: string,
): Promise<User> {
  const normalizedEmail = email.toLowerCase().trim();

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);
  if (existing) throw new Error("EMAIL_TAKEN");

  const passwordHash = await bcrypt.hash(password, 10);
  const role: Role =
    normalizedEmail === ADMIN_EMAIL || normalizedEmail.startsWith("admin")
      ? "admin"
      : "user";

  const [row] = await db
    .insert(usersTable)
    .values({
      id: randomUUID(),
      email: normalizedEmail,
      name: name.trim(),
      passwordHash,
      role,
      plan: "free",
      walletBalanceUsd: TRIAL_WALLET_STARTING_BALANCE,
    })
    .returning();

  return rowToUser(row!);
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<User | null> {
  const [row] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim()))
    .limit(1);
  if (!row) return null;
  const ok = await bcrypt.compare(password, row.passwordHash);
  return ok ? rowToUser(row) : null;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [row] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
  return row ? rowToUser(row) : undefined;
}

export async function updateUserProfile(
  id: string,
  profileType: ProfileType,
): Promise<User | null> {
  const [row] = await db
    .update(usersTable)
    .set({ profileType })
    .where(eq(usersTable.id, id))
    .returning();
  return row ? rowToUser(row) : null;
}

export async function upgradeUserPlan(
  id: string,
  plan: PlanTier,
): Promise<User | null> {
  const [row] = await db
    .update(usersTable)
    .set({ plan, planActivatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning();
  return row ? rowToUser(row) : null;
}

export async function debitWallet(
  id: string,
  amountUsd: number,
): Promise<User | null> {
  const [row] = await db
    .update(usersTable)
    .set({ walletBalanceUsd: sql`wallet_balance_usd - ${amountUsd}` })
    .where(and(eq(usersTable.id, id), gte(usersTable.walletBalanceUsd, amountUsd)))
    .returning();
  return row ? rowToUser(row) : null;
}
