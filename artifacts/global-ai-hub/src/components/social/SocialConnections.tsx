import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Link2, Loader2, CheckCircle2, Youtube, Music2, Instagram, Twitter } from "lucide-react";

type PlatformId = "youtube" | "tiktok" | "instagram" | "x";

type Platform = {
  id: PlatformId;
  name: string;
  icon: React.ElementType;
  color: string;
};

const PLATFORMS: Platform[] = [
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-400" },
  { id: "tiktok", name: "TikTok", icon: Music2, color: "text-cyan-300" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-fuchsia-400" },
  { id: "x", name: "X (Twitter)", icon: Twitter, color: "text-white" },
];

function storageKey(userId: string | null) {
  return `gah-social-connections:${userId ?? "guest"}`;
}

function loadConnections(userId: string | null): PlatformId[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function SocialConnections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connected, setConnected] = useState<PlatformId[]>(() => loadConnections(user?.id ?? null));
  const [pending, setPending] = useState<PlatformId | null>(null);

  useEffect(() => {
    setConnected(loadConnections(user?.id ?? null));
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem(storageKey(user?.id ?? null), JSON.stringify(connected));
  }, [connected, user?.id]);

  const handleToggle = (platform: Platform) => {
    const isConnected = connected.includes(platform.id);
    if (isConnected) {
      setConnected((prev) => prev.filter((p) => p !== platform.id));
      toast({ title: `${platform.name} disconnected`, description: "Automated sharing to this account has been simulated as disabled." });
      return;
    }
    setPending(platform.id);
    setTimeout(() => {
      setConnected((prev) => [...prev, platform.id]);
      setPending(null);
      toast({
        title: `${platform.name} connected (simulated)`,
        description: "This is a placeholder connection. Real account linking will be available in a future update.",
      });
    }, 900);
  };

  return (
    <Card className="bg-[hsl(240,15%,8%)] border-white/8" data-testid="card-social-connections">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Link2 className="w-4 h-4 text-secondary" /> Social Media Connections
        </div>
        <p className="text-xs text-muted-foreground/60">
          Connect your accounts to enable automated sharing of AI-generated broadcasts. This is a placeholder — no real accounts are contacted yet.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const isConnected = connected.includes(platform.id);
            const isPending = pending === platform.id;
            return (
              <div
                key={platform.id}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  isConnected ? "border-primary/30 bg-primary/5" : "border-white/10 bg-white/[0.02]"
                }`}
                data-testid={`connection-row-${platform.id}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 ${platform.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{platform.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      {isConnected ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-primary" /> Connected (simulated)
                        </>
                      ) : (
                        "Not connected"
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isConnected ? "outline" : "default"}
                  onClick={() => handleToggle(platform)}
                  disabled={isPending}
                  data-testid={`btn-connect-${platform.id}`}
                  className={isConnected
                    ? "h-8 px-3 text-xs border-white/15 text-muted-foreground hover:border-red-400/50 hover:text-red-400 flex-shrink-0"
                    : "h-8 px-3 text-xs bg-primary text-white hover:bg-primary/90 shadow-[0_0_12px_rgba(168,85,247,0.35)] flex-shrink-0"}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Connecting…
                    </>
                  ) : isConnected ? (
                    "Disconnect"
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
