# Automation Architecture

## Overview

Aurexo Realty AI uses **n8n** as a self-hosted automation backbone. n8n runs in Docker and receives webhook events from the Next.js app whenever a lead or appointment is created.

## Why n8n?

- Visual, no-code friendly workflow editor (good for non-technical clients)
- Self-hosted: no monthly SaaS cost, full data control
- Hundreds of built-in integrations (Gmail, Google Calendar, WhatsApp, Sheets)
- HTTP Request node enables custom AI API calls (Groq, OpenAI, etc.)
- n8n Public API allows programmatic workflow creation from code

## Workflows

### 1. New Lead Automation

**Trigger:** POST `/webhook/new-lead`  
**Fired by:** `lib/n8n/send-new-lead.ts` after Supabase insert

```
New Lead Received (Webhook)
  └── Validate Lead Data (Code node)
        └── Classify Lead Temperature (Code node)
              └── OpenAI - Call API (HTTP Request → Groq)
                    └── Parse OpenAI Response (Code node)
                          ├── Email Agent (Placeholder)
                          ├── Google Sheets Logger (Placeholder)
                          └── WhatsApp Message (Placeholder)
                                └── Merge Results
                                      └── Respond to Webhook (returns AI data)
```

**AI data returned in response body:**
```json
{
  "ok": true,
  "lead_id": "uuid",
  "ai_summary": "...",
  "lead_temperature": "Hot",
  "lead_score": 87,
  "suggested_follow_up": "..."
}
```

`sendNewLead()` reads this response (20s timeout) and writes all AI fields to Supabase in the same update as `n8n_sent`.

### 2. Appointment Automation

**Trigger:** POST `/webhook/new-appointment`  
**Fired by:** `lib/n8n/send-new-appointment.ts` after appointment creation

```
New Appointment Received (Webhook)
  └── Validate Appointment Data (Code node)
        ├── Google Calendar (Placeholder)
        ├── Email Confirmation (Placeholder)
        └── WhatsApp Reminder (Placeholder)
              └── Merge Appointment Results
                    └── Respond to Appointment Webhook
```

### 3. Daily Report

**Trigger:** Schedule — 9 AM every day

```
Daily 9 AM Trigger (Schedule)
  └── Fetch Lead Stats (HTTP Request → /api/reports/daily-stats)
        └── Build Report (Code node)
              ├── Email Daily Report (Placeholder)
              └── WhatsApp Summary (Placeholder)
                    └── Report Complete (NoOp)
```

## Key Technical Decisions

### Synchronous AI data flow (no callback)

**Problem:** n8n runs in Docker. On Windows, Docker containers cannot reach `localhost:3000` (the host machine's Next.js app). Using `host.docker.internal` may work but requires firewall exceptions and is unreliable.

**Solution:** Instead of n8n calling back into the app, the "Respond to Webhook" node returns the AI data in the HTTP response body. `sendNewLead()` awaits this response (20s timeout) and immediately writes the AI fields to Supabase. No callback URL, no Docker→host networking required.

### n8n Code node limitations

n8n's Code node runs in a sandboxed environment (V8 with `@n8n/vm2`). The `fetch` API is **not available**. HTTP calls from Code nodes must use the dedicated **HTTP Request** node. The Groq API call uses an HTTP Request node; a downstream Code node then reads the response using:

```javascript
const openAI = $input.first().json;  // HTTP Request output
const lead   = $('Classify Lead Temperature').first().json;  // Back-reference to earlier node
```

### Body nesting in n8n webhook nodes

When n8n receives a POST with Content-Type: application/json, the body is nested under `.body`:

```javascript
const raw  = $input.first().json;
const body = (raw.body && typeof raw.body === 'object') ? raw.body : raw;
```

This fallback handles both direct calls and the nested format.

## Security

| Endpoint | Auth mechanism |
|----------|---------------|
| `POST /api/leads/update-ai-summary` | `x-n8n-secret` header matching `N8N_CALLBACK_SECRET` |
| `GET /api/reports/daily-stats` | `x-n8n-secret` header matching `N8N_CALLBACK_SECRET` |
| `POST /api/automation/test-webhook` | Supabase session cookie (user must be logged in) |
| All Supabase queries | Row-Level Security — all rows filtered by `auth.uid() = user_id` |
| Admin Supabase client | Service role key — only used in API routes, never client-side |

## Auto-provisioning

All workflows are defined as TypeScript objects in `scripts/create-n8n-workflows.ts`. Running `npm run create:n8n` creates them via the n8n Public API in seconds. Existing workflows are skipped (delete them in n8n first to recreate).
