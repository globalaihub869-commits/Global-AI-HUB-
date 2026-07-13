import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Send, X } from "lucide-react";
import { useSocial } from "@/context/SocialContext";
import { useToast } from "@/hooks/use-toast";
import { useEarnTokens } from "@/hooks/useEarnTokens";
import { useAuth } from "@/context/AuthContext";

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function deriveEntityType(entityId: string): string {
  if (entityId.startsWith("job-")) return "job";
  if (entityId.startsWith("gig-")) return "gig";
  if (entityId.startsWith("video-")) return "video";
  return "tool";
}

export default function ToolSocialBar({
  toolId,
  toolName,
  size = "default",
  entityType: entityTypeProp,
}: {
  toolId: string;
  toolName: string;
  size?: "default" | "sm";
  entityType?: string;
}) {
  const { getStats, toggleLike, addComment, share, toggleBookmark, loadStats } = useSocial();
  const { user } = useAuth();
  const { toast } = useToast();
  const earnTokens = useEarnTokens();
  const stats = getStats(toolId);
  const compact = size === "sm";
  const entityType = entityTypeProp ?? deriveEntityType(toolId);

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const iconCls = compact ? "w-3.5 h-3.5" : "w-4 h-4";
  const textCls = compact ? "text-[11px]" : "text-xs";
  const gapCls = compact ? "gap-3" : "gap-4";

  useEffect(() => {
    loadStats(toolId, entityType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId, entityType]);

  useEffect(() => {
    if (commentOpen) setTimeout(() => textareaRef.current?.focus(), 60);
  }, [commentOpen]);

  const handleLike = () => {
    if (!user) { toast({ title: "Sign in to like", description: "Create a free account to interact." }); return; }
    const wasLiked = stats.liked;
    toggleLike(toolId, entityType, toolName);
    if (!wasLiked) earnTokens("like", toolName);
  };

  const handleCommentToggle = () => {
    if (!user) { toast({ title: "Sign in to comment", description: "Create a free account to join the discussion." }); return; }
    setCommentOpen((v) => !v);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addComment(toolId, entityType, toolName, commentText);
      earnTokens("comment", toolName);
      toast({ title: "Comment posted", description: `+3 Hub Points earned!` });
      setCommentText("");
      setCommentOpen(false);
    } catch {
      toast({ title: "Could not post comment", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    share(toolId, entityType, toolName);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#${toolId}`).catch(() => {});
    }
    toast({ title: "Link copied", description: `${toolName} link copied to clipboard.` });
    earnTokens("share", toolName);
  };

  const handleBookmark = () => {
    if (!user) { toast({ title: "Sign in to bookmark" }); return; }
    const wasBookmarked = stats.bookmarked;
    toggleBookmark(toolId, entityType, toolName);
    if (!wasBookmarked) earnTokens("bookmark", toolName);
  };

  return (
    <div onClick={(e) => e.stopPropagation()} data-testid={`social-bar-${toolId}`}>
      <div className={`flex items-center ${gapCls}`}>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 ${textCls} transition-colors ${stats.liked ? "text-pink-400" : "text-muted-foreground/70 hover:text-pink-400"}`}
          data-testid={`btn-like-${toolId}`}
          aria-pressed={stats.liked}
          aria-label="Like"
        >
          <Heart className={`${iconCls} ${stats.liked ? "fill-pink-400" : ""} transition-transform ${stats.liked ? "scale-110" : ""}`} />
          <span className="font-medium">{formatCount(stats.likes)}</span>
        </button>

        <button
          onClick={handleCommentToggle}
          className={`flex items-center gap-1 ${textCls} transition-colors ${commentOpen ? "text-cyan-400" : "text-muted-foreground/70 hover:text-cyan-400"}`}
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
          onClick={handleBookmark}
          className={`flex items-center gap-1 ${textCls} transition-colors ms-auto ${stats.bookmarked ? "text-primary" : "text-muted-foreground/70 hover:text-primary"}`}
          data-testid={`btn-bookmark-${toolId}`}
          aria-pressed={stats.bookmarked}
          aria-label="Bookmark"
        >
          <Bookmark className={`${iconCls} ${stats.bookmarked ? "fill-primary" : ""} transition-transform ${stats.bookmarked ? "scale-110" : ""}`} />
        </button>
      </div>

      {commentOpen && (
        <div
          className="mt-2 rounded-lg border border-cyan-400/20 bg-[hsl(240,15%,6%)] p-2.5"
          data-testid={`comment-box-${toolId}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-2">
            <textarea
              ref={textareaRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleCommentSubmit(); }}
              placeholder="Share your thoughts… (Ctrl+Enter to post)"
              rows={2}
              maxLength={500}
              className="flex-1 bg-transparent text-xs text-white placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed"
            />
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button
                onClick={handleCommentSubmit}
                disabled={!commentText.trim() || submitting}
                className="p-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 disabled:opacity-40 transition-colors"
                aria-label="Post comment"
              >
                <Send className="w-3 h-3" />
              </button>
              <button
                onClick={() => { setCommentOpen(false); setCommentText(""); }}
                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors"
                aria-label="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/40 mt-1 text-right">{commentText.length}/500</p>
        </div>
      )}
    </div>
  );
}
