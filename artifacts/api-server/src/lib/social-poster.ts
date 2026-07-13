import { logger } from "./logger.js";
import { db } from "@workspace/db";
import { socialPosts } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { JobRecord } from "../data/jobs.js";

const HUB_URL = "https://globalaihubco.com";

function buildJobUrl(job: JobRecord): string {
  const slug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${HUB_URL}/jobs?highlight=${encodeURIComponent(job.id)}&role=${encodeURIComponent(slug)}`;
}

function buildHashtags(job: JobRecord): string {
  const base = ["#AIJobs", "#Hiring", "#TechJobs", "#GlobalAIHub"];
  const tagMap: Record<string, string> = {
    python: "#Python",
    typescript: "#TypeScript",
    javascript: "#JavaScript",
    pytorch: "#PyTorch",
    tensorflow: "#TensorFlow",
    "machine learning": "#MachineLearning",
    "data science": "#DataScience",
    nlp: "#NLP",
    llms: "#LLMs",
    react: "#React",
    "prompt engineering": "#PromptEngineering",
    mlops: "#MLOps",
    llmops: "#LLMOps",
  };
  const extra: string[] = [];
  for (const tag of job.tags) {
    const mapped = tagMap[tag.toLowerCase()];
    if (mapped && !extra.includes(mapped)) extra.push(mapped);
  }
  if (job.remote) base.push("#RemoteWork");
  return [...base, ...extra.slice(0, 3)].join(" ");
}

function buildTwitterContent(job: JobRecord, jobUrl: string, hashtags: string): string {
  const remote = job.remote ? "🌍 Remote" : `📍 ${job.location}`;
  const salary = job.salaryRange && job.salaryRange !== "Competitive" ? `💰 ${job.salaryRange}` : "";
  const lines = [
    `🚀 New AI Job Alert!`,
    ``,
    `${job.title} @ ${job.company}`,
    remote,
    salary,
    ``,
    `Apply now 👉 ${jobUrl}`,
    ``,
    hashtags,
  ].filter(Boolean);
  return lines.join("\n").slice(0, 280);
}

function buildLinkedInContent(job: JobRecord, jobUrl: string, hashtags: string): string {
  const remote = job.remote ? "🌍 Remote" : `📍 ${job.location}`;
  const salary = job.salaryRange && job.salaryRange !== "Competitive" ? `\n💰 Compensation: ${job.salaryRange}` : "";
  const tags = job.tags.length > 0 ? `\n🏷️ Skills: ${job.tags.join(" · ")}` : "";

  return [
    `🤖 AI Job Opportunity — Now Live on Global AI Hub`,
    ``,
    `We've just featured a new role that might be perfect for you or someone in your network:`,
    ``,
    `📌 Role: ${job.title}`,
    `🏢 Company: ${job.company}`,
    `${remote}${salary}${tags}`,
    ``,
    `${job.description.slice(0, 300)}${job.description.length > 300 ? "..." : ""}`,
    ``,
    `🔗 View the full listing and apply:`,
    jobUrl,
    ``,
    `Global AI Hub is your go-to platform for discovering, testing, and hiring in the AI space. Follow us for daily AI job updates!`,
    ``,
    hashtags,
  ].join("\n");
}

export async function queueSocialPosts(job: JobRecord): Promise<void> {
  const jobUrl = buildJobUrl(job);
  const hashtags = buildHashtags(job);

  const twitterContent = buildTwitterContent(job, jobUrl, hashtags);
  const linkedInContent = buildLinkedInContent(job, jobUrl, hashtags);

  const posts = [
    { platform: "twitter", content: twitterContent },
    { platform: "linkedin", content: linkedInContent },
  ];

  for (const post of posts) {
    await db
      .insert(socialPosts)
      .values({
        jobId: job.id,
        platform: post.platform,
        content: post.content,
        hashtags,
        jobUrl,
        status: "queued",
      })
      .onConflictDoNothing()
      .catch((err: unknown) => logger.error({ err, jobId: job.id, platform: post.platform }, "Failed to queue social post"));
  }

  logger.info({ jobId: job.id, jobUrl }, "Social posts queued for job");

  await attemptPostToAPIs(job.id, twitterContent, linkedInContent, jobUrl);
}

async function attemptPostToAPIs(
  jobId: string,
  twitterContent: string,
  linkedInContent: string,
  jobUrl: string,
): Promise<void> {
  const twitterToken = process.env["TWITTER_BEARER_TOKEN"];
  const twitterApiKey = process.env["TWITTER_API_KEY"];
  const twitterApiSecret = process.env["TWITTER_API_SECRET"];
  const twitterAccessToken = process.env["TWITTER_ACCESS_TOKEN"];
  const twitterAccessSecret = process.env["TWITTER_ACCESS_SECRET"];

  if (twitterToken && twitterApiKey && twitterApiSecret && twitterAccessToken && twitterAccessSecret) {
    try {
      const { default: OAuth } = await import("oauth-1.0a" as string);
      const crypto = await import("crypto");
      const oauth = new OAuth({
        consumer: { key: twitterApiKey, secret: twitterApiSecret },
        signature_method: "HMAC-SHA1",
        hash_function(base_string: string, key: string) {
          return crypto.createHmac("sha1", key).update(base_string).digest("base64");
        },
      });
      const requestData = { url: "https://api.twitter.com/2/tweets", method: "POST" };
      const token = { key: twitterAccessToken, secret: twitterAccessSecret };
      const headers = oauth.toHeader(oauth.authorize(requestData, token));

      const { default: axios } = await import("axios");
      await axios.post("https://api.twitter.com/2/tweets", { text: twitterContent }, {
        headers: { ...headers, "Content-Type": "application/json" },
        timeout: 10000,
      });

      await db.update(socialPosts)
        .set({ status: "posted", postedAt: new Date() })
        .where(eq(socialPosts.jobId, jobId))
        .catch(() => {});

      logger.info({ jobId }, "Twitter post published");
    } catch (err) {
      logger.warn({ err, jobId }, "Twitter API post failed — post remains queued");
      await db.update(socialPosts)
        .set({ status: "failed", errorMessage: String(err) })
        .where(eq(socialPosts.jobId, jobId))
        .catch(() => {});
    }
  } else {
    logger.debug({ jobId }, "Twitter API keys not set — post queued for manual review");
  }

  const liAccessToken = process.env["LINKEDIN_ACCESS_TOKEN"];
  const liPersonUrn = process.env["LINKEDIN_PERSON_URN"];

  if (liAccessToken && liPersonUrn) {
    try {
      const { default: axios } = await import("axios");
      await axios.post(
        "https://api.linkedin.com/v2/ugcPosts",
        {
          author: liPersonUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: linkedInContent },
              shareMediaCategory: "ARTICLE",
              media: [{
                status: "READY",
                originalUrl: jobUrl,
                title: { text: `New AI Job on Global AI Hub` },
              }],
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        },
        {
          headers: {
            Authorization: `Bearer ${liAccessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          timeout: 10000,
        },
      );
      logger.info({ jobId }, "LinkedIn post published");
    } catch (err) {
      logger.warn({ err, jobId }, "LinkedIn API post failed — post remains queued");
    }
  } else {
    logger.debug({ jobId }, "LinkedIn API keys not set — post queued for manual review");
  }
}

export async function getSocialPostStats(): Promise<{
  total: number;
  queued: number;
  posted: number;
  failed: number;
  byPlatform: Record<string, { queued: number; posted: number; failed: number }>;
  recentPosts: Array<{
    id: string;
    jobId: string;
    platform: string;
    status: string;
    content: string;
    hashtags: string;
    jobUrl: string;
    postedAt: string | null;
    createdAt: string;
  }>;
}> {
  type SocialPostRow = typeof socialPosts.$inferSelect;
  const all: SocialPostRow[] = await db.select().from(socialPosts).orderBy(socialPosts.createdAt).catch(() => [] as SocialPostRow[]);

  const byPlatform: Record<string, { queued: number; posted: number; failed: number }> = {};
  for (const p of all) {
    if (!byPlatform[p.platform]) byPlatform[p.platform] = { queued: 0, posted: 0, failed: 0 };
    const slot = byPlatform[p.platform]!;
    if (p.status === "posted") slot.posted++;
    else if (p.status === "failed") slot.failed++;
    else slot.queued++;
  }

  return {
    total: all.length,
    queued: all.filter((p) => p.status === "queued").length,
    posted: all.filter((p) => p.status === "posted").length,
    failed: all.filter((p) => p.status === "failed").length,
    byPlatform,
    recentPosts: all.slice(-20).reverse().map((p) => ({
      id: p.id,
      jobId: p.jobId,
      platform: p.platform,
      status: p.status,
      content: p.content.slice(0, 200),
      hashtags: p.hashtags,
      jobUrl: p.jobUrl,
      postedAt: p.postedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  };
}
