/**
 * lib/n8n/get-workflows.ts
 * Server-side n8n API client — reads N8N_BASE_URL and N8N_API_KEY at runtime.
 */

export interface N8nWorkflow {
  id:        string;
  name:      string;
  active:    boolean;
  createdAt: string;
  updatedAt: string;
}

export interface N8nConnectionResult {
  connected:  boolean;
  workflows:  N8nWorkflow[];
  error?:     string;
}

export async function getN8nWorkflows(): Promise<N8nConnectionResult> {
  const base   = process.env.N8N_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5678";
  const apiKey = process.env.N8N_API_KEY ?? "";

  if (!apiKey) return { connected: false, workflows: [], error: "N8N_API_KEY not set" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);

  try {
    const res = await fetch(`${base}/api/v1/workflows?limit=50`, {
      headers: { "X-N8N-API-KEY": apiKey, "Content-Type": "application/json" },
      signal:  controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return { connected: false, workflows: [], error: `n8n returned ${res.status}` };

    const json = (await res.json()) as { data: N8nWorkflow[] };
    return { connected: true, workflows: json.data ?? [] };
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { connected: false, workflows: [], error: msg };
  }
}
