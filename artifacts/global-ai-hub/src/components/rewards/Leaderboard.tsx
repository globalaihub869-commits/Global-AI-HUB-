import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetLeaderboard } from "@workspace/api-client-react";

const LEVEL_STYLES: Record<string, string> = {
  Bronze: "text-amber-500 border-amber-500/30 bg-amber-500/10",
  Silver: "text-slate-300 border-slate-300/30 bg-slate-300/10",
  Gold: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  Platinum: "text-cyan-300 border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_10px_rgba(34,211,238,0.35)]",
};

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-slate-300" />;
  if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
  return <span className="text-xs text-muted-foreground font-mono w-4 text-center">{rank}</span>;
}

export default function Leaderboard() {
  const { data, isLoading } = useGetLeaderboard({
    query: { queryKey: ["getLeaderboard"], refetchInterval: 15000 },
  });

  const entries = data?.entries ?? [];

  return (
    <Card className="bg-[hsl(240,15%,8%)] border-white/8" data-testid="card-leaderboard">
      <CardHeader className="pb-2 flex-row items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="text-muted-foreground text-sm">Top Contributors</span>
        <span className="ml-auto text-[11px] text-muted-foreground/50">AI Hub Tokens</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading leaderboard…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No activity yet — be the first to earn tokens.</p>
        ) : (
          entries.map((entry, i) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              data-testid={`leaderboard-row-${entry.rank}`}
              className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                entry.isCurrentUser ? "border-primary/40 bg-primary/5" : "border-white/5 bg-white/[0.02]"
              }`}
            >
              <div className="w-5 flex items-center justify-center flex-shrink-0">
                <RankIcon rank={entry.rank} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate flex items-center gap-1.5">
                  {entry.name}
                  {entry.isCurrentUser && <span className="text-[10px] text-primary font-semibold">(You)</span>}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold border rounded-full px-2 py-0.5 flex-shrink-0 ${
                  LEVEL_STYLES[entry.level] ?? "text-muted-foreground border-white/15 bg-white/5"
                }`}
                data-testid={`badge-level-${entry.rank}`}
              >
                <Award className="w-3 h-3" /> {entry.level}
              </span>
              <span className="text-sm font-mono text-secondary font-semibold w-14 text-right flex-shrink-0">{entry.tokens}</span>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
