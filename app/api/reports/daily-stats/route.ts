import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get("x-n8n-secret");
  if (!secret || secret !== process.env.N8N_CALLBACK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Fetch all leads
  const { data: leads, error } = await supabase
    .from("leads")
    .select("status, lead_score, created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const todayStr = todayStart.toISOString();
  const all      = leads ?? [];

  const stats = {
    total_leads:          all.length,
    new_leads:            all.filter((l) => l.created_at >= todayStr).length,
    hot_leads:            all.filter((l) => (l.lead_score ?? 0) >= 80).length,
    status_new:           all.filter((l) => l.status === "new").length,
    status_contacted:     all.filter((l) => l.status === "contacted").length,
    status_qualified:     all.filter((l) => l.status === "qualified").length,
    status_proposal:      all.filter((l) => l.status === "proposal").length,
    status_won:           all.filter((l) => l.status === "won").length,
    status_lost:          all.filter((l) => l.status === "lost").length,
    appointments_today:   0,
    generated_at:         new Date().toISOString(),
  };

  // Appointments today
  const { count } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .gte("appointment_date", todayStr)
    .lt("appointment_date", new Date(todayStart.getTime() + 86_400_000).toISOString());

  stats.appointments_today = count ?? 0;

  return NextResponse.json(stats);
}
