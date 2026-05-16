import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DUMMY_ACTIVITIES } from "@/lib/dummy-data";
import {
  UserPlus,
  RefreshCw,
  CalendarCheck,
  DollarSign,
  Zap,
  Building2,
  type LucideIcon,
} from "lucide-react";
import type { ActivityType } from "@/types";
import { cn } from "@/lib/utils";

const ACTIVITY_CONFIG: Record<ActivityType, { icon: LucideIcon; color: string; bg: string }> = {
  lead_created:       { icon: UserPlus,      color: "text-blue-600",  bg: "bg-blue-100 dark:bg-blue-900/30" },
  lead_updated:       { icon: RefreshCw,     color: "text-purple-600",bg: "bg-purple-100 dark:bg-purple-900/30" },
  appointment_booked: { icon: CalendarCheck, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  deal_closed:        { icon: DollarSign,    color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  automation_run:     { icon: Zap,           color: "text-orange-600",bg: "bg-orange-100 dark:bg-orange-900/30" },
  property_added:     { icon: Building2,     color: "text-teal-600",  bg: "bg-teal-100 dark:bg-teal-900/30" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  return `${mins}m ago`;
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative px-5">
          {/* Vertical line */}
          <div className="absolute left-[calc(1.25rem+18px)] top-0 bottom-4 w-px bg-border/60" />

          <div className="space-y-4 py-1">
            {DUMMY_ACTIVITIES.map((activity) => {
              const config = ACTIVITY_CONFIG[activity.type];
              const Icon = config.icon;
              return (
                <div key={activity.id} className="flex gap-3 relative">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-background z-10",
                      config.bg
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-medium leading-snug">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-muted-foreground/70">
                        {activity.agentName}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">·</span>
                      <span className="text-[11px] text-muted-foreground/70">
                        {timeAgo(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
