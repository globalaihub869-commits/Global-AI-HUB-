import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, Activity, Users, Globe2, Gauge, LifeBuoy, Clock, CheckCircle2, AlertTriangle, CircleDot,
  BrainCircuit, Bot, Ticket as TicketIcon, Code2, Blocks, Lock, Tag, ShieldBan, Crown, TrendingUp, Ban,
  ScrollText, Unlock, BellRing, Send, Archive, Star, Wallet, ExternalLink, XCircle,
  Rss, Mail, Hourglass, AlertCircle, Building2, MapPin, RefreshCw,
  Briefcase, Heart, Share2, BarChart3, Twitter, Linkedin, Filter, Zap,
  DollarSign, Package, Globe, Sparkles, Check, Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupport, type SupportTicket } from "@/context/SupportContext";
import { apiFetch } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ExecutiveAnalytics from "@/components/admin/ExecutiveAnalytics";
import LiveRevenueTracker from "@/components/admin/LiveRevenueTracker";
import SecurityTabPanel from "@/components/admin/SecurityTabPanel";
import VipEmailerPanel from "@/components/admin/VipEmailerPanel";

interface PlaygroundActivity {
  totalExecutions: number;
  totalWidgets: number;
  lockedFreeUsers: number;
  activeSandboxUsers: number;
  recentWidgets: {
    id: string;
    name: string;
    type: string;
    seo: { slug: string; keywords: string[] };
    createdAt: number;
  }[];
}

interface ThreatEvent {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  ip: string;
  reason: string;
  blocked: boolean;
  createdAt: number;
}

interface ThreatSummary {
  totalThreatsBlocked: number;
  totalCaptchaChallenges: number;
  activeBlockedIps: number;
  blockedIpList: { ip: string; reason: string; expiresAt: number; permanent?: boolean }[];
  recentThreats: ThreatEvent[];
}

interface ActionLogEntry extends ThreatEvent {
  method: string;
  path: string;
  action: string;
  preBlockWarning: boolean;
  attemptNumber: number;
}

interface LiveEvent {
  id: string;
  type: "threat_blocked" | "purchase" | "ip_unblocked" | "vip_ticket";
  title: string;
  message: string;
  createdAt: number;
}

interface AdminTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  issue: string;
  status: "Open" | "Pending" | "Resolved" | "Archived";
  severity: "Low" | "Medium" | "High";
  isVip: boolean;
  adminReply: string | null;
  submittedAt: number;
  lastActivityAt: number;
}

interface AdminTicketStats {
  open: number;
  pending: number;
  resolved: number;
  archived: number;
  vip: number;
  total: number;
}

interface GigDraft {
  id: string;
  externalId: string;
  source: string;
  sourceUrl: string;
  title: string;
  sellerName: string;
  sellerProfileUrl: string;
  sellerEmail: string | null;
  description: string;
  category: string;
  originalPrice: number;
  ourPrice: number;
  rating: number;
  reviewCount: number;
  deliveryDays: number;
  status: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  hashtags: string[];
  notificationSent: boolean;
  publishedAt: string | null;
  createdAt: string;
}

interface GigAggregatorStats {
  totalFetched: number;
  totalNew: number;
  totalDrafts: number;
  totalPublished: number;
  lastRunAt: string | null;
  cycles: number;
  bySource: Record<string, number>;
}

interface GigsActivity {
  stats: {
    totalGigs: number;
    totalReviews: number;
    totalLikes: number;
    totalShares: number;
  };
  log: {
    id: string;
    title: string;
    seller: string;
    category: string;
    priceUsd: number;
    rating: number;
    reviewCount: number;
    likes: number;
    shares: number;
  }[];
}

interface JobReport {
  scheduler: {
    totalScraped: number;
    totalAccepted: number;
    totalRejected: number;
    emailsSent: number;
    emailsFailed: number;
    socialPostsQueued: number;
    lastRunAt: string | null;
    lastRunAdded: number;
    cycles: number;
    isRunning: boolean;
  };
  jobs: {
    total: number;
    active: number;
    scraped: number;
    manual: number;
    rejected: number;
    withEmail: number;
    emailSent: number;
    emailPending: number;
    emailFailed: number;
  };
  social: {
    total: number;
    queued: number;
    posted: number;
    failed: number;
    byPlatform: Record<string, { queued: number; posted: number; failed: number }>;
    recentPosts: {
      id: string;
      jobId: string;
      platform: string;
      status: string;
      content: string;
      hashtags: string;
      jobUrl: string;
      postedAt: string | null;
      createdAt: string;
    }[];
  };
  emailLog: { jobId: string; company: string; title: string; to: string; status: string }[];
  rejectedLog: { id: string; title: string; company: string; reason: string | null; score: number | null; at: string }[];
}

const QUICK_REPLY_TEMPLATES = [
  "Thank you for reaching out! Your issue has been reviewed and resolved — please let us know if you experience any further problems. ✅",
  "We're actively investigating this. Could you please provide more details about the exact steps you took before this occurred?",
  "Your account has been updated. The changes should take effect immediately — please try again and let us know!",
  "I've escalated your ticket to our senior technical team. You'll receive a full update within 24 hours. 🎫",
  "This is a known issue that our engineering team is working on. A fix will be deployed within the next 48 hours — we apologise for the inconvenience.",
];

interface PendingPayment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: string;
  amountUsdt: number;
  txId: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

interface ExecutiveSummary {
  totalConversions: number;
  highValueConversions: number;
  totalRevenueUsdt: number;
  enterpriseCount: number;
  proCount: number;
  recentConversions: {
    id: string;
    userEmail: string;
    plan: string;
    amountUsdt: number;
    createdAt: number;
  }[];
}

const threatSeverityStyle: Record<ThreatEvent["severity"], string> = {
  low: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  medium: "text-yellow-300 border-yellow-400/30 bg-yellow-400/10",
  high: "text-orange-300 border-orange-400/30 bg-orange-400/10",
  critical: "text-red-300 border-red-400/40 bg-red-400/10",
};

interface RealtimeStats {
  totalUsers: number;
  totalInteractions: number;
  requestsPerMin: number;
  errorRate: number;
  trafficHistory: { t: number; requests: number }[];
  recentEvents: { id: string; text: string }[];
}

const statusStyle: Record<SupportTicket["status"], string> = {
  Open: "text-red-400 border-red-400/40 bg-red-400/10",
  Pending: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  Resolved: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
};

const severityStyle: Record<SupportTicket["severity"], string> = {
  High: "text-red-300 border-red-400/30",
  Medium: "text-secondary border-secondary/30",
  Low: "text-muted-foreground border-white/15",
};

const statusIcon: Record<SupportTicket["status"], React.ElementType> = {
  Open: AlertTriangle,
  Pending: Clock,
  Resolved: CheckCircle2,
};

const sourceLabel: Record<SupportTicket["source"], string> = {
  seed: "Manual",
  agent: "AI Support Agent",
  "self-heal": "Self-Healing System",
};


/** Live Audio/Visual push chime: an alarm blip for blocked threats, a bright chime for purchases, an urgent gold arpeggio for VIP tickets. */
function playPushChime(type: LiveEvent["type"]) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const notes =
      type === "purchase" ? [523.25, 659.25, 783.99]
      : type === "ip_unblocked" ? [440, 554.37]
      : type === "vip_ticket" ? [880, 1046.5, 1318.51, 1046.5, 880]
      : [880, 440];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === "threat_blocked" ? "square" : type === "vip_ticket" ? "triangle" : "sine";
      osc.frequency.value = freq;
      const startAt = ctx.currentTime + i * (type === "vip_ticket" ? 0.09 : 0.11);
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(type === "vip_ticket" ? 0.16 : 0.12, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + 0.3);
    });
  } catch {
    // Audio not available (e.g. autoplay-blocked before user interaction) — fail silently.
  }
}

export default function AdminDashboard() {
  const { healEvents, healthStatus, totalAutoHeals } = useSupport();
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [playgroundActivity, setPlaygroundActivity] = useState<PlaygroundActivity | null>(null);
  const [threatSummary, setThreatSummary] = useState<ThreatSummary | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [unblockingIp, setUnblockingIp] = useState<string | null>(null);
  const [adminTickets, setAdminTickets] = useState<AdminTicket[]>([]);
  const [adminTicketStats, setAdminTicketStats] = useState<AdminTicketStats | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);
  const [jobActivityLog, setJobActivityLog] = useState<{
    stats: { total: number; scraped: number; withEmail: number; sent: number; pending: number; failed: number };
    log: { id: string; title: string; company: string; location: string; postedAt: string; hrEmail: string | null; outreachStatus: string | null; tags: string[] }[];
  } | null>(null);
  const [jobLogRefreshing, setJobLogRefreshing] = useState(false);
  const [jobReport, setJobReport] = useState<JobReport | null>(null);
  const [jobReportRefreshing, setJobReportRefreshing] = useState(false);
  const [gigsActivity, setGigsActivity] = useState<GigsActivity | null>(null);
  const [gigsLogRefreshing, setGigsLogRefreshing] = useState(false);
  const [gigDrafts, setGigDrafts] = useState<GigDraft[]>([]);
  const [gigAggStats, setGigAggStats] = useState<GigAggregatorStats | null>(null);
  const [gigDraftsLoading, setGigDraftsLoading] = useState(false);
  const [gigScraping, setGigScraping] = useState(false);
  const [gigPriceEdits, setGigPriceEdits] = useState<Record<string, string>>({});
  const [gigPublishing, setGigPublishing] = useState<string | null>(null);
  const [gigRejecting, setGigRejecting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadActivity = () => {
      apiFetch("/playground/admin/activity").then(setPlaygroundActivity).catch(() => {});
    };
    loadActivity();
    const interval = setInterval(loadActivity, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = () => {
      apiFetch("/jobs/activity-log").then(setJobActivityLog).catch(() => {});
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = () => {
      apiFetch("/jobs/report").then(setJobReport).catch(() => {});
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = () => {
      apiFetch("/gigs/activity-log").then(setGigsActivity).catch(() => {});
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadGigAgg = () => {
      apiFetch("/gig-aggregator/drafts").then((d: { drafts: GigDraft[] }) => setGigDrafts(d.drafts)).catch(() => {});
      apiFetch("/gig-aggregator/stats").then((d: { scheduler: GigAggregatorStats }) => setGigAggStats(d.scheduler)).catch(() => {});
    };
    loadGigAgg();
    const interval = setInterval(loadGigAgg, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let lastSeenId: string | null = null;
    const loadThreats = () => {
      apiFetch("/security/threats").then((data: ThreatSummary) => {
        setThreatSummary(data);
        const latest = data.recentThreats[0];
        if (latest && latest.id !== lastSeenId) {
          if (lastSeenId !== null) {
            toast({
              title: "Threat auto-blocked",
              description: latest.reason,
              variant: "destructive",
            });
          }
          lastSeenId = latest.id;
        }
      }).catch(() => {});
    };
    loadThreats();
    const interval = setInterval(loadThreats, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadExecutive = () => {
      apiFetch("/security/executive-summary").then(setExecutiveSummary).catch(() => {});
    };
    loadExecutive();
    const interval = setInterval(loadExecutive, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Full "Hacker Action Log" — every unauthorized action, warning, and block.
  useEffect(() => {
    const loadActionLog = () => {
      apiFetch("/security/action-log").then((data: { actions: ActionLogEntry[] }) => setActionLog(data.actions)).catch(() => {});
    };
    loadActionLog();
    const interval = setInterval(loadActionLog, 5000);
    return () => clearInterval(interval);
  }, []);

  // Live Audio/Visual Push Notifications — real-time SSE stream for purchases and blocked threats.
  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const source = new EventSource(`${base}/api/security/live-stream`, { withCredentials: true });
    source.onmessage = (evt) => {
      if (!evt.data) return;
      let payload: LiveEvent;
      try {
        payload = JSON.parse(evt.data);
      } catch {
        return;
      }
      playPushChime(payload.type);
      const titles: Record<LiveEvent["type"], string> = {
        purchase: "💰 Package purchased",
        ip_unblocked: "🔓 IP unblocked",
        threat_blocked: "🚨 Threat blocked",
        vip_ticket: "⭐ VIP Ticket Received",
      };
      toast({
        title: titles[payload.type] ?? payload.title,
        description: payload.message,
        variant: payload.type === "threat_blocked" ? "destructive" : "default",
      });
    };
    source.onerror = () => {
      // EventSource auto-reconnects; nothing to do here.
    };
    return () => source.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const load = () => {
      apiFetch("/billing/pending-payments")
        .then((data: { submissions: PendingPayment[] }) => setPendingPayments(data.submissions ?? []))
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApprovePayment = async (id: string) => {
    setProcessingPaymentId(id);
    try {
      await apiFetch(`/billing/approve-payment/${id}`, { method: "POST" });
      setPendingPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: "approved" } : p));
      toast({ title: "✅ Payment approved", description: "User plan has been activated." });
    } catch (e) {
      toast({ title: "Approval failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleRejectPayment = async (id: string) => {
    setProcessingPaymentId(id);
    try {
      await apiFetch(`/billing/reject-payment/${id}`, { method: "POST" });
      setPendingPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: "rejected" } : p));
      toast({ title: "Payment rejected", description: "Submission marked as rejected." });
    } catch (e) {
      toast({ title: "Rejection failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setProcessingPaymentId(null);
    }
  };

  useEffect(() => {
    const loadAdminTickets = () => {
      apiFetch("/support/tickets")
        .then((data: { tickets: AdminTicket[]; stats: AdminTicketStats }) => {
          setAdminTickets(data.tickets ?? []);
          setAdminTicketStats(data.stats ?? null);
        })
        .catch(() => {});
    };
    loadAdminTickets();
    const interval = setInterval(loadAdminTickets, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickReply = async (ticketId: string, status: AdminTicket["status"]) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const data: { ticket: AdminTicket } = await apiFetch(`/support/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminReply: replyText.trim() }),
      });
      setAdminTickets((prev) => prev.map((t) => (t.id === ticketId ? data.ticket : t)));
      setActiveReplyId(null);
      setReplyText("");
      toast({ title: "Reply sent", description: `Ticket ${ticketId} updated to ${status}.` });
    } catch {
      toast({ title: "Failed to update ticket", variant: "destructive" });
    } finally {
      setReplyLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: string, status: AdminTicket["status"]) => {
    try {
      const data: { ticket: AdminTicket } = await apiFetch(`/support/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setAdminTickets((prev) => prev.map((t) => (t.id === ticketId ? data.ticket : t)));
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handleUnblockIp = async (ip: string) => {
    setUnblockingIp(ip);
    try {
      await apiFetch("/security/unblock-ip", { method: "POST", body: JSON.stringify({ ip }) });
      setThreatSummary((prev) => (prev ? { ...prev, blockedIpList: prev.blockedIpList.filter((b) => b.ip !== ip), activeBlockedIps: Math.max(0, prev.activeBlockedIps - 1) } : prev));
      toast({ title: "IP unblocked", description: `${ip} now has full access again.` });
    } catch {
      toast({ title: "Unblock failed", description: `Could not unblock ${ip}.`, variant: "destructive" });
    } finally {
      setUnblockingIp(null);
    }
  };

  useEffect(() => {
    const load = () => {
      apiFetch("/admin/realtime-stats")
        .then((data: RealtimeStats) => setRealtimeStats(data))
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const trafficHistory = realtimeStats?.trafficHistory ?? [];
  const max = Math.max(...trafficHistory.map((h) => h.requests), 1);

  return (
    <div className="container mx-auto px-4 py-28 max-w-6xl" data-testid="page-admin-dashboard">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-2.5 py-1 mb-3 text-secondary border-secondary/40 bg-secondary/10">
          <ShieldAlert className="w-3 h-3" /> Super Admin Dashboard
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Live Operations Console</h1>
        <p className="text-muted-foreground mt-1">Private view — monitor real-time traffic and support health.</p>
      </div>

      {/* Owner Executive Counter */}
      <div className="mb-8" data-testid="section-executive-counter">
        <Card className="relative overflow-hidden border-yellow-400/30 bg-gradient-to-br from-[hsl(45,60%,10%)] via-[hsl(240,15%,8%)] to-[hsl(240,15%,8%)] shimmer-border-gold">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-yellow-300">
                <Crown className="w-4 h-4" /> Owner Executive Counter
              </div>
              <Badge variant="outline" className="text-[10px] text-yellow-300 border-yellow-400/40" data-testid="badge-executive-live">
                Live
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Conversions", value: executiveSummary?.totalConversions ?? 0, icon: TrendingUp },
                { label: "High-Value Conversions", value: executiveSummary?.highValueConversions ?? 0, icon: Crown },
                { label: "Revenue (USDT)", value: (executiveSummary?.totalRevenueUsdt ?? 0).toLocaleString(), icon: Gauge },
                { label: "Enterprise Upgrades", value: executiveSummary?.enterpriseCount ?? 0, icon: ShieldAlert },
              ].map((stat) => (
                <div key={stat.label} data-testid={`executive-stat-${stat.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                  <stat.icon className="w-4 h-4 mb-2 text-yellow-300" />
                  <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-muted-foreground/70 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            {executiveSummary && executiveSummary.recentConversions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-1.5">
                {executiveSummary.recentConversions.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs text-muted-foreground" data-testid={`executive-conversion-${c.id}`}>
                    <span>{c.userEmail} upgraded to <span className="text-yellow-300 capitalize">{c.plan}</span></span>
                    <span>${c.amountUsdt} · {new Date(c.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      <div className="mb-8" data-testid="section-pending-payments">
        <Card className="border-white/8 bg-[hsl(240,15%,8%)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Wallet className="w-4 h-4 text-yellow-400" />
                Payment Submissions
              </div>
              {pendingPayments.filter((p) => p.status === "pending").length > 0 && (
                <Badge className="bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 text-[11px]">
                  {pendingPayments.filter((p) => p.status === "pending").length} Pending
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {pendingPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No payment submissions yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingPayments.map((payment) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border px-4 py-3 ${
                      payment.status === "pending"
                        ? "border-yellow-400/30 bg-yellow-400/5"
                        : payment.status === "approved"
                        ? "border-emerald-400/25 bg-emerald-400/5"
                        : "border-red-400/25 bg-red-400/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-white">{payment.userEmail}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            payment.plan === "enterprise"
                              ? "text-purple-300 border-purple-400/30 bg-purple-400/10"
                              : "text-yellow-300 border-yellow-400/30 bg-yellow-400/10"
                          }`}>
                            {payment.plan.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">${payment.amountUsdt} USDT</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[11px] text-muted-foreground">TxID:</span>
                          <code className="text-[11px] text-cyan-300 font-mono truncate max-w-[220px]">{payment.txId}</code>
                          <a
                            href={`https://tronscan.org/#/transaction/${payment.txId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-cyan-300 transition-colors flex-shrink-0"
                            title="View on TronScan"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-[11px] text-muted-foreground/60">{new Date(payment.submittedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {payment.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleApprovePayment(payment.id)}
                              disabled={processingPaymentId === payment.id}
                              data-testid={`btn-approve-payment-${payment.id}`}
                              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-400/40 text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectPayment(payment.id)}
                              disabled={processingPaymentId === payment.id}
                              data-testid={`btn-reject-payment-${payment.id}`}
                              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-red-400/30 text-red-300 bg-red-400/10 hover:bg-red-400/20 disabled:opacity-50 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                            payment.status === "approved"
                              ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
                              : "text-red-300 border-red-400/30 bg-red-400/10"
                          }`}>
                            {payment.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Executive revenue/usage analytics + PDF export */}
      <ExecutiveAnalytics />

      {/* Live Revenue Tracker */}
      <div className="mb-8" data-testid="section-live-revenue">
        <LiveRevenueTracker />
      </div>

      {/* Live stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Registered Users", value: realtimeStats ? realtimeStats.totalUsers.toLocaleString() : "—", icon: Users, color: "text-primary" },
          { label: "Requests / min", value: realtimeStats ? realtimeStats.requestsPerMin.toLocaleString() : "—", icon: Gauge, color: "text-secondary" },
          { label: "Total Interactions", value: realtimeStats ? realtimeStats.totalInteractions.toLocaleString() : "—", icon: Globe2, color: "text-cyan-300" },
          { label: "Error Rate", value: realtimeStats ? `${realtimeStats.errorRate.toFixed(2)}%` : "—", icon: Activity, color: realtimeStats && realtimeStats.errorRate > 1.5 ? "text-red-400" : "text-emerald-400" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[hsl(240,15%,8%)] border-white/8" data-testid={`stat-${stat.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
              </div>
              <motion.div key={stat.value} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-2xl font-display font-bold text-white">
                {stat.value}
              </motion.div>
              <p className="text-xs text-muted-foreground/70 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Traffic chart */}
        <Card className="lg:col-span-2 bg-[hsl(240,15%,8%)] border-white/8" data-testid="card-live-traffic">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="w-4 h-4 text-primary" /> Live Website Traffic
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-end gap-1">
              {trafficHistory.map((point, i) => (
                <motion.div
                  key={point.t}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, (point.requests / max) * 100)}%` }}
                  transition={{ duration: 0.4 }}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/60 to-secondary/70"
                  style={{ opacity: 0.5 + (i / Math.max(trafficHistory.length, 1)) * 0.5 }}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-3">Real API requests per 3-second window, updating every 5 seconds</p>
          </CardContent>
        </Card>

        {/* Live activity feed */}
        <Card className="bg-[hsl(240,15%,8%)] border-white/8" data-testid="card-activity-feed">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleDot className="w-4 h-4 text-secondary" /> Live Visitor Feed
            </div>
          </CardHeader>
          <CardContent className="max-h-48 overflow-y-auto flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {(realtimeStats?.recentEvents ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground/60 py-4 text-center">No threat events recorded yet.</p>
              ) : (
                (realtimeStats?.recentEvents ?? []).map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-2 font-mono"
                    data-testid={`feed-item-${f.id}`}
                  >
                    {f.text}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Automated Threat Defense System */}
      <div className="mb-8" data-testid="section-threat-defense">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <ShieldBan className="w-4 h-4 text-red-400" /> Automated Threat Defense System
          </h2>
          <div className="flex items-center gap-2 text-xs" data-testid="threat-defense-status">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
            </span>
            <span className="text-red-300">Monitoring globally</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Threats Auto-Blocked", value: threatSummary?.totalThreatsBlocked ?? 0, icon: Ban },
            { label: "CAPTCHA Challenges", value: threatSummary?.totalCaptchaChallenges ?? 0, icon: BellRing },
            { label: "Active Blocked IPs", value: threatSummary?.activeBlockedIps ?? 0, icon: ShieldBan },
            { label: "Defense Coverage", value: "Global", icon: Globe2 },
          ].map((stat) => (
            <Card key={stat.label} className="bg-[hsl(240,15%,8%)] border-red-400/10" data-testid={`stat-threat-${stat.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
              <CardContent className="p-4">
                <stat.icon className="w-4 h-4 mb-2 text-red-400" />
                <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
                <p className="text-xs text-muted-foreground/70 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Blocked IP management — 1-Click IP Unblock override */}
        <Card className="bg-[hsl(240,15%,8%)] border-white/8 mb-4" data-testid="card-blocked-ip-management">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Unlock className="w-4 h-4 text-yellow-300" /> Blocked IP Management — Owner Override
            </div>
          </CardHeader>
          <CardContent className="max-h-48 overflow-y-auto flex flex-col gap-2">
            {!threatSummary || threatSummary.blockedIpList.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 py-4 text-center">No IPs are currently blocked.</p>
            ) : (
              threatSummary.blockedIpList.map((b) => (
                <div
                  key={b.ip}
                  className="flex items-center justify-between gap-3 text-xs border-l-2 border-yellow-400/40 pl-2 py-1"
                  data-testid={`blocked-ip-${b.ip}`}
                >
                  <div className="min-w-0">
                    <span className="text-white font-mono">{b.ip}</span>
                    <span className="text-muted-foreground"> · {b.reason}</span>
                    <span className="text-muted-foreground/40"> · expires {new Date(b.expiresAt).toLocaleTimeString()}</span>
                  </div>
                  <button
                    onClick={() => handleUnblockIp(b.ip)}
                    disabled={unblockingIp === b.ip}
                    className="flex-shrink-0 inline-flex items-center gap-1 rounded-md border border-yellow-400/40 bg-yellow-400/10 px-2 py-1 text-[10px] font-semibold text-yellow-300 hover:bg-yellow-400/20 disabled:opacity-50 transition-colors"
                    data-testid={`button-unblock-${b.ip}`}
                  >
                    <Unlock className="w-3 h-3" /> {unblockingIp === b.ip ? "Unblocking..." : "1-Click Unblock"}
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-[hsl(240,15%,8%)] border-white/8 mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Live Threat Feed
            </div>
          </CardHeader>
          <CardContent className="max-h-56 overflow-y-auto flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {!threatSummary || threatSummary.recentThreats.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 py-4 text-center">No threats detected — all clear.</p>
              ) : (
                threatSummary.recentThreats.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between gap-3 text-xs border-l-2 border-red-400/40 pl-2"
                    data-testid={`threat-event-${t.id}`}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <Badge variant="outline" className={`text-[9px] uppercase px-1.5 py-0 ${threatSeverityStyle[t.severity]}`}>
                        {t.severity}
                      </Badge>
                      <span className="text-muted-foreground truncate">{t.reason}</span>
                    </div>
                    <span className="text-muted-foreground/40 flex-shrink-0">{new Date(t.createdAt).toLocaleTimeString()}</span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Two-tab security panel: Tab 1 = Threats & Bot Logs, Tab 2 = User Verification Logs */}
        <SecurityTabPanel />
      </div>

      {/* AI Self-Healing System */}
      <div className="mb-8" data-testid="section-self-healing">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-primary" /> AI Self-Healing System
          </h2>
          <div className="flex items-center gap-2 text-xs" data-testid="self-healing-status">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${healthStatus === "monitoring" ? "bg-secondary" : "bg-emerald-400"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${healthStatus === "monitoring" ? "bg-secondary" : "bg-emerald-400"}`} />
            </span>
            <span className={healthStatus === "monitoring" ? "text-secondary" : "text-emerald-400"}>
              {healthStatus === "monitoring" ? "Soft-resetting..." : "All systems healthy"}
            </span>
          </div>
        </div>
        <Card className="bg-[hsl(240,15%,8%)] border-white/8">
          <CardContent className="p-4">
            <div className="flex items-center gap-6 mb-3 text-xs text-muted-foreground">
              <span>Autonomous glitch detection scans the UI every 13s and applies soft resets automatically — no human intervention required.</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30" data-testid="badge-auto-heal-count">
                {totalAutoHeals} auto-heals this session
              </Badge>
            </div>
            <div className="max-h-40 overflow-y-auto flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {healEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground/60 py-4 text-center">Monitoring — no glitches detected yet.</p>
                ) : (
                  healEvents.map((h) => (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-2 flex items-center justify-between gap-2"
                      data-testid={`heal-event-${h.id}`}
                    >
                      <span>{h.message}</span>
                      <span className="text-muted-foreground/40 flex-shrink-0">{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VIP Welcome Emailer */}
      <div className="mb-8" data-testid="section-vip-emailer">
        <VipEmailerPanel />
      </div>

      {/* Playground & No-Code Builder activity */}
      <div className="mb-8" data-testid="section-playground-activity">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-300" /> AI Sandbox &amp; Builder Activity
          </h2>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Sandbox Executions", value: playgroundActivity?.totalExecutions ?? 0, icon: Code2, color: "text-cyan-300" },
            { label: "Widgets Generated", value: playgroundActivity?.totalWidgets ?? 0, icon: Blocks, color: "text-primary" },
            { label: "Active Sandbox Users", value: playgroundActivity?.activeSandboxUsers ?? 0, icon: Users, color: "text-secondary" },
            { label: "Free Users Locked", value: playgroundActivity?.lockedFreeUsers ?? 0, icon: Lock, color: "text-yellow-300" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-[hsl(240,15%,8%)] border-white/8" data-testid={`stat-playground-${stat.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
              <CardContent className="p-4">
                <stat.icon className={`w-4 h-4 mb-2 ${stat.color}`} />
                <div className="text-2xl font-display font-bold text-white">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground/70 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-[hsl(240,15%,8%)] border-white/8">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="w-4 h-4 text-secondary" /> Recently Generated Widgets (Auto-SEO Tagged)
            </div>
          </CardHeader>
          <CardContent className="max-h-56 overflow-y-auto flex flex-col gap-2">
            {!playgroundActivity || playgroundActivity.recentWidgets.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 py-4 text-center">No widgets generated yet.</p>
            ) : (
              playgroundActivity.recentWidgets.map((w) => (
                <div key={w.id} className="flex items-center justify-between gap-3 text-xs border-l-2 border-primary/40 pl-2" data-testid={`admin-widget-${w.id}`}>
                  <div className="min-w-0">
                    <span className="text-white font-medium">{w.name}</span>
                    <span className="text-muted-foreground"> · {w.type} · /{w.seo.slug}</span>
                  </div>
                  <span className="text-muted-foreground/40 flex-shrink-0">{new Date(w.createdAt).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Jobs Activity Log */}
      <div className="mb-8" data-testid="section-jobs-activity-log">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Rss className="w-4 h-4 text-cyan-300" /> Jobs Activity Log
            {jobActivityLog && jobActivityLog.stats.scraped > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/25">
                {jobActivityLog.stats.scraped} scraped
              </span>
            )}
          </h2>
          <button
            onClick={() => {
              setJobLogRefreshing(true);
              apiFetch("/jobs/activity-log").then(setJobActivityLog).catch(() => {}).finally(() => setJobLogRefreshing(false));
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors"
            data-testid="btn-refresh-job-log"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${jobLogRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {[
            { label: "Total Jobs", value: jobActivityLog?.stats.total ?? 0, icon: Rss, color: "text-cyan-300" },
            { label: "Scraped", value: jobActivityLog?.stats.scraped ?? 0, icon: Rss, color: "text-primary" },
            { label: "With HR Email", value: jobActivityLog?.stats.withEmail ?? 0, icon: Mail, color: "text-secondary" },
            { label: "Email Sent", value: jobActivityLog?.stats.sent ?? 0, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Pending", value: jobActivityLog?.stats.pending ?? 0, icon: Hourglass, color: "text-yellow-400" },
            { label: "Failed", value: jobActivityLog?.stats.failed ?? 0, icon: AlertCircle, color: "text-red-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-[hsl(240,15%,8%)] border-white/8" data-testid={`stat-jobs-${stat.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
              <CardContent className="p-4">
                <stat.icon className={`w-4 h-4 mb-2 ${stat.color}`} />
                <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-tight">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Log table */}
        <Card className="bg-[hsl(240,15%,8%)] border-white/8">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ScrollText className="w-4 h-4 text-primary" />
              Scraped job listings &amp; outreach status — auto-refreshes every 10s
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {!jobActivityLog || jobActivityLog.log.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-center px-5">
                <Rss className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/60">No scraped jobs yet. The scheduler runs every 30 minutes.</p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto divide-y divide-white/[0.04]">
                <AnimatePresence initial={false}>
                  {jobActivityLog.log.map((job, i) => {
                    const statusConfig =
                      job.outreachStatus === "sent"
                        ? { label: "Email Sent", cls: "bg-emerald-400/10 border-emerald-400/30 text-emerald-400", Icon: Mail }
                        : job.outreachStatus === "failed"
                        ? { label: "Email Failed", cls: "bg-red-400/10 border-red-400/30 text-red-400", Icon: AlertCircle }
                        : job.outreachStatus === "pending"
                        ? { label: "Pending", cls: "bg-yellow-400/10 border-yellow-400/30 text-yellow-400", Icon: Hourglass }
                        : { label: "No HR Email", cls: "bg-white/5 border-white/10 text-muted-foreground", Icon: CircleDot };

                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: Math.min(i * 0.02, 0.2) }}
                        className="flex items-start gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors"
                        data-testid={`job-log-row-${job.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-sm font-medium text-white truncate">{job.title}</span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${statusConfig.cls}`}
                              data-testid={`job-status-${job.id}`}
                            >
                              <statusConfig.Icon className="w-2.5 h-2.5" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.company}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                            {job.hrEmail && (
                              <span className="flex items-center gap-1 text-cyan-400/70">
                                <Mail className="w-3 h-3" />{job.hrEmail}
                              </span>
                            )}
                          </div>
                          {job.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {job.tags.map((t) => (
                                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80 border border-primary/15">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground/50 flex-shrink-0 pt-0.5">{job.postedAt}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job Status Report */}
      <div className="mb-8" data-testid="section-job-status-report">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Job Status Report
            {jobReport?.scheduler.isRunning && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 border border-emerald-400/25">
                <Zap className="w-2.5 h-2.5" /> Auto-running
              </span>
            )}
          </h2>
          <button
            onClick={() => {
              setJobReportRefreshing(true);
              apiFetch("/jobs/report").then(setJobReport).catch(() => {}).finally(() => setJobReportRefreshing(false));
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors"
            data-testid="btn-refresh-job-report"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${jobReportRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Scheduler stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Scrape Cycles", value: jobReport?.scheduler.cycles ?? 0, icon: Rss, color: "text-cyan-300" },
            { label: "Total Scraped", value: jobReport?.scheduler.totalScraped ?? 0, icon: Activity, color: "text-primary" },
            { label: "Accepted", value: jobReport?.scheduler.totalAccepted ?? 0, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Rejected (Spam)", value: jobReport?.scheduler.totalRejected ?? 0, icon: Filter, color: "text-red-400" },
          ].map((s) => (
            <Card key={s.label} className="bg-[hsl(240,15%,8%)] border-white/8" data-testid={`stat-report-${s.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
              <CardContent className="p-4">
                <s.icon className={`w-4 h-4 mb-2 ${s.color}`} />
                <div className="text-2xl font-display font-bold text-white">{s.value}</div>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-tight">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active jobs + social + email row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Active Jobs", value: jobReport?.jobs.active ?? 0, icon: Briefcase, color: "text-cyan-300" },
            { label: "Emails Sent", value: jobReport?.scheduler.emailsSent ?? 0, icon: Mail, color: "text-emerald-400" },
            { label: "Social Queued", value: jobReport?.social.queued ?? 0, icon: Share2, color: "text-secondary" },
            { label: "Social Posted", value: jobReport?.social.posted ?? 0, icon: CheckCircle2, color: "text-emerald-400" },
          ].map((s) => (
            <Card key={s.label} className="bg-[hsl(240,15%,8%)] border-white/8">
              <CardContent className="p-4">
                <s.icon className={`w-4 h-4 mb-2 ${s.color}`} />
                <div className="text-2xl font-display font-bold text-white">{s.value}</div>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-tight">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Social Posts Log */}
          <Card className="bg-[hsl(240,15%,8%)] border-white/8">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Share2 className="w-4 h-4 text-secondary" /> Social Media Posts
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                {jobReport?.social.byPlatform && Object.entries(jobReport.social.byPlatform).map(([platform, counts]) => (
                  <span key={platform} className="flex items-center gap-1">
                    {platform === "twitter" ? <Twitter className="w-3 h-3 text-sky-400" /> : <Linkedin className="w-3 h-3 text-blue-400" />}
                    <span className="capitalize">{platform}:</span>
                    <span className="text-emerald-400">{counts.posted} posted</span>
                    <span>·</span>
                    <span className="text-yellow-400">{counts.queued} queued</span>
                  </span>
                ))}
                {!jobReport?.social.byPlatform || Object.keys(jobReport.social.byPlatform).length === 0 ? (
                  <span className="text-muted-foreground/50">No posts yet — runs after first scrape cycle</span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {!jobReport || jobReport.social.recentPosts.length === 0 ? (
                <div className="py-8 flex flex-col items-center gap-2 text-center px-5">
                  <Share2 className="w-7 h-7 text-muted-foreground/25" />
                  <p className="text-xs text-muted-foreground/50">Posts appear here once the scheduler runs its first cycle</p>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto divide-y divide-white/[0.04]">
                  {jobReport.social.recentPosts.map((post) => (
                    <div key={post.id} className="px-5 py-3 flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {post.platform === "twitter"
                          ? <Twitter className="w-4 h-4 text-sky-400" />
                          : <Linkedin className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold capitalize text-white">{post.platform}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${
                            post.status === "posted"
                              ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                              : post.status === "failed"
                              ? "bg-red-400/10 border-red-400/30 text-red-400"
                              : "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{post.content}</p>
                        <a href={post.jobUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400/70 hover:text-cyan-400 truncate block mt-0.5">{post.jobUrl}</a>
                      </div>
                      <span className="text-[10px] text-muted-foreground/40 flex-shrink-0 pt-0.5">
                        {new Date(post.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email + Rejected Logs */}
          <div className="flex flex-col gap-4">
            {/* Email outreach log */}
            <Card className="bg-[hsl(240,15%,8%)] border-white/8">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Mail className="w-4 h-4 text-cyan-300" /> Email Outreach Log
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {!jobReport || jobReport.emailLog.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs text-muted-foreground/50">Emails appear here after the first scrape finds HR contacts</p>
                  </div>
                ) : (
                  <div className="max-h-[160px] overflow-y-auto divide-y divide-white/[0.04]">
                    {jobReport.emailLog.slice(0, 20).map((e, i) => (
                      <div key={i} className="px-5 py-2.5 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{e.title} <span className="text-muted-foreground">@ {e.company}</span></p>
                          <p className="text-[11px] text-cyan-400/70 truncate">{e.to}</p>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold flex-shrink-0 ${
                          e.status === "sent"
                            ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                            : e.status === "failed"
                            ? "bg-red-400/10 border-red-400/30 text-red-400"
                            : "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                        }`}>{e.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rejected jobs audit */}
            <Card className="bg-[hsl(240,15%,8%)] border-white/8">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Filter className="w-4 h-4 text-red-400" /> Quality Filter — Rejected Jobs
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {!jobReport || jobReport.rejectedLog.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs text-muted-foreground/50">No rejections yet — filter runs on every scrape cycle</p>
                  </div>
                ) : (
                  <div className="max-h-[160px] overflow-y-auto divide-y divide-white/[0.04]">
                    {jobReport.rejectedLog.slice(0, 20).map((r) => (
                      <div key={r.id} className="px-5 py-2.5 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{r.title} <span className="text-muted-foreground">@ {r.company}</span></p>
                          <p className="text-[11px] text-red-400/70">{r.reason ?? "quality filter"}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">score {r.score ?? "—"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Last run info */}
        {jobReport?.scheduler.lastRunAt && (
          <p className="mt-3 text-[11px] text-muted-foreground/50 text-center">
            Last cycle: {new Date(jobReport.scheduler.lastRunAt).toLocaleString()} · Added {jobReport.scheduler.lastRunAdded} jobs · Cycles: {jobReport.scheduler.cycles}
          </p>
        )}
      </div>

      {/* Gigs Activity Log */}
      <div className="mb-8" data-testid="section-gigs-activity-log">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-secondary" /> Gigs Activity
          </h2>
          <button
            onClick={() => {
              setGigsLogRefreshing(true);
              apiFetch("/gigs/activity-log").then(setGigsActivity).catch(() => {}).finally(() => setGigsLogRefreshing(false));
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors"
            data-testid="btn-refresh-gigs-log"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${gigsLogRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Gigs", value: gigsActivity?.stats.totalGigs ?? 0, icon: Briefcase, color: "text-secondary" },
            { label: "Total Reviews", value: gigsActivity?.stats.totalReviews ?? 0, icon: Star, color: "text-yellow-400" },
            { label: "Total Likes", value: gigsActivity?.stats.totalLikes ?? 0, icon: Heart, color: "text-pink-400" },
            { label: "Total Shares", value: gigsActivity?.stats.totalShares ?? 0, icon: Share2, color: "text-cyan-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-[hsl(240,15%,8%)] border-white/8" data-testid={`stat-gigs-${stat.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
              <CardContent className="p-4">
                <stat.icon className={`w-4 h-4 mb-2 ${stat.color}`} />
                <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-tight">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-[hsl(240,15%,8%)] border-white/8">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-secondary" />
              Gig listings with social engagement — likes &amp; shares from the DB
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {!gigsActivity || gigsActivity.log.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-center px-5">
                <Briefcase className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/60">No gigs data yet.</p>
              </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto divide-y divide-white/[0.04]">
                {gigsActivity.log.map((gig) => (
                  <div key={gig.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors" data-testid={`gig-log-row-${gig.id}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-medium text-white truncate">{gig.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 border border-secondary/20 text-secondary/80">{gig.category}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>{gig.seller}</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{gig.rating} ({gig.reviewCount})</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-400" />{gig.likes}</span>
                        <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-cyan-400" />{gig.shares}</span>
                      </div>
                    </div>
                    <span className="text-sm font-display font-bold text-white flex-shrink-0">${gig.priceUsd}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Gig Aggregator ──────────────────────────────────────────── */}
      <div className="mb-8" data-testid="section-gig-aggregator">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-secondary" /> Gig Aggregator
            {gigDrafts.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                {gigDrafts.length} drafts
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setGigDraftsLoading(true);
                Promise.all([
                  apiFetch("/gig-aggregator/drafts").then((d: { drafts: GigDraft[] }) => setGigDrafts(d.drafts)),
                  apiFetch("/gig-aggregator/stats").then((d: { scheduler: GigAggregatorStats }) => setGigAggStats(d.scheduler)),
                ]).catch(() => {}).finally(() => setGigDraftsLoading(false));
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gigDraftsLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => {
                setGigScraping(true);
                apiFetch("/gig-aggregator/scrape", { method: "POST" })
                  .then((d: { inserted: number; scraped: number }) => {
                    toast({ title: "Scrape complete", description: `${d.inserted} new gigs added (${d.scraped} total found)` });
                    return Promise.all([
                      apiFetch("/gig-aggregator/drafts").then((r: { drafts: GigDraft[] }) => setGigDrafts(r.drafts)),
                      apiFetch("/gig-aggregator/stats").then((r: { scheduler: GigAggregatorStats }) => setGigAggStats(r.scheduler)),
                    ]);
                  })
                  .catch(() => toast({ title: "Scrape failed", variant: "destructive" }))
                  .finally(() => setGigScraping(false));
              }}
              disabled={gigScraping}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/25 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${gigScraping ? "animate-spin" : ""}`} />
              {gigScraping ? "Scraping…" : "Scrape Now"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Fetched", value: gigAggStats?.totalFetched ?? 0, icon: Globe, color: "text-cyan-400" },
            { label: "Drafts", value: gigAggStats?.totalDrafts ?? gigDrafts.length, icon: Package, color: "text-secondary" },
            { label: "Published", value: gigAggStats?.totalPublished ?? 0, icon: Check, color: "text-emerald-400" },
            { label: "Scrape Cycles", value: gigAggStats?.cycles ?? 0, icon: RefreshCw, color: "text-yellow-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-[hsl(240,15%,8%)] border-white/8">
              <CardContent className="p-4">
                <stat.icon className={`w-4 h-4 mb-2 ${stat.color}`} />
                <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-tight">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Source breakdown */}
        {gigAggStats && Object.keys(gigAggStats.bySource).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(gigAggStats.bySource).map(([src, cnt]) => (
              <span key={src} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-muted-foreground">
                <Globe className="w-3 h-3 text-cyan-400" /> {src}: <span className="text-white font-semibold">{cnt}</span>
              </span>
            ))}
          </div>
        )}

        {/* Draft gigs table */}
        <Card className="bg-[hsl(240,15%,8%)] border-white/8">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4 text-secondary" />
              Scraped gigs pending your review — set profit margin price then publish
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {gigDrafts.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-center px-5">
                <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/60">No drafts yet — click <strong>Scrape Now</strong> to fetch top-rated gigs.</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto divide-y divide-white/[0.04]">
                {gigDrafts.map((gig) => {
                  const editedPrice = gigPriceEdits[gig.id];
                  const displayPrice = editedPrice !== undefined ? editedPrice : String(gig.ourPrice);
                  return (
                    <div key={gig.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors" data-testid={`gig-draft-row-${gig.id}`}>
                      <div className="flex items-start gap-4">
                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-white truncate max-w-[340px]">{gig.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 border border-secondary/20 text-secondary/80">{gig.category}</span>
                            <a href={gig.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400/80 hover:text-cyan-300 transition-colors">
                              <ExternalLink className="w-2.5 h-2.5" /> {gig.source}
                            </a>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap mb-2">
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{gig.rating} ({gig.reviewCount} reviews)</span>
                            <span>by <a href={gig.sellerProfileUrl} target="_blank" rel="noreferrer" className="text-cyan-400/80 hover:text-cyan-300">{gig.sellerName}</a></span>
                            <span>{gig.deliveryDays}d delivery</span>
                            <span className="text-muted-foreground/50">orig. ${gig.originalPrice}</span>
                          </div>
                          {/* SEO fields */}
                          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5 space-y-1.5 mb-2">
                            <div className="flex items-start gap-1.5">
                              <span className="text-[10px] text-muted-foreground/60 w-20 flex-shrink-0 pt-0.5">Meta title</span>
                              <span className="text-[11px] text-white/80 leading-snug">{gig.metaTitle}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-[10px] text-muted-foreground/60 w-20 flex-shrink-0 pt-0.5">Meta desc</span>
                              <span className="text-[10px] text-muted-foreground leading-snug">{gig.metaDescription}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-[10px] text-muted-foreground/60 w-20 flex-shrink-0 pt-0.5">Slug</span>
                              <span className="text-[10px] text-cyan-400/70 font-mono">/gigs/{gig.slug}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-[10px] text-muted-foreground/60 w-20 flex-shrink-0 pt-0.5">Hashtags</span>
                              <div className="flex flex-wrap gap-1">
                                {gig.hashtags.slice(0, 6).map((h) => (
                                  <span key={h} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary/70">{h}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price + actions */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                            <input
                              type="number"
                              min={1}
                              step={1}
                              value={displayPrice}
                              onChange={(e) => setGigPriceEdits((p) => ({ ...p, [gig.id]: e.target.value }))}
                              onBlur={() => {
                                const val = parseFloat(displayPrice);
                                if (!isNaN(val) && val > 0 && val !== gig.ourPrice) {
                                  apiFetch(`/gig-aggregator/drafts/${gig.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ ourPrice: val }),
                                  }).then((r: { gig: GigDraft }) => {
                                    setGigDrafts((prev) => prev.map((g) => g.id === gig.id ? { ...g, ourPrice: r.gig.ourPrice } : g));
                                    setGigPriceEdits((p) => { const n = { ...p }; delete n[gig.id]; return n; });
                                    toast({ title: "Price updated", description: `Set to $${val}` });
                                  }).catch(() => toast({ title: "Price update failed", variant: "destructive" }));
                                }
                              }}
                              className="w-20 text-right text-sm font-display font-bold text-white bg-white/[0.06] border border-white/10 rounded-md px-2 py-1 focus:outline-none focus:border-secondary/50 focus:bg-white/[0.08] transition-colors"
                              data-testid={`gig-price-input-${gig.id}`}
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setGigRejecting(gig.id);
                                apiFetch(`/gig-aggregator/drafts/${gig.id}/reject`, { method: "POST" })
                                  .then(() => {
                                    setGigDrafts((prev) => prev.filter((g) => g.id !== gig.id));
                                    toast({ title: "Draft rejected" });
                                  })
                                  .catch(() => toast({ title: "Reject failed", variant: "destructive" }))
                                  .finally(() => setGigRejecting(null));
                              }}
                              disabled={gigRejecting === gig.id || gigPublishing === gig.id}
                              className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all disabled:opacity-50"
                              data-testid={`gig-reject-btn-${gig.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                              {gigRejecting === gig.id ? "…" : "Reject"}
                            </button>
                            <button
                              onClick={() => {
                                setGigPublishing(gig.id);
                                apiFetch(`/gig-aggregator/drafts/${gig.id}/publish`, { method: "POST" })
                                  .then((r: { gig: GigDraft; notification: string }) => {
                                    setGigDrafts((prev) => prev.filter((g) => g.id !== gig.id));
                                    apiFetch("/gig-aggregator/stats").then((d: { scheduler: GigAggregatorStats }) => setGigAggStats(d.scheduler)).catch(() => {});
                                    const notifMsg = r.notification === "sent" ? " · Seller notified ✓" : r.notification === "no_email" ? " · No seller email on file" : "";
                                    toast({ title: "Gig published!", description: `${gig.title.slice(0, 40)}…${notifMsg}` });
                                  })
                                  .catch(() => toast({ title: "Publish failed", variant: "destructive" }))
                                  .finally(() => setGigPublishing(null));
                              }}
                              disabled={gigPublishing === gig.id || gigRejecting === gig.id}
                              className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/25 transition-all disabled:opacity-50"
                              data-testid={`gig-publish-btn-${gig.id}`}
                            >
                              <Check className="w-3 h-3" />
                              {gigPublishing === gig.id ? "Publishing…" : "Publish"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {gigAggStats?.lastRunAt && (
          <p className="mt-2 text-[11px] text-muted-foreground/50 text-center">
            Last scrape: {new Date(gigAggStats.lastRunAt).toLocaleString()} · {gigAggStats.totalFetched} total fetched · Cycles: {gigAggStats.cycles}
          </p>
        )}
      </div>

      {/* Super Admin Support Center */}
      <div data-testid="section-support-desk">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-secondary" /> Super Admin Support Center
            {adminTicketStats && adminTicketStats.vip > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 animate-pulse" data-testid="badge-vip-open">
                <Crown className="w-2.5 h-2.5" /> {adminTicketStats.vip} VIP
              </span>
            )}
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Open: {adminTicketStats?.open ?? 0}</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Pending: {adminTicketStats?.pending ?? 0}</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Resolved: {adminTicketStats?.resolved ?? 0}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-4 flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-cyan-300" /> Tickets submitted by users on the <strong className="text-white/70">/support</strong> page. Simple queries are auto-resolved by the AI agent in real time.
        </p>

        {/* Quick Reply Templates */}
        <div className="mb-4 flex flex-wrap gap-2" data-testid="quick-reply-templates">
          {QUICK_REPLY_TEMPLATES.map((tmpl, i) => (
            <button
              key={i}
              onClick={() => setReplyText(tmpl)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-muted-foreground/70 hover:text-cyan-300 hover:border-cyan-400/30 transition-colors bg-white/[0.02]"
              data-testid={`template-${i}`}
            >
              {tmpl.slice(0, 50)}{tmpl.length > 50 ? "…" : ""}
            </button>
          ))}
        </div>

        <Card className="bg-[hsl(240,15%,8%)] border-white/8 overflow-hidden">
          {adminTickets.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-center" data-testid="no-admin-tickets">
              <LifeBuoy className="w-10 h-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground/50">No tickets submitted via the /support page yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence initial={false}>
                {adminTickets.map((ticket) => {
                  const isExpanded = activeReplyId === ticket.id;
                  const statusColors: Record<AdminTicket["status"], string> = {
                    Open: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
                    Pending: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
                    Resolved: "text-cyan-400 border-cyan-400/40 bg-cyan-400/10",
                    Archived: "text-muted-foreground border-white/15",
                  };
                  const sevColors: Record<AdminTicket["severity"], string> = {
                    High: "text-red-300 border-red-400/30",
                    Medium: "text-secondary border-secondary/30",
                    Low: "text-muted-foreground border-white/15",
                  };
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 hover:bg-white/[0.025] transition-colors"
                      data-testid={`ticket-${ticket.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[11px] font-mono text-muted-foreground/60">{ticket.id}</span>
                            <span className="text-xs text-muted-foreground">{ticket.userEmail}</span>
                            <Badge variant="outline" className={`text-[10px] ${statusColors[ticket.status]}`}>{ticket.status}</Badge>
                            <Badge variant="outline" className={`text-[10px] ${sevColors[ticket.severity]}`}>{ticket.severity}</Badge>
                            {ticket.isVip && (
                              <Badge variant="outline" className="text-[10px] text-yellow-300 border-yellow-400/30 bg-yellow-400/10 inline-flex items-center gap-0.5" data-testid={`badge-vip-${ticket.id}`}>
                                <Crown className="w-2.5 h-2.5" /> VIP
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-white/90 mb-1">{ticket.issue}</p>
                          {ticket.adminReply && (
                            <div className="pl-3 border-l-2 border-cyan-400/30 mb-1">
                              <p className="text-[11px] text-cyan-200">{ticket.adminReply}</p>
                            </div>
                          )}
                          <p className="text-[11px] text-muted-foreground/40">{new Date(ticket.submittedAt).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => { setActiveReplyId(isExpanded ? null : ticket.id); if (!isExpanded) setReplyText(""); }}
                            className="text-[11px] px-2 py-1 rounded border border-white/10 text-muted-foreground hover:text-cyan-300 hover:border-cyan-400/30 transition-colors"
                            data-testid={`btn-reply-${ticket.id}`}
                          >
                            <Send className="w-3 h-3" />
                          </button>
                          {ticket.status !== "Archived" && (
                            <button
                              onClick={() => handleStatusChange(ticket.id, "Archived")}
                              className="text-[11px] px-2 py-1 rounded border border-white/10 text-muted-foreground hover:text-yellow-300 hover:border-yellow-400/30 transition-colors"
                              data-testid={`btn-archive-${ticket.id}`}
                              title="Archive"
                            >
                              <Archive className="w-3 h-3" />
                            </button>
                          )}
                          {ticket.status === "Open" && (
                            <button
                              onClick={() => handleStatusChange(ticket.id, "Resolved")}
                              className="text-[11px] px-2 py-1 rounded border border-white/10 text-muted-foreground hover:text-emerald-300 hover:border-emerald-400/30 transition-colors"
                              data-testid={`btn-resolve-${ticket.id}`}
                              title="Resolve"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable quick reply panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 border-t border-white/8 pt-3"
                            data-testid={`reply-panel-${ticket.id}`}
                          >
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type reply or click a quick template above..."
                              rows={3}
                              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-cyan-400/30 resize-none mb-2"
                              data-testid={`input-reply-${ticket.id}`}
                            />
                            <div className="flex gap-2 flex-wrap">
                              {(["Resolved", "Pending", "Open"] as AdminTicket["status"][]).map((s) => (
                                <button
                                  key={s}
                                  disabled={replyLoading || !replyText.trim()}
                                  onClick={() => handleQuickReply(ticket.id, s)}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 disabled:opacity-40 transition-colors"
                                  data-testid={`btn-send-reply-${s.toLowerCase()}-${ticket.id}`}
                                >
                                  {replyLoading ? "Sending…" : `Reply & Mark ${s}`}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

