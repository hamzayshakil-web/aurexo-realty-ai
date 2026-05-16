import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAYLOADS: Record<string, object> = {
  "new-lead": {
    lead_id:       "test-" + Date.now(),
    user_id:       "test-user",
    name:          "Test Lead (Automation Dashboard)",
    phone:         "+971 50 000 0000",
    email:         "test@aurexo.ai",
    budget:        2_500_000,
    location:      "Dubai Marina",
    property_type: "apartment",
    message:       "This is a test webhook from the Automation Dashboard.",
    status:        "new",
    created_at:    new Date().toISOString(),
  },
  "new-appointment": {
    appointment_id:   "test-apt-" + Date.now(),
    lead_id:          null,
    lead_name:        "Test Lead",
    phone:            "+971 50 000 0000",
    email:            "test@aurexo.ai",
    title:            "Test Appointment (Automation Dashboard)",
    appointment_date: new Date(Date.now() + 86_400_000).toISOString(),
    notes:            "This is a test webhook from the Automation Dashboard.",
    status:           "scheduled",
  },
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workflow } = await req.json() as { workflow: string };
  const payload = PAYLOADS[workflow];
  if (!payload) return NextResponse.json({ error: "Unknown workflow" }, { status: 400 });

  const webhookUrls: Record<string, string | undefined> = {
    "new-lead":         process.env.N8N_NEW_LEAD_WEBHOOK_URL,
    "new-appointment":  process.env.N8N_APPOINTMENT_WEBHOOK_URL,
  };

  const url = webhookUrls[workflow];
  if (!url) return NextResponse.json({ error: "Webhook URL not configured" }, { status: 400 });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
      signal:  controller.signal,
    });
    clearTimeout(timer);
    const body = await res.text().catch(() => "");
    return NextResponse.json({ ok: res.ok, status: res.status, body: body.slice(0, 500) });
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
