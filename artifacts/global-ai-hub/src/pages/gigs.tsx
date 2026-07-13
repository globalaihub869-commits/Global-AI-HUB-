import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, X, MessageSquareText, Image as ImageIcon, Briefcase, Code2, Clock, AlertCircle, ChevronRight, ChevronDown, ChevronUp, ShoppingCart,
} from "lucide-react";
import { apiFetch, useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEarnTokens } from "@/hooks/useEarnTokens";
import EscrowBadge from "@/components/marketplace/EscrowBadge";
import StarRating from "@/components/marketplace/StarRating";
import GigReviewRow from "@/components/marketplace/GigReviewRow";
import ShareForPointsButton from "@/components/marketplace/ShareForPointsButton";
import OrderModal from "@/components/gigs/OrderModal";
import ToolSocialBar from "@/components/tools/ToolSocialBar";

const CATEGORIES = ["All", "ChatGPT Prompts", "Midjourney/Sora", "Business", "Coding"] as const;

const CATEGORY_ICON: Record<string, typeof Briefcase> = {
  "ChatGPT Prompts": MessageSquareText,
  "Midjourney/Sora": ImageIcon,
  Business: Briefcase,
  Coding: Code2,
};

interface GigReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Gig {
  id: string;
  title: string;
  seller: string;
  category: string;
  priceUsd: number;
  deliveryDays: number;
  rating: number;
  reviewCount: number;
  description: string;
  accentColor: string;
  reviews: GigReview[];
}

function FilterChip({ label, active, onClick, testId }: { label: string; active: boolean; onClick: () => void; testId: string }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
        active
          ? "bg-primary text-white border-primary shadow-[0_0_14px_rgba(168,85,247,0.55)]"
          : "bg-white/5 text-muted-foreground border-white/10 hover:border-primary/40 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function GigSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[hsl(240,15%,8%)] p-5 flex flex-col gap-4">
      <Skeleton className="w-11 h-11 rounded-xl bg-white/5" />
      <Skeleton className="w-48 h-5 rounded bg-white/5" />
      <Skeleton className="w-full h-12 rounded bg-white/5" />
      <Skeleton className="w-24 h-8 rounded bg-white/5" />
    </div>
  );
}

function GigCard({ gig, idx, onBuy, pending }: { gig: Gig; idx: number; onBuy: (g: Gig) => void; pending: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICON[gig.category] ?? Briefcase;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, delay: Math.min(idx * 0.04, 0.3) }}
      data-testid={`gig-card-${gig.id}`}
      className="group"
    >
      <Card className="h-full flex flex-col bg-[hsl(240,15%,8%)] border-white/8 hover:border-primary/40 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${gig.accentColor}, transparent)` }}
        />
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-display font-bold text-white border border-white/10 group-hover:scale-110 transition-transform"
              style={{ background: `radial-gradient(circle at 30% 30%, ${gig.accentColor}, hsl(240,15%,12%))` }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground px-2.5 py-0.5">{gig.category}</Badge>
          </div>
          <h3 className="text-lg font-display font-bold text-white group-hover:text-primary transition-colors leading-tight mb-1">{gig.title}</h3>
          <p className="text-sm text-muted-foreground">by {gig.seller}</p>
        </CardHeader>

        <CardContent className="flex-1 px-5 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={gig.rating} />
            <span className="text-xs text-muted-foreground">{gig.rating} ({gig.reviewCount} reviews)</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">{gig.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground/80 mb-3">
            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{gig.deliveryDays}-day delivery</span>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-white transition-colors py-1.5 border-t border-white/5"
            data-testid={`btn-toggle-reviews-${gig.id}`}
          >
            <span>{expanded ? "Hide" : "Show"} {gig.reviewCount} reviews</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-2 mt-2 overflow-hidden"
              >
                {gig.reviews.map((r) => <GigReviewRow key={r.id} review={r} />)}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-4">
            <ShareForPointsButton gigId={gig.id} gigTitle={gig.title} />
            <ToolSocialBar toolId={`gig-${gig.id}`} toolName={gig.title} size="sm" entityType="gig" />
          </div>
        </CardContent>

        <CardFooter className="px-5 pt-3 pb-5 border-t border-white/5 flex items-center justify-between gap-2">
          <span className="text-white font-display font-bold text-lg">${gig.priceUsd}</span>
          <Button
            size="sm"
            onClick={() => onBuy(gig)}
            disabled={pending}
            className="h-8 px-4 text-xs bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(168,85,247,0.3)] gap-1.5"
            data-testid={`btn-order-gig-${gig.id}`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> {pending ? "Processing…" : "Order Now"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default function Gigs() {
  const { isAuthenticated, user, setUser } = useAuth();
  const { toast } = useToast();
  const earnTokens = useEarnTokens();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);

  const walletBalance: number = (user as any)?.walletBalanceUsd ?? 0;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["gigsList", search, category],
    queryFn: () =>
      apiFetch(
        `/gigs?${new URLSearchParams({ ...(search ? { search } : {}), ...(category !== "All" ? { category } : {}) }).toString()}`,
      ) as Promise<{ gigs: Gig[]; total: number }>,
  });

  const purchase = useMutation({
    mutationFn: (gig: Gig) => apiFetch(`/gigs/${gig.id}/purchase`, { method: "POST" }),
    onSuccess: (res: any, gig) => {
      setSelectedGig(null);
      toast({ title: "🎉 Order placed!", description: `${gig.title} is now in escrow — funds locked until delivery.` });
      if (res.user) setUser(res.user);
      earnTokens("tool_visited", gig.title);
      queryClient.invalidateQueries({ queryKey: ["gigsList"] });
    },
    onError: (err: any) => {
      setSelectedGig(null);
      if (err.code === "INSUFFICIENT_BALANCE") {
        toast({ title: "Insufficient balance", description: "Upgrade your plan to unlock full wallet access.", variant: "destructive" });
      } else if (err.status === 401) {
        toast({ title: "Sign in required", description: "Log in to order gigs.", variant: "destructive" });
      } else {
        toast({ title: "Order failed", description: err.message ?? "Please try again.", variant: "destructive" });
      }
    },
  });

  const gigs = useMemo(() => data?.gigs ?? [], [data]);
  const clearAll = () => { setSearch(""); setCategory("All"); };

  const handleBuy = (gig: Gig) => {
    setSelectedGig(gig);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      {selectedGig && (
        <OrderModal
          item={{ id: selectedGig.id, title: selectedGig.title, seller: selectedGig.seller, priceUsd: selectedGig.priceUsd, deliveryDays: selectedGig.deliveryDays }}
          walletBalance={walletBalance}
          isAuthenticated={isAuthenticated}
          isPending={purchase.isPending}
          confirmLabel="Place Order"
          onConfirm={() => purchase.mutate(selectedGig)}
          onClose={() => setSelectedGig(null)}
        />
      )}
      <div className="fixed top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-medium mb-4">
              <MessageSquareText className="w-3 h-3" />
              {isLoading ? "Loading…" : `${data?.total ?? 0} gigs available`}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 [text-shadow:0_0_30px_rgba(34,211,238,0.2)]">
              Prompt Gigs Hub
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">Hire top prompt engineers for ChatGPT, Midjourney/Sora, business, and coding gigs.</p>
          </motion.div>
          <EscrowBadge />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search gigs, sellers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-11 pe-10 h-11 bg-white/5 border-white/10 focus:border-secondary focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] placeholder:text-muted-foreground/50 transition-all"
              data-testid="input-search-gigs"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white" data-testid="btn-clear-search-gigs">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 items-center">
          {CATEGORIES.map((c) => (
            <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} testId={`filter-gig-category-${c.replace(/[\s/]+/g, "-").toLowerCase()}`} />
          ))}
          {(category !== "All" || search) && (
            <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white ms-2 underline underline-offset-2" data-testid="btn-clear-all-gig-filters">
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="gigs-error-state">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <p className="text-white font-semibold mb-2">Failed to load gigs</p>
            <Button onClick={() => refetch()} data-testid="btn-retry-gigs">Retry</Button>
          </div>
        )}

        {!isError && (
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="gigs-skeleton-grid">
                {Array.from({ length: 6 }).map((_, i) => <GigSkeleton key={i} />)}
              </div>
            ) : gigs.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {gigs.map((gig, idx) => (
                  <GigCard key={gig.id} gig={gig} idx={idx} onBuy={handleBuy} pending={purchase.isPending && purchase.variables?.id === gig.id} />
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-28 text-center" data-testid="empty-gigs-state">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-5">
                  <Search className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">No gigs found</h3>
                <p className="text-muted-foreground max-w-sm mb-6">Try a different search or category.</p>
                <Button onClick={clearAll} className="gap-2" data-testid="btn-clear-gig-filters">
                  Clear filters <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
