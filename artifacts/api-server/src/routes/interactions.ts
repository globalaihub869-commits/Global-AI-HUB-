import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { interactionsTable } from "@workspace/db";
import { eq, and, count, sql } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

function currentUserId(req: Request): string | null {
  return (req.session as { userId?: string }).userId ?? null;
}

router.get("/interactions/stats", async (req: Request, res: Response): Promise<void> => {
  const { entityId } = req.query as { entityId?: string };
  if (!entityId) {
    res.status(400).json({ error: "MISSING_PARAM", message: "entityId is required" });
    return;
  }
  const userId = currentUserId(req);

  try {
    const rows = await db
      .select({ action: interactionsTable.action, cnt: count() })
      .from(interactionsTable)
      .where(eq(interactionsTable.entityId, entityId))
      .groupBy(interactionsTable.action);

    const stats: Record<string, number> = {};
    for (const r of rows) stats[r.action] = Number(r.cnt);

    let liked = false;
    let bookmarked = false;
    if (userId) {
      const userRows = await db
        .select({ action: interactionsTable.action })
        .from(interactionsTable)
        .where(
          and(
            eq(interactionsTable.entityId, entityId),
            eq(interactionsTable.userId, userId),
            sql`${interactionsTable.action} IN ('like','bookmark')`
          )
        );
      liked = userRows.some((r) => r.action === "like");
      bookmarked = userRows.some((r) => r.action === "bookmark");
    }

    res.json({
      likes: stats["like"] ?? 0,
      comments: stats["comment"] ?? 0,
      shares: stats["share"] ?? 0,
      liked,
      bookmarked,
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch interaction stats");
    res.status(500).json({ error: "SERVER_ERROR", message: "Could not fetch stats" });
  }
});

router.get("/interactions/comments", async (req: Request, res: Response): Promise<void> => {
  const { entityId } = req.query as { entityId?: string };
  if (!entityId) {
    res.status(400).json({ error: "MISSING_PARAM", message: "entityId is required" });
    return;
  }
  try {
    const comments = await db
      .select()
      .from(interactionsTable)
      .where(and(eq(interactionsTable.entityId, entityId), eq(interactionsTable.action, "comment")));
    res.json({ comments: comments.slice(0, 50) });
  } catch (err) {
    logger.error({ err }, "Failed to fetch comments");
    res.status(500).json({ error: "SERVER_ERROR", message: "Could not fetch comments" });
  }
});

router.post("/interactions/toggle", async (req: Request, res: Response): Promise<void> => {
  const userId = currentUserId(req);
  if (!userId) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "Sign in to like or bookmark" });
    return;
  }
  const { entityId, entityType, action } = req.body as { entityId?: string; entityType?: string; action?: string };
  if (!entityId || !entityType || !action || !["like", "bookmark"].includes(action)) {
    res.status(400).json({ error: "MISSING_FIELDS", message: "entityId, entityType, and action (like|bookmark) are required" });
    return;
  }
  try {
    const existing = await db
      .select({ id: interactionsTable.id })
      .from(interactionsTable)
      .where(and(eq(interactionsTable.entityId, entityId), eq(interactionsTable.userId, userId), eq(interactionsTable.action, action)));

    if (existing.length > 0) {
      await db.delete(interactionsTable).where(eq(interactionsTable.id, existing[0]!.id));
      res.json({ toggled: false });
    } else {
      await db.insert(interactionsTable).values({ id: randomUUID(), entityType, entityId, userId, action });
      res.json({ toggled: true });
    }
  } catch (err) {
    logger.error({ err }, "Failed to toggle interaction");
    res.status(500).json({ error: "SERVER_ERROR", message: "Could not toggle" });
  }
});

router.post("/interactions/comment", async (req: Request, res: Response): Promise<void> => {
  const userId = currentUserId(req);
  if (!userId) {
    res.status(401).json({ error: "UNAUTHENTICATED", message: "Sign in to comment" });
    return;
  }
  const { entityId, entityType, content } = req.body as { entityId?: string; entityType?: string; content?: string };
  if (!entityId || !entityType || !content?.trim()) {
    res.status(400).json({ error: "MISSING_FIELDS", message: "entityId, entityType, and content are required" });
    return;
  }
  try {
    const row = await db
      .insert(interactionsTable)
      .values({ id: randomUUID(), entityType, entityId, userId, action: "comment", content: content.trim().slice(0, 500) })
      .returning();
    res.status(201).json({ comment: row[0] });
  } catch (err) {
    logger.error({ err }, "Failed to add comment");
    res.status(500).json({ error: "SERVER_ERROR", message: "Could not add comment" });
  }
});

router.post("/interactions/share", async (req: Request, res: Response): Promise<void> => {
  const userId = currentUserId(req);
  const { entityId, entityType } = req.body as { entityId?: string; entityType?: string };
  if (!entityId || !entityType) {
    res.status(400).json({ error: "MISSING_FIELDS", message: "entityId and entityType are required" });
    return;
  }
  try {
    await db.insert(interactionsTable).values({ id: randomUUID(), entityType, entityId, userId: userId ?? null, action: "share" });
    res.json({ recorded: true });
  } catch (err) {
    logger.error({ err }, "Failed to record share");
    res.status(500).json({ error: "SERVER_ERROR", message: "Could not record share" });
  }
});

export default router;
