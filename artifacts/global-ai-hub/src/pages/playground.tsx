import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Play, Loader2, Lock, Crown, Sparkles, Wand2, Tag, Search,
  LayoutTemplate, Rocket, ShieldCheck, Code2, Blocks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth, apiFetch } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UsageState {
  executionCount: number;
  limit: number | null;
  locked: boolean;
  plan: string;
}

interface Widget {
  id: string;
  name: string;
  type: string;
  description: string;
  seo: { title: string; slug: string; metaDescription: string; keywords: string[] };
  createdAt: number;
}

const DEFAULT_CODE = `function greet(name) {\n  return "Hello, " + name + "!";\n}\n\ngreet("Global AI Hub");`;

const WIDGET_TYPES = ["Chatbot", "Form Builder", "Analytics Card", "Pricing Table", "Landing Hero"];

function RunningCodeAnimation() {
  const lines = [
    "$ initializing sandbox container...",
    "$ mounting isolated fs...",
    "$ compiling script...",
    "$ executing...",
  ];
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => setVisible((v) => Math.min(v + 1, lines.length)), 260);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-lg border border-cyan-400/20 bg-black/60 p-4 font-mono text-xs" data-testid="running-code-animation">
      {lines.slice(0, visible).map((l, i) => (
        <motion.p key={l} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-cyan-300/90 mb-1">
          {l}
          {i === visible - 1 && (
            <motion.span
              className="inline-block w-1.5 h-3 bg-cyan-300 ml-1 align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          )}
        </motion.p>
      ))}
    </div>
  );
}

function UsageMeter({ usage }: { usage: UsageState | null }) {
  if (!usage || usage.limit === null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold border rounded-full px-2.5 py-1 text-emerald-300 border-emerald-400/40 bg-emerald-400/10" data-testid="usage-unlimited">
        <ShieldCheck className="w-3 h-3" /> Unlimited executions
      </span>
    );
  }
  const pct = Math.min(100, Math.round((usage.executionCount / usage.limit) * 100));
  return (
    <div className="flex items-center gap-2" data-testid="usage-meter">
      <div className="w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-red-400" : "bg-gradient-to-r from-primary to-secondary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground font-mono">
        {usage.executionCount} / {usage.limit} free runs used
      </span>
    </div>
  );
}

function UpgradeLockOverlay({ context }: { context: "sandbox" | "builder" }) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-xl bg-black/50 backdrop-blur-xl border border-yellow-400/30"
      data-testid={`lock-overlay-${context}`}
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-200 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)]">
        <Lock className="w-8 h-8 text-black" />
      </div>
      <div className="text-center px-6">
        <p className="text-white font-display font-bold text-lg mb-1">Free Limit Reached</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          You've used all your free {context === "sandbox" ? "sandbox executions" : "widget generations"}. Upgrade to Pro for unlimited access.
        </p>
      </div>
      <Link href="/pricing">
        <Button className="rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold hover:from-yellow-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.4)] shimmer-border-gold" data-testid="btn-unlock-upgrade">
          <Crown className="w-4 h-4 mr-1.5" /> Upgrade to Pro
        </Button>
      </Link>
    </div>
  );
}

function SandboxPanel({ usage, onUsageChange }: { usage: UsageState | null; onUsageChange: (u: UsageState) => void }) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const locked = !!usage?.locked;

  const run = async () => {
    if (locked) return;
    setRunning(true);
    setError(null);
    setOutput(null);
    const startedAt = Date.now();
    try {
      const data = await apiFetch("/playground/execute", { method: "POST", body: JSON.stringify({ code }) });
      const MIN_MS = 1300;
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_MS) await new Promise((r) => setTimeout(r, MIN_MS - elapsed));
      setOutput(data.output);
      onUsageChange({ executionCount: data.executionCount, limit: data.limit, locked: false, plan: usage?.plan ?? "free" });
    } catch (e) {
      const err = e as Error & { code?: string; status?: number };
      if (err.status === 403) {
        onUsageChange({ executionCount: usage?.executionCount ?? 0, limit: usage?.limit ?? 5, locked: true, plan: usage?.plan ?? "free" });
        toast({ title: "Free limit reached", description: "Upgrade to Pro for unlimited sandbox runs.", variant: "destructive" });
      } else {
        setError(err.message ?? "Execution failed");
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card className="relative bg-[hsl(240,15%,8%)] border-white/8 overflow-hidden" data-testid="card-sandbox">
      <AnimatePresence>{locked && <UpgradeLockOverlay context="sandbox" />}</AnimatePresence>
      <CardContent className={`p-5 ${locked ? "blur-sm pointer-events-none select-none" : ""}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-white font-semibold">
            <Terminal className="w-4 h-4 text-cyan-300" /> AI Code Sandbox
          </div>
          <UsageMeter usage={usage} />
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={7}
          data-testid="input-sandbox-code"
          className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-xs font-mono text-emerald-200 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 resize-none"
          placeholder="Write JavaScript to run in the sandbox..."
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-[11px] text-muted-foreground">Runs in an isolated simulated container — no real system access.</p>
          <Button
            onClick={run}
            disabled={running || locked}
            data-testid="btn-run-sandbox"
            className="rounded-full bg-gradient-to-r from-cyan-400 to-primary text-black font-semibold hover:opacity-90"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Play className="w-4 h-4 mr-1.5" />}
            Run Code
          </Button>
        </div>

        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

        <div className="mt-4">
          {running ? (
            <RunningCodeAnimation />
          ) : output ? (
            <div className="rounded-lg border border-emerald-400/20 bg-black/60 p-4 font-mono text-xs" data-testid="sandbox-output">
              {output.map((line, i) => (
                <p key={i} className="text-emerald-300/90 mb-1">{line}</p>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function NoCodeBuilderPanel({ usage, widgets, onWidgetCreated }: { usage: UsageState | null; widgets: Widget[]; onWidgetCreated: (w: Widget) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState(WIDGET_TYPES[0]);
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const locked = !!usage?.locked;

  const generate = async () => {
    if (!name.trim() || locked) return;
    setGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      const data = await apiFetch("/playground/widgets", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), type, description: description.trim() }),
      });
      onWidgetCreated(data.widget);
      setName("");
      setDescription("");
      toast({ title: "Widget generated", description: `"${data.widget.name}" is ready with auto-SEO tags.` });
    } catch (e) {
      toast({ title: "Could not generate widget", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="relative bg-[hsl(240,15%,8%)] border-white/8 overflow-hidden" data-testid="card-no-code-builder">
      <AnimatePresence>{locked && <UpgradeLockOverlay context="builder" />}</AnimatePresence>
      <CardContent className={`p-5 ${locked ? "blur-sm pointer-events-none select-none" : ""}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-white font-semibold">
            <Blocks className="w-4 h-4 text-primary" /> Visual No-Code Builder
          </div>
          <Badge variant="outline" className="text-[10px] text-secondary border-secondary/30 inline-flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" /> Auto-SEO Tagging
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Widget name (e.g. Support Bot)"
            data-testid="input-widget-name"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            data-testid="select-widget-type"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
          >
            {WIDGET_TYPES.map((t) => <option key={t} value={t} className="bg-[hsl(240,15%,10%)]">{t}</option>)}
          </select>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Short description for SEO metadata..."
          data-testid="input-widget-description"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none mb-3"
        />

        <Button
          onClick={generate}
          disabled={!name.trim() || generating || locked}
          data-testid="btn-generate-widget"
          className="w-full rounded-full bg-primary hover:bg-primary/90"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Wand2 className="w-4 h-4 mr-1.5" />}
          Generate Widget
        </Button>

        <div className="mt-4 flex flex-col gap-2 max-h-64 overflow-y-auto">
          <AnimatePresence initial={false}>
            {widgets.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 text-center py-6">No widgets generated yet.</p>
            ) : (
              widgets.map((w) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                  data-testid={`widget-card-${w.id}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm text-white font-semibold">{w.name}</span>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground border-white/15">{w.type}</Badge>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 mb-2">{w.seo.metaDescription}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] text-cyan-300 border border-cyan-400/25 bg-cyan-400/5 rounded-full px-2 py-0.5">
                      <Search className="w-2.5 h-2.5" /> /{w.seo.slug}
                    </span>
                    {w.seo.keywords.slice(0, 4).map((k) => (
                      <span key={k} className="text-[10px] text-muted-foreground border border-white/10 rounded-full px-2 py-0.5">#{k}</span>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Playground() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    apiFetch("/playground/usage").then(setUsage).catch(() => {});
    apiFetch("/playground/widgets").then((d) => setWidgets(d.widgets)).catch(() => {});
  }, []);

  const isPro = user?.plan === "pro" || user?.plan === "enterprise";

  return (
    <div className="container mx-auto px-4 py-28 max-w-6xl" data-testid="page-playground">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-2.5 py-1 mb-3 text-cyan-300 border-cyan-400/40 bg-cyan-400/10">
          <Code2 className="w-3 h-3" /> AI Sandbox &amp; No-Code Builder
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-2">
          Build &amp; Run in the <span className="text-primary">Playground</span>
          {isPro && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-300 border border-yellow-400/40 bg-yellow-400/10 rounded-full px-2.5 py-1 shimmer-border-gold">
              <Crown className="w-3 h-3" /> Unlimited
            </span>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          Test AI-generated code live and assemble widgets visually — auto-tagged for SEO the moment they're created.
        </p>
      </div>

      {!isPro && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid="banner-playground-free-notice">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            Free accounts get 5 sandbox runs and 5 widget generations. Upgrade for unlimited access.
          </p>
          <Link href="/pricing">
            <Button size="sm" variant="outline" className="rounded-full border-yellow-400/50 text-yellow-300 hover:bg-yellow-400/10" data-testid="btn-playground-upgrade-hint">
              <Rocket className="w-3.5 h-3.5 mr-1.5" /> View Plans
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SandboxPanel usage={usage} onUsageChange={setUsage} />
        <NoCodeBuilderPanel usage={usage} widgets={widgets} onWidgetCreated={(w) => setWidgets((prev) => [w, ...prev])} />
      </div>
    </div>
  );
}
