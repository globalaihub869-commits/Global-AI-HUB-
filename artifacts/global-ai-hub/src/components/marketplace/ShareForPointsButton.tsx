import { Twitter, MessageCircle, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch, useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEarnTokens } from "@/hooks/useEarnTokens";
import { Button } from "@/components/ui/button";

export default function ShareForPointsButton({ gigId, gigTitle }: { gigId: string; gigTitle: string }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const earnTokens = useEarnTokens();

  const share = useMutation({
    mutationFn: () => apiFetch(`/gigs/${gigId}/share`, { method: "POST" }),
    onSuccess: () => {
      earnTokens("share", gigTitle);
      toast({ title: "Shared! +5 Hub Points", description: "Thanks for spreading the word." });
    },
    onError: () => {
      toast({ title: "Couldn't record share", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleShare = (platform: "twitter" | "whatsapp") => {
    const text = encodeURIComponent(`Check out "${gigTitle}" on Global AI Hub Prompt Gigs!`);
    const url = encodeURIComponent(window.location.href);
    const shareUrl =
      platform === "twitter"
        ? `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        : `https://wa.me/?text=${text}%20${url}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    if (isAuthenticated) share.mutate();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap" data-testid={`share-buttons-${gigId}`}>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleShare("twitter")}
        className="h-8 px-3 text-xs border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400/60 gap-1.5"
        data-testid={`btn-share-twitter-${gigId}`}
      >
        <Twitter className="w-3.5 h-3.5" /> Twitter
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleShare("whatsapp")}
        className="h-8 px-3 text-xs border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10 hover:border-emerald-400/60 gap-1.5"
        data-testid={`btn-share-whatsapp-${gigId}`}
      >
        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
      </Button>
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary">
        <Sparkles className="w-3 h-3" /> +5 Hub Points
      </span>
    </div>
  );
}
