export interface ToolRecord {
  id: string;
  name: string;
  description: string;
  domain: string;
  tags: string[];
  pricing: "Free" | "Freemium" | "Premium";
  outputTypes: ("Text" | "Image" | "Audio" | "Code" | "Video" | "Data")[];
  rating: number;
  users: string;
  verified: boolean;
  trending: boolean;
  url: string;
  accentColor: string;
}

export const toolsData: ToolRecord[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description:
      "OpenAI's flagship conversational AI. Complex reasoning, coding, creative writing, and image analysis in one powerful interface.",
    domain: "LLMs",
    tags: ["Chat", "Reasoning", "Coding", "Multimodal"],
    pricing: "Freemium",
    outputTypes: ["Text"],
    rating: 4.9,
    users: "200M+",
    verified: true,
    trending: true,
    url: "https://chat.openai.com",
    accentColor: "rgba(16,163,127,0.6)",
  },
  {
    id: "claude",
    name: "Claude",
    description:
      "Anthropic's safe, helpful assistant with a 200K context window — ideal for document analysis, research, and nuanced writing.",
    domain: "LLMs",
    tags: ["Chat", "Long Context", "Research", "Writing"],
    pricing: "Freemium",
    outputTypes: ["Text"],
    rating: 4.9,
    users: "50M+",
    verified: true,
    trending: true,
    url: "https://claude.ai",
    accentColor: "rgba(212,160,86,0.6)",
  },
  {
    id: "gemini",
    name: "Gemini",
    description:
      "Google's most capable multimodal model. Natively understands text, images, audio, video, and code from the ground up.",
    domain: "LLMs",
    tags: ["Multimodal", "Chat", "Google", "Search"],
    pricing: "Freemium",
    outputTypes: ["Text", "Image"],
    rating: 4.7,
    users: "80M+",
    verified: true,
    trending: false,
    url: "https://gemini.google.com",
    accentColor: "rgba(66,133,244,0.6)",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description:
      "The gold standard for AI art generation. Produces stunning hyper-realistic and artistic visuals from text prompts.",
    domain: "Image Gen",
    tags: ["Image Generation", "Art", "Creative", "Design"],
    pricing: "Premium",
    outputTypes: ["Image"],
    rating: 4.9,
    users: "20M+",
    verified: true,
    trending: true,
    url: "https://midjourney.com",
    accentColor: "rgba(168,85,247,0.6)",
  },
  {
    id: "cursor",
    name: "Cursor",
    description:
      "The AI-first code editor. Understands your entire codebase and accelerates development with inline generation and chat.",
    domain: "Code AI",
    tags: ["IDE", "Code Generation", "Refactoring", "Developer Tools"],
    pricing: "Freemium",
    outputTypes: ["Code"],
    rating: 4.9,
    users: "8M+",
    verified: true,
    trending: true,
    url: "https://cursor.com",
    accentColor: "rgba(139,92,246,0.6)",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description:
      "The most realistic AI voice generator. Clone any voice, produce studio-quality narration, and build voice apps via API.",
    domain: "Voice AI",
    tags: ["Text-to-Speech", "Voice Cloning", "Audio", "API"],
    pricing: "Freemium",
    outputTypes: ["Audio"],
    rating: 4.9,
    users: "12M+",
    verified: true,
    trending: true,
    url: "https://elevenlabs.io",
    accentColor: "rgba(250,204,21,0.6)",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description:
      "AI-powered search engine delivering cited, conversational answers in real-time. The future of research and discovery.",
    domain: "Agents",
    tags: ["Search", "Research", "Citations", "Real-time"],
    pricing: "Freemium",
    outputTypes: ["Text"],
    rating: 4.8,
    users: "30M+",
    verified: true,
    trending: true,
    url: "https://perplexity.ai",
    accentColor: "rgba(33,180,201,0.6)",
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    description:
      "Open-source image generation model that runs locally. Infinite customization via LoRA, ControlNet, and community models.",
    domain: "Image Gen",
    tags: ["Open Source", "Image Generation", "Local", "Customizable"],
    pricing: "Free",
    outputTypes: ["Image"],
    rating: 4.7,
    users: "15M+",
    verified: false,
    trending: false,
    url: "https://stability.ai",
    accentColor: "rgba(239,68,68,0.6)",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    description:
      "Your AI pair programmer, integrated directly in VS Code and JetBrains. Suggests code and entire functions in real-time.",
    domain: "Code AI",
    tags: ["Autocomplete", "VS Code", "JetBrains", "Developer Tools"],
    pricing: "Premium",
    outputTypes: ["Code"],
    rating: 4.8,
    users: "50M+",
    verified: true,
    trending: false,
    url: "https://github.com/features/copilot",
    accentColor: "rgba(51,51,51,0.8)",
  },
  {
    id: "runway",
    name: "Runway",
    description:
      "Leading AI video generation and editing suite. Gen-3 Alpha pushes the boundaries of what AI-generated video can achieve.",
    domain: "Image Gen",
    tags: ["Video Generation", "Editing", "Creative", "Gen-3"],
    pricing: "Freemium",
    outputTypes: ["Video", "Image"],
    rating: 4.7,
    users: "5M+",
    verified: true,
    trending: true,
    url: "https://runwayml.com",
    accentColor: "rgba(249,115,22,0.6)",
  },
  {
    id: "jasper",
    name: "Jasper",
    description:
      "AI marketing platform for brands and teams. Generate on-brand copy, blog posts, ad creatives, and SEO content at scale.",
    domain: "Marketing",
    tags: ["Copywriting", "SEO", "Marketing", "Content"],
    pricing: "Premium",
    outputTypes: ["Text"],
    rating: 4.6,
    users: "100K+",
    verified: true,
    trending: false,
    url: "https://jasper.ai",
    accentColor: "rgba(239,68,68,0.6)",
  },
  {
    id: "canva-ai",
    name: "Canva AI",
    description:
      "Graphic design platform supercharged with AI. Generate images, rewrite text, remove backgrounds, and animate slides instantly.",
    domain: "Design",
    tags: ["Design", "Templates", "Image Editing", "Presentations"],
    pricing: "Freemium",
    outputTypes: ["Image", "Text"],
    rating: 4.7,
    users: "150M+",
    verified: true,
    trending: false,
    url: "https://canva.com",
    accentColor: "rgba(0,194,168,0.6)",
  },
];
