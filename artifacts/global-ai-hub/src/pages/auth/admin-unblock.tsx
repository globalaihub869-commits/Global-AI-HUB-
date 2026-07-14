import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldOff, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/context/AuthContext";

const WHITELISTED_EMAIL = "Faisalmiraj313@gmail.com";

export default function AdminUnblock() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const data = await apiFetch("/auth/admin-override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: WHITELISTED_EMAIL, password }),
      }) as { user: { name: string }; trustedIp: string };
      setStatus("success");
      setMessage(`IP ${data.trustedIp} unblocked. Logged in as ${data.user.name}.`);
      setTimeout(() => navigate("/admin"), 2000);
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Override failed. Check your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-cyan-500/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl">

          {/* Icon + title */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <ShieldOff className="w-7 h-7 text-purple-400" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-display font-bold text-white">Admin Override</h1>
              <p className="text-sm text-muted-foreground mt-1">Enter your password to unblock this IP</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-4 text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <p className="text-emerald-300 font-medium">{message}</p>
                <p className="text-xs text-muted-foreground">Redirecting to admin dashboard…</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Email — display only */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                  <Input
                    value={WHITELISTED_EMAIL}
                    readOnly
                    className="bg-white/5 border-white/10 text-white/50 cursor-not-allowed"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Your account password"
                      required
                      autoFocus
                      className="bg-white/5 border-white/10 text-white pr-10 focus:border-purple-500/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {status === "error" && message && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5"
                    >
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-300">{message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full mt-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/40 disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Unblocking…</>
                  ) : (
                    <><ShieldOff className="w-4 h-4 mr-2" /> Unblock My IP</>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}
