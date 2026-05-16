import type { Metadata } from "next";
import { Zap, CheckCircle2, Mail, MessageSquare, Brain, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Automation" };

const AUTOMATIONS = [
  {
    name: "New Lead — AI Analysis & Notification",
    description: "Fires every time a lead is created (dashboard or public form). Groq AI scores the lead, assigns temperature, writes a summary and follow-up suggestion, then emails you a formatted report.",
    trigger: "Event — new lead created",
    steps: ["Groq AI analysis (Llama 3.3 70B)", "Email notification via Resend", "Telegram alert (if configured)"],
    active: true,
    icon: Brain,
  },
  {
    name: "New Appointment — Notification",
    description: "Fires when an appointment is booked. Sends a formatted email with client details, date/time, and notes. Also sends a Telegram message if your Chat ID is configured.",
    trigger: "Event — appointment booked",
    steps: ["Email notification via Resend", "Telegram alert (if configured)"],
    active: true,
    icon: CalendarDays,
  },
];

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        description="AI-powered automations running directly in the app — no extra services needed"
        icon={Zap}
      />

      {/* Status banner */}
      <div className="rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50/80 dark:bg-green-950/20 p-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-green-500">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              All Automations Active
            </p>
            <p className="text-xs text-green-700/70 dark:text-green-400/70">
              Groq AI · Resend Email · Telegram — running on Vercel, always on
            </p>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Live</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Active Automations", value: "2", icon: Zap, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
          { label: "Email Notifications", value: "On", icon: Mail, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Telegram Alerts", value: "On", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.bg} shrink-0`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Automation cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Active Automations
        </h2>
        <div className="space-y-3">
          {AUTOMATIONS.map((automation) => (
            <Card key={automation.name} className="hover:shadow-md hover:border-amber-200 dark:hover:border-amber-900/60 transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 border bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-900/40">
                    <automation.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold">{automation.name}</h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {automation.description}
                    </p>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-[11px] font-medium text-muted-foreground">Trigger:</span>
                      <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400">
                        {automation.trigger}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {automation.steps.map((step) => (
                        <span key={step} className="inline-flex items-center gap-1 text-[10px] bg-muted rounded-full px-2.5 py-1 text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info card */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-1">How automations work</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All automations run directly inside the app on Vercel — no external services or Docker required.
            Lead AI analysis uses <strong>Groq (Llama 3.3 70B)</strong>, emails use <strong>Resend</strong>, and
            Telegram alerts use your Bot Token + Chat ID from Settings. To receive notifications at a different
            address, update your Notification Email in{" "}
            <a href="/settings" className="underline underline-offset-2 text-amber-600">Settings</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
