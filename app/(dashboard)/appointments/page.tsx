import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Plus, Clock, User } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { AppointmentStatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAppointments } from "@/lib/queries/appointments";
import type { AppointmentWithLead } from "@/lib/queries/appointments";

export const metadata: Metadata = { title: "Appointments" };

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    month: d.toLocaleDateString("en-GB", { month: "short" }),
    day:   d.getDate(),
    full:  d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    time:  d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}

const UPCOMING_STATUSES = new Set(["scheduled", "confirmed"]);
const PAST_STATUSES     = new Set(["completed", "cancelled", "no-show"]);

function AppointmentCard({ apt, compact = false }: { apt: AppointmentWithLead; compact?: boolean }) {
  const dt = formatDateTime(apt.appointment_date);

  if (compact) {
    return (
      <Card className="opacity-70 hover:opacity-100 transition-opacity">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-medium truncate">{apt.title}</p>
                <AppointmentStatusBadge status={apt.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dt.full} · {dt.time}
                {apt.lead_name && ` · ${apt.lead_name}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md hover:border-amber-200 dark:hover:border-amber-900/60 transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Date Block */}
          <div className="hidden sm:flex flex-col items-center justify-center h-14 w-14 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 shrink-0 text-center">
            <span className="text-xs font-bold text-amber-600 uppercase">{dt.month}</span>
            <span className="text-xl font-bold text-amber-700 dark:text-amber-400 leading-none">{dt.day}</span>
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
              <h3 className="text-sm font-semibold leading-snug">{apt.title}</h3>
              <AppointmentStatusBadge status={apt.status} />
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>{dt.full} · {dt.time}</span>
              </div>
              {apt.lead_name && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>{apt.lead_name}</span>
                </div>
              )}
            </div>

            {apt.notes && (
              <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-amber-300 pl-2 line-clamp-2">
                {apt.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AppointmentsPage() {
  const appointments = await getAppointments();

  const now      = new Date();
  const upcoming = appointments.filter(
    (a) => UPCOMING_STATUSES.has(a.status) && new Date(a.appointment_date) >= now
  );
  const past = appointments.filter(
    (a) => PAST_STATUSES.has(a.status) || new Date(a.appointment_date) < now
  );

  const confirmed = appointments.filter((a) => a.status === "confirmed").length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Schedule and manage property viewings, consultations, and follow-ups"
        icon={CalendarDays}
      >
        <Link href="/appointments/add">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white" size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            New Appointment
          </Button>
        </Link>
      </PageHeader>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Upcoming",  count: upcoming.length,  color: "text-blue-600",  bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Confirmed", count: confirmed,         color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
          { label: "Completed", count: completed,         color: "text-gray-600",  bg: "bg-gray-100 dark:bg-gray-800" },
          { label: "Cancelled", count: cancelled,         color: "text-red-500",   bg: "bg-red-50 dark:bg-red-950/30" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.bg} shrink-0`}>
                <CalendarDays className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.count}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No upcoming appointments.{" "}
              <Link href="/appointments/add" className="text-amber-600 hover:underline">
                Schedule one now
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map((apt) => (
              <AppointmentCard key={apt.id} apt={apt} />
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Past Appointments ({past.length})
          </h2>
          <div className="space-y-3">
            {past.slice(0, 10).map((apt) => (
              <AppointmentCard key={apt.id} apt={apt} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
