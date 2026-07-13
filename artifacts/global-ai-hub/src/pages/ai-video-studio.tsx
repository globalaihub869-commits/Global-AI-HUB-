import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth, apiFetch } from "@/context/AuthContext";
import { useEarnTokens } from "@/hooks/useEarnTokens";
import {
  Sparkles, Play, Pause, Download, Share2, Wand2, Mic, User, Bot,
  Radio, Clapperboard, ArrowLeft, RefreshCw, Volume2, Captions, Loader2,
} from "lucide-react";

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  x: "X (Twitter)",
};

function getConnectedPlatforms(userId: string | null): string[] {
  try {
    const raw = localStorage.getItem(`gah-social-connections:${userId ?? "guest"}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type Avatar = {
  id: string;
  name: string;
  role: string;
  from: string;
  to: string;
  icon: React.ElementType;
};

const AVATARS: Avatar[] = [
  { id: "nova", name: "Nova", role: "Tech Anchor", from: "from-primary", to: "to-secondary", icon: Bot },
  { id: "orion", name: "Orion", role: "Field Correspondent", from: "from-secondary", to: "to-cyan-300", icon: User },
  { id: "vega", name: "Vega", role: "Research Analyst", from: "from-fuchsia-500", to: "to-primary", icon: Sparkles },
  { id: "atlas", name: "Atlas", role: "Market Reporter", from: "from-cyan-400", to: "to-blue-500", icon: Radio },
];

const VOICE_TONES = ["Energetic Broadcast", "Calm & Analytical", "Bold & Dramatic", "Friendly Explainer"] as const;

const SAMPLE_SCRIPT =
  "Breaking today in AI: a new wave of multimodal models is reshaping enterprise workflows, funding for foundation-model startups continues to accelerate, and regulators are moving fast to keep pace with generative video technology. Here's what you need to know.";

function AvatarCard({ avatar, active, onClick }: { avatar: Avatar; active: boolean; onClick: () => void }) {
  const Icon = avatar.icon;
  return (
    <button
      onClick={onClick}
      data-testid={`avatar-option-${avatar.id}`}
      aria-pressed={active}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center ${
        active
          ? "border-primary bg-primary/10 shadow-[0_0_24px_rgba(168,85,247,0.35)]"
          : "border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.05]"
      }`}
    >
      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatar.from} ${avatar.to} flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.35)]`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{avatar.name}</p>
        <p className="text-[11px] text-muted-foreground">{avatar.role}</p>
      </div>
      {active && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
      )}
    </button>
  );
}

function Waveform({ playing }: { playing: boolean }) {
  const bars = 28;
  return (
    <div className="flex items-end gap-[3px] h-10">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-primary to-secondary"
          animate={playing ? { height: [6, 28, 10, 34, 6] } : { height: 6 }}
          transition={playing ? { duration: 1.1 + (i % 5) * 0.08, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 } : { duration: 0.2 }}
        />
      ))}
    </div>
  );
}

export default function AiVideoStudio() {
  const { toast } = useToast();
  const earnTokens = useEarnTokens();
  const { user } = useAuth();
  const [script, setScript] = useState(SAMPLE_SCRIPT);
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id);
  const [tone, setTone] = useState<(typeof VOICE_TONES)[number]>(VOICE_TONES[0]);
  const [status, setStatus] = useState<"idle" | "generating" | "ready">("idle");
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const playTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const avatar = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];
  const durationSec = Math.max(18, Math.min(90, Math.round(script.trim().split(/\s+/).filter(Boolean).length / 2.3)));

  useEffect(() => () => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    if (playTimer.current) clearInterval(playTimer.current);
  }, []);

  const handleGenerate = () => {
    if (!script.trim()) {
      toast({ title: "Add a script first", description: "Enter the broadcast text you'd like the avatar to deliver.", variant: "destructive" });
      return;
    }
    if (progressTimer.current) clearInterval(progressTimer.current);
    setPlaying(false);
    setElapsed(0);
    setStatus("generating");
    setProgress(0);
    progressTimer.current = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 14 + 6;
        if (next >= 100) {
          if (progressTimer.current) clearInterval(progressTimer.current);
          setStatus("ready");
          toast({ title: "Broadcast ready", description: `${avatar.name} has finished rendering your AI news segment.` });
          earnTokens("video_generated", avatar.name);
          return 100;
        }
        return next;
      });
    }, 260);
  };

  const togglePlay = () => {
    if (status !== "ready") return;
    setPlaying((v) => {
      const next = !v;
      if (playTimer.current) clearInterval(playTimer.current);
      if (next) {
        playTimer.current = setInterval(() => {
          setElapsed((e) => {
            if (e + 1 >= durationSec) {
              if (playTimer.current) clearInterval(playTimer.current);
              setPlaying(false);
              return durationSec;
            }
            return e + 1;
          });
        }, 1000);
      }
      return next;
    });
  };

  const handleDownload = () => {
    if (status !== "ready") return;
    const transcript = `GLOBAL AI HUB — AI NEWS BROADCAST\nAvatar: ${avatar.name} (${avatar.role})\nVoice tone: ${tone}\nDuration: ~${durationSec}s\n\nScript:\n${script}\n`;
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-news-broadcast-${avatar.id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "Download started", description: "Your broadcast package is downloading." });
  };

  const handleShare = () => {
    const entityId = `video-${avatar.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/ai-video-studio#${avatar.id}`).catch(() => {});
    }
    apiFetch("/interactions/share", { method: "POST", body: JSON.stringify({ entityId, entityType: "video" }) }).catch(() => {});
    const connected = getConnectedPlatforms(user?.id ?? null);
    if (connected.length === 0) {
      toast({
        title: "Link copied",
        description: "Broadcast link copied to clipboard. Connect a social account on your Dashboard to enable one-click auto-sharing.",
      });
      return;
    }
    const names = connected.map((p) => PLATFORM_LABELS[p] ?? p).join(", ");
    toast({
      title: "Shared",
      description: `Link copied and share recorded for: ${names}.`,
    });
  };

  const format = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-secondary/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6" data-testid="link-back-news">
          <ArrowLeft className="w-4 h-4" /> Back to AI News &amp; Trends
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10 pb-8 border-b border-white/8">
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
            </span>
            <span className="text-xs text-secondary font-semibold uppercase tracking-widest">AI Video Studio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 [text-shadow:0_0_30px_rgba(168,85,247,0.2)]" data-testid="studio-title">
            AI News Video Generator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Turn today's AI headlines into a simulated avatar-led news broadcast. Write your script, pick a digital anchor, and preview the segment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT: GENERATOR FORM */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-2 flex flex-col gap-6">
            <div className="rounded-2xl border border-white/10 bg-[hsl(240,15%,8%)] p-5 md:p-6">
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Clapperboard className="w-3.5 h-3.5" /> 1. Choose your avatar
              </p>
              <div className="grid grid-cols-2 gap-3">
                {AVATARS.map((a) => (
                  <AvatarCard key={a.id} avatar={a} active={a.id === avatarId} onClick={() => setAvatarId(a.id)} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[hsl(240,15%,8%)] p-5 md:p-6">
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" /> 2. Voice tone
              </p>
              <div className="flex flex-wrap gap-2">
                {VOICE_TONES.map((v) => (
                  <button
                    key={v}
                    onClick={() => setTone(v)}
                    data-testid={`voice-tone-${v.replace(/\s+/g, "-").toLowerCase()}`}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      tone === v ? "bg-secondary text-black border-secondary shadow-[0_0_14px_rgba(34,211,238,0.4)]" : "bg-white/5 text-muted-foreground border-white/10 hover:border-secondary/40 hover:text-white"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[hsl(240,15%,8%)] p-5 md:p-6 flex-1 flex flex-col">
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> 3. Write the broadcast script
              </p>
              <Textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={7}
                placeholder="Paste or write the news script your avatar should deliver..."
                className="bg-white/5 border-white/10 focus:border-primary focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] resize-none flex-1"
                data-testid="input-script"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-muted-foreground">{script.trim().split(/\s+/).filter(Boolean).length} words · ~{durationSec}s runtime</span>
                <button onClick={() => setScript(SAMPLE_SCRIPT)} className="text-[11px] text-muted-foreground hover:text-secondary transition-colors" data-testid="btn-use-sample">
                  Use sample script
                </button>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={status === "generating"}
                className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all gap-2"
                data-testid="btn-generate-broadcast"
              >
                {status === "generating" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Rendering broadcast…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Broadcast
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* RIGHT: VIDEO PLAYER */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-3">
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/60 via-secondary/30 to-primary/10 shadow-[0_0_50px_rgba(168,85,247,0.25)] h-full">
              <div className="bg-[hsl(240,15%,6%)] rounded-2xl p-5 md:p-7 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-secondary/30 text-secondary bg-secondary/5 gap-1">
                      <Captions className="w-3 h-3" /> Simulated Preview
                    </Badge>
                  </div>
                  {status === "ready" && (
                    <button onClick={handleGenerate} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="btn-regenerate">
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                    </button>
                  )}
                </div>

                {/* SCREEN */}
                <div
                  className="relative flex-1 min-h-[320px] rounded-xl overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_50%_30%,rgba(168,85,247,0.18),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.14),transparent_55%)] flex items-center justify-center"
                  data-testid="video-screen"
                >
                  {status === "idle" && (
                    <div className="flex flex-col items-center text-center px-6" data-testid="player-idle-state">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <Clapperboard className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <p className="text-white font-semibold mb-1">Your broadcast preview will appear here</p>
                      <p className="text-sm text-muted-foreground max-w-xs">Choose an avatar, write a script, and hit Generate Broadcast to simulate a video.</p>
                    </div>
                  )}

                  {status === "generating" && (
                    <div className="flex flex-col items-center text-center px-6 w-full max-w-xs" data-testid="player-generating-state">
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatar.from} ${avatar.to} flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-pulse`}>
                        <avatar.icon className="w-9 h-9 text-white" />
                      </div>
                      <p className="text-white font-semibold mb-3">Rendering {avatar.name}'s broadcast…</p>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{Math.min(Math.round(progress), 100)}%</p>
                    </div>
                  )}

                  <AnimatePresence>
                    {status === "ready" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center px-6"
                        data-testid="player-ready-state"
                      >
                        <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${avatar.from} ${avatar.to} flex items-center justify-center shadow-[0_0_45px_rgba(168,85,247,0.5)] mb-5 ${playing ? "animate-pulse" : ""}`}>
                          <avatar.icon className="w-12 h-12 text-white" />
                          {playing && (
                            <span className="absolute -inset-2 rounded-full border-2 border-secondary/50 animate-ping" />
                          )}
                        </div>
                        <p className="text-white font-semibold mb-1">{avatar.name} — {avatar.role}</p>
                        <p className="text-xs text-muted-foreground mb-4">{tone}</p>
                        <Waveform playing={playing} />
                        {playing && (
                          <p className="mt-4 text-sm text-secondary text-center max-w-md px-4 [text-shadow:0_0_10px_rgba(34,211,238,0.4)]" data-testid="caption-text">
                            "{script.slice(0, 140)}{script.length > 140 ? "…" : ""}"
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* CONTROLS */}
                <div className="mt-5">
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: status === "ready" ? `${(elapsed / durationSec) * 100}%` : "0%" }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        disabled={status !== "ready"}
                        data-testid="btn-play-pause"
                        aria-label={playing ? "Pause" : "Play"}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          status === "ready" ? "bg-primary text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)]" : "bg-white/5 text-muted-foreground/40 cursor-not-allowed"
                        }`}
                      >
                        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ms-0.5" />}
                      </button>
                      <span className="text-xs text-muted-foreground font-mono" data-testid="text-timer">
                        {status === "ready" ? `${format(elapsed)} / ${format(durationSec)}` : "0:00 / 0:00"}
                      </span>
                      <Volume2 className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        disabled={status !== "ready"}
                        className="h-9 px-3 text-xs border-white/10 text-muted-foreground hover:border-primary hover:text-primary gap-1.5 disabled:opacity-40"
                        data-testid="btn-download"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        disabled={status !== "ready"}
                        className="h-9 px-3 text-xs border-white/10 text-muted-foreground hover:border-secondary hover:text-secondary gap-1.5 disabled:opacity-40"
                        data-testid="btn-share"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
