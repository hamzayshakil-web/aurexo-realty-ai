-- Migration 004: n8n tracking fields for appointments
-- Run in Supabase SQL editor

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS n8n_sent    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS n8n_sent_at TIMESTAMPTZ;
