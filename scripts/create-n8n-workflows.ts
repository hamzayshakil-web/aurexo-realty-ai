#!/usr/bin/env tsx
/**
 * scripts/create-n8n-workflows.ts
 *
 * Creates the Aurexo Realty AI workflow in your local n8n instance
 * via the n8n Public API.
 *
 * Run:  npm run create:n8n
 * Docs: docs/n8n-api-auto-create.md
 */

import { readFileSync } from "fs";
import { join } from "path";

// ─── Load .env.local ──────────────────────────────────────────────────────────
// We parse the file manually so no extra packages (dotenv) are needed.
function loadEnvFile(): void {
  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const raw of content.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim();
      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch {
    // .env.local missing — rely on shell environment variables
  }
}

loadEnvFile();

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL         = (process.env.N8N_BASE_URL ?? "http://localhost:5678").replace(/\/$/, "");
const API_KEY          = process.env.N8N_API_KEY ?? "";
const APP_CALLBACK_URL = (process.env.N8N_APP_CALLBACK_URL ?? "http://host.docker.internal:3000").replace(/\/$/, "");
const CALLBACK_SECRET  = process.env.N8N_CALLBACK_SECRET ?? "";
const GROQ_API_KEY     = process.env.GROQ_API_KEY ?? "";
const TELEGRAM_TOKEN   = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "";
const RESEND_API_KEY   = process.env.RESEND_API_KEY ?? "";
const RESEND_FROM      = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const RESEND_TO        = process.env.RESEND_TO_EMAIL ?? "";

if (!API_KEY) {
  console.error("\n❌  N8N_API_KEY is not set.");
  console.error("    Add it to .env.local:  N8N_API_KEY=your-key-here");
  console.error("    See docs/n8n-api-auto-create.md for how to generate a key.\n");
  process.exit(1);
}

if (!CALLBACK_SECRET) {
  console.error("\n❌  N8N_CALLBACK_SECRET is not set.");
  console.error("    Add it to .env.local:  N8N_CALLBACK_SECRET=your-secret-here\n");
  process.exit(1);
}

if (!GROQ_API_KEY) {
  console.error("\n❌  GROQ_API_KEY is not set.");
  console.error("    Add it to .env.local:  GROQ_API_KEY=gsk_...\n");
  process.exit(1);
}

if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error("\n❌  TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set.");
  console.error("    Add them to .env.local\n");
  process.exit(1);
}

if (!RESEND_API_KEY || !RESEND_TO) {
  console.error("\n❌  RESEND_API_KEY or RESEND_TO_EMAIL is not set.");
  console.error("    Add them to .env.local\n");
  process.exit(1);
}

// ─── Workflow definition ──────────────────────────────────────────────────────
const WORKFLOW_NAME = "Aurexo Realty AI - New Lead Automation";

const WORKFLOW = {
  name: WORKFLOW_NAME,
  settings: { executionOrder: "v1" },

  // ── Nodes ──────────────────────────────────────────────────────────────────
  nodes: [
    // 1 · Webhook trigger
    {
      id: "arx-node-001",
      name: "New Lead Received",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [240, 300],
      parameters: {
        path: "new-lead",
        httpMethod: "POST",
        responseMode: "responseNode",
        options: {},
      },
    },

    // 2 · Validate & normalise payload
    {
      id: "arx-node-002",
      name: "Validate Lead Data",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [460, 300],
      parameters: {
        jsCode: `
// n8n wraps the POST body under .body — fall back to root for flexibility
const raw  = $input.first().json;
const body = (raw.body && typeof raw.body === 'object') ? raw.body : raw;

// Required field guards
if (!body.lead_id) throw new Error('Missing field: lead_id');
if (!body.name)    throw new Error('Missing field: name');

return {
  lead_id:       body.lead_id,
  name:          body.name,
  email:         body.email         ?? null,
  phone:         body.phone         ?? null,
  budget:        body.budget        ?? null,
  location:      body.location      ?? null,
  property_type: body.property_type ?? null,
  message:       body.message       ?? null,
  status:        body.status        ?? 'new',
  created_at:    body.created_at    ?? new Date().toISOString(),
  received_at:   new Date().toISOString(),
};
`.trim(),
      },
    },

    // 3 · Hot / Warm / Cold classification
    {
      id: "arx-node-003",
      name: "Classify Lead Temperature",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [680, 300],
      parameters: {
        jsCode: `
const lead   = $input.first().json;
const budget = Number(lead.budget) || 0;

let temperature, priority_score, agent_action;

if (budget >= 3_000_000) {
  temperature    = 'HOT';
  priority_score = 90;
  agent_action   = 'Call within 1 hour';
} else if (budget >= 1_000_000) {
  temperature    = 'WARM';
  priority_score = 60;
  agent_action   = 'Call within 24 hours';
} else {
  temperature    = 'COLD';
  priority_score = 30;
  agent_action   = 'Send email within 48 hours';
}

return { ...lead, temperature, priority_score, agent_action };
`.trim(),
      },
    },

    // 4 · OpenAI HTTP Request — call the chat completions API
    {
      id: "arx-node-004",
      name: "OpenAI - Call API",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [900, 300],
      parameters: {
        method: "POST",
        url: "https://api.groq.com/openai/v1/chat/completions",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: "Authorization", value: `Bearer ${GROQ_API_KEY}` },
          ],
        },
        sendBody: true,
        contentType: "raw",
        rawContentType: "application/json",
        body: `={{ JSON.stringify({ model: 'llama-3.3-70b-versatile', temperature: 0.3, max_tokens: 500, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'You are a real estate CRM assistant. Respond with ONLY valid JSON, no markdown.' }, { role: 'user', content: 'Analyse this real estate lead and return a JSON object.\\n\\nLead:\\n- Name: ' + $json.name + '\\n- Budget: ' + ($json.budget ? 'AED ' + $json.budget : 'not specified') + '\\n- Property: ' + ($json.property_type || 'any') + ' in ' + ($json.location || 'Dubai') + '\\n- Status: ' + $json.status + '\\n- Message: ' + ($json.message || 'none') + '\\n- Classification: ' + $json.temperature + ' (score: ' + $json.priority_score + '/100)\\n- Recommended action: ' + $json.agent_action + '\\n\\nReturn ONLY this JSON structure:\\n{\\n  \\"ai_summary\\": \\"2-3 sentence professional summary for the agent\\",\\n  \\"lead_temperature\\": \\"Hot\\",\\n  \\"lead_score\\": 85,\\n  \\"suggested_follow_up\\": \\"specific action with timeline\\"\\n}\\n\\nRules: lead_temperature must be Hot, Warm, or Cold. lead_score must be 1-100.' }] }) }}`,
        options: {},
      },
    },

    // 5 · Parse OpenAI response and merge with lead data
    {
      id: "arx-node-005",
      name: "Parse OpenAI Response",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1120, 300],
      parameters: {
        jsCode: `
const openAI = $input.first().json;
const lead   = $('Classify Lead Temperature').first().json;

let parsed;
try {
  parsed = JSON.parse(openAI.choices[0].message.content);
} catch (_) {
  const temp = lead.temperature === 'HOT' ? 'Hot' : lead.temperature === 'WARM' ? 'Warm' : 'Cold';
  parsed = {
    ai_summary: lead.name + ' is a ' + temp + ' lead interested in ' + (lead.property_type || 'property') + ' in ' + (lead.location || 'Dubai') + '. Budget: ' + (lead.budget ? 'AED ' + lead.budget : 'not specified') + '. ' + lead.agent_action + '.',
    lead_temperature: temp,
    lead_score: lead.priority_score,
    suggested_follow_up: lead.agent_action,
  };
}

return {
  ...lead,
  ai_summary:          parsed.ai_summary          ?? null,
  lead_temperature:    parsed.lead_temperature    ?? null,
  lead_score:          Number(parsed.lead_score)  || null,
  suggested_follow_up: parsed.suggested_follow_up ?? null,
};
`.trim(),
      },
    },

    // 6 · Respond — linear step, fires before any side-effects
    {
      id: "arx-node-006",
      name: "Respond to Webhook",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1,
      position: [1340, 300],
      parameters: {
        respondWith: "json",
        responseBody: '={{ JSON.stringify({ ok: true, lead_id: $json.lead_id, ai_summary: $json.ai_summary, lead_temperature: $json.lead_temperature, lead_score: $json.lead_score, suggested_follow_up: $json.suggested_follow_up }) }}',
        options: { responseCode: 200 },
      },
    },

    // 7 · Email — real Resend notification (runs AFTER Respond, failure is safe)
    {
      id: "arx-node-007",
      name: "Email - New Lead Alert",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1560, 160],
      continueOnFail: true,
      parameters: {
        method: "POST",
        url: "https://api.resend.com/emails",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: "Authorization", value: `Bearer ${RESEND_API_KEY}` },
          ],
        },
        sendBody: true,
        contentType: "raw",
        rawContentType: "application/json",
        body: `={{ JSON.stringify({
  from: "${RESEND_FROM}",
  to: [$json.notification_email || "${RESEND_TO}"],
  subject: ($json.lead_temperature === 'Hot' ? '🔥' : $json.lead_temperature === 'Warm' ? '🌤' : '❄️') + ' New ' + $json.lead_temperature + ' Lead — ' + $json.name + ' (' + $json.lead_score + '/100)',
  html:
    '<div style="font-family:sans-serif;max-width:600px;margin:auto">' +
    '<h2 style="color:#1a1a1a">' + ($json.lead_temperature === 'Hot' ? '🔥' : $json.lead_temperature === 'Warm' ? '🌤' : '❄️') + ' ' + $json.name + '</h2>' +
    '<table style="border-collapse:collapse;width:100%">' +
    '<tr><td style="padding:6px;color:#666">Score</td><td style="padding:6px;font-weight:bold">' + $json.lead_score + ' / 100</td></tr>' +
    ($json.phone  ? '<tr><td style="padding:6px;color:#666">Phone</td><td style="padding:6px">' + $json.phone + '</td></tr>' : '') +
    ($json.email  ? '<tr><td style="padding:6px;color:#666">Email</td><td style="padding:6px">' + $json.email + '</td></tr>' : '') +
    ($json.budget ? '<tr><td style="padding:6px;color:#666">Budget</td><td style="padding:6px">AED ' + Number($json.budget).toLocaleString() + '</td></tr>' : '') +
    ($json.location ? '<tr><td style="padding:6px;color:#666">Location</td><td style="padding:6px">' + $json.location + '</td></tr>' : '') +
    ($json.property_type ? '<tr><td style="padding:6px;color:#666">Property</td><td style="padding:6px">' + $json.property_type + '</td></tr>' : '') +
    '</table>' +
    '<p style="background:#f4f4f4;padding:12px;border-radius:6px;margin-top:16px"><b>AI Summary:</b><br>' + ($json.ai_summary || 'N/A') + '</p>' +
    '<p style="color:#555"><i>Recommended: ' + ($json.suggested_follow_up || '') + '</i></p>' +
    '</div>'
}) }}`,
        options: {},
      },
    },

    // 7b · Google Sheets logger — placeholder
    {
      id: "arx-node-007b",
      name: "Google Sheets Logger (Placeholder)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1560, 320],
      continueOnFail: true,
      parameters: {
        jsCode: `
const lead = $input.first().json;
console.log('[Sheets] Would log lead ' + lead.lead_id + ' to CRM tracker spreadsheet');
return { ...lead, sheets_logged: false };
`.trim(),
      },
    },

    // 7c · Telegram — runs after Respond (failure is safe, short timeout)
    {
      id: "arx-node-007c",
      name: "Telegram - New Lead Alert",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1560, 480],
      continueOnFail: true,
      parameters: {
        method: "POST",
        url: `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        sendBody: true,
        contentType: "raw",
        rawContentType: "application/json",
        body: `={{ JSON.stringify({
  chat_id: $json.telegram_chat_id || "${TELEGRAM_CHAT_ID}",
  parse_mode: "HTML",
  text:
    ($json.lead_temperature === 'Hot' ? '🔥' : $json.lead_temperature === 'Warm' ? '🌤' : '❄️') +
    ' <b>New ' + $json.lead_temperature + ' Lead — Aurexo Realty</b>\\n\\n' +
    '👤 <b>' + $json.name + '</b>\\n' +
    ($json.phone    ? '📱 ' + $json.phone + '\\n' : '') +
    ($json.email    ? '📧 ' + $json.email + '\\n' : '') +
    ($json.budget   ? '💰 AED ' + Number($json.budget).toLocaleString() + '\\n' : '') +
    ($json.location ? '📍 ' + $json.location + '\\n' : '') +
    '\\n⭐ <b>Score: ' + $json.lead_score + '/100</b>\\n' +
    '\\n📋 ' + ($json.ai_summary || 'No AI summary') + '\\n' +
    '\\n🎯 <i>' + ($json.suggested_follow_up || '') + '</i>'
}) }}`,
        options: { timeout: 8000 },
      },
    },
  ],

  // ── Connections ─────────────────────────────────────────────────────────────
  connections: {
    "New Lead Received": {
      main: [[{ node: "Validate Lead Data", type: "main", index: 0 }]],
    },
    "Validate Lead Data": {
      main: [[{ node: "Classify Lead Temperature", type: "main", index: 0 }]],
    },
    "Classify Lead Temperature": {
      main: [[{ node: "OpenAI - Call API", type: "main", index: 0 }]],
    },
    "OpenAI - Call API": {
      main: [[{ node: "Parse OpenAI Response", type: "main", index: 0 }]],
    },
    // Respond fires first (linear), then side-effects fan out from it
    "Parse OpenAI Response": {
      main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]],
    },
    "Respond to Webhook": {
      main: [[
        { node: "Email - New Lead Alert",             type: "main", index: 0 },
        { node: "Google Sheets Logger (Placeholder)", type: "main", index: 0 },
        { node: "Telegram - New Lead Alert",          type: "main", index: 0 },
      ]],
    },
  },
};

// ─── Appointment Workflow ────────────────────────────────────────────────────
const APPT_WORKFLOW_NAME = "Aurexo Realty AI - Appointment Automation";

const APPT_WORKFLOW = {
  name: APPT_WORKFLOW_NAME,
  settings: { executionOrder: "v1" },

  nodes: [
    // 1 · Webhook trigger
    {
      id: "apt-node-001",
      name: "New Appointment Received",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [240, 300],
      parameters: {
        path: "new-appointment",
        httpMethod: "POST",
        responseMode: "responseNode",
        options: {},
      },
    },

    // 2 · Validate payload
    {
      id: "apt-node-002",
      name: "Validate Appointment Data",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [460, 300],
      parameters: {
        jsCode: `
const raw  = $input.first().json;
const body = (raw.body && typeof raw.body === 'object') ? raw.body : raw;

if (!body.appointment_id) throw new Error('Missing field: appointment_id');
if (!body.title)          throw new Error('Missing field: title');
if (!body.appointment_date) throw new Error('Missing field: appointment_date');

return {
  appointment_id:   body.appointment_id,
  lead_id:          body.lead_id          ?? null,
  lead_name:        body.lead_name        ?? 'Unknown',
  phone:            body.phone            ?? null,
  email:            body.email            ?? null,
  title:            body.title,
  appointment_date: body.appointment_date,
  notes:            body.notes            ?? null,
  status:           body.status           ?? 'scheduled',
  received_at:      new Date().toISOString(),
};
`.trim(),
      },
    },

    // 3 · Google Calendar — placeholder
    {
      id: "apt-node-003",
      name: "Google Calendar (Placeholder)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [680, 160],
      parameters: {
        jsCode: `
// ─── Phase 5: Replace with Google Calendar node ─────────────────────────────
//   Action : Create Event
//   Title  : appointment.title
//   Start  : appointment.appointment_date
//   Duration: 60 minutes (default)
//   Description: appointment.notes
// ────────────────────────────────────────────────────────────────────────────

const appt = $input.first().json;
console.log('[Calendar] Would create event: ' + appt.title + ' on ' + appt.appointment_date);
return { ...appt, calendar_created: false };
`.trim(),
      },
    },

    // 4 · Respond — fires immediately after validation, before side-effects
    {
      id: "apt-node-004",
      name: "Respond to Appointment Webhook",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1,
      position: [680, 300],
      parameters: {
        respondWith: "json",
        responseBody: '={{ JSON.stringify({ ok: true, appointment_id: $json.appointment_id, status: "processed" }) }}',
        options: { responseCode: 200 },
      },
    },

    // 5 · Google Calendar — placeholder (runs after Respond)
    {
      id: "apt-node-005",
      name: "Google Calendar (Placeholder)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [900, 160],
      continueOnFail: true,
      parameters: {
        jsCode: `
const appt = $input.first().json;
console.log('[Calendar] Would create event: ' + appt.title + ' on ' + appt.appointment_date);
return { ...appt, calendar_created: false };
`.trim(),
      },
    },

    // 6 · Email — real Resend appointment notification (runs after Respond)
    {
      id: "apt-node-006",
      name: "Email - Appointment Confirmation",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [900, 300],
      continueOnFail: true,
      parameters: {
        method: "POST",
        url: "https://api.resend.com/emails",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: "Authorization", value: `Bearer ${RESEND_API_KEY}` },
          ],
        },
        sendBody: true,
        contentType: "raw",
        rawContentType: "application/json",
        body: `={{ JSON.stringify({
  from: "${RESEND_FROM}",
  to: [$json.notification_email || "${RESEND_TO}"],
  subject: '📅 Appointment Booked — ' + $json.title,
  html:
    '<div style="font-family:sans-serif;max-width:600px;margin:auto">' +
    '<h2 style="color:#1a1a1a">📅 New Appointment — Aurexo Realty</h2>' +
    '<table style="border-collapse:collapse;width:100%">' +
    '<tr><td style="padding:6px;color:#666">Title</td><td style="padding:6px;font-weight:bold">' + $json.title + '</td></tr>' +
    '<tr><td style="padding:6px;color:#666">Client</td><td style="padding:6px">' + $json.lead_name + '</td></tr>' +
    '<tr><td style="padding:6px;color:#666">Date / Time</td><td style="padding:6px">' + new Date($json.appointment_date).toLocaleString("en-GB") + '</td></tr>' +
    ($json.phone ? '<tr><td style="padding:6px;color:#666">Phone</td><td style="padding:6px">' + $json.phone + '</td></tr>' : '') +
    ($json.email ? '<tr><td style="padding:6px;color:#666">Email</td><td style="padding:6px">' + $json.email + '</td></tr>' : '') +
    ($json.notes ? '<tr><td style="padding:6px;color:#666">Notes</td><td style="padding:6px">' + $json.notes + '</td></tr>' : '') +
    '<tr><td style="padding:6px;color:#666">Status</td><td style="padding:6px">' + $json.status + '</td></tr>' +
    '</table></div>'
}) }}`,
        options: {},
      },
    },

    // 7 · Telegram — appointment alert (runs after Respond, failure safe)
    {
      id: "apt-node-007",
      name: "Telegram - Appointment Alert",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [900, 440],
      continueOnFail: true,
      parameters: {
        method: "POST",
        url: `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        sendBody: true,
        contentType: "raw",
        rawContentType: "application/json",
        body: `={{ JSON.stringify({
  chat_id: $json.telegram_chat_id || "${TELEGRAM_CHAT_ID}",
  parse_mode: "HTML",
  text:
    '📅 <b>New Appointment Booked — Aurexo Realty</b>\\n\\n' +
    '📝 <b>' + $json.title + '</b>\\n' +
    '👤 ' + $json.lead_name + '\\n' +
    ($json.phone ? '📱 ' + $json.phone + '\\n' : '') +
    ($json.email ? '📧 ' + $json.email + '\\n' : '') +
    '🗓 ' + new Date($json.appointment_date).toLocaleString('en-GB') + '\\n' +
    ($json.notes ? '\\n📋 ' + $json.notes : '') +
    '\\n\\n✅ Status: ' + $json.status
}) }}`,
        options: { timeout: 8000 },
      },
    },
  ],

  connections: {
    "New Appointment Received": {
      main: [[{ node: "Validate Appointment Data", type: "main", index: 0 }]],
    },
    // Respond fires linearly, then side-effects fan out from it
    "Validate Appointment Data": {
      main: [[{ node: "Respond to Appointment Webhook", type: "main", index: 0 }]],
    },
    "Respond to Appointment Webhook": {
      main: [[
        { node: "Google Calendar (Placeholder)",    type: "main", index: 0 },
        { node: "Email - Appointment Confirmation", type: "main", index: 0 },
        { node: "Telegram - Appointment Alert",     type: "main", index: 0 },
      ]],
    },
  },
};

// ─── Daily Report Workflow ────────────────────────────────────────────────────
const REPORT_WORKFLOW_NAME = "Aurexo Realty AI - Daily Report";

const REPORT_WORKFLOW = {
  name: REPORT_WORKFLOW_NAME,
  settings: { executionOrder: "v1" },

  nodes: [
    // 1 · Schedule: 9 AM every day
    {
      id: "rep-node-001",
      name: "Daily 9 AM Trigger",
      type: "n8n-nodes-base.scheduleTrigger",
      typeVersion: 1.2,
      position: [240, 300],
      parameters: {
        rule: {
          interval: [{ field: "hours", hoursInterval: 24, triggerAtHour: 9 }],
        },
      },
    },

    // 2 · Fetch lead stats from Supabase REST
    {
      id: "rep-node-002",
      name: "Fetch Lead Stats",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [460, 300],
      parameters: {
        method: "GET",
        url: `${APP_CALLBACK_URL}/api/reports/daily-stats`,
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: "x-n8n-secret", value: CALLBACK_SECRET },
          ],
        },
        options: {},
      },
    },

    // 3 · Build report summary
    {
      id: "rep-node-003",
      name: "Build Report",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [680, 300],
      parameters: {
        jsCode: `
const raw   = $input.first().json;
const stats = (raw.body && typeof raw.body === 'object') ? raw.body : raw;

const today    = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const newLeads = stats.new_leads       ?? 0;
const total    = stats.total_leads     ?? 0;
const hot      = stats.hot_leads       ?? 0;
const appts    = stats.appointments_today ?? 0;

const report = [
  '📊 Aurexo Realty AI — Daily Report',
  '═══════════════════════════════════',
  'Date   : ' + today,
  '',
  '🔥 New leads today     : ' + newLeads,
  '👥 Total leads         : ' + total,
  '🌡️  Hot leads (≥80)    : ' + hot,
  '📅 Appointments today  : ' + appts,
  '',
  '─── Lead Pipeline ─────────────────',
  '  New         : ' + (stats.status_new       ?? 0),
  '  Contacted   : ' + (stats.status_contacted ?? 0),
  '  Qualified   : ' + (stats.status_qualified ?? 0),
  '  Proposal    : ' + (stats.status_proposal  ?? 0),
  '  Won         : ' + (stats.status_won       ?? 0),
  '  Lost        : ' + (stats.status_lost      ?? 0),
].join('\\n');

return { report, today, stats };
`.trim(),
      },
    },

    // 4 · Email — real Resend daily report (failure safe)
    {
      id: "rep-node-004",
      name: "Email - Daily Report",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [900, 160],
      continueOnFail: true,
      parameters: {
        method: "POST",
        url: "https://api.resend.com/emails",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: "Authorization", value: `Bearer ${RESEND_API_KEY}` },
          ],
        },
        sendBody: true,
        contentType: "raw",
        rawContentType: "application/json",
        body: `={{ JSON.stringify({
  from: "${RESEND_FROM}",
  to: ["${RESEND_TO}"],
  subject: '📊 Daily CRM Report — ' + $json.today,
  html:
    '<div style="font-family:sans-serif;max-width:600px;margin:auto">' +
    '<h2 style="color:#1a1a1a">📊 Aurexo Realty AI — Daily Report</h2>' +
    '<p style="color:#666">' + $json.today + '</p>' +
    '<table style="border-collapse:collapse;width:100%;margin-bottom:16px">' +
    '<tr style="background:#f9f9f9"><td style="padding:8px;color:#666">🔥 New leads today</td><td style="padding:8px;font-weight:bold">' + ($json.stats.new_leads ?? 0) + '</td></tr>' +
    '<tr><td style="padding:8px;color:#666">👥 Total leads</td><td style="padding:8px;font-weight:bold">' + ($json.stats.total_leads ?? 0) + '</td></tr>' +
    '<tr style="background:#f9f9f9"><td style="padding:8px;color:#666">🌡️ Hot leads (score ≥80)</td><td style="padding:8px;font-weight:bold">' + ($json.stats.hot_leads ?? 0) + '</td></tr>' +
    '<tr><td style="padding:8px;color:#666">📅 Appointments today</td><td style="padding:8px;font-weight:bold">' + ($json.stats.appointments_today ?? 0) + '</td></tr>' +
    '</table>' +
    '<h3 style="color:#333">Pipeline</h3>' +
    '<table style="border-collapse:collapse;width:100%">' +
    '<tr><td style="padding:6px;color:#666">New</td><td style="padding:6px">' + ($json.stats.status_new ?? 0) + '</td><td style="padding:6px;color:#666">Contacted</td><td style="padding:6px">' + ($json.stats.status_contacted ?? 0) + '</td></tr>' +
    '<tr style="background:#f9f9f9"><td style="padding:6px;color:#666">Qualified</td><td style="padding:6px">' + ($json.stats.status_qualified ?? 0) + '</td><td style="padding:6px;color:#666">Proposal</td><td style="padding:6px">' + ($json.stats.status_proposal ?? 0) + '</td></tr>' +
    '<tr><td style="padding:6px;color:#666">Won</td><td style="padding:6px;color:green;font-weight:bold">' + ($json.stats.status_won ?? 0) + '</td><td style="padding:6px;color:#666">Lost</td><td style="padding:6px;color:red">' + ($json.stats.status_lost ?? 0) + '</td></tr>' +
    '</table>' +
    '</div>'
}) }}`,
        options: {},
      },
    },

    // 5 · Telegram — real daily report to agent (failure safe)
    {
      id: "rep-node-005",
      name: "Telegram - Daily Report",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [900, 440],
      continueOnFail: true,
      parameters: {
        method: "POST",
        url: `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        sendBody: true,
        contentType: "raw",
        rawContentType: "application/json",
        body: `={{ JSON.stringify({
  chat_id: "${TELEGRAM_CHAT_ID}",
  parse_mode: "HTML",
  text:
    '📊 <b>Daily CRM Report — Aurexo Realty</b>\\n' +
    '<i>' + $json.today + '</i>\\n\\n' +
    '🔥 New leads today: <b>' + ($json.stats.new_leads ?? 0) + '</b>\\n' +
    '👥 Total leads: <b>' + ($json.stats.total_leads ?? 0) + '</b>\\n' +
    '🌡 Hot leads (score ≥80): <b>' + ($json.stats.hot_leads ?? 0) + '</b>\\n' +
    '📅 Appointments today: <b>' + ($json.stats.appointments_today ?? 0) + '</b>\\n\\n' +
    '─── Pipeline ───\\n' +
    '  New: '       + ($json.stats.status_new       ?? 0) + '  |  ' +
    'Contacted: '   + ($json.stats.status_contacted ?? 0) + '\\n' +
    '  Qualified: ' + ($json.stats.status_qualified ?? 0) + '  |  ' +
    'Proposal: '    + ($json.stats.status_proposal  ?? 0) + '\\n' +
    '  Won: '       + ($json.stats.status_won       ?? 0) + '  |  ' +
    'Lost: '        + ($json.stats.status_lost      ?? 0)
}) }}`,
        options: { timeout: 8000 },
      },
    },

    // 6 · Done
    {
      id: "rep-node-006",
      name: "Report Complete",
      type: "n8n-nodes-base.noOp",
      typeVersion: 1,
      position: [1120, 300],
      parameters: {},
    },
  ],

  connections: {
    "Daily 9 AM Trigger": {
      main: [[{ node: "Fetch Lead Stats", type: "main", index: 0 }]],
    },
    "Fetch Lead Stats": {
      main: [[{ node: "Build Report", type: "main", index: 0 }]],
    },
    "Build Report": {
      main: [[
        { node: "Email - Daily Report",   type: "main", index: 0 },
        { node: "Telegram - Daily Report", type: "main", index: 0 },
      ]],
    },
    "Email - Daily Report": {
      main: [[{ node: "Report Complete", type: "main", index: 0 }]],
    },
    "Telegram - Daily Report": {
      main: [[{ node: "Report Complete", type: "main", index: 0 }]],
    },
  },
};

// ─── API helpers ──────────────────────────────────────────────────────────────
const HEADERS = {
  "Content-Type": "application/json",
  "X-N8N-API-KEY": API_KEY,
};

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} → HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function createOrSkipWorkflow(
  name: string,
  definition: unknown,
  existing: Array<{ id: string; name: string }>
): Promise<{ id: string; name: string } | null> {
  const dup = existing.find((w) => w.name === name);
  if (dup) {
    console.log(`⚠️   "${name}" already exists (ID: ${dup.id}) — skipping.`);
    return null;
  }
  console.log(`🚀  Creating "${name}"…`);
  const created = await apiPost<{ id: string; name: string }>("/workflows", definition);
  console.log(`✅  Created  "${created.name}" — ID: ${created.id}`);
  return created;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Aurexo Realty AI — n8n Workflow Creator");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`  n8n URL : ${BASE_URL}\n`);

  // 1 · Check n8n is reachable
  console.log("⏳  Checking n8n connection…");
  try {
    await apiGet("/workflows?limit=1");
    console.log("✅  Connected to n8n successfully.\n");
  } catch (err) {
    console.error("❌  Cannot reach n8n:", (err as Error).message);
    console.error("    Make sure Docker is running and n8n is on port 5678.\n");
    process.exit(1);
  }

  // 2 · Fetch all existing workflows once
  console.log("🔍  Checking for existing workflows…");
  const existing = await apiGet<{ data: Array<{ id: string; name: string }> }>("/workflows?limit=100");
  console.log(`    Found ${existing.data.length} existing workflow(s).\n`);

  // 3 · Create all three workflows
  const leadWf   = await createOrSkipWorkflow(WORKFLOW_NAME,        WORKFLOW,        existing.data);
  const apptWf   = await createOrSkipWorkflow(APPT_WORKFLOW_NAME,   APPT_WORKFLOW,   existing.data);
  const reportWf = await createOrSkipWorkflow(REPORT_WORKFLOW_NAME, REPORT_WORKFLOW, existing.data);

  // 4 · Summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Summary");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (leadWf) {
    console.log(`  New Lead Workflow`);
    console.log(`    Edit    : ${BASE_URL}/workflow/${leadWf.id}`);
    console.log(`    Webhook : ${BASE_URL}/webhook/new-lead\n`);
  }
  if (apptWf) {
    console.log(`  Appointment Workflow`);
    console.log(`    Edit    : ${BASE_URL}/workflow/${apptWf.id}`);
    console.log(`    Webhook : ${BASE_URL}/webhook/new-appointment\n`);
  }
  if (reportWf) {
    console.log(`  Daily Report Workflow`);
    console.log(`    Edit    : ${BASE_URL}/workflow/${reportWf.id}`);
    console.log(`    Trigger : Schedule — every day at 9 AM\n`);
  }

  if (leadWf || apptWf || reportWf) {
    console.log(`  Next steps:`);
    console.log(`  1. Open each workflow in n8n and ACTIVATE it (toggle)`);
    console.log(`  2. Verify .env.local contains:`);
    console.log(`     N8N_NEW_LEAD_WEBHOOK_URL=${BASE_URL}/webhook/new-lead`);
    console.log(`     N8N_APPOINTMENT_WEBHOOK_URL=${BASE_URL}/webhook/new-appointment\n`);
  } else {
    console.log("  All workflows already existed — nothing new created.\n");
  }
}

main().catch((err: Error) => {
  console.error("\n❌  Unexpected error:", err.message);
  if (err.message.includes("ECONNREFUSED")) {
    console.error("    n8n is not running. Start it with: docker compose up -d\n");
  }
  process.exit(1);
});
