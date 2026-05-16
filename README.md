# Aurexo Realty AI

**AI-powered Real Estate CRM SaaS** — a production-style portfolio project demonstrating full-stack engineering with Next.js 15, Supabase, and n8n workflow automation.

---

## What It Does

Aurexo Realty AI is a complete CRM for real estate agents:

- **Lead Management** — Capture, track, and progress leads through a sales pipeline (New → Contacted → Qualified → Proposal → Won/Lost)
- **AI Lead Scoring** — Every new lead is automatically scored, classified (Hot/Warm/Cold), and summarised by Groq AI (llama-3.3-70b-versatile) via an n8n workflow
- **Appointment Booking** — Schedule property viewings and consultations, linked to leads, with n8n automation triggered on creation
- **Automation Dashboard** — Real-time view of connected n8n workflows with live status, webhook URLs, and one-click test buttons
- **Daily Reports** — n8n schedule workflow runs at 9 AM, fetches CRM stats, and generates a daily summary (email + WhatsApp placeholder)

---

## Tech Stack

| Layer          | Technology |
|----------------|------------|
| Framework      | Next.js 15 (App Router, Turbopack) |
| Language       | TypeScript |
| Database       | Supabase (PostgreSQL + Auth + RLS) |
| Styling        | Tailwind CSS v4 + shadcn/ui |
| Automation     | n8n (self-hosted via Docker) |
| AI             | Groq API — llama-3.3-70b-versatile (free tier) |
| Notifications  | Sonner (toast) |
| Runtime        | Node.js / React 19 |

---

## Architecture Overview

```
Browser (Next.js SSR/RSC)
    │
    ├── Server Actions → Supabase DB (CRUD + RLS)
    │       │
    │       └── sendNewLead() / sendNewAppointment()
    │               │
    │               ▼
    │           n8n Webhook (Docker)
    │               │
    │               ├── Code node: validate + classify
    │               ├── HTTP Request → Groq API (AI summary)
    │               ├── Code node: parse AI response
    │               ├── Placeholder: Email / WhatsApp / Sheets
    │               └── Respond to Webhook (returns AI data)
    │                       │
    │                       ▼
    │           Server Action receives AI data
    │           → writes to Supabase in same transaction
    │
    └── /automation page → n8n API (real workflow status)
```

**Key architectural decision:** n8n runs in Docker; instead of a callback (which fails on Windows due to Docker→host networking), the n8n workflow returns AI data synchronously in the HTTP response body. `sendNewLead()` waits (20s timeout) and writes everything to Supabase in one pass.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop (for n8n)
- Supabase account (free tier works)
- Groq API key (free tier: [console.groq.com](https://console.groq.com))

### 1. Clone and install

```bash
git clone <repo-url>
cd aurexo-realty-ai
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run all migrations in order in the SQL editor:
   - `docs/migrations/001-initial-schema.sql`
   - `docs/migrations/002-n8n-status.sql`
   - `docs/migrations/003-ai-fields.sql`
   - `docs/migrations/004-appointments-n8n.sql`
3. Copy your Project URL and anon/service-role keys

### 3. Configure environment

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key
N8N_APP_CALLBACK_URL=http://host.docker.internal:3000
N8N_NEW_LEAD_WEBHOOK_URL=http://localhost:5678/webhook/new-lead
N8N_APPOINTMENT_WEBHOOK_URL=http://localhost:5678/webhook/new-appointment

SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
N8N_CALLBACK_SECRET=your-random-secret
GROQ_API_KEY=gsk_...
```

### 4. Start n8n

```bash
docker compose up -d
```

Open [http://localhost:5678](http://localhost:5678), create an account, then generate an API key in **Settings → API**.

### 5. Create n8n workflows

```bash
npm run create:n8n
```

This creates all three workflows via the n8n API:
- **New Lead Automation** — Groq AI scoring + classification
- **Appointment Automation** — Calendar, email, WhatsApp placeholders
- **Daily Report** — 9 AM schedule, pipeline stats

Then open n8n and **activate each workflow** (toggle switch).

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
aurexo-realty-ai/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── leads/            # Lead CRUD + detail view
│   │   ├── appointments/     # Appointment scheduling
│   │   ├── automation/       # n8n status dashboard
│   │   ├── dashboard/        # Stats overview
│   │   └── properties/       # Property listings (static)
│   ├── api/
│   │   ├── leads/update-ai-summary/  # n8n AI callback (unused — kept for reference)
│   │   ├── automation/test-webhook/  # Test n8n webhooks from UI
│   │   └── reports/daily-stats/      # Daily report data endpoint
│   ├── login/ signup/ auth/  # Supabase auth pages
│   └── (auth)/               # Public auth layout
├── components/
│   ├── appointments/         # AppointmentFormClient
│   ├── automation/           # AutomationActions (client)
│   ├── common/               # PageHeader, StatusBadge, etc.
│   ├── leads/                # LeadFormClient, LeadCard
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── actions/              # Server Actions (leads, appointments)
│   ├── n8n/                  # Webhook senders + n8n API client
│   ├── queries/              # Supabase read queries
│   └── supabase/             # Supabase client factories
├── scripts/
│   └── create-n8n-workflows.ts  # Auto-creates all n8n workflows
├── docs/
│   ├── migrations/           # SQL migrations
│   └── *.md                  # Setup guides
└── types/
    ├── index.ts              # Domain types
    └── database.ts           # Supabase row types
```

---

## Available Scripts

| Command               | Description |
|-----------------------|-------------|
| `npm run dev`         | Start development server (Turbopack) |
| `npm run build`       | Production build |
| `npm run create:n8n`  | Create all n8n workflows via API |
| `npm run lint`        | ESLint |

---

## Portfolio Notes

This project was built to demonstrate:

1. **Full-stack TypeScript** — Server Components, Server Actions, type-safe DB access
2. **Real AI integration** — Groq API producing structured JSON (lead scores, summaries, follow-up recommendations)
3. **Event-driven architecture** — n8n as the automation backbone, decoupled from the app
4. **Production patterns** — Row-Level Security, service role admin client, fire-and-forget webhooks with timeout handling
5. **Developer experience** — Auto-provisioning script creates all n8n workflows from code

See `docs/automation-architecture.md` for a deeper technical walkthrough.
