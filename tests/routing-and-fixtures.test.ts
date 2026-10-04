import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { resolveFacets, buildPath, allFacetPaths, isKnownCity } from "@/lib/slugs";
import { demoAdminProperties } from "@/lib/demo-studio";
import { demoProperties } from "@/lib/demo-data";
import { localities, localityCount, featuredLocalities } from "@/config/site";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROUTING AND FIXTURES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Two things that have both broken before:
 *
 *  1. The facet router generates ~2,900 static pages. If a generated path does
 *     not resolve back to the facets it was built from, that page either 404s
 *     or — worse — renders the wrong result set under a canonical URL.
 *
 *  2. The demo fixtures stand in for database rows. When they drift from the
 *     real row shape the UI renders `undefined` silently: the studio listings
 *     table shipped "412 views · enq." with a missing number for exactly this
 *     reason, because the page cast the fixtures `as never[]`.
 */

describe("facet routing round-trips", () => {
  const paths = allFacetPaths();

  test("generates a substantial crawl surface", () => {
    assert.ok(paths.length > 100, `only ${paths.length} facet paths generated`);
  });

  test("every generated path resolves, and resolves to itself", () => {
    const broken: string[] = [];

    for (const { city, facets } of paths) {
      const resolved = resolveFacets(city, facets);
      if (!resolved) {
        broken.push(`/${city}/${facets.join("/")} → does not resolve`);
        continue;
      }
      // The canonical path a page advertises must be the path it was reached
      // by, or two URLs compete for the same content.
      const rebuilt = buildPath(resolved);
      const original = `/${[city, ...facets].join("/")}`;
      if (rebuilt !== original) {
        broken.push(`${original} → canonicalises to ${rebuilt}`);
      }
      if (resolved.canonicalPath !== original) {
        broken.push(`${original} → canonicalPath is ${resolved.canonicalPath}`);
      }
    }

    assert.deepEqual(broken.slice(0, 10), [], broken.slice(0, 10).join("\n"));
  });

  test("rejects unknown cities and over-deep paths", () => {
    assert.equal(resolveFacets("not-a-city", []), null);
    assert.equal(isKnownCity("not-a-city"), false);
    assert.equal(isKnownCity("ahmedabad"), true);
    // The crawl surface is deliberately capped at two facet segments.
    assert.equal(resolveFacets("ahmedabad", ["shela", "3-bhk-flats", "extra"]), null);
  });

  test("rejects junk segments rather than rendering an empty page", () => {
    for (const junk of [["../../etc"], ["%00"], ["x".repeat(200)], ["undefined"]]) {
      assert.equal(
        resolveFacets("ahmedabad", junk),
        null,
        `"${junk[0]?.slice(0, 20)}" resolved when it should not`,
      );
    }
  });
});

describe("locality config", () => {
  test("slugs are unique", () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const l of localities) {
      if (seen.has(l.slug)) dupes.push(l.slug);
      seen.add(l.slug);
    }
    assert.deepEqual(dupes, [], `duplicate locality slugs: ${dupes.join(", ")}`);
  });

  test("the advertised count is derived, not hand-written", () => {
    // The site once claimed "53 localities" from an array of 48.
    assert.equal(localityCount, localities.length);
  });

  test("slugs are URL-safe and featured areas are a real subset", () => {
    for (const l of localities) {
      assert.ok(/^[a-z0-9-]+$/.test(l.slug), `unsafe slug: ${l.slug}`);
    }
    for (const f of featuredLocalities) {
      assert.ok(localities.includes(f), `${f.slug} is not in the main list`);
    }
  });

  test("core localities carry a rate band, covered ones do not invent one", () => {
    for (const l of localities) {
      if (l.tier === "covered") {
        assert.equal(
          l.pricePerSqft,
          undefined,
          `${l.slug} is "covered" but carries an invented rate band`,
        );
      }
      if (l.pricePerSqft) {
        const [lo, hi] = l.pricePerSqft;
        assert.ok(lo > 0 && hi > lo, `${l.slug} has a nonsensical rate band`);
      }
    }
  });
});

describe("demo fixtures satisfy the shapes the UI reads", () => {
  const ADMIN_REQUIRED = [
    "id", "slug", "title", "status", "city", "locality_slug", "property_type",
    "category", "price_on_request", "is_featured", "is_exclusive",
    "rera_verified", "view_count", "enquiry_count", "updated_at",
  ] as const;

  test("every admin row defines every column the table renders", () => {
    const rows = demoAdminProperties();
    assert.ok(rows.length > 0, "no demo admin rows");

    const missing: string[] = [];
    for (const row of rows) {
      for (const key of ADMIN_REQUIRED) {
        if ((row as Record<string, unknown>)[key] === undefined) {
          missing.push(`${row.slug}.${key}`);
        }
      }
    }
    assert.deepEqual(missing, [], `undefined admin fields:\n${missing.join("\n")}`);
  });

  test("admin rows include a draft, so the empty-state is not the only state", () => {
    assert.ok(
      demoAdminProperties().some((p) => p.status === "draft"),
      "no draft fixture — the dashboard 'needs attention' panel would always be empty",
    );
  });

  test("every demo listing points at a locality that exists", () => {
    const known = new Set(localities.map((l) => l.slug));
    const orphans = demoProperties
      .filter((p) => !known.has(p.locality_slug))
      .map((p) => `${p.slug} → ${p.locality_slug}`);
    assert.deepEqual(orphans, [], `listings in unknown localities:\n${orphans.join("\n")}`);
  });

  test("every demo listing resolves to a real facet page", () => {
    const unreachable = demoProperties
      .filter((p) => !resolveFacets(p.city, [p.locality_slug]))
      .map((p) => `${p.slug} (${p.city}/${p.locality_slug})`);
    assert.deepEqual(unreachable, [], unreachable.join("\n"));
  });

  test("a published listing has a price or is explicitly price-on-request", () => {
    // Mirrors the `properties_price_required_when_live` constraint in
    // schema.sql, so the fixtures could actually be inserted.
    const violations = demoProperties
      .filter((p) => p.status === "published" && p.price == null && !p.price_on_request)
      .map((p) => p.slug);
    assert.deepEqual(violations, [], `would violate the live-price constraint: ${violations}`);
  });
});
