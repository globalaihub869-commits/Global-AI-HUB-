import { pgTable, text, doublePrecision, bigint } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const conversionsTable = pgTable("conversions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id),
  userEmail: text("user_email").notNull(),
  plan: text("plan").notNull(),
  amountUsdt: doublePrecision("amount_usdt").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export type ConversionRow = typeof conversionsTable.$inferSelect;
