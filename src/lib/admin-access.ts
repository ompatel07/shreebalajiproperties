/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADMIN ACCESS — who may use /studio, and where sign-in may send them
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * One allow-list, checked at three layers: the middleware (every /studio
 * request), the sign-in action (before a session is kept) and every admin
 * action (before any write). The database adds a fourth: RLS via the
 * `profiles` table. An email must pass all of them.
 *
 * Fails closed: an unset or empty ADMIN_EMAILS admits nobody.
 */

/** The configured admin emails, lower-cased. Empty when unset. */
export function adminEmails(raw: string | undefined = process.env.ADMIN_EMAILS): string[] {
  return (raw ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined, raw?: string): boolean {
  if (!email) return false;
  return adminEmails(raw).includes(email.trim().toLowerCase());
}

/**
 * Where to go after signing in. Only a path inside the studio is accepted.
 *
 * Starting with "/" is not enough: "//evil.com" and "/\evil.com" are
 * protocol-relative URLs that browsers resolve to another site — an open
 * redirect a phishing link could use to bounce a freshly signed-in admin
 * somewhere else. Anything doubtful falls back to the dashboard.
 */
export function safeNext(next: string | null | undefined): string {
  const fallback = "/studio";
  if (!next || next.length > 300) return fallback;
  if (!/^\/studio(?:[/?#]|$)/.test(next)) return fallback;
  if (/[\\\s]|\/\/|%2f|%5c|[\u0000-\u001f]/i.test(next)) return fallback;
  return next;
}
