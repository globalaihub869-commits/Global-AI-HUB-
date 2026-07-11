import { Router } from "express";
import {
  createUser,
  verifyUser,
  getUserById,
  updateUserProfile,
  toPublic,
  type ProfileType,
} from "../lib/users.js";
import { recordFailedLogin } from "../lib/threat-store.js";
import { redeemReferral, getReferralOwnerId } from "../lib/referral-store.js";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const router = Router();

router.post("/auth/signup", async (req, res) => {
  const { email, name, password, referralCode } = req.body as {
    email?: string;
    name?: string;
    password?: string;
    referralCode?: string;
  };

  if (!email || !name || !password) {
    res.status(400).json({ error: "MISSING_FIELDS", message: "email, name and password are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "PASSWORD_TOO_SHORT", message: "Password must be at least 8 characters" });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "INVALID_EMAIL", message: "Invalid email address" });
    return;
  }

  try {
    const user = await createUser(email, name, password);
    req.session.userId = user.id;

    if (referralCode && referralCode.trim()) {
      const ownerId = getReferralOwnerId(referralCode.trim());
      const referrer = ownerId ? await getUserById(ownerId) : undefined;
      if (referrer) {
        redeemReferral(referralCode.trim(), user.id, user.email, referrer.plan);
      }
    }

    res.status(201).json({ user: toPublic(user) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "EMAIL_TAKEN") {
      res.status(409).json({ error: "EMAIL_TAKEN", message: "An account with this email already exists" });
    } else {
      res.status(500).json({ error: "SERVER_ERROR", message: "Could not create account" });
    }
  }
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "MISSING_FIELDS", message: "email and password are required" });
    return;
  }

  const user = await verifyUser(email, password);
  if (!user) {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    recordFailedLogin(ip);
    res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Incorrect email or password" });
    return;
  }

  req.session.userId = user.id;
  res.json({ user: toPublic(user) });
});

router.get("/auth/me", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }
  const user = await getUserById(userId);
  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }
  res.json({ user: toPublic(user) });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("ghub.sid");
    res.json({ ok: true });
  });
});

router.patch("/auth/profile", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }

  const { profileType } = req.body as { profileType?: ProfileType };
  if (!profileType || !["developer", "business", "student"].includes(profileType)) {
    res.status(400).json({ error: "INVALID_PROFILE_TYPE", message: "profileType must be developer, business, or student" });
    return;
  }

  const user = await updateUserProfile(userId, profileType);
  if (!user) {
    res.status(404).json({ error: "USER_NOT_FOUND" });
    return;
  }
  res.json({ user: toPublic(user) });
});

export default router;
