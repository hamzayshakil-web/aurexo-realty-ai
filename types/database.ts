import type { LeadStatus, PropertyStatus, AppointmentStatus } from "@/types";

export interface LeadRow {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  budget: number | null;
  location: string | null;
  property_type: string | null;
  message: string | null;
  status: LeadStatus;
  ai_summary: string | null;
  lead_score: number | null;
  follow_up_date: string | null;
  created_at: string;
  // Added by migration 002
  n8n_sent?: boolean;
  n8n_sent_at?: string | null;
  // Added by migration 003
  lead_temperature?: string | null;
  suggested_follow_up?: string | null;
}

export interface PropertyRow {
  id: string;
  user_id: string;
  title: string;
  location: string | null;
  price: number | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  status: PropertyStatus;
  created_at: string;
}

export interface AppointmentRow {
  id: string;
  user_id: string;
  lead_id: string | null;
  title: string;
  appointment_date: string;
  notes: string | null;
  status: AppointmentStatus;
  created_at: string;
  n8n_sent?: boolean;
  n8n_sent_at?: string | null;
}
