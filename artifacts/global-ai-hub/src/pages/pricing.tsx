import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Rocket, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, type PlanTier } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import FlashSaleCountdown from "@/components/pricing/FlashSaleCountdown";
import CryptoPayModal from "@/components/billing/CryptoPayModal";

interface PlanCard {
  id: PlanTier;
  name: string;
  icon: typeof Sparkles;
  price: string;
  amountUsdt: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
}

const PLAN_CARDS: PlanCard[] = [
  {
    id: "free",
    name: "Free",
    icon: Sparkles,
    price: "$0",
    amountUsdt: 0,
    tagline: "Explore the hub with essential tools",
    features: [
      "Browse AI tool directory",
      "Read daily AI news",
      "Basic Hub Points rewards",
      "Community chat access",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    price: "$19",
    amountUsdt: 19,
    tagline: "For power users who live in the AI ecosystem",
    features: [
      "Everything in Free",
      "Advanced filters & personalized feed",
      "Early access to new tools",
      "Gold Pro Member badge & profile glow",
      "2x AI Hub Token earning rate",
      "Priority job board placement",
    ],
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Rocket,
    price: "$99",
    amountUsdt: 99,
    tagline: "For teams and organizations scaling with AI",
    features: [
      "Everything in Pro",
      "Team seats & shared dashboards",
      "Dedicated account support",
      "Custom AI tool integrations",
      "Verified Enterprise badge",
      "API rate-limit boost",
    ],
  },
];

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [payingPlan, setPayingPlan] = useState<PlanCard | null>(null);

  const handleSelect = (plan: PlanCard) => {
    if (plan.id === "free") return;
    if (!isAuthenticated) {
      toast({ title: "Sign in required", description: "Create an account to upgrade your plan." });
      navigate("/signup");
      return;
    }
    if (user?.plan === plan.id || (user?.plan === "enterprise" && plan.id === "pro")) {
      toast({ title: "Already active", description: `You're already on the ${plan.name} plan or higher.` });
      return;
    }
    setPayingPlan(plan);
  };

  return (
    <div className="container mx-auto px-4 py-28 max-w-6xl" data-testid="page-pricing">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-2.5 py-1 mb-4 text-primary border-primary/40 bg-primary/10">
          <Sparkles className="w-3 h-3" /> Simple, Transparent Pricing
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
          Choose Your <span className="text-primary [text-shadow:0_0_20px_rgba(168,85,247,0.5)]">Power Level</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Pay instantly with USDT via TRC20. No cards, no borders, no delays.
        </p>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold border border-emerald-400/30 text-emerald-400 bg-emerald-400/10 rounded-full px-2.5 py-1 mt-4">
          <ShieldCheck className="w-3.5 h-3.5" /> USDT · TRC20 Network
        </div>
      </div>

      <FlashSaleCountdown />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLAN_CARDS.map((plan, i) => {
          const Icon = plan.icon;
          const isCurrent = user?.plan === plan.id;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                data-testid={`card-plan-${plan.id}`}
                className={`relative h-full flex flex-col overflow-hidden ${
                  plan.highlight
                    ? "border-yellow-400/40 bg-gradient-to-b from-yellow-500/[0.07] to-[hsl(240,15%,8%)] shadow-[0_0_40px_rgba(234,179,8,0.12)]"
                    : "border-white/8 bg-[hsl(240,15%,8%)]"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 right-0 text-[10px] font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-300 px-3 py-1 rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}
                <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl ${plan.highlight ? "bg-yellow-400/15" : "bg-primary/10"}`} />
                <CardHeader className="pb-2 relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${plan.highlight ? "bg-yellow-400/15 text-yellow-300" : "bg-primary/15 text-primary"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col relative">
                  <div className="mb-5">
                    <span className="text-3xl font-display font-bold text-white">{plan.price}</span>
                    {plan.id !== "free" && <span className="text-muted-foreground text-sm"> / month, in USDT</span>}
                  </div>
                  <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-yellow-400" : "text-primary"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSelect(plan)}
                    disabled={isCurrent}
                    data-testid={`btn-select-plan-${plan.id}`}
                    className={`w-full rounded-full font-semibold ${
                      isCurrent
                        ? "bg-white/5 text-muted-foreground cursor-default"
                        : plan.highlight
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:from-yellow-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                        : plan.id === "free"
                        ? "bg-white/8 text-white hover:bg-white/12"
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {isCurrent ? "Current Plan" : plan.id === "free" ? "Included by Default" : "Pay with USDT"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {payingPlan && (
        <CryptoPayModal
          plan={payingPlan.id}
          planName={payingPlan.name}
          amountUsdt={payingPlan.amountUsdt}
          onClose={() => setPayingPlan(null)}
        />
      )}
    </div>
  );
}
