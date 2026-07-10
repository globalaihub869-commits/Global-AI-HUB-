import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Timer } from "lucide-react";

const SALE_DURATION_MS = 6 * 60 * 60 * 1000;
const STORAGE_KEY = "gah_flash_sale_end";

function getSaleEnd(): number {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const now = Date.now();
  if (stored) {
    const end = Number(stored);
    if (Number.isFinite(end) && end > now) return end;
  }
  const end = now + SALE_DURATION_MS;
  window.localStorage.setItem(STORAGE_KEY, String(end));
  return end;
}

function formatUnit(msLeft: number) {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h, m, s };
}

/**
 * "Crypto Flash Sale Countdown" widget — a self-resetting, persisted
 * countdown that drives urgency for USDT checkout on the pricing page.
 * Purely presentational; does not alter plan pricing or checkout logic.
 */
export default function FlashSaleCountdown() {
  const [saleEnd, setSaleEnd] = useState<number>(() => getSaleEnd());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= saleEnd) {
        const next = n + SALE_DURATION_MS;
        window.localStorage.setItem(STORAGE_KEY, String(next));
        setSaleEnd(next);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [saleEnd]);

  const { h, m, s } = formatUnit(saleEnd - now);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mb-10 max-w-lg rounded-2xl border border-orange-400/40 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-500/10 px-5 py-4 flex items-center justify-between gap-4 shadow-[0_0_30px_rgba(251,146,60,0.15)]"
      data-testid="widget-flash-sale-countdown"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-orange-400/15 flex items-center justify-center flex-shrink-0">
          <Flame className="w-5 h-5 text-orange-400" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-white leading-tight">Crypto Flash Sale</p>
          <p className="text-[11px] text-orange-200/80 leading-tight">Limited-time USDT pricing — ends soon</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 font-mono" data-testid="text-flash-sale-timer">
        <Timer className="w-4 h-4 text-orange-300 mr-1" />
        {[["h", h], ["m", m], ["s", s]].map(([label, value]) => (
          <div key={label as string} className="flex items-center gap-0.5">
            <span className="text-lg font-bold text-white tabular-nums">{String(value).padStart(2, "0")}</span>
            <span className="text-[10px] text-orange-300/70">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
