import nodemailer from "nodemailer";
import { logger } from "./logger.js";
import type { JobRecord } from "../data/jobs.js";

const FROM_EMAIL = "globalaihub.official@gmail.com";
const FROM_NAME = "Global AI Hub";
const HUB_URL = "https://globalai-hub.replit.app";

let _transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (_transporter) return _transporter;
  const pass = process.env["MAIL_PASSWORD"];
  if (!pass) {
    logger.warn("MAIL_PASSWORD not set — email outreach disabled");
    return null;
  }
  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: FROM_EMAIL, pass },
  });
  return _transporter;
}

export async function verifyMailTransporter(): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.verify();
    logger.info({ from: FROM_EMAIL }, "Nodemailer Gmail auth verified ✓");
    return true;
  } catch (err) {
    logger.error({ err }, "Nodemailer Gmail auth FAILED — check MAIL_PASSWORD secret");
    _transporter = null;
    return false;
  }
}

function buildEmailBody(job: JobRecord): { subject: string; html: string; text: string } {
  const subject = `Partnership Opportunity — Global AI Hub × ${job.company}`;

  const text = [
    `Hi ${job.company} Talent Team,`,
    "",
    `I'm reaching out from Global AI Hub (${HUB_URL}) — a growing platform for discovering, testing, and hiring in the AI space.`,
    "",
    `We noticed you're hiring for a "${job.title}" role and wanted to introduce ourselves.`,
    "",
    "Global AI Hub connects thousands of AI professionals, prompt engineers, and developers with companies like yours every month. We'd love to:",
    "",
    `  • Feature your "${job.title}" opening on our AI Job Board (free)`,
    "  • Promote it to our audience of AI practitioners",
    "  • Discuss any talent partnership opportunities",
    "",
    `If you're interested, reply to this email or visit: ${HUB_URL}/jobs`,
    "",
    "Best regards,",
    "The Global AI Hub Team",
    FROM_EMAIL,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0e1a; color: #e2e8f0; margin: 0; padding: 0; }
    .wrap { max-width: 580px; margin: 32px auto; background: #12111f; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, rgba(168,85,247,0.3), rgba(34,211,238,0.2)); padding: 28px 32px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .logo { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .logo span { color: #a855f7; }
    .body { padding: 28px 32px; }
    h2 { font-size: 18px; color: #fff; margin: 0 0 16px; }
    p { color: #94a3b8; line-height: 1.7; margin: 0 0 12px; font-size: 14px; }
    ul { color: #94a3b8; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0 0 16px; }
    li { margin: 0; }
    .job-tag { display: inline-block; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); color: #c084fc; border-radius: 8px; padding: 4px 12px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
    .cta { display: inline-block; margin-top: 8px; padding: 11px 24px; background: #a855f7; color: #fff; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 14px; }
    .footer { padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #475569; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo">Global <span>AI</span> Hub</div>
    </div>
    <div class="body">
      <h2>Hi ${job.company} Talent Team,</h2>
      <p>We noticed you're currently hiring for:</p>
      <div class="job-tag">🧠 ${job.title}</div>
      <p>
        I'm reaching out from <strong style="color:#e2e8f0">Global AI Hub</strong> — a growing platform connecting
        thousands of AI professionals with leading companies. We'd love to feature your role on our
        <strong style="color:#e2e8f0">AI Job Board</strong> and promote it to our community of prompt engineers,
        ML practitioners, and developers — completely free.
      </p>
      <ul>
        <li>✦ Free listing on our AI Job Board</li>
        <li>✦ Promotion to our active AI community</li>
        <li>✦ Talent partnership opportunities</li>
      </ul>
      <p>We can also discuss broader hiring partnerships if that's of interest.</p>
      <a class="cta" href="${HUB_URL}/jobs">View Our Job Board →</a>
    </div>
    <div class="footer">
      Global AI Hub · <a href="mailto:${FROM_EMAIL}" style="color:#475569">${FROM_EMAIL}</a><br/>
      You're receiving this because your company posted a public AI job listing.
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

export async function sendOutreachEmail(job: JobRecord): Promise<"sent" | "failed" | "skipped"> {
  if (!job.hrEmail) return "skipped";

  const transporter = getTransporter();
  if (!transporter) return "failed";

  const { subject, html, text } = buildEmailBody(job);

  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: job.hrEmail,
      subject,
      text,
      html,
    });
    logger.info({ jobId: job.id, to: job.hrEmail, messageId: info.messageId }, "Outreach email sent");
    return "sent";
  } catch (err) {
    logger.error({ jobId: job.id, to: job.hrEmail, err }, "Outreach email failed");
    return "failed";
  }
}

export async function sendTestEmail(to: string): Promise<"sent" | "failed"> {
  const transporter = getTransporter();
  if (!transporter) return "failed";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><style>
  body { font-family: -apple-system, sans-serif; background: #0f0e1a; color: #e2e8f0; margin: 0; padding: 32px; }
  .wrap { max-width: 520px; margin: 0 auto; background: #12111f; border: 1px solid rgba(168,85,247,0.3); border-radius: 16px; padding: 28px 32px; }
  .logo { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 20px; }
  .logo span { color: #a855f7; }
  p { color: #94a3b8; font-size: 14px; line-height: 1.7; }
  .badge { display: inline-block; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); color: #4ade80; border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 700; margin-top: 12px; }
</style></head>
<body>
  <div class="wrap">
    <div class="logo">Global <span>AI</span> Hub</div>
    <p>This is a test email confirming your Nodemailer + Gmail integration is working correctly.</p>
    <p>Automated recruiter outreach emails will be sent from <strong style="color:#e2e8f0">${FROM_EMAIL}</strong> whenever the job scraper finds a listing with an HR contact email.</p>
    <div class="badge">✓ Email system operational</div>
  </div>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: "✓ Global AI Hub — Email System Test",
      text: `Global AI Hub email system test\n\nThis confirms your Nodemailer + Gmail integration is working.\nOutreach emails will be sent from ${FROM_EMAIL}.`,
      html,
    });
    logger.info({ to, messageId: info.messageId }, "Test email sent");
    return "sent";
  } catch (err) {
    logger.error({ to, err }, "Test email failed");
    return "failed";
  }
}
