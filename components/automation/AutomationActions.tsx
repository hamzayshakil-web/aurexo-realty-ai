"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestButtonProps {
  workflow: "new-lead" | "new-appointment";
  label:   string;
}

export function TestWebhookButton({ workflow, label }: TestButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    setLoading(true);
    try {
      const res  = await fetch("/api/automation/test-webhook", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ workflow }),
      });
      const data = await res.json() as { ok: boolean; status?: number; error?: string; body?: string };

      if (!res.ok || !data.ok) {
        toast.error(`Test failed: ${data.error ?? `HTTP ${data.status}`}`, {
          description: data.body ? data.body.slice(0, 120) : undefined,
        });
      } else {
        toast.success(`Test webhook sent — ${label}`, {
          description: `n8n responded: HTTP ${data.status}`,
          duration: 5000,
        });
      }
    } catch (err) {
      toast.error("Network error", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 text-xs gap-1.5"
      onClick={handleTest}
      disabled={loading}
    >
      {loading ? (
        <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <Play className="h-3 w-3" />
      )}
      {loading ? "Sending…" : "Test"}
    </Button>
  );
}

export function RecreateWorkflowsButton() {
  return (
    <Button variant="outline" size="sm" className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/40">
      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
      Recreate via CLI
    </Button>
  );
}
