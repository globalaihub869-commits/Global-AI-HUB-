import { Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function TrialWalletBadge() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return null;

  return (
    <span
      data-testid="trial-wallet-badge"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 hover:bg-emerald-400/15 transition-all shadow-[0_0_12px_rgba(52,211,153,0.15)]"
      title="Trial Wallet Balance — use it to try marketplace purchases instantly"
    >
      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
      <span className="text-sm font-semibold text-white" data-testid="text-wallet-balance">
        ${user.walletBalanceUsd.toFixed(2)}
      </span>
      <span className="hidden md:inline text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">Trial</span>
    </span>
  );
}
