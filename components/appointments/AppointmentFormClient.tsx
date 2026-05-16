"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Save, CalendarPlus, Edit } from "lucide-react";
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
import { createAppointment, updateAppointment } from "@/lib/actions/appointments";
import type { AppointmentRow } from "@/types/database";

interface LeadOption {
  id:   string;
  name: string;
}

const STATUSES = [
  { value: "scheduled",  label: "Scheduled" },
  { value: "confirmed",  label: "Confirmed" },
  { value: "completed",  label: "Completed" },
  { value: "cancelled",  label: "Cancelled" },
  { value: "no-show",    label: "No Show" },
];

interface Props {
  appointment?: AppointmentRow;
  leads:        LeadOption[];
}

function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return "";
  // Supabase stores ISO strings — browser datetime-local wants "YYYY-MM-DDTHH:mm"
  return iso.slice(0, 16);
}

export function AppointmentFormClient({ appointment, leads }: Props) {
  const isEdit  = !!appointment;
  const router  = useRouter();

  const action = isEdit
    ? updateAppointment.bind(null, appointment.id)
    : createAppointment;

  const [state, formAction, isPending] = useActionState(action, {
    success: false,
    error:   null,
  });

  const [status,  setStatus]  = useState<string>(appointment?.status  ?? "scheduled");
  const [leadId,  setLeadId]  = useState<string>(appointment?.lead_id ?? "");

  useEffect(() => {
    if (!state.success || !state.appointmentId) return;

    if (state.webhookStatus === "sent") {
      toast.success("Appointment created & automation triggered", {
        description: "n8n received the appointment and started the workflow.",
        duration: 5000,
      });
    } else if (state.webhookStatus === "failed") {
      toast.warning("Appointment saved — automation not triggered", {
        description: state.webhookError ?? "n8n may not be running.",
        duration: 6000,
      });
    } else {
      toast.success("Appointment saved successfully");
    }

    const timer = setTimeout(() => router.push("/appointments"), 800);
    return () => clearTimeout(timer);
  }, [state.success, state.appointmentId, state.webhookStatus, state.webhookError, router]);

  const isRedirecting = state.success && !!state.appointmentId;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/appointments">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={isEdit ? "Edit Appointment" : "New Appointment"}
          description={
            isEdit
              ? `Editing: ${appointment.title}`
              : "Schedule a new property viewing or consultation"
          }
          icon={isEdit ? Edit : CalendarPlus}
        />
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="status"  value={status} />
        <input type="hidden" name="lead_id" value={leadId} />

        {state.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
            {state.error}
          </div>
        )}

        {/* Appointment Details */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Property Viewing — Palm Jumeirah Villa"
                defaultValue={appointment?.title ?? ""}
                required
                disabled={isRedirecting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appointment_date" className="text-sm font-medium">
                Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="appointment_date"
                name="appointment_date"
                type="datetime-local"
                defaultValue={toDatetimeLocal(appointment?.appointment_date)}
                required
                disabled={isRedirecting}
              />
            </div>

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
          </CardContent>
        </Card>

        {/* Lead */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Associated Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Lead (optional)</Label>
              <Select
                value={leadId}
                onValueChange={(v) => setLeadId(!v || v === "_none" ? "" : v)}
                disabled={isRedirecting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a lead…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— No lead —</SelectItem>
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any preparation notes, access codes, special requirements…"
                rows={4}
                className="resize-none"
                defaultValue={appointment?.notes ?? ""}
                disabled={isRedirecting}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 justify-end pb-8">
          <Link href="/appointments">
            <Button type="button" variant="outline" disabled={isPending || isRedirecting}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white min-w-[140px]"
            disabled={isPending || isRedirecting}
          >
            {isPending || isRedirecting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                {isRedirecting ? "Redirecting…" : isEdit ? "Saving…" : "Creating…"}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isEdit ? "Save Changes" : "Save Appointment"}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
