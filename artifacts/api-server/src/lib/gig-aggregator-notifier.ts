import nodemailer from "nodemailer";
import { logger } from "./logger.js";

const FROM_EMAIL = "globalaihub.official@gmail.com";
const FROM_NAME = "Global AI Hub";
const HUB_URL = "https://globalaihubco.com";

let _transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (_transporter) return _transporter;
  const pass = process.env["MAIL_PASSWORD"];
  if (!pass) {
    logger.warn("MAIL_PASSWORD not set — gig feature notifications disabled");
    return null;
  }
  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: FROM_EMAIL, pass },
  });
  return _transporter;
}

interface GigPublishDetails {
  title: string;
  sellerName: string;
  sellerEmail?: string | null;
  sourceUrl: string;
  ourPrice: number;
  slug: string;
  metaTitle: string;
}

export async function sendGigFeatureNotification(
  gig: GigPublishDetails,
): Promise<"sent" | "failed" | "no_email"> {
  if (!gig.sellerEmail) return "no_email";

  const transporter = getTransporter();
  if (!transporter) return "failed";

  const gigUrl = `${HUB_URL}/gigs/${gig.slug}`;
  const subject = `🎉 Your Work is Featured on Global AI Hub — ${gig.title.slice(0, 40)}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0e1a; color: #e2e8f0; margin: 0; padding: 0; }
    .wrap { max-width: 600px; margin: 32px auto; background: #12111f; border: 1px solid rgba(168,85,247,0.2); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, rgba(168,85,247,0.3), rgba(34,211,238,0.2)); padding: 28px 32px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .logo { font-size: 22px; font-weight: 800; color: #fff; }
    .logo span { color: #a855f7; }
    .body { padding: 28px 32px; }
    h2 { font-size: 20px; color: #fff; margin: 0 0 16px; }
    p { color: #94a3b8; line-height: 1.7; margin: 0 0 14px; font-size: 14px; }
    .gig-box { background: rgba(168,85,247,0.08); border: 1px solid rgba(168,85,247,0.25); border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
    .gig-title { font-size: 15px; font-weight: 700; color: #fff; margin: 0 0 6px; }
    .gig-meta { font-size: 13px; color: #94a3b8; }
    .gig-price { font-size: 18px; font-weight: 800; color: #a855f7; margin-top: 8px; }
    .cta { display: inline-block; margin-top: 12px; padding: 12px 28px; background: linear-gradient(135deg, #a855f7, #22d3ee); color: #fff; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 14px; }
    .highlight { color: #22d3ee; font-weight: 600; }
    .footer { padding: 18px 32px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #475569; }
    ul { color: #94a3b8; font-size: 14px; line-height: 2; padding-left: 20px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo">Global <span>AI</span> Hub</div>
    </div>
    <div class="body">
      <h2>🎉 Congratulations, ${gig.sellerName}!</h2>
      <p>We discovered your work and it's now <span class="highlight">featured on Global AI Hub</span> — one of the fastest-growing platforms for AI tools, services, and talent.</p>

      <div class="gig-box">
        <div class="gig-title">${gig.title}</div>
        <div class="gig-meta">Originally from: <a href="${gig.sourceUrl}" style="color:#22d3ee">${gig.sourceUrl}</a></div>
        <div class="gig-price">Featured at: $${gig.ourPrice}</div>
      </div>

      <p>What this means for you:</p>
      <ul>
        <li>✦ Your gig is visible to thousands of AI professionals and businesses</li>
        <li>✦ Qualified leads can discover and inquire about your services</li>
        <li>✦ We link directly back to your original listing</li>
        <li>✦ No exclusivity — your original listing stays live</li>
      </ul>

      <p>Want to claim your profile, update your listing, or explore partnership opportunities with us?</p>

      <a class="cta" href="${gigUrl}">View Your Listing →</a>
    </div>
    <div class="footer">
      Global AI Hub · <a href="mailto:${FROM_EMAIL}" style="color:#475569">${FROM_EMAIL}</a><br/>
      ${HUB_URL} · You're receiving this because your gig was featured as a top-rated AI service.
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${gig.sellerName},\n\nYour work has been featured on Global AI Hub (${HUB_URL})!\n\nGig: ${gig.title}\nListing: ${gigUrl}\n\nYou're featured because your service was identified as top-rated. We link back to your original listing and give you full credit.\n\nWant to claim your profile or discuss partnership opportunities? Reply to this email.\n\nBest,\nThe Global AI Hub Team`;

  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: gig.sellerEmail,
      subject,
      text,
      html,
    });
    logger.info({ to: gig.sellerEmail, gigTitle: gig.title, messageId: info.messageId }, "Gig feature notification sent");
    return "sent";
  } catch (err) {
    logger.error({ err, to: gig.sellerEmail, gigTitle: gig.title }, "Gig feature notification failed");
    return "failed";
  }
}
