import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mic, MicOff, ChevronRight, Sparkles, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* ─── Types ────────────────────────────────────────────────────────────────── */

type AvatarState = "idle" | "listening" | "thinking" | "talking";

interface Action {
  label: string;
  href: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: Action[];
  partial?: boolean;
}

/* ─── Knowledge Base ───────────────────────────────────────────────────────── */

interface KBEntry {
  patterns: string[];
  response: string;
  actions?: Action[];
}

const KB: KBEntry[] = [
  {
    patterns: ["hello", "hi", "hey", "greet", "good morning", "good afternoon", "sup", "what's up", "howdy"],
    response: "Hey there! 👋 I'm **Aria**, your AI guide to Global AI Hub — the world's most comprehensive AI command center. I can help you discover tools, navigate the site, understand features, or answer anything about AI. What would you like to explore?",
    actions: [{ label: "Browse AI Tools", href: "/tools" }, { label: "Latest AI News", href: "/news" }],
  },
  {
    patterns: ["what is this", "about this site", "what is global ai hub", "what does this do", "tell me about", "explain this site"],
    response: "**Global AI Hub** is your real-time command center for everything AI. 🌐\n\nWe track **2,400+ AI tools** across every category, publish a daily **AI news digest** (3-bullet summaries per story), maintain a **models leaderboard** comparing the top LLMs and image models, and offer a **personalized feed** that adapts to whether you're a developer, business owner, or student. All in one dark, beautiful interface.",
    actions: [{ label: "Explore Tools", href: "/tools" }, { label: "AI News Hub", href: "/news" }, { label: "Models Leaderboard", href: "/models" }],
  },
  {
    patterns: ["tool", "ai tool", "software", "app", "directory", "find tool", "discover"],
    response: "The **AI Tools Directory** 🔧 is one of our flagship features. It indexes 2,400+ tools across categories like:\n\n• **LLMs** — ChatGPT, Claude, Gemini\n• **Code AI** — Cursor, GitHub Copilot\n• **Image Gen** — Midjourney, DALL-E 3\n• **Voice AI**, **Agents**, **Marketing**, **Design**, and more\n\nYou can filter by pricing (Free / Freemium / Premium), output type (Text, Image, Audio, Code, Video), and sort by popularity or rating.",
    actions: [{ label: "Open Tools Directory", href: "/tools" }],
  },
  {
    patterns: ["news", "article", "digest", "latest", "update", "recent", "feed"],
    response: "The **AI News Hub** 📰 curates breaking AI stories from across the web and distils each one into exactly **3 bullet points** — so you get the signal, not the noise.\n\nStories are tagged by category: **Models, Funding, Research, Regulation, Releases, Hardware, Open Source**, and **Industry**. You can filter by category or search by keyword. Featured stories get an expanded view at the top.",
    actions: [{ label: "Read AI News", href: "/news" }],
  },
  {
    patterns: ["model", "leaderboard", "benchmark", "gpt", "claude", "gemini", "llama", "score", "rank"],
    response: "The **Models Leaderboard** 🏆 compares the top foundation models head-to-head across key metrics:\n\n• **Model name & provider**\n• **Type** (LLM, Multimodal, Image, Audio, Video)\n• **Context window** (from 8K to 2M tokens)\n• **Open Source** status\n• **Benchmark score** — sortable!\n\nCurrently Sora leads at 98.0, followed by ElevenLabs v2 (96.5) and Midjourney v6 (95.0).",
    actions: [{ label: "View Leaderboard", href: "/models" }],
  },
  {
    patterns: ["sign up", "create account", "register", "join", "get started"],
    response: "Creating an account is **free and takes 30 seconds**! 🎉 Here's how:\n\n1. Click **Get Started** in the top-right corner\n2. Enter your name, email, and a password (8+ characters)\n3. After signing up, you'll be taken to the **profile setup** where you choose Developer, Business, or Student\n4. Your homepage will immediately update with a personalized feed!\n\nNo credit card required.",
    actions: [{ label: "Create Account →", href: "/signup" }],
  },
  {
    patterns: ["log in", "login", "sign in", "access account", "my account"],
    response: "To sign in, click **Sign In** in the top navigation bar. Enter your email and password. If you forgot your password, use the 'Forgot password?' link on the login page.\n\nOnce signed in, you'll see your personalized dashboard with tools and news tailored to your profile type. 🔐",
    actions: [{ label: "Sign In →", href: "/login" }],
  },
  {
    patterns: ["profile", "personalize", "developer", "business", "student", "customize", "my feed", "personal"],
    response: "After signing up, you pick a **profile type** that customizes your entire experience:\n\n🟣 **Developer** — Code AI tools, Agents, LLMs, Research & Open Source news\n🔵 **Business Owner** — Marketing, Design & Analytics tools, Industry & Funding news\n🟢 **Student** — Free tools, LLMs, Research summaries in plain English\n\nYou can switch your profile type anytime via the user menu → 'Change Profile Type'.",
    actions: [{ label: "Choose My Profile", href: "/onboarding" }],
  },
  {
    patterns: ["language", "translate", "multilingual", "arabic", "spanish", "french", "rtl", "switch language"],
    response: "Global AI Hub supports **18 languages** with full UI translation and automatic RTL/LTR switching! 🌍\n\nLTR: English, Spanish, French, German, Portuguese, Italian, Dutch, Russian, Turkish, Indonesian, Chinese, Japanese, Korean, Hindi, Bengali\n\nRTL (right-to-left): **Arabic, Urdu, Persian** — the entire layout flips automatically!\n\nClick the 🌐 globe icon in the top navigation bar to switch languages.",
  },
  {
    patterns: ["filter", "search", "sort", "category", "pricing", "free", "premium", "freemium"],
    response: "The Tools Directory has powerful filtering options:\n\n🔍 **Search** — by name, category, or keyword\n📂 **Category** — All, LLMs, Code AI, Image Gen, Voice AI, Agents, Marketing, Design\n💰 **Pricing** — Free, Freemium, or Premium\n🖥️ **Output Type** — Text, Image, Audio, Code, Video\n📊 **Sort** — Most Popular, Top Rated, or A–Z\n\nAll filters update results instantly — no page refresh needed!",
    actions: [{ label: "Try Filtering Tools", href: "/tools" }],
  },
  {
    patterns: ["submit", "add tool", "suggest tool", "missing tool", "list my tool"],
    response: "Got an AI tool we should add? 🚀 Here's how to submit:\n\n1. Go to the **AI Tools Directory**\n2. Scroll to the bottom — you'll find the **'Know a tool we're missing?'** card\n3. Click **Submit a Tool** and fill in the name, category, URL, and description\n\nOur team reviews every submission within **48 hours**. Verified tools get the official Global AI Hub badge and priority placement in search results!",
    actions: [{ label: "Go to Directory", href: "/tools" }],
  },
  {
    patterns: ["newsletter", "subscribe", "email", "weekly", "digest email"],
    response: "Our **AI Newsletter** 📬 delivers the week's most important AI developments straight to your inbox — curated and distilled into key points, never overwhelming.\n\nTo subscribe, scroll to the bottom of the homepage and enter your email in the newsletter section. We send one digest per week — no spam, ever. You can unsubscribe anytime with one click.",
    actions: [{ label: "Subscribe Now", href: "/#newsletter" }],
  },
  {
    patterns: ["who are you", "what are you", "your name", "aria", "assistant"],
    response: "I'm **Aria** 🤖, the Global AI Hub Assistant! I'm powered by a smart response engine trained on everything about this platform — tools, news, models, features, and navigation.\n\nI can help you:\n• Find the right AI tool for your needs\n• Understand how features work\n• Navigate between pages\n• Answer questions about AI models\n\nWhat can I help you with today?",
  },
  {
    patterns: ["how to use", "how does", "tutorial", "guide", "help", "navigate", "get around"],
    response: "Here's a quick guide to **Global AI Hub**:\n\n🏠 **Home** — Your personalized dashboard (sign in to unlock)\n🔧 **Tools** — Browse & filter 2,400+ AI tools\n📰 **News** — Daily AI news, 3 bullets per story\n🏆 **Models** — Benchmark leaderboard for top AI models\n\nTip: Sign up to get a feed personalized to your role (Developer / Business / Student)! Use the 🌐 globe icon to switch between 18 languages.",
    actions: [{ label: "Explore Tools", href: "/tools" }, { label: "Read News", href: "/news" }, { label: "View Models", href: "/models" }],
  },
  {
    patterns: ["open source", "free model", "llama", "mistral", "open weight"],
    response: "We track the best **open-source AI models** on our leaderboard! 🔓\n\nCurrently the top open models are:\n• **Llama 3 70B** by Meta (score: 82.0)\n• **Mixtral 8x22B** by Mistral (score: 81.2)\n• **Grok-1.5** by xAI (score: 81.3)\n• **Stable Diffusion 3** by Stability AI (score: 92.5)\n\nIn the Tools Directory, you can filter by 'Free' pricing to find tools with open-source tiers.",
    actions: [{ label: "View Leaderboard", href: "/models" }, { label: "Filter Free Tools", href: "/tools" }],
  },
  {
    patterns: ["thank", "thanks", "awesome", "great", "perfect", "helpful", "nice", "good job", "well done"],
    response: "You're very welcome! 😊 Feel free to come back anytime — I'm always here in the bottom corner whenever you need guidance. Is there anything else you'd like to explore on Global AI Hub?",
  },
  {
    patterns: ["bye", "goodbye", "see you", "later", "ciao", "exit", "close"],
    response: "Goodbye! 👋 It was great chatting with you. I'll be right here if you need anything else — just click the ✨ button in the corner. Happy exploring!",
  },
];

function findResponse(input: string): { text: string; actions?: Action[] } {
  const lower = input.toLowerCase().trim();
  for (const entry of KB) {
    if (entry.patterns.some((p) => lower.includes(p))) {
      return { text: entry.response, actions: entry.actions };
    }
  }
  return {
    text: "Great question! I'm not sure about that specific detail, but here's where you might find your answer:\n\n• 🔧 **Tools Directory** — for AI tool recommendations\n• 📰 **News Hub** — for latest AI developments\n• 🏆 **Models Leaderboard** — for model comparisons\n\nYou can also try rephrasing — I understand questions about tools, news, models, accounts, languages, filters, and more!",
    actions: [{ label: "AI Tools", href: "/tools" }, { label: "AI News", href: "/news" }, { label: "Models", href: "/models" }],
  };
}

/* ─── Web Speech API ───────────────────────────────────────────────────────── */

interface ISpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string; confidence: number };
}
interface ISpeechRecognitionResultList {
  length: number;
  [index: number]: ISpeechRecognitionResult;
}
interface ISpeechRecognitionEvent extends Event {
  results: ISpeechRecognitionResultList;
}
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

function getSpeechRecognition(): ISpeechRecognition | null {
  const Cls = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Cls) return null;
  const rec = new Cls();
  rec.continuous = false;
  rec.interimResults = true;
  rec.lang = "en-US";
  return rec;
}

/* ─── Avatar Component ─────────────────────────────────────────────────────── */

function Avatar({ state, size = 48 }: { state: AvatarState; size?: number }) {
  const eyeSize = Math.round(size * 0.1);
  const eyeY = Math.round(size * 0.38);
  const eyeSpread = Math.round(size * 0.16);

  return (
    <div
      className="relative flex-shrink-0 rounded-full"
      style={{ width: size, height: size }}
      data-testid="assistant-avatar"
    >
      {/* Glow */}
      <div
        className={`absolute inset-0 rounded-full blur-md transition-opacity duration-500 ${
          state === "idle" ? "opacity-40" :
          state === "listening" ? "opacity-80 bg-secondary" :
          state === "thinking" ? "opacity-60 bg-primary" :
          "opacity-70 bg-primary"
        }`}
        style={{ background: state === "listening" ? "rgba(34,211,238,0.5)" : "rgba(168,85,247,0.5)" }}
      />

      {/* Listening rings */}
      {state === "listening" && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-secondary/60 animate-ping" style={{ animationDuration: "1s" }} />
          <div className="absolute rounded-full border border-secondary/30 animate-ping" style={{ inset: -6, animationDuration: "1.4s", animationDelay: "0.2s" }} />
        </>
      )}

      {/* Thinking ring */}
      {state === "thinking" && (
        <div
          className="absolute rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"
          style={{ inset: -3, animationDuration: "0.8s" }}
        />
      )}

      {/* Face circle */}
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: "radial-gradient(circle at 35% 35%, rgba(168,85,247,0.9), rgba(99,0,199,0.95))",
          boxShadow: "inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.3)",
        }}
      >
        {/* Shimmer line */}
        <div className="absolute top-[20%] left-[20%] w-[30%] h-[6%] rounded-full bg-white/20 blur-[1px]" />

        {/* Eyes */}
        <div className="absolute" style={{ top: eyeY, left: size / 2 - eyeSpread - eyeSize / 2, width: eyeSize, height: eyeSize }}>
          <div
            className="w-full rounded-full bg-white"
            style={{
              height: state === "listening" ? eyeSize * 1.3 : eyeSize,
              transition: "height 0.15s ease",
            }}
          />
        </div>
        <div className="absolute" style={{ top: eyeY, left: size / 2 + eyeSpread - eyeSize / 2, width: eyeSize, height: eyeSize }}>
          <div
            className="w-full rounded-full bg-white"
            style={{
              height: state === "listening" ? eyeSize * 1.3 : eyeSize,
              transition: "height 0.15s ease",
            }}
          />
        </div>

        {/* Mouth */}
        <div
          className="absolute bg-white/90 rounded-full transition-all duration-100"
          style={{
            bottom: Math.round(size * 0.22),
            left: "50%",
            transform: "translateX(-50%)",
            width: state === "talking" ? Math.round(size * 0.28) : Math.round(size * 0.22),
            height: state === "talking"
              ? Math.round(size * 0.14)
              : state === "listening"
              ? Math.round(size * 0.06)
              : Math.round(size * 0.04),
            borderRadius: state === "talking" ? "40%" : "50%",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Talking Avatar (animates mouth in sync with typewriter) ──────────────── */

function TalkingAvatar({ size, isTyping }: { size: number; isTyping: boolean }) {
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    if (!isTyping) { setMouthOpen(false); return; }
    const id = setInterval(() => setMouthOpen((v) => !v), 180 + Math.random() * 120);
    return () => clearInterval(id);
  }, [isTyping]);

  return <Avatar state={isTyping ? (mouthOpen ? "talking" : "idle") : "idle"} size={size} />;
}

/* ─── Sound Wave Bars ──────────────────────────────────────────────────────── */

function SoundWave() {
  return (
    <div className="flex items-end gap-[3px] h-5" aria-label="Listening" data-testid="sound-wave">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-secondary"
          animate={{ height: ["4px", "18px", "6px", "14px", "4px"] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Message Bubble ───────────────────────────────────────────────────────── */

function MessageBubble({ msg, isTyping }: { msg: Message; isTyping: boolean }) {
  const isUser = msg.role === "user";

  const renderText = (text: string) =>
    text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      data-testid={`message-${msg.id}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 mt-0.5">
          <TalkingAvatar size={28} isTyping={isTyping && msg.partial === true} />
        </div>
      )}

      <div className={`max-w-[85%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-white rounded-tr-sm shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "bg-[hsl(240,15%,11%)] text-muted-foreground border border-white/8 rounded-tl-sm"
          }`}
        >
          {renderText(msg.text)}
          {isTyping && msg.partial && (
            <span className="inline-block w-1.5 h-4 bg-primary/70 rounded-sm ml-0.5 animate-pulse" />
          )}
        </div>

        {/* Action chips */}
        {!msg.partial && msg.actions && msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.actions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary border border-primary/30 bg-primary/8 rounded-full px-3 py-1.5 hover:bg-primary/20 hover:border-primary/60 transition-all"
                data-testid={`action-chip-${action.label}`}
              >
                {action.label} <ChevronRight className="w-3 h-3" />
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Suggestion Chips ─────────────────────────────────────────────────────── */

const SUGGESTIONS = [
  "What tools are available?",
  "How does the news digest work?",
  "How do I personalize my feed?",
  "What's on the models leaderboard?",
  "Tell me about language support",
];

/* ─── Main Widget ──────────────────────────────────────────────────────────── */

let msgCounter = 0;
const uid = () => `msg-${++msgCounter}`;

export default function AssistantWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<ISpeechRecognition | null>(null);
  const typeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial greeting when opened for the first time
  useEffect(() => {
    if (open && messages.length === 0) {
      const name = user?.name?.split(" ")[0];
      const greeting = name
        ? `Hi **${name}**! 👋 I'm **Aria**, your AI guide. I can help you explore tools, news, models, and features on Global AI Hub. What would you like to discover today?`
        : "Hi! 👋 I'm **Aria**, your Global AI Hub assistant. I can help you explore 2,400+ AI tools, daily news digests, model benchmarks, and more. What would you like to know?";
      streamMessage("assistant", greeting, [
        { label: "Explore Tools", href: "/tools" },
        { label: "Latest News", href: "/news" },
      ]);
    }
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamMessage = useCallback(
    (role: "assistant", fullText: string, actions?: Action[]) => {
      const id = uid();
      setAvatarState("thinking");
      setIsTyping(true);

      // Short thinking pause, then start streaming
      setTimeout(() => {
        setAvatarState("talking");
        setMessages((prev) => [...prev, { id, role, text: "", partial: true }]);

        let i = 0;
        const chars = fullText.split("");
        const tick = () => {
          i++;
          const text = chars.slice(0, i).join("");
          setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)));
          if (i < chars.length) {
            const delay = chars[i - 1] === "\n" ? 60 : chars[i - 1] === "." || chars[i - 1] === "!" || chars[i - 1] === "?" ? 55 : 18;
            typeTimerRef.current = setTimeout(tick, delay);
          } else {
            setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, partial: false, actions } : m)));
            setIsTyping(false);
            setAvatarState("idle");
          }
        };
        typeTimerRef.current = setTimeout(tick, 20);
      }, 600);
    },
    [],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;
      if (typeTimerRef.current) clearTimeout(typeTimerRef.current);

      setMessages((prev) => [...prev, { id: uid(), role: "user", text: trimmed }]);
      setInput("");

      const { text: responseText, actions } = findResponse(trimmed);
      setTimeout(() => streamMessage("assistant", responseText, actions), 100);
    },
    [isTyping, streamMessage],
  );

  const handleVoice = useCallback(() => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      setAvatarState("idle");
      return;
    }

    const rec = getSpeechRecognition();
    if (!rec) {
      setMessages((prev) => [...prev, {
        id: uid(), role: "assistant",
        text: "Voice input isn't supported in this browser. Try Chrome or Edge, or type your question below!",
      }]);
      return;
    }

    recRef.current = rec;
    let interim = "";

    rec.onresult = (e: ISpeechRecognitionEvent) => {
      const result = e.results[e.results.length - 1];
      interim = result ? (result[0]?.transcript ?? "") : "";
      setInput(interim);
    };

    rec.onend = () => {
      setListening(false);
      setAvatarState("idle");
      if (interim.trim()) sendMessage(interim.trim());
    };

    rec.onerror = () => {
      setListening(false);
      setAvatarState("idle");
    };

    rec.start();
    setListening(true);
    setAvatarState("listening");
  }, [listening, sendMessage]);

  const clearChat = () => {
    if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
    setMessages([]);
    setIsTyping(false);
    setAvatarState("idle");
  };

  const showSuggestions = messages.length === 0 || (messages.length === 1 && messages[0]?.role === "assistant");

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <div className="fixed bottom-6 end-6 z-[60]" data-testid="assistant-trigger-area">
        {/* Tooltip */}
        <AnimatePresence>
          {!open && hasUnread && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-full mb-3 end-0 whitespace-nowrap text-xs font-semibold text-white bg-[hsl(240,15%,12%)] border border-primary/30 rounded-full px-3 py-1.5 shadow-lg pointer-events-none"
            >
              ✨ Ask Aria anything!
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setOpen((v) => !v)}
          data-testid="btn-assistant-toggle"
          className="relative w-14 h-14 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.55)] hover:shadow-[0_0_45px_rgba(168,85,247,0.75)] transition-shadow"
          aria-label="Open AI Assistant"
        >
          {/* Idle pulse ring */}
          {!open && (
            <span className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" style={{ animationDuration: "2s" }} />
          )}

          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{ background: "radial-gradient(circle at 35% 35%, rgba(168,85,247,0.95), rgba(99,0,199,1))" }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="avatar"
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <Avatar state={avatarState} size={56} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread dot */}
          {!open && hasUnread && (
            <span className="absolute top-0.5 end-0.5 w-3 h-3 rounded-full bg-secondary border-2 border-background shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
          )}
        </motion.button>
      </div>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed bottom-24 end-6 z-[60] w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.7),0_0_40px_rgba(168,85,247,0.2)] border border-white/10"
            style={{ height: 520, background: "hsl(240,15%,7%)" }}
            data-testid="assistant-panel"
          >
            {/* Panel border gradient */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.15) 0%,transparent 60%)" }} />

            {/* ── Header ── */}
            <div className="relative flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-[hsl(240,15%,9%)] flex-shrink-0">
              <TalkingAvatar size={38} isTyping={isTyping} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-display font-bold text-white">Aria</p>
                  <span className="text-muted-foreground/50 text-xs">·</span>
                  <p className="text-xs text-muted-foreground">Global AI Hub</p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    avatarState === "listening" ? "bg-secondary animate-pulse" :
                    avatarState === "thinking" ? "bg-yellow-400 animate-pulse" :
                    avatarState === "talking" ? "bg-primary animate-pulse" :
                    "bg-emerald-400"
                  }`} />
                  <span className="text-[11px] text-muted-foreground/60">
                    {avatarState === "listening" ? "Listening…" :
                     avatarState === "thinking" ? "Thinking…" :
                     avatarState === "talking" ? "Speaking…" : "Ready"}
                  </span>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/8 transition-colors"
                title="Clear chat"
                data-testid="btn-clear-chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/8 transition-colors"
                data-testid="btn-close-assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 scroll-smooth" data-testid="messages-area">
              {/* Suggestion chips before any user input */}
              {showSuggestions && !isTyping && messages.length <= 1 && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-2"
                    data-testid="suggestion-chips"
                  >
                    <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Try asking
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          className="text-xs text-muted-foreground border border-white/10 bg-white/[0.03] rounded-full px-3 py-1.5 hover:border-primary/40 hover:text-white hover:bg-white/[0.07] transition-all"
                          data-testid={`suggestion-${s.slice(0, 20)}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isTyping={isTyping}
                />
              ))}

              {/* Thinking indicator */}
              {isTyping && avatarState === "thinking" && (
                <div className="flex gap-2.5 items-center" data-testid="thinking-indicator">
                  <Avatar state="thinking" size={28} />
                  <div className="flex gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-[hsl(240,15%,11%)] border border-white/8">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary/60"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Input Bar ── */}
            <div className="px-3 py-3 border-t border-white/8 bg-[hsl(240,15%,9%)] flex-shrink-0">
              {listening && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <SoundWave />
                  <span className="text-xs text-secondary font-medium">Listening… speak now</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVoice}
                  data-testid="btn-voice-input"
                  title={listening ? "Stop listening" : "Voice input"}
                  className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    listening
                      ? "bg-secondary/20 text-secondary border border-secondary/40 shadow-[0_0_12px_rgba(34,211,238,0.3)] animate-pulse"
                      : "bg-white/5 text-muted-foreground border border-white/10 hover:text-white hover:border-white/25"
                  }`}
                >
                  {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder={listening ? "Or type here…" : "Ask me anything…"}
                  disabled={isTyping && avatarState === "thinking"}
                  className="flex-1 h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all disabled:opacity-50"
                  data-testid="input-assistant"
                />

                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || (isTyping && avatarState === "thinking")}
                  data-testid="btn-send-message"
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-white disabled:opacity-30 hover:bg-primary/80 hover:shadow-[0_0_14px_rgba(168,85,247,0.5)] transition-all disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
                Aria knows tools, news, models, auth & navigation
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
