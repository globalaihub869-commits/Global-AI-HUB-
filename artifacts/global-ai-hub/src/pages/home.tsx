import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain, Image as ImageIcon, Code2, Mic, Bot, Database,
  ArrowRight, Play, ChevronDown, Mail, Sparkles, Zap, Globe, CheckCircle2,
  TrendingUp, Newspaper, FlaskConical, BookOpen, Building2, DollarSign,
  Briefcase, GraduationCap, Settings, Star,
} from "lucide-react";
import { apiFetch } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth, type ProfileType } from "@/context/AuthContext";
import { useListTools, useListNews } from "@workspace/api-client-react";
import ToolSocialBar from "@/components/tools/ToolSocialBar";

/* ─── Personalization Config ──────────────────────────────────────────────── */

type PersonalizationConfig = {
  greeting: string;
  tagline: string;
  badgeText: string;
  badgeColor: string;
  heroBadge: string;
  toolDomains: string[];
  newsCategories: string[];
  icon: React.ElementType;
};

const PERSONALIZATION: Record<ProfileType, PersonalizationConfig> = {
  developer: {
    greeting: "Your Developer Feed",
    tagline: "Cutting-edge models, code AI tools, and research — curated for builders.",
    badgeText: "Developer",
    badgeColor: "text-primary border-primary/40 bg-primary/10",
    heroBadge: "Built for Developers",
    toolDomains: ["Code AI", "Agents", "LLMs"],
    newsCategories: ["Models", "Research", "Open Source"],
    icon: Code2,
  },
  business: {
    greeting: "Your Business Feed",
    tagline: "AI tools to grow faster, industry shifts, and funding moves — all in one place.",
    badgeText: "Business",
    badgeColor: "text-secondary border-secondary/40 bg-secondary/10",
    heroBadge: "Built for Business",
    toolDomains: ["Marketing", "Design", "Analytics"],
    newsCategories: ["Industry", "Funding", "Releases"],
    icon: Briefcase,
  },
  student: {
    greeting: "Your Student Feed",
    tagline: "Free tools, research in plain English, and open-source gems for curious minds.",
    badgeText: "Student",
    badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    heroBadge: "Built for Students",
    toolDomains: ["LLMs", "Code AI"],
    newsCategories: ["Research", "Open Source"],
    icon: GraduationCap,
  },
};

/* ─── Personalized Dashboard ──────────────────────────────────────────────── */

function PersonalizedDashboard({ profileType, name }: { profileType: ProfileType; name: string }) {
  const config = PERSONALIZATION[profileType];
  const ProfileIcon = config.icon;
  const firstName = name.split(" ")[0];

  const { data: toolsData, isLoading: toolsLoading } = useListTools(
    { domain: config.toolDomains[0] as string },
    { query: { queryKey: ["personalized-tools", profileType] } },
  );

  const { data: newsData, isLoading: newsLoading } = useListNews(
    { category: config.newsCategories[0] as string },
    { query: { queryKey: ["personalized-news", profileType] } },
  );

  const tools = (toolsData?.tools ?? []).slice(0, 4);
  const articles = (newsData?.articles ?? []).slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-16"
      data-testid="personalized-dashboard"
    >
      {/* Welcome banner */}
      <div className="p-[1px] rounded-2xl bg-gradient-to-r from-primary/50 via-secondary/30 to-primary/20 mb-8 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
        <div className="bg-[hsl(240,15%,7%)] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] flex-shrink-0">
              <ProfileIcon className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-2.5 py-1 mb-2 ${config.badgeColor}`}>
                <ProfileIcon className="w-3 h-3" />
                {config.badgeText}
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
                Welcome back, {firstName}! 👋
              </h2>
              <p className="text-muted-foreground mt-1 max-w-xl">{config.tagline}</p>
            </div>
          </div>
          <Link href="/onboarding" data-testid="btn-change-profile">
            <Button variant="outline" size="sm" className="border-white/15 text-muted-foreground hover:text-white hover:border-white/30 gap-2 rounded-full whitespace-nowrap flex-shrink-0">
              <Settings className="w-3.5 h-3.5" /> Change Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Two-column grid: Tools + News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recommended Tools */}
        <div data-testid="personalized-tools-section">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Recommended Tools
            </h3>
            <Link href="/tools" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {toolsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/[0.03] border border-white/8 animate-pulse" />
                ))
              : tools.length > 0
              ? tools.map((tool) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    data-testid={`personalized-tool-${tool.id}`}
                    className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/8 hover:border-primary/30 hover:bg-white/[0.06] transition-all group"
                  >
                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: `radial-gradient(circle at 30% 30%, ${tool.accentColor}, hsl(240,15%,14%))` }}
                      >
                        {tool.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">{tool.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{tool.domain}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-yellow-400 flex-shrink-0">
                        ⭐ {tool.rating}
                      </div>
                    </a>
                    <div className="pl-12">
                      <ToolSocialBar toolId={tool.id} toolName={tool.name} size="sm" />
                    </div>
                  </motion.div>
                ))
              : (
                <p className="text-muted-foreground text-sm py-4 text-center">No tools found for your profile yet.</p>
              )}
          </div>
        </div>

        {/* Relevant News */}
        <div data-testid="personalized-news-section">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-secondary" />
              Latest in {config.newsCategories[0]}
            </h3>
            <Link href="/news" className="text-xs text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {newsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-white/[0.03] border border-white/8 animate-pulse" />
                ))
              : articles.length > 0
              ? articles.map((article) => (
                  <motion.a
                    key={article.id}
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    data-testid={`personalized-news-${article.id}`}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/8 hover:border-secondary/30 hover:bg-white/[0.06] transition-all group"
                  >
                    <p className="text-sm font-semibold text-white mb-1 line-clamp-2 group-hover:text-secondary transition-colors leading-snug">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{article.source}</span>
                      <span>·</span>
                      <span>{article.readTimeMinutes} min read</span>
                    </div>
                  </motion.a>
                ))
              : (
                <p className="text-muted-foreground text-sm py-4 text-center">No news found for your profile yet.</p>
              )}
          </div>
        </div>
      </div>

      {/* Category quick-links for this profile */}
      <div className="mt-6 flex flex-wrap gap-2" data-testid="personalized-quick-links">
        {config.toolDomains.map((domain) => (
          <Link key={domain} href={`/tools`}>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium border border-primary/25 text-primary bg-primary/8 rounded-full px-3 py-1.5 hover:bg-primary/15 transition-colors cursor-pointer">
              <Zap className="w-3 h-3" />{domain}
            </span>
          </Link>
        ))}
        {config.newsCategories.map((cat) => {
          const icons: Record<string, React.ElementType> = {
            Models: Brain, Research: FlaskConical, "Open Source": BookOpen,
            Industry: Building2, Funding: DollarSign, Releases: TrendingUp,
          };
          const CatIcon = icons[cat] ?? Newspaper;
          return (
            <Link key={cat} href="/news">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium border border-secondary/25 text-secondary bg-secondary/8 rounded-full px-3 py-1.5 hover:bg-secondary/15 transition-colors cursor-pointer">
                <CatIcon className="w-3 h-3" />{cat}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}

/* ─── Onboarding Nudge (logged in, no profile set) ────────────────────────── */

function OnboardingNudge({ name }: { name: string }) {
  const firstName = name.split(" ")[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 p-[1px] rounded-2xl bg-gradient-to-r from-primary/40 via-secondary/20 to-primary/10"
      data-testid="onboarding-nudge"
    >
      <div className="bg-[hsl(240,15%,8%)] rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-white font-semibold">Hey {firstName}, personalize your feed!</p>
            <p className="text-muted-foreground text-sm">Tell us how you use AI and we'll tailor everything for you.</p>
          </div>
        </div>
        <Link href="/onboarding">
          <Button className="rounded-full bg-primary text-white hover:bg-primary/90 shadow-[0_0_16px_rgba(168,85,247,0.4)] transition-all whitespace-nowrap flex-shrink-0" data-testid="btn-nudge-onboarding">
            Choose Profile <ArrowRight className="ms-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── FAQ Item ─────────────────────────────────────────────────────────────── */

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }}
      className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03] hover:border-primary/30 transition-colors" data-testid={`faq-item-${index}`}
    >
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-left px-6 py-5 gap-4 group" data-testid={`faq-toggle-${index}`} aria-expanded={open}>
        <span className="font-display font-semibold text-white group-hover:text-primary transition-colors text-base md:text-lg">{q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="px-6 pb-5 text-muted-foreground leading-relaxed border-t border-white/5 pt-4">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Newsletter ───────────────────────────────────────────────────────────── */

function NewsletterSection() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 900);
  };
  return (
    <section className="py-24" id="newsletter" data-testid="newsletter-section">
      <div className="max-w-2xl mx-auto text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium mb-6">
            <Mail className="w-3.5 h-3.5" />{t("newsletter.badge")}
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
            {t("newsletter.title")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">{t("newsletter.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">{t("newsletter.subtitle")}</p>
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 py-6" data-testid="newsletter-success">
              <CheckCircle2 className="w-12 h-12 text-secondary [filter:drop-shadow(0_0_12px_rgba(34,211,238,0.6))]" />
              <p className="text-white font-display font-semibold text-xl">{t("newsletter.successTitle")}</p>
              <p className="text-muted-foreground">{t("newsletter.successText")}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" data-testid="newsletter-form">
              <Input type="email" placeholder={t("newsletter.placeholder")} value={email} onChange={(e) => setEmail(e.target.value)} required
                className="h-12 flex-1 bg-white/5 border-white/15 placeholder:text-muted-foreground/50 focus:border-primary transition-all" data-testid="newsletter-email-input" />
              <Button type="submit" disabled={loading} className="h-12 px-6 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all whitespace-nowrap" data-testid="newsletter-submit-btn">
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("newsletter.btnJoining")}</span>
                  : <>{t("newsletter.btnJoin")}<ArrowRight className="ml-2 w-4 h-4" /></>}
              </Button>
            </form>
          )}
          <p className="mt-4 text-xs text-muted-foreground/60">{t("newsletter.disclaimer")}</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Home Page ────────────────────────────────────────────────────────────── */

export default function Home() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const categories = [
    { nameKey: "cat.llms" as const, descKey: "cat.llmsDesc" as const, icon: Brain },
    { nameKey: "cat.imageGen" as const, descKey: "cat.imageGenDesc" as const, icon: ImageIcon },
    { nameKey: "cat.codeAI" as const, descKey: "cat.codeAIDesc" as const, icon: Code2 },
    { nameKey: "cat.voiceAI" as const, descKey: "cat.voiceAIDesc" as const, icon: Mic },
    { nameKey: "cat.agents" as const, descKey: "cat.agentsDesc" as const, icon: Bot },
    { nameKey: "cat.dataAI" as const, descKey: "cat.dataAIDesc" as const, icon: Database },
  ];

  const faqs = [
    { q: "What is Global AI Hub?", a: "Global AI Hub is the world's most comprehensive command center for artificial intelligence. We aggregate, curate, and track 2,400+ AI tools, breaking research, model benchmarks, and community insights — all in one place." },
    { q: "Is it free to use?", a: "Yes. Browsing tools, reading news, and exploring the models leaderboard is completely free. We plan to offer a Pro tier for power users who want advanced filters, personalized feeds, and early access to new features." },
    { q: "How do I submit an AI tool?", a: "Click 'Submit Tool' in the navigation bar. Fill in the tool's name, category, description, and URL. Our team reviews submissions within 48 hours before they go live." },
    { q: "How often is the data updated?", a: "Tool listings and news articles are refreshed daily. Model benchmark scores are updated whenever a major new evaluation is published — typically within 24 hours of a model release or paper drop." },
    { q: "Can I embed Global AI Hub data in my own app?", a: "We're working on a public API. Join the newsletter to be notified when developer access launches. In the meantime, reach out via our contact page for partnership enquiries." },
  ];

  const showPersonalized = !authLoading && isAuthenticated && user?.profileType;
  const showNudge = !authLoading && isAuthenticated && !user?.profileType;

  interface FeaturedReview { id: string; userName: string; rating: number; comment: string; createdAt: number; }
  const [featuredReviews, setFeaturedReviews] = useState<FeaturedReview[]>([]);
  useEffect(() => {
    const fetchReviews = () => {
      apiFetch("/support/reviews/featured").then((d: { reviews: FeaturedReview[] }) => setFeaturedReviews(d.reviews ?? [])).catch(() => {});
    };
    fetchReviews();
    const iv = setInterval(fetchReviews, 30_000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-10 overflow-hidden">
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-primary/20 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-[30%] left-[-15%] w-[500px] h-[500px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-[50%] right-[-10%] w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4">

        {/* ── PERSONALIZED DASHBOARD (logged in + profile set) ── */}
        {showPersonalized && user && (
          <div className="pt-8">
            <PersonalizedDashboard profileType={user.profileType!} name={user.name} />
          </div>
        )}

        {/* ── ONBOARDING NUDGE (logged in, no profile) ── */}
        {showNudge && user && (
          <div className="pt-8">
            <OnboardingNudge name={user.name} />
          </div>
        )}

        {/* ── HERO ── */}
        <section className="py-16 md:py-24" data-testid="hero-section">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* ── Left: text + CTAs ── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65 }}
              className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-8 backdrop-blur-sm shadow-[0_0_18px_rgba(168,85,247,0.2)]" data-testid="hero-badge">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {isAuthenticated && user?.profileType
                  ? PERSONALIZATION[user.profileType].heroBadge
                  : t("hero.badge")}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight mb-6 leading-[1.1]" data-testid="hero-title">
                {t("hero.h1")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">
                  {t("hero.h2")}
                </span>
                <br />
                <span className="text-2xl md:text-3xl lg:text-4xl text-white/80 font-light">{t("hero.h3")}</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed" data-testid="hero-subtitle">
                {t("hero.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-10">
                <Link href="/tools" data-testid="hero-btn-explore">
                  <Button size="lg" className="h-14 px-8 text-lg bg-primary text-white hover:bg-primary/90 shadow-[0_0_24px_rgba(168,85,247,0.55)] hover:shadow-[0_0_40px_rgba(168,85,247,0.75)] transition-all">
                    <Sparkles className="mr-2 w-5 h-5" />{t("hero.exploreCta")}
                  </Button>
                </Link>
                {isAuthenticated ? (
                  <Link href="/news" data-testid="hero-btn-news">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-secondary/40 text-secondary hover:bg-secondary/10 hover:border-secondary/70 transition-all">
                      <Newspaper className="mr-2 w-5 h-5" />Latest AI News
                    </Button>
                  </Link>
                ) : (
                  <a href="#newsletter" data-testid="hero-btn-newsletter">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-secondary/40 text-secondary hover:bg-secondary/10 hover:border-secondary/70 transition-all">
                      <Mail className="mr-2 w-5 h-5" />{t("hero.newsletterCta")}
                    </Button>
                  </a>
                )}
              </div>

              {/* Stats row — compact under CTAs on desktop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 border-t border-white/8 w-full"
                data-testid="stats-bar"
              >
                {[
                  { val: "2,400+", key: "stats.tools" as const },
                  { val: "180", key: "stats.countries" as const },
                  { val: "50K+", key: "stats.researchers" as const },
                  { val: "12K+", key: "stats.readers" as const },
                ].map((s) => (
                  <div key={s.key} className="flex flex-col items-center lg:items-start" data-testid={`stat-${s.key}`}>
                    <div className="text-2xl font-display font-bold text-white [text-shadow:0_0_12px_rgba(255,255,255,0.2)]">{s.val}</div>
                    <div className="text-[10px] text-secondary font-medium tracking-widest uppercase">{t(s.key)}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── Right: banner image ── */}
            <motion.div
              initial={{ opacity: 0, x: 24, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="flex-shrink-0 w-full max-w-sm md:max-w-md lg:max-w-[420px] mx-auto lg:mx-0"
              data-testid="hero-media-block"
            >
              {/* Outer neon glow border */}
              <div className="relative p-[1.5px] rounded-3xl bg-gradient-to-br from-primary/70 via-secondary/40 to-primary/20 shadow-[0_0_60px_rgba(168,85,247,0.35),0_0_120px_rgba(168,85,247,0.15)]">
                <div className="relative rounded-3xl overflow-hidden bg-[hsl(240,15%,6%)]">
                  <img
                    src="/global-ai-hub-banner.png"
                    alt="Global AI Hub — Your Global Ecosystem for AI Innovation"
                    className="w-full h-auto object-cover block"
                    loading="eager"
                    data-testid="hero-banner-img"
                  />
                  {/* Floating stat chips — matching the theme */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-secondary/40 rounded-xl px-2.5 py-1.5 text-[11px] text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                    <Globe className="w-3 h-3 text-secondary flex-shrink-0" /><span>180 countries</span>
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-primary/40 rounded-xl px-2.5 py-1.5 text-[11px] text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    <Zap className="w-3 h-3 text-primary flex-shrink-0" /><span>2,400+ AI tools</span>
                  </div>
                  {/* Bottom fade for smooth blending */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[hsl(240,15%,6%)] to-transparent pointer-events-none" />
                </div>
              </div>
              {/* Label below image */}
              <p className="mt-2.5 text-center text-[10px] text-muted-foreground/50 tracking-widest uppercase">
                {t("hero.mediaLabel")}
              </p>
            </motion.div>

          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">{t("home.categoriesTitle")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("home.categoriesSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.nameKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }} data-testid={`category-card-${cat.nameKey}`}>
                  <Link href="/tools">
                    <Card className="h-full bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/50 hover:bg-card transition-all cursor-pointer group shadow-lg hover:shadow-[0_0_28px_rgba(168,85,247,0.22)]">
                      <CardContent className="p-8 flex flex-col items-center text-center">
                        <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-primary/20 text-white group-hover:text-primary transition-colors mb-5 ring-1 ring-white/10 group-hover:ring-primary/50 group-hover:shadow-[0_0_16px_rgba(168,85,247,0.3)]">
                          <Icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-2">{t(cat.nameKey)}</h3>
                        <p className="text-sm text-muted-foreground">{t(cat.descKey)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        {featuredReviews.length > 0 && (
          <section className="py-16" data-testid="testimonials-section">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/25 text-yellow-300 text-sm font-medium mb-4">
                <Star className="w-3.5 h-3.5 fill-yellow-300" /> User Reviews
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">What our community says</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Real reviews from verified users of Global AI Hub.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {featuredReviews.map((review, idx) => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.07 }} data-testid={`review-card-${review.id}`}>
                  <Card className="h-full bg-card/50 backdrop-blur-sm border-white/10 hover:border-yellow-400/30 transition-all shadow-lg">
                    <CardContent className="p-6 flex flex-col gap-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-white/15"}`} />
                        ))}
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed flex-1">"{review.comment}"</p>
                      <p className="text-xs text-muted-foreground/60 font-medium">— {review.userName}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        <section className="py-20 max-w-3xl mx-auto" data-testid="faq-section">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-5">
              <Sparkles className="w-3.5 h-3.5" />{t("faq.badge")}
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">{t("faq.title")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("faq.subtitle")}</p>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} index={i} />)}
          </div>
        </section>

        {/* ── NEWSLETTER ── */}
        <NewsletterSection />
      </div>
    </div>
  );
}
