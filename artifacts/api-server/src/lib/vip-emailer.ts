import { logger } from "./logger.js";
import { db, vipEmailsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

export interface VipEmail {
  id: string;
  to: string;
  name: string;
  subject: string;
  plan: string;
  sentAt: string;
  status: "sent" | "queued" | "failed";
  preview: string;
}

const store: VipEmail[] = [];

function persistVipEmail(email: VipEmail): void {
  db.insert(vipEmailsTable)
    .values({
      id: email.id,
      to: email.to,
      name: email.name,
      subject: email.subject,
      plan: email.plan,
      sentAt: email.sentAt,
      status: email.status,
      preview: email.preview,
    })
    .onConflictDoNothing()
    .catch((err) => logger.error({ err }, "Failed to persist VIP email record"));
}

/** Load existing VIP email records from DB into memory. Called once at startup. */
export async function bootstrapVipEmailer(): Promise<void> {
  try {
    const rows = await db
      .select()
      .from(vipEmailsTable)
      .orderBy(desc(vipEmailsTable.sentAt))
      .limit(200);

    for (const row of rows) {
      store.push({
        id: row.id,
        to: row.to,
        name: row.name,
        subject: row.subject,
        plan: row.plan,
        sentAt: row.sentAt,
        status: row.status as VipEmail["status"],
        preview: row.preview,
      });
    }

    logger.info({ count: store.length }, "VIP emailer bootstrapped from DB");
  } catch (err) {
    logger.error({ err }, "Failed to bootstrap VIP emailer from DB");
  }
}

export function sendVipWelcomeEmail(user: { id: string; name: string; email: string; plan: string }): VipEmail {
  const id = `VIP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const planLabel = user.plan === "enterprise" ? "Enterprise" : "Pro";
  const email: VipEmail = {
    id,
    to: user.email,
    name: user.name,
    subject: `🌟 Welcome to Global AI Hub ${planLabel} — Your VIP Access is Ready`,
    plan: user.plan,
    sentAt: new Date().toISOString(),
    status: "sent",
    preview: `Hi ${user.name.split(" ")[0]}, your ${planLabel} plan is now active. Enjoy priority support, advanced AI sandbox access, and exclusive VIP features across the entire platform.`,
  };
  store.unshift(email);
  if (store.length > 200) store.splice(200);
  persistVipEmail(email);
  return email;
}

export function getVipEmails(): VipEmail[] {
  return store.slice();
}

export function getVipEmailCount(): number {
  return store.length;
}
