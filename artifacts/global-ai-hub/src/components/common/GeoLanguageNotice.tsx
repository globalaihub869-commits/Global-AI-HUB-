import { AnimatePresence, motion } from "framer-motion";
import { MapPin, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES } from "@/i18n/translations";

export default function GeoLanguageNotice() {
  const { geoNotice, dismissGeoNotice } = useLanguage();
  if (!geoNotice) return null;
  const meta = LANGUAGES.find((l) => l.code === geoNotice.lang);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        data-testid="banner-geo-language"
        className="fixed top-[70px] left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 rounded-full border border-primary/30 bg-[hsl(240,18%,9%)]/95 backdrop-blur-md px-4 py-2 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
      >
        <MapPin className="w-4 h-4 text-cyan-300 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Detected you're in <span className="text-white font-semibold">{geoNotice.country}</span> — switched to{" "}
          <span className="text-primary font-semibold">{meta?.native ?? geoNotice.lang}</span>
        </p>
        <button onClick={dismissGeoNotice} data-testid="btn-dismiss-geo-notice" className="text-muted-foreground hover:text-white transition-colors flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
