import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, X, Store, Bot, Zap, LayoutTemplate, Cpu, AlertCircle, ChevronRight, ShoppingCart,
} from "lucide-react";
import { apiFetch, useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEarnTokens } from "@/hooks/useEarnTokens";
import EscrowBadge from "@/components/marketplace/EscrowBadge";
import StarRating from "@/components/marketplace/StarRating";
import LiveActivityStream from "@/components/marketplace/LiveActivityStream";
import VendorDashboardWidget from "@/components/marketplace/VendorDashboardWidget";
import OrderModal from "@/components/gigs/OrderModal";

const CATEGORIES = ["All", "Models", "Agents", "APIs", "Templates"] as const;
const SUBCATEGORIES = ["All", "Chatbots", "Automation"] as const;

const CATEGORY_ICON: Record<string, typeof Bot> = {
  Models: Cpu,
  Agents: Bot,
  APIs: Zap,
  Templates: LayoutTemplate,
};

interface Listing {
  id: string;
  name: string;
  vendor: string;
  category: string;
  subcategory: string;
  priceUsd: number;
  rating: number;
  salesCount: number;
  description: string;
  tags: string[];
  accentColor: string;
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

function ListingSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[hsl(240,15%,8%)] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-11 h-11 rounded-xl bg-white/5" />
        <Skeleton className="w-16 h-5 rounded-full bg-white/5" />
      </div>
      <Skeleton className="w-40 h-5 rounded bg-white/5" />
      <Skeleton className="w-full h-12 rounded bg-white/5" />
      <Skeleton className="w-24 h-8 rounded bg-white/5" />
    </div>
  );
}

function ListingCard({ listing, idx, onBuy, pending }: { listing: Listing; idx: number; onBuy: (l: Listing) => void; pending: boolean }) {
  const Icon = CATEGORY_ICON[listing.category] ?? Store;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, delay: Math.min(idx * 0.04, 0.3) }}
      data-testid={`listing-card-${listing.id}`}
      className="group"
    >
      <Card className="h-full flex flex-col bg-[hsl(240,15%,8%)] border-white/8 hover:border-primary/40 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${listing.accentColor}, transparent)` }}
        />
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-display font-bold text-white border border-white/10 group-hover:scale-110 transition-transform"
              style={{ background: `radial-gradient(circle at 30% 30%, ${listing.accentColor}, hsl(240,15%,12%))` }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground px-2.5 py-0.5">{listing.category}</Badge>
          </div>
          <h3 className="text-lg font-display font-bold text-white group-hover:text-primary transition-colors leading-tight mb-1">{listing.name}</h3>
          <p className="text-sm text-muted-foreground">{listing.vendor}</p>
        </CardHeader>

        <CardContent className="flex-1 px-5 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={listing.rating} />
            <span className="text-xs text-muted-foreground">{listing.rating} · {listing.salesCount.toLocaleString()} sales</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{listing.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {listing.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[11px] text-muted-foreground/60 bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5">{tag}</span>
            ))}
          </div>
        </CardContent>

        <CardFooter className="px-5 pt-3 pb-5 border-t border-white/5 flex items-center justify-between gap-2">
          <span className="text-white font-display font-bold text-lg">${listing.priceUsd}</span>
          <Button
            size="sm"
            onClick={() => onBuy(listing)}
            disabled={pending}
            className="h-8 px-4 text-xs bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(168,85,247,0.3)] gap-1.5"
            data-testid={`btn-buy-${listing.id}`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> {pending ? "Processing…" : "Buy Now"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default function Marketplace() {
  const { isAuthenticated, user, setUser } = useAuth();
  const { toast } = useToast();
  const earnTokens = useEarnTokens();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [subcategory, setSubcategory] = useState<string>("All");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const walletBalance: number = user?.walletBalanceUsd ?? 0;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["marketplaceListings", search, category, subcategory],
    queryFn: () =>
      apiFetch(
        `/marketplace/listings?${new URLSearchParams({
          ...(search ? { search } : {}),
          ...(category !== "All" ? { category } : {}),
          ...(subcategory !== "All" ? { subcategory } : {}),
        }).toString()}`,
      ) as Promise<{ listings: Listing[]; total: number }>,
  });

  const purchase = useMutation({
    mutationFn: (listing: Listing) => apiFetch(`/marketplace/listings/${listing.id}/purchase`, { method: "POST" }),
    onSuccess: (res: any, listing) => {
      setSelectedListing(null);
      toast({ title: "🎉 Purchase complete!", description: `${listing.name} unlocked. Funds released via Secure Escrow.` });
      if (res.user) setUser(res.user);
      earnTokens("tool_visited", listing.name);
      queryClient.invalidateQueries({ queryKey: ["marketplaceListings"] });
      queryClient.invalidateQueries({ queryKey: ["marketplaceActivity"] });
      queryClient.invalidateQueries({ queryKey: ["vendorDashboardStats"] });
    },
    onError: (err: any) => {
      setSelectedListing(null);
      if (err.code === "INSUFFICIENT_BALANCE") {
        toast({ title: "Insufficient balance", description: "Upgrade your plan to unlock full wallet access.", variant: "destructive" });
      } else if (err.status === 401) {
        toast({ title: "Sign in required", description: "Log in to purchase marketplace listings.", variant: "destructive" });
      } else {
        toast({ title: "Purchase failed", description: err.message ?? "Please try again.", variant: "destructive" });
      }
    },
  });

  const listings = useMemo(() => data?.listings ?? [], [data]);
  const clearAll = () => { setSearch(""); setCategory("All"); setSubcategory("All"); };

  const handleBuy = (listing: Listing) => {
    setSelectedListing(listing);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      {selectedListing && (
        <OrderModal
          item={{ id: selectedListing.id, title: selectedListing.name, seller: selectedListing.vendor, priceUsd: selectedListing.priceUsd }}
          walletBalance={walletBalance}
          isAuthenticated={isAuthenticated}
          isPending={purchase.isPending}
          confirmLabel="Buy Now"
          onConfirm={() => purchase.mutate(selectedListing)}
          onClose={() => setSelectedListing(null)}
        />
      )}
      <div className="fixed top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium mb-4">
              <Store className="w-3 h-3" />
              {isLoading ? "Loading…" : `${data?.total ?? 0} listings live`}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 [text-shadow:0_0_30px_rgba(168,85,247,0.2)]">
              AI Multi-Vendor Marketplace
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">Buy production-ready AI models, agents, APIs, and templates from vetted vendors.</p>
          </motion.div>
          {user && (
            <div className="text-sm text-muted-foreground">
              Trial Wallet: <span className="text-emerald-400 font-semibold">${user.walletBalanceUsd.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings, vendors, tags…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ps-11 pe-10 h-11 bg-white/5 border-white/10 focus:border-primary focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] placeholder:text-muted-foreground/50 transition-all"
                  data-testid="input-search-marketplace"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white" data-testid="btn-clear-search-marketplace">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3 items-center">
              {CATEGORIES.map((c) => (
                <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} testId={`filter-category-${c.toLowerCase()}`} />
              ))}
            </div>
            {category === "Agents" && (
              <div className="flex flex-wrap gap-2 mb-6 items-center pl-1">
                <span className="text-xs text-muted-foreground/60 mr-1">Type:</span>
                {SUBCATEGORIES.map((s) => (
                  <FilterChip key={s} label={s} active={subcategory === s} onClick={() => setSubcategory(s)} testId={`filter-subcategory-${s.toLowerCase()}`} />
                ))}
              </div>
            )}
            {(category !== "All" || subcategory !== "All" || search) && (
              <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white mb-6 underline underline-offset-2" data-testid="btn-clear-all-marketplace-filters">
                <X className="w-3 h-3" /> Clear all filters
              </button>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="marketplace-error-state">
                <AlertCircle className="w-10 h-10 text-destructive mb-4" />
                <p className="text-white font-semibold mb-2">Failed to load listings</p>
                <Button onClick={() => refetch()} data-testid="btn-retry-marketplace">Retry</Button>
              </div>
            )}

            {!isError && (
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" data-testid="marketplace-skeleton-grid">
                    {Array.from({ length: 4 }).map((_, i) => <ListingSkeleton key={i} />)}
                  </div>
                ) : listings.length > 0 ? (
                  <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {listings.map((listing, idx) => (
                      <ListingCard key={listing.id} listing={listing} idx={idx} onBuy={handleBuy} pending={purchase.isPending && purchase.variables?.id === listing.id} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-28 text-center" data-testid="empty-marketplace-state">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                      <Search className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white mb-2">No listings found</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">Try a different search or category.</p>
                    <Button onClick={clearAll} className="gap-2" data-testid="btn-clear-marketplace-filters">
                      Clear filters <ChevronRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            <div className="mt-8">
              <EscrowBadge />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <LiveActivityStream />
            <VendorDashboardWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
