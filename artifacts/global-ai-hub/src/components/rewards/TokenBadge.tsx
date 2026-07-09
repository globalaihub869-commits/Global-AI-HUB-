import { Link } from "wouter";
import { Coins } from "lucide-react";
import { useGetMyTokenBalance } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";

const LEVEL_COLOR: Record<string, string> = {
  Bronze: "text-amber-500",
  Silver: "text-slate-300",
  Gold: "text-yellow-400",
  Platinum: "text-cyan-300",
};

export default function TokenBadge() {
  const { isAuthenticated } = useAuth();
  const { data } = useGetMyTokenBalance({
    query: { queryKey: ["getMyTokenBalance"], enabled: isAuthenticated, refetchInterval: 10000 },
  });

  if (!isAuthenticated) return null;

  const balance = data?.balance ?? 0;
  const level = data?.level ?? "Bronze";

  return (
    <Link
      href="/dashboard"
      data-testid="token-badge"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-secondary/40 transition-all"
    >
      <Coins className="w-3.5 h-3.5 text-secondary" />
      <span className="text-sm font-semibold text-white" data-testid="text-token-balance">{balance}</span>
      <span className={`hidden md:inline text-[11px] font-semibold ${LEVEL_COLOR[level] ?? "text-muted-foreground"}`}>{level}</span>
    </Link>
  );
}
