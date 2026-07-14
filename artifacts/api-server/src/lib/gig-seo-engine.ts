const AI_KEYWORDS: Record<string, string[]> = {
  "ChatGPT Prompts": ["ChatGPT prompts", "AI prompts", "GPT-4", "prompt engineering", "AI writing", "conversational AI"],
  "Midjourney/Sora": ["Midjourney prompts", "AI art", "AI image generation", "Sora video", "generative AI", "AI design"],
  "Coding": ["AI coding", "LLM development", "AI automation", "machine learning", "Python AI", "AI engineering"],
  "Business": ["AI business strategy", "AI consulting", "AI pitch deck", "business automation", "AI workflow"],
  "Marketing": ["AI marketing", "AI copywriting", "AI content", "SEO AI", "digital marketing AI"],
  "Design": ["AI design", "AI UX", "generative design", "AI graphics", "AI branding"],
};

const SOCIAL_HASHTAGS: Record<string, string[]> = {
  "ChatGPT Prompts": ["#ChatGPT", "#AIPrompts", "#PromptEngineering", "#GPT4", "#AITools"],
  "Midjourney/Sora": ["#Midjourney", "#AIArt", "#GenerativeAI", "#AIImage", "#SoraAI"],
  "Coding": ["#AICode", "#MachineLearning", "#LLMDev", "#AIDevelopment", "#Python"],
  "Business": ["#AIBusiness", "#StartupAI", "#AIConsulting", "#BusinessAI", "#Entrepreneurship"],
  "Marketing": ["#AIMarketing", "#ContentAI", "#DigitalMarketing", "#AIContent", "#GrowthHacking"],
  "Design": ["#AIDesign", "#GenerativeDesign", "#AIUX", "#CreativeAI", "#DesignAI"],
};

const BASE_HASHTAGS = ["#GlobalAIHub", "#AIGigs", "#FreelanceAI", "#Hiring"];

export interface GigSeoResult {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  hashtags: string[];
}

export function generateGigSeo(params: {
  title: string;
  sellerName: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  priceUsd: number;
}): GigSeoResult {
  const slug = buildSlug(params.title);
  const metaTitle = buildMetaTitle(params.title, params.category);
  const metaDescription = buildMetaDescription(params);
  const hashtags = buildHashtags(params.title, params.category);

  return { slug, metaTitle, metaDescription, hashtags };
}

function buildSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function buildMetaTitle(title: string, category: string): string {
  const suffix = " | Global AI Hub";
  const base = title.length + suffix.length <= 60 ? `${title}${suffix}` : `${title.slice(0, 60 - suffix.length)}…${suffix}`;
  return base.slice(0, 70);
}

function buildMetaDescription(params: {
  title: string;
  sellerName: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  priceUsd: number;
}): string {
  const keywords = AI_KEYWORDS[params.category] ?? ["AI services", "freelance AI"];
  const kw = keywords[0] ?? "AI services";

  const reviewPhrase = params.reviewCount > 0
    ? ` ⭐ ${params.rating}/5 (${params.reviewCount} reviews).`
    : "";
  const pricePhrase = ` Starting from $${params.priceUsd}.`;

  const base = `Hire ${params.sellerName} for expert ${kw}. ${params.description.slice(0, 80).trim()}…${reviewPhrase}${pricePhrase} Featured on Global AI Hub.`;

  return base.slice(0, 160);
}

function buildHashtags(title: string, category: string): string[] {
  const catTags = SOCIAL_HASHTAGS[category] ?? ["#AIServices", "#Freelance"];
  const titleWords = title
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 3)
    .map((w) => `#${w.replace(/[^a-zA-Z0-9]/g, "").replace(/^./, (c) => c.toUpperCase())}`);

  const unique = [...new Set([...BASE_HASHTAGS, ...catTags.slice(0, 4), ...titleWords])];
  return unique.slice(0, 10);
}
