import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Check, Users, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/context/AuthContext";

interface ReferralStats {
  code: string;
  totalInvites: number;
  totalPointsEarned: number;
  pointsThisWindow: number;
  monthlyCap: number | null;
  capped: boolean;
  recentInvites: { invitedEmail: string; points: number; createdAt: number }[];
}

/**
 * "Smart Growth" (SG) Viral Referral Engine — invite widget.
 * Reward points are strictly capped per Subscription Tier Lock rules on the
 * backend; the UI reflects the live cap/progress returned by the API.
 */
export default function ReferralCard() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch("/referrals/me").then(setStats).catch(() => {});
  }, []);

  if (!stats) return null;

  const inviteLink = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/signup?ref=${stats.code}`;
  const progressPct = stats.monthlyCap ? Math.min(100, Math.round((stats.pointsThisWindow / stats.monthlyCap) * 100)) : 100;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-[hsl(240,15%,8%)] border-emerald-400/20 relative overflow-hidden" data-testid="card-sg-referral">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-400/15 blur-3xl" />
      <CardHeader className="pb-2 relative">
        <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
          <Gift className="w-4 h-4" /> Invite &amp; Earn — Smart Growth (SG)
        </div>
      </CardHeader>
      <CardContent className="relative">
        <p className="text-xs text-muted-foreground mb-4">
          Share your link. Every friend who joins earns you reward points instantly.
        </p>

        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 mb-4">
          <code className="flex-1 text-xs text-emerald-300 truncate" data-testid="text-referral-link">{inviteLink}</code>
          <button onClick={handleCopy} data-testid="btn-copy-referral-link" className="text-muted-foreground hover:text-emerald-300 transition-colors flex-shrink-0">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-white text-xl font-display font-bold">
              <Users className="w-4 h-4 text-emerald-300" /> {stats.totalInvites}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total Invites</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-white text-xl font-display font-bold">
              <Sparkles className="w-4 h-4 text-yellow-300" /> {stats.totalPointsEarned}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Points Earned</p>
          </div>
        </div>

        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>This month</span>
          <span data-testid="text-referral-cap">
            {stats.pointsThisWindow} / {stats.monthlyCap ?? "∞"} pts
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden mb-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        {stats.capped && (
          <p className="text-[11px] text-yellow-300 flex items-center gap-1" data-testid="text-referral-capped">
            Monthly reward cap reached — upgrade your plan to unlock more SG points.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
