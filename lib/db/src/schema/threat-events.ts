import { pgTable, text, boolean, integer, bigint } from "drizzle-orm/pg-core";

export const threatEventsTable = pgTable("threat_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  ip: text("ip").notNull(),
  userId: text("user_id"),
  method: text("method").notNull(),
  path: text("path").notNull(),
  action: text("action").notNull(),
  reason: text("reason").notNull(),
  blocked: boolean("blocked").notNull().default(false),
  preBlockWarning: boolean("pre_block_warning").notNull().default(false),
  attemptNumber: integer("attempt_number").notNull().default(1),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export type ThreatEventRow = typeof threatEventsTable.$inferSelect;
