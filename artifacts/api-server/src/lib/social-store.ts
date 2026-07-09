import { randomUUID } from "crypto";

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  jobId: string | null;
  jobTitle: string | null;
  participantIds: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: string;
}

export interface ActivityEvent {
  id: string;
  type: "like" | "job_posted" | "tool_visited" | "job_applied" | "chat_joined";
  actorName: string;
  targetName: string;
  createdAt: string;
}

const CHAT_HISTORY_LIMIT = 200;

const chatMessages: ChatMessage[] = [
  { id: randomUUID(), userId: "seed-1", userName: "Priya S.", text: "Anyone using the new multimodal model from Nimbus AI? Curious about latency.", createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString() },
  { id: randomUUID(), userId: "seed-2", userName: "Marcus T.", text: "Yeah, it's solid for image+text. Still ramping up on video though.", createdAt: new Date(Date.now() - 1000 * 60 * 38).toISOString() },
  { id: randomUUID(), userId: "seed-3", userName: "Lena K.", text: "Just posted a Prompt Engineer contract role if anyone's looking 👀", createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { id: randomUUID(), userId: "seed-4", userName: "Devon R.", text: "Tip: the ROI calculator on this site is a great way to pitch AI tooling budgets to leadership.", createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString() },
];

const conversations = new Map<string, Conversation>();
const conversationMessages = new Map<string, DirectMessage[]>();

const ACTIVITY_LIMIT = 60;
const activityEvents: ActivityEvent[] = [
  { id: randomUUID(), type: "like", actorName: "Priya S.", targetName: "Nimbus AI Studio", createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
  { id: randomUUID(), type: "job_posted", actorName: "Echofy", targetName: "Product Manager, Voice AI", createdAt: new Date(Date.now() - 1000 * 60 * 47).toISOString() },
  { id: randomUUID(), type: "tool_visited", actorName: "Marcus T.", targetName: "Verbatim Labs", createdAt: new Date(Date.now() - 1000 * 60 * 31).toISOString() },
  { id: randomUUID(), type: "job_applied", actorName: "Lena K.", targetName: "Senior Machine Learning Engineer", createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
  { id: randomUUID(), type: "like", actorName: "Devon R.", targetName: "Formless", createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString() },
];

export function listChatMessages(after?: string): ChatMessage[] {
  if (!after) return chatMessages.slice(-50);
  const afterTime = new Date(after).getTime();
  return chatMessages.filter((m) => new Date(m.createdAt).getTime() > afterTime);
}

export function postChatMessage(userId: string, userName: string, text: string): ChatMessage {
  const message: ChatMessage = { id: randomUUID(), userId, userName, text, createdAt: new Date().toISOString() };
  chatMessages.push(message);
  if (chatMessages.length > CHAT_HISTORY_LIMIT) chatMessages.splice(0, chatMessages.length - CHAT_HISTORY_LIMIT);
  return message;
}

export function listConversationsForUser(userId: string): Conversation[] {
  return [...conversations.values()]
    .filter((c) => c.participantIds.includes(userId))
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export function getConversation(id: string): Conversation | undefined {
  return conversations.get(id);
}

export function getConversationMessages(id: string): DirectMessage[] {
  return conversationMessages.get(id) ?? [];
}

export function startConversation(params: {
  userId: string;
  userName: string;
  jobId: string | null;
  jobTitle: string | null;
  vendorName: string;
  text: string;
}): Conversation {
  const vendorId = `vendor:${params.vendorName.toLowerCase().replace(/\s+/g, "-")}`;
  const existing = [...conversations.values()].find(
    (c) => c.jobId === params.jobId && c.participantIds.includes(params.userId) && c.participantIds.includes(vendorId),
  );
  if (existing) {
    addDirectMessage(existing.id, params.userId, params.userName, params.text);
    return existing;
  }

  const conversation: Conversation = {
    id: randomUUID(),
    jobId: params.jobId,
    jobTitle: params.jobTitle,
    participantIds: [params.userId, vendorId],
    participantNames: { [params.userId]: params.userName, [vendorId]: params.vendorName },
    lastMessage: params.text,
    lastMessageAt: new Date().toISOString(),
  };
  conversations.set(conversation.id, conversation);
  addDirectMessage(conversation.id, params.userId, params.userName, params.text);
  return conversation;
}

export function addDirectMessage(conversationId: string, senderId: string, senderName: string, text: string): DirectMessage {
  const message: DirectMessage = { id: randomUUID(), conversationId, senderId, senderName, text, createdAt: new Date().toISOString() };
  const list = conversationMessages.get(conversationId) ?? [];
  list.push(message);
  conversationMessages.set(conversationId, list);

  const conversation = conversations.get(conversationId);
  if (conversation) {
    conversation.lastMessage = text;
    conversation.lastMessageAt = message.createdAt;
  }
  return message;
}

export function listActivity(after?: string): ActivityEvent[] {
  if (!after) return activityEvents.slice(-20).reverse();
  const afterTime = new Date(after).getTime();
  return activityEvents.filter((e) => new Date(e.createdAt).getTime() > afterTime).reverse();
}

export function recordActivity(type: ActivityEvent["type"], actorName: string, targetName: string): ActivityEvent {
  const event: ActivityEvent = { id: randomUUID(), type, actorName, targetName, createdAt: new Date().toISOString() };
  activityEvents.push(event);
  if (activityEvents.length > ACTIVITY_LIMIT) activityEvents.splice(0, activityEvents.length - ACTIVITY_LIMIT);
  return event;
}
