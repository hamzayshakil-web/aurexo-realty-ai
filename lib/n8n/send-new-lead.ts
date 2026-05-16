/**
 * send-new-lead.ts
 * Handles AI analysis (Groq) + email/Telegram notifications directly.
 * No n8n dependency — works on Vercel without any local services.
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

async function analyzeWithGroq(payload: NewLeadPayload): Promise<AiData> {
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are a real estate AI assistant. Analyze this lead and respond with ONLY valid JSON.

Lead details:
- Name: ${payload.name}
- Budget: ${payload.budget ? `AED ${payload.budget.toLocaleString()}` : "Not specified"}
- Location: ${payload.location ?? "Not specified"}
- Property Type: ${payload.property_type ?? "Not specified"}
- Message: ${payload.message ?? "No message"}

Respond with this exact JSON structure:
{
  "ai_summary": "2-3 sentence summary of the lead and their needs",
  "lead_score": <number 1-10>,
  "lead_temperature": "hot" | "warm" | "cold",
  "suggested_follow_up": "specific actionable follow-up recommendation"
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 300,
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in Groq response");
  const parsed = JSON.parse(match[0]);
  return {
    ai_summary:          parsed.ai_summary          ?? null,
    lead_temperature:    parsed.lead_temperature    ?? null,
    lead_score:          parsed.lead_score          ?? null,
    suggested_follow_up: parsed.suggested_follow_up ?? null,
  };
}

async function sendEmail(payload: NewLeadPayload, ai: AiData) {
  const to = payload.notification_email ?? process.env.RESEND_TO_EMAIL;
  if (!to || !process.env.RESEND_API_KEY) return;

  const tempColor = ai.lead_temperature === "hot" ? "#e63946" : ai.lead_temperature === "warm" ? "#f4a261" : "#457b9d";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;margin:0">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
    <div style="background:#0a0908;padding:24px 32px;text-align:center">
      <h1 style="color:#c9a84c;margin:0;font-size:22px;letter-spacing:2px">AUREXO REALTY AI</h1>
      <p style="color:#f5f0e8;margin:8px 0 0;font-size:13px;opacity:0.7">New Lead Notification</p>
    </div>
    <div style="padding:32px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <h2 style="margin:0;font-size:20px;color:#0a0908">${payload.name}</h2>
        <span style="background:${tempColor};color:#fff;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;text-transform:uppercase">${ai.lead_temperature ?? "warm"}</span>
        <span style="margin-left:auto;background:#f5f5f5;padding:3px 10px;border-radius:20px;font-size:13px;font-weight:bold">Score: ${ai.lead_score ?? "–"}/10</span>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        ${payload.email ? `<tr><td style="padding:8px 0;color:#666;font-size:13px;width:130px">Email</td><td style="padding:8px 0;font-size:13px">${payload.email}</td></tr>` : ""}
        ${payload.phone ? `<tr><td style="padding:8px 0;color:#666;font-size:13px">Phone</td><td style="padding:8px 0;font-size:13px">${payload.phone}</td></tr>` : ""}
        ${payload.budget ? `<tr><td style="padding:8px 0;color:#666;font-size:13px">Budget</td><td style="padding:8px 0;font-size:13px">AED ${payload.budget.toLocaleString()}</td></tr>` : ""}
        ${payload.location ? `<tr><td style="padding:8px 0;color:#666;font-size:13px">Location</td><td style="padding:8px 0;font-size:13px">${payload.location}</td></tr>` : ""}
        ${payload.property_type ? `<tr><td style="padding:8px 0;color:#666;font-size:13px">Property Type</td><td style="padding:8px 0;font-size:13px">${payload.property_type}</td></tr>` : ""}
        ${payload.message ? `<tr><td style="padding:8px 0;color:#666;font-size:13px;vertical-align:top">Message</td><td style="padding:8px 0;font-size:13px">${payload.message}</td></tr>` : ""}
      </table>
      <div style="background:#fffbf0;border-left:4px solid #c9a84c;padding:16px;border-radius:0 8px 8px 0;margin-bottom:16px">
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#8a6e28;text-transform:uppercase;letter-spacing:1px">AI Summary</p>
        <p style="margin:0;font-size:14px;color:#333;line-height:1.6">${ai.ai_summary ?? "No summary available."}</p>
      </div>
      <div style="background:#f0f7ff;border-left:4px solid #457b9d;padding:16px;border-radius:0 8px 8px 0">
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#457b9d;text-transform:uppercase;letter-spacing:1px">Suggested Follow-Up</p>
        <p style="margin:0;font-size:14px;color:#333;line-height:1.6">${ai.suggested_follow_up ?? "Follow up promptly."}</p>
      </div>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee">
      <p style="margin:0;font-size:12px;color:#999">Aurexo Realty AI — Automated Lead Notification</p>
    </div>
  </div>
</body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: [to],
      subject: `🏠 New Lead: ${payload.name} (Score ${ai.lead_score ?? "?"}/10 · ${ai.lead_temperature ?? "warm"})`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend: ${err}`);
  }
}

async function sendTelegram(payload: NewLeadPayload, ai: AiData) {
  const chatId = payload.telegram_chat_id ?? process.env.TELEGRAM_CHAT_ID;
  if (!chatId || !process.env.TELEGRAM_BOT_TOKEN) return;

  const tempEmoji = ai.lead_temperature === "hot" ? "🔥" : ai.lead_temperature === "warm" ? "🌡️" : "❄️";
  const text = `${tempEmoji} *New Lead: ${payload.name}*\nScore: ${ai.lead_score ?? "?"}/10 · ${(ai.lead_temperature ?? "warm").toUpperCase()}\n\n📝 ${ai.ai_summary ?? ""}\n\n✅ *Follow-up:* ${ai.suggested_follow_up ?? ""}`;

  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

export async function sendNewLead(payload: NewLeadPayload): Promise<N8nResult> {
  try {
    const aiData = await analyzeWithGroq(payload);

    await Promise.allSettled([
      sendEmail(payload, aiData).catch((e) => console.error("[lead] Email error:", e)),
      sendTelegram(payload, aiData).catch((e) => console.error("[lead] Telegram error:", e)),
    ]);

    console.info("[lead] ✓ AI + notifications done → lead_id:", payload.lead_id);
    return { status: "sent", aiData };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[lead] Failed →", message);
    return { status: "failed", error: message };
  }
}
