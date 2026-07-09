import { Activity, Heart, Briefcase, Compass, Send, MessagesSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useListActivity } from "@workspace/api-client-react";

const ICONS: Record<string, typeof Heart> = {
  like: Heart,
  job_posted: Briefcase,
  tool_visited: Compass,
  job_applied: Send,
  chat_joined: MessagesSquare,
};

const VERBS: Record<string, string> = {
  like: "liked",
  job_posted: "posted a new job",
  tool_visited: "visited",
  job_applied: "applied to",
  chat_joined: "joined the community chat for",
};

export default function ActivityFeed() {
  const { data } = useListActivity(
    {},
    { query: { queryKey: ["listActivity"], refetchInterval: 8000 } },
  );
  const events = data?.events ?? [];

  return (
    <Card className="bg-[hsl(240,15%,8%)] border-white/8" data-testid="card-activity-feed">
      <CardHeader className="pb-2 flex-row items-center gap-2">
        <Activity className="w-4 h-4 text-cyan-300" />
        <span className="text-muted-foreground text-sm">Network Activity</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </CardHeader>
      <CardContent className="max-h-64 overflow-y-auto flex flex-col gap-2">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No recent activity on the platform yet.</p>
        ) : (
          events.map((e) => {
            const Icon = ICONS[e.type] ?? Activity;
            return (
              <div
                key={e.id}
                data-testid={`activity-event-${e.id}`}
                className="flex items-start gap-2.5 p-2.5 rounded-lg border border-white/5 bg-white/[0.02] text-sm"
              >
                <span className="mt-0.5 w-6 h-6 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3 h-3 text-cyan-300" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground">
                    <span className="text-white font-medium">{e.actorName}</span>{" "}
                    {VERBS[e.type] ?? "did something with"}{" "}
                    <span className="text-white/90">{e.targetName}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5">{new Date(e.createdAt).toLocaleString()}</p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
