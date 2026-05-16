"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProfileActionState = { success: boolean; error: string | null };

export async function saveProfile(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in." };

  const full_name          = formData.get("full_name")?.toString().trim()          || null;
  const agency_name        = formData.get("agency_name")?.toString().trim()        || null;
  const notification_email = formData.get("notification_email")?.toString().trim() || null;
  const telegram_chat_id   = formData.get("telegram_chat_id")?.toString().trim()   || null;

  if (notification_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notification_email)) {
    return { success: false, error: "Please enter a valid notification email." };
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name,
      agency_name,
      notification_email: notification_email ?? user.email,
      telegram_chat_id,
      updated_at: new Date().toISOString(),
    });

  if (error) return { success: false, error: error.message };

  // Sync display name to auth user metadata so the header updates
  await supabase.auth.updateUser({ data: { full_name: full_name ?? "" } });

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { success: true, error: null };
}
