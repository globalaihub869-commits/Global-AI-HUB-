import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

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

const users = new Map<string, User>();
const emailIndex = new Map<string, string>();

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
  const existing = emailIndex.get(email.toLowerCase());
  if (existing) throw new Error("EMAIL_TAKEN");

  const passwordHash = await bcrypt.hash(password, 10);
  const normalizedEmail = email.toLowerCase().trim();
  const user: User = {
    id: randomUUID(),
    email: normalizedEmail,
    name: name.trim(),
    passwordHash,
    profileType: null,
    // Demo-only role assignment: any email local-part starting with "admin" becomes a Super Admin.
  role: normalizedEmail === "faisalmiraj313@gmail.com" ? "admin" : (normalizedEmail.startsWith("admin") ? "admin" : "user"),
    plan: "free",
    planActivatedAt: null,
    walletBalanceUsd: TRIAL_WALLET_STARTING_BALANCE,
  };

  users.set(user.id, user);
  emailIndex.set(user.email, user.id);
  return user;
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<User | null> {
  const id = emailIndex.get(email.toLowerCase().trim());
  if (!id) return null;
  const user = users.get(id);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export function getUserById(id: string): User | undefined {
  return users.get(id);
}

export function updateUserProfile(id: string, profileType: ProfileType): User | null {
  const user = users.get(id);
  if (!user) return null;
  user.profileType = profileType;
  return user;
}

export function upgradeUserPlan(id: string, plan: PlanTier): User | null {
  const user = users.get(id);
  if (!user) return null;
  user.plan = plan;
  user.planActivatedAt = new Date();
  return user;
}

export function debitWallet(id: string, amountUsd: number): User | null {
  const user = users.get(id);
  if (!user) return null;
  if (user.walletBalanceUsd < amountUsd) return null;
  user.walletBalanceUsd = Math.round((user.walletBalanceUsd - amountUsd) * 100) / 100;
  return user;
}
