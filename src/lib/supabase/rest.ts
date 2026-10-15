/**
 * Minimal anon-key PostgREST calls for the public site's browser code.
 *
 * `@supabase/ssr` brings auth, realtime and storage — about 54 KB of script
 * that a buyer's browser downloaded (and Next prefetched from every listing
 * card) just to bump a view counter and look up shortlisted slugs. These two
 * calls need none of that, so they go over plain `fetch` with the same anon
 * key. RLS applies exactly as it does through the SDK.
 *
 * The admin panel keeps the full client in `./client.ts`; it needs auth.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function headers(): HeadersInit {
  return {
    apikey: anonKey ?? "",
    Authorization: `Bearer ${anonKey ?? ""}`,
    "Content-Type": "application/json",
  };
}

/** PostgREST `in` filter value, with each item quoted so commas and dots are literal. */
export function inList(values: readonly string[]): string {
  return `in.(${values.map((v) => `"${v.replace(/["\\]/g, "\\$&")}"`).join(",")})`;
}

/** Call a Postgres function exposed over RPC. Resolves to null on any failure. */
export async function rpc<T = unknown>(name: string, args: Record<string, unknown>): Promise<T | null> {
  if (!url || !anonKey) return null;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(args),
      keepalive: true,
    });
    if (!res.ok) return null;
    const text = await res.text();
    return (text ? JSON.parse(text) : null) as T | null;
  } catch {
    return null;
  }
}

/** `select` from a table with PostgREST query-string filters. Throws on failure. */
export async function select<T>(
  table: string,
  columns: string,
  filters: Record<string, string>,
): Promise<T[]> {
  if (!url || !anonKey) throw new Error("Supabase is not configured");
  const qs = new URLSearchParams({ select: columns.replace(/\s+/g, ""), ...filters });
  const res = await fetch(`${url}/rest/v1/${table}?${qs}`, { headers: headers() });
  if (!res.ok) throw new Error(`Query failed (${res.status})`);
  return (await res.json()) as T[];
}
