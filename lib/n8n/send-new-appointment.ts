/**
 * send-new-appointment.ts
 * Sends appointment notifications via Resend email + Telegram.
 * No n8n dependency — works on Vercel without any local services.
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

async function sendEmail(payload: AppointmentPayload) {
  const to = payload.notification_email ?? process.env.RESEND_TO_EMAIL;
  if (!to || !process.env.RESEND_API_KEY) return;

  const apptDate = new Date(payload.appointment_date).toLocaleString("en-AE", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai",
  });

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;margin:0">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
    <div style="background:#0a0908;padding:24px 32px;text-align:center">
      <h1 style="color:#c9a84c;margin:0;font-size:22px;letter-spacing:2px">AUREXO REALTY AI</h1>
      <p style="color:#f5f0e8;margin:8px 0 0;font-size:13px;opacity:0.7">New Appointment Booked</p>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 20px;font-size:20px;color:#0a0908">${payload.title}</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;color:#666;font-size:13px;width:130px">Client</td><td style="padding:8px 0;font-size:13px;font-weight:600">${payload.lead_name}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:13px">Date & Time</td><td style="padding:8px 0;font-size:13px">${apptDate}</td></tr>
        ${payload.email ? `<tr><td style="padding:8px 0;color:#666;font-size:13px">Email</td><td style="padding:8px 0;font-size:13px">${payload.email}</td></tr>` : ""}
        ${payload.phone ? `<tr><td style="padding:8px 0;color:#666;font-size:13px">Phone</td><td style="padding:8px 0;font-size:13px">${payload.phone}</td></tr>` : ""}
        ${payload.notes ? `<tr><td style="padding:8px 0;color:#666;font-size:13px;vertical-align:top">Notes</td><td style="padding:8px 0;font-size:13px">${payload.notes}</td></tr>` : ""}
      </table>
      <div style="background:#fffbf0;border-left:4px solid #c9a84c;padding:16px;border-radius:0 8px 8px 0">
        <p style="margin:0;font-size:14px;color:#333">Remember to prepare property details and any relevant listings before this appointment.</p>
      </div>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee">
      <p style="margin:0;font-size:12px;color:#999">Aurexo Realty AI — Automated Appointment Notification</p>
    </div>
  </div>
</body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: [to],
      subject: `📅 New Appointment: ${payload.lead_name} — ${payload.title}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend: ${err}`);
  }
}

async function sendTelegram(payload: AppointmentPayload) {
  const chatId = payload.telegram_chat_id ?? process.env.TELEGRAM_CHAT_ID;
  if (!chatId || !process.env.TELEGRAM_BOT_TOKEN) return;

  const apptDate = new Date(payload.appointment_date).toLocaleString("en-AE", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai",
  });

  const text = `📅 *New Appointment Booked*\n\n*${payload.title}*\nClient: ${payload.lead_name}\nDate: ${apptDate}${payload.notes ? `\nNotes: ${payload.notes}` : ""}`;

  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

export async function sendNewAppointment(payload: AppointmentPayload): Promise<AppointmentWebhookResult> {
  try {
    await Promise.allSettled([
      sendEmail(payload).catch((e) => console.error("[appt] Email error:", e)),
      sendTelegram(payload).catch((e) => console.error("[appt] Telegram error:", e)),
    ]);

    console.info("[appt] ✓ Notifications sent → appointment_id:", payload.appointment_id);
    return { status: "sent" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[appt] Failed →", message);
    return { status: "failed", error: message };
  }
}
