import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, ShieldBan, ShieldCheck, RefreshCw, Filter,
  AlertOctagon, AlertTriangle, Info, Ban, UserCheck, Wifi,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ThreatEntry {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  ip: string;
  country: string;
  method: string;
  path: string;
  action: string;
  reason: string;
  blocked: boolean;
  permanentBlock: boolean;
  preBlockWarning: boolean;
  attemptNumber: number;
  createdAt: number;
}

interface CaptchaEntry {
  id: string;
  ip: string;
  country: string;
  reason: string;
  solved: boolean;
  whitelisted: boolean;
  challengedAt: number;
}

// ── Severity config ───────────────────────────────────────────────────────────

const SEV_CONFIG = {
  critical: {
    label: "CRITICAL",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    dot: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]",
    icon: AlertOctagon,
  },
  high: {
    label: "HIGH",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
    dot: "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]",
    icon: AlertTriangle,
  },
  medium: {
    label: "MED",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    dot: "bg-yellow-500 shadow-[0_0_4px_rgba(234,179,8,0.6)]",
    icon: AlertTriangle,
  },
  low: {
    label: "LOW",
    color: "text-muted-foreground",
    bg: "bg-card/60 border-border",
    dot: "bg-muted-foreground/60",
    icon: Info,
  },
} as const;

const THREAT_TYPE_LABELS: Record<string, string> = {
  exploit_attempt: "Exploit / Injection",
  bot_signature: "Bot / Scraper",
  brute_force: "Brute-Force Login",
  rate_abuse: "Hard Rate-Limit Block",
};

type SevFilter = "all" | "critical" | "high" | "medium" | "low";

// ── Tab 1: Threats & Bot Logs ─────────────────────────────────────────────────

function ThreatsTab() {
  const [entries, setEntries] = useState<ThreatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SevFilter>("all");
  const [newCount, setNewCount] = useState(0);
  const [blockingIp, setBlockingIp] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchLog() {
    try {
      const json = await apiFetch("/security/action-log") as { actions: ThreatEntry[] };
      setEntries((prev) => {
        const incoming = json.actions;
        if (incoming.length > prev.length) setNewCount(incoming.length - prev.length);
        return incoming;
      });
    } catch {
      // silently retry on next interval
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLog();
    const interval = setInterval(fetchLog, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (newCount <= 0) return;
    const t = setTimeout(() => setNewCount(0), 2000);
    return () => clearTimeout(t);
  }, [newCount]);

  const handlePermanentBlock = async (ip: string) => {
    setBlockingIp(ip);
    try {
      await apiFetch("/security/permanent-block", {
        method: "POST",
        body: JSON.stringify({ ip }),
      });
      toast({ title: "🔒 IP Permanently Blocked", description: `${ip} is now permanently blocked with no expiry.`, variant: "destructive" });
      fetchLog();
    } catch (e) {
      toast({ title: "Block failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setBlockingIp(null);
    }
  };

  const filtered = filter === "all" ? entries : entries.filter((e) => e.severity === filter);
  const counts = {
    critical: entries.filter((e) => e.severity === "critical").length,
    high: entries.filter((e) => e.severity === "high").length,
    medium: entries.filter((e) => e.severity === "medium").length,
    low: entries.filter((e) => e.severity === "low").length,
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-1 flex-wrap mb-3">
        {(["all", "critical", "high", "medium", "low"] as SevFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border transition-all ${
              filter === f
                ? f === "critical" ? "bg-red-500/20 border-red-500/40 text-red-400"
                : f === "high" ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                : f === "medium" ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                : f === "low" ? "bg-white/10 border-white/20 text-muted-foreground"
                : "bg-primary/20 border-primary/40 text-primary"
                : "bg-transparent border-border text-muted-foreground/60 hover:border-border hover:text-muted-foreground"
            }`}
          >
            {f === "all" ? `All (${entries.length})` : `${f} (${counts[f as keyof typeof counts]})`}
          </button>
        ))}
        <button
          onClick={fetchLog}
          className="ml-1 p-1 rounded-full border border-border text-muted-foreground/60 hover:text-muted-foreground transition-all"
          title="Refresh"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Severity counters */}
      <div className="flex items-center gap-4 flex-wrap mb-3">
        {(["critical", "high", "medium", "low"] as const).map((sev) => {
          const cfg = SEV_CONFIG[sev];
          return (
            <div key={sev} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <span className={`text-[10px] font-semibold ${cfg.color}`}>{counts[sev]} {sev}</span>
            </div>
          );
        })}
      </div>

      {/* Log entries */}
      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading threat log…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Filter className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No {filter === "all" ? "" : filter} threats logged yet — all clear.</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {filtered.map((entry, i) => {
              const cfg = SEV_CONFIG[entry.severity];
              const SevIcon = cfg.icon;
              return (
                <motion.div
                  key={entry.id}
                  initial={i < 4 ? { opacity: 0, x: -10 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-lg border px-3 py-2.5 ${cfg.bg} group`}
                  data-testid={`threat-row-${entry.id}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full block mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${cfg.color}`}>
                          <SevIcon className="w-3 h-3" /> {cfg.label}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded">
                          {entry.ip}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-orange-400/30 text-orange-300 bg-orange-400/10">
                          {THREAT_TYPE_LABELS[entry.type] ?? entry.type}
                        </Badge>
                        {entry.permanentBlock && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-red-500/50 text-red-400 bg-red-500/10">
                            PERMANENT
                          </Badge>
                        )}
                        <span className="text-[10px] font-mono text-muted-foreground/60 ml-auto">
                          {new Date(entry.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate group-hover:whitespace-normal transition-all">
                        {entry.reason}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-red-300 border-red-400/40 bg-red-400/10">
                          AUTO-BLOCKED
                        </Badge>
                        {!entry.permanentBlock && (
                          <button
                            onClick={() => handlePermanentBlock(entry.ip)}
                            disabled={blockingIp === entry.ip}
                            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border border-red-600/50 text-red-400 bg-red-600/10 hover:bg-red-600/20 disabled:opacity-50 transition-colors"
                            data-testid={`btn-permanent-block-${entry.ip}`}
                          >
                            <Ban className="w-2.5 h-2.5" />
                            {blockingIp === entry.ip ? "Blocking…" : "Permanently Block"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: User Verification Logs ─────────────────────────────────────────────

function CaptchaTab() {
  const [entries, setEntries] = useState<CaptchaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [whitelistingIp, setWhitelistingIp] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchCaptchaLog() {
    try {
      const json = await apiFetch("/security/captcha-log") as { entries: CaptchaEntry[] };
      setEntries(json.entries);
    } catch {
      // retry on next interval
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCaptchaLog();
    const interval = setInterval(fetchCaptchaLog, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleWhitelist = async (ip: string) => {
    setWhitelistingIp(ip);
    try {
      await apiFetch("/security/whitelist-ip", {
        method: "POST",
        body: JSON.stringify({ ip }),
      });
      setEntries((prev) =>
        prev.map((e) => e.ip === ip ? { ...e, whitelisted: true, solved: true } : e)
      );
      toast({ title: "✅ IP Whitelisted", description: `${ip} will never be challenged again.` });
    } catch (e) {
      toast({ title: "Whitelist failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setWhitelistingIp(null);
    }
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">
        These are real users who triggered the soft rate-limit (browsing quickly or using a VPN) and were shown the
        "Are you human?" CAPTCHA challenge. No auto-block applied — whitelist any legitimate user instantly.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading verification log…</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No CAPTCHA challenges issued yet.</p>
          <p className="text-xs mt-1 opacity-60">
            Legitimate users who browse quickly will appear here — not in the hacker log.
          </p>
        </div>
      ) : (
        <div className="overflow-auto max-h-[420px]">
          <table className="w-full text-xs" data-testid="captcha-log-table">
            <thead className="sticky top-0 bg-[hsl(240,15%,8%)] text-muted-foreground/60">
              <tr className="text-left border-b border-white/5">
                <th className="px-3 py-2 font-medium">IP Address</th>
                <th className="px-3 py-2 font-medium">Country</th>
                <th className="px-3 py-2 font-medium">Reason</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence initial={false}>
                {entries.map((entry) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-white/[0.02] transition-colors"
                    data-testid={`captcha-row-${entry.id}`}
                  >
                    <td className="px-3 py-2 font-mono text-white whitespace-nowrap">
                      {entry.ip}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Wifi className="w-3 h-3 opacity-50" />
                        {entry.country}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">
                      {entry.reason}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {entry.whitelisted ? (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-emerald-300 border-emerald-400/40 bg-emerald-400/10">
                          ✓ Whitelisted
                        </Badge>
                      ) : entry.solved ? (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-cyan-300 border-cyan-400/40 bg-cyan-400/10">
                          ✓ Solved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-yellow-300 border-yellow-400/30 bg-yellow-400/10">
                          ⏳ Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground/50 whitespace-nowrap">
                      {new Date(entry.challengedAt).toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {!entry.whitelisted && (
                        <button
                          onClick={() => handleWhitelist(entry.ip)}
                          disabled={whitelistingIp === entry.ip}
                          className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                          data-testid={`btn-whitelist-${entry.ip}`}
                        >
                          <ShieldCheck className="w-2.5 h-2.5" />
                          {whitelistingIp === entry.ip ? "Whitelisting…" : "Whitelist IP"}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main SecurityTabPanel export ──────────────────────────────────────────────

type TabKey = "threats" | "captcha";

const TABS: { key: TabKey; label: string; icon: React.ElementType; color: string }[] = [
  { key: "threats", label: "Threats & Bot Logs", icon: ShieldBan, color: "text-red-400 border-red-500/30 bg-red-500/10" },
  { key: "captcha", label: "User Verification Logs", icon: UserCheck, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
];

export default function SecurityTabPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>("threats");
  const [newThreatCount, setNewThreatCount] = useState(0);

  // Badge counter for Tab 1
  useEffect(() => {
    let lastCount = 0;
    const interval = setInterval(async () => {
      try {
        const json = await apiFetch("/security/threats") as { totalThreatsBlocked: number };
        const current = json.totalThreatsBlocked;
        if (lastCount > 0 && current > lastCount) setNewThreatCount(current - lastCount);
        lastCount = current;
      } catch { /* ignore */ }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (newThreatCount <= 0) return;
    const t = setTimeout(() => setNewThreatCount(0), 3000);
    return () => clearTimeout(t);
  }, [newThreatCount]);

  return (
    <Card className="border-red-500/20 bg-card" data-testid="card-security-tab-panel">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="relative w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center border border-red-500/20">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            {newThreatCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center"
              >
                {newThreatCount}
              </motion.span>
            )}
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
              Security Intelligence
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-red-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Live
              </motion.span>
            </h3>
            <p className="text-xs text-muted-foreground">Automatic threat discrimination — hackers vs. humans</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                data-testid={`tab-btn-${tab.key}`}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  isActive
                    ? tab.color
                    : "border-border text-muted-foreground/60 hover:text-muted-foreground hover:border-white/20 bg-transparent"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "threats" ? <ThreatsTab /> : <CaptchaTab />}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
