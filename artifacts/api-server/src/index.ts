import app from "./app";
import { logger } from "./lib/logger";
import { startJobScheduler, bootstrapJobsFromDb } from "./lib/job-scheduler.js";
import { verifyMailTransporter } from "./lib/job-outreach.js";
import { jobStore } from "./routes/jobs.js";
import { bootstrapSupportStore } from "./lib/support-store.js";
import { bootstrapThreatStore } from "./lib/threat-store.js";
import { bootstrapVipEmailer } from "./lib/vip-emailer.js";
import { bootstrapConversionsStore } from "./lib/conversions-store.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Bootstrap in-memory stores from DB — runs in parallel so startup stays fast.
  Promise.all([
    bootstrapSupportStore(),
    bootstrapThreatStore(),
    bootstrapVipEmailer(),
    bootstrapConversionsStore(),
    bootstrapJobsFromDb(jobStore),
  ]).then(() => {
    logger.info("All persistent stores bootstrapped from DB");
  }).catch((err) => {
    logger.error({ err }, "Store bootstrap encountered errors — in-memory stores may be incomplete");
  });

  verifyMailTransporter().then((ok) => {
    if (ok) startJobScheduler(jobStore);
    else {
      logger.warn("Mail transporter verification failed — starting job scheduler anyway (email outreach disabled)");
      startJobScheduler(jobStore);
    }
  });
});
