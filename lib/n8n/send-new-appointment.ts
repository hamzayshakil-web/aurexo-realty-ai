/**
 * lib/n8n/send-new-appointment.ts
 * Fires the appointment webhook to n8n. Fire-and-forget — non-blocking.
 */

export interface AppointmentPayload {
  appointment_id:     string;
  lead_id:            string | null;
  lead_name:          string;
  phone:              string | null;
  email:              string | null;
  title:              string;
  appointment_date:   string;
  notes:              string | null;
  status:             string;
  notification_email: string | null;
  telegram_chat_id:   string | null;
}

export type AppointmentWebhookResult = { status: "sent" | "failed" | "skipped"; error?: string };

const TIMEOUT_MS = 10_000;

export async function sendNewAppointment(payload: AppointmentPayload): Promise<AppointmentWebhookResult> {
  const url = process.env.N8N_APPOINTMENT_WEBHOOK_URL;
  if (!url) return { status: "skipped" };

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
      console.error("[n8n] Appointment webhook error →", res.status);
      return { status: "failed", error: `n8n returned ${res.status}` };
    }

    console.info("[n8n] ✓ Appointment webhook sent →", payload.appointment_id);
    return { status: "sent" };
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[n8n] Appointment webhook failed →", msg);
    return { status: "failed", error: msg };
  }
}
