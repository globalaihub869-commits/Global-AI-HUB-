import { Router } from "express";
import { sendVipWelcomeEmail, getVipEmails } from "../lib/vip-emailer.js";

const router = Router();

router.post("/send", (req, res) => {
  const user = (req as unknown as { session?: { userId?: string; user?: { id: string; name: string; email: string; plan: string } } }).session?.user;
  if (!user) return res.status(401).json({ error: "UNAUTHENTICATED" });
  if ((user as { role?: string }).role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });

  const { userId, name, email, plan } = req.body as { userId?: string; name?: string; email?: string; plan?: string };
  if (!userId || !name || !email || !plan) return res.status(400).json({ error: "Missing fields" });

  const sent = sendVipWelcomeEmail({ id: userId, name, email, plan });
  return res.status(201).json({ email: sent });
});

router.get("/emails", (req, res) => {
  const user = (req as unknown as { session?: { userId?: string; user?: { role?: string } } }).session?.user;
  if (!user) return res.status(401).json({ error: "UNAUTHENTICATED" });
  if (user.role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });

  return res.json({ emails: getVipEmails() });
});

export default router;
