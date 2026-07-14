import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { scrapedGigs } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { sendGigFeatureNotification } from "../lib/gig-aggregator-notifier.js";
import { gigAggregatorStats, refreshGigStats } from "../lib/gig-aggregator-scheduler.js";
import { scrapeTopRatedGigs } from "../lib/gig-aggregator-scraper.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

type ScrapedGigRow = typeof scrapedGigs.$inferSelect;

function rowToPayload(r: ScrapedGigRow) {
  return {
    id: r.id,
    externalId: r.externalId,
    source: r.source,
    sourceUrl: r.sourceUrl,
    title: r.title,
    sellerName: r.sellerName,
    sellerUsername: r.sellerUsername,
    sellerProfileUrl: r.sellerProfileUrl,
    sellerEmail: r.sellerEmail,
    description: r.description,
    category: r.category,
    originalPrice: Number(r.originalPrice),
    ourPrice: Number(r.ourPrice),
    rating: Number(r.rating),
    reviewCount: r.reviewCount,
    deliveryDays: r.deliveryDays,
    imageUrl: r.imageUrl,
    tags: r.tags as string[],
    status: r.status,
    slug: r.slug,
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
    hashtags: r.hashtags as string[],
    notificationSent: r.notificationSent,
    notificationSentAt: r.notificationSentAt?.toISOString() ?? null,
    publishedAt: r.publishedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

// GET /gig-aggregator/drafts — list all draft gigs
router.get("/gig-aggregator/drafts", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(scrapedGigs)
      .where(eq(scrapedGigs.status, "draft"))
      .orderBy(desc(scrapedGigs.createdAt));
    res.json({ drafts: rows.map(rowToPayload), total: rows.length });
  } catch (err) {
    logger.error({ err }, "Failed to fetch draft gigs");
    res.status(500).json({ error: "DB_ERROR", message: "Failed to fetch drafts" });
  }
});

// GET /gig-aggregator/published — list published gigs
router.get("/gig-aggregator/published", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(scrapedGigs)
      .where(eq(scrapedGigs.status, "published"))
      .orderBy(desc(scrapedGigs.publishedAt));
    res.json({ gigs: rows.map(rowToPayload), total: rows.length });
  } catch (err) {
    res.status(500).json({ error: "DB_ERROR", message: "Failed to fetch published gigs" });
  }
});

// GET /gig-aggregator/stats — source tracking + scheduler stats
router.get("/gig-aggregator/stats", async (_req: Request, res: Response): Promise<void> => {
  await refreshGigStats();
  res.json({ scheduler: gigAggregatorStats });
});

// PATCH /gig-aggregator/drafts/:id — update editable price (and optionally title/description)
router.patch("/gig-aggregator/drafts/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const body = req.body as Partial<{
    ourPrice: number;
    title: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
  }>;

  const updates: Partial<typeof scrapedGigs.$inferInsert> = {};
  if (body.ourPrice !== undefined) {
    if (typeof body.ourPrice !== "number" || body.ourPrice < 0) {
      res.status(400).json({ error: "INVALID_PRICE", message: "ourPrice must be a positive number" });
      return;
    }
    updates.ourPrice = body.ourPrice.toFixed(2);
  }
  if (body.title) updates.title = body.title.slice(0, 200);
  if (body.description) updates.description = body.description.slice(0, 1000);
  if (body.metaTitle) updates.metaTitle = body.metaTitle.slice(0, 70);
  if (body.metaDescription) updates.metaDescription = body.metaDescription.slice(0, 160);

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "NOTHING_TO_UPDATE", message: "No valid fields provided" });
    return;
  }

  try {
    const rows = await db
      .update(scrapedGigs)
      .set(updates)
      .where(and(eq(scrapedGigs.id, id), eq(scrapedGigs.status, "draft")))
      .returning();

    if (rows.length === 0) {
      res.status(404).json({ error: "NOT_FOUND", message: "Draft gig not found" });
      return;
    }
    res.json({ gig: rowToPayload(rows[0]!) });
  } catch (err) {
    logger.error({ err, id }, "Failed to update draft gig");
    res.status(500).json({ error: "DB_ERROR", message: "Update failed" });
  }
});

// POST /gig-aggregator/drafts/:id/publish — publish a draft gig + notify seller
router.post("/gig-aggregator/drafts/:id/publish", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };

  try {
    const existing = await db.select().from(scrapedGigs).where(eq(scrapedGigs.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "NOT_FOUND", message: "Draft gig not found" });
      return;
    }

    const gig = existing[0]!;
    const now = new Date();

    const rows = await db
      .update(scrapedGigs)
      .set({ status: "published", publishedAt: now })
      .where(eq(scrapedGigs.id, id))
      .returning();

    if (rows.length === 0) {
      res.status(500).json({ error: "PUBLISH_FAILED", message: "Failed to publish gig" });
      return;
    }

    // Fire seller notification (best-effort)
    let notificationResult: "sent" | "failed" | "no_email" = "no_email";
    if (gig.sellerEmail) {
      notificationResult = await sendGigFeatureNotification({
        title: gig.title,
        sellerName: gig.sellerName,
        sellerEmail: gig.sellerEmail,
        sourceUrl: gig.sourceUrl,
        ourPrice: Number(gig.ourPrice),
        slug: gig.slug,
        metaTitle: gig.metaTitle,
      });

      // Mark notification sent
      if (notificationResult === "sent") {
        await db
          .update(scrapedGigs)
          .set({ notificationSent: true, notificationSentAt: now })
          .where(eq(scrapedGigs.id, id))
          .catch(() => {});
      }
    }

    await refreshGigStats();
    req.log.info({ gigId: id, title: gig.title, notificationResult }, "Gig published");

    res.json({
      gig: rowToPayload(rows[0]!),
      notification: notificationResult,
    });
  } catch (err) {
    req.log.error({ err, id }, "Failed to publish gig");
    res.status(500).json({ error: "PUBLISH_FAILED", message: "Publish failed" });
  }
});

// POST /gig-aggregator/drafts/:id/reject — reject/discard a draft
router.post("/gig-aggregator/drafts/:id/reject", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  try {
    await db.update(scrapedGigs).set({ status: "rejected" }).where(eq(scrapedGigs.id, id));
    await refreshGigStats();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "DB_ERROR", message: "Reject failed" });
  }
});

// POST /gig-aggregator/scrape — manual scrape trigger (admin-only)
router.post("/gig-aggregator/scrape", async (req: Request, res: Response): Promise<void> => {
  req.log.info("Manual gig scrape triggered");
  try {
    const scraped = await scrapeTopRatedGigs();
    const existing = await db.select({ externalId: scrapedGigs.externalId }).from(scrapedGigs).catch(() => []);
    const existingIds = new Set(existing.map((r) => r.externalId));
    const newGigs = scraped.filter((g) => !existingIds.has(g.externalId));

    let inserted = 0;
    for (const g of newGigs) {
      const ourPrice = Math.ceil(g.originalPrice * 1.2);
      const result = await db
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
        .catch(() => null);
      if (result) inserted++;
    }

    await refreshGigStats();
    res.json({ scraped: scraped.length, inserted, stats: gigAggregatorStats });
  } catch (err) {
    req.log.error({ err }, "Manual gig scrape failed");
    res.status(500).json({ error: "SCRAPE_FAILED", message: "Manual scrape failed" });
  }
});

export default router;
