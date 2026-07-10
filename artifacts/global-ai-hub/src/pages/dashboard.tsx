import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Award, Bell, Bookmark, Sparkles, ExternalLink, Star, ArrowRight, CheckCheck, Crown, Rocket, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useSocial } from "@/context/SocialContext";
import { useListTools } from "@workspace/api-client-react";
import ToolSocialBar from "@/components/tools/ToolSocialBar";
import ActivityFeed from "@/components/social/ActivityFeed";
import SocialConnections from "@/components/social/SocialConnections";
import Leaderboard from "@/components/rewards/Leaderboard";
import RewardsWallet from "@/components/rewards/RewardsWallet";

function tierFor(points: number) {
  if (points >= 500) return { label: "Visionary", color: "text-secondary border-secondary/40 bg-secondary/10", next: null as number | null };
  if (points >= 200) return { label: "Innovator", color: "text-primary border-primary/40 bg-primary/10", next: 500 };
  if (points >= 50) return { label: "Explorer", color: "text-cyan-300 border-cyan-400/40 bg-cyan-400/10", next: 200 };
  return { label: "Newcomer", color: "text-muted-foreground border-white/15 bg-white/5", next: 50 };
}

const PREMIUM_BADGES: Record<"pro" | "enterprise", { label: string; icon: typeof Crown; color: string }[]> = {
  pro: [
    { label: "Pro Member", icon: Crown, color: "text-yellow-300 border-yellow-400/40 bg-yellow-400/10" },
    { label: "2x Token Multiplier", icon: Zap, color: "text-cyan-300 border-cyan-400/40 bg-cyan-400/10" },
    { label: "Priority Job Placement", icon: Rocket, color: "text-primary border-primary/40 bg-primary/10" },
  ],
  enterprise: [
    { label: "Enterprise Verified", icon: ShieldCheck, color: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10" },
    { label: "Pro Member", icon: Crown, color: "text-yellow-300 border-yellow-400/40 bg-yellow-400/10" },
    { label: "2x Token Multiplier", icon: Zap, color: "text-cyan-300 border-cyan-400/40 bg-cyan-400/10" },
    { label: "Priority Job Placement", icon: Rocket, color: "text-primary border-primary/40 bg-primary/10" },
  ],
};

export default function Dashboard() {
  const { user } = useAuth();
  const { hubPoints, notifications, unreadCount, markAllRead, bookmarkedIds } = useSocial();
  const { data } = useListTools({}, { query: { queryKey: ["listTools", "dashboard-all"] } });

  const tier = tierFor(hubPoints);
  const progressPct = tier.next ? Math.min(100, Math.round((hubPoints / tier.next) * 100)) : 100;
  const plan = user?.plan ?? "free";
  const isPro = plan === "pro" || plan === "enterprise";
  const premiumBadges = isPro ? PREMIUM_BADGES[plan as "pro" | "enterprise"] : [];

  const bookmarkedTools = useMemo(() => {
    const all = data?.tools ?? [];
    return all.filter((t) => bookmarkedIds.includes(t.id));
  }, [data, bookmarkedIds]);

  return (
    <div className="container mx-auto px-4 py-28 max-w-6xl" data-testid="page-user-dashboard">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-2.5 py-1 mb-3 text-primary border-primary/40 bg-primary/10">
          <Sparkles className="w-3 h-3" /> User &amp; Vendor Dashboard
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          Welcome back, {user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-muted-foreground mt-1">Track your engagement, notifications, and saved tools.</p>
      </div>

      {isPro && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          data-testid="banner-pro-member"
          className="relative mb-8 rounded-2xl border-2 border-yellow-400/70 bg-gradient-to-r from-yellow-500/10 via-[hsl(240,15%,8%)] to-yellow-500/10 p-5 overflow-hidden shadow-[0_0_35px_rgba(234,179,8,0.35)]"
        >
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-yellow-400/25 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-yellow-400/15 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-200 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                <Crown className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-white font-display font-bold text-lg leading-tight">
                  {plan === "enterprise" ? "Enterprise Member" : "Pro Member"}
                </p>
                <p className="text-xs text-yellow-200/80">Unlocked via verified crypto payment · All premium perks active</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {premiumBadges.map((b) => (
                <span
                  key={b.label}
                  data-testid={`badge-premium-${b.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold border rounded-full px-2.5 py-1 ${b.color}`}
                >
                  <b.icon className="w-3.5 h-3.5" /> {b.label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!isPro && (
        <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid="banner-upgrade-prompt">
          <p className="text-sm text-muted-foreground">
            Upgrade to <span className="text-yellow-300 font-semibold">Pro</span> for a glowing gold badge, 2x tokens, and priority placement.
          </p>
          <Link href="/pricing">
            <Button size="sm" className="rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold hover:from-yellow-400 hover:to-yellow-300" data-testid="btn-upgrade-now">
              Upgrade Now
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Hub Points */}
        <Card className="lg:col-span-1 bg-[hsl(240,15%,8%)] border-white/8 relative overflow-hidden" data-testid="card-hub-points">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Award className="w-4 h-4 text-primary" /> Hub Points
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-white mb-2" data-testid="text-hub-points">{hubPoints}</div>
            <span className={`inline-flex items-center text-xs font-semibold border rounded-full px-2.5 py-1 mb-4 ${tier.color}`}>{tier.label}</span>
            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              />
            </div>
            <p className="text-xs text-muted-foreground/70 mt-2">
              {tier.next ? `${tier.next - hubPoints} points to next tier` : "Max tier reached"}
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="lg:col-span-2 bg-[hsl(240,15%,8%)] border-white/8" data-testid="card-notifications">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Bell className="w-4 h-4 text-secondary" /> Active Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center text-[10px] font-bold text-white bg-secondary rounded-full w-5 h-5" data-testid="badge-unread-count">
                  {unreadCount}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-white flex items-center gap-1" data-testid="btn-mark-all-read">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto flex flex-col gap-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No notifications yet — like, comment, share, or bookmark a tool to get started.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  data-testid={`notification-${n.id}`}
                  className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm transition-colors ${
                    n.read ? "border-white/5 bg-white/[0.02] text-muted-foreground" : "border-primary/20 bg-primary/5 text-white"
                  }`}
                >
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${n.read ? "bg-white/20" : "bg-primary"}`} />
                  <div className="flex-1">
                    <p>{n.message}</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RewardsWallet />
        <Leaderboard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ActivityFeed />
        <SocialConnections />
      </div>

      {/* Bookmarked Tools */}
      <div data-testid="section-bookmarked-tools">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-primary" /> Bookmarked Tools
          </h2>
          <Link href="/tools" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            Browse tools <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {bookmarkedTools.length === 0 ? (
          <Card className="bg-[hsl(240,15%,8%)] border-white/8">
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              You haven't bookmarked any tools yet. Tap the bookmark icon on any tool card to save it here.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedTools.map((tool) => (
              <Card key={tool.id} className="bg-[hsl(240,15%,8%)] border-white/8 hover:border-primary/40 transition-all" data-testid={`bookmarked-tool-${tool.id}`}>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: `radial-gradient(circle at 30% 30%, ${tool.accentColor}, hsl(240,15%,14%))` }}
                    >
                      {tool.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{tool.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{tool.domain}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-yellow-400 flex-shrink-0">
                      <Star className="w-3 h-3 fill-yellow-400" /> {tool.rating}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <ToolSocialBar toolId={tool.id} toolName={tool.name} size="sm" />
                  </div>
                  <Button size="sm" asChild variant="outline" className="h-8 text-xs border-white/10 hover:border-primary hover:text-primary">
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="w-3 h-3 ml-1.5" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
