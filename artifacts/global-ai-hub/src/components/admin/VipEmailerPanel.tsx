import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Crown, RefreshCw, Send, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiFetch } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface VipEmail {
  id: string;
  to: string;
  name: string;
  subject: string;
  plan: string;
  sentAt: string;
  status: "sent" | "queued" | "failed";
  preview: string;
}

const STATUS_CONFIG = {
  sent: { label: "Sent", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  queued: { label: "Queued", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  failed: { label: "Failed", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

export default function VipEmailerPanel() {
  const [emails, setEmails] = useState<VipEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchEmails() {
    try {
      const json = await apiFetch("/vip/emails") as { emails: VipEmail[] };
      setEmails(json.emails);
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 10000);
    return () => clearInterval(interval);
  }, []);

  async function handleSendDemo() {
    setSending(true);
    try {
      await apiFetch("/vip/send", {
        method: "POST",
        body: JSON.stringify({
          userId: `demo-${Date.now()}`,
          name: "Demo Enterprise User",
          email: `vip-${Date.now()}@gah.demo`,
          plan: "enterprise",
        }),
      });
      await fetchEmails();
      toast({ title: "⭐ VIP Welcome Email sent", description: "Demo VIP email logged successfully." });
    } catch {
      toast({ title: "Send failed", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="border-yellow-500/20 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center border border-yellow-500/20">
              <Mail className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
                VIP Welcome Emailer
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-yellow-400 border border-yellow-400/30 rounded-full px-1.5 py-0.5">
                  <Crown className="w-2.5 h-2.5" /> Enterprise
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">{emails.length} VIP welcome emails dispatched</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEmails}
              className="p-1.5 rounded-lg border border-border text-muted-foreground/60 hover:text-muted-foreground hover:border-border transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSendDemo}
              disabled={sending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/25 disabled:opacity-50 transition-all"
            >
              {sending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              {sending ? "Sending…" : "Send Demo VIP Email"}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading VIP emails…</span>
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No VIP welcome emails sent yet.</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Auto-triggered when users upgrade to Enterprise plan. Click "Send Demo VIP Email" to test.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {emails.map((email) => {
                const cfg = STATUS_CONFIG[email.status];
                const SIcon = cfg.icon;
                const isOpen = expanded === email.id;
                return (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border cursor-pointer transition-all ${cfg.bg} ${isOpen ? "ring-1 ring-yellow-400/20" : ""}`}
                    onClick={() => setExpanded(isOpen ? null : email.id)}
                  >
                    <div className="flex items-start gap-3 p-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <SIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground truncate">{email.name}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-yellow-400/70 border border-yellow-400/20 rounded-full px-1.5 py-0.5 capitalize">
                            {email.plan}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{email.to}</p>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 pt-2 border-t border-border/60 space-y-1.5">
                                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wide">Subject</p>
                                <p className="text-xs text-foreground">{email.subject}</p>
                                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wide mt-1.5">Preview</p>
                                <p className="text-xs text-muted-foreground italic">{email.preview}</p>
                                <p className="text-[10px] text-muted-foreground/40 mt-1.5">
                                  {new Date(email.sentAt).toLocaleString()} · ID: {email.id}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <span className="text-[10px] text-muted-foreground/50 flex-shrink-0 mt-0.5">
                        {new Date(email.sentAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
