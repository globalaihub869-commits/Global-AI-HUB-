import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, SunMoon, ChevronDown, Check } from "lucide-react";
import { useAmbientLight, type AmbientMode } from "@/hooks/useAmbientLight";

const OPTIONS: { id: AmbientMode; label: string; icon: typeof Sun }[] = [
  { id: "auto", label: "Auto (Ambient Sensor)", icon: SunMoon },
  { id: "day", label: "Day Mode", icon: Sun },
  { id: "night", label: "Night Mode", icon: Moon },
];

/**
 * Ambient Light Adaptive UI control. Lets the user confirm/override the
 * auto-brightness detection that dynamically tunes neon glow intensity,
 * background brightness, and contrast across the app (see useAmbientLight).
 */
export default function AmbientModeToggle() {
  const { mode, effective, sensorActive, setMode } = useAmbientLight();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const CurrentIcon = effective === "day" ? Sun : Moon;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        data-testid="btn-ambient-toggle"
        aria-label="Ambient light mode"
        aria-expanded={open}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all text-sm text-white"
      >
        <CurrentIcon className={`w-3.5 h-3.5 ${effective === "day" ? "text-yellow-300" : "text-cyan-300"}`} />
        <span className="hidden 2xl:inline text-xs font-medium capitalize">{mode === "auto" ? `Auto · ${effective}` : mode}</span>
        <ChevronDown className="hidden sm:block w-3 h-3 text-muted-foreground transition-transform" style={{ transform: open ? "rotate(180deg)" : undefined }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 end-0 w-64 rounded-2xl bg-[hsl(240,15%,9%)] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 py-1 overflow-hidden"
            data-testid="ambient-dropdown"
          >
            <div className="px-3 py-2 text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium border-b border-white/5">
              Ambient Light Adaptive UI
            </div>
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => { setMode(o.id); setOpen(false); }}
                data-testid={`ambient-option-${o.id}`}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-start hover:bg-primary/10 ${mode === o.id ? "text-primary" : "text-muted-foreground hover:text-white"}`}
              >
                <o.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="flex-1 font-medium">{o.label}</span>
                {mode === o.id && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </button>
            ))}
            <div className="px-3 py-2 mt-1 border-t border-white/5 text-[11px] text-muted-foreground/70">
              {mode === "auto"
                ? sensorActive
                  ? "Reading live ambient light sensor data."
                  : "Sensor unavailable — using time-of-day fallback."
                : "Manual override active."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
