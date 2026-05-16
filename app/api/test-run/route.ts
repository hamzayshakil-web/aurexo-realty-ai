/**
 * TEMPORARY TEST ENDPOINT — will be deleted after testing
 */
import { NextResponse } from "next/server";
import { sendNewLead } from "@/lib/n8n/send-new-lead";
import { sendNewAppointment } from "@/lib/n8n/send-new-appointment";

const NOTIFICATION_EMAIL = process.env.RESEND_TO_EMAIL ?? "";
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID ?? null;

export async function GET(): Promise<NextResponse> {
  const results: Record<string, unknown> = {};

  // Test 1: Inquiry form
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/public/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:          "Test User — Inquiry Form",
        phone:         "+971501234567",
        email:         "testinquiry@aurexo.ai",
        budget_range:  "1m-3m",
        location:      "Downtown Dubai",
        property_type: "apartment",
        message:       "Automated test: public inquiry form submission.",
      }),
    });
    const data = await res.json();
    results.inquiry_form = { ok: res.ok, status: res.status, data };
  } catch (e) {
    results.inquiry_form = { ok: false, error: String(e) };
  }

  // Test 2: Lead notification (Groq + email)
  try {
    const result = await sendNewLead({
      lead_id:            "test-lead-" + Date.now(),
      user_id:            "test-user",
      name:               "Test Lead — Dashboard",
      phone:              "+971509876543",
      email:              "testlead@aurexo.ai",
      budget:             5_000_000,
      location:           "Palm Jumeirah",
      property_type:      "villa",
      message:            "Automated test: lead creation from dashboard.",
      status:             "new",
      created_at:         new Date().toISOString(),
      notification_email: NOTIFICATION_EMAIL,
      telegram_chat_id:   TELEGRAM_CHAT_ID,
    });
    results.lead_notification = { ok: result.status === "sent", status: result.status, error: result.error, aiData: result.aiData };
  } catch (e) {
    results.lead_notification = { ok: false, error: String(e) };
  }

  // Test 3: Appointment notification
  try {
    const result = await sendNewAppointment({
      appointment_id:     "test-apt-" + Date.now(),
      lead_id:            null,
      lead_name:          "Test Client — Dashboard",
      phone:              "+971501112233",
      email:              "testappt@aurexo.ai",
      title:              "Property Viewing — Dubai Marina Apartment",
      appointment_date:   new Date(Date.now() + 86_400_000).toISOString(),
      notes:              "Automated test: appointment booking from dashboard.",
      status:             "scheduled",
      notification_email: NOTIFICATION_EMAIL,
      telegram_chat_id:   TELEGRAM_CHAT_ID,
    });
    results.appointment_notification = { ok: result.status === "sent", status: result.status, error: result.error };
  } catch (e) {
    results.appointment_notification = { ok: false, error: String(e) };
  }

  const allOk = Object.values(results).every((r) => (r as { ok: boolean }).ok);
  return NextResponse.json({ allOk, results });
}
