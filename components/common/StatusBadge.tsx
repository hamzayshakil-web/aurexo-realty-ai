import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadStatus, AppointmentStatus, PropertyStatus } from "@/types";

const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  new:       { label: "New",       className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  contacted: { label: "Contacted", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  qualified: { label: "Qualified", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  proposal:  { label: "Proposal",  className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
  won:       { label: "Won",       className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" },
  lost:      { label: "Lost",      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
};

const APPOINTMENT_STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled:  { label: "Scheduled",  className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  confirmed:  { label: "Confirmed",  className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  completed:  { label: "Completed",  className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
  cancelled:  { label: "Cancelled",  className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  "no-show":  { label: "No Show",    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

const PROPERTY_STATUS_CONFIG: Record<PropertyStatus, { label: string; className: string }> = {
  available:    { label: "Available",    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  sold:         { label: "Sold",         className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
  rented:       { label: "Rented",       className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  "under-offer":{ label: "Under Offer",  className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  "off-market": { label: "Off Market",   className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const PRIORITY_CONFIG = {
  low:    { label: "Low",    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  medium: { label: "Medium", className: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  high:   { label: "High",   className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
};

interface LeadStatusBadgeProps { status: LeadStatus }
interface AppointmentStatusBadgeProps { status: AppointmentStatus }
interface PropertyStatusBadgeProps { status: PropertyStatus }
interface PriorityBadgeProps { priority: "low" | "medium" | "high" }

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const config = LEAD_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("text-[11px] font-semibold border", config.className)}>
      {config.label}
    </Badge>
  );
}

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const config = APPOINTMENT_STATUS_CONFIG[status];
  return (
    <Badge variant="secondary" className={cn("text-[11px] font-semibold", config.className)}>
      {config.label}
    </Badge>
  );
}

export function PropertyStatusBadge({ status }: PropertyStatusBadgeProps) {
  const config = PROPERTY_STATUS_CONFIG[status];
  return (
    <Badge variant="secondary" className={cn("text-[11px] font-semibold", config.className)}>
      {config.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <Badge variant="secondary" className={cn("text-[11px] font-semibold", config.className)}>
      {config.label}
    </Badge>
  );
}
