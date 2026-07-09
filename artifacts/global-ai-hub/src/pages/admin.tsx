import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, Activity, Users, Globe2, Gauge, LifeBuoy, Clock, CheckCircle2, AlertTriangle, CircleDot,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrafficPoint {
  t: number;
  visitors: number;
}

interface Ticket {
  id: string;
  user: string;
  issue: string;
  status: "Open" | "Pending" | "Resolved";
  severity: "Low" | "Medium" | "High";
  submittedAt: string;
}

const SEED_TICKETS: Ticket[] = [
  { id: "TCK-1042", user: "amara.dev@proton.me", issue: "Face scan step on Account Recovery gets stuck at 80%.", status: "Open", severity: "High", submittedAt: "2026-07-09T08:12:00Z" },
  { id: "TCK-1041", user: "l.moreau@studio.io", issue: "Can't find the 'Forgot User ID?' link on mobile viewport.", status: "Pending", severity: "Medium", submittedAt: "2026-07-09T07:44:00Z" },
  { id: "TCK-1040", user: "priya.k@venturelab.com", issue: "Aria assistant widget not responding to voice input on Safari.", status: "Open", severity: "Medium", submittedAt: "2026-07-08T22:15:00Z" },
  { id: "TCK-1039", user: "d.oyelaran@marketly.ai", issue: "Bookmarked tools not appearing after switching languages to Arabic.", status: "Resolved", severity: "Low", submittedAt: "2026-07-08T19:03:00Z" },
  { id: "TCK-1038", user: "j.tanaka@codeforge.dev", issue: "Requesting bulk export of Hub Points history for finance records.", status: "Pending", severity: "Low", submittedAt: "2026-07-08T14:51:00Z" },
  { id: "TCK-1037", user: "s.nwosu@brightpath.edu", issue: "Document upload rejects valid PDF passports during recovery flow.", status: "Resolved", severity: "High", submittedAt: "2026-07-07T11:20:00Z" },
];

const statusStyle: Record<Ticket["status"], string> = {
  Open: "text-red-400 border-red-400/40 bg-red-400/10",
  Pending: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  Resolved: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
};

const severityStyle: Record<Ticket["severity"], string> = {
  High: "text-red-300 border-red-400/30",
  Medium: "text-secondary border-secondary/30",
  Low: "text-muted-foreground border-white/15",
};

const statusIcon: Record<Ticket["status"], React.ElementType> = {
  Open: AlertTriangle,
  Pending: Clock,
  Resolved: CheckCircle2,
};

const REGIONS = ["United States", "Germany", "India", "Brazil", "Japan", "Nigeria", "France", "UAE"];

export default function AdminDashboard() {
  const [activeUsers, setActiveUsers] = useState(312);
  const [requestsPerMin, setRequestsPerMin] = useState(1840);
  const [pageViews, setPageViews] = useState(58211);
  const [errorRate, setErrorRate] = useState(0.42);
  const [history, setHistory] = useState<TrafficPoint[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({ t: i, visitors: 280 + Math.round(Math.sin(i / 2) * 30) })),
  );
  const [feed, setFeed] = useState<{ id: string; text: string }[]>([]);

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

      {/* Support desk */}
      <div data-testid="section-support-desk">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-secondary" /> Customer Support &amp; Help Desk
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Open: {SEED_TICKETS.filter((t) => t.status === "Open").length}</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Pending: {SEED_TICKETS.filter((t) => t.status === "Pending").length}</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Resolved: {SEED_TICKETS.filter((t) => t.status === "Resolved").length}</span>
          </div>
        </div>

        <Card className="bg-[hsl(240,15%,8%)] border-white/8 overflow-hidden">
          <div className="divide-y divide-white/5">
            {SEED_TICKETS.map((ticket) => {
              const Icon = statusIcon[ticket.status];
              return (
                <div key={ticket.id} className="flex items-start gap-4 p-4 hover:bg-white/[0.03] transition-colors" data-testid={`ticket-${ticket.id}`}>
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${statusStyle[ticket.status].split(" ")[0]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-muted-foreground/60">{ticket.id}</span>
                      <span className="text-xs text-muted-foreground">{ticket.user}</span>
                      <Badge variant="outline" className={`text-[10px] ${severityStyle[ticket.severity]}`}>{ticket.severity}</Badge>
                    </div>
                    <p className="text-sm text-white/90">{ticket.issue}</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-1">{new Date(ticket.submittedAt).toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs flex-shrink-0 ${statusStyle[ticket.status]}`}>{ticket.status}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
