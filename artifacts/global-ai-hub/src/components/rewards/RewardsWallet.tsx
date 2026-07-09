import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  Wallet, ShieldCheck, Sparkles, Gift, CreditCard, Megaphone, Shirt, Zap, X, Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetMyTokenBalance, useListRewards, useRedeemReward } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const REWARD_ICONS: Record<string, typeof Gift> = {
  badge: ShieldCheck,
  credit: CreditCard,
  spotlight: Megaphone,
  swag: Shirt,
  priority: Zap,
};

export default function RewardsWallet() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: balanceData } = useGetMyTokenBalance({
    query: { queryKey: ["getMyTokenBalance"], refetchInterval: 10000 },
  });
  const { data: rewardsData } = useListRewards({ query: { queryKey: ["listRewards"] } });
  const redeem = useRedeemReward();

  const balance = balanceData?.balance ?? 0;
  const rewards = rewardsData?.rewards ?? [];

  const handleRedeem = (id: string, name: string, cost: number) => {
    if (balance < cost) {
      toast({ title: "Not enough tokens", description: `You need ${cost - balance} more tokens to redeem ${name}.`, variant: "destructive" });
      return;
    }
    redeem.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["getMyTokenBalance"] });
          queryClient.invalidateQueries({ queryKey: ["getLeaderboard"] });
          toast({ title: "Redeemed (simulated)", description: `${name} has been queued. No real fulfillment yet — this is a mockup.` });
        },
        onError: () => toast({ title: "Redemption failed", description: "Please try again.", variant: "destructive" }),
      },
    );
  };

  return (
    <Card className="bg-[hsl(240,15%,8%)] border-white/8 relative overflow-hidden" data-testid="card-rewards-wallet">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Wallet className="w-4 h-4 text-secondary" /> Rewards Wallet
        </div>
        <button
          onClick={() => setOpen(true)}
          data-testid="btn-open-wallet"
          className="text-xs text-secondary hover:text-white transition-colors flex items-center gap-1"
        >
          View wallet <Sparkles className="w-3 h-3" />
        </button>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-3xl font-display font-bold text-white" data-testid="text-wallet-balance">{balance}</p>
            <p className="text-xs text-muted-foreground mt-1">AI Hub Tokens available</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 rounded-full px-2 py-1">
            <Lock className="w-3 h-3" /> Secure mock ledger
          </span>
        </div>
        <p className="text-xs text-muted-foreground/70">
          Earn tokens by posting, commenting, using tools, and watching AI news broadcasts. Redeem them below for hub perks.
        </p>
      </CardContent>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            data-testid="wallet-popup-overlay"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border border-secondary/20 bg-[hsl(240,15%,7%)] shadow-[0_0_60px_rgba(34,211,238,0.15)] overflow-hidden"
              data-testid="wallet-popup"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors z-10"
                data-testid="btn-close-wallet"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-primary/15 via-transparent to-secondary/10 border-b border-white/8">
                <div className="flex items-center gap-2 text-xs text-secondary font-semibold uppercase tracking-widest mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Simulated Secure Wallet
                </div>
                <p className="text-3xl font-display font-bold text-white">{balance} <span className="text-base text-muted-foreground font-normal">Tokens</span></p>
              </div>

              <div className="max-h-[50vh] overflow-y-auto px-6 py-4 flex flex-col gap-3">
                <p className="text-xs text-muted-foreground/70 mb-1">Redeemable rewards</p>
                {rewards.map((reward) => {
                  const Icon = REWARD_ICONS[reward.icon] ?? Gift;
                  const affordable = balance >= reward.cost;
                  return (
                    <div
                      key={reward.id}
                      data-testid={`reward-row-${reward.id}`}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        affordable ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-white/[0.01] opacity-60"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{reward.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{reward.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs font-mono text-secondary">{reward.cost}</span>
                        <Button
                          size="sm"
                          disabled={!affordable || redeem.isPending}
                          onClick={() => handleRedeem(reward.id, reward.name, reward.cost)}
                          className="h-7 px-2.5 text-[11px] bg-primary hover:bg-primary/90 text-white disabled:opacity-40"
                          data-testid={`btn-redeem-${reward.id}`}
                        >
                          Redeem
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
