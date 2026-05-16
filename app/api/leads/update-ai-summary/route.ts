import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface CallbackBody {
  lead_id: string;
  ai_summary?: string;
  lead_temperature?: string;
  lead_score?: number;
  suggested_follow_up?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth check ────────────────────────────────────────────────────────────
  const secret = req.headers.get("x-n8n-secret");
  const expected = process.env.N8N_CALLBACK_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: CallbackBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { lead_id, ai_summary, lead_temperature, lead_score, suggested_follow_up } = body;

  if (!lead_id || typeof lead_id !== "string") {
    return NextResponse.json({ error: "lead_id is required" }, { status: 400 });
  }

  // ── Update lead ───────────────────────────────────────────────────────────
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("leads")
    .update({
      ai_summary:          ai_summary          ?? null,
      lead_temperature:    lead_temperature    ?? null,
      lead_score:          lead_score !== undefined ? Number(lead_score) : null,
      suggested_follow_up: suggested_follow_up ?? null,
    })
    .eq("id", lead_id);

  if (error) {
    console.error("[update-ai-summary] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.info(`[update-ai-summary] Lead ${lead_id} updated — temp: ${lead_temperature}, score: ${lead_score}`);

  return NextResponse.json({ ok: true, lead_id });
}
