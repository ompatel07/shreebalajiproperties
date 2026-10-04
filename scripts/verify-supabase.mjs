/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUPABASE PRE-FLIGHT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/verify-supabase.mjs
 *
 * Run this immediately after applying `supabase/schema.sql` and `seed.sql`,
 * before pointing the site at the new project. It checks the things that are
 * expensive to discover later:
 *
 *   1. The environment is complete and the keys are the right way round.
 *   2. Every table and column the app selects actually exists.
 *   3. Row Level Security is ON, and the anon key genuinely cannot read leads.
 *   4. The `admin_stats()` RPC exists and is callable.
 *   5. There is data, and published listings are visible to the public key.
 *
 * Exits non-zero on any FAIL, so it can gate a deploy.
 *
 * It reads `.env.local` itself — Node does not load it, and this script runs
 * outside Next.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

/* ── Load .env.local without a dependency ──────────────────────────────── */

const envPath = path.resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (!process.env[m[1]]) process.env[m[1]] = value;
  }
}

/* ── Reporting ─────────────────────────────────────────────────────────── */

let failures = 0;
let warnings = 0;

const pass = (msg) => console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
const fail = (msg, detail) => {
  failures++;
  console.log(`  \x1b[31m✖\x1b[0m ${msg}`);
  if (detail) console.log(`      ${detail}`);
};
const warn = (msg) => {
  warnings++;
  console.log(`  \x1b[33m!\x1b[0m ${msg}`);
};
const section = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`);

/* ── 1. Environment ────────────────────────────────────────────────────── */

section("Environment");

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE = process.env.NEXT_PUBLIC_SITE_URL;
const ADMINS = process.env.ADMIN_EMAILS;

if (!URL || URL.includes("xxxx") || URL.includes("placeholder")) {
  fail("NEXT_PUBLIC_SUPABASE_URL is missing or still a placeholder");
} else if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/.test(URL)) {
  warn(`NEXT_PUBLIC_SUPABASE_URL has an unusual shape: ${URL}`);
} else {
  pass(`Project URL ${URL}`);
}

/** Supabase keys are JWTs; the role is in the payload. */
function roleOf(key) {
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64").toString());
    return payload.role ?? null;
  } catch {
    return null;
  }
}

if (!ANON) fail("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
else if (roleOf(ANON) === "service_role") {
  fail(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY holds a SERVICE ROLE key",
    "This would ship a full-access key to every browser. Swap the two values.",
  );
} else pass(`Anon key role: ${roleOf(ANON) ?? "unknown (not a JWT)"}`);

if (!SERVICE) fail("SUPABASE_SERVICE_ROLE_KEY is missing");
else if (roleOf(SERVICE) !== "service_role") {
  fail(`SUPABASE_SERVICE_ROLE_KEY is not a service_role key (role: ${roleOf(SERVICE)})`);
} else pass("Service role key present and server-only");

if (!SITE || SITE.includes("localhost")) {
  warn(
    "NEXT_PUBLIC_SITE_URL is unset or localhost — robots.txt will block the " +
      "whole site and the sitemap will advertise localhost URLs.",
  );
} else pass(`Site URL ${SITE}`);

if (!ADMINS) warn("ADMIN_EMAILS is unset — nobody can reach /studio");
else pass(`Admin emails configured (${ADMINS.split(",").length})`);

if (failures) {
  console.log(`\n\x1b[31mStopping — fix the environment first.\x1b[0m\n`);
  process.exit(1);
}

/* ── 2. Schema ─────────────────────────────────────────────────────────── */

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
const anon = createClient(URL, ANON, { auth: { persistSession: false } });

section("Schema");

/** Columns the app actually selects, parsed from the committed schema. */
const SCHEMA_SQL = readFileSync(path.resolve("supabase/schema.sql"), "utf8");
const EXPECTED_TABLES = [
  ...new Set(
    [...SCHEMA_SQL.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)/gi)].map(
      (m) => m[1],
    ),
  ),
];

for (const table of EXPECTED_TABLES) {
  const { error } = await admin.from(table).select("*", { count: "exact", head: true });
  if (error) fail(`table "${table}" is not reachable`, error.message);
  else pass(`table "${table}"`);
}

// Columns the studio listings table reads — the ones that broke before.
section("Critical columns");
const { data: colProbe, error: colErr } = await admin
  .from("properties")
  .select("id, slug, status, price, view_count, enquiry_count, rera_id, updated_at")
  .limit(1);

if (colErr) fail("properties is missing a column the admin table reads", colErr.message);
else pass("properties carries every column the studio reads");

/* ── 3. Row Level Security ─────────────────────────────────────────────── */

section("Row Level Security");

{
  // The anon key must never see a lead. This is the single most important
  // check in this file: leads carry names and phone numbers.
  const { data, error } = await anon.from("leads").select("id").limit(1);
  if (error || !data || data.length === 0) {
    pass("anon key cannot read leads");
  } else {
    fail(
      "ANON KEY CAN READ LEADS",
      "Every visitor can download your enquiry list. Check the leads policies in schema.sql.",
    );
  }
}

{
  const { error } = await anon
    .from("leads")
    .insert({ name: "RLS probe", phone: "+919999999999" });
  if (error) pass("anon key cannot insert leads directly (server action only)");
  else fail("anon key can INSERT leads — the enquiry pipeline can be bypassed");
}

{
  const { data, error } = await anon.from("properties").select("id, status").limit(5);
  if (error) {
    fail("anon key cannot read published properties — the public site will be empty", error.message);
  } else if (data.some((r) => !["published", "under_offer"].includes(r.status))) {
    fail("anon key can see draft/archived listings", "Tighten properties_public_read.");
  } else {
    pass(`anon key reads published properties only (${data.length} sampled)`);
  }
}

/* ── 4. RPC ────────────────────────────────────────────────────────────── */

section("Functions");

{
  const { error } = await admin.rpc("admin_stats");
  if (error) fail("admin_stats() is not callable — the dashboard will be empty", error.message);
  else pass("admin_stats() responds");
}

/* ── 5. Data ───────────────────────────────────────────────────────────── */

section("Data");

for (const [table, min] of [
  ["properties", 1],
  ["builders", 1],
  ["projects", 0],
]) {
  const { count, error } = await admin
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) fail(`could not count ${table}`, error.message);
  else if ((count ?? 0) < min) warn(`${table} has ${count} rows — did seed.sql run?`);
  else pass(`${table}: ${count} rows`);
}

{
  const { count } = await anon
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  if (!count) warn("no PUBLISHED properties — the public site will show empty states");
  else pass(`${count} published listings visible to the public`);
}

/* ── Verdict ───────────────────────────────────────────────────────────── */

console.log("");
if (failures) {
  console.log(`\x1b[31m${failures} failed\x1b[0m, ${warnings} warning(s). Do not deploy yet.\n`);
  process.exit(1);
}
console.log(`\x1b[32mAll checks passed\x1b[0m${warnings ? `, ${warnings} warning(s)` : ""}.\n`);
