import { pgTable, text, boolean, timestamp, integer, uuid } from "drizzle-orm/pg-core";

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(),
  location: text("location").notNull(),
  remote: boolean("remote").notNull().default(false),
  salaryRange: text("salary_range").notNull().default("Competitive"),
  description: text("description").notNull(),
  tags: text("tags").array().notNull().default([]),
  postedAt: text("posted_at").notNull(),
  accentColor: text("accent_color").notNull().default("rgba(168,85,247,0.6)"),
  hrEmail: text("hr_email"),
  outreachStatus: text("outreach_status"),
  source: text("source").notNull().default("scraped"),
  qualityScore: integer("quality_score").notNull().default(0),
  rejected: boolean("rejected").notNull().default(false),
  rejectedReason: text("rejected_reason"),
  url: text("url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const socialPosts = pgTable("social_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: text("job_id").notNull(),
  platform: text("platform").notNull(),
  content: text("content").notNull(),
  hashtags: text("hashtags").notNull(),
  jobUrl: text("job_url").notNull(),
  status: text("status").notNull().default("queued"),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
