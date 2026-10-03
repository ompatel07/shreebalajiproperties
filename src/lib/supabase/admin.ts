import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * SERVICE-ROLE client. Bypasses every RLS policy.
 *
 * The `server-only` import at the top is load-bearing: if any Client
 * Component ever imports this module (directly or transitively), the build
 * fails instead of shipping the service key to a browser bundle.
 *
 * Only two things legitimately need it:
 *   1. Inserting public enquiries — `leads` has no anon policy by design, so
 *      writes go through a validated, rate-limited Server Action.
 *   2. Writing the append-only `audit_log`.
 *
 * Everything else — including the whole admin panel — uses the RLS-bound
 * client in `server.ts`, so a mistake there cannot escalate privileges.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Required for enquiry submission and audit logging.",
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "x-sbp-context": "service-role" },
    },
  });
}
