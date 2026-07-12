import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ?? "";

interface GoogleOAuthButtonProps {
  mode?: "login" | "signup";
}

export default function GoogleOAuthButton({ mode = "login" }: GoogleOAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);

  function handleClick() {
    if (!GOOGLE_CLIENT_ID) {
      setNotConfigured(true);
      return;
    }
    setLoading(true);
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
      state: mode,
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  return (
    <div className="w-full">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="
          w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
          border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30
          text-sm font-medium text-foreground transition-all duration-200
          disabled:opacity-60 disabled:cursor-not-allowed
          shadow-[0_0_0_1px_rgba(255,255,255,0.05)]
        "
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
        )}
        <span>{mode === "signup" ? "Sign up with Google" : "Continue with Google"}</span>
      </motion.button>

      <AnimatePresence>
        {notConfigured && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex items-start gap-2 rounded-lg border border-yellow-400/30 bg-yellow-400/8 px-3 py-2.5 text-xs text-yellow-300"
          >
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Google Sign-In is not yet activated on this deployment. Use email &amp; password to sign in.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
