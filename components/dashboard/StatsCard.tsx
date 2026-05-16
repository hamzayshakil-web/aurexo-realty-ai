import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  iconColor = "text-amber-600",
  iconBg = "bg-amber-50 dark:bg-amber-950/30",
}: StatsCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight truncate">{value}</p>
            <div className="flex items-center gap-1.5 mt-2">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500 shrink-0" />
              )}
              <span
                className={cn(
                  "text-xs font-semibold",
                  isPositive ? "text-green-600 dark:text-green-400" : "text-red-500"
                )}
              >
                {isPositive ? "+" : ""}
                {change}%
              </span>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 shrink-0 ml-3",
              iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
