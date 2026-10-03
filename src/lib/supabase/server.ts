import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 *
 * Uses the ANON key and therefore runs under Row Level Security — a bug in a
 * query cannot leak a draft listing or someone else's lead, because Postgres
 * filters the rows before they reach us.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
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
            // Session refresh is handled in middleware instead, so this is
            // safe to swallow.
          }
        },
      },
    },
  );
}

/**
 * Read-only client for fully static/ISR pages that must not touch cookies.
 *
 * Reading cookies opts a route out of static rendering. Public listing pages
 * have no per-user state, so they use this and stay cacheable at the edge.
 */
export function createPublicClient() {
  return createServerClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  );
}

function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing environment variable ${key}. Copy .env.example to .env.local and fill in your Supabase credentials.`,
    );
  }
  return value;
}
