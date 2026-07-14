import { logger } from "./logger.js";
import { scrapeTopRatedGigs } from "./gig-aggregator-scraper.js";
import { db } from "@workspace/db";
import { scrapedGigs } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours

export const gigAggregatorStats = {
  totalFetched: 0,
  totalNew: 0,
  totalDrafts: 0,
  totalPublished: 0,
  lastRunAt: null as string | null,
  cycles: 0,
  bySource: {} as Record<string, number>,
};

export async function bootstrapGigAggregatorStats(): Promise<void> {
  try {
    type GigRow = typeof scrapedGigs.$inferSelect;
    const all = await db.select().from(scrapedGigs).catch((): GigRow[] => []);
    gigAggregatorStats.totalFetched = all.length;
    gigAggregatorStats.totalDrafts = all.filter((g) => g.status === "draft").length;
    gigAggregatorStats.totalPublished = all.filter((g) => g.status === "published").length;
    for (const g of all) {
      gigAggregatorStats.bySource[g.source] = (gigAggregatorStats.bySource[g.source] ?? 0) + 1;
    }
    logger.info({ stats: gigAggregatorStats }, "Gig aggregator stats bootstrapped");
  } catch (err) {
    logger.error({ err }, "Failed to bootstrap gig aggregator stats");
  }
}

export function startGigAggregatorScheduler(): void {
  const run = async () => {
    gigAggregatorStats.cycles++;
    gigAggregatorStats.lastRunAt = new Date().toISOString();
    logger.info({ cycle: gigAggregatorStats.cycles }, "Gig aggregator: starting scrape cycle");

    try {
      const scraped = await scrapeTopRatedGigs();
      gigAggregatorStats.totalFetched += scraped.length;

      // Fetch existing external IDs to avoid duplicates
      const existing = await db
        .select({ externalId: scrapedGigs.externalId })
        .from(scrapedGigs)
        .catch(() => [] as { externalId: string }[]);
      const existingIds = new Set(existing.map((r) => r.externalId));

      const newGigs = scraped.filter((g) => !existingIds.has(g.externalId));
      gigAggregatorStats.totalNew += newGigs.length;

      // Persist as drafts — apply a default margin of 20%
      for (const g of newGigs) {
        const ourPrice = Math.ceil(g.originalPrice * 1.2);
        await db
          .insert(scrapedGigs)
          .values({
            externalId: g.externalId,
            source: g.source,
            sourceUrl: g.sourceUrl,
            title: g.title,
            sellerName: g.sellerName,
            sellerUsername: g.sellerUsername,
            sellerProfileUrl: g.sellerProfileUrl,
            sellerEmail: g.sellerEmail ?? null,
            description: g.description,
            category: g.category,
            originalPrice: g.originalPrice.toFixed(2),
            ourPrice: ourPrice.toFixed(2),
            rating: g.rating.toFixed(1),
            reviewCount: g.reviewCount,
            deliveryDays: g.deliveryDays,
            imageUrl: g.imageUrl ?? null,
            tags: g.tags,
            status: "draft",
            slug: g.slug,
            metaTitle: g.metaTitle,
            metaDescription: g.metaDescription,
            hashtags: g.hashtags,
          })
          .onConflictDoNothing()
          .catch((err: unknown) => logger.error({ err, externalId: g.externalId }, "Failed to insert scraped gig"));

        // Track by source
        gigAggregatorStats.bySource[g.source] = (gigAggregatorStats.bySource[g.source] ?? 0) + 1;
      }

      // Refresh counters from DB
      const allGigs = await db.select({ status: scrapedGigs.status }).from(scrapedGigs).catch((): { status: string }[] => []);
      gigAggregatorStats.totalDrafts = allGigs.filter((g) => g.status === "draft").length;
      gigAggregatorStats.totalPublished = allGigs.filter((g) => g.status === "published").length;

      logger.info({ newGigs: newGigs.length, totalDrafts: gigAggregatorStats.totalDrafts }, "Gig aggregator cycle complete");
    } catch (err) {
      logger.error({ err }, "Gig aggregator scheduler cycle error");
    }
  };

  run();
  setInterval(run, INTERVAL_MS);
  logger.info({ intervalMs: INTERVAL_MS }, "Gig aggregator scheduler started");
}

export async function refreshGigStats(): Promise<void> {
  const all = await db.select({ status: scrapedGigs.status, source: scrapedGigs.source }).from(scrapedGigs).catch((): { status: string; source: string }[] => []);
  gigAggregatorStats.totalFetched = all.length;
  gigAggregatorStats.totalDrafts = all.filter((g) => g.status === "draft").length;
  gigAggregatorStats.totalPublished = all.filter((g) => g.status === "published").length;
  const bySource: Record<string, number> = {};
  for (const g of all) bySource[g.source] = (bySource[g.source] ?? 0) + 1;
  gigAggregatorStats.bySource = bySource;
}
