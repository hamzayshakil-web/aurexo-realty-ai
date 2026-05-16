#!/usr/bin/env tsx
/**
 * scripts/run-migration.ts
 * Runs a SQL migration against Supabase using the pg-meta REST API.
 * Usage: tsx scripts/run-migration.ts <migration-file>
 */

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

async function runSql(sql: string): Promise<void> {
  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
  }

  // Extract project ref from URL: https://<ref>.supabase.co
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) throw new Error(`Cannot extract project ref from URL: ${supabaseUrl}`);
  const projectRef = match[1];

  // Supabase Management API — requires personal access token, not service role
  // Fallback: use pg-meta via the Supabase REST API internal proxy
  // The pg-meta /query endpoint is exposed at /pg-meta/v1/query on cloud instances
  const pgMetaUrl = `${supabaseUrl}/pg-meta/v1/query`;

  console.log(`  Project : ${projectRef}`);
  console.log(`  Endpoint: ${pgMetaUrl}\n`);

  const res = await fetch(pgMetaUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();

  if (!res.ok) {
    // pg-meta not exposed publicly — try via RPC approach
    console.warn(`  ⚠️   pg-meta endpoint returned ${res.status}: ${text.slice(0, 200)}`);
    console.warn("  Trying alternative: exec_sql RPC...\n");
    await runSqlViaRpc(sql, supabaseUrl, serviceRoleKey);
    return;
  }

  console.log("  ✅  Migration applied successfully via pg-meta.");
}

async function runSqlViaRpc(sql: string, url: string, key: string): Promise<void> {
  // Attempt via Supabase RPC — requires exec_sql function to exist
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
      "apikey": key,
    },
    body: JSON.stringify({ sql }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.warn(`  ⚠️   RPC exec_sql also unavailable (${res.status})`);
    console.warn("  The migration must be run manually in the Supabase SQL editor.");
    console.warn("  Migration SQL:\n");
    console.log("─".repeat(60));
    console.log(sql);
    console.log("─".repeat(60));
    return;
  }

  console.log("  ✅  Migration applied via RPC.");
}

async function main(): Promise<void> {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: tsx scripts/run-migration.ts <path-to-sql-file>");
    process.exit(1);
  }

  const sql = readFileSync(file, "utf-8");
  console.log(`\n Running migration: ${file}\n`);
  await runSql(sql.trim());
}

main().catch((err: Error) => {
  console.error("Error:", err.message);
  process.exit(1);
});
