import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, DollarSign, Crown, Award, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiFetch } from "@/context/AuthContext";

interface ExecSummary {
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

function CountUp({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    const start = prev.current;
    const end = value;
    const duration = 600;
    const startTime = performance.now();
    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    prev.current = value;
  }, [value]);

  return <span>{prefix}{displayed.toLocaleString()}{suffix}</span>;
}

export default function LiveRevenueTracker() {
  const [data, setData] = useState<ExecSummary | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pulse, setPulse] = useState(false);

  async function fetchData() {
    try {
      const json = await apiFetch("/security/executive-summary") as ExecSummary;
      setData(json);
      setLastUpdated(new Date());
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    } catch {}
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const metrics = data
    ? [
        {
          label: "Total Revenue",
          value: data.totalRevenueUsdt,
          prefix: "$",
          suffix: " USDT",
          icon: DollarSign,
          color: "text-emerald-400",
          glow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]",
          bg: "bg-emerald-400/10 border-emerald-400/20",
        },
        {
          label: "Total Conversions",
          value: data.totalConversions,
          suffix: " paid",
          icon: TrendingUp,
          color: "text-cyan-400",
          glow: "shadow-[0_0_20px_rgba(34,211,238,0.15)]",
          bg: "bg-cyan-400/10 border-cyan-400/20",
        },
        {
          label: "Pro Members",
          value: data.proCount,
          suffix: " users",
          icon: Award,
          color: "text-primary",
          glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
          bg: "bg-primary/10 border-primary/20",
        },
        {
          label: "Enterprise VIPs",
          value: data.enterpriseCount,
          suffix: " users",
          icon: Crown,
          color: "text-yellow-400",
          glow: "shadow-[0_0_20px_rgba(250,204,21,0.15)]",
          bg: "bg-yellow-400/10 border-yellow-400/20",
        },
      ]
    : [];

  return (
    <Card className="border-emerald-500/20 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-sm">Live Revenue Tracker</h3>
              <p className="text-xs text-muted-foreground">Real-time platform revenue · updates every 5s</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={pulse ? { scale: [1, 1.6, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
            />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Live</span>
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground/60 hidden sm:block">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!data ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading revenue data…</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metrics.map((m) => (
                <motion.div
                  key={m.label}
                  layout
                  className={`rounded-xl border p-3 ${m.bg} ${m.glow}`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{m.label}</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={m.value}
                      initial={{ opacity: 0.4, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-lg font-display font-bold ${m.color}`}
                    >
                      <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} />
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card/60 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Crown className="w-3 h-3" /> High-Value Conversions
                </p>
                <div className="flex items-end gap-2 mb-1.5">
                  <span className="text-2xl font-display font-bold text-yellow-400">
                    {data.highValueConversions}
                  </span>
                  <span className="text-xs text-muted-foreground pb-0.5">premium upgrades</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${data.totalConversions > 0 ? (data.highValueConversions / data.totalConversions) * 100 : 0}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {data.totalConversions > 0
                    ? `${((data.highValueConversions / data.totalConversions) * 100).toFixed(1)}% of total conversions`
                    : "No conversions yet"}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card/60 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Recent Conversions
                </p>
                {data.recentConversions.length === 0 ? (
                  <p className="text-xs text-muted-foreground/60 py-2">No conversions yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-20 overflow-y-auto">
                    {data.recentConversions.slice(0, 4).map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground truncate max-w-[120px]">{c.userEmail}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="capitalize text-primary font-semibold">{c.plan}</span>
                          <span className="text-emerald-400 font-mono">${c.amountUsdt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
