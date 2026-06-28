export type NewsCategory =
  | "Models"
  | "Funding"
  | "Research"
  | "Regulation"
  | "Releases"
  | "Hardware"
  | "Open Source"
  | "Industry";

export interface NewsDigest {
  id: string;
  title: string;
  category: NewsCategory;
  source: string;
  sourceUrl: string;
  publishedAt: string; // ISO 8601
  featured: boolean;
  readTimeMinutes: number;
  /** Exactly 3 AI-generated summary bullet points */
  summary: [string, string, string];
  tags: string[];
}

export const newsData: NewsDigest[] = [
  {
    id: "gpt-4o-multimodal",
    title: "OpenAI Launches GPT-4o with Real-Time Voice and Native Multimodal Reasoning",
    category: "Models",
    source: "The Verge",
    sourceUrl: "https://theverge.com",
    publishedAt: "2026-06-28T08:00:00Z",
    featured: true,
    readTimeMinutes: 4,
    summary: [
      "GPT-4o is OpenAI's new flagship model that natively processes text, audio, and images in a single unified model — eliminating latency of the old pipeline approach.",
      "Real-time voice mode enables near-instant conversational responses with emotional tone detection, allowing the model to laugh, pause, and adapt cadence mid-conversation.",
      "GPT-4o is free for all ChatGPT users at 5× faster inference than GPT-4 Turbo, with API pricing reduced by 50% making it the most accessible frontier model to date.",
    ],
    tags: ["OpenAI", "GPT-4o", "Multimodal", "Voice AI"],
  },
  {
    id: "anthropic-4b-raise",
    title: "Anthropic Closes $4B Round Led by Amazon to Accelerate Claude Development",
    category: "Funding",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com",
    publishedAt: "2026-06-27T14:00:00Z",
    featured: true,
    readTimeMinutes: 3,
    summary: [
      "Anthropic has secured a $4 billion strategic investment from Amazon Web Services, making AWS the primary cloud and training partner for all future Claude model generations.",
      "The deal grants AWS customers priority API access and enterprise SLAs for Claude, intensifying the cloud AI platform wars against Microsoft's OpenAI exclusivity agreement.",
      "Anthropic's total funding now exceeds $7.3 billion, positioning it as the best-capitalized AI safety-focused lab globally, with a reported valuation of $18 billion.",
    ],
    tags: ["Anthropic", "Claude", "Funding", "Amazon"],
  },
  {
    id: "eu-ai-act-law",
    title: "EU AI Act Officially Enters Into Force — What Every AI Builder Needs to Know",
    category: "Regulation",
    source: "Reuters",
    sourceUrl: "https://reuters.com",
    publishedAt: "2026-06-26T10:00:00Z",
    featured: false,
    readTimeMinutes: 5,
    summary: [
      "The EU AI Act is now legally binding, classifying AI systems into risk tiers — unacceptable, high, limited, and minimal — with fines up to €35M or 7% of global revenue for violations.",
      "High-risk AI systems in hiring, credit scoring, and critical infrastructure must pass conformity assessments and maintain technical documentation before EU market deployment.",
      "General-purpose AI models exceeding 10²³ FLOPs of training compute face additional systemic risk obligations including red-teaming, incident reporting, and model evaluations.",
    ],
    tags: ["EU AI Act", "Regulation", "Compliance", "Policy"],
  },
  {
    id: "deepmind-alphafold3",
    title: "Google DeepMind Releases AlphaFold 3 — Predicting All Life's Molecules",
    category: "Research",
    source: "Nature",
    sourceUrl: "https://nature.com",
    publishedAt: "2026-06-25T09:00:00Z",
    featured: true,
    readTimeMinutes: 6,
    summary: [
      "AlphaFold 3 extends beyond proteins to predict the structure of DNA, RNA, ligands, and their interactions — enabling end-to-end virtual drug discovery pipelines for the first time.",
      "The model achieved a 76% accuracy improvement on PoseBusters benchmark for small molecule docking, dramatically reducing wet-lab screening costs in early-stage pharmaceutical research.",
      "DeepMind is offering free non-commercial access via the AlphaFold Server while restricting commercial use to approved partners, sparking debate in the open-science community.",
    ],
    tags: ["DeepMind", "AlphaFold", "Drug Discovery", "Research"],
  },
  {
    id: "mistral-8x22b",
    title: "Mistral AI Open-Sources Mixtral 8x22B — A New Open-Weight Frontier",
    category: "Open Source",
    source: "VentureBeat",
    sourceUrl: "https://venturebeat.com",
    publishedAt: "2026-06-24T11:00:00Z",
    featured: false,
    readTimeMinutes: 3,
    summary: [
      "Mistral's Mixtral 8x22B uses a sparse Mixture-of-Experts architecture that activates only 39B of its 141B total parameters per token, delivering frontier performance at mid-tier inference cost.",
      "Benchmarks show Mixtral 8x22B outperforms LLaMA 3 70B on coding and math while matching GPT-4 Turbo on MMLU — the first open model to reach this threshold.",
      "Released under Apache 2.0, the weights are freely downloadable for commercial use, positioning Mistral as the primary challenger to Meta in the open-weight model ecosystem.",
    ],
    tags: ["Mistral", "Open Source", "MoE", "LLM"],
  },
  {
    id: "nvidia-blackwell",
    title: "Nvidia's Blackwell B200 GPU Ships to Hyperscalers — 4× Faster Than H100",
    category: "Hardware",
    source: "Ars Technica",
    sourceUrl: "https://arstechnica.com",
    publishedAt: "2026-06-23T16:00:00Z",
    featured: false,
    readTimeMinutes: 4,
    summary: [
      "Nvidia's Blackwell B200 GPU delivers 20 petaflops of FP4 compute and a 192GB HBM3e memory pool, enabling trillion-parameter model training and inference within a single server rack.",
      "The B200 consumes up to 1,000W TDP per chip, requiring new liquid cooling infrastructure — a significant capex investment that Nvidia estimates will cost data centers $3–5M per rack.",
      "Microsoft, Google, Amazon, and Oracle have collectively pre-ordered more than 400,000 B200 units for 2026 delivery, signaling the largest AI infrastructure investment cycle in history.",
    ],
    tags: ["Nvidia", "Blackwell", "GPU", "Hardware"],
  },
  {
    id: "sora-public-launch",
    title: "OpenAI Sora Exits Waitlist — Full Public Access Rolls Out to ChatGPT Plus",
    category: "Releases",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com",
    publishedAt: "2026-06-22T13:00:00Z",
    featured: false,
    readTimeMinutes: 3,
    summary: [
      "Sora is now available to all ChatGPT Plus and Team subscribers, supporting generation of 1080p videos up to 60 seconds from text, image, or existing video inputs.",
      "New features include the Storyboard editor for frame-by-frame prompt control, a remix tool to re-skin existing videos, and a loop mode for seamlessly repeating social-media clips.",
      "OpenAI imposed strict content policies blocking political figures and realistic depictions of violence, with a C2PA watermark invisibly embedded in all Sora-generated videos.",
    ],
    tags: ["OpenAI", "Sora", "Video Generation", "Releases"],
  },
  {
    id: "open-source-benchmark",
    title: "LMSYS Leaderboard: Open-Source Models Now Match GPT-4 on 60% of Tasks",
    category: "Research",
    source: "Hugging Face Blog",
    sourceUrl: "https://huggingface.co",
    publishedAt: "2026-06-21T10:00:00Z",
    featured: false,
    readTimeMinutes: 4,
    summary: [
      "The latest LMSYS Chatbot Arena Elo rankings show Llama 3 70B and Mistral 8x22B scoring within 40 Elo points of GPT-4o — a gap that has closed by 180 points in just 12 months.",
      "Researchers attribute the rapid convergence to better synthetic data pipelines, direct preference optimization (DPO), and the open publication of scaling laws by academic labs.",
      "The findings suggest the moat for proprietary frontier models is narrowing to context length, multimodality, and post-training alignment — not raw reasoning capability.",
    ],
    tags: ["Benchmarks", "Open Source", "LLaMA", "Research"],
  },
  {
    id: "apple-on-device-ai",
    title: "Apple Intelligence Expands — On-Device LLM Now Runs on iPhone 15 Pro",
    category: "Hardware",
    source: "Bloomberg",
    sourceUrl: "https://bloomberg.com",
    publishedAt: "2026-06-20T09:00:00Z",
    featured: false,
    readTimeMinutes: 3,
    summary: [
      "Apple Intelligence's 3B parameter on-device model now runs natively on A17 Pro and M-series chips, enabling Siri rewrites, email summaries, and photo editing without any cloud calls.",
      "Private Cloud Compute routes sensitive requests to Apple-managed servers using end-to-end encryption and hardware attestation, giving users privacy guarantees no other AI assistant offers.",
      "Integration with ChatGPT via an opt-in toggle allows Apple Intelligence to hand off complex requests to OpenAI's servers, with explicit user consent required for every session.",
    ],
    tags: ["Apple", "On-Device AI", "Privacy", "iPhone"],
  },
  {
    id: "runway-gen3",
    title: "Runway Gen-3 Alpha Redefines AI Video — Directors Take Notice",
    category: "Releases",
    source: "Wired",
    sourceUrl: "https://wired.com",
    publishedAt: "2026-06-19T15:00:00Z",
    featured: false,
    readTimeMinutes: 3,
    summary: [
      "Runway's Gen-3 Alpha produces 10-second 1080p video clips with dramatically improved temporal consistency, lighting coherence, and human motion quality over its Gen-2 predecessor.",
      "Early access tests by professional directors at major studios showed Gen-3 reducing pre-visualization costs by up to 70%, with the model accurately interpreting cinematic camera direction prompts.",
      "Runway is developing Act One, a character animation tool that maps facial performance from a webcam onto generated characters — a potential disruptor to traditional motion-capture workflows.",
    ],
    tags: ["Runway", "Video Generation", "Generative AI", "Film"],
  },
  {
    id: "perplexity-series-b",
    title: "Perplexity AI Raises $250M at $3B Valuation as Search Wars Intensify",
    category: "Funding",
    source: "The Information",
    sourceUrl: "https://theinformation.com",
    publishedAt: "2026-06-18T12:00:00Z",
    featured: false,
    readTimeMinutes: 3,
    summary: [
      "Perplexity AI closed a $250M Series B led by IVP and NVIDIA, reaching a $3B valuation just 18 months after launch and reporting 10M daily active users — up from 2M six months prior.",
      "The company is building Perplexity Pages, a long-form research publishing platform, and an API tier aimed at enterprises that want cited AI-generated content for internal knowledge bases.",
      "Google responded within weeks by accelerating the rollout of AI Overviews to 200 countries, signaling that the search incumbent views Perplexity as a credible threat to its core business.",
    ],
    tags: ["Perplexity", "Funding", "Search", "AI Startup"],
  },
  {
    id: "meta-llama3-release",
    title: "Meta Releases Llama 3 with 400B Parameter Variant — Largest Open Model Ever",
    category: "Open Source",
    source: "Meta AI Blog",
    sourceUrl: "https://ai.meta.com",
    publishedAt: "2026-06-17T11:00:00Z",
    featured: false,
    readTimeMinutes: 4,
    summary: [
      "Meta's Llama 3 family includes 8B, 70B, and a 400B parameter model — the largest openly released LLM to date — available for download under Meta's custom community license.",
      "Llama 3 400B scores 87.3% on MMLU and 72.6% on HumanEval, surpassing GPT-4 on several coding and reasoning benchmarks while remaining fully open for fine-tuning.",
      "Meta's aggressive open-source strategy is designed to commoditize the model layer, steering enterprise AI spend toward Meta's advertising and infrastructure products rather than model APIs.",
    ],
    tags: ["Meta", "LLaMA 3", "Open Source", "400B"],
  },
];
