import { pgTable, text } from "drizzle-orm/pg-core";

export const vipEmailsTable = pgTable("vip_emails", {
  id: text("id").primaryKey(),
  to: text("to_address").notNull(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  plan: text("plan").notNull(),
  sentAt: text("sent_at").notNull(),
  status: text("status").notNull().default("sent"),
  preview: text("preview").notNull(),
});

export type VipEmailRow = typeof vipEmailsTable.$inferSelect;
