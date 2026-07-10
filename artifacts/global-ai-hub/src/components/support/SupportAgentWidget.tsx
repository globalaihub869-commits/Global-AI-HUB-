import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, X, Send, CheckCircle2, Ticket, Sparkles, Crown, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSupport } from "@/context/SupportContext";

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  kind?: "resolved" | "escalated";
}

let msgCounter = 0;
const uid = () => `support-msg-${++msgCounter}`;

const SUGGESTIONS = [
  "I forgot my password",
  "How do I bookmark a tool?",
  "What are Hub Points?",
  "The face scan step is stuck",
];

export default function SupportAgentWidget() {
  const { user } = useAuth();
  const { resolveQuery, faqPreviewMatch, isClientSpamBlocked, recordClientSubmit } = useSupport();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [faqHint, setFaqHint] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const faqDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isGoldMode = user?.plan === "enterprise";

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: uid(),
        role: "agent",
        text: isGoldMode
          ? "Hi there! You have **Express Support Gold Mode** 🌟 — your issues go straight to the top of our queue with guaranteed priority response. What can I help with?"
          : "Hi, I'm the **AI Support Agent** 🛟. I can instantly resolve common issues — password resets, bookmarks, Hub Points, account recovery, and more. Anything I can't solve gets forwarded straight to our Super Admin support desk. What's going on?",
      }]);
    }
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open, messages.length, isGoldMode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = useCallback((val: string) => {
    setInput(val);
    if (faqDebounceRef.current) clearTimeout(faqDebounceRef.current);
    faqDebounceRef.current = setTimeout(() => {
      setFaqHint(faqPreviewMatch(val));
    }, 280);
  }, [faqPreviewMatch]);

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    if (isClientSpamBlocked) {
      setMessages((prev) => [...prev, {
        id: uid(),
        role: "agent",
        text: "⏳ You've sent several requests in a short time. Please wait a few minutes before submitting another ticket — this helps us keep our support queue healthy.",
      }]);
      return;
    }

    setMessages((prev) => [...prev, { id: uid(), role: "user", text: trimmed }]);
    setInput("");
    setFaqHint(null);
    setIsThinking(true);

    setTimeout(() => {
      const userLabel = user?.email ?? "guest@globalaihub.com";
      const { resolved, reply, ticketId } = resolveQuery(trimmed, userLabel);
      if (!resolved) recordClientSubmit();
      setMessages((prev) => [...prev, {
        id: uid(),
        role: "agent",
        text: reply,
        kind: resolved ? "resolved" : "escalated",
      }]);
      setIsThinking(false);
      if (!open) setHasUnread(true);
      void ticketId;
    }, 700 + Math.random() * 400);
  }, [isThinking, isClientSpamBlocked, resolveQuery, recordClientSubmit, user, open]);

  return (
    <div className="fixed bottom-6 left-6 z-50" data-testid="support-agent-widget">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 left-0 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl bg-[hsl(240,15%,9%)] border border-cyan-400/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
            style={{ height: 500 }}
            data-testid="support-agent-panel"
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b border-white/8 ${isGoldMode ? "bg-gradient-to-r from-yellow-500/15 to-transparent" : "bg-gradient-to-r from-cyan-500/10 to-transparent"}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isGoldMode ? "bg-yellow-500/20 border-yellow-400/40" : "bg-cyan-500/15 border-cyan-400/30"}`}>
                  {isGoldMode ? <Crown className="w-4 h-4 text-yellow-300" /> : <LifeBuoy className="w-4 h-4 text-cyan-300" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                    AI Support Agent
                    {isGoldMode && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30" data-testid="badge-gold-mode">
                        <Zap className="w-2.5 h-2.5" /> GOLD
                      </span>
                    )}
                  </p>
                  {/* WhatsApp-style live status indicator */}
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1" data-testid="live-status-indicator">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                    </span>
                    {isGoldMode ? "Express Gold — priority queue" : "Online — instant responses"}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white transition-colors" data-testid="btn-close-support-agent">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gold Mode banner */}
            {isGoldMode && (
              <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-400/15 flex items-center gap-2 text-xs text-yellow-200" data-testid="gold-mode-banner">
                <Crown className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
                <span><strong className="text-yellow-300">Express Support Gold Mode</strong> — Enterprise priority. Your tickets skip the queue and reach our team first.</span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`support-message-${msg.id}`}
                >
                  <div className={`max-w-[85%] flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === "user"
                          ? isGoldMode ? "bg-yellow-500/80 text-white rounded-tr-sm" : "bg-cyan-500/90 text-white rounded-tr-sm"
                          : "bg-white/[0.05] text-muted-foreground border border-white/8 rounded-tl-sm"
                      }`}
                    >
                      {msg.text.split("**").map((part, i) =>
                        i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : <span key={i}>{part}</span>,
                      )}
                    </div>
                    {msg.kind === "resolved" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400" data-testid="badge-auto-resolved">
                        <CheckCircle2 className="w-3 h-3" /> Auto-resolved
                      </span>
                    )}
                    {msg.kind === "escalated" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-secondary" data-testid="badge-escalated">
                        <Ticket className="w-3 h-3" /> Escalated to Super Admin
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              {isThinking && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "240ms" }} />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Auto-FAQ live typing preview */}
            <AnimatePresence>
              {faqHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-2 bg-primary/8 border-t border-primary/20"
                  data-testid="faq-hint-preview"
                >
                  <p className="text-[11px] text-primary/80 flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                    <span><strong className="text-primary">Quick answer:</strong> {faqHint}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-muted-foreground hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
                    data-testid={`support-suggestion-${s.slice(0, 10)}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Anti-spam warning */}
            {isClientSpamBlocked && (
              <div className="px-4 pb-2 text-[11px] text-yellow-400 flex items-center gap-1.5" data-testid="spam-warning">
                ⚠️ Rate limit reached — please wait a few minutes.
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 px-3 py-3 border-t border-white/8"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={isGoldMode ? "Gold priority — describe your issue..." : "Describe your issue..."}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-cyan-400/40"
                data-testid="input-support-message"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-colors flex-shrink-0 ${isGoldMode ? "bg-yellow-500 hover:bg-yellow-400" : "bg-cyan-500 hover:bg-cyan-400"}`}
                data-testid="btn-send-support-message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.35)] border ${isGoldMode ? "border-yellow-400/40 shadow-[0_0_25px_rgba(234,179,8,0.4)]" : "border-cyan-400/30"}`}
        style={isGoldMode
          ? { background: "radial-gradient(circle at 35% 35%, rgba(234,179,8,0.9), rgba(90,60,8,0.95))" }
          : { background: "radial-gradient(circle at 35% 35%, rgba(34,211,238,0.9), rgba(8,80,90,0.95))" }
        }
        data-testid="btn-toggle-support-agent"
        aria-label="AI Support Agent"
      >
        {open ? <X className="w-5 h-5 text-white" /> : isGoldMode ? <Crown className="w-5 h-5 text-white" /> : <LifeBuoy className="w-5 h-5 text-white" />}
        {hasUnread && !open && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
            <Sparkles className="w-2 h-2 text-white" />
          </span>
        )}
      </motion.button>
    </div>
  );
}
