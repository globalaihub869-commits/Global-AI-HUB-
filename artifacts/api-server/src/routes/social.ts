import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getUserById } from "../lib/users.js";
import {
  listChatMessages,
  postChatMessage,
  listConversationsForUser,
  getConversation,
  getConversationMessages,
  startConversation,
  addDirectMessage,
  listActivity,
  recordActivity,
} from "../lib/social-store.js";
import {
  getBalance,
  awardTokens,
  getLeaderboard,
  listRewards,
  redeemReward,
  type EarnAction,
} from "../lib/rewards-store.js";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "You must be signed in" });
    return;
  }
  const user = getUserById(userId);
  if (!user) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "You must be signed in" });
    return;
  }
  res.locals.currentUser = user;
  next();
}

router.get("/chat/messages", (req, res) => {
  const { after } = req.query as Record<string, string | undefined>;
  res.json({ messages: listChatMessages(after) });
});

router.post("/chat/messages", requireAuth, (req, res) => {
  const { text } = req.body as { text?: string };
  if (!text || !text.trim()) {
    res.status(400).json({ error: "MISSING_TEXT", message: "Message text is required" });
    return;
  }
  const user = res.locals.currentUser as { id: string; name: string };
  const message = postChatMessage(user.id, user.name, text.trim().slice(0, 500));
  req.log.info({ userId: user.id }, "chat message posted");
  res.status(201).json({ message });
});

router.get("/conversations", requireAuth, (req, res) => {
  const user = res.locals.currentUser as { id: string };
  res.json({ conversations: listConversationsForUser(user.id) });
});

router.get("/conversations/:id/messages", requireAuth, (req, res) => {
  const user = res.locals.currentUser as { id: string };
  const { id } = req.params as { id: string };
  const conversation = getConversation(id);
  if (!conversation || !conversation.participantIds.includes(user.id)) {
    res.status(404).json({ error: "NOT_FOUND", message: "Conversation not found" });
    return;
  }
  res.json({ messages: getConversationMessages(conversation.id) });
});

router.post("/conversations", requireAuth, (req, res) => {
  const { jobId, jobTitle, vendorName, text } = req.body as {
    jobId?: string; jobTitle?: string; vendorName?: string; text?: string;
  };
  if (!vendorName || !text || !text.trim()) {
    res.status(400).json({ error: "MISSING_FIELDS", message: "vendorName and text are required" });
    return;
  }
  const user = res.locals.currentUser as { id: string; name: string };
  const conversation = startConversation({
    userId: user.id,
    userName: user.name,
    jobId: jobId ?? null,
    jobTitle: jobTitle ?? null,
    vendorName,
    text: text.trim().slice(0, 1000),
  });
  req.log.info({ userId: user.id, conversationId: conversation.id }, "conversation started");
  res.status(201).json({ conversation });
});

router.post("/conversations/:id/messages", requireAuth, (req, res) => {
  const user = res.locals.currentUser as { id: string; name: string };
  const { id } = req.params as { id: string };
  const conversation = getConversation(id);
  if (!conversation || !conversation.participantIds.includes(user.id)) {
    res.status(404).json({ error: "NOT_FOUND", message: "Conversation not found" });
    return;
  }
  const { text } = req.body as { text?: string };
  if (!text || !text.trim()) {
    res.status(400).json({ error: "MISSING_TEXT", message: "Message text is required" });
    return;
  }
  const message = addDirectMessage(conversation.id, user.id, user.name, text.trim().slice(0, 1000));
  res.status(201).json({ message });
});

router.get("/activity", (req, res) => {
  const { after } = req.query as Record<string, string | undefined>;
  res.json({ events: listActivity(after) });
});

router.post("/activity", requireAuth, (req, res) => {
  const { type, targetName } = req.body as { type?: string; targetName?: string };
  const allowed = ["like", "job_posted", "tool_visited", "job_applied", "chat_joined"] as const;
  if (!type || !allowed.includes(type as (typeof allowed)[number]) || !targetName) {
    res.status(400).json({ error: "INVALID_FIELDS", message: "type and targetName are required" });
    return;
  }
  const user = res.locals.currentUser as { name: string };
  const event = recordActivity(type as (typeof allowed)[number], user.name, targetName);
  res.status(201).json({ event });
});

router.get("/tokens/me", requireAuth, (req, res) => {
  const user = res.locals.currentUser as { id: string; name: string };
  res.json(getBalance(user.id, user.name));
});

const EARN_ACTIONS = [
  "like",
  "comment",
  "share",
  "bookmark",
  "tool_visited",
  "watched_news",
  "video_generated",
  "chat_message",
  "job_posted",
  "job_applied",
] as const;

router.post("/tokens/earn", requireAuth, (req, res) => {
  const { action, targetName } = req.body as { action?: string; targetName?: string };
  if (!action || !EARN_ACTIONS.includes(action as (typeof EARN_ACTIONS)[number])) {
    res.status(400).json({ error: "INVALID_ACTION", message: "A valid action is required" });
    return;
  }
  const user = res.locals.currentUser as { id: string; name: string };
  const balance = awardTokens(user.id, user.name, action as EarnAction);
  if (targetName) {
    const activityType = (["like", "job_posted", "tool_visited", "job_applied"] as const).includes(
      action as "like" | "job_posted" | "tool_visited" | "job_applied",
    )
      ? (action as "like" | "job_posted" | "tool_visited" | "job_applied")
      : null;
    if (activityType) recordActivity(activityType, user.name, targetName);
  }
  req.log.info({ userId: user.id, action }, "tokens earned");
  res.status(201).json(balance);
});

router.get("/leaderboard", (req, res) => {
  const userId = req.session.userId ?? null;
  res.json({ entries: getLeaderboard(userId) });
});

router.get("/rewards", (_req, res) => {
  res.json({ rewards: listRewards() });
});

router.post("/rewards/:id/redeem", requireAuth, (req, res) => {
  const user = res.locals.currentUser as { id: string; name: string };
  const { id } = req.params as { id: string };
  const result = redeemReward(user.id, user.name, id);
  if (result.status === "not_found") {
    res.status(404).json({ error: "NOT_FOUND", message: "Reward not found" });
    return;
  }
  if (result.status === "insufficient_balance") {
    res.status(400).json({ error: "INSUFFICIENT_BALANCE", message: "Not enough tokens to redeem this reward", balance: result.balance });
    return;
  }
  req.log.info({ userId: user.id, rewardId: id }, "reward redeemed");
  res.status(200).json({ balance: result.balance, reward: result.reward });
});

export default router;
