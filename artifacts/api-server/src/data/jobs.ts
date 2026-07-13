export interface JobRecord {
  id: string;
  title: string;
  company: string;
  category: string;
  type: "Full-time" | "Part-time" | "Contract" | "Freelance";
  location: string;
  remote: boolean;
  salaryRange: string;
  description: string;
  tags: string[];
  postedAt: string;
  accentColor: string;
  hrEmail?: string;
  outreachStatus?: "pending" | "sent" | "failed";
  source?: string;
  url?: string;
}

export const JOB_CATEGORIES = [
  "Engineering",
  "Data & ML",
  "Design",
  "Product",
  "Marketing",
  "Support",
] as const;

export const jobsData: JobRecord[] = [
  {
    id: "ml-engineer-1",
    title: "Senior Machine Learning Engineer",
    company: "Nimbus AI",
    category: "Engineering",
    type: "Full-time",
    location: "San Francisco, CA",
    remote: true,
    salaryRange: "$160K – $220K",
    description:
      "Design and ship large-scale training pipelines for our next-gen multimodal models. Deep experience with PyTorch and distributed training required.",
    tags: ["PyTorch", "Distributed Systems", "LLMs"],
    postedAt: "2026-07-02",
    accentColor: "rgba(168,85,247,0.6)",
  },
  {
    id: "prompt-engineer-1",
    title: "Prompt Engineer",
    company: "Verbatim Labs",
    category: "Engineering",
    type: "Contract",
    location: "Remote",
    remote: true,
    salaryRange: "$80 – $120/hr",
    description:
      "Craft and evaluate prompts for enterprise chat assistants. Own our evaluation harness and continuously improve response quality.",
    tags: ["Prompt Engineering", "Evals", "LLMOps"],
    postedAt: "2026-06-28",
    accentColor: "rgba(34,211,238,0.6)",
  },
  {
    id: "data-scientist-1",
    title: "Data Scientist, Growth",
    company: "Pulse Analytics",
    category: "Data & ML",
    type: "Full-time",
    location: "New York, NY",
    remote: false,
    salaryRange: "$140K – $180K",
    description:
      "Own experimentation and causal inference for our growth org. Partner with product to run A/B tests that move the needle.",
    tags: ["Experimentation", "SQL", "Python"],
    postedAt: "2026-06-30",
    accentColor: "rgba(236,72,153,0.6)",
  },
  {
    id: "ux-designer-1",
    title: "Senior Product Designer, AI Tools",
    company: "Formless",
    category: "Design",
    type: "Full-time",
    location: "Remote",
    remote: true,
    salaryRange: "$130K – $165K",
    description:
      "Shape the UX of our AI-native design suite. You'll prototype in code, run user research, and set the visual language for a fast-growing product.",
    tags: ["Figma", "Prototyping", "Design Systems"],
    postedAt: "2026-07-05",
    accentColor: "rgba(34,197,94,0.6)",
  },
  {
    id: "pm-1",
    title: "Product Manager, Voice AI",
    company: "Echofy",
    category: "Product",
    type: "Full-time",
    location: "Austin, TX",
    remote: true,
    salaryRange: "$145K – $185K",
    description:
      "Lead the roadmap for our real-time voice cloning platform. Own the metrics, ship weekly, and work directly with founders.",
    tags: ["Roadmapping", "Voice AI", "0-to-1"],
    postedAt: "2026-06-25",
    accentColor: "rgba(250,204,21,0.6)",
  },
  {
    id: "growth-marketer-1",
    title: "Growth Marketing Lead",
    company: "Launchpad AI",
    category: "Marketing",
    type: "Full-time",
    location: "Remote",
    remote: true,
    salaryRange: "$110K – $150K",
    description:
      "Own paid and organic acquisition for our developer tools suite. You'll run experiments across channels and report directly to the CMO.",
    tags: ["Paid Acquisition", "SEO", "Analytics"],
    postedAt: "2026-07-01",
    accentColor: "rgba(249,115,22,0.6)",
  },
  {
    id: "support-eng-1",
    title: "Technical Support Engineer",
    company: "Global AI Hub",
    category: "Support",
    type: "Full-time",
    location: "Remote",
    remote: true,
    salaryRange: "$70K – $95K",
    description:
      "Be the front line for our developer community. Triage bugs, write docs, and help shape our self-serve support experience.",
    tags: ["Customer Support", "Debugging", "Docs"],
    postedAt: "2026-06-20",
    accentColor: "rgba(59,130,246,0.6)",
  },
  {
    id: "freelance-copy-1",
    title: "Freelance AI Copywriter",
    company: "CopyForge",
    category: "Marketing",
    type: "Freelance",
    location: "Remote",
    remote: true,
    salaryRange: "$50 – $90/hr",
    description:
      "Write landing pages, ad copy, and email sequences for AI-native brands. Flexible hours, ongoing project pipeline.",
    tags: ["Copywriting", "Landing Pages", "Email"],
    postedAt: "2026-07-06",
    accentColor: "rgba(217,70,239,0.6)",
  },
];
