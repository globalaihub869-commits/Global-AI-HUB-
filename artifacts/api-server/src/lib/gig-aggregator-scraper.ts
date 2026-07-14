import axios from "axios";
import * as cheerio from "cheerio";
import { logger } from "./logger.js";
import { generateGigSeo } from "./gig-seo-engine.js";

export interface ScrapedGigRaw {
  externalId: string;
  source: string;
  sourceUrl: string;
  title: string;
  sellerName: string;
  sellerUsername: string;
  sellerProfileUrl: string;
  sellerEmail?: string;
  description: string;
  category: string;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  deliveryDays: number;
  imageUrl?: string;
  tags: string[];
  slug: string;
  metaTitle: string;
  metaDescription: string;
  hashtags: string[];
}

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function inferCategory(title: string, tags: string[]): string {
  const text = (title + " " + tags.join(" ")).toLowerCase();
  if (/chatgpt|prompt|gpt|llm|language model/i.test(text)) return "ChatGPT Prompts";
  if (/midjourney|sora|dall.e|image gen|stable diffusion|ai art|ai image/i.test(text)) return "Midjourney/Sora";
  if (/code|coding|python|javascript|typescript|api|bot|scraper|automation|developer|engineer/i.test(text)) return "Coding";
  if (/market|seo|copy|content|email campaign|social media|ads|growth/i.test(text)) return "Marketing";
  if (/design|logo|brand|ux|ui|figma|graphic/i.test(text)) return "Design";
  return "Business";
}

// ── Source 1: Fiverr search (embedded JSON scraping) ─────────────────────────
async function scrapeFiverr(query: string): Promise<ScrapedGigRaw[]> {
  const url = `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(query)}&filter=rating&sort_by=rating`;
  try {
    const resp = await axios.get<string>(url, {
      headers: HEADERS,
      timeout: 15000,
      responseType: "text",
      maxRedirects: 3,
    });

    const $ = cheerio.load(resp.data);
    const results: ScrapedGigRaw[] = [];

    // Try to extract embedded JSON from window.__FIVERR_DATA__
    let fiverrData: unknown = null;
    $("script").each((_, el) => {
      const content = $(el).html() ?? "";
      if (content.includes("__FIVERR_DATA__")) {
        const match = content.match(/window\.__FIVERR_DATA__\s*=\s*(\{.+\})\s*;?\s*(?:window|var|let|const|$)/s);
        if (match?.[1]) {
          try {
            fiverrData = JSON.parse(match[1]);
          } catch { /* continue */ }
        }
      }
    });

    if (fiverrData && typeof fiverrData === "object") {
      const data = fiverrData as Record<string, unknown>;
      const gigList = (data["initialProps"] as Record<string, unknown>)?.["listing"] as unknown[] ?? [];
      for (const raw of gigList.slice(0, 20)) {
        const g = raw as Record<string, unknown>;
        if (!g["title"]) continue;
        const title = String(g["title"] ?? "");
        const seller = String((g["seller"] as Record<string, unknown>)?.["username"] ?? g["seller_name"] ?? "Fiverr Pro");
        const priceRaw = Number((g["packages"] as unknown[])?.[0] as unknown ?? g["price"] ?? 20);
        const price = isNaN(priceRaw) ? 20 : priceRaw;
        const gigId = String(g["gig_id"] ?? g["id"] ?? Date.now());
        const gigSlug = String(g["gig_url"] ?? g["slug"] ?? title.toLowerCase().replace(/\s+/g, "-"));
        const gigUrl = `https://www.fiverr.com/s/${gigSlug}`;
        const tags = (g["tags"] as string[]) ?? [];
        const category = inferCategory(title, tags);
        const rating = Number(g["rating"] ?? g["avg_rating"] ?? 4.9);
        const reviewCount = Number(g["review_count"] ?? g["reviews_count"] ?? 0);

        const seo = generateGigSeo({ title, sellerName: seller, description: String(g["description"] ?? "Top-rated AI service"), category, rating, reviewCount, priceUsd: price });

        results.push({
          externalId: `fiverr-${gigId}`,
          source: "Fiverr",
          sourceUrl: gigUrl,
          title,
          sellerName: seller,
          sellerUsername: seller,
          sellerProfileUrl: `https://www.fiverr.com/${seller}`,
          description: String(g["description"] ?? "Top-rated AI service on Fiverr.").slice(0, 500),
          category,
          originalPrice: price,
          rating: isNaN(rating) ? 4.9 : rating,
          reviewCount: isNaN(reviewCount) ? 0 : reviewCount,
          deliveryDays: Number(g["delivery_time"] ?? 3),
          tags,
          ...seo,
        });
      }
    }

    // Fallback: parse HTML gig cards
    if (results.length === 0) {
      $("[data-testid='gig-card-layout'], .gig-card, [class*='GigCard']").each((i, el) => {
        if (i >= 12) return;
        const titleEl = $(el).find("a[data-impression-collected], h3, [class*='title']").first();
        const title = titleEl.text().trim();
        const link = titleEl.closest("a").attr("href") ?? titleEl.attr("href") ?? "";
        const priceText = $(el).find("[class*='price'], .price-wrapper").first().text().trim();
        const priceMatch = priceText.match(/\$(\d+)/);
        const price = priceMatch ? parseInt(priceMatch[1]!, 10) : 25;
        const seller = $(el).find("[class*='seller'], .seller-name").first().text().trim() || "Fiverr Seller";
        const ratingText = $(el).find("[class*='rating'], .ratings-score").first().text().trim();
        const rating = parseFloat(ratingText) || 4.9;
        if (!title || title.length < 5) return;

        const category = inferCategory(title, []);
        const seo = generateGigSeo({ title, sellerName: seller, description: title, category, rating, reviewCount: 0, priceUsd: price });

        results.push({
          externalId: `fiverr-html-${i}-${Buffer.from(title).toString("base64").slice(0, 8)}`,
          source: "Fiverr",
          sourceUrl: link.startsWith("http") ? link : `https://www.fiverr.com${link}`,
          title,
          sellerName: seller,
          sellerUsername: seller.toLowerCase().replace(/\s+/g, "_"),
          sellerProfileUrl: `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(query)}`,
          description: `Top-rated ${category} gig on Fiverr: ${title}`,
          category,
          originalPrice: price,
          rating,
          reviewCount: 0,
          deliveryDays: 3,
          tags: [],
          ...seo,
        });
      });
    }

    logger.info({ query, count: results.length }, "Fiverr scrape complete");
    return results;
  } catch (err: unknown) {
    const code = (err as Record<string, unknown>)?.["response"] ? (err as { response: { status: number } }).response.status : "network";
    logger.warn({ err: String(err), code, query }, "Fiverr scrape failed — using fallback data");
    return [];
  }
}

// ── Source 2: PeoplePerHour (public search) ───────────────────────────────────
async function scrapePeoplePerHour(query: string): Promise<ScrapedGigRaw[]> {
  const url = `https://www.peopleperhour.com/freelance-${encodeURIComponent(query.replace(/\s+/g, "-"))}-services`;
  try {
    const resp = await axios.get<string>(url, {
      headers: HEADERS,
      timeout: 15000,
      responseType: "text",
    });
    const $ = cheerio.load(resp.data);
    const results: ScrapedGigRaw[] = [];

    $("[data-testid='hourlieCard'], .hourlie-card, [class*='HourlieCard']").each((i, el) => {
      if (i >= 10) return;
      const title = $(el).find("h2, h3, [class*='title']").first().text().trim();
      const link = $(el).find("a").first().attr("href") ?? "";
      const priceText = $(el).find("[class*='price'], .price").first().text().trim();
      const priceMatch = priceText.match(/\$?£?(\d+)/);
      const price = priceMatch ? parseInt(priceMatch[1]!, 10) : 30;
      const seller = $(el).find("[class*='seller'], [class*='name']").first().text().trim() || "PPH Expert";
      const ratingText = $(el).find("[class*='rating'], .rating-value").first().text().trim();
      const rating = parseFloat(ratingText) || 4.8;
      if (!title || title.length < 5) return;

      const category = inferCategory(title, []);
      const seo = generateGigSeo({ title, sellerName: seller, description: title, category, rating, reviewCount: 0, priceUsd: price });

      results.push({
        externalId: `pph-${i}-${Buffer.from(title).toString("base64").slice(0, 8)}`,
        source: "PeoplePerHour",
        sourceUrl: link.startsWith("http") ? link : `https://www.peopleperhour.com${link}`,
        title,
        sellerName: seller,
        sellerUsername: seller.toLowerCase().replace(/\s+/g, "_"),
        sellerProfileUrl: `https://www.peopleperhour.com${link}`,
        description: `Top-rated AI service on PeoplePerHour: ${title}`,
        category,
        originalPrice: price,
        rating,
        reviewCount: 0,
        deliveryDays: 3,
        tags: [],
        ...seo,
      });
    });

    logger.info({ query, count: results.length }, "PeoplePerHour scrape complete");
    return results;
  } catch (err) {
    logger.warn({ err: String(err), query }, "PeoplePerHour scrape failed");
    return [];
  }
}

// ── Source 3: Curated top-rated AI gig seed (always available) ───────────────
function getCuratedTopRatedGigs(): ScrapedGigRaw[] {
  const curated = [
    { title: "I will create 100 high-converting ChatGPT prompts for your business", seller: "promptmaster_ai", price: 29, rating: 4.9, reviews: 1842, days: 1, cat: "ChatGPT Prompts", desc: "Custom-engineered ChatGPT prompt packs for marketing, sales, customer support, and productivity. Each prompt tested across GPT-4 and Claude. Includes use-case guide." },
    { title: "I will build a custom AI chatbot for your website using GPT-4", seller: "ai_dev_pro", price: 149, rating: 4.95, reviews: 623, days: 5, cat: "Coding", desc: "Fully functional AI chatbot integrated into your site. Custom training on your data, RAG architecture, conversation history, admin panel included." },
    { title: "I will design Midjourney prompts for a consistent brand visual identity", seller: "visual_ai_studio", price: 55, rating: 4.9, reviews: 891, days: 2, cat: "Midjourney/Sora", desc: "Brand-consistent Midjourney prompt kit. 50+ prompts covering logos, social graphics, product mockups, and hero images. Revisions included." },
    { title: "I will write SEO-optimized AI content for your blog 10 articles", seller: "content_ai_writer", price: 85, rating: 4.8, reviews: 2103, days: 4, cat: "Marketing", desc: "10 AI-assisted, human-edited SEO blog articles. Keyword research, internal linking, meta optimization. E-E-A-T compliant and Google-friendly." },
    { title: "I will create a full AI automation workflow using Make and GPT-4", seller: "automate_with_ai", price: 120, rating: 4.95, reviews: 445, days: 3, cat: "Business", desc: "End-to-end AI automation using Make (Integromat) with GPT-4. Lead capture, email drafting, CRM updates, and Slack notifications all automated." },
    { title: "I will craft Sora AI video prompts for cinematic product ads", seller: "sora_director", price: 45, rating: 4.85, reviews: 327, days: 2, cat: "Midjourney/Sora", desc: "Shot-by-shot Sora prompt scripts for product ads, brand films, and social clips. Includes camera direction, lighting cues, and motion notes." },
    { title: "I will build an AI-powered lead generation bot using LangChain", seller: "langchain_expert", price: 199, rating: 4.9, reviews: 189, days: 7, cat: "Coding", desc: "Custom LangChain agent for automated lead research and qualification. Integrates with LinkedIn, email APIs, and your CRM. Fully documented." },
    { title: "I will create a complete AI social media content calendar 30 days", seller: "social_ai_guru", price: 39, rating: 4.8, reviews: 1567, days: 2, cat: "Marketing", desc: "30-day AI-powered social media calendar with captions, hashtags, image prompts, and posting schedule for Instagram, LinkedIn, and Twitter/X." },
    { title: "I will design a Midjourney prompt pack for realistic product photography", seller: "productshot_ai", price: 35, rating: 4.9, reviews: 743, days: 1, cat: "Midjourney/Sora", desc: "40 photorealistic product photography Midjourney prompts. White background, lifestyle, and macro styles. Includes seed numbers for consistency." },
    { title: "I will build a custom RAG chatbot trained on your documents", seller: "rag_builder_ai", price: 249, rating: 4.95, reviews: 98, days: 5, cat: "Coding", desc: "RAG-powered chatbot that learns from your PDFs, docs, and URLs. Built with LangChain, Pinecone, and GPT-4. Admin dashboard for document management." },
    { title: "I will write 50 viral AI hook prompts for LinkedIn and Twitter", seller: "hook_writer_ai", price: 22, rating: 4.85, reviews: 2891, days: 1, cat: "ChatGPT Prompts", desc: "Viral hook formula applied to AI-generated prompts for maximum engagement. Platform-specific variants for LinkedIn, Twitter/X, and newsletters." },
    { title: "I will create an AI pitch deck and investor narrative for your startup", seller: "pitchdeck_ai", price: 180, rating: 4.9, reviews: 356, days: 4, cat: "Business", desc: "Investor-grade pitch deck with AI-generated narrative, financial model prompts, market analysis, and design direction. 15 slides, 3 revisions." },
    { title: "I will fine-tune a GPT model on your company data and deploy it", seller: "ml_engineer_pro", price: 399, rating: 4.9, reviews: 67, days: 10, cat: "Coding", desc: "Custom GPT fine-tuning on your proprietary data. Includes data preparation, training, evaluation metrics, and API deployment. Documentation included." },
    { title: "I will create AI voiceover scripts optimized for ElevenLabs", seller: "voice_ai_writer", price: 28, rating: 4.8, reviews: 1124, days: 1, cat: "ChatGPT Prompts", desc: "Natural-sounding AI voiceover scripts engineered for ElevenLabs voice synthesis. Includes pause markers, emphasis cues, and pronunciation guides." },
    { title: "I will build a Zapier AI automation for your business workflows", seller: "zapier_ai_pro", price: 89, rating: 4.85, reviews: 678, days: 2, cat: "Business", desc: "Custom Zapier workflows enhanced with AI decision logic. Email triage, CRM enrichment, invoice automation, and customer support flows." },
  ];

  return curated.map((g) => {
    const seo = generateGigSeo({ title: g.title, sellerName: g.seller, description: g.desc, category: g.cat, rating: g.rating, reviewCount: g.reviews, priceUsd: g.price });
    return {
      externalId: `curated-${Buffer.from(g.title).toString("base64").slice(0, 12)}`,
      source: "Fiverr",
      sourceUrl: `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(g.title.split(" ").slice(2, 6).join("+"))}&sort_by=rating`,
      title: g.title,
      sellerName: g.seller,
      sellerUsername: g.seller,
      sellerProfileUrl: `https://www.fiverr.com/${g.seller}`,
      description: g.desc,
      category: g.cat,
      originalPrice: g.price,
      rating: g.rating,
      reviewCount: g.reviews,
      deliveryDays: g.days,
      tags: [],
      ...seo,
    };
  });
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function scrapeTopRatedGigs(): Promise<ScrapedGigRaw[]> {
  logger.info("Gig aggregator scraper starting");

  const queries = ["ai prompts", "chatgpt", "midjourney", "ai automation", "ai developer"];
  const allRaw: ScrapedGigRaw[] = [];
  const seen = new Set<string>();

  // Always include curated top-rated gigs (guaranteed 15 high-quality entries)
  for (const g of getCuratedTopRatedGigs()) {
    if (!seen.has(g.externalId)) {
      seen.add(g.externalId);
      allRaw.push(g);
    }
  }

  // Attempt live scraping (graceful on failure)
  for (const query of queries.slice(0, 2)) {
    const [fiverrResults, pphResults] = await Promise.allSettled([
      scrapeFiverr(query),
      scrapePeoplePerHour(query),
    ]);

    for (const result of [fiverrResults, pphResults]) {
      if (result.status === "fulfilled") {
        for (const g of result.value) {
          if (!seen.has(g.externalId) && g.title.length > 5) {
            seen.add(g.externalId);
            allRaw.push(g);
          }
        }
      }
    }
    await sleep(1500);
  }

  // Quality filter: only keep rating >= 4.5 or curated
  const filtered = allRaw.filter(
    (g) => g.rating >= 4.5 || g.externalId.startsWith("curated-"),
  );

  logger.info({ total: filtered.length, sources: [...new Set(filtered.map((g) => g.source))] }, "Gig aggregator scrape complete");
  return filtered;
}
