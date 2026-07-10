import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, Activity, Users, Globe2, Gauge, LifeBuoy, Clock, CheckCircle2, AlertTriangle, CircleDot,
  BrainCircuit, Bot, Ticket as TicketIcon, Code2, Blocks, Lock, Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupport, type SupportTicket } from "@/context/SupportContext";
import { apiFetch } from "@/context/AuthContext";

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

interface TrafficPoint {
  t: number;
  visitors: number;
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

const REGIONS = ["United States", "Germany", "India", "Brazil", "Japan", "Nigeria", "France", "UAE"];

export default function AdminDashboard() {
  const { tickets, healEvents, healthStatus, totalAutoHeals } = useSupport();
  const [activeUsers, setActiveUsers] = useState(312);
  const [requestsPerMin, setRequestsPerMin] = useState(1840);
  const [pageViews, setPageViews] = useState(58211);
  const [errorRate, setErrorRate] = useState(0.42);
  const [history, setHistory] = useState<TrafficPoint[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({ t: i, visitors: 280 + Math.round(Math.sin(i / 2) * 30) })),
  );
  const [feed, setFeed] = useState<{ id: string; text: string }[]>([]);
  const [playgroundActivity, setPlaygroundActivity] = useState<PlaygroundActivity | null>(null);

  useEffect(() => {
    const loadActivity = () => {
      apiFetch("/playground/admin/activity").then(setPlaygroundActivity).catch(() => {});
    };
    loadActivity();
    const interval = setInterval(loadActivity, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) => Math.max(120, prev + Math.round((Math.random() - 0.45) * 24)));
      setRequestsPerMin((prev) => Math.max(600, prev + Math.round((Math.random() - 0.5) * 180)));
      setPageViews((prev) => prev + Math.round(Math.random() * 40 + 5));
      setErrorRate((prev) => Math.max(0, Math.min(3, prev + (Math.random() - 0.5) * 0.15)));
      setHistory((prev) => {
        const next = [...prev.slice(1), { t: prev[prev.length - 1].t + 1, visitors: Math.max(80, activeUsers + Math.round((Math.random() - 0.5) * 40)) }];
        return next;
      });
      if (Math.random() < 0.5) {
        const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
        const pages = ["/tools", "/", "/news", "/models", "/dashboard"];
        const page = pages[Math.floor(Math.random() * pages.length)];
        setFeed((prev) => [
          { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: `New visitor from ${region} viewing ${page}` },
          ...prev,
        ].slice(0, 8));
      }
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const max = Math.max(...history.map((h) => h.visitors), 1);

  return (
    <div className="container mx-auto px-4 py-28 max-w-6xl" data-testid="page-admin-dashboard">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-2.5 py-1 mb-3 text-secondary border-secondary/40 bg-secondary/10">
          <ShieldAlert className="w-3 h-3" /> Super Admin Dashboard
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Live Operations Console</h1>
        <p className="text-muted-foreground mt-1">Private view — monitor real-time traffic and support health.</p>
      </div>

      {/* Live stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Users", value: activeUsers.toLocaleString(), icon: Users, color: "text-primary" },
          { label: "Requests / min", value: requestsPerMin.toLocaleString(), icon: Gauge, color: "text-secondary" },
          { label: "Page Views (24h)", value: pageViews.toLocaleString(), icon: Globe2, color: "text-cyan-300" },
          { label: "Error Rate", value: `${errorRate.toFixed(2)}%`, icon: Activity, color: errorRate > 1.5 ? "text-red-400" : "text-emerald-400" },
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
              {history.map((point, i) => (
                <motion.div
                  key={point.t}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, (point.visitors / max) * 100)}%` }}
                  transition={{ duration: 0.4 }}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/60 to-secondary/70"
                  style={{ opacity: 0.5 + (i / history.length) * 0.5 }}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-3">Concurrent visitors, updating every 2 seconds</p>
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
              {feed.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 py-4 text-center">Waiting for activity...</p>
              ) : (
                feed.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-2"
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

      {/* Support desk */}
      <div data-testid="section-support-desk">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-secondary" /> Customer Support &amp; Help Desk
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Open: {tickets.filter((t) => t.status === "Open").length}</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Pending: {tickets.filter((t) => t.status === "Pending").length}</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Resolved: {tickets.filter((t) => t.status === "Resolved").length}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-4 flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-cyan-300" /> Simple queries are auto-resolved by the AI Support Agent in real time — only complex tickets land here.
        </p>

        <Card className="bg-[hsl(240,15%,8%)] border-white/8 overflow-hidden">
          <div className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {tickets.map((ticket) => {
                const Icon = statusIcon[ticket.status];
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4 p-4 hover:bg-white/[0.03] transition-colors"
                    data-testid={`ticket-${ticket.id}`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${statusStyle[ticket.status].split(" ")[0]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-muted-foreground/60">{ticket.id}</span>
                        <span className="text-xs text-muted-foreground">{ticket.user}</span>
                        <Badge variant="outline" className={`text-[10px] ${severityStyle[ticket.severity]}`}>{ticket.severity}</Badge>
                        {ticket.source === "agent" && (
                          <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-400/30 inline-flex items-center gap-1">
                            <TicketIcon className="w-2.5 h-2.5" /> {sourceLabel[ticket.source]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-white/90">{ticket.issue}</p>
                      <p className="text-[11px] text-muted-foreground/50 mt-1">{new Date(ticket.submittedAt).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs flex-shrink-0 ${statusStyle[ticket.status]}`}>{ticket.status}</Badge>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  );
}
