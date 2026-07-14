import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, CornerDownRight, Send, Loader2, User, ChevronDown, ChevronRight } from "lucide-react";
import { apiFetch } from "@/context/AuthContext";
import { useSocial } from "@/context/SocialContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEarnTokens } from "@/hooks/useEarnTokens";

export interface ThreadedCommentData {
  id: string;
  content: string | null;
  userId: string | null;
  userName: string | null;
  parentId: string | null;
  createdAt: string;
  replies: ThreadedCommentData[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function Avatar({ name, size = "sm" }: { name: string | null; size?: "sm" | "xs" }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const dim = size === "xs" ? "w-6 h-6 text-[9px]" : "w-7 h-7 text-[10px]";
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-purple-600/60 to-cyan-600/60 border border-white/10 flex items-center justify-center font-bold text-white/80 shrink-0`}>
      {name ? initials : <User className="w-3 h-3" />}
    </div>
  );
}

function CommentInput({
  onSubmit,
  placeholder = "Write a comment…",
  autoFocus = false,
  compact = false,
}: {
  onSubmit: (text: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      await onSubmit(text.trim());
      setText("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-start gap-2 ${compact ? "" : "mt-1"}`}>
      <textarea
        autoFocus={autoFocus}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        maxLength={500}
        className="flex-1 bg-white/5 border border-white/10 focus:border-cyan-500/40 rounded-lg px-3 py-2 text-xs text-white placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed transition-colors"
      />
      <button
        onClick={submit}
        disabled={!text.trim() || loading}
        className="mt-0.5 p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 disabled:opacity-40 transition-colors"
        aria-label="Post"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function CommentNode({
  comment,
  entityId,
  entityType,
  toolName,
  depth = 0,
}: {
  comment: ThreadedCommentData;
  entityId: string;
  entityType: string;
  toolName: string;
  depth?: number;
}) {
  const { user } = useAuth();
  const { addComment } = useSocial();
  const { toast } = useToast();
  const earnTokens = useEarnTokens();
  const [replying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = comment.replies.length > 0;
  const maxDepth = 3;

  const handleReply = async (text: string) => {
    if (!user) {
      toast({ title: "Sign in to reply", description: "Create a free account to join the discussion." });
      return;
    }
    await addComment(entityId, entityType, toolName, text, comment.id);
    earnTokens("comment", toolName);
    toast({ title: "Reply posted!", description: "+3 Hub Points earned!" });
    setReplying(false);
  };

  return (
    <div className={depth > 0 ? "border-l border-white/10 pl-3 ml-2" : ""}>
      <div className="flex items-start gap-2 group">
        <Avatar name={comment.userName} size={depth > 0 ? "xs" : "sm"} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-white/80">{comment.userName ?? "Anonymous"}</span>
            <span className="text-[10px] text-muted-foreground/50">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed mt-0.5 break-words">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1">
            {depth < maxDepth && (
              <button
                onClick={() => {
                  if (!user) {
                    toast({ title: "Sign in to reply" });
                    return;
                  }
                  setReplying(v => !v);
                }}
                className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-cyan-400 transition-colors"
              >
                <CornerDownRight className="w-3 h-3" />
                Reply
              </button>
            )}
            {hasReplies && (
              <button
                onClick={() => setShowReplies(v => !v)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-purple-400 transition-colors"
              >
                {showReplies ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          <AnimatePresence>
            {replying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <CommentInput
                  onSubmit={handleReply}
                  placeholder={`Reply to ${comment.userName ?? "comment"}…`}
                  autoFocus
                  compact
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {hasReplies && showReplies && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 flex flex-col gap-3"
          >
            {comment.replies.map(reply => (
              <CommentNode
                key={reply.id}
                comment={reply}
                entityId={entityId}
                entityType={entityType}
                toolName={toolName}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ThreadedComments({
  entityId,
  entityType,
  toolName,
  toolUrl,
}: {
  entityId: string;
  entityType: string;
  toolName: string;
  toolUrl?: string;
}) {
  const { user } = useAuth();
  const { addComment } = useSocial();
  const { toast } = useToast();
  const earnTokens = useEarnTokens();
  const [comments, setComments] = useState<ThreadedCommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch(`/interactions/comments?entityId=${encodeURIComponent(entityId)}`) as { comments: ThreadedCommentData[] };
      setComments(data.comments);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleTopLevelComment = async (text: string) => {
    if (!user) {
      toast({ title: "Sign in to comment", description: "Create a free account to join the discussion." });
      return;
    }
    await addComment(entityId, entityType, toolName, text);
    earnTokens("comment", toolName);
    toast({ title: "Comment posted!", description: "+3 Hub Points earned!" });
    await fetchComments();
  };

  // Flatten all comments for JSON-LD (SEO structured data)
  function flattenForSeo(nodes: ThreadedCommentData[]): ThreadedCommentData[] {
    return nodes.flatMap(n => [n, ...flattenForSeo(n.replies)]);
  }
  const allFlat = flattenForSeo(comments);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "name": `Discussion: ${toolName}`,
    "url": toolUrl ?? (typeof window !== "undefined" ? window.location.href : ""),
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/CommentAction",
      "userInteractionCount": allFlat.length,
    },
    "comment": allFlat.map(c => ({
      "@type": "Comment",
      "identifier": c.id,
      "author": { "@type": "Person", "name": c.userName ?? "Anonymous" },
      "text": c.content ?? "",
      "datePublished": c.createdAt,
    })),
  };

  return (
    <>
      {allFlat.length > 0 && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
      )}

      <div className="flex flex-col gap-4" data-testid={`threaded-comments-${entityId}`}>
        {/* Post a comment */}
        <div>
          {user ? (
            <CommentInput onSubmit={handleTopLevelComment} placeholder="Start the discussion… (Ctrl+Enter to post)" />
          ) : (
            <p className="text-xs text-muted-foreground/60 text-center py-2">
              <a href="/login" className="text-cyan-400 hover:underline">Sign in</a> to join the discussion
            </p>
          )}
        </div>

        {/* Comment list */}
        {loading ? (
          <div className="flex items-center justify-center py-4 text-muted-foreground/50">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-xs">Loading discussion…</span>
          </div>
        ) : error ? (
          <p className="text-xs text-red-400/70 text-center py-2">Could not load comments.</p>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-4 text-center">
            <MessageCircle className="w-6 h-6 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground/50">No comments yet — be the first!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map(comment => (
              <CommentNode
                key={comment.id}
                comment={comment}
                entityId={entityId}
                entityType={entityType}
                toolName={toolName}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
