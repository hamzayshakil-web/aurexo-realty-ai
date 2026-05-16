import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Phone, Mail, MapPin, DollarSign,
  Calendar, MessageSquare, Building2, Edit,
  Zap, Brain,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LeadStatusBadge } from "@/components/common/StatusBadge";
import { DeleteLeadButton } from "@/components/leads/DeleteLeadButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getLead } from "@/lib/queries/leads";
import type { LeadStatus } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLead(id);
  return { title: lead ? lead.name : "Lead Not Found" };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatBudget(amount: number) {
  if (amount >= 1_000_000) return `AED ${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `AED ${(amount / 1_000).toFixed(0)}K`;
  return `AED ${amount}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatFollowUp(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const lead = await getLead(id);

  if (!lead) notFound();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link href="/leads">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <PageHeader
            title={lead.name}
            description={`Lead · Added ${formatDate(lead.created_at)}`}
          >
            <LeadStatusBadge status={lead.status as LeadStatus} />
            <Link href={`/leads/${lead.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
            <DeleteLeadButton leadId={lead.id} leadName={lead.name} />
          </PageHeader>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                <Avatar className="h-16 w-16 shrink-0">
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-xl font-bold dark:bg-amber-950/50 dark:text-amber-400">
                    {getInitials(lead.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold mb-3">{lead.name}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                      >
                        <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="truncate group-hover:underline">{lead.email}</span>
                      </a>
                    )}
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                      >
                        <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="group-hover:underline">{lead.phone}</span>
                      </a>
                    )}
                    {lead.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>{lead.location}</span>
                      </div>
                    )}
                    {lead.budget !== null && lead.budget !== undefined && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
                        <DollarSign className="h-4 w-4 shrink-0" />
                        {formatBudget(lead.budget)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {lead.property_type && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Property Type</p>
                      <p className="text-sm font-medium mt-0.5 capitalize">
                        {lead.property_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium mt-0.5 capitalize">
                        {lead.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Added</p>
                      <p className="text-sm font-medium mt-0.5">
                        {formatDate(lead.created_at)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {lead.message || "No notes added yet."}
              </p>
            </CardContent>
          </Card>

          {/* AI Summary — placeholder until Phase 3 */}
          {lead.ai_summary && (
            <Card className="border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Brain className="h-4 w-4" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {lead.ai_summary}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2.5 h-9 text-sm"
                  >
                    <Mail className="h-4 w-4 text-blue-600" />
                    Send Email
                  </Button>
                </a>
              )}
              {lead.phone && (
                <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2.5 h-9 text-sm"
                  >
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    WhatsApp Message
                  </Button>
                </a>
              )}
              <Link href="/appointments">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2.5 h-9 text-sm"
                >
                  <Building2 className="h-4 w-4 text-purple-600" />
                  Schedule Viewing
                </Button>
              </Link>
              <Link href="/automation">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2.5 h-9 text-sm"
                >
                  <Zap className="h-4 w-4 text-orange-600" />
                  Run Automation
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Follow-up Date */}
          {lead.follow_up_date && (
            <Card className="border-amber-200 dark:border-amber-900/50">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
                  Follow-up Scheduled
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-500 shrink-0" />
                  <p className="text-sm font-medium">
                    {formatFollowUp(lead.follow_up_date)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lead Score — placeholder until Phase 3 AI */}
          <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3">
                AI Lead Score
              </p>
              {lead.lead_score !== null && lead.lead_score !== undefined ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {lead.lead_score}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        {lead.lead_score >= 75 ? "High Potential" :
                         lead.lead_score >= 50 ? "Medium Potential" : "Low Potential"}
                      </p>
                      <p className="text-[11px] text-amber-600/70 dark:text-amber-500/70">
                        AI-generated score
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${lead.lead_score}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-xs text-amber-600/70 dark:text-amber-500/70">
                  Score will be generated automatically once AI is enabled in Phase 3.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
