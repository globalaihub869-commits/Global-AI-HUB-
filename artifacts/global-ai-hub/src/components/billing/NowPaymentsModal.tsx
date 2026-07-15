import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShieldCheck, Loader2, CreditCard, Bitcoin, CheckCircle2,
  ExternalLink, AlertTriangle, Crown, PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { type PlanTier } from "@/context/AuthContext";

interface Props {
  plan: PlanTier;
  planName: string;
  amountUsd: number;
  onClose: () => void;
}

type Step = "choose" | "loading" | "redirect" | "success";

function playVipChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const startAt = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(0.18, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + 0.6);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch {
    // Web Audio unavailable
  }
}

export default function NowPaymentsModal({ plan, planName, amountUsd, onClose }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("choose");
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createInvoice = async () => {
    setStep("loading");
    setError(null);
    try {
      const data = await apiFetch("/billing/nowpayments/create-invoice", {
        method: "POST",
        body: JSON.stringify({ plan }),
      }) as { invoiceUrl: string };
      setInvoiceUrl(data.invoiceUrl);
      setStep("redirect");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create payment. Please try again.");
      setStep("choose");
    }
  };

  const handleGoToPayment = () => {
    if (!invoiceUrl) return;
    // Open in same tab — NOWPayments will redirect back via success_url
    window.location.href = invoiceUrl;
  };

  const handleSuccess = async () => {
    // For demo/manual check: try to verify plan upgrade via polling
    setStep("success");
    try {
      await import("canvas-confetti").then(({ default: confetti }) => {
        playVipChime();
        const colors = ["#facc15", "#a855f7", "#22d3ee", "#ffffff"];
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.4 }, colors, startVelocity: 45, scalar: 1.1 });
        confetti({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0, y: 0.5 }, colors });
        confetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1, y: 0.5 }, colors });
      });
    } catch {
      // confetti is non-critical
    }
    toast({ title: "Payment sent!", description: "Your plan will activate automatically once confirmed." });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" data-testid="modal-nowpayments">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl border border-primary/30 bg-[hsl(240,18%,7%)] shadow-[0_0_60px_rgba(168,85,247,0.2)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-gradient-to-r from-primary/10 via-transparent to-cyan-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <Bitcoin className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">NOWPayments Checkout</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Crypto &amp; Card · Secure · Instant</p>
            </div>
          </div>
          <button onClick={onClose} data-testid="btn-close-nowpay-modal" className="text-muted-foreground hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* Step: choose method */}
            {step === "choose" && (
              <motion.div key="choose" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col gap-5">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Upgrading to</p>
                  <p className="text-xl font-display font-bold text-white">{planName} Plan</p>
                  <p className="text-2xl font-bold text-primary mt-1">${amountUsd} <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
                </div>

                {/* Supported payment methods */}
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment methods accepted</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Bitcoin (BTC)", color: "text-orange-400" },
                      { label: "Ethereum (ETH)", color: "text-blue-400" },
                      { label: "USDT (TRC20/ERC20)", color: "text-emerald-400" },
                      { label: "BNB / SOL / LTC", color: "text-yellow-400" },
                      { label: "Credit Card", color: "text-cyan-400" },
                      { label: "Debit Card", color: "text-purple-400" },
                    ].map(m => (
                      <div key={m.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className={`w-3 h-3 ${m.color} shrink-0`} />
                        {m.label}
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}

                <Button
                  onClick={createInvoice}
                  className="w-full rounded-full bg-gradient-to-r from-primary to-cyan-500 text-white font-bold hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  data-testid="btn-pay-now"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay ${amountUsd} — Choose Crypto or Card
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Payments secured by NOWPayments · Auto-activation on confirmation
                </div>
              </motion.div>
            )}

            {/* Step: creating invoice */}
            {step === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Creating your secure payment link…</p>
              </motion.div>
            )}

            {/* Step: invoice ready — redirect to NOWPayments */}
            {step === "redirect" && (
              <motion.div key="redirect" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col items-center gap-5 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Payment Link Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll be taken to NOWPayments' secure checkout where you can pay with crypto or card.
                    Your plan activates <span className="text-cyan-400 font-semibold">automatically</span> upon confirmation.
                  </p>
                </div>
                <div className="w-full flex flex-col gap-2">
                  <Button
                    onClick={handleGoToPayment}
                    className="w-full rounded-full bg-gradient-to-r from-primary to-cyan-500 text-white font-bold hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    data-testid="btn-go-to-payment"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Go to Payment Page
                  </Button>
                  <Button
                    onClick={handleSuccess}
                    variant="outline"
                    className="w-full rounded-full border-white/15 text-muted-foreground text-xs"
                    data-testid="btn-already-paid"
                  >
                    I've already paid
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Your plan activates automatically via IPN webhook — no manual step needed.
                </p>
              </motion.div>
            )}

            {/* Step: success */}
            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-6 gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-200 flex items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.5)]">
                  <Crown className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white mb-1">Payment Sent!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your <span className="text-yellow-400 font-semibold">{planName}</span> plan will activate automatically once the payment confirms on-chain. This usually takes 1–5 minutes.
                  </p>
                </div>
                <div className="w-full rounded-lg bg-primary/10 border border-primary/30 px-4 py-3 flex items-start gap-2">
                  <PartyPopper className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-left text-muted-foreground">
                    No action needed — your dashboard will reflect the upgrade as soon as NOWPayments confirms the transaction.
                  </p>
                </div>
                <Button onClick={onClose} className="w-full rounded-full bg-primary hover:bg-primary/90" data-testid="btn-close-success">
                  Got it, take me back
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
