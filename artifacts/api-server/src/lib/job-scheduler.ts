import { logger } from "./logger.js";
import { scrapeJobs } from "./job-scraper.js";
import { sendOutreachEmail } from "./job-outreach.js";
import type { JobRecord } from "../data/jobs.js";

const INTERVAL_MS = 30 * 60 * 1000;

type JobStore = {
  jobs: JobRecord[];
};

export function startJobScheduler(store: JobStore): void {
  const run = async () => {
    logger.info("Job scheduler: running scrape cycle");
    try {
      const scraped = await scrapeJobs();
      const existingIds = new Set(store.jobs.map((j) => j.id));
      const newJobs = scraped.filter((j) => !existingIds.has(j.id));

      if (newJobs.length === 0) {
        logger.info("Job scheduler: no new jobs found");
        return;
      }

      store.jobs = [...newJobs, ...store.jobs];
      logger.info({ count: newJobs.length }, "Job scheduler: added new jobs");

      for (const job of newJobs) {
        if (job.hrEmail && job.outreachStatus === "pending") {
          const result = await sendOutreachEmail(job);
          job.outreachStatus = result === "sent" ? "sent" : result === "failed" ? "failed" : job.outreachStatus;
          logger.info({ jobId: job.id, result }, "Outreach email result");
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    } catch (err) {
      logger.error({ err }, "Job scheduler cycle error");
    }
  };

  run();
  setInterval(run, INTERVAL_MS);
  logger.info({ intervalMs: INTERVAL_MS }, "Job scheduler started");
}
