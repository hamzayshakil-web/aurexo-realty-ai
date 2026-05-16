"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LeadStatus } from "@/types";
import { sendNewLead, type N8nStatus } from "@/lib/n8n/send-new-lead";
import { getUserProfile } from "@/lib/supabase/get-profile";

export type ActionState = {
  success: boolean;
  error: string | null;
  leadId?: string;
  webhookStatus?: N8nStatus;
  webhookError?: string;
};

const VALID_STATUSES: LeadStatus[] = [
  "new", "contacted", "qualified", "proposal", "won", "lost",
];

function parseLeadFormData(
  formData: FormData
): { data?: Record<string, unknown>; error?: string } {
  const name = formData.get("name")?.toString().trim();
  if (!name) return { error: "Name is required." };

  const email = formData.get("email")?.toString().trim() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const rawBudget = formData.get("budget")?.toString().trim();
  const budget = rawBudget ? parseFloat(rawBudget) : null;
  if (rawBudget && (isNaN(budget!) || budget! < 0)) {
    return { error: "Budget must be a positive number." };
  }

  const status = (formData.get("status")?.toString() ?? "new") as LeadStatus;
  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status value." };
  }

  const followUp = formData.get("follow_up_date")?.toString() || null;

  return {
    data: {
      name,
      phone: formData.get("phone")?.toString().trim() || null,
      email,
      budget,
      location: formData.get("location")?.toString().trim() || null,
      property_type: formData.get("property_type")?.toString().trim() || null,
      message: formData.get("message")?.toString().trim() || null,
      status,
      follow_up_date: followUp || null,
    },
  };
}

export async function createLead(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const parsed = parseLeadFormData(formData);
  if (parsed.error || !parsed.data) return { success: false, error: parsed.error ?? "Validation failed." };

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({ ...parsed.data, user_id: user.id })
    .select("*")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/leads");

  // Fetch user's notification preferences
  const profile = await getUserProfile();

  // Send to n8n — non-blocking: lead is saved regardless of outcome
  const webhook = await sendNewLead({
    lead_id:            lead.id,
    user_id:            user.id,
    name:               lead.name,
    phone:              lead.phone,
    email:              lead.email,
    budget:             lead.budget,
    location:           lead.location,
    property_type:      lead.property_type,
    message:            lead.message,
    status:             lead.status,
    created_at:         lead.created_at,
    notification_email: profile?.notification_email ?? user.email ?? null,
    telegram_chat_id:   profile?.telegram_chat_id   ?? null,
  });

  // Persist webhook result + AI fields back to the lead (best-effort)
  if (webhook.status !== "skipped") {
    await supabase
      .from("leads")
      .update({
        n8n_sent:    webhook.status === "sent",
        n8n_sent_at: webhook.status === "sent" ? new Date().toISOString() : null,
        ...(webhook.aiData ? {
          ai_summary:          webhook.aiData.ai_summary,
          lead_temperature:    webhook.aiData.lead_temperature,
          lead_score:          webhook.aiData.lead_score,
          suggested_follow_up: webhook.aiData.suggested_follow_up,
        } : {}),
      })
      .eq("id", lead.id)
      .eq("user_id", user.id);
  }

  return {
    success:       true,
    error:         null,
    leadId:        lead.id,
    webhookStatus: webhook.status,
    webhookError:  webhook.error,
  };
}

export async function updateLead(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const parsed = parseLeadFormData(formData);
  if (parsed.error || !parsed.data) return { success: false, error: parsed.error ?? "Validation failed." };

  const { error } = await supabase
    .from("leads")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  redirect(`/leads/${id}`);
}

export async function deleteLead(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/leads");
  return { success: true, error: null };
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<ActionState> {
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: "Invalid status." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { success: true, error: null };
}
