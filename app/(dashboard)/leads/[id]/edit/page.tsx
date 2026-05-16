import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLead } from "@/lib/queries/leads";
import { LeadFormClient } from "@/components/leads/LeadFormClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLead(id);
  return { title: lead ? `Edit — ${lead.name}` : "Lead Not Found" };
}

export default async function EditLeadPage({ params }: Props) {
  const { id } = await params;
  const lead = await getLead(id);

  if (!lead) notFound();

  return <LeadFormClient lead={lead} />;
}
