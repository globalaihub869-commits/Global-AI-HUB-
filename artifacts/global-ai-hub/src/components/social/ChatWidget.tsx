import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessagesSquare, X, Send, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useListChatMessages, usePostChatMessage } from "@workspace/api-client-react";
import { useEarnTokens } from "@/hooks/useEarnTokens";

export default function ChatWidget() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [hasUnread, setHasUnread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const seenCount = useRef(0);

  const { data } = useListChatMessages(
    {},
    { query: { queryKey: ["listChatMessages"], refetchInterval: open ? 4000 : 15000 } },
  );
  const postMessage = usePostChatMessage();
  const earnTokens = useEarnTokens();

  const messages = data?.messages ?? [];

  useEffect(() => {
    if (messages.length > seenCount.current) {
      if (!open && seenCount.current > 0) setHasUnread(true);
      seenCount.current = messages.length;
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setHasUnread(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, messages.length]);

  if (!isAuthenticated) return null;

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || postMessage.isPending) return;
    postMessage.mutate(
      { data: { text: trimmed } },
      {
        onSuccess: () => {
          setInput("");
          queryClient.invalidateQueries({ queryKey: ["listChatMessages"] });
          earnTokens("chat_message");
        },
      },
    );
  };

  return (
    <div className="fixed bottom-6 end-24 z-[55]" data-testid="chat-widget">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 end-0 w-[340px] max-w-[calc(100vw-3rem)] rounded-2xl bg-[hsl(240,15%,9%)] border border-primary/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
            style={{ height: 440 }}
            data-testid="chat-panel"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/15 border border-primary/30">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Community Chat</p>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live — global room
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white transition-colors" data-testid="btn-close-chat">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No messages yet — say hello to the community!</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-0.5" data-testid={`chat-message-${msg.id}`}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-primary">{msg.userName}</span>
                      <span className="text-[10px] text-muted-foreground/50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-sm text-white/90 leading-snug">{msg.text}</p>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 px-3 py-3 border-t border-white/8"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Say something..."
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                data-testid="input-chat-message"
              />
              <button
                type="submit"
                disabled={!input.trim() || postMessage.isPending}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-colors flex-shrink-0"
                data-testid="btn-send-chat-message"
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
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.35)] border border-primary/30"
        style={{ background: "radial-gradient(circle at 35% 35%, rgba(168,85,247,0.9), rgba(60,0,120,0.95))" }}
        data-testid="btn-toggle-chat"
        aria-label="Community Chat"
      >
        {open ? <X className="w-5 h-5 text-white" /> : <MessagesSquare className="w-5 h-5 text-white" />}
        {hasUnread && !open && (
          <span className="absolute -top-0.5 -end-0.5 w-3.5 h-3.5 rounded-full bg-secondary border-2 border-background" />
        )}
      </motion.button>
    </div>
  );
}
