"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Save, UserPlus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { createLead, updateLead } from "@/lib/actions/leads";
import type { LeadRow } from "@/types/database";

const PROPERTY_TYPES = [
  "Apartment", "Villa", "Townhouse", "Penthouse", "Plot", "Commercial",
];
const LOCATIONS = [
  "Palm Jumeirah", "Dubai Marina", "Downtown Dubai", "Business Bay",
  "JVC", "Arabian Ranches", "Emirates Hills", "DIFC", "Bluewaters Island",
];
const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

interface Props {
  lead?: LeadRow;
}

export function LeadFormClient({ lead }: Props) {
  const isEdit = !!lead;
  const router = useRouter();

  const action = isEdit ? updateLead.bind(null, lead.id) : createLead;
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
    error: null,
  });

  const [status, setStatus] = useState(lead?.status ?? "new");
  const [propertyType, setPropertyType] = useState(lead?.property_type ?? "");
  const [location, setLocation] = useState(lead?.location ?? "");

  // After a successful create: show toast then redirect
  useEffect(() => {
    if (!state.success || !state.leadId) return;

    if (state.webhookStatus === "sent") {
      toast.success("Lead created & automation triggered", {
        description: "n8n received the lead and started the workflow.",
        duration: 5000,
      });
    } else if (state.webhookStatus === "failed") {
      toast.warning("Lead saved — automation not triggered", {
        description: state.webhookError ?? "n8n may not be running.",
        duration: 6000,
      });
    } else {
      toast.success("Lead created successfully");
    }

    const timer = setTimeout(() => router.push(`/leads/${state.leadId}`), 800);
    return () => clearTimeout(timer);
  }, [state.success, state.leadId, state.webhookStatus, state.webhookError, router]);

  // ── Redirecting indicator ─────────────────────────────────────────────────
  const isRedirecting = state.success && !!state.leadId;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link href={isEdit ? `/leads/${lead.id}` : "/leads"}>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={isEdit ? "Edit Lead" : "Add New Lead"}
          description={
            isEdit
              ? `Editing ${lead.name}`
              : "Capture a new lead into your pipeline"
          }
          icon={isEdit ? Edit : UserPlus}
        />
      </div>

      <form action={formAction} className="space-y-5">
        {/* Hidden inputs for select values */}
        <input type="hidden" name="status" value={status} />
        <input type="hidden" name="property_type" value={propertyType} />
        <input type="hidden" name="location" value={location} />

        {/* Error banner */}
        {state.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
            {state.error}
          </div>
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Ahmed Al Mansouri"
                defaultValue={lead?.name ?? ""}
                required
                disabled={isRedirecting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ahmed@email.com"
                defaultValue={lead?.email ?? ""}
                disabled={isRedirecting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+971 50 123 4567"
                defaultValue={lead?.phone ?? ""}
                disabled={isRedirecting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lead Details */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => { if (v) setStatus(v as typeof status); }}
                disabled={isRedirecting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Property Type</Label>
              <Select
                value={propertyType}
                onValueChange={(v) => setPropertyType(v ?? "")}
                disabled={isRedirecting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t.toLowerCase()}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Preferred Location</Label>
              <Select
                value={location}
                onValueChange={(v) => setLocation(v ?? "")}
                disabled={isRedirecting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="budget" className="text-sm font-medium">Budget (AED)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                min="0"
                step="1000"
                placeholder="2500000"
                defaultValue={lead?.budget ?? ""}
                disabled={isRedirecting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes & Follow-up */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Notes & Follow-up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-sm font-medium">Notes</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Add any relevant notes about this lead…"
                rows={4}
                className="resize-none"
                defaultValue={lead?.message ?? ""}
                disabled={isRedirecting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="follow_up_date" className="text-sm font-medium">
                Follow-up Date
              </Label>
              <Input
                id="follow_up_date"
                name="follow_up_date"
                type="date"
                defaultValue={lead?.follow_up_date ?? ""}
                className="w-full"
                disabled={isRedirecting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center gap-3 justify-end pb-8">
          <Link href={isEdit ? `/leads/${lead.id}` : "/leads"}>
            <Button type="button" variant="outline" disabled={isPending || isRedirecting}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white min-w-[130px]"
            disabled={isPending || isRedirecting}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                {isEdit ? "Saving…" : "Creating…"}
              </span>
            ) : isRedirecting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Redirecting…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isEdit ? "Save Changes" : "Save Lead"}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

