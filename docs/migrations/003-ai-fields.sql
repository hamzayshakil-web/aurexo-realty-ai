-- ============================================================
-- Migration 003 — Add AI callback fields to leads table
--
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS lead_temperature  TEXT,
  ADD COLUMN IF NOT EXISTS suggested_follow_up TEXT;
