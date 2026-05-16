import type { Metadata } from "next";
import { LeadFormClient } from "@/components/leads/LeadFormClient";

export const metadata: Metadata = { title: "Add Lead" };

export default function AddLeadPage() {
  return <LeadFormClient />;
}
