import { logger } from "./logger.js";

const SPAM_TITLE_PATTERNS = [
  /work from home.*earn/i,
  /make \$\d+.*day/i,
  /unlimited.*earning/i,
  /no experience.*\$\d{4,}/i,
  /get paid.*watch/i,
  /click.*earn/i,
  /passive income/i,
  /multi.?level/i,
  /mlm/i,
  /pyramid/i,
  /crypto.*earn/i,
  /bitcoin.*job/i,
  /become.*millionaire/i,
  /secret.*system/i,
];

const SPAM_DESC_PATTERNS = [
  /wire transfer/i,
  /western union/i,
  /gift card/i,
  /send money/i,
  /advance fee/i,
  /money mule/i,
  /need your bank/i,
  /nigerian prince/i,
  /unclaimed funds/i,
  /100% commission.*no base/i,
  /pay.*training fee/i,
  /purchase.*starter kit/i,
  /no experience needed.*earn \$\d{3,}/i,
];

const SCAM_COMPANY_PATTERNS = [
  /^unknown$/i,
  /^n\/a$/i,
  /^test$/i,
  /^hiring company$/i,
  /^confidential$/i,
];

const SUSPICIOUS_SALARY_PATTERNS = [
  /\$\d{4,}\/hour/i,
  /\$[5-9]\d{4,}.*week/i,
  /earn.*\$\d{5,}.*month/i,
];

export interface QualityResult {
  score: number;
  passed: boolean;
  reason?: string;
}

export function assessJobQuality(job: {
  title: string;
  company: string;
  description: string;
  salaryRange?: string;
  hrEmail?: string;
  url?: string;
}): QualityResult {
  let score = 100;
  const reasons: string[] = [];

  for (const pat of SPAM_TITLE_PATTERNS) {
    if (pat.test(job.title)) {
      score -= 60;
      reasons.push("spam title pattern");
      break;
    }
  }

  for (const pat of SPAM_DESC_PATTERNS) {
    if (pat.test(job.description)) {
      score -= 70;
      reasons.push("spam description pattern");
      break;
    }
  }

  for (const pat of SCAM_COMPANY_PATTERNS) {
    if (pat.test(job.company.trim())) {
      score -= 40;
      reasons.push("suspicious company name");
      break;
    }
  }

  if (job.salaryRange) {
    for (const pat of SUSPICIOUS_SALARY_PATTERNS) {
      if (pat.test(job.salaryRange)) {
        score -= 30;
        reasons.push("unrealistic salary claim");
        break;
      }
    }
  }

  if (job.description.length < 80) {
    score -= 25;
    reasons.push("description too short");
  }

  if (job.title.length < 5) {
    score -= 20;
    reasons.push("title too short");
  }

  if (job.hrEmail) {
    const freeProviders = /(@gmail\.com|@yahoo\.com|@hotmail\.com|@outlook\.com)$/i;
    if (freeProviders.test(job.hrEmail)) {
      score -= 10;
      reasons.push("free email provider for HR");
    }
  }

  if (job.url) {
    score += 5;
  }

  if (job.description.length > 200) {
    score += 5;
  }

  const passed = score >= 50;

  if (!passed) {
    logger.debug({ title: job.title, score, reasons }, "Job quality filter: rejected");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    passed,
    reason: reasons.length > 0 ? reasons.join("; ") : undefined,
  };
}
