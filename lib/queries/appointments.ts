import { createClient } from "@/lib/supabase/server";
import type { AppointmentRow } from "@/types/database";

export interface AppointmentWithLead extends AppointmentRow {
  lead_name:  string | null;
  lead_phone: string | null;
  lead_email: string | null;
}

type SupabaseRow = AppointmentRow & {
  leads: { name: string; phone: string | null; email: string | null } | null;
};

function mapRow(row: SupabaseRow): AppointmentWithLead {
  const { leads, ...rest } = row;
  return {
    ...rest,
    lead_name:  leads?.name  ?? null,
    lead_phone: leads?.phone ?? null,
    lead_email: leads?.email ?? null,
  };
}

export async function getAppointments(): Promise<AppointmentWithLead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, leads(name, phone, email)")
    .order("appointment_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as SupabaseRow[] ?? []).map(mapRow);
}

export async function getAppointment(id: string): Promise<AppointmentWithLead | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, leads(name, phone, email)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return mapRow(data as SupabaseRow);
}
