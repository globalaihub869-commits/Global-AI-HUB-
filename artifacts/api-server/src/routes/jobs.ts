import { Router, type IRouter, type Request, type Response } from "express";
import { jobsData, type JobRecord } from "../data/jobs.js";
import { recordActivity } from "../lib/social-store.js";
import { scrapeJobs } from "../lib/job-scraper.js";
import { sendOutreachEmail, sendTestEmail } from "../lib/job-outreach.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

export const jobStore: { jobs: JobRecord[] } = { jobs: [...jobsData] };
let jobCounter = 1;

interface Application {
  id: string;
  jobId: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
}

const applications: Application[] = [];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance"] as const;
type JobType = (typeof JOB_TYPES)[number];

const ACCENTS = [
  "rgba(168,85,247,0.6)",
  "rgba(34,211,238,0.6)",
  "rgba(236,72,153,0.6)",
  "rgba(34,197,94,0.6)",
  "rgba(250,204,21,0.6)",
  "rgba(249,115,22,0.6)",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get("/jobs", (req: Request, res: Response): void => {
  const { category, search } = req.query as Record<string, string | undefined>;
  let results = jobStore.jobs;

  if (category && category !== "All") {
    results = results.filter((j) => j.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  res.json({ jobs: results, total: results.length });
});

router.post("/jobs", (req: Request, res: Response): void => {
  const body = req.body as Partial<{
    title: string;
    company: string;
    category: string;
    type: string;
    location: string;
    remote: boolean;
    salaryRange: string;
    description: string;
    tags: string[];
  }>;

  const { title, company, category, type, location, salaryRange, description } = body;
  const remote = Boolean(body.remote);
  const tags = Array.isArray(body.tags) ? body.tags.slice(0, 10).map(String) : [];

  if (!title || !company || !category || !type || !location || !salaryRange || !description) {
    res.status(400).json({
      error: "MISSING_FIELDS",
      message: "title, company, category, type, location, salaryRange and description are required",
    });
    return;
  }
  if (!JOB_TYPES.includes(type as JobType)) {
    res.status(400).json({ error: "INVALID_TYPE", message: `type must be one of: ${JOB_TYPES.join(", ")}` });
    return;
  }
  if (description.length < 10) {
    res.status(400).json({ error: "DESCRIPTION_TOO_SHORT", message: "Description must be at least 10 characters" });
    return;
  }

  const job: JobRecord = {
    id: `custom-${jobCounter++}`,
    title,
    company,
    category,
    type: type as JobType,
    location,
    remote,
    salaryRange,
    description,
    tags,
    postedAt: new Date().toISOString().slice(0, 10),
    accentColor: ACCENTS[jobStore.jobs.length % ACCENTS.length]!,
    source: "manual",
  };

  jobStore.jobs = [job, ...jobStore.jobs];
  req.log.info({ jobId: job.id }, "job posted");
  recordActivity("job_posted", job.company, job.title);
  res.status(201).json({ job });
});

router.post("/jobs/:id/apply", (req: Request, res: Response): void => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const job = jobStore.jobs.find((j) => j.id === id);
  if (!job) {
    res.status(404).json({ error: "NOT_FOUND", message: "Job not found" });
    return;
  }

  const { name, email, message } = req.body as Partial<{ name: string; email: string; message: string }>;

  if (!name || !email) {
    res.status(400).json({ error: "MISSING_FIELDS", message: "name and email are required" });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: "INVALID_EMAIL", message: "Invalid email address" });
    return;
  }

  const application: Application = {
    id: `app-${applications.length + 1}`,
    jobId: job.id,
    name,
    email,
    message: message ?? "",
    submittedAt: new Date().toISOString(),
  };
  applications.push(application);
  req.log.info({ jobId: job.id, applicationId: application.id }, "job application submitted");
  recordActivity("job_applied", name, job.title);

  res.status(201).json({ success: true, applicationId: application.id });
});

router.post("/jobs/test-email", async (req: Request, res: Response): Promise<void> => {
  const { to } = req.body as { to?: string };
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    res.status(400).json({ error: "INVALID_EMAIL", message: "Provide a valid 'to' email address" });
    return;
  }
  const result = await sendTestEmail(to);
  if (result === "sent") {
    res.json({ success: true, message: `Test email sent to ${to}` });
  } else {
    res.status(500).json({ success: false, message: "Email failed — check MAIL_PASSWORD secret and server logs" });
  }
});

router.post("/jobs/scrape", async (req: Request, res: Response): Promise<void> => {
  logger.info("Manual scrape triggered via API");
  try {
    const scraped = await scrapeJobs();
    const existingIds = new Set(jobStore.jobs.map((j) => j.id));
    const newJobs = scraped.filter((j) => !existingIds.has(j.id));

    jobStore.jobs = [...newJobs, ...jobStore.jobs];

    const outreachResults: { jobId: string; status: string }[] = [];
    for (const job of newJobs) {
      if (job.hrEmail && job.outreachStatus === "pending") {
        const result = await sendOutreachEmail(job);
        job.outreachStatus = result === "sent" ? "sent" : result === "failed" ? "failed" : job.outreachStatus;
        outreachResults.push({ jobId: job.id, status: job.outreachStatus ?? "unknown" });
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    req.log.info({ newCount: newJobs.length }, "Manual scrape complete");
    res.json({ added: newJobs.length, outreach: outreachResults, jobs: newJobs });
  } catch (err) {
    req.log.error({ err }, "Manual scrape failed");
    res.status(500).json({ error: "SCRAPE_FAILED", message: "Scrape encountered an error" });
  }
});

export default router;
