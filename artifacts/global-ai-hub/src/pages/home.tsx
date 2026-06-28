import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain, Image as ImageIcon, Code2, Mic, Bot, Database,
  ArrowRight, Play, ChevronDown, Mail, Sparkles, Zap, Globe, CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03] hover:border-primary/30 transition-colors"
      data-testid={`faq-item-${index}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left px-6 py-5 gap-4 group"
        data-testid={`faq-toggle-${index}`}
        aria-expanded={open}
      >
        <span className="font-display font-semibold text-white group-hover:text-primary transition-colors text-base md:text-lg">{q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-6 pb-5 text-muted-foreground leading-relaxed border-t border-white/5 pt-4">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

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
            <Mail className="w-3.5 h-3.5" />
            {t("newsletter.badge")}
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
            {t("newsletter.title")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
              {t("newsletter.titleHighlight")}
            </span>
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">{t("newsletter.subtitle")}</p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6" data-testid="newsletter-success"
            >
              <CheckCircle2 className="w-12 h-12 text-secondary [filter:drop-shadow(0_0_12px_rgba(34,211,238,0.6))]" />
              <p className="text-white font-display font-semibold text-xl">{t("newsletter.successTitle")}</p>
              <p className="text-muted-foreground">{t("newsletter.successText")}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" data-testid="newsletter-form">
              <Input
                type="email" placeholder={t("newsletter.placeholder")} value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="h-12 flex-1 bg-white/5 border-white/15 placeholder:text-muted-foreground/50 focus:border-primary focus:shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all"
                data-testid="newsletter-email-input"
              />
              <Button
                type="submit" disabled={loading}
                className="h-12 px-6 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all whitespace-nowrap"
                data-testid="newsletter-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("newsletter.btnJoining")}
                  </span>
                ) : (
                  <>{t("newsletter.btnJoin")}<ArrowRight className="ml-2 w-4 h-4" /></>
                )}
              </Button>
            </form>
          )}
          <p className="mt-4 text-xs text-muted-foreground/60">{t("newsletter.disclaimer")}</p>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useLanguage();

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

  return (
    <div className="min-h-screen pt-20 pb-10 overflow-hidden">
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-primary/20 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-[30%] left-[-15%] w-[500px] h-[500px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-[50%] right-[-10%] w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4">

        {/* ── HERO ─────────────────────────────────────── */}
        <section className="py-20 md:py-28 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="w-full">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-8 backdrop-blur-sm shadow-[0_0_18px_rgba(168,85,247,0.2)]" data-testid="hero-badge">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t("hero.badge")}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-6 leading-[1.1]" data-testid="hero-title">
              {t("hero.h1")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">
                {t("hero.h2")}
              </span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl text-white/80 font-light">{t("hero.h3")}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed" data-testid="hero-subtitle">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link href="/tools" data-testid="hero-btn-explore">
                <Button size="lg" className="h-14 px-8 text-lg bg-primary text-white hover:bg-primary/90 shadow-[0_0_24px_rgba(168,85,247,0.55)] hover:shadow-[0_0_40px_rgba(168,85,247,0.75)] transition-all">
                  <Sparkles className="mr-2 w-5 h-5" />{t("hero.exploreCta")}
                </Button>
              </Link>
              <a href="#newsletter" data-testid="hero-btn-newsletter">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-secondary/40 text-secondary hover:bg-secondary/10 hover:border-secondary/70 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all">
                  <Mail className="mr-2 w-5 h-5" />{t("hero.newsletterCta")}
                </Button>
              </a>
            </div>
          </motion.div>

          {/* ── MEDIA BLOCK ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7 }}
            className="w-full max-w-5xl mx-auto" data-testid="hero-media-block"
          >
            <div className="relative rounded-2xl overflow-hidden p-[1px] bg-gradient-to-br from-primary/60 via-secondary/30 to-primary/10 shadow-[0_0_60px_rgba(168,85,247,0.3)]">
              <div className="relative bg-[hsl(240,15%,7%)] rounded-2xl aspect-video flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[600px] h-[600px] rounded-full border border-primary/10 animate-[ping_3s_ease-in-out_infinite]" />
                  <div className="absolute w-[400px] h-[400px] rounded-full border border-secondary/10 animate-[ping_3s_ease-in-out_infinite_0.5s]" />
                  <div className="absolute w-[200px] h-[200px] rounded-full border border-primary/20 animate-[ping_3s_ease-in-out_infinite_1s]" />
                </div>
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-primary/30 rounded-xl px-3 py-2 text-xs text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                  <Zap className="w-3.5 h-3.5 text-primary" /><span>GPT-4o — 128K context</span>
                </div>
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-secondary/30 rounded-xl px-3 py-2 text-xs text-white shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                  <Globe className="w-3.5 h-3.5 text-secondary" /><span>180 countries connected</span>
                </div>
                <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-primary/20 rounded-xl px-3 py-2 text-xs text-white">
                  <Brain className="w-3.5 h-3.5 text-primary" /><span>Claude 3.5 — #1 ranked</span>
                </div>
                <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-secondary/20 rounded-xl px-3 py-2 text-xs text-white">
                  <Bot className="w-3.5 h-3.5 text-secondary" /><span>1,200 agents deployed today</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] cursor-pointer hover:scale-110 hover:shadow-[0_0_50px_rgba(168,85,247,0.7)] transition-all group" data-testid="media-play-btn">
                    <Play className="w-8 h-8 text-white fill-white ml-1 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-display font-semibold text-lg">{t("hero.mediaTitle")}</p>
                    <p className="text-muted-foreground text-sm mt-1">{t("hero.mediaSubtitle")}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[hsl(240,15%,7%)] to-transparent" />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground/50 tracking-wide uppercase">{t("hero.mediaLabel")}</p>
          </motion.div>

          {/* ── STATS BAR ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.8 }}
            className="mt-12 w-full max-w-3xl mx-auto p-[1px] rounded-2xl bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            data-testid="stats-bar"
          >
            <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-around gap-8 border border-white/5">
              {[
                { val: "2,400+", key: "stats.tools" as const },
                { val: "180", key: "stats.countries" as const },
                { val: "50K+", key: "stats.researchers" as const },
                { val: "12K+", key: "stats.readers" as const },
              ].map((s) => (
                <div key={s.key} className="flex flex-col items-center text-center" data-testid={`stat-${s.key}`}>
                  <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1 [text-shadow:0_0_12px_rgba(255,255,255,0.25)]">{s.val}</div>
                  <div className="text-xs text-secondary font-medium tracking-widest uppercase">{t(s.key)}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── CATEGORIES ─────────────────────────────────── */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">{t("home.categoriesTitle")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("home.categoriesSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.nameKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
                  data-testid={`category-card-${cat.nameKey}`}
                >
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

        {/* ── FAQ ────────────────────────────────────────── */}
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

        {/* ── NEWSLETTER ─────────────────────────────────── */}
        <NewsletterSection />
      </div>
    </div>
  );
}
