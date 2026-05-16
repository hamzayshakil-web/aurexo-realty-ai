import type { Metadata } from "next";
import {
  Zap, CheckCircle2, Globe, Clock, WifiOff, ExternalLink, CalendarDays,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getN8nWorkflows } from "@/lib/n8n/get-workflows";
import { TestWebhookButton } from "@/components/automation/AutomationActions";

export const metadata: Metadata = { title: "Automation" };
export const dynamic = "force-dynamic";

const N8N_BASE = (process.env.N8N_BASE_URL ?? "http://localhost:5678").replace(/\/$/, "");

// Map known workflow names to their webhook path and test type
const WORKFLOW_META: Record<string, {
  description: string;
  webhook?:    string;
  testKey?:    "new-lead" | "new-appointment";
  trigger:     string;
}> = {
  "Aurexo Realty AI - New Lead Automation": {
    description: "Fires when a new lead is created. Classifies lead temperature, calls Groq AI for a summary, emails agent via Resend, logs to Sheets, sends Telegram alert.",
    webhook:  "/webhook/new-lead",
    testKey:  "new-lead",
    trigger:  "Webhook — POST /new-lead",
  },
  "Aurexo Realty AI - Appointment Automation": {
    description: "Fires when a new appointment is booked. Creates Google Calendar event, sends email confirmation via Resend, sends Telegram reminder.",
    webhook:  "/webhook/new-appointment",
    testKey:  "new-appointment",
    trigger:  "Webhook — POST /new-appointment",
  },
  "Aurexo Realty AI - Daily Report": {
    description: "Runs every morning at 9 AM. Fetches lead pipeline stats, builds a report, emails admin via Resend, sends Telegram summary.",
    trigger:  "Schedule — daily at 9 AM",
  },
};

export default async function AutomationPage() {
  const { connected, workflows, error } = await getN8nWorkflows();

  const aurexoWorkflows = workflows.filter((w) => w.name.startsWith("Aurexo Realty AI"));
  const activeCount     = aurexoWorkflows.filter((w) => w.active).length;
  const totalRuns       = 0; // n8n API v1 doesn't expose aggregate run counts cheaply

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        description="Manage your n8n-powered automation workflows"
        icon={Zap}
      />

      {/* n8n Connection Banner */}
      <div className={`rounded-xl border p-4 ${
        connected
          ? "border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/20"
          : "border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/20"
      }`}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              connected ? "bg-amber-500" : "bg-red-500"
            }`}>
              {connected ? <Globe className="h-5 w-5 text-white" /> : <WifiOff className="h-5 w-5 text-white" />}
            </div>
            <div>
              {connected ? (
                <>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    n8n Connected — Local Docker
                  </p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-400/70">
                    {N8N_BASE} · {aurexoWorkflows.length} Aurexo workflow{aurexoWorkflows.length !== 1 ? "s" : ""} found
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    n8n Disconnected
                  </p>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70">
                    {error ?? "Could not reach n8n"} · Start Docker: docker compose up -d
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className={`h-2 w-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
            <span className={`text-xs font-medium ${connected ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {connected ? "Connected" : "Offline"}
            </span>
          </div>
          {connected && (
            <a
              href={N8N_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs border border-amber-300 dark:border-amber-700 rounded-md px-3 py-1.5 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open n8n
            </a>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Aurexo Workflows",
            value: connected ? aurexoWorkflows.length.toString() : "—",
            icon: Zap,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-950/30",
          },
          {
            label: "Active",
            value: connected ? activeCount.toString() : "—",
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-950/30",
          },
          {
            label: "Total Workflows (n8n)",
            value: connected ? workflows.length.toString() : "—",
            icon: Globe,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/30",
          },
          {
            label: "Paused",
            value: connected ? (aurexoWorkflows.length - activeCount).toString() : "—",
            icon: Clock,
            color: "text-gray-500",
            bg: "bg-gray-100 dark:bg-gray-800",
          },
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

      {/* Workflow Cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Aurexo Workflows
        </h2>

        {!connected && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              n8n is offline. Start it with: <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">docker compose up -d</code>
            </CardContent>
          </Card>
        )}

        {connected && aurexoWorkflows.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center space-y-2">
              <p className="text-sm font-medium">No Aurexo workflows found in n8n</p>
              <p className="text-xs text-muted-foreground">
                Run <code className="font-mono bg-muted px-1.5 py-0.5 rounded">npm run create:n8n</code> to auto-create all workflows.
              </p>
            </CardContent>
          </Card>
        )}

        {connected && (
          <div className="space-y-3">
            {aurexoWorkflows.map((wf) => {
              const meta = WORKFLOW_META[wf.name];
              const editUrl = `${N8N_BASE}/workflow/${wf.id}`;

              return (
                <Card
                  key={wf.id}
                  className={`transition-all duration-200 ${
                    wf.active
                      ? "hover:shadow-md hover:border-amber-200 dark:hover:border-amber-900/60"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Status icon */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 border ${
                        wf.active
                          ? "bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-900/40"
                          : "bg-muted border-border"
                      }`}>
                        <Zap className={`h-5 w-5 ${wf.active ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                          <h3 className="text-sm font-semibold">{wf.name}</h3>
                          <div className="flex items-center gap-2 shrink-0">
                            {wf.active ? (
                              <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs text-green-600 font-medium">Active</span>
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] text-muted-foreground">Paused</Badge>
                            )}
                          </div>
                        </div>

                        {meta && (
                          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                            {meta.description}
                          </p>
                        )}

                        {/* Trigger */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[11px] font-medium text-muted-foreground">Trigger:</span>
                          <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400">
                            {meta?.trigger ?? "Webhook"}
                          </Badge>
                          {meta?.webhook && (
                            <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
                              {`${N8N_BASE}${meta.webhook}`}
                            </span>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Updated {new Date(wf.updatedAt).toLocaleDateString("en-GB")}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-mono text-[10px]">ID: {wf.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {meta?.testKey && wf.active && (
                          <TestWebhookButton workflow={meta.testKey} label={wf.name} />
                        )}
                        <a
                          href={editUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Edit
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* CLI setup card */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-1">Auto-create or recreate all workflows</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Run this command from your project root to create all Aurexo n8n workflows via the n8n API:
          </p>
          <code className="block font-mono text-xs bg-muted rounded-lg px-4 py-3 border">
            npm run create:n8n
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            If a workflow already exists it will be skipped. Delete it in n8n first to recreate it.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
