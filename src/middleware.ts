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
async function handle(request: NextRequest) {
  // 128 bits of entropy, base64. Fresh on every request.
  const nonce = Buffer.from(crypto.randomUUID() + crypto.randomUUID()).toString("base64");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const isDev = process.env.NODE_ENV === "development";
  const isAdminSurface = request.nextUrl.pathname.startsWith("/studio");

  /**
   * DEMO MODE — Supabase is not configured.
   *
   * Drives the fixture fallback and the amber banner, and switches itself off
   * the instant real credentials exist.
   */
  const demoMode = !supabaseUrl || supabaseUrl.includes("placeholder") || supabaseUrl.includes("xxxx");

  /**
   * ── Why the demo bypass is restricted to localhost ──────────────────────
   *
   * This used to open `/studio` whenever Supabase was unconfigured, reasoning
   * that with no database there is no session to establish and no real data
   * to protect. That is true of the data and false of the exposure, and it
   * failed in the obvious way: `NEXT_PUBLIC_*` values are inlined at BUILD
   * time, so adding them in Vercel after a build leaves the deployed bundle
   * in demo mode. The production URL served an admin panel with sign-in
   * bypassed to anyone who typed /studio.
   *
   * A missing environment variable must never be the thing standing between
   * the public and the admin panel. The bypass now requires a local host, so
   * the convenience survives where it is useful and the failure mode on a
   * public deployment is "locked", not "open".
   */
  const hostname = request.nextUrl.hostname;
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local");

  const demoBypass = demoMode && isLocalHost;

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
    // Only widen connect-src when a Supabase origin actually exists —
    // interpolating an empty string leaves a malformed directive.
    [
      `connect-src 'self'`,
      ...(supabaseUrl ? [supabaseUrl, supabaseUrl.replace(/^https/, "wss")] : []),
    ].join(" "),
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
  //
  // The client is constructed ONLY when Supabase is configured. This is not
  // an optimisation — `createServerClient("")` throws on an invalid URL, and
  // because middleware runs on every request that crash took the entire site
  // down with MIDDLEWARE_INVOCATION_FAILED on the first Vercel deploy, where
  // no environment variables were set yet.
  //
  // In demo mode there is no session to refresh and no auth to enforce, so
  // the whole block is skipped.
  let user: { email?: string | null } | null = null;

  if (!demoMode) {
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

    // getUser() revalidates the JWT against Supabase. getSession() only
    // decodes the cookie, which a client could have tampered with — never
    // use it to make an authorisation decision.
    //
    // Wrapped: a Supabase outage must not 500 the whole site. Failing to
    // resolve a user simply means "not signed in", which the admin gate
    // below already treats as a redirect to login.
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (error) {
      console.error("[middleware] auth.getUser failed", error);
      user = null;
    }
  }

  // ── Admin gate ─────────────────────────────────────────────────────────
  const { pathname } = request.nextUrl;
  const isStudio = pathname.startsWith("/studio");
  const isLogin = pathname === "/studio/login";

  // Unconfigured AND public: say so plainly rather than bouncing the visitor
  // around a login form that cannot possibly succeed.
  if (isStudio && demoMode && !isLocalHost && pathname !== "/studio/denied") {
    const url = request.nextUrl.clone();
    url.pathname = "/studio/denied";
    url.search = "?reason=unconfigured";
    return NextResponse.redirect(url);
  }

  if (isStudio && !isLogin && !demoBypass) {
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
  if (isLogin && (user || demoBypass)) {
    const url = request.nextUrl.clone();
    url.pathname = "/studio";
    url.search = "";
    return NextResponse.redirect(url);
  }

  response.headers.set("Content-Security-Policy", csp);
  if (isAdminSurface) response.headers.set("x-nonce", nonce);

  return response;
}

/**
 * Safety net.
 *
 * Middleware runs on every request, so an uncaught throw here takes the
 * entire site down — which is exactly what happened on the first Vercel
 * deploy (MIDDLEWARE_INVOCATION_FAILED on every route). Security headers
 * and the admin gate are important, but not important enough to be a single
 * point of failure for the whole site.
 *
 * On an unexpected error the request is allowed through with the static
 * security headers from next.config.ts still applied by the CDN, and the
 * failure is logged. The admin panel remains protected regardless, because
 * RLS and the `profiles` role check enforce authorisation at the database
 * level independently of this file.
 */
export async function middleware(request: NextRequest) {
  try {
    return await handle(request);
  } catch (error) {
    console.error("[middleware] unhandled error — passing request through", error);
    return NextResponse.next();
  }
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
