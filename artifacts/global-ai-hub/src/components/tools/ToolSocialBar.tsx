import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { useSocial } from "@/context/SocialContext";
import { useToast } from "@/hooks/use-toast";

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export default function ToolSocialBar({ toolId, toolName, size = "default" }: { toolId: string; toolName: string; size?: "default" | "sm" }) {
  const { getStats, toggleLike, addComment, share, toggleBookmark } = useSocial();
  const { toast } = useToast();
  const stats = getStats(toolId);
  const compact = size === "sm";

  const iconCls = compact ? "w-3.5 h-3.5" : "w-4 h-4";
  const textCls = compact ? "text-[11px]" : "text-xs";
  const gapCls = compact ? "gap-3" : "gap-4";

  const handleShare = () => {
    share(toolId, toolName);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/tools#${toolId}`).catch(() => {});
    }
    toast({ title: "Link copied", description: `${toolName} link copied to clipboard.` });
  };

  return (
    <div className={`flex items-center ${gapCls}`} onClick={(e) => e.stopPropagation()} data-testid={`social-bar-${toolId}`}>
      <button
        onClick={() => toggleLike(toolId, toolName)}
        className={`flex items-center gap-1 ${textCls} transition-colors ${stats.liked ? "text-pink-400" : "text-muted-foreground/70 hover:text-pink-400"}`}
        data-testid={`btn-like-${toolId}`}
        aria-pressed={stats.liked}
        aria-label="Like"
      >
        <Heart className={`${iconCls} ${stats.liked ? "fill-pink-400" : ""} transition-transform ${stats.liked ? "scale-110" : ""}`} />
        <span className="font-medium">{formatCount(stats.likes)}</span>
      </button>

      <button
        onClick={() => addComment(toolId, toolName)}
        className={`flex items-center gap-1 ${textCls} text-muted-foreground/70 hover:text-cyan-400 transition-colors`}
        data-testid={`btn-comment-${toolId}`}
        aria-label="Comment"
      >
        <MessageCircle className={iconCls} />
        <span className="font-medium">{formatCount(stats.comments)}</span>
      </button>

      <button
        onClick={handleShare}
        className={`flex items-center gap-1 ${textCls} text-muted-foreground/70 hover:text-secondary transition-colors`}
        data-testid={`btn-share-${toolId}`}
        aria-label="Share"
      >
        <Share2 className={iconCls} />
        <span className="font-medium">{formatCount(stats.shares)}</span>
      </button>

      <button
        onClick={() => toggleBookmark(toolId, toolName)}
        className={`flex items-center gap-1 ${textCls} transition-colors ms-auto ${stats.bookmarked ? "text-primary" : "text-muted-foreground/70 hover:text-primary"}`}
        data-testid={`btn-bookmark-${toolId}`}
        aria-pressed={stats.bookmarked}
        aria-label="Bookmark"
      >
        <Bookmark className={`${iconCls} ${stats.bookmarked ? "fill-primary" : ""} transition-transform ${stats.bookmarked ? "scale-110" : ""}`} />
      </button>
    </div>
  );
}
