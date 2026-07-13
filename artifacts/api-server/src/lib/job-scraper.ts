import axios from "axios";
import * as cheerio from "cheerio";
import { logger } from "./logger.js";
import type { JobRecord } from "../data/jobs.js";

const ACCENTS = [
  "rgba(168,85,247,0.6)",
  "rgba(34,211,238,0.6)",
  "rgba(236,72,153,0.6)",
  "rgba(34,197,94,0.6)",
  "rgba(250,204,21,0.6)",
  "rgba(249,115,22,0.6)",
];

function accent(i: number) {
  return ACCENTS[i % ACCENTS.length]!;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

interface RawJob {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  description: string;
  tags: string[];
  hrEmail?: string;
  url?: string;
  salaryRange?: string;
}

// ── Source 1: RemoteOK RSS ────────────────────────────────────────────────────
async function scrapeRemoteOkRSS(): Promise<RawJob[]> {
  const urls = [
    "https://remoteok.com/remote-ai-jobs.rss",
    "https://remoteok.com/remote-ml-jobs.rss",
    "https://remoteok.com/remote-data-science-jobs.rss",
    "https://remoteok.com/remote-software-dev-jobs.rss",
  ];

  const results: RawJob[] = [];
  const seen = new Set<string>();

  for (const url of urls) {
    try {
      const resp = await axios.get<string>(url, {
        headers: { "User-Agent": "Mozilla/5.0 GlobalAIHub-Scraper/1.0" },
        timeout: 12000,
        responseType: "text",
      });

      const $ = cheerio.load(resp.data, { xmlMode: true });

      $("item").each((i, el) => {
        if (i >= 25) return;
        const title = $(el).find("title").text().trim();
        const desc = $(el).find("description").text().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);
        const link = $(el).find("link").text().trim() || $(el).find("guid").text().trim();

        const companyMatch = title.match(/^(.+?)\s+(?:is hiring|—|-)\s*/i);
        const company = companyMatch ? companyMatch[1]! : $(el).find("author").text().trim() || "Unknown Company";
        const cleanTitle = title.replace(/^.+?(?:is hiring|—|-)\s*/i, "").trim() || title;
        const locationEl = $(el).find("location").text().trim();
        const remote = /remote/i.test(locationEl) || /remote/i.test(title) || /remote/i.test(desc);

        if (!cleanTitle || seen.has(link)) return;
        seen.add(link);

        results.push({
          id: `rok-${Buffer.from(link || cleanTitle).toString("base64").slice(0, 14)}`,
          title: cleanTitle,
          company,
          location: locationEl || (remote ? "Remote" : "Worldwide"),
          remote,
          description: desc || "AI-focused role. See full posting for details.",
          tags: extractTags(cleanTitle + " " + desc),
          url: link || undefined,
        });
      });
    } catch (err) {
      logger.warn({ err, url }, "RemoteOK RSS feed failed");
    }
    await sleep(500);
  }

  return results;
}

// ── Source 2: Remotive API (free, no key) ────────────────────────────────────
async function scrapeRemotive(): Promise<RawJob[]> {
  try {
    const resp = await axios.get<{
      jobs: Array<{
        id: number;
        url: string;
        title: string;
        company_name: string;
        candidate_required_location: string;
        description: string;
        tags: string[];
        salary: string;
      }>;
    }>("https://remotive.com/api/remote-jobs?category=software-dev&limit=100", {
      headers: { "User-Agent": "GlobalAIHub-Scraper/1.0" },
      timeout: 15000,
    });

    const jobs = resp.data?.jobs ?? [];

    return jobs.slice(0, 80).map((j) => ({
      id: `remotive-${j.id}`,
      title: j.title,
      company: j.company_name || "Unknown Company",
      location: j.candidate_required_location || "Remote",
      remote: true,
      description: (j.description ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400),
      tags: extractTags(j.title + " " + (j.tags ?? []).join(" ")),
      url: j.url,
      salaryRange: j.salary || "Competitive",
    }));
  } catch (err) {
    logger.warn({ err }, "Remotive API failed");
    return [];
  }
}

// ── Source 3: Arbeitnow (free, no key) ───────────────────────────────────────
async function scrapeArbeitnow(): Promise<RawJob[]> {
  const results: RawJob[] = [];

  for (let page = 1; page <= 5; page++) {
    try {
      const resp = await axios.get<{
        data: Array<{
          slug: string;
          title: string;
          company_name: string;
          location: string;
          remote: boolean;
          description: string;
          tags: string[];
          url: string;
        }>;
      }>(`https://www.arbeitnow.com/api/job-board-api?page=${page}`, {
        headers: { "User-Agent": "GlobalAIHub-Scraper/1.0" },
        timeout: 12000,
      });

      const data = resp.data?.data ?? [];
      if (data.length === 0) break;

      const relevant = data.filter((j) =>
        /ai|machine learning|ml|llm|nlp|data|engineer|developer|python|typescript|software/i.test(
          j.title + " " + (j.tags ?? []).join(" "),
        ),
      );

      for (const j of relevant) {
        results.push({
          id: `arbeitnow-${j.slug}`,
          title: j.title,
          company: j.company_name || "Unknown",
          location: j.location || "Remote",
          remote: j.remote ?? false,
          description: (j.description ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400),
          tags: extractTags(j.title + " " + (j.tags ?? []).join(" ")),
          url: j.url,
        });
      }

      await sleep(400);
    } catch (err) {
      logger.warn({ err, page }, "Arbeitnow page failed");
      break;
    }
  }

  return results;
}

// ── Source 4: The Muse API (free, no key) ────────────────────────────────────
async function scrapeTheMuse(): Promise<RawJob[]> {
  const results: RawJob[] = [];
  const categories = ["Engineering", "Data Science", "IT", "Product"];

  for (const cat of categories) {
    try {
      const resp = await axios.get<{
        results: Array<{
          id: number;
          name: string;
          company: { name: string };
          locations: Array<{ name: string }>;
          refs: { landing_page: string };
          contents: string;
          levels: Array<{ name: string }>;
        }>;
      }>(
        `https://www.themuse.com/api/public/jobs?category=${encodeURIComponent(cat)}&page=0&descending=true`,
        {
          headers: { "User-Agent": "GlobalAIHub-Scraper/1.0" },
          timeout: 12000,
        },
      );

      const jobs = resp.data?.results ?? [];

      for (const j of jobs.slice(0, 30)) {
        const location = j.locations?.[0]?.name ?? "Flexible";
        const remote = /remote|flexible|anywhere/i.test(location);
        const desc = (j.contents ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);

        results.push({
          id: `muse-${j.id}`,
          title: j.name,
          company: j.company?.name ?? "Unknown",
          location,
          remote,
          description: desc || "View full posting for details.",
          tags: extractTags(j.name + " " + desc),
          url: j.refs?.landing_page,
        });
      }

      await sleep(300);
    } catch (err) {
      logger.warn({ err, cat }, "The Muse category failed");
    }
  }

  return results;
}

// ── Source 5: HackerNews Who Is Hiring ───────────────────────────────────────
async function scrapeHNWhoIsHiring(): Promise<RawJob[]> {
  const threadIds = [
    "44588025", // most recent — update monthly
    "44107575",
  ];

  const results: RawJob[] = [];

  for (const threadId of threadIds) {
    try {
      const resp = await axios.get<{ kids?: number[] }>(
        `https://hacker-news.firebaseio.com/v0/item/${threadId}.json`,
        { timeout: 8000 },
      );
      const kids = resp.data?.kids?.slice(0, 60) ?? [];

      const items = await Promise.allSettled(
        kids.map((id) =>
          axios.get<{ text?: string; by?: string }>(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
            { timeout: 6000 },
          ),
        ),
      );

      let count = 0;
      for (const r of items) {
        if (count >= 20) break;
        if (r.status !== "fulfilled") continue;
        const text = r.value.data?.text ?? "";
        if (!text || !/ai|ml|machine learning|llm|data|engineer|developer/i.test(text)) continue;

        const plain = text
          .replace(/<[^>]+>/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&#x2F;/g, "/")
          .replace(/\s+/g, " ")
          .trim();
        const titleMatch = plain.match(/^([^\|.]+(?:\|[^|.]+)?)/);
        const emailMatch = plain.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const company = r.value.data?.by ?? "Unknown";

        results.push({
          id: `hn-${threadId}-${r.value.data?.by ?? count}-${count}`,
          title: titleMatch?.[1]?.trim().slice(0, 80) ?? "AI Engineering Role",
          company,
          location: /remote/i.test(plain) ? "Remote" : "San Francisco, CA",
          remote: /remote/i.test(plain),
          description: plain.slice(0, 380),
          tags: extractTags(plain),
          hrEmail: emailMatch?.[0],
        });
        count++;
      }
    } catch (err) {
      logger.warn({ err, threadId }, "HN thread scrape failed");
    }
  }

  return results;
}

// ── Source 6: Jobicy (free, no key required) ─────────────────────────────────
async function scrapeJobicy(): Promise<RawJob[]> {
  try {
    const resp = await axios.get<{
      jobs: Array<{
        id: number;
        jobTitle: string;
        companyName: string;
        jobGeo: string;
        jobDescription: string;
        url: string;
        jobIndustry: string[];
        jobType: string[];
        annualSalaryMin?: number;
        annualSalaryMax?: number;
        salaryCurrency?: string;
      }>;
    }>("https://jobicy.com/api/v2/remote-jobs?count=100&industry=engineering", {
      headers: { "User-Agent": "GlobalAIHub-Scraper/1.0" },
      timeout: 15000,
    });

    const jobs = resp.data?.jobs ?? [];

    return jobs.map((j) => {
      const salMin = j.annualSalaryMin;
      const salMax = j.annualSalaryMax;
      const salaryRange =
        salMin && salMax
          ? `${j.salaryCurrency ?? "$"}${Math.round(salMin / 1000)}K – ${Math.round(salMax / 1000)}K`
          : "Competitive";

      return {
        id: `jobicy-${j.id}`,
        title: j.jobTitle,
        company: j.companyName || "Unknown",
        location: j.jobGeo || "Remote",
        remote: true,
        description: (j.jobDescription ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400),
        tags: extractTags(j.jobTitle + " " + (j.jobIndustry ?? []).join(" ")),
        url: j.url,
        salaryRange,
      };
    });
  } catch (err) {
    logger.warn({ err }, "Jobicy API failed");
    return [];
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export function extractTags(text: string): string[] {
  const known = [
    "Python", "TypeScript", "JavaScript", "Rust", "Go", "Java", "C++", "Scala",
    "PyTorch", "TensorFlow", "JAX", "Keras",
    "LLMs", "GPT", "RAG", "NLP", "Computer Vision", "Diffusion Models",
    "Machine Learning", "Deep Learning", "Data Science", "MLOps", "LLMOps",
    "React", "Node.js", "AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform",
    "SQL", "PostgreSQL", "MongoDB", "Redis",
    "Prompt Engineering", "Full-stack", "Backend", "Frontend",
    "Product Management", "Data Engineering", "Analytics",
  ];
  const lower = text.toLowerCase();
  return known.filter((t) => lower.includes(t.toLowerCase())).slice(0, 5);
}

export function categorise(title: string): string {
  const t = title.toLowerCase();
  if (/design|ux|ui|product design/.test(t)) return "Design";
  if (/product manager|pm |roadmap|product owner/.test(t)) return "Product";
  if (/market|growth|seo|copywrite|content|brand/.test(t)) return "Marketing";
  if (/support|customer success|account manager/.test(t)) return "Support";
  if (/data scientist|analyst|analytics|data engineer/.test(t)) return "Data & ML";
  return "Engineering";
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function scrapeJobs(): Promise<JobRecord[]> {
  logger.info("Job scraper starting — 6 sources");

  const [rok, remotive, arbeitnow, muse, hn, jobicy] = await Promise.allSettled([
    scrapeRemoteOkRSS(),
    scrapeRemotive(),
    scrapeArbeitnow(),
    scrapeTheMuse(),
    scrapeHNWhoIsHiring(),
    scrapeJobicy(),
  ]);

  const raw: RawJob[] = [
    ...(rok.status === "fulfilled" ? rok.value : []),
    ...(remotive.status === "fulfilled" ? remotive.value : []),
    ...(arbeitnow.status === "fulfilled" ? arbeitnow.value : []),
    ...(muse.status === "fulfilled" ? muse.value : []),
    ...(hn.status === "fulfilled" ? hn.value : []),
    ...(jobicy.status === "fulfilled" ? jobicy.value : []),
  ];

  if (rok.status === "rejected") logger.warn({ err: rok.reason }, "RemoteOK scrape failed");
  if (remotive.status === "rejected") logger.warn({ err: remotive.reason }, "Remotive scrape failed");
  if (arbeitnow.status === "rejected") logger.warn({ err: arbeitnow.reason }, "Arbeitnow scrape failed");
  if (muse.status === "rejected") logger.warn({ err: muse.reason }, "The Muse scrape failed");
  if (hn.status === "rejected") logger.warn({ err: hn.reason }, "HN scrape failed");
  if (jobicy.status === "rejected") logger.warn({ err: jobicy.reason }, "Jobicy scrape failed");

  logger.info({ rawCount: raw.length }, "Job scraper: raw results aggregated");

  const seen = new Set<string>();
  const jobs: JobRecord[] = [];

  raw.forEach((r, i) => {
    if (seen.has(r.id)) return;
    seen.add(r.id);
    jobs.push({
      id: r.id,
      title: r.title,
      company: r.company,
      category: categorise(r.title),
      type: "Full-time",
      location: r.location,
      remote: r.remote,
      salaryRange: r.salaryRange || "Competitive",
      description: r.description,
      tags: r.tags,
      postedAt: today(),
      accentColor: accent(i),
      hrEmail: r.hrEmail,
      outreachStatus: r.hrEmail ? "pending" : undefined,
      source: "scraped",
      url: r.url,
    });
  });

  logger.info({ count: jobs.length }, "Job scraper finished");
  return jobs;
}
