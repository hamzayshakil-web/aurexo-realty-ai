import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LeadStatusBadge } from "@/components/common/StatusBadge";
import { DUMMY_LEADS } from "@/lib/dummy-data";

function formatBudget(amount: number) {
  if (amount >= 1_000_000) return `AED ${(amount / 1_000_000).toFixed(1)}M`;
  return `AED ${(amount / 1_000).toFixed(0)}K`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function RecentLeads() {
  const leads = DUMMY_LEADS.slice(0, 5);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">Recent Leads</CardTitle>
        <Link href="/leads">
          <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-600 hover:text-amber-700 px-2">
            View all
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="divide-y divide-border/50">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors group"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-semibold dark:bg-amber-950/50 dark:text-amber-400">
                  {getInitials(lead.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-amber-600 transition-colors">
                  {lead.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {lead.interestedIn} · {lead.location}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <LeadStatusBadge status={lead.status} />
                <span className="text-xs font-semibold text-amber-600">{formatBudget(lead.budget)}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
