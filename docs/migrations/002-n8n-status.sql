-- ============================================================
-- Migration 002 — Add n8n webhook status to leads table
--
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS n8n_sent    BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS n8n_sent_at TIMESTAMPTZ;
