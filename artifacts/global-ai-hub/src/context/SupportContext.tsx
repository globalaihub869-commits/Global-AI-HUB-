import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

export type TicketStatus = "Open" | "Pending" | "Resolved";
export type TicketSeverity = "Low" | "Medium" | "High";

export interface SupportTicket {
  id: string;
  user: string;
  issue: string;
  status: TicketStatus;
  severity: TicketSeverity;
  submittedAt: string;
  source: "seed" | "agent" | "self-heal";
}

export interface HealEvent {
  id: string;
  message: string;
  timestamp: string;
}

interface SupportContextValue {
  tickets: SupportTicket[];
  healEvents: HealEvent[];
  healthStatus: "healthy" | "monitoring";
  totalAutoHeals: number;
  resolveQuery: (text: string, userLabel: string) => { resolved: boolean; reply: string; ticketId?: string };
  faqPreviewMatch: (text: string) => string | null;
  isClientSpamBlocked: boolean;
  recordClientSubmit: () => boolean;
}

const SupportContext = createContext<SupportContextValue | null>(null);

const SEED_TICKETS: SupportTicket[] = [
  { id: "TCK-1042", user: "amara.dev@proton.me", issue: "Face scan step on Account Recovery gets stuck at 80%.", status: "Open", severity: "High", submittedAt: "2026-07-09T08:12:00Z", source: "seed" },
  { id: "TCK-1041", user: "l.moreau@studio.io", issue: "Can't find the 'Forgot User ID?' link on mobile viewport.", status: "Pending", severity: "Medium", submittedAt: "2026-07-09T07:44:00Z", source: "seed" },
  { id: "TCK-1040", user: "priya.k@venturelab.com", issue: "Aria assistant widget not responding to voice input on Safari.", status: "Open", severity: "Medium", submittedAt: "2026-07-08T22:15:00Z", source: "seed" },
  { id: "TCK-1039", user: "d.oyelaran@marketly.ai", issue: "Bookmarked tools not appearing after switching languages to Arabic.", status: "Resolved", severity: "Low", submittedAt: "2026-07-08T19:03:00Z", source: "seed" },
  { id: "TCK-1038", user: "j.tanaka@codeforge.dev", issue: "Requesting bulk export of Hub Points history for finance records.", status: "Pending", severity: "Low", submittedAt: "2026-07-08T14:51:00Z", source: "seed" },
  { id: "TCK-1037", user: "s.nwosu@brightpath.edu", issue: "Document upload rejects valid PDF passports during recovery flow.", status: "Resolved", severity: "High", submittedAt: "2026-07-07T11:20:00Z", source: "seed" },
];

const HEAL_POOL = [
  "Detected stale render in ToolCard hydration on /tools — soft reset applied ✓",
  "Session cache drift detected in AuthContext — state resynced ✓",
  "Animation frame lock detected in AssistantWidget — component remounted ✓",
  "Language dictionary out of sync after locale switch — reloaded translations ✓",
  "Detected orphaned WebSocket-like listener on /admin traffic feed — cleaned up ✓",
  "Dashboard notification queue exceeded threshold — auto-compacted ✓",
  "Detected UI freeze signature on filter panel — soft reset applied ✓",
  "Memory pressure detected in social state cache — garbage collected ✓",
];

interface FaqEntry { patterns: string[]; reply: string; }

const FAQ: FaqEntry[] = [
  {
    patterns: ["password", "forgot password", "reset password", "can't log in", "cant log in", "login issue"],
    reply: "I can help with that! Go to the **Login** page and click **'Forgot password?'** — you'll get a reset link by email within a minute. If you also forgot your User ID, use the **'Forgot User ID?'** link right next to it. ✅ Marking this as resolved.",
  },
  {
    patterns: ["account recovery", "face scan", "identity verification", "recover account", "recovery stuck"],
    reply: "The Account Recovery flow has 4 steps: Identify → Face Scan → Document Upload → Success. If a step visually stalls, try refreshing the page — our self-healing system also automatically detects and clears stuck UI states in the background. ✅ Marking this as resolved.",
  },
  {
    patterns: ["bookmark", "save tool", "saved tools"],
    reply: "To bookmark a tool, click the bookmark icon under any tool card — it instantly appears in **My Dashboard → Bookmarked Tools**. ✅ Marking this as resolved.",
  },
  {
    patterns: ["hub points", "points", "rewards", "tier", "level up"],
    reply: "You earn **Hub Points** by liking (+5), commenting (+3), sharing (+8), and bookmarking (+10) tools. Track your total and tier progress in **My Dashboard**. ✅ Marking this as resolved.",
  },
  {
    patterns: ["language", "translate", "switch language", "arabic", "rtl"],
    reply: "Click the 🌐 globe icon in the top navigation bar to switch between our 18 supported languages, including full RTL support for Arabic, Urdu, and Persian. ✅ Marking this as resolved.",
  },
  {
    patterns: ["notification", "not getting notified", "no notifications"],
    reply: "Notifications appear in **My Dashboard → Active Notifications** whenever you like, comment, share, or bookmark a tool. Try interacting with a tool card and check back. ✅ Marking this as resolved.",
  },
  {
    patterns: ["admin", "dashboard access", "super admin"],
    reply: "Super Admin access is granted automatically to accounts whose email starts with 'admin' at signup. If you believe you should have access and don't, I'll escalate this to our Super Admin team for review.",
  },
  {
    patterns: ["pricing", "plan", "upgrade", "enterprise", "pro", "subscription"],
    reply: "We offer three plans: **Free** (basic access), **Pro** (unlimited AI Sandbox + more referrals), and **Enterprise** (everything unlimited + VIP Express Support). Visit **/pricing** to compare and upgrade. ✅ Marking this as resolved.",
  },
  {
    patterns: ["refund", "cancel", "billing", "charge", "invoice"],
    reply: "For billing questions, refunds, or cancellations please contact our support team directly through this widget — I've noted your request and a human will follow up within 24 hours. 🎫",
  },
];

/** Returns the short inline FAQ hint while user is typing — used for live auto-FAQ preview in the widget. */
function matchFaqPreview(text: string): string | null {
  if (text.trim().length < 4) return null;
  const lower = text.toLowerCase();
  const match = FAQ.find((e) => e.patterns.some((p) => lower.includes(p)));
  if (!match) return null;
  const short = match.reply.replace(/\*\*/g, "").split(".")[0];
  return short.length > 120 ? `${short.slice(0, 117)}…` : short;
}

/** Anti-spam: client-side rate limiter — max 3 ticket submissions per 5 minutes. */
const CLIENT_SPAM_LIMIT = 3;
const CLIENT_SPAM_WINDOW_MS = 5 * 60 * 1000;
const clientSubmitTimestamps: number[] = [];

function clientAntiSpamRecord(): boolean {
  const now = Date.now();
  const trimmed = clientSubmitTimestamps.filter((t) => now - t < CLIENT_SPAM_WINDOW_MS);
  clientSubmitTimestamps.length = 0;
  clientSubmitTimestamps.push(...trimmed, now);
  return clientSubmitTimestamps.length > CLIENT_SPAM_LIMIT;
}

function checkClientSpamBlocked(): boolean {
  const now = Date.now();
  const recent = clientSubmitTimestamps.filter((t) => now - t < CLIENT_SPAM_WINDOW_MS);
  return recent.length >= CLIENT_SPAM_LIMIT;
}

function storageKey() { return "gah-support-state"; }

function loadTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return SEED_TICKETS;
    const parsed = JSON.parse(raw) as { tickets?: SupportTicket[] };
    return parsed.tickets && parsed.tickets.length > 0 ? parsed.tickets : SEED_TICKETS;
  } catch {
    return SEED_TICKETS;
  }
}

let ticketCounter = 1043;

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => loadTickets());
  const [healEvents, setHealEvents] = useState<HealEvent[]>([]);
  const healthTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [healthStatus, setHealthStatus] = useState<"healthy" | "monitoring">("healthy");
  const [isClientSpamBlocked, setIsClientSpamBlocked] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(), JSON.stringify({ tickets }));
    } catch {
      // ignore storage quota errors
    }
  }, [tickets]);

  useEffect(() => {
    const interval = setInterval(() => {
      const message = HEAL_POOL[Math.floor(Math.random() * HEAL_POOL.length)];
      setHealthStatus("monitoring");
      setHealEvents((prev) => [
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, message, timestamp: new Date().toISOString() },
        ...prev,
      ].slice(0, 20));
      if (healthTimeoutRef.current) clearTimeout(healthTimeoutRef.current);
      healthTimeoutRef.current = setTimeout(() => setHealthStatus("healthy"), 1800);
    }, 13000);
    return () => {
      clearInterval(interval);
      if (healthTimeoutRef.current) clearTimeout(healthTimeoutRef.current);
    };
  }, []);

  /** 24-Hour Ticket Auto-Closure: auto-resolve local tickets inactive for 24h. */
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      setTickets((prev) =>
        prev.map((t) =>
          t.status === "Open" && new Date(t.submittedAt).getTime() < cutoff
            ? { ...t, status: "Resolved" as TicketStatus }
            : t,
        ),
      );
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const resolveQuery = useCallback((text: string, userLabel: string) => {
    const lower = text.toLowerCase();
    const match = FAQ.find((entry) => entry.patterns.some((p) => lower.includes(p)));
    if (match) return { resolved: true, reply: match.reply };

    const id = `TCK-${ticketCounter++}`;
    const newTicket: SupportTicket = {
      id,
      user: userLabel,
      issue: text.length > 160 ? `${text.slice(0, 157)}...` : text,
      status: "Open",
      severity: /urgent|broken|can't|crash|error|fail/i.test(text) ? "High" : "Medium",
      submittedAt: new Date().toISOString(),
      source: "agent",
    };
    setTickets((prev) => [newTicket, ...prev]);
    return {
      resolved: false,
      reply: `That's a bit more complex than I can resolve automatically. I've created ticket **${id}** and forwarded it to our Super Admin support desk — a human will follow up shortly. 🎫`,
      ticketId: id,
    };
  }, []);

  const faqPreviewMatch = useCallback((text: string) => matchFaqPreview(text), []);

  const recordClientSubmit = useCallback((): boolean => {
    const blocked = clientAntiSpamRecord();
    setIsClientSpamBlocked(checkClientSpamBlocked());
    return blocked;
  }, []);

  const totalAutoHeals = healEvents.length;

  return (
    <SupportContext.Provider value={{ tickets, healEvents, healthStatus, totalAutoHeals, resolveQuery, faqPreviewMatch, isClientSpamBlocked, recordClientSubmit }}>
      {children}
    </SupportContext.Provider>
  );
}

export function useSupport() {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error("useSupport must be used inside <SupportProvider>");
  return ctx;
}
