import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CircuitBoard, Eye, EyeOff, UserPlus, AlertCircle, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import GoogleOAuthButton from "@/components/auth/GoogleOAuthButton";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-3 mt-2 flex-wrap">
      {checks.map((c) => (
        <span key={c.label} className={`inline-flex items-center gap-1 text-xs transition-colors ${c.ok ? "text-emerald-400" : "text-muted-foreground/50"}`}>
          <Check className={`w-3 h-3 ${c.ok ? "opacity-100" : "opacity-30"}`} />
          {c.label}
        </span>
      ))}
    </div>
  );
}

export default function Signup() {
  const { signup } = useAuth();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const referralCode = useMemo(() => new URLSearchParams(window.location.search).get("ref") ?? undefined, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(null);
    setLoading(true);
    try {
      await signup(name, email, password, referralCode);
      navigate("/onboarding");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <CircuitBoard className="w-7 h-7 text-primary" />
            <span className="font-display font-bold text-xl text-white [text-shadow:0_0_10px_rgba(168,85,247,0.3)]">
              Global AI Hub
            </span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Create your account</h1>
          <p className="text-muted-foreground">Join 50,000+ researchers and builders worldwide</p>
          {referralCode && (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-2.5 py-1 mt-4 text-emerald-300 border-emerald-400/30 bg-emerald-400/10" data-testid="badge-referral-applied">
              <Gift className="w-3.5 h-3.5" /> Invited via referral code {referralCode}
            </div>
          )}
        </div>

        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-primary/40 via-secondary/20 to-primary/10 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
          <div className="bg-[hsl(240,15%,8%)] rounded-2xl p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2.5 mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                data-testid="signup-error"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5" data-testid="signup-form">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="signup-name">
                  Full Name
                </label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="h-12 bg-white/5 border-white/15 focus:border-primary focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] placeholder:text-muted-foreground/40 transition-all"
                  data-testid="input-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="signup-email">
                  Email
                </label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 bg-white/5 border-white/15 focus:border-primary focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] placeholder:text-muted-foreground/40 transition-all"
                  data-testid="input-email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="signup-password">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="h-12 bg-white/5 border-white/15 focus:border-primary focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] placeholder:text-muted-foreground/40 pe-11 transition-all"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    data-testid="btn-toggle-password"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 mt-1 bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all rounded-xl"
                data-testid="btn-signup-submit"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Create Account
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-muted-foreground/50 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="mt-4">
                <GoogleOAuthButton mode="signup" />
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/8 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors" data-testid="link-login">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          By creating an account you agree to our{" "}
          <a href="#" className="underline hover:text-muted-foreground transition-colors">Terms</a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-muted-foreground transition-colors">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
