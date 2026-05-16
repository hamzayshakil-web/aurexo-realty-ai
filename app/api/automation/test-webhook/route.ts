import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNewLead } from "@/lib/n8n/send-new-lead";
import { sendNewAppointment } from "@/lib/n8n/send-new-appointment";
import { getUserProfile } from "@/lib/supabase/get-profile";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workflow } = await req.json() as { workflow: string };
  const profile = await getUserProfile();

  if (workflow === "new-lead") {
    const result = await sendNewLead({
      lead_id:            "test-" + Date.now(),
      user_id:            user.id,
      name:               "Test Lead (Automation Dashboard)",
      phone:              "+971 50 000 0000",
      email:              "test@aurexo.ai",
      budget:             2_500_000,
      location:           "Dubai Marina",
      property_type:      "apartment",
      message:            "This is a test from the Automation Dashboard.",
      status:             "new",
      created_at:         new Date().toISOString(),
      notification_email: profile?.notification_email ?? user.email ?? null,
      telegram_chat_id:   profile?.telegram_chat_id   ?? null,
    });
    return NextResponse.json({ ok: result.status === "sent", status: result.status, error: result.error });
  }

  if (workflow === "new-appointment") {
    const result = await sendNewAppointment({
      appointment_id:     "test-apt-" + Date.now(),
      lead_id:            null,
      lead_name:          "Test Client",
      phone:              "+971 50 000 0000",
      email:              "test@aurexo.ai",
      title:              "Test Appointment (Automation Dashboard)",
      appointment_date:   new Date(Date.now() + 86_400_000).toISOString(),
      notes:              "This is a test from the Automation Dashboard.",
      status:             "scheduled",
      notification_email: profile?.notification_email ?? user.email ?? null,
      telegram_chat_id:   profile?.telegram_chat_id   ?? null,
    });
    return NextResponse.json({ ok: result.status === "sent", status: result.status, error: result.error });
  }

  return NextResponse.json({ error: "Unknown workflow" }, { status: 400 });
}
