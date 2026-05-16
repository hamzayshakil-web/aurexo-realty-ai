import { createClient } from "@/lib/supabase/server";

export interface UserProfile {
  id:                 string;
  full_name:          string | null;
  agency_name:        string | null;
  notification_email: string | null;
  telegram_chat_id:   string | null;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, agency_name, notification_email, telegram_chat_id")
    .eq("id", user.id)
    .single();

  // If no profile row yet, return defaults using auth email
  if (!data) {
    return {
      id:                 user.id,
      full_name:          null,
      agency_name:        null,
      notification_email: user.email ?? null,
      telegram_chat_id:   null,
    };
  }

  return data as UserProfile;
}
