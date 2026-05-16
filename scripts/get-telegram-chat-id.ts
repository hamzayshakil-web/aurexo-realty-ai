#!/usr/bin/env tsx
import { readFileSync } from "fs";
import { join } from "path";

function loadEnv(): void {
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
  } catch { /* no .env.local */ }
}
loadEnv();

const BASE   = "http://localhost:5678";
const APIKEY = process.env.N8N_API_KEY ?? "";
const TOKEN  = "8905330025:AAH1HaYHQtVZj4O4y96khgGZanglap8GhMg";

const HEADERS = { "Content-Type": "application/json", "X-N8N-API-KEY": APIKEY };

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

async function main() {
  const WF_NAME = "___temp_tg_chatid___";

  // Clean up any previous run
  const existing = await api<{ data: Array<{ id: string; name: string }> }>("GET", "/workflows?limit=100");
  const old = existing.data.find(w => w.name === WF_NAME);
  if (old) await api("DELETE", `/workflows/${old.id}`);

  // Create temp workflow
  const wf = await api<{ id: string }>("POST", "/workflows", {
    name: WF_NAME,
    settings: { executionOrder: "v1" },
    nodes: [
      {
        id: "t1", name: "Webhook", type: "n8n-nodes-base.webhook",
        typeVersion: 2, position: [240, 300],
        parameters: { path: "tg-chat-id-temp", httpMethod: "GET", responseMode: "responseNode", options: {} },
      },
      {
        id: "t2", name: "TG", type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2, position: [460, 300],
        parameters: { method: "GET", url: `https://api.telegram.org/bot${TOKEN}/getUpdates`, options: {} },
      },
      {
        id: "t3", name: "Respond", type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1, position: [680, 300],
        parameters: { respondWith: "json", responseBody: "={{ JSON.stringify($input.first().json) }}", options: {} },
      },
    ],
    connections: {
      "Webhook": { main: [[{ node: "TG",      type: "main", index: 0 }]] },
      "TG":      { main: [[{ node: "Respond", type: "main", index: 0 }]] },
    },
  });

  // Activate
  await api("POST", `/workflows/${wf.id}/activate`);
  await new Promise(r => setTimeout(r, 2000));

  // Trigger
  const res  = await fetch(`${BASE}/webhook/tg-chat-id-temp`);
  const raw  = await res.text();
  console.log("Raw response:", raw.slice(0, 500));
  const data = JSON.parse(raw) as {
    result: Array<{ message?: { chat?: { id: number; first_name?: string } }; my_chat_member?: { chat?: { id: number } } }>
  };

  // Clean up
  await api("DELETE", `/workflows/${wf.id}`);

  if (!data.result || data.result.length === 0) {
    console.log("\n❌  No messages found. Make sure you sent a message to your Telegram bot first.\n");
    return;
  }

  const update = data.result[data.result.length - 1];
  const chat = update.message?.chat ?? update.my_chat_member?.chat;
  const chatId = chat?.id;
  const name   = update.message?.chat?.first_name ?? "Unknown";

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Telegram Chat ID Found!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Name    : ${name}`);
  console.log(`  Chat ID : ${chatId}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
