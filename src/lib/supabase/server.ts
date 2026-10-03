import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVER-SIDE SUPABASE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Both clients use the ANON key and therefore run under Row Level Security —
 * a bug in a query cannot leak a draft listing or someone else's lead,
 * because Postgres filters the rows before they reach us.
 *
 * ── Why a missing env var must NOT throw ────────────────────────────────
 * It used to. A `requiredEnv()` helper threw when
 * `NEXT_PUBLIC_SUPABASE_URL` was absent, which meant a first Vercel deploy
 * with no environment variables set failed the whole build part-way through
 * prerendering 1,090 static pages — from one unguarded call site.
 *
 * That is the wrong failure mode. The site is designed to run on fixtures
 * until Supabase is connected, so an absent URL is a *known, supported*
 * state, not a programming error. The client now falls back to an
 * unreachable placeholder: every query returns `{ error }`, the data layer
 * already handles that by returning empty results, and the demo fixtures
 * take over. One warning is logged so it is never silent.
 *
 * A genuinely misconfigured production deploy is still obvious — the pages
 * render their empty states and the amber demo banner appears site-wide.
 */

/** Resolved once per module load, so the warning is not logged per request. */
const CONFIG = resolveConfig();

function resolveConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) return { url, key, configured: true as const };

  // Deliberately unreachable. `*.invalid` is reserved by RFC 2606 and will
  // never resolve, so a stray query fails fast instead of hanging.
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / ANON_KEY not set — running on demo fixtures. " +
      "Set them in your environment to connect a real database.",
  );

  return {
    url: "https://placeholder.supabase.invalid",
    key: "placeholder-anon-key",
    configured: false as const,
  };
}

/** True when real credentials are present. */
export const isSupabaseConfigured = CONFIG.configured;

/**
 * Client for Server Components, Route Handlers and Server Actions.
 * Reads and refreshes the auth session from cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(CONFIG.url, CONFIG.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Session refresh happens in middleware instead, so this is safe
          // to swallow.
        }
      },
    },
  });
}

/**
 * Read-only client for fully static/ISR pages that must not touch cookies.
 *
 * Reading cookies opts a route out of static rendering. Public listing pages
 * have no per-user state, so they use this and stay cacheable at the edge.
 */
export function createPublicClient() {
  return createServerClient(CONFIG.url, CONFIG.key, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  });
}
