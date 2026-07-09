import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, MapPin, Briefcase, Wifi, DollarSign, X, Plus,
  Building2, ChevronRight, AlertCircle, CheckCircle2, Send, MessageCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useListJobs, usePostJob, useApplyToJob } from "@workspace/api-client-react";
import type { Job } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { openVendorConversation } from "@/components/social/MessagingOverlay";
import ToolSocialBar from "@/components/tools/ToolSocialBar";

const JOB_CATEGORIES = ["Engineering", "Data & ML", "Design", "Product", "Marketing", "Support"] as const;
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance"] as const;

function FilterChip({
  label, active, onClick, testId,
}: {
  label: string; active: boolean; onClick: () => void; testId: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
        active
          ? "bg-primary text-white border-primary shadow-[0_0_14px_rgba(168,85,247,0.55)]"
          : "bg-white/5 text-muted-foreground border-white/10 hover:border-primary/40 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function JobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[hsl(240,15%,8%)] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-11 h-11 rounded-xl bg-white/5" />
        <Skeleton className="w-20 h-5 rounded-full bg-white/5" />
      </div>
      <Skeleton className="w-40 h-5 rounded bg-white/5" />
      <Skeleton className="w-full h-14 rounded bg-white/5" />
      <Skeleton className="w-24 h-8 rounded bg-white/5" />
    </div>
  );
}

function JobCard({ job, idx, onApply, onMessage }: { job: Job; idx: number; onApply: (job: Job) => void; onMessage: (job: Job) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, delay: Math.min(idx * 0.04, 0.3) }}
      data-testid={`job-card-${job.id}`}
      className="group"
    >
      <Card className="h-full flex flex-col bg-[hsl(240,15%,8%)] border-white/8 hover:border-primary/40 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${job.accentColor}, transparent)` }}
        />
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-display font-bold text-white border border-white/10 group-hover:scale-110 transition-transform"
              style={{ background: `radial-gradient(circle at 30% 30%, ${job.accentColor}, hsl(240,15%,12%))` }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground px-2.5 py-0.5">
              {job.type}
            </Badge>
          </div>
          <h3 className="text-lg font-display font-bold text-white group-hover:text-primary transition-colors leading-tight mb-1">
            {job.title}
          </h3>
          <p className="text-sm text-muted-foreground">{job.company}</p>
        </CardHeader>

        <CardContent className="flex-1 px-5 pb-3">
          <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground/80">
            <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
            {job.remote && <span className="inline-flex items-center gap-1 text-cyan-400"><Wifi className="w-3.5 h-3.5" />Remote</span>}
            <span className="inline-flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{job.salaryRange}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{job.description}</p>
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[11px] text-muted-foreground/60 bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5">{tag}</span>
              ))}
            </div>
          )}
        </CardContent>

        <div className="px-5 pb-3 pt-1 border-t border-white/5">
          <ToolSocialBar toolId={`job-${job.id}`} toolName={job.title} size="sm" />
        </div>

        <CardFooter className="px-5 pt-0 pb-5 flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs border-primary/20 text-primary/80 bg-primary/5">{job.category}</Badge>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMessage(job)}
              className="h-8 px-3 text-xs border-white/10 text-muted-foreground hover:border-secondary hover:text-secondary transition-all gap-1.5"
              data-testid={`btn-message-vendor-${job.id}`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> Message
            </Button>
            <Button
              size="sm"
              onClick={() => onApply(job)}
              className="h-8 px-4 text-xs bg-white/8 text-white hover:bg-primary hover:text-white border border-white/10 hover:border-primary transition-all"
              data-testid={`btn-apply-${job.id}`}
            >
              Apply
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function PostJobDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const postJob = usePostJob();
  const [form, setForm] = useState({
    title: "", company: "", category: JOB_CATEGORIES[0] as string, type: JOB_TYPES[0] as string,
    location: "", remote: false, salaryRange: "", description: "", tags: "",
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const reset = () => setForm({
    title: "", company: "", category: JOB_CATEGORIES[0], type: JOB_TYPES[0],
    location: "", remote: false, salaryRange: "", description: "", tags: "",
  });

  const handleSubmit = () => {
    if (!form.title || !form.company || !form.location || !form.salaryRange || form.description.length < 10) {
      toast({ title: "Missing information", description: "Please fill out all required fields (description needs 10+ characters).", variant: "destructive" });
      return;
    }
    postJob.mutate(
      {
        data: {
          title: form.title,
          company: form.company,
          category: form.category,
          type: form.type as (typeof JOB_TYPES)[number],
          location: form.location,
          remote: form.remote,
          salaryRange: form.salaryRange,
          description: form.description,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Job posted!", description: `${form.title} is now live on the board.` });
          queryClient.invalidateQueries({ queryKey: ["listJobs"] });
          reset();
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: "Failed to post job", description: "Please try again.", variant: "destructive" });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[hsl(240,15%,8%)] border-white/10" data-testid="dialog-post-job">
        <DialogHeader>
          <DialogTitle className="text-white font-display">Post a Job</DialogTitle>
          <DialogDescription>Reach thousands of AI professionals. Your listing goes live instantly.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
          <Input placeholder="Job title *" value={form.title} onChange={(e) => update("title", e.target.value)} className="bg-white/5 border-white/10" data-testid="input-job-title" />
          <Input placeholder="Company *" value={form.company} onChange={(e) => update("company", e.target.value)} className="bg-white/5 border-white/10" data-testid="input-job-company" />
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-job-category"><SelectValue /></SelectTrigger>
              <SelectContent>{JOB_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.type} onValueChange={(v) => update("type", v)}>
              <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-job-type"><SelectValue /></SelectTrigger>
              <SelectContent>{JOB_TYPES.map((tType) => <SelectItem key={tType} value={tType}>{tType}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Input placeholder="Location * (e.g. Remote, NYC)" value={form.location} onChange={(e) => update("location", e.target.value)} className="bg-white/5 border-white/10" data-testid="input-job-location" />
          <Input placeholder="Salary range * (e.g. $120K – $160K)" value={form.salaryRange} onChange={(e) => update("salaryRange", e.target.value)} className="bg-white/5 border-white/10" data-testid="input-job-salary" />
          <Input placeholder="Tags, comma separated (e.g. PyTorch, LLMs)" value={form.tags} onChange={(e) => update("tags", e.target.value)} className="bg-white/5 border-white/10" data-testid="input-job-tags" />
          <Textarea placeholder="Job description *" value={form.description} onChange={(e) => update("description", e.target.value)} className="bg-white/5 border-white/10 min-h-24" data-testid="input-job-description" />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={form.remote} onChange={(e) => update("remote", e.target.checked)} className="accent-primary" data-testid="checkbox-job-remote" />
            Remote-friendly role
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10">Cancel</Button>
          <Button onClick={handleSubmit} disabled={postJob.isPending} className="bg-primary hover:bg-primary/90" data-testid="btn-submit-job">
            {postJob.isPending ? "Posting…" : "Post Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApplyDialog({ job, onOpenChange }: { job: Job | null; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const applyToJob = useApplyToJob();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reset = () => { setName(""); setEmail(""); setMessage(""); setSubmitted(false); };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleSubmit = () => {
    if (!job || !name || !email) {
      toast({ title: "Missing information", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    applyToJob.mutate(
      { id: job.id, data: { name, email, message } },
      {
        onSuccess: () => setSubmitted(true),
        onError: () => toast({ title: "Application failed", description: "Please try again.", variant: "destructive" }),
      },
    );
  };

  return (
    <Dialog open={!!job} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-[hsl(240,15%,8%)] border-white/10" data-testid="dialog-apply">
        {submitted ? (
          <div className="flex flex-col items-center text-center py-6" data-testid="apply-success-state">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-lg font-display font-bold text-white mb-1">Application sent!</h3>
            <p className="text-muted-foreground text-sm mb-6">{job?.company} will be in touch if it's a match.</p>
            <Button onClick={() => handleClose(false)} className="bg-primary hover:bg-primary/90">Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-white font-display">Apply to {job?.title}</DialogTitle>
              <DialogDescription>at {job?.company}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/10" data-testid="input-apply-name" />
              <Input placeholder="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-white/10" data-testid="input-apply-email" />
              <Textarea placeholder="Why you're a great fit (optional)" value={message} onChange={(e) => setMessage(e.target.value)} className="bg-white/5 border-white/10 min-h-24" data-testid="input-apply-message" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)} className="border-white/10">Cancel</Button>
              <Button onClick={handleSubmit} disabled={applyToJob.isPending} className="bg-primary hover:bg-primary/90 gap-1.5" data-testid="btn-submit-application">
                <Send className="w-3.5 h-3.5" />{applyToJob.isPending ? "Sending…" : "Submit"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Jobs() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [postOpen, setPostOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  const { data, isLoading, isError, refetch } = useListJobs(
    { search: search || undefined, category: category !== "All" ? category : undefined },
    { query: { queryKey: ["listJobs", search, category] } },
  );

  const jobs = useMemo(() => data?.jobs ?? [], [data]);
  const clearAll = () => { setSearch(""); setCategory("All"); };

  const handleMessage = (job: Job) => {
    if (!isAuthenticated) {
      toast({ title: "Sign in required", description: "Log in to message vendors about job listings.", variant: "destructive" });
      return;
    }
    openVendorConversation({ vendorName: job.company, jobId: job.id, jobTitle: job.title });
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="fixed top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium mb-4">
              <Briefcase className="w-3 h-3" />
              {isLoading ? "Loading…" : `${data?.total ?? 0} open roles`}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 [text-shadow:0_0_30px_rgba(168,85,247,0.2)]">
              AI Job Board
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">Find your next role at the frontier of artificial intelligence.</p>
          </motion.div>
          <Button
            size="lg"
            onClick={() => setPostOpen(true)}
            className="whitespace-nowrap rounded-full bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all gap-2"
            data-testid="btn-post-job"
          >
            <Plus className="w-4 h-4" />Post a Job
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, companies, skills…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-11 pe-10 h-11 bg-white/5 border-white/10 focus:border-primary focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] placeholder:text-muted-foreground/50 transition-all"
              data-testid="input-search-jobs"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white" data-testid="btn-clear-search-jobs">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 items-center">
          <FilterChip label="All" active={category === "All"} onClick={() => setCategory("All")} testId="filter-category-all" />
          {JOB_CATEGORIES.map((c) => (
            <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} testId={`filter-category-${c.replace(/[\s&]+/g, "-").toLowerCase()}`} />
          ))}
          {(category !== "All" || search) && (
            <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white ms-2 underline underline-offset-2" data-testid="btn-clear-all-job-filters">
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="jobs-error-state">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <p className="text-white font-semibold mb-2">Failed to load jobs</p>
            <p className="text-muted-foreground mb-5 text-sm">There was a problem connecting to the server.</p>
            <Button onClick={() => refetch()} data-testid="btn-retry-jobs">Retry</Button>
          </div>
        )}

        {!isError && (
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="jobs-skeleton-grid">
                {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : jobs.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map((job, idx) => <JobCard key={job.id} job={job} idx={idx} onApply={setApplyJob} onMessage={handleMessage} />)}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-28 text-center" data-testid="empty-jobs-state">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <Search className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">No jobs found</h3>
                <p className="text-muted-foreground max-w-sm mb-6">Try a different search or category, or check back soon for new listings.</p>
                <Button onClick={clearAll} className="gap-2" data-testid="btn-clear-job-filters">
                  Clear filters <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <PostJobDialog open={postOpen} onOpenChange={setPostOpen} />
      <ApplyDialog job={applyJob} onOpenChange={(v) => !v && setApplyJob(null)} />
    </div>
  );
}
