# n8n Workflow Auto-Creation

This document explains how to automatically create the Aurexo Realty AI workflow
inside your local n8n instance using the n8n Public API.

---

## How the local webhook works

When you create a lead in the app:

```
Browser → /leads/add form → Server Action (createLead)
    → 1. Save lead to Supabase
    → 2. POST to N8N_NEW_LEAD_WEBHOOK_URL
         └─ n8n receives the payload
         └─ Runs the workflow (validate → classify → notify)
         └─ Responds { ok: true, temperature, priority_score }
    → 3. App shows "Automation triggered ✓" or "Automation failed"
    → 4. Redirect to /leads/[id]
```

The webhook is **non-blocking** — if n8n is down or the request times out,
the lead is still saved in Supabase. The app shows an amber warning.

---

## Step 1 — Generate an n8n API key

1. Open **http://localhost:5678** in your browser
2. Click your **avatar** (top-right corner)
3. Go to **Settings → API**
4. Click **Create API Key**, give it a name (e.g. "Aurexo Script")
5. Copy the key — it is shown only once

---

## Step 2 — Add the key to .env.local

Open `.env.local` and set:

```env
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-api-key-here
N8N_NEW_LEAD_WEBHOOK_URL=http://localhost:5678/webhook/new-lead
```

> **Security note:** `N8N_API_KEY` has no `NEXT_PUBLIC_` prefix — it is
> server-side only and never sent to the browser.

---

## Step 3 — Run the script

```bash
npm run create:n8n
```

Expected output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Aurexo Realty AI — n8n Workflow Creator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅  Connected to n8n successfully.
✅  No duplicate found. Proceeding.
🚀  Creating workflow via n8n API…

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  Workflow created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Workflow ID   : abc123xyz
  Edit in n8n   : http://localhost:5678/workflow/abc123xyz
  Webhook URL   : http://localhost:5678/webhook/new-lead
```

---

## Step 4 — Confirm the workflow was created

1. Open **http://localhost:5678/home/workflows**
2. You should see **"Aurexo Realty AI - New Lead Automation"** in the list
3. Click it to open and inspect the nodes

The workflow has 9 nodes:

| # | Node | Status |
|---|------|--------|
| 1 | New Lead Received (Webhook) | ✅ Real |
| 2 | Validate Lead Data | ✅ Real |
| 3 | Classify Lead Temperature (Hot/Warm/Cold) | ✅ Real |
| 4 | AI Summary | 🔲 Placeholder — Phase 4 (OpenAI) |
| 5 | Email Agent | 🔲 Placeholder — Phase 5 (Gmail/SMTP) |
| 6 | Google Sheets Logger | 🔲 Placeholder — Phase 5 |
| 7 | WhatsApp Message | 🔲 Placeholder — Phase 5 |
| 8 | Merge Results | ✅ Real |
| 9 | Respond to Webhook | ✅ Real |

---

## Step 5 — Activate the workflow

The workflow is created **inactive** (n8n API cannot set active on creation).

1. Open the workflow in n8n
2. Click the **Inactive** toggle in the top-right → it turns **Active**
3. The webhook URL `http://localhost:5678/webhook/new-lead` is now live

---

## How to test the webhook manually

With the workflow active, test it from a terminal:

```bash
curl -X POST http://localhost:5678/webhook/new-lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-123",
    "name": "Ahmed Al Mansouri",
    "email": "ahmed@test.com",
    "phone": "+971501234567",
    "budget": 3500000,
    "location": "Palm Jumeirah",
    "property_type": "villa",
    "message": "Urgent buyer",
    "status": "new",
    "created_at": "2026-05-16T10:00:00Z"
  }'
```

Expected response:

```json
{
  "ok": true,
  "lead_id": "test-123",
  "temperature": "HOT",
  "priority_score": 90,
  "ai_summary": "Ahmed Al Mansouri is a HOT lead. Interested in: villa in Palm Jumeirah. Budget: AED 3.5M. ..."
}
```

---

## Common errors

### `ECONNREFUSED` — n8n is not running
```
❌  Cannot reach n8n: connect ECONNREFUSED 127.0.0.1:5678
```
**Fix:** Start n8n with `docker compose up -d` or `docker start <container-name>`

---

### `HTTP 401` — Wrong or missing API key
```
❌  POST /workflows → HTTP 401
```
**Fix:** Regenerate the API key in n8n Settings → API and update `.env.local`

---

### `A workflow named "..." already exists`
The script detected a duplicate and stopped. Two options:
- Delete the existing workflow in n8n and re-run
- Skip — the existing workflow is already there

---

### `HTTP 400: request/body/active is read-only`
This means the n8n API version you're running does not allow setting `active`
on creation. The script already handles this by omitting the field.
If you see it again, delete the `active` field from the WORKFLOW object in the script.

---

### Webhook returns 404 (workflow not active)
```json
{ "code": 404, "message": "The requested webhook ... is not registered." }
```
**Fix:** Open the workflow in n8n and click the **Inactive** toggle to activate it.

---

## How to debug failures

1. **n8n execution log** — Click the workflow → **Executions** tab  
   Shows every run with full input/output for each node.

2. **Server logs** — In the terminal running `npm run dev`, look for:
   ```
   [n8n] Webhook delivered successfully → http://localhost:5678/webhook/new-lead
   [n8n] Webhook request failed: Timed out after 5s
   ```

3. **App UI** — The "Add Lead" form shows:
   - Green banner: "Lead saved & automation triggered"
   - Amber banner: "Lead saved — automation not triggered: [reason]"

4. **Re-run a past execution** — n8n → Executions → click any row → "Re-run"

---

## Re-creating the workflow

If you need to recreate it (e.g. after deleting it in n8n):

```bash
npm run create:n8n
```

The script checks for duplicates by name before creating.
