import { pgTable, text, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const paymentSubmissionsTable = pgTable("payment_submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id),
  userEmail: text("user_email").notNull(),
  userName: text("user_name").notNull(),
  plan: text("plan").notNull(),
  amountUsdt: doublePrecision("amount_usdt").notNull(),
  txId: text("tx_id").notNull().unique(),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export type PaymentSubmission = typeof paymentSubmissionsTable.$inferSelect;
