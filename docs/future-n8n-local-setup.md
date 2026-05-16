# n8n Local Docker Setup Guide (Future Integration)

This document explains how Aurexo Realty AI will connect to your locally running **n8n** instance (Docker) when Phase 2 integration begins.

---

## Prerequisites

- Docker Desktop running on your machine
- n8n running at `http://localhost:5678`
- Aurexo dev server running at `http://localhost:3000`

---

## Step 1 — Verify Your n8n Docker Instance

Your n8n is already running via Docker. Verify it:

```bash
docker ps | grep n8n
```

You should see something like:

```
CONTAINER ID   IMAGE        COMMAND     ...   PORTS
abc123def456   n8nio/n8n   "n8n start"  ...   0.0.0.0:5678->5678/tcp
```

Open your browser at `http://localhost:5678` to access the n8n editor.

---

## Step 2 — Configure Environment Variables

Create a `.env.local` file in the project root (never commit this):

```env
# n8n Local Configuration
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
N8N_API_KEY=your_n8n_api_key_here

# Supabase (Phase 2)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (Phase 3)
OPENAI_API_KEY=your_openai_key
```

---

## Step 3 — n8n Webhook Workflows to Create

### 3.1 New Lead Welcome Email

**Trigger:** Webhook (POST)  
**Webhook URL:** `http://localhost:5678/webhook/new-lead-email`  
**Actions:**
1. Receive lead data (name, email, phone, budget)
2. Send branded welcome email via Gmail/SMTP
3. Notify assigned agent via WhatsApp/Slack

**Payload format (from Aurexo):**
```json
{
  "lead_name": "Ahmed Al Mansouri",
  "lead_email": "ahmed@email.com",
  "lead_phone": "+971 50 111 2233",
  "budget": 3500000,
  "interested_in": "Villa",
  "location": "Palm Jumeirah",
  "agent_email": "sarah@aurexo.com",
  "source": "website"
}
```

---

### 3.2 Appointment Reminder (24-hour)

**Trigger:** Schedule (Cron: every day at 9AM)  
**Webhook URL:** `http://localhost:5678/webhook/appointment-reminder`  
**Actions:**
1. Query tomorrow's appointments from Supabase
2. Send WhatsApp message to each lead
3. Send email reminder with appointment details

---

### 3.3 Follow-up Sequence (Unresponsive Leads)

**Trigger:** Webhook (POST from Aurexo)  
**Webhook URL:** `http://localhost:5678/webhook/follow-up-sequence`  
**Sequence:**
1. Day 0: Send "checking in" email
2. Day 2: Send WhatsApp message with property update
3. Day 5: Create internal task for agent to call

---

### 3.4 Website Form → CRM

**Trigger:** Webhook (POST from contact form)  
**Webhook URL:** `http://localhost:5678/webhook/form-capture`  
**Actions:**
1. Parse form data
2. Create lead in Supabase via API
3. Trigger welcome email workflow
4. Notify admin agent

---

### 3.5 Property Match Alert

**Trigger:** Webhook (POST when new property added)  
**Webhook URL:** `http://localhost:5678/webhook/property-match`  
**Actions:**
1. Find leads with matching criteria (budget, location, type)
2. Send property alert emails to matched leads
3. Create follow-up tasks for agents

---

## Step 4 — Connecting Aurexo to n8n (API Call Pattern)

When backend is ready, Aurexo will call n8n webhooks using Next.js Route Handlers:

```typescript
// app/api/automation/trigger/route.ts

export async function POST(request: Request) {
  const body = await request.json();
  const { workflowId, payload } = body;

  const webhookUrls: Record<string, string> = {
    "new-lead-email":        `${process.env.N8N_WEBHOOK_BASE_URL}/new-lead-email`,
    "appointment-reminder":  `${process.env.N8N_WEBHOOK_BASE_URL}/appointment-reminder`,
    "follow-up-sequence":    `${process.env.N8N_WEBHOOK_BASE_URL}/follow-up-sequence`,
  };

  const url = webhookUrls[workflowId];
  if (!url) return Response.json({ error: "Unknown workflow" }, { status: 400 });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return Response.json({ success: response.ok, status: response.status });
}
```

---

## Step 5 — n8n Credentials to Configure

Inside n8n, set up these credential types:

| Credential | Used For |
|---|---|
| **Gmail OAuth2** | Sending emails |
| **WhatsApp Business API** | Sending WhatsApp messages |
| **Supabase** | Reading/writing CRM data |
| **Slack** | Agent notifications (optional) |
| **Twilio** | SMS (optional) |

---

## Step 6 — Testing the Connection

1. Start Aurexo dev server: `npm run dev`
2. Ensure n8n is running at `localhost:5678`
3. In n8n, create a test webhook workflow
4. Activate the workflow (click the toggle in n8n)
5. Trigger from Aurexo's Automation page → "Test Run" button

---

## CORS Note

If you see CORS errors when Aurexo tries to call n8n:

1. Go to your n8n Docker run command
2. Add environment variable: `N8N_CORS_ENABLED=true`
3. Or route calls through Next.js API routes (recommended for production)

---

## Architecture Diagram

```
User Action (Aurexo UI)
        │
        ▼
Next.js Route Handler
(app/api/automation/trigger)
        │
        ▼ HTTP POST
n8n Webhook (localhost:5678)
        │
        ├──► Gmail → Lead Email
        ├──► WhatsApp → Lead Message
        ├──► Supabase → Update CRM
        └──► Slack → Agent Notification
```

---

## n8n Docker Compose Reference

If you need to restart or reconfigure n8n:

```yaml
# docker-compose.yml (reference)
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
      - WEBHOOK_URL=http://localhost:5678/
      - N8N_CORS_ENABLED=true
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

---

## Current Status

| Feature | Status |
|---|---|
| n8n Docker running | ✅ Ready |
| Aurexo UI pages | ✅ Complete |
| Webhook URLs defined (dummy) | ✅ In automation page |
| Backend Route Handlers | ⏳ Phase 2 |
| Supabase integration | ⏳ Phase 2 |
| Live webhook connections | ⏳ Phase 2 |
