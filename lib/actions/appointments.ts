"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AppointmentStatus } from "@/types";
import { sendNewAppointment } from "@/lib/n8n/send-new-appointment";
import { getUserProfile } from "@/lib/supabase/get-profile";

export type AppointmentActionState = {
  success:       boolean;
  error:         string | null;
  appointmentId?: string;
  webhookStatus?: string;
  webhookError?:  string;
};

const VALID_STATUSES: AppointmentStatus[] = [
  "scheduled", "confirmed", "completed", "cancelled", "no-show",
];

function parseFormData(
  formData: FormData
): { data?: Record<string, unknown>; error?: string } {
  const title = formData.get("title")?.toString().trim();
  if (!title) return { error: "Title is required." };

  const appointment_date = formData.get("appointment_date")?.toString();
  if (!appointment_date) return { error: "Date and time are required." };

  const status = (formData.get("status")?.toString() ?? "scheduled") as AppointmentStatus;
  if (!VALID_STATUSES.includes(status)) return { error: "Invalid status." };

  return {
    data: {
      title,
      appointment_date,
      lead_id: formData.get("lead_id")?.toString() || null,
      notes:   formData.get("notes")?.toString().trim() || null,
      status,
    },
  };
}

export async function createAppointment(
  _prevState: AppointmentActionState,
  formData: FormData
): Promise<AppointmentActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const parsed = parseFormData(formData);
  if (parsed.error || !parsed.data) return { success: false, error: parsed.error ?? "Validation failed." };

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({ ...parsed.data, user_id: user.id })
    .select("*")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/appointments");

  // Enrich webhook payload with lead contact info
  let lead_name  = "Unknown";
  let lead_phone: string | null = null;
  let lead_email: string | null = null;

  if (appointment.lead_id) {
    const { data: lead } = await supabase
      .from("leads")
      .select("name, phone, email")
      .eq("id", appointment.lead_id)
      .single();
    if (lead) {
      lead_name  = lead.name;
      lead_phone = lead.phone;
      lead_email = lead.email;
    }
  }

  const profile = await getUserProfile();

  const webhook = await sendNewAppointment({
    appointment_id:     appointment.id,
    lead_id:            appointment.lead_id,
    lead_name,
    phone:              lead_phone,
    email:              lead_email,
    title:              appointment.title,
    appointment_date:   appointment.appointment_date,
    notes:              appointment.notes,
    status:             appointment.status,
    notification_email: profile?.notification_email ?? user.email ?? null,
    telegram_chat_id:   profile?.telegram_chat_id   ?? null,
  });

  if (webhook.status !== "skipped") {
    await supabase
      .from("appointments")
      .update({
        n8n_sent:    webhook.status === "sent",
        n8n_sent_at: webhook.status === "sent" ? new Date().toISOString() : null,
      })
      .eq("id", appointment.id)
      .eq("user_id", user.id);
  }

  return {
    success:       true,
    error:         null,
    appointmentId: appointment.id,
    webhookStatus: webhook.status,
    webhookError:  webhook.error,
  };
}

export async function updateAppointment(
  id: string,
  _prevState: AppointmentActionState,
  formData: FormData
): Promise<AppointmentActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const parsed = parseFormData(formData);
  if (parsed.error || !parsed.data) return { success: false, error: parsed.error ?? "Validation failed." };

  const { error } = await supabase
    .from("appointments")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/appointments");
  redirect("/appointments");
}

export async function deleteAppointment(id: string): Promise<AppointmentActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/appointments");
  return { success: true, error: null };
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<AppointmentActionState> {
  if (!VALID_STATUSES.includes(status)) return { success: false, error: "Invalid status." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/appointments");
  return { success: true, error: null };
}
