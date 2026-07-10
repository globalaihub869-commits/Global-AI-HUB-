import { ShieldCheck, Lock } from "lucide-react";

export default function EscrowBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span
        data-testid="escrow-badge-compact"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-[10px] font-semibold text-cyan-300"
      >
        <Lock className="w-2.5 h-2.5" /> Escrow Locked
      </span>
    );
  }
  return (
    <div
      data-testid="escrow-badge"
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-cyan-400/30 bg-cyan-400/[0.06] shadow-[0_0_18px_rgba(34,211,238,0.15)]"
    >
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-cyan-400 blur-md opacity-40" />
        <ShieldCheck className="relative w-5 h-5 text-cyan-300" />
      </div>
      <div className="leading-tight">
        <p className="text-xs font-bold text-cyan-300">Secure Smart Contract Escrow</p>
        <p className="text-[11px] text-muted-foreground">Funds Locked until delivery is confirmed</p>
      </div>
    </div>
  );
}
