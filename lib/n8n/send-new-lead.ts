/**
 * lib/n8n/send-new-lead.ts
 *
 * Sends a new-lead payload to the n8n webhook after Supabase insert.
 * Parses the AI-enriched response body so the caller can write AI fields
 * to the DB in one pass — no separate callback needed.
 */

export type N8nStatus = "sent" | "failed" | "skipped";

export interface AiData {
  ai_summary:          string | null;
  lead_temperature:    string | null;
  lead_score:          number | null;
  suggested_follow_up: string | null;
}

export interface N8nResult {
  status:  N8nStatus;
  error?:  string;
  aiData?: AiData;
}

export interface NewLeadPayload {
  lead_id:            string;
  user_id:            string;
  name:               string;
  phone:              string | null;
  email:              string | null;
  budget:             number | null;
  location:           string | null;
  property_type:      string | null;
  message:            string | null;
  status:             string;
  created_at:         string;
  notification_email: string | null;
  telegram_chat_id:   string | null;
}

// Groq + n8n processing takes up to ~10s — give it enough room
const TIMEOUT_MS = 20_000;

export async function sendNewLead(payload: NewLeadPayload): Promise<N8nResult> {
  const url = process.env.N8N_NEW_LEAD_WEBHOOK_URL;

  if (!url) {
    console.info("[n8n] N8N_NEW_LEAD_WEBHOOK_URL not set — skipping webhook");
    return { status: "skipped" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
      signal:  controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[n8n] Webhook error →", `HTTP ${res.status}`, body.slice(0, 200));
      return { status: "failed", error: `n8n returned ${res.status}` };
    }

    // Parse AI fields from the n8n workflow response
    let aiData: AiData | undefined;
    try {
      const json = await res.json() as Record<string, unknown>;
      if (json.ok) {
        aiData = {
          ai_summary:          typeof json.ai_summary          === "string" ? json.ai_summary          : null,
          lead_temperature:    typeof json.lead_temperature    === "string" ? json.lead_temperature    : null,
          lead_score:          typeof json.lead_score          === "number" ? json.lead_score          : null,
          suggested_follow_up: typeof json.suggested_follow_up === "string" ? json.suggested_follow_up : null,
        };
      }
    } catch {
      // Non-JSON response — still counts as sent, just no AI data
    }

    console.info("[n8n] ✓ Webhook sent → lead_id:", payload.lead_id, "| AI data:", !!aiData);
    return { status: "sent", aiData };
  } catch (err) {
    clearTimeout(timer);

    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? `Timed out after ${TIMEOUT_MS / 1000}s — is n8n running?`
          : err.message
        : "Unknown error";

    console.error("[n8n] Webhook failed →", message);
    return { status: "failed", error: message };
  }
}
