import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AppointmentFormClient } from "@/components/appointments/AppointmentFormClient";

export const metadata: Metadata = { title: "New Appointment" };

export default async function AddAppointmentPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <AppointmentFormClient leads={leads ?? []} />
  );
}
