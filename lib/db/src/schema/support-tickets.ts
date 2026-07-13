import { pgTable, text, boolean, bigint } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const supportTicketsTable = pgTable("support_tickets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id),
  userEmail: text("user_email").notNull(),
  userName: text("user_name").notNull(),
  issue: text("issue").notNull(),
  status: text("status").notNull().default("Open"),
  severity: text("severity").notNull().default("Medium"),
  isVip: boolean("is_vip").notNull().default(false),
  adminReply: text("admin_reply"),
  submittedAt: bigint("submitted_at", { mode: "number" }).notNull(),
  lastActivityAt: bigint("last_activity_at", { mode: "number" }).notNull(),
});

export const supportReviewsTable = pgTable("support_reviews", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id),
  userName: text("user_name").notNull(),
  rating: bigint("rating", { mode: "number" }).notNull(),
  comment: text("comment").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export type SupportTicketRow = typeof supportTicketsTable.$inferSelect;
export type SupportReviewRow = typeof supportReviewsTable.$inferSelect;
