import type { LeadRow } from "@/types/database";

const WEBHOOK_TIMEOUT_MS = 5_000;

export type WebhookStatus = "sent" | "failed" | "skipped";

export interface WebhookResult {
  status: WebhookStatus;
  error?: string;
}

async function sendWebhook(
  url: string,
  payload: Record<string, unknown>
): Promise<WebhookResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const detail = body ? `: ${body.slice(0, 120)}` : "";
      const msg = `HTTP ${res.status}${detail}`;
      console.error("[n8n] Webhook returned error:", msg);
      return { status: "failed", error: `Webhook returned ${res.status}` };
    }

    console.info("[n8n] Webhook delivered successfully →", url);
    return { status: "sent" };
  } catch (err) {
    clearTimeout(timer);

    let message = "Unknown error";
    if (err instanceof Error) {
      message =
        err.name === "AbortError"
          ? `Timed out after ${WEBHOOK_TIMEOUT_MS / 1000}s — is n8n running on port 5678?`
          : err.message;
    }
    console.error("[n8n] Webhook request failed:", message);
    return { status: "failed", error: message };
  }
}

// ─── Typed payload ────────────────────────────────────────────────────────────

export type NewLeadPayload = Pick<
  LeadRow,
  | "id"
  | "name"
  | "phone"
  | "email"
  | "budget"
  | "location"
  | "property_type"
  | "message"
  | "status"
  | "created_at"
>;

export async function notifyNewLead(lead: NewLeadPayload): Promise<WebhookResult> {
  const url = process.env.N8N_NEW_LEAD_WEBHOOK_URL;

  if (!url) {
    // URL not set — silently skip, not an error
    return { status: "skipped" };
  }

  return sendWebhook(url, {
    lead_id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    budget: lead.budget,
    location: lead.location,
    property_type: lead.property_type,
    message: lead.message,
    status: lead.status,
    created_at: lead.created_at,
  });
}
