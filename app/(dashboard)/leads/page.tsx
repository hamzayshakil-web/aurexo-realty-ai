import type { Metadata } from "next";
import { getLeads } from "@/lib/queries/leads";
import { LeadsClient } from "@/components/leads/LeadsClient";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage() {
  const leads = await getLeads();
  return <LeadsClient initialLeads={leads} />;
}
