import { useQuery } from "@tanstack/react-query";
import { Radio, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiFetch } from "@/context/AuthContext";

interface MarketplaceActivityEvent {
  id: string;
  buyerName: string;
  listingName: string;
  amountUsd: number;
  createdAt: string;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export default function LiveActivityStream() {
  const { data } = useQuery({
    queryKey: ["marketplaceActivity"],
    queryFn: () => apiFetch("/marketplace/activity") as Promise<{ events: MarketplaceActivityEvent[] }>,
    refetchInterval: 6000,
  });

  const events = data?.events ?? [];

  return (
    <Card
      className="bg-[hsl(240,15%,8%)] border-cyan-400/20 shadow-[0_0_25px_rgba(34,211,238,0.1)] relative overflow-hidden"
      data-testid="card-live-activity-stream"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
      <CardHeader className="pb-2 flex-row items-center gap-2">
        <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
        <span className="text-white text-sm font-display font-bold">Live Activity Stream</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </CardHeader>
      <CardContent className="max-h-80 overflow-y-auto flex flex-col gap-2">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Waiting for the next purchase…</p>
        ) : (
          events.map((e) => (
            <div
              key={e.id}
              data-testid={`marketplace-activity-${e.id}`}
              className="flex items-start gap-2.5 p-2.5 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03] text-sm"
            >
              <span className="mt-0.5 w-6 h-6 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-3 h-3 text-cyan-300" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground leading-snug">
                  <span className="text-white font-medium">{e.buyerName}</span> just purchased{" "}
                  <span className="text-cyan-300 font-medium">{e.listingName}</span>!
                </p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                  ${e.amountUsd.toFixed(2)} · {timeAgo(e.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
