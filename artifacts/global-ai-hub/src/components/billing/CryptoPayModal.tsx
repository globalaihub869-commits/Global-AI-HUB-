import { useState } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { X, Copy, Check, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const WALLET_ADDRESS = "TD2FXjtp4DL1r33Zh3buVGLLgaDi4Xr8LS";

interface Props {
  plan: string;
  planName: string;
  amountUsdt: number;
  onClose: () => void;
}

export default function CryptoPayModal({ plan, planName, amountUsdt, onClose }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [txId, setTxId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!txId.trim()) return;
    setSubmitting(true);
    try {
      await apiFetch("/billing/submit-txid", {
        method: "POST",
        body: JSON.stringify({ plan, txId: txId.trim() }),
      });
      setSubmitted(true);
      toast({ title: "TxID submitted!", description: "We'll verify your payment and activate your plan shortly." });
    } catch (e) {
      toast({
        title: "Submission failed",
        description: e instanceof Error ? e.message : "Could not submit transaction ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm rounded-2xl border border-yellow-500/20 bg-[hsl(240,18%,7%)] shadow-[0_0_60px_rgba(234,179,8,0.15)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-gradient-to-r from-yellow-500/10 via-transparent to-primary/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-black text-sm">B</div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Pay with USDT</p>
              <p className="text-[11px] text-muted-foreground leading-tight">TRC20 Network · {planName} Plan</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center gap-4">
          {submitted ? (
            <div className="flex flex-col items-center text-center py-4 gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">TxID Submitted!</h3>
              <p className="text-sm text-muted-foreground">
                Your transaction ID has been received. Once we verify the payment in our Binance app, your <span className="text-yellow-400 font-semibold">{planName}</span> plan will be activated automatically.
              </p>
              <Button onClick={onClose} className="w-full rounded-full bg-primary hover:bg-primary/90 mt-2">
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold text-white">{amountUsdt} USDT</span>
                <span className="text-xs text-muted-foreground">Send exactly this amount via TRC20</span>
              </div>

              <div className="bg-white rounded-xl p-4">
                <QRCode value={WALLET_ADDRESS} size={148} />
              </div>

              <div className="w-full">
                <p className="text-xs text-muted-foreground mb-1.5">Wallet Address (TRC20 / USDT)</p>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                  <code className="flex-1 text-xs text-cyan-300 truncate">{WALLET_ADDRESS}</code>
                  <button onClick={handleCopy} className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="w-full">
                <p className="text-xs text-muted-foreground mb-1.5">Transaction Hash (TxID)</p>
                <input
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="Paste your TxID after sending USDT"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                />
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  After sending, find your TxID in Binance → Transaction History and paste it here.
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!txId.trim() || submitting}
                className="w-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold hover:from-yellow-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit TxID for Verification
              </Button>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                TRC20 network · Manually verified by admin
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
