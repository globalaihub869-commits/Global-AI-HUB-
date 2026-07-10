import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";
import { subscribeSecurityWarnings, type SecurityWarning } from "@/lib/securityWarnings";

/**
 * Strict "Pre-Block Warning Banner" shown to a user on their first few
 * suspicious attempts, before the backend fully blocks their IP. Backed by
 * the `X-Security-Warning` response header set by the Subscription/Threat
 * Defense middleware (see app.ts + threat-store.ts).
 */
export default function SecurityWarningBanner() {
  const [warning, setWarning] = useState<SecurityWarning | null>(null);

  useEffect(() => {
    return subscribeSecurityWarnings((w) => setWarning(w));
  }, []);

  return (
    <AnimatePresence>
      {warning && (
        <motion.div
          key={warning.id}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-[100] flex justify-center px-4 pt-3"
          data-testid="banner-security-warning"
        >
          <div className="flex items-start gap-3 max-w-2xl w-full rounded-lg border border-red-500/50 bg-red-950/95 backdrop-blur px-4 py-3 shadow-lg shadow-red-900/40">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-200" data-testid="text-security-warning-title">
                Security Warning — Attempt {warning.attemptNumber} of 2
              </p>
              <p className="text-xs text-red-300/90 mt-0.5">
                Suspicious activity detected from your connection: {warning.reason}. Further violations will result in an
                automatic IP block.
              </p>
            </div>
            <button
              onClick={() => setWarning(null)}
              className="text-red-300/70 hover:text-red-200 flex-shrink-0"
              data-testid="button-dismiss-security-warning"
              aria-label="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
