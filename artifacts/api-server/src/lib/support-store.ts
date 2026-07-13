import { randomUUID } from "crypto";
import { publishLiveEvent } from "./live-events.js";
import { logger } from "./logger.js";
import { db, supportTicketsTable, supportReviewsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

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
      db.update(supportTicketsTable)
        .set({ status: "Archived", lastActivityAt: now })
        .where(eq(supportTicketsTable.id, t.id))
        .catch((err) => logger.error({ err }, "Failed to archive ticket in DB"));
    }
  }
}, 60_000);

let ticketCounter = 2000;

function persistTicketUpsert(ticket: SupportTicket): void {
  db.insert(supportTicketsTable)
    .values({
      id: ticket.id,
      userId: ticket.userId,
      userEmail: ticket.userEmail,
      userName: ticket.userName,
      issue: ticket.issue,
      status: ticket.status,
      severity: ticket.severity,
      isVip: ticket.isVip,
      adminReply: ticket.adminReply,
      submittedAt: ticket.submittedAt,
      lastActivityAt: ticket.lastActivityAt,
    })
    .onConflictDoUpdate({
      target: supportTicketsTable.id,
      set: {
        status: ticket.status,
        severity: ticket.severity,
        adminReply: ticket.adminReply,
        lastActivityAt: ticket.lastActivityAt,
      },
    })
    .catch((err) => logger.error({ err }, "Failed to persist support ticket"));
}

function persistReview(review: SupportReview): void {
  db.insert(supportReviewsTable)
    .values({
      id: review.id,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    })
    .onConflictDoNothing()
    .catch((err) => logger.error({ err }, "Failed to persist support review"));
}

/** Load existing tickets and reviews from DB into memory. Called once at startup. */
export async function bootstrapSupportStore(): Promise<void> {
  try {
    const [ticketRows, reviewRows] = await Promise.all([
      db.select().from(supportTicketsTable).orderBy(desc(supportTicketsTable.submittedAt)).limit(500),
      db.select().from(supportReviewsTable).orderBy(desc(supportReviewsTable.createdAt)).limit(200),
    ]);

    for (const row of ticketRows) {
      tickets.push({
        id: row.id,
        userId: row.userId,
        userEmail: row.userEmail,
        userName: row.userName,
        issue: row.issue,
        status: row.status as TicketStatus,
        severity: row.severity as TicketSeverity,
        isVip: row.isVip,
        adminReply: row.adminReply ?? null,
        submittedAt: row.submittedAt,
        lastActivityAt: row.lastActivityAt,
      });

      const numericId = parseInt(row.id.replace("TCK-", ""), 10);
      if (!isNaN(numericId) && numericId >= ticketCounter) {
        ticketCounter = numericId + 1;
      }
    }

    for (const row of reviewRows) {
      reviews.push({
        id: row.id,
        userId: row.userId,
        userName: row.userName,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.createdAt,
      });
    }

    logger.info({ tickets: tickets.length, reviews: reviews.length }, "Support store bootstrapped from DB");
  } catch (err) {
    logger.error({ err }, "Failed to bootstrap support store from DB");
  }
}

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
  persistTicketUpsert(ticket);

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
  persistTicketUpsert(ticket);
  return ticket;
}

export function createReview(opts: { userId: string; userName: string; rating: number; comment: string }): SupportReview {
  const review: SupportReview = { id: randomUUID(), ...opts, createdAt: Date.now() };
  reviews.unshift(review);
  if (reviews.length > 200) reviews.length = 200;
  persistReview(review);
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
