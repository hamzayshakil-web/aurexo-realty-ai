import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Building2,
  CalendarDays,
  DollarSign,
  Zap,
  ArrowRight,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentLeads } from "@/components/dashboard/RecentLeads";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DUMMY_STATS, DUMMY_APPOINTMENTS, DUMMY_AUTOMATIONS } from "@/lib/dummy-data";

export const metadata: Metadata = { title: "Dashboard" };

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `AED ${(amount / 1_000_000).toFixed(1)}M`;
  return `AED ${(amount / 1_000).toFixed(0)}K`;
}

export default function DashboardPage() {
  const upcomingAppointments = DUMMY_APPOINTMENTS.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  ).slice(0, 3);

  const activeAutomations = DUMMY_AUTOMATIONS.filter((a) => a.isActive).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Good morning, Sarah. Here's what's happening today."
        icon={LayoutDashboard}
      >
        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse inline-block" />
          All systems operational
        </Badge>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Leads"
          value={DUMMY_STATS.totalLeads.toString()}
          change={DUMMY_STATS.leadsGrowth}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950/30"
        />
        <StatsCard
          title="Active Properties"
          value={DUMMY_STATS.activeProperties.toString()}
          change={DUMMY_STATS.propertiesGrowth}
          icon={Building2}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 dark:bg-purple-950/30"
        />
        <StatsCard
          title="Appointments This Week"
          value={DUMMY_STATS.appointmentsThisWeek.toString()}
          change={DUMMY_STATS.appointmentsGrowth}
          changeLabel="vs last week"
          icon={CalendarDays}
          iconColor="text-green-600"
          iconBg="bg-green-50 dark:bg-green-950/30"
        />
        <StatsCard
          title="Revenue This Month"
          value={formatCurrency(DUMMY_STATS.revenueThisMonth)}
          change={DUMMY_STATS.revenueGrowth}
          icon={DollarSign}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 dark:bg-amber-950/30"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Leads — spans 2 cols */}
        <div className="lg:col-span-2">
          <RecentLeads />
        </div>

        {/* Pipeline Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { stage: "New",       count: 28, total: 248, color: "bg-blue-500" },
              { stage: "Contacted", count: 45, total: 248, color: "bg-purple-500" },
              { stage: "Qualified", count: 67, total: 248, color: "bg-yellow-500" },
              { stage: "Proposal",  count: 34, total: 248, color: "bg-orange-500" },
              { stage: "Won",       count: 52, total: 248, color: "bg-green-500" },
              { stage: "Lost",      count: 22, total: 248, color: "bg-red-400" },
            ].map((item) => (
              <div key={item.stage}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-muted-foreground">{item.stage}</span>
                  <span className="text-sm font-semibold">{item.count}</span>
                </div>
                <Progress
                  value={(item.count / item.total) * 100}
                  className="h-1.5"
                />
              </div>
            ))}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Conversion rate</span>
                <span className="text-sm font-bold text-green-600">{DUMMY_STATS.conversionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Upcoming Appointments</CardTitle>
              <Link href="/appointments">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-600 px-2">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/30">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{apt.leadName}</p>
                    <p className="text-[11px] text-muted-foreground truncate capitalize">
                      {apt.type} · {apt.date} {apt.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Automations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Active Automations</CardTitle>
              <Link href="/automation">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-600 px-2">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              {activeAutomations.map((auto) => (
                <div key={auto.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/30">
                    <Zap className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{auto.name}</p>
                    <p className="text-[11px] text-muted-foreground">{auto.runCount} runs</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
                </div>
              ))}
              <div className="pt-1 text-center">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{DUMMY_STATS.automationRuns}</span> total automation runs this month
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

