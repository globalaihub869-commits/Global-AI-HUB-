import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, AlertTriangle, AlertOctagon, Info, RefreshCw, Filter } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiFetch } from "@/context/AuthContext";

interface LogEntry {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  ip: string;
  reason: string;
  method: string;
  path: string;
  action: string;
  preBlockWarning: boolean;
  blocked: boolean;
  attemptNumber: number;
  createdAt: number;
}

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
};

type SevFilter = "all" | "critical" | "high" | "medium" | "low";

export default function HackerIntrusionLog() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SevFilter>("all");
  const [newCount, setNewCount] = useState(0);

  async function fetchLog() {
    try {
      const json = await apiFetch("/security/action-log") as { actions: LogEntry[] };
      setEntries((prev) => {
        const incoming = json.actions;
        if (incoming.length > prev.length) setNewCount(incoming.length - prev.length);
        return incoming;
      });
    } catch {} finally {
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

  const filtered = filter === "all" ? entries : entries.filter((e) => e.severity === filter);
  const counts = {
    critical: entries.filter((e) => e.severity === "critical").length,
    high: entries.filter((e) => e.severity === "high").length,
    medium: entries.filter((e) => e.severity === "medium").length,
    low: entries.filter((e) => e.severity === "low").length,
  };

  return (
    <Card className="border-red-500/20 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center border border-red-500/20">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              {newCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center"
                >
                  {newCount}
                </motion.span>
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
                Hacker Intrusion Log
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-red-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Live
                </motion.span>
              </h3>
              <p className="text-xs text-muted-foreground">{entries.length} events recorded · auto-refresh every 3s</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {(["all", "critical", "high", "medium", "low"] as SevFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border transition-all
                  ${filter === f
                    ? f === "critical" ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : f === "high" ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                    : f === "medium" ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                    : f === "low" ? "bg-white/10 border-white/20 text-muted-foreground"
                    : "bg-primary/20 border-primary/40 text-primary"
                    : "bg-transparent border-border text-muted-foreground/60 hover:border-border hover:text-muted-foreground"
                  }
                `}
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
        </div>

        <div className="flex items-center gap-4 mt-2 flex-wrap">
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
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading intrusion log…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No {filter === "all" ? "" : filter} events logged yet.</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {filtered.map((entry, i) => {
                const cfg = SEV_CONFIG[entry.severity];
                const ts = new Date(entry.createdAt).toLocaleTimeString();
                return (
                  <motion.div
                    key={entry.id}
                    initial={i < 3 ? { opacity: 0, x: -10 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-lg border px-3 py-2 ${cfg.bg} group`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full block mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded">
                            {entry.ip}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${entry.blocked ? "bg-red-500/20 text-red-400" : entry.preBlockWarning ? "bg-yellow-500/20 text-yellow-400" : "bg-card/40 text-muted-foreground"}`}>
                            {entry.blocked ? "BLOCKED" : entry.preBlockWarning ? `WARN #${entry.attemptNumber}` : "LOGGED"}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground/60 ml-auto">{ts}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate group-hover:whitespace-normal transition-all">
                          {entry.method} {entry.path} — {entry.reason}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
