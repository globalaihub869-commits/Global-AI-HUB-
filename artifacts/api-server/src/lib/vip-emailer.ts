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
  return email;
}

export function getVipEmails(): VipEmail[] {
  return store.slice();
}

export function getVipEmailCount(): number {
  return store.length;
}
