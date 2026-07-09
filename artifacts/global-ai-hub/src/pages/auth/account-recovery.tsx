import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircuitBoard, ScanFace, ShieldCheck, Upload, FileText, Check,
  ArrowLeft, ArrowRight, Camera, Loader2, AlertCircle, X, Sparkles, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "identify" | "face" | "document" | "success";

/* ─── Stepper ──────────────────────────────────────────────────────────────── */

const STEPS: { key: Step; label: string }[] = [
  { key: "identify", label: "Identify" },
  { key: "face", label: "Face Scan" },
  { key: "document", label: "Document" },
  { key: "success", label: "Recovered" },
];

function Stepper({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center justify-center gap-2 mb-10" data-testid="recovery-stepper">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < idx
                  ? "bg-primary border-primary text-white"
                  : i === idx
                  ? "border-primary text-primary shadow-[0_0_16px_rgba(168,85,247,0.5)] bg-primary/10"
                  : "border-white/15 text-muted-foreground/40"
              }`}
            >
              {i < idx ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap ${i <= idx ? "text-white" : "text-muted-foreground/40"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 sm:w-12 h-[2px] mb-4 transition-colors ${i < idx ? "bg-primary" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Face Verification Mockup ─────────────────────────────────────────────── */

function FaceScanCamera({ scanning, complete }: { scanning: boolean; complete: boolean }) {
  return (
    <div className="relative w-64 h-64 mx-auto" data-testid="face-scan-camera">
      {/* Camera frame */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 bg-[hsl(240,20%,5%)]">
        {/* Simulated camera feed backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(260,30%,10%)] via-[hsl(240,20%,6%)] to-[hsl(190,30%,8%)]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.08) 0%, transparent 45%)",
        }} />

        {/* Simulated silhouette */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-40">
          <ellipse cx="100" cy="90" rx="42" ry="52" fill="rgba(168,85,247,0.25)" />
          <ellipse cx="100" cy="180" rx="70" ry="60" fill="rgba(168,85,247,0.15)" />
        </svg>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />

        {/* Neon alignment guides — corner brackets, blinking */}
        {[
          { top: 14, left: 14, rotate: 0 },
          { top: 14, right: 14, rotate: 90 },
          { bottom: 14, right: 14, rotate: 180 },
          { bottom: 14, left: 14, rotate: 270 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-9 h-9"
            style={{ ...pos, transform: `rotate(${pos.rotate}deg)` }}
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 36 36" fill="none">
              <path d="M2 14V4a2 2 0 0 1 2-2h10" stroke={complete ? "#34d399" : "#22d3ee"} strokeWidth="3" strokeLinecap="round" />
            </svg>
          </motion.div>
        ))}

        {/* Face oval guide */}
        <motion.div
          className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-32 h-40 rounded-[50%] border-2"
          style={{ borderColor: complete ? "rgba(52,211,153,0.8)" : "rgba(34,211,238,0.6)" }}
          animate={complete ? { scale: 1.03, borderColor: "rgba(52,211,153,0.9)" } : { scale: [1, 1.02, 1] }}
          transition={{ duration: 1.8, repeat: complete ? 0 : Infinity, ease: "easeInOut" }}
        />

        {/* Scanning laser line */}
        {scanning && !complete && (
          <motion.div
            className="absolute left-3 right-3 h-[2px] rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, #22d3ee, transparent)", boxShadow: "0 0 12px rgba(34,211,238,0.9)" }}
            animate={{ top: ["18%", "78%", "18%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Status chip */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border backdrop-blur-sm ${
            complete
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
              : scanning
              ? "bg-secondary/15 border-secondary/40 text-secondary"
              : "bg-white/10 border-white/20 text-muted-foreground"
          }`}>
            {complete ? <Check className="w-3 h-3" /> : scanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            {complete ? "Face Matched" : scanning ? "Scanning…" : "Position Face"}
          </div>
        </div>

        {/* Success ring flash */}
        <AnimatePresence>
          {complete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-full h-full rounded-3xl border-2 border-emerald-400/50 shadow-[inset_0_0_40px_rgba(52,211,153,0.3)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Outer glow */}
      <div
        className="absolute -inset-1 rounded-3xl -z-10 blur-xl transition-colors duration-500"
        style={{ background: complete ? "rgba(52,211,153,0.25)" : "rgba(34,211,238,0.2)" }}
      />
    </div>
  );
}

/* ─── Document Upload Widget ───────────────────────────────────────────────── */

function DocumentUpload({ onFile, file }: { onFile: (f: File | null) => void; file: File | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        data-testid="input-document-upload"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className={`w-full rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-all ${
          dragOver
            ? "border-primary bg-primary/10 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
            : file
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-white/15 hover:border-primary/40 hover:bg-white/[0.03]"
        }`}
        data-testid="btn-document-dropzone"
      >
        {file ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white truncate max-w-[240px]">{file.name}</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1 justify-center mt-1">
                <Check className="w-3 h-3" /> Ready to verify
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFile(null); }}
              className="text-xs text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1 mt-1"
              data-testid="btn-remove-document"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Drop your ID document here</p>
              <p className="text-xs text-muted-foreground mt-1">Passport, Driver's License, or National ID — JPG, PNG, PDF</p>
            </div>
          </>
        )}
      </button>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────────── */

export default function AccountRecovery() {
  const [step, setStep] = useState<Step>("identify");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [scanning, setScanning] = useState(false);
  const [faceComplete, setFaceComplete] = useState(false);

  const [docFile, setDocFile] = useState<File | null>(null);
  const [verifyingDoc, setVerifyingDoc] = useState(false);

  const [recoveredUserId, setRecoveredUserId] = useState("");

  // Auto-run the simulated face scan
  useEffect(() => {
    if (step !== "face") return;
    setScanning(true);
    setFaceComplete(false);
    const t = setTimeout(() => {
      setScanning(false);
      setFaceComplete(true);
    }, 3400);
    return () => clearTimeout(t);
  }, [step]);

  const handleIdentifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter the email associated with your account.");
      return;
    }
    setStep("face");
  };

  const handleDocumentVerify = () => {
    if (!docFile) {
      setError("Please upload an identity document to continue.");
      return;
    }
    setError(null);
    setVerifyingDoc(true);
    setTimeout(() => {
      setVerifyingDoc(false);
      const masked = email.replace(/^(.{2}).+(@.+)$/, "$1•••$2");
      setRecoveredUserId(masked || "aria.user@hub.ai");
      setStep("success");
    }, 1800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary/15 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <CircuitBoard className="w-7 h-7 text-primary group-hover:text-primary/80 transition-colors" />
            <span className="font-display font-bold text-xl text-white [text-shadow:0_0_10px_rgba(168,85,247,0.3)]">
              Global AI Hub
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-secondary/30 bg-secondary/10 text-secondary mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> AI Identity Verification
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Account Recovery</h1>
          <p className="text-muted-foreground">Securely verify your identity to retrieve your User ID</p>
        </div>

        <Stepper current={step} />

        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-primary/40 via-secondary/20 to-primary/10 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
          <div className="bg-[hsl(240,15%,8%)] rounded-2xl p-8 min-h-[380px] flex flex-col">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2.5 mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                data-testid="recovery-error"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* ── Step 1: Identify ── */}
              {step === "identify" && (
                <motion.div
                  key="identify"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1"
                >
                  <p className="text-sm text-muted-foreground mb-6">
                    Enter the email address linked to your account. We'll use AI-powered identity verification to confirm it's you before revealing your User ID.
                  </p>
                  <form onSubmit={handleIdentifySubmit} className="flex flex-col gap-5 flex-1">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="recovery-email">
                        Account Email
                      </label>
                      <Input
                        id="recovery-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 bg-white/5 border-white/15 focus:border-primary focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] placeholder:text-muted-foreground/40 transition-all"
                        data-testid="input-recovery-email"
                      />
                    </div>
                    <div className="flex-1" />
                    <Button
                      type="submit"
                      className="h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all rounded-xl"
                      data-testid="btn-continue-identify"
                    >
                      <span className="flex items-center gap-2">
                        Continue to Face Verification <ArrowRight className="w-4 h-4" />
                      </span>
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── Step 2: Face Scan ── */}
              {step === "face" && (
                <motion.div
                  key="face"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1 items-center"
                >
                  <FaceScanCamera scanning={scanning} complete={faceComplete} />

                  <div className="text-center mt-6 mb-2 flex-1 flex flex-col items-center justify-center">
                    <p className={`text-sm font-medium flex items-center gap-1.5 ${faceComplete ? "text-emerald-400" : "text-secondary"}`}>
                      {faceComplete ? <ScanFace className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      {faceComplete ? "Identity confirmed via facial signature" : "AI is analyzing facial alignment…"}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-xs">
                      This is a simulated verification for demo purposes — no camera data is captured or stored.
                    </p>
                  </div>

                  <div className="flex gap-3 w-full mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("identify")}
                      className="h-11 flex-1 rounded-xl border-white/15 text-muted-foreground hover:text-white"
                      data-testid="btn-back-to-identify"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                    </Button>
                    <Button
                      type="button"
                      disabled={!faceComplete}
                      onClick={() => setStep("document")}
                      className="h-11 flex-1 bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] rounded-xl disabled:opacity-40 disabled:shadow-none"
                      data-testid="btn-continue-face"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Document Upload ── */}
              {step === "document" && (
                <motion.div
                  key="document"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1"
                >
                  <p className="text-sm text-muted-foreground mb-6">
                    As a final security layer, upload a government-issued ID. Our AI cross-references it with your facial scan to guarantee it's really you.
                  </p>

                  <DocumentUpload onFile={setDocFile} file={docFile} />

                  <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground/50">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    Documents are encrypted end-to-end and auto-deleted after verification.
                  </div>

                  <div className="flex-1" />

                  <div className="flex gap-3 w-full mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("face")}
                      className="h-11 flex-1 rounded-xl border-white/15 text-muted-foreground hover:text-white"
                      data-testid="btn-back-to-face"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                    </Button>
                    <Button
                      type="button"
                      disabled={verifyingDoc}
                      onClick={handleDocumentVerify}
                      className="h-11 flex-1 bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] rounded-xl disabled:opacity-70"
                      data-testid="btn-verify-document"
                    >
                      {verifyingDoc ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> Verify & Recover
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Success ── */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col flex-1 items-center justify-center text-center gap-4"
                  data-testid="recovery-success"
                >
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.1 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.35)]"
                  >
                    <Check className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  <h2 className="text-xl font-display font-bold text-white">Identity Verified!</h2>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    We matched your face scan and document — here's your recovered User ID:
                  </p>
                  <div className="px-5 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-mono font-semibold text-sm" data-testid="text-recovered-user-id">
                    {recoveredUserId}
                  </div>
                  <Link href="/login" className="w-full mt-2">
                    <Button className="h-11 w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] rounded-xl" data-testid="btn-back-to-login">
                      Continue to Sign In
                    </Button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Remember your credentials?{" "}
          <Link href="/login" className="underline hover:text-muted-foreground transition-colors">Back to Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
