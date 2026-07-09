import { Router, type IRouter } from "express";
import { toolsData, type ToolRecord } from "../data/tools";
import { semanticSearchTools } from "../lib/semanticSearch";

const router: IRouter = Router();

router.get("/tools", (req, res) => {
  const { search, domain, pricing, type } = req.query as Record<string, string | undefined>;

  let results: ToolRecord[] = toolsData;
  let intentSummary: string | undefined;

  if (search) {
    const { results: scored, intentSummary: summary } = semanticSearchTools(search, results);
    results = scored.map((s) => s.tool);
    intentSummary = summary;
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

  res.json({ tools: results, total: results.length, ...(intentSummary ? { intentSummary } : {}) });
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
