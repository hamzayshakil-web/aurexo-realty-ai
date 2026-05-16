// ─── Lead ────────────────────────────────────────────────────────────────────

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
export type LeadSource = "website" | "referral" | "social" | "cold-call" | "walk-in" | "n8n-automation";
export type LeadPriority = "low" | "medium" | "high";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  budget: number;
  interestedIn: string;
  location: string;
  notes: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt: string | null;
  tags: string[];
}

// ─── Property ────────────────────────────────────────────────────────────────

export type PropertyType = "apartment" | "villa" | "townhouse" | "penthouse" | "plot" | "commercial";
export type PropertyStatus = "available" | "sold" | "rented" | "under-offer" | "off-market";
export type ListingType = "sale" | "rent";

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  listingType: ListingType;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  address: string;
  description: string;
  features: string[];
  images: string[];
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Appointment ─────────────────────────────────────────────────────────────

export type AppointmentType = "viewing" | "consultation" | "follow-up" | "signing";
export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";

export interface Appointment {
  id: string;
  title: string;
  type: AppointmentType;
  status: AppointmentStatus;
  leadId: string;
  leadName: string;
  propertyId?: string;
  propertyTitle?: string;
  agentId: string;
  agentName: string;
  date: string;
  time: string;
  duration: number; // minutes
  location: string;
  notes: string;
  createdAt: string;
}

// ─── Automation ───────────────────────────────────────────────────────────────

export type AutomationTrigger =
  | "new-lead"
  | "lead-status-changed"
  | "appointment-booked"
  | "appointment-reminder"
  | "follow-up-due"
  | "property-matched"
  | "form-submitted";

export type AutomationAction =
  | "send-email"
  | "send-whatsapp"
  | "send-sms"
  | "create-task"
  | "update-lead"
  | "notify-agent"
  | "webhook";

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  isActive: boolean;
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
  n8nWebhookUrl?: string;
}

// ─── Agent / User ─────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "admin" | "agent" | "manager";
  activeLeads: number;
  closedDeals: number;
  revenue: number;
  joinedAt: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalLeads: number;
  leadsGrowth: number;
  activeProperties: number;
  propertiesGrowth: number;
  appointmentsThisWeek: number;
  appointmentsGrowth: number;
  revenueThisMonth: number;
  revenueGrowth: number;
  conversionRate: number;
  automationRuns: number;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export type ActivityType = "lead_created" | "lead_updated" | "appointment_booked" | "deal_closed" | "automation_run" | "property_added";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  agentName: string;
  agentAvatar?: string;
  createdAt: string;
}
