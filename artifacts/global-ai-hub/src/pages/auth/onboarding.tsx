import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircuitBoard, Code2, Briefcase, GraduationCap,
  ArrowRight, Sparkles, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, type ProfileType } from "@/context/AuthContext";

const PROFILES: {
  type: ProfileType;
  icon: React.ElementType;
  label: string;
  tagline: string;
  perks: string[];
  gradient: string;
  glow: string;
  border: string;
  iconBg: string;
}[] = [
  {
    type: "developer",
    icon: Code2,
    label: "Developer",
    tagline: "Engineer the future of AI",
    perks: [
      "Prioritized Code AI & Agent tools",
      "LLM benchmark deep-dives",
      "Research papers & open-source picks",
      "API guides and model comparisons",
    ],
    gradient: "from-primary/30 via-primary/10 to-transparent",
    glow: "shadow-[0_0_40px_rgba(168,85,247,0.3)]",
    border: "border-primary/60",
    iconBg: "bg-primary/20 text-primary",
  },
  {
    type: "business",
    icon: Briefcase,
    label: "Business Owner",
    tagline: "Scale your business with AI",
    perks: [
      "Marketing, Design & Analytics tools",
      "ROI-driven industry news",
      "Funding & acquisition updates",
      "No-code AI productivity picks",
    ],
    gradient: "from-secondary/30 via-secondary/10 to-transparent",
    glow: "shadow-[0_0_40px_rgba(34,211,238,0.25)]",
    border: "border-secondary/60",
    iconBg: "bg-secondary/20 text-secondary",
  },
  {
    type: "student",
    icon: GraduationCap,
    label: "Student",
    tagline: "Learn AI from the ground up",
    perks: [
      "Free & open-source tool highlights",
      "Research summaries made simple",
      "Learning paths & tutorial picks",
      "Community & scholarship news",
    ],
    gradient: "from-emerald-500/30 via-emerald-500/10 to-transparent",
    glow: "shadow-[0_0_40px_rgba(52,211,153,0.25)]",
    border: "border-emerald-500/60",
    iconBg: "bg-emerald-500/20 text-emerald-400",
  },
];

export default function Onboarding() {
  const { user, updateProfile } = useAuth();
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await updateProfile(selected);
      navigate("/");
    } catch {
      setLoading(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/15 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <CircuitBoard className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg text-white [text-shadow:0_0_10px_rgba(168,85,247,0.3)]">
              Global AI Hub
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            One last step
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
            Welcome, {firstName}! 👋
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              How do you use AI?
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Choose your profile so we can personalize your feed with the tools, news,
            and features that matter most to you.
          </p>
        </div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {PROFILES.map((profile, idx) => {
            const Icon = profile.icon;
            const isSelected = selected === profile.type;
            return (
              <motion.button
                key={profile.type}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                onClick={() => setSelected(profile.type)}
                data-testid={`profile-card-${profile.type}`}
                className={`relative text-left rounded-2xl p-6 border transition-all duration-300 cursor-pointer overflow-hidden group ${
                  isSelected
                    ? `${profile.border} ${profile.glow} bg-white/[0.06]`
                    : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
                }`}
              >
                {/* Selected check */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Background gradient */}
                <div className={`absolute inset-0 opacity-0 bg-gradient-to-br ${profile.gradient} ${isSelected ? "opacity-100" : "group-hover:opacity-40"} transition-opacity pointer-events-none`} />

                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${profile.iconBg} ring-1 ring-white/10`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-display font-bold text-white mb-1">{profile.label}</h3>
                  <p className={`text-sm font-medium mb-5 ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>
                    {profile.tagline}
                  </p>

                  <ul className="flex flex-col gap-2.5">
                    {profile.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className={`flex-shrink-0 w-4 h-4 rounded-full mt-0.5 flex items-center justify-center ${profile.iconBg}`}>
                          <Check className="w-2.5 h-2.5" />
                        </span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Continue button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handleContinue}
            disabled={!selected || loading}
            size="lg"
            className={`h-14 px-10 text-lg font-semibold rounded-full transition-all ${
              selected
                ? "bg-primary text-white shadow-[0_0_25px_rgba(168,85,247,0.55)] hover:shadow-[0_0_40px_rgba(168,85,247,0.75)] hover:bg-primary/90"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
            data-testid="btn-continue-onboarding"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Personalizing your feed…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continue to my feed <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>

          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            data-testid="btn-skip-onboarding"
          >
            Skip for now — I&apos;ll decide later
          </button>
        </div>
      </motion.div>
    </div>
  );
}
