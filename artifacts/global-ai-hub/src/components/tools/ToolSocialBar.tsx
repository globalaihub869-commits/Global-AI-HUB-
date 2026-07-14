import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, Bookmark, X, Twitter, Facebook } from "lucide-react";
import { useSocial } from "@/context/SocialContext";
import { useToast } from "@/hooks/use-toast";
import { useEarnTokens } from "@/hooks/useEarnTokens";
import { useAuth } from "@/context/AuthContext";
import ThreadedComments from "./ThreadedComments";
import { motion, AnimatePresence } from "framer-motion";

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

// WhatsApp SVG icon (not in lucide)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.533 5.851L.057 23.986l6.304-1.654A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.5-5.2-1.373l-.372-.22-3.862 1.013 1.033-3.752-.242-.385A9.94 9.94 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
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
  const { getStats, toggleLike, share, toggleBookmark, loadStats } = useSocial();
  const { user } = useAuth();
  const { toast } = useToast();
  const earnTokens = useEarnTokens();
  const stats = getStats(toolId);
  const compact = size === "sm";
  const entityType = entityTypeProp ?? deriveEntityType(toolId);

  const [commentOpen, setCommentOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const iconCls = compact ? "w-3.5 h-3.5" : "w-4 h-4";
  const textCls = compact ? "text-[11px]" : "text-xs";
  const gapCls = compact ? "gap-3" : "gap-4";

  const toolUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/tools#${toolId}`;

  useEffect(() => {
    loadStats(toolId, entityType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId, entityType]);

  // Close share menu on outside click
  useEffect(() => {
    if (!shareMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShareMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shareMenuOpen]);

  const handleLike = () => {
    if (!user) { toast({ title: "Sign in to like", description: "Create a free account to interact." }); return; }
    const wasLiked = stats.liked;
    toggleLike(toolId, entityType, toolName);
    if (!wasLiked) earnTokens("like", toolName);
  };

  const handleCommentToggle = () => {
    setCommentOpen(v => !v);
  };

  const recordShare = () => {
    share(toolId, entityType, toolName);
    earnTokens("share", toolName);
  };

  const handleShare = async () => {
    const shareData = {
      title: toolName,
      text: `Check out ${toolName} on Global AI Hub`,
      url: toolUrl,
    };
    // Web Share API — opens native sheet (WhatsApp, iMessage, etc.) on mobile
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        recordShare();
      } catch {
        // user dismissed — no-op
      }
    } else {
      // Desktop fallback: show share links menu
      setShareMenuOpen(v => !v);
    }
  };

  const handleShareVia = (platform: "twitter" | "facebook" | "whatsapp" | "copy") => {
    const encoded = encodeURIComponent(toolUrl);
    const text = encodeURIComponent(`Check out ${toolName} on Global AI Hub`);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      whatsapp: `https://wa.me/?text=${text}%20${encoded}`,
    };
    if (platform === "copy") {
      navigator.clipboard?.writeText(toolUrl).catch(() => {});
      toast({ title: "Link copied!", description: `${toolName} link copied to clipboard.` });
    } else {
      window.open(urls[platform], "_blank", "noopener,noreferrer");
    }
    recordShare();
    setShareMenuOpen(false);
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
        {/* Like */}
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

        {/* Comments */}
        <button
          onClick={handleCommentToggle}
          className={`flex items-center gap-1 ${textCls} transition-colors ${commentOpen ? "text-cyan-400" : "text-muted-foreground/70 hover:text-cyan-400"}`}
          data-testid={`btn-comment-${toolId}`}
          aria-label="Comments"
          aria-expanded={commentOpen}
        >
          <MessageCircle className={iconCls} />
          <span className="font-medium">{formatCount(stats.comments)}</span>
        </button>

        {/* Share — Web Share API on mobile, dropdown on desktop */}
        <div className="relative" ref={shareMenuRef}>
          <button
            onClick={handleShare}
            className={`flex items-center gap-1 ${textCls} text-muted-foreground/70 hover:text-secondary transition-colors`}
            data-testid={`btn-share-${toolId}`}
            aria-label="Share"
          >
            <Share2 className={iconCls} />
            <span className="font-medium">{formatCount(stats.shares)}</span>
          </button>

          {/* Desktop share menu */}
          <AnimatePresence>
            {shareMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute bottom-full left-0 mb-2 z-50 w-44 rounded-xl border border-white/10 bg-[hsl(240,15%,8%)] shadow-2xl p-1.5"
              >
                <button
                  onClick={() => handleShareVia("whatsapp")}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-white/80 hover:bg-green-500/15 hover:text-green-400 transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-green-400" />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShareVia("twitter")}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-white/80 hover:bg-sky-500/15 hover:text-sky-400 transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  Twitter / X
                </button>
                <button
                  onClick={() => handleShareVia("facebook")}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-white/80 hover:bg-blue-500/15 hover:text-blue-400 transition-colors"
                >
                  <Facebook className="w-3.5 h-3.5 text-blue-400" />
                  Facebook
                </button>
                <div className="border-t border-white/10 my-1" />
                <button
                  onClick={() => handleShareVia("copy")}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-white/80 hover:bg-white/10 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Copy link
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bookmark */}
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

      {/* Threaded comment panel */}
      <AnimatePresence>
        {commentOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 rounded-xl border border-cyan-400/15 bg-[hsl(240,15%,5%)] p-3"
              data-testid={`comment-panel-${toolId}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-cyan-400/70 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-3 h-3" />
                  Discussion
                </span>
                <button
                  onClick={() => setCommentOpen(false)}
                  className="p-1 rounded hover:bg-white/10 text-muted-foreground/50 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <ThreadedComments
                entityId={toolId}
                entityType={entityType}
                toolName={toolName}
                toolUrl={toolUrl}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
