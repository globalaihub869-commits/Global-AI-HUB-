import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ArrowLeft, Building2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  useListConversations,
  useListConversationMessages,
  useStartConversation,
  useSendConversationMessage,
} from "@workspace/api-client-react";

interface PendingStart {
  vendorName: string;
  jobId?: string;
  jobTitle?: string;
}

interface MessagingContextValue {
  openWithVendor: (start: PendingStart) => void;
}

let externalOpenWithVendor: ((start: PendingStart) => void) | null = null;

export function openVendorConversation(start: PendingStart) {
  externalOpenWithVendor?.(start);
}

export default function MessagingOverlay() {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingStart, setPendingStart] = useState<PendingStart | null>(null);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    externalOpenWithVendor = (start: PendingStart) => {
      setPendingStart(start);
      setActiveId(null);
      setOpen(true);
    };
    return () => { externalOpenWithVendor = null; };
  }, []);

  const { data: convData } = useListConversations({
    query: { queryKey: ["listConversations"], enabled: isAuthenticated, refetchInterval: open ? 5000 : false },
  });
  const conversations = convData?.conversations ?? [];

  const { data: msgData } = useListConversationMessages(activeId ?? "", {
    query: { queryKey: ["listConversationMessages", activeId], enabled: !!activeId, refetchInterval: open ? 4000 : false },
  });
  const messages = msgData?.messages ?? [];

  const startConversation = useStartConversation();
  const sendMessage = useSendConversationMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isAuthenticated) return null;

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (pendingStart && !activeId) {
      startConversation.mutate(
        { data: { vendorName: pendingStart.vendorName, jobId: pendingStart.jobId, jobTitle: pendingStart.jobTitle, text: trimmed } },
        {
          onSuccess: (res) => {
            setActiveId(res.conversation.id);
            setPendingStart(null);
            setInput("");
            queryClient.invalidateQueries({ queryKey: ["listConversations"] });
          },
        },
      );
      return;
    }

    if (activeId) {
      sendMessage.mutate(
        { id: activeId, data: { text: trimmed } },
        {
          onSuccess: () => {
            setInput("");
            queryClient.invalidateQueries({ queryKey: ["listConversationMessages", activeId] });
            queryClient.invalidateQueries({ queryKey: ["listConversations"] });
          },
        },
      );
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeId);
  const isPending = startConversation.isPending || sendMessage.isPending;

  return (
    <div className="fixed bottom-6 end-[168px] z-[54]" data-testid="messaging-overlay">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 end-0 w-[340px] max-w-[calc(100vw-3rem)] rounded-2xl bg-[hsl(240,15%,9%)] border border-secondary/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
            style={{ height: 440 }}
            data-testid="messaging-panel"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-gradient-to-r from-secondary/10 to-transparent">
              <div className="flex items-center gap-2.5">
                {(activeId || pendingStart) && (
                  <button
                    onClick={() => { setActiveId(null); setPendingStart(null); }}
                    className="text-muted-foreground hover:text-white transition-colors"
                    data-testid="btn-back-to-conversations"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary/15 border border-secondary/30">
                  <MessageCircle className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {activeConversation
                      ? activeConversation.participantNames[Object.keys(activeConversation.participantNames).find((k) => k !== user?.id) ?? ""] ?? "Vendor"
                      : pendingStart ? pendingStart.vendorName : "Messages"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {activeConversation?.jobTitle ?? pendingStart?.jobTitle ?? "Direct messages"}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white transition-colors" data-testid="btn-close-messaging">
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeId || pendingStart ? (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                  {pendingStart && !activeId && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Start a conversation with <span className="text-white font-medium">{pendingStart.vendorName}</span> about {pendingStart.jobTitle ?? "this listing"}.
                    </p>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-0.5 ${msg.senderName === "You" || msg.senderId === activeConversation?.participantIds[0] ? "items-start" : "items-start"}`}
                      data-testid={`dm-message-${msg.id}`}
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-secondary">{msg.senderName}</span>
                        <span className="text-[10px] text-muted-foreground/50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-sm text-white/90 leading-snug">{msg.text}</p>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center gap-2 px-3 py-3 border-t border-white/8"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-secondary/40"
                    data-testid="input-dm-message"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isPending}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary text-white disabled:opacity-40 hover:bg-secondary/90 transition-colors flex-shrink-0"
                    data-testid="btn-send-dm-message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto px-2 py-2">
                {conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8 px-4">
                    No conversations yet. Message a vendor from the Job Board to get started.
                  </p>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors text-left"
                      data-testid={`conversation-${c.id}`}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-secondary/10 border border-secondary/20 flex-shrink-0">
                        <Building2 className="w-4 h-4 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {c.participantNames[Object.keys(c.participantNames).find((k) => k.startsWith("vendor:")) ?? ""] ?? "Vendor"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.35)] border border-secondary/30"
        style={{ background: "radial-gradient(circle at 35% 35%, rgba(34,211,238,0.9), rgba(8,80,90,0.95))" }}
        data-testid="btn-toggle-messaging"
        aria-label="Direct Messages"
      >
        {open ? <X className="w-5 h-5 text-white" /> : <MessageCircle className="w-5 h-5 text-white" />}
        {conversations.length > 0 && !open && (
          <span className="absolute -top-0.5 -end-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background" />
        )}
      </motion.button>
    </div>
  );
}

export type { PendingStart, MessagingContextValue };
