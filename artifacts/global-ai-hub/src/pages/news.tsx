import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock, ExternalLink, Search, X, Dot, Newspaper, TrendingUp, Cpu, DollarSign,
  FlaskConical, Scale, Package, HardDrive, BookOpen, Building2, Zap, AlertCircle, ChevronRight,
  Clapperboard, Sparkles,
} from "lucide-react";
import { useListNews } from "@workspace/api-client-react";
import type { NewsDigest } from "@workspace/api-client-react";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "wouter";
import { useEarnTokens } from "@/hooks/useEarnTokens";
import TranslateToggle from "@/components/common/TranslateToggle";

const CATEGORIES = [
  { label: "All", value: "All", icon: Newspaper },
  { label: "Models", value: "Models", icon: Cpu },
  { label: "Funding", value: "Funding", icon: DollarSign },
  { label: "Research", value: "Research", icon: FlaskConical },
  { label: "Regulation", value: "Regulation", icon: Scale },
  { label: "Releases", value: "Releases", icon: Package },
  { label: "Hardware", value: "Hardware", icon: HardDrive },
  { label: "Open Source", value: "Open Source", icon: BookOpen },
  { label: "Industry", value: "Industry", icon: Building2 },
];

const CATEGORY_COLORS: Record<string, string> = {
  Models: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Funding: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Research: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Regulation: "bg-red-500/15 text-red-400 border-red-500/30",
  Releases: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  Hardware: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Open Source": "bg-lime-500/15 text-lime-400 border-lime-500/30",
  Industry: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CategoryChip({
  label, value, icon: Icon, active, onClick,
}: {
  label: string; value: string; icon: React.ElementType; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={`filter-category-${value.replace(/\s+/g, "-").toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
        active
          ? "bg-primary text-white border-primary shadow-[0_0_14px_rgba(168,85,247,0.5)]"
          : "bg-white/5 text-muted-foreground border-white/10 hover:border-primary/40 hover:text-white"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function FeaturedCard({ article }: { article: NewsDigest }) {
  const { t } = useLanguage();
  const earnTokens = useEarnTokens();
  const earnedRef = useRef(false);

  const handleWatched = () => {
    if (earnedRef.current) return;
    earnedRef.current = true;
    earnTokens("watched_news", article.title);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="mb-10" data-testid="featured-article">
      <div className="relative rounded-2xl overflow-hidden p-[1px] bg-gradient-to-br from-primary/50 via-secondary/20 to-primary/10 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
        <div className="bg-[hsl(240,15%,7%)] rounded-2xl p-7 md:p-10">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 bg-primary/10 rounded-full px-3 py-1">
              <TrendingUp className="w-3 h-3" />{t("news.featured")}
            </span>
            <Badge variant="outline" className={`text-xs border ${CATEGORY_COLORS[article.category] ?? "text-muted-foreground border-white/10"}`}>
              {article.category}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeDate(article.publishedAt)}</span>
            <span className="text-xs text-muted-foreground">{article.readTimeMinutes} {t("news.minRead")}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6 leading-snug">{article.title}</h2>

          <div className="mb-6">
            <p className="text-xs text-secondary font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Zap className="w-3 h-3" />{t("news.aiSummary")} — 3 Key Points
            </p>
            <ul className="flex flex-col gap-3">
              {(article.summary as [string, string, string]).map((bullet, i) => (
                <li key={i} className="flex gap-3 items-start" data-testid={`featured-bullet-${i}`}>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{bullet}</p>
                </li>
              ))}
            </ul>
            <TranslateToggle
              text={(article.summary as [string, string, string]).join(" ")}
              className="mt-3"
              testId={`btn-translate-featured-${article.id}`}
            />
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-white/8">
            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground/60 bg-white/[0.04] border border-white/[0.07] rounded px-2 py-0.5">{tag}</span>
              ))}
            </div>
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={handleWatched} data-testid="featured-source-link"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-white bg-primary/10 hover:bg-primary border border-primary/30 hover:border-primary rounded-full px-4 py-2 transition-all">
              {t("news.source")}: {article.source}<ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DigestCard({ article, idx }: { article: NewsDigest; idx: number }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const earnTokens = useEarnTokens();
  const earnedRef = useRef(false);

  const handleWatched = () => {
    if (earnedRef.current) return;
    earnedRef.current = true;
    earnTokens("watched_news", article.title);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22, delay: Math.min(idx * 0.05, 0.4) }}
      data-testid={`news-card-${article.id}`}
      className="group rounded-2xl border border-white/8 bg-[hsl(240,15%,8%)] hover:border-primary/30 transition-all hover:shadow-[0_0_24px_rgba(168,85,247,0.12)] overflow-hidden"
    >
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className={`text-xs border ${CATEGORY_COLORS[article.category] ?? "text-muted-foreground border-white/10"}`} data-testid={`badge-category-${article.id}`}>
            {article.category}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeDate(article.publishedAt)}</span>
          <span className="text-xs text-muted-foreground/50"><Dot className="inline w-3 h-3" />{article.readTimeMinutes} {t("news.minRead")}</span>
        </div>

        <h3 className="text-lg md:text-xl font-display font-semibold text-white group-hover:text-primary transition-colors leading-snug mb-2">{article.title}</h3>
        <p className="text-xs text-muted-foreground/70 font-medium mb-4">via <span className="text-muted-foreground">{article.source}</span></p>

        <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
          <p className="text-[11px] text-secondary font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Zap className="w-3 h-3" />{t("news.aiSummary")}
          </p>
          <ul className="flex flex-col gap-2.5">
            {(article.summary as [string, string, string]).map((bullet, i) => (
              <li key={i} className="flex gap-2.5 items-start text-sm text-muted-foreground leading-relaxed" data-testid={`bullet-${article.id}-${i}`}>
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                <span className={!expanded && i > 0 ? "line-clamp-2 md:line-clamp-none" : ""}>{bullet}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => { setExpanded((v) => !v); handleWatched(); }}
            className="mt-3 text-[11px] text-muted-foreground/60 hover:text-primary transition-colors md:hidden"
            data-testid={`btn-expand-${article.id}`}
          >
            {expanded ? t("news.showLess") : t("news.showFull")}
          </button>
          <TranslateToggle
            text={(article.summary as [string, string, string]).join(" ")}
            className="mt-3"
            testId={`btn-translate-news-${article.id}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-5 md:px-6 py-3 border-t border-white/[0.06] bg-white/[0.015]">
        <div className="flex flex-wrap gap-1.5">
          {article.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[11px] text-muted-foreground/50 bg-white/[0.03] border border-white/[0.06] rounded px-2 py-0.5">{tag}</span>
          ))}
        </div>
        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={handleWatched} data-testid={`source-link-${article.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group/link">
          {t("news.source")}
          <ExternalLink className="w-3.5 h-3.5 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </motion.article>
  );
}

function DigestCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[hsl(240,15%,8%)] p-5 md:p-6 flex flex-col gap-4">
      <div className="flex gap-2">
        <Skeleton className="w-20 h-5 rounded-full bg-white/5" />
        <Skeleton className="w-16 h-5 rounded-full bg-white/5" />
      </div>
      <Skeleton className="w-full h-6 rounded bg-white/5" />
      <Skeleton className="w-2/3 h-6 rounded bg-white/5" />
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 flex flex-col gap-3">
        <Skeleton className="w-24 h-3 rounded bg-white/5" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="w-5 h-5 rounded-full flex-shrink-0 bg-white/5" />
            <Skeleton className="flex-1 h-4 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function News() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { data, isLoading, isError, refetch } = useListNews(
    { search: search || undefined, category: category !== "All" ? category : undefined },
    { query: { queryKey: ["listNews", search, category] } },
  );

  const articles = data?.articles ?? [];
  const featured = data?.featured;
  const mainArticles = articles.filter((a) => !a.featured || category !== "All" || search);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 max-w-4xl">

        {/* PAGE HEADER */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10 pb-8 border-b border-white/8">
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
            </span>
            <span className="text-xs text-primary font-semibold uppercase tracking-widest">{t("news.liveFeed")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 [text-shadow:0_0_30px_rgba(168,85,247,0.2)]" data-testid="news-title">
            {t("news.title")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-6">{t("news.subtitle")}</p>

          <Link href="/ai-video-studio" data-testid="link-ai-video-studio-banner">
            <div className="group relative rounded-2xl p-[1px] bg-gradient-to-r from-primary via-secondary to-primary overflow-hidden cursor-pointer">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-[hsl(240,15%,7%)] px-5 py-4 sm:px-6 sm:py-5 group-hover:bg-[hsl(240,15%,8%)] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.4)] flex-shrink-0">
                    <Clapperboard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                      New <Sparkles className="w-3.5 h-3.5 text-secondary" /> AI News Video Generator
                    </p>
                    <p className="text-xs text-muted-foreground">Turn headlines into an avatar-led broadcast in seconds.</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-white bg-primary/10 group-hover:bg-primary border border-primary/30 group-hover:border-primary rounded-full px-4 py-2 transition-all whitespace-nowrap">
                  Launch Studio <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* SEARCH + FILTERS */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative max-w-lg">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("news.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-11 pe-10 h-11 bg-white/5 border-white/10 focus:border-primary focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] placeholder:text-muted-foreground/50 transition-all"
              data-testid="input-search-news"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white" data-testid="btn-clear-search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ label, value, icon }) => (
              <CategoryChip key={value} label={label} value={value} icon={icon} active={category === value} onClick={() => setCategory(value)} />
            ))}
          </div>
        </div>

        {/* RESULTS META */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground" data-testid="results-count">
            {isLoading ? (
              <span className="inline-block w-28 h-4 rounded bg-white/5 animate-pulse" />
            ) : (
              <>
                <span className="text-white font-semibold">{data?.total ?? 0}</span> {t("news.articles")}
                {category !== "All" && <> {t("news.in")} <span className="text-primary">{category}</span></>}
                {search && <> {t("news.matching")} <span className="text-primary">"{search}"</span></>}
              </>
            )}
          </p>
          {(category !== "All" || search) && (
            <button onClick={() => { setSearch(""); setCategory("All"); }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white underline underline-offset-2" data-testid="btn-clear-filters">
              <X className="w-3 h-3" /> {t("news.clear")}
            </button>
          )}
        </div>

        {/* ERROR */}
        {isError && (
          <div className="flex flex-col items-center py-20 text-center" data-testid="news-error-state">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <p className="text-white font-semibold mb-2">Failed to load news</p>
            <p className="text-muted-foreground text-sm mb-5">Check your connection and try again.</p>
            <Button onClick={() => refetch()} data-testid="btn-retry">{t("common.retry")}</Button>
          </div>
        )}

        {!isError && (
          <>
            {!isLoading && featured && category === "All" && !search && (
              <FeaturedCard article={featured} />
            )}

            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="flex flex-col gap-5" data-testid="news-skeleton-list">
                  {Array.from({ length: 6 }).map((_, i) => <DigestCardSkeleton key={i} />)}
                </div>
              ) : mainArticles.length > 0 ? (
                <motion.div layout className="flex flex-col gap-5">
                  {mainArticles.map((article, idx) => <DigestCard key={article.id} article={article} idx={idx} />)}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-24 text-center" data-testid="empty-news-state">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                    <Newspaper className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">{t("news.emptyTitle")}</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">{t("news.emptyText")}</p>
                  <Button onClick={() => { setSearch(""); setCategory("All"); }} className="gap-2" data-testid="btn-clear-filters-empty">
                    {t("news.viewAll")} <ChevronRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {!isLoading && mainArticles.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="mt-14 p-[1px] rounded-2xl bg-gradient-to-r from-secondary/40 via-primary/30 to-secondary/10">
                <div className="bg-[hsl(240,15%,7%)] rounded-2xl p-7 md:p-9 flex flex-col md:flex-row items-center justify-between gap-5">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white mb-1">{t("news.newsletterTitle")}</h3>
                    <p className="text-muted-foreground text-sm">{t("news.newsletterText")}</p>
                  </div>
                  <a href="/#newsletter">
                    <Button size="lg" className="rounded-full whitespace-nowrap bg-secondary text-black font-semibold hover:bg-secondary/80 shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:shadow-[0_0_35px_rgba(34,211,238,0.55)] transition-all" data-testid="btn-news-newsletter">
                      {t("news.joinNewsletter")}<ChevronRight className="ms-2 w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
