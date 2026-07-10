import { randomUUID } from "crypto";
import { publishLiveEvent } from "./live-events.js";

export type TicketStatus = "Open" | "Pending" | "Resolved" | "Archived";
export type TicketSeverity = "Low" | "Medium" | "High";

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  issue: string;
  status: TicketStatus;
  severity: TicketSeverity;
  isVip: boolean;
  adminReply: string | null;
  submittedAt: number;
  lastActivityAt: number;
}

export interface SupportReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

const tickets: SupportTicket[] = [];
const reviews: SupportReview[] = [];

/** Anti-spam: track ticket creation timestamps per IP. */
const spamTracker = new Map<string, number[]>();
const SPAM_LIMIT = 3;
const SPAM_WINDOW_MS = 5 * 60 * 1000;

/** 24-Hour Auto-Closure: archive tickets with no activity for 24h. */
const AUTO_CLOSE_MS = 24 * 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const t of tickets) {
    if (t.status !== "Resolved" && t.status !== "Archived" && now - t.lastActivityAt > AUTO_CLOSE_MS) {
      t.status = "Archived";
    }
  }
}, 60_000);

let ticketCounter = 2000;

export function checkSpam(ip: string): boolean {
  const now = Date.now();
  const timestamps = (spamTracker.get(ip) ?? []).filter((t) => now - t < SPAM_WINDOW_MS);
  timestamps.push(now);
  spamTracker.set(ip, timestamps);
  return timestamps.length > SPAM_LIMIT;
}

export function createTicket(opts: {
  userId: string;
  userEmail: string;
  userName: string;
  issue: string;
  isVip: boolean;
}): SupportTicket {
  const id = `TCK-${ticketCounter++}`;
  const now = Date.now();
  const severity: TicketSeverity = /urgent|broken|can't|crash|error|fail/i.test(opts.issue) ? "High" : "Medium";

  const ticket: SupportTicket = {
    id,
    userId: opts.userId,
    userEmail: opts.userEmail,
    userName: opts.userName,
    issue: opts.issue.slice(0, 500),
    status: "Open",
    severity,
    isVip: opts.isVip,
    adminReply: null,
    submittedAt: now,
    lastActivityAt: now,
  };

  tickets.unshift(ticket);
  if (tickets.length > 500) tickets.length = 500;

  if (opts.isVip) {
    publishLiveEvent({
      type: "vip_ticket",
      title: "⭐ VIP Ticket Received",
      message: `${opts.userName} (Enterprise) — ${opts.issue.slice(0, 80)}`,
    });
  }

  return ticket;
}

export function listAllTickets(limit = 100): SupportTicket[] {
  return tickets.slice(0, limit);
}

export function listUserTickets(userId: string): SupportTicket[] {
  return tickets.filter((t) => t.userId === userId);
}

export function updateTicket(id: string, patch: { status?: TicketStatus; adminReply?: string }): SupportTicket | null {
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) return null;
  if (patch.status) ticket.status = patch.status;
  if (patch.adminReply !== undefined) ticket.adminReply = patch.adminReply;
  ticket.lastActivityAt = Date.now();
  return ticket;
}

export function createReview(opts: { userId: string; userName: string; rating: number; comment: string }): SupportReview {
  const review: SupportReview = { id: randomUUID(), ...opts, createdAt: Date.now() };
  reviews.unshift(review);
  if (reviews.length > 200) reviews.length = 200;
  return review;
}

export function getFeaturedReviews(minRating = 4, limit = 6): SupportReview[] {
  return reviews.filter((r) => r.rating >= minRating).slice(0, limit);
}

export function getSupportStats() {
  const open = tickets.filter((t) => t.status === "Open").length;
  const pending = tickets.filter((t) => t.status === "Pending").length;
  const resolved = tickets.filter((t) => t.status === "Resolved").length;
  const archived = tickets.filter((t) => t.status === "Archived").length;
  const vip = tickets.filter((t) => t.isVip && t.status === "Open").length;
  return { open, pending, resolved, archived, vip, total: tickets.length };
}
