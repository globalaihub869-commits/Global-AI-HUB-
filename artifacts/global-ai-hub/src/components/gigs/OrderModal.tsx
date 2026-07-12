import { motion } from "framer-motion";
import { X, ShoppingCart, AlertTriangle, LogIn, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface Gig {
  id: string;
  title: string;
  seller: string;
  priceUsd: number;
  deliveryDays: number;
}

interface Props {
  gig: Gig;
  walletBalance: number;
  isAuthenticated: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function OrderModal({ gig, walletBalance, isAuthenticated, isPending, onConfirm, onClose }: Props) {
  const [, navigate] = useLocation();
  const canAfford = walletBalance >= gig.priceUsd;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[hsl(240,18%,7%)] shadow-[0_0_60px_rgba(168,85,247,0.15)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-white">Confirm Order</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Gig summary */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Ordering</p>
            <p className="text-sm font-semibold text-white leading-snug mb-2">{gig.title}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>by {gig.seller}</span>
              <span>{gig.deliveryDays}-day delivery</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/8">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-lg font-display font-bold text-white">${gig.priceUsd}</span>
            </div>
          </div>

          {/* Not logged in */}
          {!isAuthenticated && (
            <>
              <div className="flex items-start gap-2.5 rounded-xl border border-yellow-400/30 bg-yellow-400/8 px-4 py-3 mb-4">
                <LogIn className="w-4 h-4 text-yellow-300 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-200 leading-relaxed">
                  You need to be signed in to place an order.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={onClose} variant="outline" className="flex-1 rounded-full border-white/15 text-sm">
                  Cancel
                </Button>
                <Button
                  onClick={() => { onClose(); navigate("/login"); }}
                  className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-sm"
                >
                  Sign In
                </Button>
              </div>
            </>
          )}

          {/* Logged in but can't afford */}
          {isAuthenticated && !canAfford && (
            <>
              <div className="flex items-start gap-2.5 rounded-xl border border-red-400/30 bg-red-400/8 px-4 py-3 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-red-200 leading-relaxed font-semibold mb-0.5">Insufficient balance</p>
                  <p className="text-xs text-red-200/80 leading-relaxed">
                    Your wallet has <span className="font-semibold text-white">${walletBalance.toFixed(2)}</span> — this gig costs <span className="font-semibold text-white">${gig.priceUsd}</span>.
                    Upgrade your plan to get full wallet access.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={onClose} variant="outline" className="flex-1 rounded-full border-white/15 text-sm">
                  Cancel
                </Button>
                <Button
                  onClick={() => { onClose(); navigate("/pricing"); }}
                  className="flex-1 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold hover:from-yellow-400 hover:to-yellow-300 text-sm"
                >
                  <Wallet className="w-3.5 h-3.5 mr-1.5" /> Upgrade Plan
                </Button>
              </div>
            </>
          )}

          {/* Logged in and can afford */}
          {isAuthenticated && canAfford && (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 px-1">
                <span>Wallet balance after order</span>
                <span className="text-white font-semibold">${(walletBalance - gig.priceUsd).toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={onClose} variant="outline" className="flex-1 rounded-full border-white/15 text-sm">
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={isPending}
                  className="flex-1 rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(168,85,247,0.3)] text-sm font-semibold"
                >
                  {isPending ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" /> Place Order
                    </span>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
