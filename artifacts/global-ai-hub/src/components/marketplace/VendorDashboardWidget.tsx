import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { UploadCloud, DollarSign, Wallet, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface VendorStats {
  totalSalesUsd: number;
  uploadsCount: number;
  walletBalanceUsd: number;
  salesHistory: { label: string; amountUsd: number }[];
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-primary/30 bg-[hsl(240,15%,10%)] px-3 py-2 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      <p className="text-white font-display font-bold text-sm">${payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
}

export default function VendorDashboardWidget() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["vendorDashboardStats"],
    queryFn: () => apiFetch("/marketplace/vendor-stats") as Promise<VendorStats>,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <Card className="bg-[hsl(240,15%,8%)] border-white/8" data-testid="card-vendor-dashboard-locked">
        <CardHeader className="pb-2 flex-row items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-primary" />
          <span className="text-white text-sm font-display font-bold">Vendor Dashboard</span>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sign in to view your vendor stats and upload listings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="bg-[hsl(240,15%,8%)] border-primary/20 shadow-[0_0_25px_rgba(168,85,247,0.1)] relative overflow-hidden"
      data-testid="card-vendor-dashboard"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <CardHeader className="pb-2 flex-row items-center gap-2">
        <LayoutDashboard className="w-4 h-4 text-primary" />
        <span className="text-white text-sm font-display font-bold">Vendor Dashboard Info</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <DollarSign className="w-3 h-3 text-emerald-400" /> Total Sales
            </div>
            <p className="text-lg font-display font-bold text-white" data-testid="text-vendor-total-sales">
              {isLoading ? "…" : `$${data?.totalSalesUsd.toLocaleString()}`}
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <Wallet className="w-3 h-3 text-cyan-300" /> Wallet Balance
            </div>
            <p className="text-lg font-display font-bold text-white" data-testid="text-vendor-wallet-balance">
              {isLoading ? "…" : `$${data?.walletBalanceUsd.toFixed(2)}`}
            </p>
          </div>
        </div>

        <div className="h-28 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.salesHistory ?? []} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="vendorSalesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(270,90%,65%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(270,90%,65%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(240,10%,60%)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="amountUsd" stroke="hsl(270,90%,65%)" strokeWidth={2} fill="url(#vendorSalesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 border-white/10 hover:border-primary/40 hover:text-primary"
          onClick={() => toast({ title: "Upload Tool", description: "Vendor upload flow coming soon — your listing draft has been saved." })}
          data-testid="btn-vendor-upload-tool"
        >
          <UploadCloud className="w-4 h-4" /> Upload Tool ({isLoading ? "…" : data?.uploadsCount} live)
        </Button>
      </CardContent>
    </Card>
  );
}
