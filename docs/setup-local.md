# Local Development Setup

## Prerequisites

- Node.js 20+
- Docker Desktop (running)
- Supabase account
- Groq API key (free: console.groq.com)

## Step-by-step

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase admin (server-side only)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# n8n
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key
N8N_APP_CALLBACK_URL=http://host.docker.internal:3000
N8N_NEW_LEAD_WEBHOOK_URL=http://localhost:5678/webhook/new-lead
N8N_APPOINTMENT_WEBHOOK_URL=http://localhost:5678/webhook/new-appointment
N8N_CALLBACK_SECRET=change-me-to-a-random-string

# AI
GROQ_API_KEY=gsk_...
```

### 3. Supabase database setup

Run each migration in the Supabase SQL editor (or via the CLI):

1. `docs/migrations/001-initial-schema.sql`
2. `docs/migrations/002-n8n-status.sql`
3. `docs/migrations/003-ai-fields.sql`
4. `docs/migrations/004-appointments-n8n.sql`

Enable email auth in **Authentication → Providers → Email**.

### 4. Start n8n

```bash
docker compose up -d
```

- Open [http://localhost:5678](http://localhost:5678) and create your admin account
- Go to **Settings → API → Create API key** and copy it into `.env.local` as `N8N_API_KEY`

### 5. Create n8n workflows

```bash
npm run create:n8n
```

Output will list the created workflow IDs. Open each one in n8n and **activate it** (blue toggle in the top-right).

### 6. Start the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) → sign up → start adding leads.

## Testing the AI pipeline

1. Create a lead with a budget over 3,000,000 AED
2. Watch the toast: "Lead created & automation triggered"
3. Open the lead detail — the AI Summary card should populate within ~5-10 seconds

## Common issues

| Problem | Fix |
|---------|-----|
| `N8N_API_KEY not set` | Re-read `.env.local` — restart `npm run dev` after changes |
| Webhook returns `skipped` | `N8N_NEW_LEAD_WEBHOOK_URL` not set or workflow not active in n8n |
| AI fields stay NULL | Check n8n execution log for the failed run; usually a Groq API key issue |
| n8n can't reach app | This is expected on Windows — the synchronous response approach doesn't need a callback |
| Docker `ECONNREFUSED` | Run `docker compose up -d` and wait 30 seconds |
