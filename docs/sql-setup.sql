-- ============================================================
-- Aurexo Realty AI — Database Schema
--
-- HOW TO RUN:
--   1. Open https://supabase.com and sign in
--   2. Go to your project → SQL Editor (left sidebar)
--   3. Click "New Query"
--   4. Paste this entire file and click "Run"
--
-- Run order matters — tables must exist before policies.
-- Safe to re-run: all statements use IF NOT EXISTS / IF EXISTS.
-- ============================================================


-- ─── 1. LEADS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT          NOT NULL,
  phone          TEXT,
  email          TEXT,
  budget         NUMERIC(15,2),
  location       TEXT,
  property_type  TEXT,
  message        TEXT,
  status         TEXT          NOT NULL DEFAULT 'new'
                               CHECK (status IN ('new','contacted','qualified','proposal','won','lost')),
  ai_summary     TEXT,
  lead_score     INTEGER       CHECK (lead_score BETWEEN 0 AND 100),
  follow_up_date DATE,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ─── 2. PROPERTIES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.properties (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT          NOT NULL,
  location       TEXT,
  price          NUMERIC(15,2),
  property_type  TEXT,
  bedrooms       INTEGER,
  bathrooms      INTEGER,
  area           NUMERIC(10,2),
  status         TEXT          NOT NULL DEFAULT 'available'
                               CHECK (status IN ('available','sold','rented','under-offer','off-market')),
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ─── 3. APPOINTMENTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id          UUID          REFERENCES public.leads(id) ON DELETE SET NULL,
  title            TEXT          NOT NULL,
  appointment_date TIMESTAMPTZ   NOT NULL,
  notes            TEXT,
  status           TEXT          NOT NULL DEFAULT 'scheduled'
                                 CHECK (status IN ('scheduled','confirmed','completed','cancelled','no-show')),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ─── 4. ROW LEVEL SECURITY ───────────────────────────────────
-- Each user can only read/write their own rows.

ALTER TABLE public.leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist (makes this script idempotent)
DROP POLICY IF EXISTS "leads_select"   ON public.leads;
DROP POLICY IF EXISTS "leads_insert"   ON public.leads;
DROP POLICY IF EXISTS "leads_update"   ON public.leads;
DROP POLICY IF EXISTS "leads_delete"   ON public.leads;

DROP POLICY IF EXISTS "props_select"   ON public.properties;
DROP POLICY IF EXISTS "props_insert"   ON public.properties;
DROP POLICY IF EXISTS "props_update"   ON public.properties;
DROP POLICY IF EXISTS "props_delete"   ON public.properties;

DROP POLICY IF EXISTS "appts_select"   ON public.appointments;
DROP POLICY IF EXISTS "appts_insert"   ON public.appointments;
DROP POLICY IF EXISTS "appts_update"   ON public.appointments;
DROP POLICY IF EXISTS "appts_delete"   ON public.appointments;

-- Leads
CREATE POLICY "leads_select" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "leads_insert" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leads_update" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leads_delete" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Properties
CREATE POLICY "props_select" ON public.properties
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "props_insert" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "props_update" ON public.properties
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "props_delete" ON public.properties
  FOR DELETE USING (auth.uid() = user_id);

-- Appointments
CREATE POLICY "appts_select" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "appts_insert" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "appts_update" ON public.appointments
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "appts_delete" ON public.appointments
  FOR DELETE USING (auth.uid() = user_id);


-- ─── 5. PERFORMANCE INDEXES ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_user_created   ON public.leads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status         ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_props_user_created   ON public.properties(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appts_user_created   ON public.appointments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appts_lead_id        ON public.appointments(lead_id);
