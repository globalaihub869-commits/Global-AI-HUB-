import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  LifeBuoy, Send, Star, CheckCircle2, Clock, AlertCircle, Archive,
  Crown, Zap, MessageSquare, ChevronRight, Sparkles, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth, apiFetch } from "@/context/AuthContext";
import { useSupport } from "@/context/SupportContext";
import { useToast } from "@/hooks/use-toast";

interface BackendTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  issue: string;
  status: "Open" | "Pending" | "Resolved" | "Archived";
  severity: "Low" | "Medium" | "High";
  isVip: boolean;
  adminReply: string | null;
  submittedAt: number;
  lastActivityAt: number;
}

const statusConfig = {
  Open: { label: "Open", color: "text-emerald-400", dot: "bg-emerald-400", icon: Clock },
  Pending: { label: "Pending", color: "text-yellow-400", dot: "bg-yellow-400", icon: Clock },
  Resolved: { label: "Resolved", color: "text-cyan-400", dot: "bg-cyan-400", icon: CheckCircle2 },
  Archived: { label: "Archived", color: "text-muted-foreground", dot: "bg-muted-foreground/40", icon: Archive },
};

/** WhatsApp-style live status dot for a ticket. */
function StatusDot({ status }: { status: BackendTicket["status"] }) {
  const cfg = statusConfig[status];
  const isLive = status === "Open";
  return (
    <span className="relative flex h-2 w-2 flex-shrink-0" title={cfg.label}>
      {isLive && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-70`} />}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
    </span>
  );
}

/** Star rating picker. */
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
          data-testid={`star-${n}`}
        >
          <Star
            className={`w-6 h-6 transition-colors ${(hover || value) >= n ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function SupportPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { faqPreviewMatch, isClientSpamBlocked, recordClientSubmit } = useSupport();
  const { toast } = useToast();

  const isGoldMode = user?.plan === "enterprise";

  const [myTickets, setMyTickets] = useState<BackendTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const [issue, setIssue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [faqHint, setFaqHint] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  const loadMyTickets = useCallback(async () => {
    if (!isAuthenticated) return;
    setTicketsLoading(true);
    try {
      const data = await apiFetch("/support/tickets/mine");
      setMyTickets(data.tickets ?? []);
    } catch {
      // silently fail
    } finally {
      setTicketsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadMyTickets();
  }, [loadMyTickets]);

  const handleIssueChange = (val: string) => {
    setIssue(val);
    setFaqHint(faqPreviewMatch(val));
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim() || submitting) return;
    if (isClientSpamBlocked) {
      toast({ title: "Rate limit reached", description: "Please wait a few minutes before submitting another ticket.", variant: "destructive" });
      return;
    }
    const wasBlocked = recordClientSubmit();
    if (wasBlocked) {
      toast({ title: "Rate limit reached", description: "Too many tickets — please slow down.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiFetch("/support/tickets", { method: "POST", body: JSON.stringify({ issue: issue.trim() }) });
      toast({ title: `Ticket ${data.ticket.id} created`, description: isGoldMode ? "Your VIP ticket is at the top of the queue." : "Our team will follow up shortly." });
      setIssue("");
      setFaqHint(null);
      await loadMyTickets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit ticket";
      toast({ title: "Submission failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !reviewComment.trim() || reviewSubmitting) return;
    setReviewSubmitting(true);
    try {
      await apiFetch("/support/reviews", { method: "POST", body: JSON.stringify({ rating, comment: reviewComment.trim() }) });
      setReviewDone(true);
      toast({ title: "Thank you for your feedback!", description: rating >= 4 ? "Your review may appear on our landing page." : "We appreciate your honest feedback." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review";
      toast({ title: "Review failed", description: msg, variant: "destructive" });
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <LifeBuoy className="w-12 h-12 text-cyan-400/50" />
        <h1 className="text-2xl font-display font-bold text-white">Support Center</h1>
        <p className="text-muted-foreground max-w-sm">Sign in to submit tickets, track your requests, and leave feedback.</p>
        <Link href="/login">
          <button className="mt-2 px-6 py-2.5 rounded-full bg-primary text-white font-medium hover:bg-primary/80 transition-colors">
            Sign In
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {isGoldMode ? (
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-500/20 border border-yellow-400/40">
              <Crown className="w-5 h-5 text-yellow-300" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-cyan-500/15 border border-cyan-400/30">
              <LifeBuoy className="w-5 h-5 text-cyan-300" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              Support Center
              {isGoldMode && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30" data-testid="page-gold-badge">
                  <Zap className="w-3 h-3" /> EXPRESS GOLD
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isGoldMode
                ? "Enterprise VIP — your tickets go straight to the top of the queue."
                : "Submit tickets, track status, and share feedback below."}
            </p>
          </div>
        </div>

        {/* WhatsApp-style live status bar */}
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-emerald-500/8 border border-emerald-400/15 text-xs text-emerald-400 w-fit" data-testid="support-live-status-bar">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          Support team online — typically responds within {isGoldMode ? "1 hour" : "24 hours"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Submit ticket + review */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* Submit Ticket */}
          <Card className="bg-[hsl(240,15%,8%)] border-white/8" data-testid="card-submit-ticket">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="w-4 h-4 text-cyan-300" /> New Support Ticket
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="flex flex-col gap-3">
                <textarea
                  value={issue}
                  onChange={(e) => handleIssueChange(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-cyan-400/40 resize-none"
                  data-testid="input-ticket-issue"
                />

                {/* Live FAQ preview while typing */}
                <AnimatePresence>
                  {faqHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl bg-primary/8 border border-primary/20 px-3 py-2"
                      data-testid="ticket-faq-preview"
                    >
                      <p className="text-[11px] text-primary/80 flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                        <span><strong className="text-primary">Auto-FAQ:</strong> {faqHint}</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isClientSpamBlocked && (
                  <p className="text-xs text-yellow-400 flex items-center gap-1.5">⚠️ Rate limit reached — wait a few minutes.</p>
                )}

                <button
                  type="submit"
                  disabled={!issue.trim() || submitting || isClientSpamBlocked}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium text-sm text-white transition-colors disabled:opacity-40 ${isGoldMode ? "bg-yellow-500 hover:bg-yellow-400" : "bg-cyan-500 hover:bg-cyan-400"}`}
                  data-testid="btn-submit-ticket"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Submitting..." : isGoldMode ? "Submit VIP Ticket" : "Submit Ticket"}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Leave a Review */}
          <Card className="bg-[hsl(240,15%,8%)] border-white/8" data-testid="card-leave-review">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-yellow-400" /> Leave a Review
              </div>
            </CardHeader>
            <CardContent>
              {reviewDone ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center" data-testid="review-done">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <p className="text-sm text-emerald-400 font-medium">Thanks for your feedback!</p>
                  {rating >= 4 && <p className="text-xs text-muted-foreground">Your review may appear on our home page.</p>}
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">How would you rate your experience?</p>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    rows={3}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-yellow-400/30 resize-none"
                    data-testid="input-review-comment"
                  />
                  <button
                    type="submit"
                    disabled={rating === 0 || !reviewComment.trim() || reviewSubmitting}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium text-sm text-white bg-yellow-500 hover:bg-yellow-400 transition-colors disabled:opacity-40"
                    data-testid="btn-submit-review"
                  >
                    <Star className="w-4 h-4" />
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: My Tickets */}
        <div className="lg:col-span-2">
          <Card className="bg-[hsl(240,15%,8%)] border-white/8 h-full" data-testid="card-my-tickets">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LifeBuoy className="w-4 h-4 text-secondary" /> My Tickets
                </div>
                <button
                  onClick={loadMyTickets}
                  disabled={ticketsLoading}
                  className="text-muted-foreground hover:text-white transition-colors"
                  data-testid="btn-refresh-tickets"
                  aria-label="Refresh tickets"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${ticketsLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {ticketsLoading && myTickets.length === 0 ? (
                <div className="py-12 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : myTickets.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3 text-center px-4" data-testid="no-tickets-message">
                  <LifeBuoy className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground/60">No tickets yet — submit one on the left to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  <AnimatePresence initial={false}>
                    {myTickets.map((ticket) => {
                      const cfg = statusConfig[ticket.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <motion.div
                          key={ticket.id}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 hover:bg-white/[0.02] transition-colors"
                          data-testid={`ticket-row-${ticket.id}`}
                        >
                          <div className="flex items-start gap-3">
                            <StatusDot status={ticket.status} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-[11px] font-mono text-muted-foreground/60">{ticket.id}</span>
                                <Badge variant="outline" className={`text-[9px] uppercase px-1.5 py-0 ${cfg.color} border-current/20`}>
                                  <StatusIcon className="w-2.5 h-2.5 mr-0.5" />{ticket.status}
                                </Badge>
                                {ticket.isVip && (
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-yellow-300 border-yellow-400/30 bg-yellow-400/10">
                                    <Crown className="w-2.5 h-2.5 mr-0.5" /> VIP
                                  </Badge>
                                )}
                                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${ticket.severity === "High" ? "text-red-300 border-red-400/30" : ticket.severity === "Medium" ? "text-yellow-300 border-yellow-400/30" : "text-muted-foreground border-white/15"}`}>
                                  {ticket.severity}
                                </span>
                              </div>
                              <p className="text-sm text-white/90 mb-1">{ticket.issue}</p>
                              {ticket.adminReply && (
                                <div className="mt-2 pl-3 border-l-2 border-cyan-400/30">
                                  <p className="text-[11px] text-muted-foreground/60 mb-0.5">Admin reply:</p>
                                  <p className="text-xs text-cyan-200">{ticket.adminReply}</p>
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground/40">
                                <span>{new Date(ticket.submittedAt).toLocaleString()}</span>
                                {ticket.status === "Open" && (
                                  <span className="flex items-center gap-1">
                                    <span className="relative flex h-1 w-1">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                                      <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-400" />
                                    </span>
                                    Live
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
