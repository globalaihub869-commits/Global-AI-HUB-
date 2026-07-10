import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, ExternalLink, Zap, Star, ShieldCheck, X,
  SlidersHorizontal, TrendingUp, Brain, Code2, Image as ImageIcon,
  Mic, Bot, Megaphone, Palette, BarChart2, Globe, ChevronRight, AlertCircle,
} from "lucide-react";
import { useListTools } from "@workspace/api-client-react";
import type { Tool } from "@workspace/api-client-react";
import { useLanguage } from "@/context/LanguageContext";
import ToolSocialBar from "@/components/tools/ToolSocialBar";
import TranslateToggle from "@/components/common/TranslateToggle";

type Pricing = "Free" | "Freemium" | "Premium";
type ToolType = "Text" | "Image" | "Audio" | "Code" | "Video" | "Data";
type Domain = "LLMs" | "Code AI" | "Image Gen" | "Voice AI" | "Agents" | "Marketing" | "Design" | "Analytics" | "Productivity";
type SortOption = "Most Popular" | "Top Rated" | "A–Z";

const DOMAIN_FILTER_VALUES: { value: Domain | "All"; icon: React.ElementType }[] = [
  { value: "All", icon: Globe },
  { value: "LLMs", icon: Brain },
  { value: "Code AI", icon: Code2 },
  { value: "Image Gen", icon: ImageIcon },
  { value: "Voice AI", icon: Mic },
  { value: "Agents", icon: Bot },
  { value: "Marketing", icon: Megaphone },
  { value: "Design", icon: Palette },
];

const pricingColor: Record<Pricing, string> = {
  Free: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Freemium: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Premium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

function FilterChip({
  label, active, onClick, testId, icon: Icon,
}: {
  label: string; active: boolean; onClick: () => void; testId: string; icon?: React.ElementType;
}) {
  return (
    <button
      onClick={onClick} data-testid={testId}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
        active
          ? "bg-primary text-white border-primary shadow-[0_0_14px_rgba(168,85,247,0.55)]"
          : "bg-white/5 text-muted-foreground border-white/10 hover:border-primary/40 hover:text-white"
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

function ToolCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[hsl(240,15%,8%)] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-11 h-11 rounded-xl bg-white/5" />
        <Skeleton className="w-20 h-5 rounded-full bg-white/5" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="w-32 h-5 rounded bg-white/5" />
        <Skeleton className="w-20 h-4 rounded bg-white/5" />
      </div>
      <Skeleton className="w-full h-14 rounded bg-white/5" />
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <Skeleton className="w-12 h-4 rounded bg-white/5" />
        <Skeleton className="w-16 h-7 rounded bg-white/5" />
      </div>
    </div>
  );
}

function ToolCard({ tool, idx }: { tool: Tool; idx: number }) {
  const { t } = useLanguage();
  const pricing = tool.pricing as Pricing;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, delay: Math.min(idx * 0.04, 0.3) }}
      data-testid={`tool-card-${tool.id}`}
      className="group"
    >
      <Card className="h-full flex flex-col bg-[hsl(240,15%,8%)] border-white/8 hover:border-primary/40 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${tool.accentColor}, transparent)` }}
        />

        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-display font-bold text-white border border-white/10 group-hover:scale-110 transition-transform"
              style={{ background: `radial-gradient(circle at 30% 30%, ${tool.accentColor}, hsl(240,15%,12%))` }}
            >
              {tool.name[0]}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {tool.trending && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary border border-secondary/30 bg-secondary/10 rounded-full px-2 py-0.5" data-testid={`badge-trending-${tool.id}`}>
                  <TrendingUp className="w-3 h-3" />Trending
                </span>
              )}
              <span className={`inline-flex items-center text-xs font-medium border rounded-full px-2.5 py-0.5 ${pricingColor[pricing] ?? ""}`} data-testid={`badge-pricing-${tool.id}`}>
                {tool.pricing}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-display font-bold text-white group-hover:text-primary transition-colors leading-tight mb-2">{tool.name}</h3>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground px-2 py-0 h-5">{tool.domain}</Badge>
              {tool.outputTypes.map((ot) => (
                <Badge key={ot} variant="outline" className="text-xs border-white/10 text-muted-foreground/70 px-2 py-0 h-5">{ot}</Badge>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 px-5 pb-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
          <TranslateToggle text={tool.description} className="mt-2" testId={`btn-translate-tool-${tool.id}`} />
          {tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tool.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[11px] text-muted-foreground/60 bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5">{tag}</span>
              ))}
            </div>
          )}
        </CardContent>

        {tool.verified && (
          <div className="mx-5 mb-3 flex items-center gap-1.5 py-2 px-3 rounded-lg bg-primary/8 border border-primary/20" data-testid={`badge-verified-${tool.id}`}>
            <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-xs text-primary font-medium">{t("tools.verified")}</span>
          </div>
        )}

        <CardFooter className="px-5 pt-3 pb-5 border-t border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                <span className="font-semibold">{tool.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground/60">{tool.users} users</span>
            </div>
            <Button size="sm" asChild className="h-8 px-3 text-xs bg-white/8 text-white hover:bg-primary hover:text-white border border-white/10 hover:border-primary transition-all group/btn" data-testid={`btn-visit-${tool.id}`}>
              <a href={tool.url} target="_blank" rel="noopener noreferrer">
                {t("tools.visit")}
                <ExternalLink className="w-3 h-3 ml-1.5 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </a>
            </Button>
          </div>
          <div className="w-full pt-2 border-t border-white/5">
            <ToolSocialBar toolId={tool.id} toolName={tool.name} />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default function Tools() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState<Domain | "All">("All");
  const [pricing, setPricing] = useState<Pricing | "All">("All");
  const [type, setType] = useState<ToolType | "All">("All");
  const [sort, setSort] = useState<SortOption>("Most Popular");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, refetch } = useListTools(
    {
      search: search || undefined,
      domain: domain !== "All" ? domain : undefined,
      pricing: pricing !== "All" ? pricing : undefined,
      type: type !== "All" ? type : undefined,
    },
    { query: { queryKey: ["listTools", search, domain, pricing, type] } },
  );

  const tools = useMemo(() => {
    const list = data?.tools ?? [];
    if (sort === "Top Rated") return [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "Most Popular") return [...list].sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
    if (sort === "A–Z") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [data, sort]);

  const activeFilterCount = [domain !== "All", pricing !== "All", type !== "All"].filter(Boolean).length;

  const clearAll = () => { setSearch(""); setDomain("All"); setPricing("All"); setType("All"); setSort("Most Popular"); };

  const domainLabel = (value: Domain | "All") => {
    const map: Record<Domain | "All", string> = {
      "All": t("filter.all"), "LLMs": "LLMs", "Code AI": t("domain.codeAI"),
      "Image Gen": t("domain.imageGen"), "Voice AI": t("domain.voiceAI"),
      "Agents": t("domain.agents"), "Marketing": t("domain.marketing"),
      "Design": t("domain.design"), "Analytics": "Analytics", "Productivity": "Productivity",
    };
    return map[value] ?? value;
  };

  const sortLabels: Record<SortOption, string> = {
    "Most Popular": t("sort.mostPopular"),
    "Top Rated": t("sort.topRated"),
    "A–Z": t("sort.az"),
  };

  const pricingOptions: { label: string; value: Pricing | "All" }[] = [
    { label: t("filter.allPricing"), value: "All" },
    { label: t("filter.free"), value: "Free" },
    { label: t("filter.freemium"), value: "Freemium" },
    { label: t("filter.premium"), value: "Premium" },
  ];

  const typeOptions: { label: string; value: ToolType | "All" }[] = [
    { label: t("filter.allTypes"), value: "All" },
    { label: t("filter.text"), value: "Text" },
    { label: t("filter.image"), value: "Image" },
    { label: t("filter.audio"), value: "Audio" },
    { label: t("filter.code"), value: "Code" },
    { label: t("filter.video"), value: "Video" },
  ];

  const sortOptions: SortOption[] = ["Most Popular", "Top Rated", "A–Z"];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="fixed top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="container mx-auto px-4">

        {/* PAGE HEADER */}
        <div className="mb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium mb-4">
              <Zap className="w-3 h-3" />
              {isLoading ? "Loading…" : `${data?.total ?? 0} tools indexed & growing daily`}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 [text-shadow:0_0_30px_rgba(168,85,247,0.2)]">
              {t("tools.title")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">{t("tools.subtitle")}</p>
          </motion.div>
        </div>

        {/* SEARCH + SORT ROW */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Try: 'I want to make a video for my shop' or search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-11 pe-10 h-11 bg-white/5 border-white/10 focus:border-primary focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] placeholder:text-muted-foreground/50 transition-all"
              data-testid="input-search-tools"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white" data-testid="btn-clear-search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters((v) => !v)}
            className={`h-11 px-4 border-white/10 gap-2 transition-all ${showFilters ? "bg-primary/10 border-primary/40 text-primary" : "text-white hover:border-white/30"}`}
            data-testid="btn-toggle-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t("tools.filtersBtn")}
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">{activeFilterCount}</span>
            )}
          </Button>

          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-1 h-11">
            {sortOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSort(opt)}
                data-testid={`sort-${opt.toLowerCase().replace(/[\s–]+/g, "-")}`}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${sort === opt ? "bg-primary text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]" : "text-muted-foreground hover:text-white"}`}
              >
                {sortLabels[opt]}
              </button>
            ))}
          </div>
        </div>

        {/* EXPANDED FILTERS PANEL */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }} className="overflow-hidden"
            >
              <div className="mb-5 p-5 rounded-2xl bg-white/[0.03] border border-white/8">
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-medium">{t("nav.tools")}</p>
                    <div className="flex flex-wrap gap-2">
                      {DOMAIN_FILTER_VALUES.map(({ value, icon }) => (
                        <FilterChip key={value} label={domainLabel(value)} active={domain === value}
                          onClick={() => setDomain(value as Domain | "All")}
                          testId={`filter-domain-${value.replace(/\s+/g, "-").toLowerCase()}`} icon={icon}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-medium">{t("filter.allPricing")}</p>
                    <div className="flex flex-wrap gap-2">
                      {pricingOptions.map(({ label, value }) => (
                        <FilterChip key={value} label={label} active={pricing === value}
                          onClick={() => setPricing(value as Pricing | "All")}
                          testId={`filter-pricing-${value.replace(/\s+/g, "-").toLowerCase()}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-medium">{t("filter.allTypes")}</p>
                    <div className="flex flex-wrap gap-2">
                      {typeOptions.map(({ label, value }) => (
                        <FilterChip key={value} label={label} active={type === value}
                          onClick={() => setType(value as ToolType | "All")}
                          testId={`filter-type-${value.replace(/\s+/g, "-").toLowerCase()}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QUICK FILTER CHIPS */}
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          {DOMAIN_FILTER_VALUES.map(({ value, icon }) => (
            <FilterChip key={value} label={domainLabel(value)} active={domain === value}
              onClick={() => setDomain(value as Domain | "All")}
              testId={`quick-filter-${value.replace(/\s+/g, "-").toLowerCase()}`} icon={icon}
            />
          ))}
          <div className="w-px h-5 bg-white/10 mx-1" />
          <FilterChip label={t("filter.free")} active={pricing === "Free"} onClick={() => setPricing((p) => (p === "Free" ? "All" : "Free"))} testId="quick-filter-free" />
          <FilterChip label={t("filter.premium")} active={pricing === "Premium"} onClick={() => setPricing((p) => (p === "Premium" ? "All" : "Premium"))} testId="quick-filter-premium" />
          <div className="w-px h-5 bg-white/10 mx-1" />
          <FilterChip label={t("filter.text")} active={type === "Text"} onClick={() => setType((tp) => (tp === "Text" ? "All" : "Text"))} testId="quick-filter-text" />
          <FilterChip label={t("filter.image")} active={type === "Image"} onClick={() => setType((tp) => (tp === "Image" ? "All" : "Image"))} testId="quick-filter-image" />
          <FilterChip label={t("filter.audio")} active={type === "Audio"} onClick={() => setType((tp) => (tp === "Audio" ? "All" : "Audio"))} testId="quick-filter-audio" />
          <FilterChip label={t("filter.code")} active={type === "Code"} onClick={() => setType((tp) => (tp === "Code" ? "All" : "Code"))} testId="quick-filter-code" />
          {(activeFilterCount > 0 || search) && (
            <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white ms-2 underline underline-offset-2" data-testid="btn-clear-all-filters">
              <X className="w-3 h-3" /> {t("tools.clearAll")}
            </button>
          )}
        </div>

        {/* SEMANTIC INTENT BANNER */}
        <AnimatePresence>
          {data?.intentSummary && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
              data-testid="banner-intent-summary"
            >
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary/15 to-cyan-500/10 border border-primary/30 text-sm text-white">
                <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{data.intentSummary}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS COUNT */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground" data-testid="results-count">
            {isLoading ? (
              <span className="inline-block w-32 h-4 rounded bg-white/5 animate-pulse" />
            ) : (
              <>{t("tools.showing")} <span className="text-white font-semibold">{tools.length}</span> {t("tools.of")}{" "}
                <span className="text-white font-semibold">{data?.total ?? 0}</span> {t("tools.toolsWord")}</>
            )}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BarChart2 className="w-3.5 h-3.5 text-primary" />
            {t("tools.updatedDaily")}
          </div>
        </div>

        {/* ERROR STATE */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="tools-error-state">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <p className="text-white font-semibold mb-2">Failed to load tools</p>
            <p className="text-muted-foreground mb-5 text-sm">There was a problem connecting to the server.</p>
            <Button onClick={() => refetch()} data-testid="btn-retry">{t("common.retry")}</Button>
          </div>
        )}

        {/* TOOL GRID */}
        {!isError && (
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" data-testid="tools-skeleton-grid">
                {Array.from({ length: 8 }).map((_, i) => <ToolCardSkeleton key={i} />)}
              </div>
            ) : tools.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {tools.map((tool, idx) => <ToolCard key={tool.id} tool={tool} idx={idx} />)}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-28 text-center" data-testid="empty-tools-state">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <Search className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">{t("tools.emptyTitle")}</h3>
                <p className="text-muted-foreground max-w-sm mb-6">{t("tools.emptyText")}</p>
                <Button onClick={clearAll} className="gap-2" data-testid="btn-clear-filters">
                  {t("tools.clearAll")} <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* SUBMIT CTA */}
        {!isLoading && !isError && tools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 p-[1px] rounded-2xl bg-gradient-to-r from-primary/40 via-secondary/30 to-primary/10"
          >
            <div className="bg-[hsl(240,15%,7%)] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">{t("tools.submitTitle")}</h3>
                <p className="text-muted-foreground">{t("tools.submitText")}</p>
              </div>
              <Button size="lg" className="whitespace-nowrap rounded-full bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all" data-testid="btn-submit-tool">
                {t("tools.submitBtn")}<ChevronRight className="ms-2 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
