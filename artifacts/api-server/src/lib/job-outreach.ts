import nodemailer from "nodemailer";
import { logger } from "./logger.js";
import type { JobRecord } from "../data/jobs.js";

const FROM_EMAIL = "globalaihub.official@gmail.com";
const FROM_NAME = "Global AI Hub";

function buildTransporter() {
  const pass = process.env.MAIL_PASSWORD;
  if (!pass) {
    logger.warn("MAIL_PASSWORD not set — email outreach disabled");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: FROM_EMAIL, pass },
  });
}

function buildEmailBody(job: JobRecord): { subject: string; html: string; text: string } {
  const subject = `Partnership Opportunity — Global AI Hub × ${job.company}`;

  const text = `Hi ${job.company} Talent Team,

I'm reaching out from Global AI Hub (https://globalaihub.official@gmail.com) — a growing platform for discovering, testing, and hiring in the AI space.

We noticed you're hiring for a "${job.title}" role and wanted to introduce ourselves.

Global AI Hub connects thousands of AI professionals, prompt engineers, and developers with companies like yours every month. We'd love to:

  • Feature your "${job.title}" opening on our AI Job Board (free)
  • Promote it to our audience of AI practitioners
  • Discuss any talent partnership opportunities

If you're interested, feel free to reply to this email or visit us at https://globalai-hub.replit.app/jobs

Best regards,
The Global AI Hub Team
globalaihub.official@gmail.com
`;

  const html = `
<!DOCTYPE html>
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
      <p>We noticed you're hiring for:</p>
      <div class="job-tag">🧠 ${job.title}</div>
      <p>
        I'm reaching out from <strong style="color:#e2e8f0">Global AI Hub</strong> — a growing platform connecting
        thousands of AI professionals with leading companies. We'd love to feature your role on our
        <strong style="color:#e2e8f0">AI Job Board</strong> and promote it to our community of prompt engineers,
        ML practitioners, and developers — completely free.
      </p>
      <p>We can also discuss broader talent partnership opportunities if that's of interest.</p>
      <a class="cta" href="https://globalai-hub.replit.app/jobs">View Our Job Board →</a>
    </div>
    <div class="footer">
      Global AI Hub · globalaihub.official@gmail.com<br/>
      You're receiving this because your company posted a public AI job listing.
    </div>
  </div>
</body>
</html>
`;

  return { subject, html, text };
}

export async function sendOutreachEmail(job: JobRecord): Promise<"sent" | "failed" | "skipped"> {
  if (!job.hrEmail) return "skipped";

  const transporter = buildTransporter();
  if (!transporter) return "failed";

  const { subject, html, text } = buildEmailBody(job);

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: job.hrEmail,
      subject,
      text,
      html,
    });
    logger.info({ jobId: job.id, to: job.hrEmail }, "Outreach email sent");
    return "sent";
  } catch (err) {
    logger.error({ jobId: job.id, to: job.hrEmail, err }, "Outreach email failed");
    return "failed";
  }
}
