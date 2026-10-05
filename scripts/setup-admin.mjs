/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CREATE THE STUDIO ADMIN
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/setup-admin.mjs <email> [full name]
 *
 * Creates (or repairs) the account that can open `/studio`. Two things have
 * to line up, deliberately:
 *
 *   1. An auth user, confirmed, so they can sign in at all.
 *   2. A `profiles` row with role 'admin', which is what every RLS policy
 *      actually checks via `is_staff()`.
 *
 * Having both is not redundancy for its own sake — `ADMIN_EMAILS` in the
 * environment gates the route in middleware, and the profiles row gates the
 * data in Postgres. Either alone would be a single point of failure.
 *
 * Idempotent: re-running finds the existing user and repairs the profile
 * rather than failing, which is what you want when the first attempt got
 * halfway.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const envPath = path.resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.argv[2] ?? "").trim().toLowerCase();
const fullName = process.argv.slice(3).join(" ") || "Shree Krishna Properties";

if (!URL || !SECRET) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("Usage: node scripts/setup-admin.mjs <email> [full name]");
  process.exit(1);
}

const admin = createClient(URL, SECRET, { auth: { persistSession: false } });

/** Strong enough that nobody is tempted to keep it. */
const password = randomBytes(12).toString("base64url") + "aA1!";

let userId = null;
let created = false;

const { data: made, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
});

if (made?.user) {
  userId = made.user.id;
  created = true;
} else {
  // Already registered — find them and carry on to the profile step.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (listErr) {
    console.error("Could not create or list users:", createErr?.message ?? listErr.message);
    process.exit(1);
  }
  const found = list.users.find((u) => u.email?.toLowerCase() === email);
  if (!found) {
    console.error("Could not create the user:", createErr?.message);
    process.exit(1);
  }
  userId = found.id;
}

const { error: profileErr } = await admin
  .from("profiles")
  .upsert({ id: userId, email, full_name: fullName, role: "admin" }, { onConflict: "id" });

if (profileErr) {
  console.error("User exists but the profiles row failed:", profileErr.message);
  console.error("Without it every RLS policy will refuse this account.");
  process.exit(1);
}

console.log("");
console.log("  Studio admin ready");
console.log("  ───────────────────────────────────────────────");
console.log(`  email     ${email}`);
if (created) {
  console.log(`  password  ${password}`);
  console.log("            ^ change this after the first sign-in");
} else {
  console.log("  password  (unchanged — user already existed)");
}
console.log(`  user id   ${userId}`);
console.log("  role      admin");
console.log("");
console.log(`  Make sure ADMIN_EMAILS contains ${email}, then sign in at /studio.`);
console.log("");
