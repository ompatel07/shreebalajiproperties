import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware does three jobs on every request:
 *
 *   1. Refreshes the Supabase auth session (cookies can only be written here
 *      and in Route Handlers — not from a Server Component).
 *   2. Emits a per-request, nonce-based Content-Security-Policy. A nonce is
 *      why this cannot live in `next.config.ts` alongside the static headers.
 *   3. Gates `/studio`, the admin panel, behind both a valid session AND an
 *      ADMIN_EMAILS allow-list.
 */
export async function middleware(request: NextRequest) {
  // 128 bits of entropy, base64. Fresh on every request.
  const nonce = Buffer.from(crypto.randomUUID() + crypto.randomUUID()).toString("base64");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const isDev = process.env.NODE_ENV === "development";
  const isAdminSurface = request.nextUrl.pathname.startsWith("/studio");

  /**
   * DEMO MODE — Supabase is not configured.
   *
   * With no database there is no session to establish and no real data to
   * protect, so the studio is opened for review. This is the same condition
   * that drives the fixture fallback and the amber banner, and it switches
   * itself off the instant real credentials exist.
   *
   * The studio shell renders a prominent "auth bypassed" strip while this is
   * active, and robots.ts keeps /studio out of every index regardless.
   */
  const demoMode = !supabaseUrl || supabaseUrl.includes("placeholder") || supabaseUrl.includes("xxxx");

  /**
   * ── Why the script policy differs by surface ──────────────────────────
   *
   * A nonce must be generated per request, so any page that consumes one is
   * forced into dynamic rendering. On a property site that is the wrong
   * trade: hundreds of listing and locality pages would lose static/ISR
   * rendering, and with it their LCP and crawl economics.
   *
   * So the policy is split along the actual risk boundary:
   *
   *   /studio/*  — authenticated, mutates data, never cached, already
   *                dynamic. Gets the strict nonce + 'strict-dynamic' policy.
   *
   *   everything — read-only marketing pages rendered from our own data,
   *   else       with no user-generated HTML and no `dangerouslySetInnerHTML`
   *                carrying user input anywhere. Keeps 'unsafe-inline' so
   *                React's inline flight data works on a static response.
   *
   * The remaining directives are identical and strict on both: `object-src
   * 'none'`, `base-uri 'self'`, `frame-ancestors 'none'` and a closed
   * `connect-src` shut the usual escalation routes either way.
   */
  const scriptSrc = isAdminSurface
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""}`.trim()
    : `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""}`.trim();

  const csp = [
    `default-src 'self'`,
    scriptSrc,
    // Next.js and Leaflet both set style attributes at runtime. Hashing those
    // is not feasible, and style injection is a far lower-severity sink than
    // script injection.
    `style-src 'self' 'unsafe-inline'`,
    // Fonts are self-hosted by next/font at build time — no external origin.
    `font-src 'self' data:`,
    [
      `img-src 'self' blob: data:`,
      `https://images.unsplash.com`,
      `https://*.supabase.co`,
      // OpenStreetMap raster tiles (our free alternative to Google Maps).
      `https://*.tile.openstreetmap.org`,
      `https://*.basemaps.cartocdn.com`,
    ].join(" "),
    `connect-src 'self' ${supabaseUrl} ${supabaseUrl.replace(/^https/, "wss")}`.trim(),
    `media-src 'self' https://*.supabase.co`,
    // No third-party embeds are used; keep the frame sinks shut.
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `manifest-src 'self'`,
    ...(isDev ? [] : [`upgrade-insecure-requests`]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);

  // Next.js nonces its own script tags only when it sees a CSP on the
  // REQUEST. Setting it unconditionally would opt every public page into
  // dynamic rendering, so it is set for the admin surface alone.
  if (isAdminSurface) {
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("content-security-policy", csp);
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  // ── Session refresh ────────────────────────────────────────────────────
  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request: { headers: requestHeaders } });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() revalidates the JWT against Supabase. getSession() only decodes
  // the cookie, which a client could have tampered with — never use it to
  // make an authorisation decision.
  //
  // Skipped in demo mode: there is no Supabase to ask, and the request would
  // just wait out a DNS failure on every single page load.
  const user = demoMode
    ? null
    : (await supabase.auth.getUser()).data.user;

  // ── Admin gate ─────────────────────────────────────────────────────────
  const { pathname } = request.nextUrl;
  const isStudio = pathname.startsWith("/studio");
  const isLogin = pathname === "/studio/login";

  if (isStudio && !isLogin && !demoMode) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/studio/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // Second, independent check. RLS enforces this again at the database
    // level via the `profiles` table — this is belt as well as braces, so
    // that a misconfigured profile row alone cannot open the panel.
    const allowed = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (allowed.length > 0 && !allowed.includes((user.email ?? "").toLowerCase())) {
      const url = request.nextUrl.clone();
      url.pathname = "/studio/denied";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // Already signed in and sitting on the login page → go to the dashboard.
  if (isLogin && (user || demoMode)) {
    const url = request.nextUrl.clone();
    url.pathname = "/studio";
    url.search = "";
    return NextResponse.redirect(url);
  }

  response.headers.set("Content-Security-Policy", csp);
  if (isAdminSurface) response.headers.set("x-nonce", nonce);

  return response;
}

export const config = {
  matcher: [
    /**
     * Everything except static assets and image optimiser output. Those are
     * immutable and carry no session, so running middleware on them would
     * only add latency.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|webmanifest)$).*)",
  ],
};
