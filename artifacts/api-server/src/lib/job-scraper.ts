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
}

async function scrapeRemoteOkRSS(): Promise<RawJob[]> {
  const url = "https://remoteok.com/remote-ai-jobs.rss";
  const resp = await axios.get<string>(url, {
    headers: { "User-Agent": "Mozilla/5.0 GlobalAIHub-Scraper/1.0" },
    timeout: 12000,
    responseType: "text",
  });

  const $ = cheerio.load(resp.data, { xmlMode: true });
  const results: RawJob[] = [];

  $("item").each((i, el) => {
    if (i >= 8) return;
    const title = $(el).find("title").text().trim();
    const desc = $(el).find("description").text().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
    const link = $(el).find("link").text().trim() || $(el).find("guid").text().trim();

    const companyMatch = title.match(/^(.+?)\s+(?:is hiring|—|-)\s*/i);
    const company = companyMatch ? companyMatch[1]! : $(el).find("author").text().trim() || "Unknown Company";
    const cleanTitle = title.replace(/^.+?(?:is hiring|—|-)\s*/i, "").trim() || title;

    const locationEl = $(el).find("location").text().trim();
    const remote = /remote/i.test(locationEl) || /remote/i.test(title) || /remote/i.test(desc);

    if (!cleanTitle) return;

    results.push({
      id: `scraped-rok-${Buffer.from(link || cleanTitle).toString("base64").slice(0, 12)}`,
      title: cleanTitle,
      company,
      location: locationEl || (remote ? "Remote" : "Worldwide"),
      remote,
      description: desc || "AI-focused role. See full posting for details.",
      tags: extractTags(cleanTitle + " " + desc),
      url: link || undefined,
    });
  });

  return results;
}

async function scrapeHNWhoIsHiring(): Promise<RawJob[]> {
  const url = "https://hacker-news.firebaseio.com/v0/item/44588025.json";
  try {
    const resp = await axios.get<{ kids?: number[] }>(url, { timeout: 8000 });
    const kids = resp.data?.kids?.slice(0, 30) ?? [];

    const items = await Promise.allSettled(
      kids.map((id) =>
        axios.get<{ text?: string; by?: string }>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 6000 })
      )
    );

    const results: RawJob[] = [];
    let count = 0;
    for (const r of items) {
      if (count >= 6) break;
      if (r.status !== "fulfilled") continue;
      const text = r.value.data?.text ?? "";
      if (!text || !/ai|ml|machine learning|llm|data/i.test(text)) continue;

      const plain = text.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x2F;/g, "/").replace(/\s+/g, " ").trim();
      const titleMatch = plain.match(/^([^\|.]+(?:\|[^|.]+)?)/);
      const emailMatch = plain.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const company = r.value.data?.by ?? "Unknown";

      results.push({
        id: `scraped-hn-${r.value.data?.by ?? count}-${count}`,
        title: titleMatch?.[1]?.trim().slice(0, 80) ?? "AI Engineering Role",
        company,
        location: /remote/i.test(plain) ? "Remote" : "San Francisco, CA",
        remote: /remote/i.test(plain),
        description: plain.slice(0, 280),
        tags: extractTags(plain),
        hrEmail: emailMatch?.[0],
      });
      count++;
    }
    return results;
  } catch {
    return [];
  }
}

function extractTags(text: string): string[] {
  const known = [
    "Python", "TypeScript", "JavaScript", "Rust", "Go",
    "PyTorch", "TensorFlow", "LLMs", "GPT", "RAG",
    "Machine Learning", "Data Science", "NLP", "Computer Vision",
    "React", "Node.js", "AWS", "GCP", "Azure",
    "Kubernetes", "Docker", "SQL", "Prompt Engineering",
    "LLMOps", "MLOps", "Full-stack", "Backend",
  ];
  const lower = text.toLowerCase();
  return known.filter((t) => lower.includes(t.toLowerCase())).slice(0, 4);
}

function categorise(title: string): string {
  const t = title.toLowerCase();
  if (/design|ux|ui|product design/.test(t)) return "Design";
  if (/product manager|pm |roadmap/.test(t)) return "Product";
  if (/market|growth|seo|copywrite|content/.test(t)) return "Marketing";
  if (/support|customer success/.test(t)) return "Support";
  if (/data scientist|analyst|analytics/.test(t)) return "Data & ML";
  return "Engineering";
}

export async function scrapeJobs(): Promise<JobRecord[]> {
  logger.info("Job scraper starting");

  const [rok, hn] = await Promise.allSettled([scrapeRemoteOkRSS(), scrapeHNWhoIsHiring()]);

  const raw: RawJob[] = [
    ...(rok.status === "fulfilled" ? rok.value : []),
    ...(hn.status === "fulfilled" ? hn.value : []),
  ];

  if (rok.status === "rejected") logger.warn({ err: rok.reason }, "RemoteOK scrape failed");
  if (hn.status === "rejected") logger.warn({ err: hn.reason }, "HN scrape failed");

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
      salaryRange: "Competitive",
      description: r.description,
      tags: r.tags,
      postedAt: today(),
      accentColor: accent(i),
      hrEmail: r.hrEmail,
      outreachStatus: r.hrEmail ? "pending" : undefined,
      source: "scraped",
    });
  });

  logger.info({ count: jobs.length }, "Job scraper finished");
  return jobs;
}
