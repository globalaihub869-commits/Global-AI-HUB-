import { Router, type IRouter } from "express";
import { newsData } from "../data/news";

const router: IRouter = Router();

router.get("/news", (req, res) => {
  const { search, category } = req.query as Record<string, string | undefined>;

  let results = newsData;

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.source.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)) ||
        n.summary.some((s) => s.toLowerCase().includes(q)),
    );
  }

  if (category && category !== "All") {
    results = results.filter((n) => n.category === category);
  }

  // Sort newest first
  const sorted = [...results].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const featured = newsData.find((n) => n.featured) ?? newsData[0];

  res.json({ articles: sorted, total: sorted.length, featured });
});

router.get("/news/:id", (req, res) => {
  const article = newsData.find((n) => n.id === req.params.id);
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(article);
});

export default router;
