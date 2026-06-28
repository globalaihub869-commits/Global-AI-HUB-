import { Router, type IRouter } from "express";
import { toolsData, type ToolRecord } from "../data/tools";

const router: IRouter = Router();

router.get("/tools", (req, res) => {
  const { search, domain, pricing, type } = req.query as Record<string, string | undefined>;

  let results: ToolRecord[] = toolsData;

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.domain.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  if (domain && domain !== "All") {
    results = results.filter((t) => t.domain === domain);
  }

  if (pricing && pricing !== "All") {
    results = results.filter((t) => t.pricing === pricing);
  }

  if (type && type !== "All") {
    results = results.filter((t) => t.outputTypes.includes(type as ToolRecord["outputTypes"][number]));
  }

  res.json({ tools: results, total: results.length });
});

router.get("/tools/:id", (req, res) => {
  const tool = toolsData.find((t) => t.id === req.params.id);
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }
  res.json(tool);
});

export default router;
