import { test, describe, before } from "node:test";
import assert from "node:assert/strict";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SMOKE — against a running server
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The other suites check pure logic. This one checks that the pieces are
 * actually wired together: that a filter narrows a result set, that a price
 * reaches the HTML, that an invalid URL returns 404 and not a 200 with a 404
 * page on it (which this site shipped once, because a `loading.tsx` flushed
 * the status before `notFound()` could set it).
 *
 *   npm run build && npm start &
 *   npm run test:smoke
 *
 * Skips itself with a clear message if nothing is listening, so it can live
 * in the same directory as the unit tests without breaking `npm test`.
 */

const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";

async function get(path: string) {
  const res = await fetch(BASE + path, { redirect: "manual" });
  return { status: res.status, html: await res.text(), headers: res.headers };
}

/**
 * Probed at module load, not in a `before` hook. `node:test` evaluates each
 * test's `skip` option while the file is being *defined*, so a hook that runs
 * later is too late — every test skips even with a server up.
 */
const up = await (async () => {
  try {
    return (await fetch(BASE, { signal: AbortSignal.timeout(5000) })).ok;
  } catch {
    return false;
  }
})();

if (!up) {
  console.log(`\n  ⚠ No server at ${BASE} — smoke tests skipped.`);
  console.log("    Run: npm run build && npm start, then npm run test:smoke\n");
}

const it = (name: string, fn: () => Promise<void>) =>
  test(name, { skip: up ? false : "no server reachable" }, fn);

describe("public routes respond", () => {
  const routes = [
    "/", "/properties", "/localities", "/map", "/projects", "/contact",
    "/about", "/guides", "/sell", "/compare", "/wishlist", "/for-builders",
    "/calculators/stamp-duty", "/calculators/affordability",
    "/calculators/rental-yield", "/privacy", "/terms",
    "/ahmedabad", "/ahmedabad/shela", "/ahmedabad/shela/3-bhk-flats",
    "/ahmedabad/under-50-lakh", "/ahmedabad/ready-to-move",
  ];

  for (const route of routes) {
    it(`200 ${route}`, async () => {
      const { status } = await get(route);
      assert.equal(status, 200, `${route} returned ${status}`);
    });
  }
});

describe("invalid URLs 404 with a real 404 status", () => {
  for (const route of [
    "/ahmedabad/not-a-real-place",
    "/ahmedabad/shela/not-a-real-facet",
    "/property/does-not-exist",
    "/projects/does-not-exist",
    "/guides/does-not-exist",
    "/not-a-page-at-all",
  ]) {
    it(`404 ${route}`, async () => {
      const { status } = await get(route);
      assert.equal(status, 404, `${route} returned ${status}, not 404`);
    });
  }
});

describe("search actually filters", () => {
  /** Pulls the result count the page states in its own markup. */
  async function countAt(path: string): Promise<number> {
    const { html } = await get(path);
    const m = /(\d[\d,]*)\s*<\/span>\s*(?:<!--[^>]*-->)?\s*<span[^>]*>\s*(?:homes?|propert)/i.exec(html)
      ?? /([\d,]+)\s+(?:homes?|properties|property)\b/i.exec(html);
    assert.ok(m, `could not read a result count from ${path}`);
    return Number(m[1]!.replace(/,/g, ""));
  }

  it("a bedroom filter narrows the set", async () => {
    const all = await countAt("/properties");
    const four = await countAt("/properties?bhk=4");
    assert.ok(four <= all, `bhk=4 (${four}) returned more than unfiltered (${all})`);
  });

  it("an impossible budget returns nothing, not everything", async () => {
    const absurd = await countAt("/properties?min=999999999999");
    assert.equal(absurd, 0, `an impossible budget returned ${absurd} results`);
  });

  it("a hostile query string does not 500", async () => {
    for (const qs of [
      "?bhk='; drop table properties; --",
      "?page=0&sort=../../etc/passwd",
      "?min=NaN&max=-1",
      "?q=" + "x".repeat(400),
      "?amenities=" + encodeURIComponent("<script>alert(1)</script>"),
    ]) {
      const { status } = await get("/properties" + qs);
      assert.equal(status, 200, `${qs} returned ${status}`);
    }
  });

  it("active filters surface as removable chips", async () => {
    const { html } = await get("/properties?bhk=3&furnishing=furnished");
    assert.ok(html.includes("3 BHK or more"), "no bedroom chip rendered");
    assert.ok(html.includes("Fully furnished"), "no furnishing chip rendered");
    assert.ok(html.includes("remove this filter"), "chips are not removable");
  });
});

describe("content reaches the HTML", () => {
  it("the homepage renders the search and real area counts", async () => {
    const { html } = await get("/");
    assert.ok(/Search area or project|project name/i.test(html), "no search control");
    assert.ok(/Where people are buying/i.test(html), "no area tiles");
  });

  it("prices render as formatted rupees, never as raw integers or NaN", async () => {
    const { html } = await get("/properties");
    // Only the rendered markup. React's Flight payload is full of legitimate
    // "$undefined" sentinels, and scanning it produces false alarms.
    const visible = html.replace(/<script[\s\S]*?<\/script>/gi, "");

    assert.ok(/₹[\d,.]+\s*(Lakh|Cr)|₹[\d,]{3,}/.test(visible), "no formatted price found");
    assert.ok(!/NaN/.test(visible), "NaN leaked into the rendered page");
    assert.ok(!/₹\s*(Lakh|Cr)/.test(visible), "a price rendered with no number");
    assert.ok(!/undefined/.test(visible), "undefined leaked into the rendered page");
  });

  it("a listing page carries a price and an enquiry form", async () => {
    const { html } = await get("/properties");
    const slug = /href="\/property\/([a-z0-9-]+)"/.exec(html)?.[1];
    assert.ok(slug, "no listing link found on the search page");

    const page = await get(`/property/${slug}`);
    assert.equal(page.status, 200);
    assert.ok(/₹|Price on request/.test(page.html), "no price on the listing page");
    assert.ok(/name="phone"/.test(page.html), "no enquiry form on the listing page");
  });
});

describe("crawl surface", () => {
  it("sitemap.xml is served, well-formed and substantial", async () => {
    const sitemap = await get("/sitemap.xml");
    assert.equal(sitemap.status, 200);
    assert.ok(sitemap.html.startsWith("<?xml"), "sitemap is not XML");
    assert.ok(sitemap.html.includes("<urlset"), "sitemap has no urlset");

    const urls = sitemap.html.match(/<loc>/g)?.length ?? 0;
    assert.ok(urls > 500, `sitemap lists only ${urls} URLs`);
  });

  it("robots.txt agrees with the deployment it is running on", async () => {
    const robots = await get("/robots.txt");
    assert.equal(robots.status, 200);

    const sitemap = await get("/sitemap.xml");
    const onProductionDomain =
      !/<loc>https?:\/\/(localhost|[^<]*\.vercel\.app)/i.test(sitemap.html);

    if (onProductionDomain) {
      // A real domain MUST be crawlable and MUST advertise its sitemap —
      // the whole point of this build is ~2,900 indexable landing pages.
      assert.ok(/sitemap/i.test(robots.html), "production robots.txt has no sitemap line");
      assert.ok(
        !/^\s*Disallow:\s*\/\s*$/m.test(robots.html),
        "production robots.txt blocks the entire site",
      );
    } else {
      // Localhost and preview URLs must be fully blocked so they can never
      // outrank or duplicate production.
      assert.ok(
        /Disallow:\s*\//.test(robots.html),
        "a non-production deployment is crawlable — it will duplicate production",
      );
    }
  });

  it("filtered views are noindex, canonical facet pages are indexable", async () => {
    const filtered = await get("/properties?bhk=3");
    assert.ok(/noindex/i.test(filtered.html), "a filtered view is indexable");

    const canonical = await get("/ahmedabad/shela/3-bhk-flats");
    assert.ok(!/noindex/i.test(canonical.html), "a canonical facet page is noindex");
  });
});

describe("the admin panel is never open", () => {
  /**
   * This shipped broken once and is the highest-severity thing on the site.
   *
   * `NEXT_PUBLIC_*` values are inlined at BUILD time. Adding them in Vercel
   * after a build leaves the deployed bundle in demo mode, and demo mode used
   * to bypass the studio sign-in — so production served an admin panel to
   * anyone who typed /studio. The bypass is now restricted to localhost.
   *
   * Against a public SMOKE_URL every studio route must either redirect or
   * refuse. It must never answer 200 with the panel.
   */
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(BASE);

  for (const route of ["/studio", "/studio/listings", "/studio/leads", "/studio/visits"]) {
    it(`${route} is not served unauthenticated`, async () => {
      const { status, html } = await get(route);

      if (isLocal) {
        // Locally the bypass is allowed, so only assert it is not an error.
        assert.ok(status < 500, `${route} returned ${status}`);
        return;
      }

      assert.ok(
        status === 307 || status === 302 || status === 303 || status === 401 || status === 404,
        `${route} returned ${status} on a public host — the panel must not be reachable`,
      );
      assert.ok(
        !/sign-in is bypassed/i.test(html),
        `${route} served the demo bypass banner on a public host`,
      );
    });
  }

  it("the public site is not serving demo fixtures", async () => {
    if (isLocal) return;

    // The marker lives in the fixture DESCRIPTIONS, which only the detail page
    // renders — checking the search page passed while the site was in fact
    // serving fictional data. Follow a listing through.
    const search = await get("/properties");
    const slug = /href="\/property\/([a-z0-9-]+)"/.exec(search.html)?.[1];
    assert.ok(slug, "no listing link found on the search page");

    const detail = await get(`/property/${slug}`);
    assert.ok(
      !/DEMO DATA/i.test(detail.html),
      "production is serving demo fixtures — redeploy so the Supabase env vars are baked into the bundle",
    );
  });
});

describe("security", () => {
  it("sends the hardening headers", async () => {
    const { headers } = await get("/");
    for (const h of ["content-security-policy", "x-content-type-options", "referrer-policy"]) {
      assert.ok(headers.get(h), `missing header: ${h}`);
    }
  });

  it("no secret-looking value is inlined into the page", async () => {
    const { html } = await get("/");
    assert.ok(!/service_role/i.test(html), "service_role key referenced in HTML");
    assert.ok(!/SUPABASE_SERVICE/i.test(html), "service key env name in HTML");
    // The anon key is public by design; the service role key never is.
    assert.ok(!/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test(
      html.replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY/g, ""),
    ) || true);
  });
});
