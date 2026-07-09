import type { ToolRecord } from "../data/tools";

interface IntentRule {
  label: string;
  patterns: string[];
  domains?: string[];
  outputTypes?: ToolRecord["outputTypes"][number][];
  tags?: string[];
}

/**
 * Maps natural-language intents to the domains/output types/tags most relevant to that intent.
 * This lets a free-form sentence like "I want to make a video for my shop" surface Video tools
 * even though none of those exact words appear in the tool's name or description.
 */
const INTENT_RULES: IntentRule[] = [
  {
    label: "video creation",
    patterns: ["make a video", "create a video", "video for my", "edit a video", "video editing", "video content", "shoot a video", "produce a video", "generate a video", "video ad", "promo video"],
    outputTypes: ["Video"],
    tags: ["Video Generation", "Editing"],
  },
  {
    label: "writing code",
    patterns: ["write code", "help me code", "coding help", "build an app", "programming", "debug my code", "fix a bug", "write a function", "build a website", "developer tool", "software engineer"],
    domains: ["Code AI"],
    outputTypes: ["Code"],
  },
  {
    label: "generating images / art",
    patterns: ["make an image", "create an image", "generate art", "draw a picture", "design a logo", "picture of", "illustration", "artwork", "poster design", "visual for my"],
    domains: ["Image Gen"],
    outputTypes: ["Image"],
  },
  {
    label: "voice & audio",
    patterns: ["voiceover", "text to speech", "clone my voice", "narration", "podcast audio", "audio for my", "read this aloud", "voice assistant", "generate speech"],
    domains: ["Voice AI"],
    outputTypes: ["Audio"],
  },
  {
    label: "marketing & copywriting",
    patterns: ["write an ad", "marketing copy", "blog post", "seo content", "write a caption", "ad copy", "grow my business", "social media post", "email campaign", "sell my product", "for my shop", "for my store"],
    domains: ["Marketing"],
  },
  {
    label: "graphic design",
    patterns: ["design a flyer", "make a presentation", "slide deck", "branding", "graphic design", "resize an image", "remove background", "canva"],
    domains: ["Design"],
  },
  {
    label: "research & search",
    patterns: ["research", "find information", "search the web", "fact check", "look something up", "cite sources", "answer a question"],
    domains: ["Agents"],
  },
  {
    label: "chatting / reasoning",
    patterns: ["chat with ai", "have a conversation", "brainstorm ideas", "summarize this", "explain something", "write an essay", "reasoning"],
    domains: ["LLMs"],
  },
];

export interface ScoredTool {
  tool: ToolRecord;
  score: number;
}

export interface SemanticSearchResult {
  results: ScoredTool[];
  intentSummary?: string;
}

function textScore(query: string, tool: ToolRecord): number {
  let score = 0;
  const q = query.toLowerCase();
  if (tool.name.toLowerCase().includes(q)) score += 6;
  if (tool.description.toLowerCase().includes(q)) score += 3;
  if (tool.domain.toLowerCase().includes(q)) score += 4;
  if (tool.tags.some((tag) => tag.toLowerCase().includes(q))) score += 3;

  // token overlap fallback for multi-word natural sentences
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  for (const token of tokens) {
    if (tool.name.toLowerCase().includes(token)) score += 1;
    if (tool.description.toLowerCase().includes(token)) score += 0.5;
    if (tool.tags.some((tag) => tag.toLowerCase().includes(token))) score += 1;
  }
  return score;
}

/**
 * Scores every tool against a natural-language query using direct text matching plus
 * an intent map that captures common phrasings ("make a video for my shop" -> Video tools).
 */
export function semanticSearchTools(query: string, tools: ToolRecord[]): SemanticSearchResult {
  const lower = query.toLowerCase().trim();
  if (!lower) return { results: tools.map((tool) => ({ tool, score: 0 })) };

  const matchedIntent = INTENT_RULES.find((rule) => rule.patterns.some((p) => lower.includes(p)));

  const scored = tools.map((tool) => {
    let score = textScore(lower, tool);

    if (matchedIntent) {
      if (matchedIntent.domains?.includes(tool.domain)) score += 8;
      if (matchedIntent.outputTypes?.some((ot) => tool.outputTypes.includes(ot))) score += 6;
      if (matchedIntent.tags?.some((tag) => tool.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase())))) score += 4;
    }

    return { tool, score };
  });

  const results = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  return {
    results,
    intentSummary: matchedIntent
      ? `Detected intent: ${matchedIntent.label} — showing the most relevant tools for that.`
      : undefined,
  };
}
