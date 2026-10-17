import type { CookieOptions } from "@supabase/ssr";

/**
 * Session cookie policy for the admin login — the only auth on the site.
 *
 * @supabase/ssr defaults to a 400-day cookie with no Secure flag. Tightened:
 *   · secure   — sent over HTTPS only (browsers treat localhost as secure,
 *                so local development still works);
 *   · sameSite — lax, so a cross-site form cannot ride the session;
 *   · maxAge   — 7 days: a session left on a shared or lost device ends
 *                within a week instead of after a year.
 *
 * Not HttpOnly: the admin's photo upload uses the browser client, which must
 * read the session. The admin surface's nonce-based CSP (no inline or
 * third-party script) is what keeps script away from it.
 */
export const SESSION_COOKIE_OPTIONS = {
  path: "/",
  secure: true,
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
};

/**
 * @supabase/ssr re-applies its own 400-day maxAge after spreading
 * `cookieOptions`, so the cap has to be enforced where cookies are written.
 * A maxAge of 0 (sign-out / deletion) passes through untouched.
 */
export function capSessionCookie(options: CookieOptions | undefined): CookieOptions {
  const o = options ?? {};
  const maxAge =
    o.maxAge === 0 ? 0 : Math.min(o.maxAge ?? SESSION_COOKIE_OPTIONS.maxAge, SESSION_COOKIE_OPTIONS.maxAge);
  return { ...SESSION_COOKIE_OPTIONS, ...o, secure: true, maxAge };
}
