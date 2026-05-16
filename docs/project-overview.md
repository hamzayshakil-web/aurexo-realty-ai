# Aurexo Realty AI — Project Overview

## What is Aurexo Realty AI?

**Aurexo Realty AI** is a production-grade, AI-powered Real Estate CRM and Automation Platform designed specifically for modern real estate agencies, brokers, and investment teams.

It combines lead management, property portfolio tracking, appointment scheduling, and workflow automation (powered by n8n) into a single, unified platform.

---

## Core Value Proposition

| Problem | Aurexo Solution |
|---|---|
| Leads fall through the cracks | Centralized CRM with status tracking |
| Slow follow-up response times | n8n automations trigger instant responses |
| No-shows on appointments | Automated WhatsApp/email reminders |
| Manual, repetitive agent work | Workflow engine automates routine tasks |
| No visibility into pipeline | Real-time analytics dashboard |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui |
| **State Management** | React useState (local), Zustand (future) |
| **Backend / DB** | Supabase (Phase 2) |
| **AI Features** | OpenAI GPT-4o (Phase 3) |
| **Automation** | n8n (local Docker → cloud, Phase 2) |
| **Auth** | Supabase Auth (Phase 2) |
| **Deployment** | Vercel (planned) |

---

## Folder Structure

```
aurexo-realty-ai/
├── app/
│   ├── (auth)/                     # Auth route group (no shared layout)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/                # Dashboard route group (shared sidebar layout)
│   │   ├── layout.tsx              # Sidebar + Header wrapper
│   │   ├── dashboard/page.tsx      # Main dashboard
│   │   ├── leads/
│   │   │   ├── page.tsx            # Lead list
│   │   │   ├── add/page.tsx        # Add lead form
│   │   │   └── [id]/page.tsx       # Lead detail
│   │   ├── properties/page.tsx     # Property portfolio
│   │   ├── appointments/page.tsx   # Appointments
│   │   ├── automation/page.tsx     # n8n workflows
│   │   └── settings/page.tsx       # User/agency settings
│   ├── layout.tsx                  # Root layout (fonts, metadata)
│   ├── globals.css                 # Global styles + Tailwind
│   └── page.tsx                    # Public landing page
│
├── components/
│   ├── ui/                         # shadcn/ui primitives (auto-generated)
│   ├── layout/
│   │   ├── Sidebar.tsx             # Desktop + mobile drawer sidebar
│   │   └── Header.tsx              # Top navigation bar
│   ├── dashboard/
│   │   ├── StatsCard.tsx           # Metric cards with trend indicators
│   │   ├── RecentLeads.tsx         # Recent leads list widget
│   │   └── ActivityFeed.tsx        # Timeline activity feed
│   └── common/
│       ├── PageHeader.tsx          # Reusable page header
│       ├── EmptyState.tsx          # Empty state with icon + CTA
│       ├── LoadingSkeletons.tsx    # Loading skeleton variants
│       └── StatusBadge.tsx         # Status/priority badge components
│
├── types/
│   └── index.ts                    # All TypeScript interfaces & types
│
├── lib/
│   ├── dummy-data.ts               # Sample data (replaced by Supabase in Phase 2)
│   └── utils.ts                    # shadcn utility (cn helper)
│
├── constants/
│   └── navigation.ts               # Sidebar nav items config
│
├── hooks/
│   └── use-sidebar.ts              # Mobile sidebar state hook
│
└── docs/
    ├── project-overview.md         # This file
    └── future-n8n-local-setup.md  # n8n integration guide
```

---

## Pages & Features

### Public Pages
| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Marketing page with features, testimonials, CTA |
| `/login` | Login | Split-panel auth with Google OAuth |
| `/signup` | Sign Up | Registration with 14-day trial |

### Dashboard Pages
| Route | Page | Description |
|---|---|---|
| `/dashboard` | Dashboard | Stats, pipeline overview, recent leads, activity feed |
| `/leads` | Lead List | Card grid with search, filter by status/priority |
| `/leads/add` | Add Lead | Full lead capture form with tags |
| `/leads/[id]` | Lead Detail | Profile, timeline, quick actions, AI score |
| `/properties` | Properties | Property grid with type/status filters |
| `/appointments` | Appointments | Upcoming & past appointment management |
| `/automation` | Automation | n8n workflow management, run stats |
| `/settings` | Settings | Profile, agency, team, notifications, integrations, security |

---

## Development Phases

### Phase 1 — UI (Current)
- [x] All pages with dummy data
- [x] Responsive design (mobile + desktop)
- [x] Component library setup (shadcn/ui)
- [x] TypeScript types defined
- [x] Folder structure established

### Phase 2 — Backend
- [ ] Supabase project setup
- [ ] Database schema (leads, properties, appointments, automations)
- [ ] Supabase Auth (email + Google)
- [ ] Row-Level Security policies
- [ ] API routes (Next.js Route Handlers)

### Phase 3 — Automation
- [ ] n8n webhook integration
- [ ] Lead capture webhooks
- [ ] Email/WhatsApp automation workflows
- [ ] Appointment reminder automations

### Phase 4 — AI
- [ ] OpenAI integration (lead scoring, reply drafting)
- [ ] Property matching AI
- [ ] Natural language lead search

---

## Design System

**Brand Colors:**
- Gold/Amber: `amber-500` (#f59e0b) — primary brand, CTAs
- Navy/Dark: `foreground` — typography, backgrounds  
- Muted grays: `muted`, `muted-foreground` — secondary elements

**Typography:**
- Font: Geist Sans (Next.js default, Google Fonts)
- Scale: 10px labels → 12px body → 14px standard → 20px+ headings

**Component Principles:**
- Cards with `border-border/50` and `hover:shadow-md` for interactivity
- Amber accent on active/hover states for brand consistency
- Consistent 4-5 padding spacing inside cards
- Status badges use semantic color coding (blue=new, green=won, red=lost)
