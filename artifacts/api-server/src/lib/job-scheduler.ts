import { logger } from "./logger.js";
import { scrapeJobs } from "./job-scraper.js";
import { sendOutreachEmail } from "./job-outreach.js";
import { assessJobQuality } from "./job-quality-filter.js";
import { queueSocialPosts } from "./social-poster.js";
import { db } from "@workspace/db";
import { jobs as jobsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { JobRecord } from "../data/jobs.js";

const INTERVAL_MS = 30 * 60 * 1000;

export const jobStats = {
  totalScraped: 0,
  totalAccepted: 0,
  totalRejected: 0,
  emailsSent: 0,
  emailsFailed: 0,
  socialPostsQueued: 0,
  lastRunAt: null as string | null,
  lastRunAdded: 0,
  cycles: 0,
};

type JobStore = {
  jobs: JobRecord[];
};

export async function bootstrapJobsFromDb(store: JobStore): Promise<void> {
  try {
    const rows = await db.select().from(jobsTable).orderBy(jobsTable.createdAt);
    const loaded: JobRecord[] = rows
      .filter((r) => !r.rejected)
      .map((r) => ({
        id: r.id,
        title: r.title,
        company: r.company,
        category: r.category,
        type: r.type as JobRecord["type"],
        location: r.location,
        remote: r.remote,
        salaryRange: r.salaryRange,
        description: r.description,
        tags: (r.tags as string[]) ?? [],
        postedAt: r.postedAt,
        accentColor: r.accentColor,
        hrEmail: r.hrEmail ?? undefined,
        outreachStatus: (r.outreachStatus as JobRecord["outreachStatus"]) ?? undefined,
        source: r.source,
        url: r.url ?? undefined,
      }));

    const existingIds = new Set(store.jobs.map((j) => j.id));
    const fresh = loaded.filter((j) => !existingIds.has(j.id));
    store.jobs = [...store.jobs, ...fresh];

    jobStats.totalAccepted = store.jobs.filter((j) => j.source === "scraped").length;
    logger.info({ loaded: fresh.length, total: store.jobs.length }, "Jobs bootstrapped from DB");
  } catch (err) {
    logger.error({ err }, "Failed to bootstrap jobs from DB");
  }
}

export function startJobScheduler(store: JobStore): void {
  const run = async () => {
    logger.info({ cycle: jobStats.cycles + 1 }, "Job scheduler: running scrape cycle");
    jobStats.cycles++;
    jobStats.lastRunAt = new Date().toISOString();

    try {
      const scraped = await scrapeJobs();
      jobStats.totalScraped += scraped.length;

      const existingIds = new Set(store.jobs.map((j) => j.id));

      const trulyNew = scraped.filter((j) => !existingIds.has(j.id));
      if (trulyNew.length === 0) {
        logger.info("Job scheduler: no new jobs found this cycle");
        jobStats.lastRunAdded = 0;
        return;
      }

      const accepted: JobRecord[] = [];
      const rejected: { job: JobRecord; reason: string }[] = [];

      for (const job of trulyNew) {
        const quality = assessJobQuality({
          title: job.title,
          company: job.company,
          description: job.description,
          salaryRange: job.salaryRange,
          hrEmail: job.hrEmail,
          url: job.url,
        });

        if (quality.passed) {
          accepted.push(job);
        } else {
          rejected.push({ job, reason: quality.reason ?? "quality filter" });
        }

        // Persist to DB (both accepted and rejected for audit)
        await db
          .insert(jobsTable)
          .values({
            id: job.id,
            title: job.title,
            company: job.company,
            category: job.category,
            type: job.type,
            location: job.location,
            remote: job.remote,
            salaryRange: job.salaryRange,
            description: job.description,
            tags: job.tags,
            postedAt: job.postedAt,
            accentColor: job.accentColor,
            hrEmail: job.hrEmail ?? null,
            outreachStatus: job.outreachStatus ?? null,
            source: job.source,
            qualityScore: quality.score,
            rejected: !quality.passed,
            rejectedReason: quality.reason ?? null,
            url: job.url ?? null,
          })
          .onConflictDoUpdate({
            target: jobsTable.id,
            set: { outreachStatus: job.outreachStatus ?? null },
          })
          .catch((err: unknown) => logger.error({ err, jobId: job.id }, "Failed to persist job to DB"));
      }

      jobStats.totalAccepted += accepted.length;
      jobStats.totalRejected += rejected.length;
      jobStats.lastRunAdded = accepted.length;

      store.jobs = [...accepted, ...store.jobs];
      logger.info({ accepted: accepted.length, rejected: rejected.length }, "Job scheduler: quality filter applied");

      // Outreach emails + social posts for new accepted jobs
      for (const job of accepted) {
        // Email outreach
        if (job.hrEmail && job.outreachStatus === "pending") {
          const result = await sendOutreachEmail(job);
          job.outreachStatus = result === "sent" ? "sent" : result === "failed" ? "failed" : job.outreachStatus;

          await db
            .update(jobsTable)
            .set({ outreachStatus: job.outreachStatus ?? null })
            .where(eq(jobsTable.id, job.id))
            .catch((err: unknown) => logger.error({ err }, "Failed to update outreach status"));

          if (result === "sent") jobStats.emailsSent++;
          else if (result === "failed") jobStats.emailsFailed++;

          logger.info({ jobId: job.id, result }, "Outreach email result");
          await sleep(1200);
        }

        // Social media posts
        await queueSocialPosts(job).catch((err) =>
          logger.warn({ err, jobId: job.id }, "Social post queue failed"),
        );
        jobStats.socialPostsQueued += 2; // twitter + linkedin
        await sleep(200);
      }
    } catch (err) {
      logger.error({ err }, "Job scheduler cycle error");
    }
  };

  run();
  setInterval(run, INTERVAL_MS);
  logger.info({ intervalMs: INTERVAL_MS }, "Job scheduler started");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
