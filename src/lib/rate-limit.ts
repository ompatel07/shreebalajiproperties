import "server-only";

import { createHash } from "node:crypto";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RATE LIMITING — without a paid Redis.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Two layers, because neither is sufficient alone:
 *
 *   1. An in-process token bucket. Instant and free, but a serverless
 *      function has no shared memory, so a burst spread across cold starts
 *      can slip past it. Good for stopping a single hammering client.
 *
 *   2. A Postgres count over `leads.ip_hash` for the last hour. Authoritative
 *      and shared across every instance, at the cost of one indexed query.
 *      This is the layer that actually holds.
 *
 * `checkEnquiryRate` runs layer 1 first so the common case never touches the
 * database, and falls through to layer 2 only when layer 1 passes.
 *
 * If this site ever outgrows the free tier, swapping layer 2 for Upstash is a
 * one-function change — nothing else imports these internals.
 */

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED = 10_000;

/**
 * Token bucket. `limit` requests per `windowMs`, refilling continuously
 * rather than resetting on a boundary — a fixed window lets a client send
 * 2× the limit across the boundary.
 */
export function tokenBucket(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();

  // Crude bound on memory. Evicting the whole map is acceptable: the
  // database layer below is the real guarantee, so a rare reset is harmless.
  if (buckets.size > MAX_TRACKED) buckets.clear();

  const bucket = buckets.get(key) ?? { tokens: limit, updatedAt: now };

  const refill = ((now - bucket.updatedAt) / windowMs) * limit;
  bucket.tokens = Math.min(limit, bucket.tokens + refill);
  bucket.updatedAt = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    const retryAfterMs = Math.ceil(((1 - bucket.tokens) / limit) * windowMs);
    return { ok: false, remaining: 0, retryAfterMs };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { ok: true, remaining: Math.floor(bucket.tokens), retryAfterMs: 0 };
}

/**
 * Salted hash of the client IP.
 *
 * We never store a raw IP. The salt is the service-role key, which already
 * must stay secret — so the hashes are useless to anyone who gets the table
 * without also getting the environment.
 */
export function hashIp(ip: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "sbp-fallback-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Best-effort client IP.
 *
 * On Vercel, `x-forwarded-for` is set by the platform edge and the leftmost
 * entry is the real client. Behind any other proxy this header is
 * client-controllable, so it is used only for rate limiting and abuse
 * forensics — never for authorisation.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "0.0.0.0";
}

/* ── Policies ────────────────────────────────────────────────────────────── */

export const LIMITS = {
  /** Enquiry forms: 5 per 10 minutes per IP. */
  enquiry: { limit: 5, windowMs: 10 * 60 * 1000, dbLimit: 12, dbWindowHours: 1 },
  /** Site-visit requests are higher friction, so a tighter cap. */
  siteVisit: { limit: 3, windowMs: 15 * 60 * 1000, dbLimit: 6, dbWindowHours: 1 },
  /** Admin login: 8 attempts per 15 minutes, keyed by IP. */
  login: { limit: 8, windowMs: 15 * 60 * 1000 },
  /** View-count pings: generous, since it is one row update. */
  view: { limit: 40, windowMs: 60 * 1000 },
} as const;

/**
 * Both layers, in order. Returns a user-facing message rather than a bare
 * boolean so the form can say something honest.
 */
export async function checkEnquiryRate(
  ipHash: string,
  policy: { limit: number; windowMs: number; dbLimit: number; dbWindowHours: number },
  countRecent: (ipHash: string, sinceIso: string) => Promise<number>,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const memory = tokenBucket(`enquiry:${ipHash}`, policy.limit, policy.windowMs);
  if (!memory.ok) {
    const mins = Math.max(1, Math.ceil(memory.retryAfterMs / 60000));
    return {
      ok: false,
      message: `You have sent several enquiries already. Please try again in about ${mins} minute${
        mins === 1 ? "" : "s"
      } — or just call us, which is faster anyway.`,
    };
  }

  const since = new Date(Date.now() - policy.dbWindowHours * 3600 * 1000).toISOString();
  try {
    const recent = await countRecent(ipHash, since);
    if (recent >= policy.dbLimit) {
      return {
        ok: false,
        message:
          "We have received a lot of enquiries from your connection in the last hour. Please call us directly so we can help properly.",
      };
    }
  } catch {
    // A failed count must not block a genuine buyer. Layer 1 already passed,
    // so fail open and let the enquiry through.
  }

  return { ok: true };
}
