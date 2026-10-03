"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client, anon key, RLS-bound.
 *
 * Used only by the admin panel for interactive work (login, media upload,
 * optimistic list updates). The public site fetches on the server so that
 * listings are server-rendered and indexable.
 *
 * Memoised — `createBrowserClient` per render would churn auth listeners.
 */
let cached: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (cached) return cached;

  cached = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return cached;
}
