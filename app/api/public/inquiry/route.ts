import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUDGET_MAP: Record<string, number> = {
  "under-1m":   800_000,
  "1m-3m":    2_000_000,
  "3m-5m":    4_000_000,
  "5m-10m":   7_500_000,
  "10m-plus": 15_000_000,
};

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

    // Insert lead using service role (bypasses RLS)
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

    // Fetch realtor's notification preferences
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("notification_email, telegram_chat_id")
      .eq("id", realtorUserId)
      .single();

    // Fire n8n webhook and await the AI response so we can write it back
    const webhookUrl = process.env.N8N_NEW_LEAD_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead_id:            lead.id,
            name:               lead.name,
            email:              lead.email,
            phone:              lead.phone,
            budget:             lead.budget,
            location:           lead.location,
            property_type:      lead.property_type,
            message:            lead.message,
            status:             lead.status,
            created_at:         lead.created_at,
            source:             "website_inquiry",
            notification_email: profile?.notification_email ?? null,
            telegram_chat_id:   profile?.telegram_chat_id   ?? null,
          }),
        });

        if (res.ok) {
          const aiData = await res.json();
          // Write AI results back to the lead row
          if (aiData.ai_summary || aiData.lead_score) {
            await supabaseAdmin
              .from("leads")
              .update({
                ai_summary:          aiData.ai_summary          ?? null,
                lead_score:          aiData.lead_score          ?? null,
                lead_temperature:    aiData.lead_temperature    ?? null,
                suggested_follow_up: aiData.suggested_follow_up ?? null,
                n8n_sent:            true,
                n8n_sent_at:         new Date().toISOString(),
              })
              .eq("id", lead.id);
          }
        }
      } catch (err) {
        console.error("[inquiry] n8n webhook error:", err);
      }
    }

    return Response.json({ ok: true, lead_id: lead.id });
  } catch (err) {
    console.error("[inquiry] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
