import { Router, type IRouter } from "express";
import { jobsData, type JobRecord } from "../data/jobs";

const router: IRouter = Router();

let jobs: JobRecord[] = [...jobsData];
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

router.get("/jobs", (req, res) => {
  const { category, search } = req.query as Record<string, string | undefined>;
  let results = jobs;

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

router.post("/jobs", (req, res) => {
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
    return res.status(400).json({
      error: "MISSING_FIELDS",
      message: "title, company, category, type, location, salaryRange and description are required",
    });
  }
  if (!JOB_TYPES.includes(type as JobType)) {
    return res.status(400).json({ error: "INVALID_TYPE", message: `type must be one of: ${JOB_TYPES.join(", ")}` });
  }
  if (description.length < 10) {
    return res.status(400).json({ error: "DESCRIPTION_TOO_SHORT", message: "Description must be at least 10 characters" });
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
    accentColor: ACCENTS[jobs.length % ACCENTS.length]!,
  };

  jobs = [job, ...jobs];
  req.log.info({ jobId: job.id }, "job posted");
  return res.status(201).json({ job });
});

router.post("/jobs/:id/apply", (req, res) => {
  const job = jobs.find((j) => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Job not found" });
  }

  const { name, email, message } = req.body as Partial<{ name: string; email: string; message: string }>;

  if (!name || !email) {
    return res.status(400).json({ error: "MISSING_FIELDS", message: "name and email are required" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "INVALID_EMAIL", message: "Invalid email address" });
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

  return res.status(201).json({ success: true, applicationId: application.id });
});

export default router;
