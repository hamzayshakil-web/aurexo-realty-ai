# Portfolio Case Study: Aurexo Realty AI

## The Problem

Real estate agents lose leads because follow-ups are slow and manual. A new inquiry comes in at 11 PM; the agent sees it at 9 AM the next day; the client has already signed with a competitor. The typical toolkit is a spreadsheet, a phone, and memory.

## The Solution

Aurexo Realty AI is a CRM purpose-built for real estate agents that automates the first-response pipeline:

- Lead comes in → AI scores and summarises it within 10 seconds
- Agent sees **"Hot lead — AED 4.5M budget — Call within 1 hour"** instead of a raw form submission
- Appointment booked → Google Calendar event created, email confirmation sent, WhatsApp reminder queued
- Every morning → daily pipeline report delivered before the agent starts their day

## Technical Challenges Solved

### 1. Real AI integration, not mocked

Most portfolio projects call `Math.random()` and call it "AI." This project makes real API calls to Groq's llama-3.3-70b-versatile model, which returns structured JSON containing a lead summary, temperature classification, score (1-100), and specific follow-up recommendation. The AI data is written to the database and displayed in the UI.

**Challenge:** n8n's Code node sandbox doesn't expose `fetch`. The solution was to split the Groq call into an HTTP Request node (which makes the actual API call) and a Code node (which parses the response and back-references the original lead data using n8n's `$('NodeName').first().json` syntax).

### 2. Docker networking on Windows

**Challenge:** n8n runs in a Docker container. On Windows, containers cannot reliably reach the host machine's `localhost:3000` — `host.docker.internal` requires firewall exceptions that may not exist.

**Solution:** Instead of n8n making a callback to the app, the "Respond to Webhook" node returns all AI data in the HTTP response body. The app's `sendNewLead()` function awaits this response (20-second timeout) and writes AI fields to Supabase immediately. No callback endpoint needed.

This is a better architecture anyway — it eliminates the need to keep a callback API route secure against arbitrary callers and reduces the number of moving parts.

### 3. Auto-provisioning infrastructure

n8n workflows are typically created by clicking through a visual editor. For a portfolio project (and for any real deployment), this is fragile — the workflow only exists on one machine.

**Solution:** All three workflows are defined as TypeScript objects in `scripts/create-n8n-workflows.ts`. One command (`npm run create:n8n`) creates everything via the n8n Public API. The script validates all required secrets, checks for duplicates, and prints the resulting webhook URLs. New team members or deployments get the full automation stack in under 60 seconds.

### 4. Row-Level Security without sacrificing DX

Every Supabase query is filtered by `auth.uid() = user_id` at the database level (RLS policies), not at the application level. This means a bug in the application code cannot expose one user's data to another.

Server Actions use the user-scoped client; the `/api/reports/daily-stats` endpoint (called by the n8n cron from Docker) uses the service role client — necessary because the request doesn't carry a user session cookie.

## What I'd Add Next (Phase 5)

- **Real Gmail node** — replace the placeholder email Code node with Google OAuth + Gmail send
- **Google Calendar** — OAuth + Calendar create event for each appointment
- **WhatsApp Business API** — via 360dialog or WATI for lead and appointment messages
- **Property matching** — automatically suggest matching listings when a new lead arrives
- **Vercel deployment** — the app is already 100% Vercel-compatible; just add the env vars

## Stack choice rationale

| Choice | Reason |
|--------|--------|
| Next.js App Router | Server Components + Server Actions = no separate API layer needed for CRUD |
| Supabase | Instant Postgres + Auth + RLS; free tier handles a real portfolio project |
| n8n | Self-hosted = zero SaaS cost; visual editor makes automation debuggable; 400+ built-in integrations |
| Groq API | Free tier; OpenAI-compatible; llama-3.3-70b-versatile produces high-quality structured JSON for real estate context |
| Tailwind CSS v4 | Utility-first; shadcn/ui components are unstyled and composable |
