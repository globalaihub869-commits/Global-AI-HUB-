import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import {
  X, Copy, Check, ShieldCheck, Clock, Loader2, AlertTriangle, PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, apiFetch, type PlanTier } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CheckoutSession {
  id: string;
  plan: PlanTier;
  network: "TRC20" | "ERC20";
  walletAddress: string;
  amountUsdt: number;
  status: "pending" | "confirmed" | "expired";
  createdAt: number;
  expiresAt: number;
}

interface Props {
  plan: PlanTier;
  planName: string;
  onClose: () => void;
}

function formatCountdown(msLeft: number) {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function BinancePayModal({ plan, planName, onClose }: Props) {
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [network, setNetwork] = useState<"TRC20" | "ERC20">("TRC20");
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (net: "TRC20" | "ERC20") => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan, network: net }),
      });
      setSession(data.session);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startCheckout(network);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const msLeft = session ? session.expiresAt - now : 0;
  const isExpired = session ? msLeft <= 0 : false;

  const handleNetworkSwitch = (net: "TRC20" | "ERC20") => {
    setNetwork(net);
    startCheckout(net);
  };

  const handleCopy = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.walletAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (!session || !txId.trim()) return;
    setVerifying(true);
    setError(null);
    try {
      const data = await apiFetch("/billing/verify", {
        method: "POST",
        body: JSON.stringify({ sessionId: session.id, txId: txId.trim() }),
      });
      setUser(data.user);
      setSuccess(true);
      toast({ title: "Payment confirmed", description: `Welcome to ${planName}! Your account has been upgraded.` });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const qrPayload = useMemo(() => {
    if (!session) return "";
    return `${network.toLowerCase()}:${session.walletAddress}?amount=${session.amountUsdt}&label=GlobalAIHub-${plan}`;
  }, [session, network, plan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" data-testid="modal-binance-pay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl border border-yellow-500/20 bg-[hsl(240,18%,7%)] shadow-[0_0_60px_rgba(234,179,8,0.15)] overflow-hidden"
      >
        {/* Header styled after Binance Pay */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-gradient-to-r from-yellow-500/10 via-transparent to-primary/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-black text-sm">B</div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Binance Pay</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Crypto Checkout · Simulated</p>
            </div>
          </div>
          <button onClick={onClose} data-testid="btn-close-pay-modal" className="text-muted-foreground hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="flex flex-col items-center text-center py-6" data-testid="payment-success">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center mb-4">
                <PartyPopper className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-1">Payment Confirmed!</h3>
              <p className="text-sm text-muted-foreground mb-5">
                You are now a <span className="text-yellow-400 font-semibold">{planName} Member</span>. Your dashboard has been upgraded instantly.
              </p>
              <Button onClick={onClose} className="rounded-full bg-primary hover:bg-primary/90" data-testid="btn-close-success">
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Upgrading to</p>
                  <p className="text-white font-bold font-display">{planName} Plan</p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold border border-emerald-400/30 text-emerald-400 bg-emerald-400/10 rounded-full px-2.5 py-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Secure Escrow
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                {(["TRC20", "ERC20"] as const).map((net) => (
                  <button
                    key={net}
                    onClick={() => handleNetworkSwitch(net)}
                    data-testid={`btn-network-${net}`}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-all ${
                      network === net
                        ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-300"
                        : "border-white/10 text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    USDT ({net})
                  </button>
                ))}
              </div>

              {loading || !session ? (
                <div className="flex items-center justify-center py-14">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : isExpired ? (
                <div className="flex flex-col items-center text-center py-8" data-testid="checkout-expired">
                  <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
                  <p className="text-sm text-white font-semibold mb-1">Payment window expired</p>
                  <p className="text-xs text-muted-foreground mb-4">Please generate a new address to continue.</p>
                  <Button onClick={() => startCheckout(network)} variant="outline" className="rounded-full border-white/15" data-testid="btn-restart-checkout">
                    Generate New Address
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center bg-white rounded-xl p-4 mb-4" data-testid="qr-code-container">
                    <QRCode value={qrPayload} size={168} />
                    <p className="text-black text-xs font-semibold mt-2">Scan with Binance / any TRC20-ERC20 wallet</p>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-3 px-1">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-white font-bold" data-testid="text-checkout-amount">{session.amountUsdt.toFixed(2)} USDT</span>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1.5">Wallet Address ({network})</p>
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                      <code className="flex-1 text-xs text-cyan-300 truncate" data-testid="text-wallet-address">{session.walletAddress}</code>
                      <button onClick={handleCopy} data-testid="btn-copy-address" className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-yellow-300 mb-4" data-testid="text-countdown">
                    <Clock className="w-3.5 h-3.5" />
                    Expires in <span className="font-mono font-bold">{formatCountdown(msLeft)}</span>
                  </div>

                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-1.5">Transaction Hash (TxID)</p>
                    <input
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      placeholder="Paste your transaction hash after sending USDT"
                      data-testid="input-txid"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 mb-3 flex items-center gap-1.5" data-testid="text-verify-error">
                      <AlertTriangle className="w-3.5 h-3.5" /> {error}
                    </p>
                  )}

                  <Button
                    onClick={handleVerify}
                    disabled={!txId.trim() || verifying}
                    data-testid="btn-verify-payment"
                    className="w-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold hover:from-yellow-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50"
                  >
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Verify Payment
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center mt-3">
                    Simulated demo checkout — funds are held in escrow until on-chain confirmation.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
