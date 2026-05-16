import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const BUDGET_MAP: Record<string, number> = {
  "under-1m":   800_000,
  "1m-3m":    2_000_000,
  "3m-5m":    4_000_000,
  "5m-10m":   7_500_000,
  "10m-plus": 15_000_000,
};

async function analyzeLeadWithGroq(lead: {
  name: string;
  budget: number | null;
  location: string | null;
  property_type: string | null;
  message: string | null;
}) {
  const prompt = `You are a real estate AI assistant. Analyze this lead and respond with ONLY valid JSON.

Lead details:
- Name: ${lead.name}
- Budget: ${lead.budget ? `AED ${lead.budget.toLocaleString()}` : "Not specified"}
- Location: ${lead.location ?? "Not specified"}
- Property Type: ${lead.property_type ?? "Not specified"}
- Message: ${lead.message ?? "No message"}

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
  return JSON.parse(match[0]) as {
    ai_summary: string;
    lead_score: number;
    lead_temperature: string;
    suggested_follow_up: string;
  };
}

async function sendEmailNotification(opts: {
  to: string;
  leadName: string;
  leadEmail: string | null;
  leadPhone: string | null;
  budget: number | null;
  location: string | null;
  propertyType: string | null;
  message: string | null;
  aiSummary: string;
  leadScore: number;
  leadTemperature: string;
  suggestedFollowUp: string;
}) {
  const tempColor = opts.leadTemperature === "hot" ? "#e63946" : opts.leadTemperature === "warm" ? "#f4a261" : "#457b9d";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;margin:0">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
    <div style="background:#0a0908;padding:24px 32px;text-align:center">
      <h1 style="color:#c9a84c;margin:0;font-size:22px;letter-spacing:2px">AUREXO REALTY AI</h1>
      <p style="color:#f5f0e8;margin:8px 0 0;font-size:13px;opacity:0.7">New Lead Notification</p>
    </div>
    <div style="padding:32px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <h2 style="margin:0;font-size:20px;color:#0a0908">${opts.leadName}</h2>
        <span style="background:${tempColor};color:#fff;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;text-transform:uppercase">${opts.leadTemperature}</span>
        <span style="margin-left:auto;background:#f5f5f5;padding:3px 10px;border-radius:20px;font-size:13px;font-weight:bold">Score: ${opts.leadScore}/10</span>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        ${opts.leadEmail ? `<tr><td style="padding:8px 0;color:#666;font-size:13px;width:130px">Email</td><td style="padding:8px 0;font-size:13px">${opts.leadEmail}</td></tr>` : ""}
        ${opts.leadPhone ? `<tr><td style="padding:8px 0;color:#666;font-size:13px">Phone</td><td style="padding:8px 0;font-size:13px">${opts.leadPhone}</td></tr>` : ""}
        ${opts.budget ? `<tr><td style="padding:8px 0;color:#666;font-size:13px">Budget</td><td style="padding:8px 0;font-size:13px">AED ${opts.budget.toLocaleString()}</td></tr>` : ""}
        ${opts.location ? `<tr><td style="padding:8px 0;color:#666;font-size:13px">Location</td><td style="padding:8px 0;font-size:13px">${opts.location}</td></tr>` : ""}
        ${opts.propertyType ? `<tr><td style="padding:8px 0;color:#666;font-size:13px">Property Type</td><td style="padding:8px 0;font-size:13px">${opts.propertyType}</td></tr>` : ""}
        ${opts.message ? `<tr><td style="padding:8px 0;color:#666;font-size:13px;vertical-align:top">Message</td><td style="padding:8px 0;font-size:13px">${opts.message}</td></tr>` : ""}
      </table>

      <div style="background:#fffbf0;border-left:4px solid #c9a84c;padding:16px;border-radius:0 8px 8px 0;margin-bottom:16px">
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#8a6e28;text-transform:uppercase;letter-spacing:1px">AI Summary</p>
        <p style="margin:0;font-size:14px;color:#333;line-height:1.6">${opts.aiSummary}</p>
      </div>

      <div style="background:#f0f7ff;border-left:4px solid #457b9d;padding:16px;border-radius:0 8px 8px 0">
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#457b9d;text-transform:uppercase;letter-spacing:1px">Suggested Follow-Up</p>
        <p style="margin:0;font-size:14px;color:#333;line-height:1.6">${opts.suggestedFollowUp}</p>
      </div>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee">
      <p style="margin:0;font-size:12px;color:#999">Aurexo Realty AI — Automated Lead Notification</p>
    </div>
  </div>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: [opts.to],
      subject: `🏠 New Lead: ${opts.leadName} (Score ${opts.leadScore}/10 · ${opts.leadTemperature})`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
}

async function sendTelegramNotification(chatId: string, lead: {
  name: string;
  leadScore: number;
  leadTemperature: string;
  aiSummary: string;
  suggestedFollowUp: string;
}) {
  const tempEmoji = lead.leadTemperature === "hot" ? "🔥" : lead.leadTemperature === "warm" ? "🌡️" : "❄️";
  const text = `${tempEmoji} *New Lead: ${lead.name}*\nScore: ${lead.leadScore}/10 · ${lead.leadTemperature.toUpperCase()}\n\n📝 ${lead.aiSummary}\n\n✅ *Follow-up:* ${lead.suggestedFollowUp}`;

  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, budget_range, location, property_type, message } = body;

    if (!name?.trim()) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }
    if (!phone?.trim() && !email?.trim()) {
      return Response.json({ error: "Phone or email is required" }, { status: 400 });
    }

    const budget = BUDGET_MAP[budget_range] ?? null;
    const realtorUserId = process.env.REALTOR_USER_ID;

    if (!realtorUserId) {
      return Response.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // 1. Insert lead
    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .insert({
        user_id:       realtorUserId,
        name:          name.trim(),
        phone:         phone?.trim() || null,
        email:         email?.trim() || null,
        budget,
        location:      location || null,
        property_type: property_type || null,
        message:       message?.trim() || null,
        status:        "new",
      })
      .select()
      .single();

    if (error) {
      console.error("[inquiry] Supabase insert error:", error);
      return Response.json({ error: "Failed to save inquiry" }, { status: 500 });
    }

    // 2. Fetch realtor profile for notification preferences
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("notification_email, telegram_chat_id")
      .eq("id", realtorUserId)
      .single();

    // 3. AI analysis via Groq
    let aiData = { ai_summary: "", lead_score: 5, lead_temperature: "warm", suggested_follow_up: "" };
    try {
      aiData = await analyzeLeadWithGroq({
        name: lead.name,
        budget: lead.budget,
        location: lead.location,
        property_type: lead.property_type,
        message: lead.message,
      });
    } catch (err) {
      console.error("[inquiry] Groq error:", err);
    }

    // 4. Write AI results back to the lead
    await supabaseAdmin
      .from("leads")
      .update({
        ai_summary:          aiData.ai_summary          || null,
        lead_score:          aiData.lead_score          || null,
        lead_temperature:    aiData.lead_temperature    || null,
        suggested_follow_up: aiData.suggested_follow_up || null,
        n8n_sent:            false,
      })
      .eq("id", lead.id);

    // 5. Send email notification
    const notifyEmail = profile?.notification_email ?? process.env.RESEND_TO_EMAIL;
    if (notifyEmail) {
      try {
        await sendEmailNotification({
          to: notifyEmail,
          leadName: lead.name,
          leadEmail: lead.email,
          leadPhone: lead.phone,
          budget: lead.budget,
          location: lead.location,
          propertyType: lead.property_type,
          message: lead.message,
          aiSummary: aiData.ai_summary,
          leadScore: aiData.lead_score,
          leadTemperature: aiData.lead_temperature,
          suggestedFollowUp: aiData.suggested_follow_up,
        });
      } catch (err) {
        console.error("[inquiry] Email error:", err);
      }
    }

    // 6. Send Telegram notification (optional)
    const telegramChatId = profile?.telegram_chat_id ?? process.env.TELEGRAM_CHAT_ID;
    if (telegramChatId && process.env.TELEGRAM_BOT_TOKEN) {
      try {
        await sendTelegramNotification(telegramChatId, {
          name: lead.name,
          leadScore: aiData.lead_score,
          leadTemperature: aiData.lead_temperature,
          aiSummary: aiData.ai_summary,
          suggestedFollowUp: aiData.suggested_follow_up,
        });
      } catch (err) {
        console.error("[inquiry] Telegram error:", err);
      }
    }

    return Response.json({ ok: true, lead_id: lead.id });
  } catch (err) {
    console.error("[inquiry] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
