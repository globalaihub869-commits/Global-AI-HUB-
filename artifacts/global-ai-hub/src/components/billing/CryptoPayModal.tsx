import { useState } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { X, Copy, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const WALLET_ADDRESS = "TD2FXjtp4DL1r33Zh3buVGLLgaDi4Xr8LS";

interface Props {
  planName: string;
  amountUsdt: number;
  onClose: () => void;
}

export default function CryptoPayModal({ planName, amountUsdt, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-bold text-white">{amountUsdt} USDT</span>
            <span className="text-xs text-muted-foreground">Send exactly this amount via TRC20</span>
          </div>

          <div className="bg-white rounded-xl p-4">
            <QRCode value={WALLET_ADDRESS} size={160} />
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

          <div className="w-full rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-xs text-yellow-200 leading-relaxed">
            <strong className="text-yellow-300">How to pay:</strong> Open your Binance app or any TRC20 wallet, send <strong>{amountUsdt} USDT</strong> to the address above, then contact us with your transaction ID to activate your plan.
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            TRC20 network · No extra fees
          </div>

          <Button onClick={onClose} variant="outline" className="w-full rounded-full border-white/15 text-sm">
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
