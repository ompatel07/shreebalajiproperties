import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { searchPath } from "@/lib/search-path";
import { resolveFacets } from "@/lib/slugs";
import { budgetBands, featuredLocalities, possessionStatuses, propertyTypes } from "@/config/site";

/**
 * The homepage search decides which page a visitor lands on. Two things must
 * hold: it prefers canonical, indexable landing pages over query strings, and
 * it never silently throws away something the visitor chose.
 */

describe("searchPath — canonical landings", () => {
  test("nothing chosen lands on the city", () => {
    assert.equal(searchPath({}), "/ahmedabad");
  });

  test("an area alone lands on the area page", () => {
    assert.equal(searchPath({ locality: "shela" }), "/ahmedabad/shela");
  });

  test("area + bedrooms + type lands on the combined page", () => {
    assert.equal(
      searchPath({ locality: "shela", bhk: "3", type: "flats" }),
      "/ahmedabad/shela/3-bhk-flats",
    );
  });

  test("a budget alone lands on the budget page", () => {
    assert.equal(searchPath({ budget: "under-50-lakh" }), "/ahmedabad/under-50-lakh");
  });

  test("the Commercial tab with no type lands on all commercial property", () => {
    assert.equal(
      searchPath({ category: "commercial-properties" }),
      "/ahmedabad/commercial-properties",
    );
    // With a budget it stays on commercial, budget as a filter.
    const url = searchPath({ category: "commercial-properties", budget: "1-crore-to-2-crore" });
    assert.ok(url.startsWith("/ahmedabad/commercial-properties?"), url);
  });

  test("the New Projects tab lands on new launches", () => {
    assert.equal(searchPath({ possession: "new-launch" }), "/ahmedabad/new-launch");
  });

  test("a Gandhinagar area routes to the Gandhinagar city", () => {
    const gn = featuredLocalities.find((l) => l.city === "gandhinagar");
    if (!gn) return; // nothing featured there in this config
    assert.ok(searchPath({ locality: gn.slug }).startsWith("/gandhinagar/"));
  });
});

describe("searchPath — nothing the visitor chose is dropped", () => {
  test("bedrooms + budget keeps BOTH (the old code dropped the bedrooms)", () => {
    const url = searchPath({ bhk: "3", budget: "50-lakh-to-75-lakh" });
    assert.ok(url.startsWith("/ahmedabad/3-bhk-flats"), url);
    assert.ok(url.includes("min=5000000") && url.includes("max=7500000"), url);
  });

  test("type + budget keeps the budget as a filter", () => {
    const url = searchPath({ locality: "thaltej", type: "villas", budget: "above-5-crore" });
    assert.ok(url.startsWith("/ahmedabad/thaltej/villas"), url);
    assert.ok(url.includes("min=50000000"), url);
  });

  test("possession that loses to a type still applies as a filter", () => {
    const url = searchPath({ type: "flats", possession: "new-launch" });
    assert.ok(url.startsWith("/ahmedabad/flats"), url);
    assert.ok(url.includes("possession=new-launch"), url);
  });

  test("free text goes to search and carries every other choice", () => {
    const url = searchPath({ query: "corner unit", locality: "shela", bhk: "3", budget: "1-crore-to-2-crore" });
    assert.ok(url.startsWith("/properties?"), url);
    const p = new URL(url, "https://x").searchParams;
    assert.equal(p.get("q"), "corner unit");
    assert.equal(p.get("locality"), "shela");
    assert.equal(p.get("bhk"), "3");
    assert.equal(p.get("min"), "10000000");
  });

  test("whitespace-only text is treated as no text", () => {
    assert.equal(searchPath({ query: "   ", locality: "bopal" }), "/ahmedabad/bopal");
  });
});

describe("searchPath — every canonical path it produces is a real page", () => {
  // A search that routes to a facet the router does not recognise is a 404
  // for the visitor. Sweep realistic combinations and resolve each path.
  const areas = [undefined, ...featuredLocalities.slice(0, 4).map((l) => l.slug)];
  const types = [undefined, ...propertyTypes.slice(0, 6).map((t) => t.slug)];
  const bhks = [undefined, "1", "2", "3", "4"];
  const budgets = [undefined, ...budgetBands.map((b) => b.slug)];
  const possessions = [undefined, ...possessionStatuses.map((p) => p.slug)];
  const categories = [undefined, "residential-properties", "commercial-properties", "land-properties"];

  test("combinations resolve", () => {
    const broken: string[] = [];
    let checked = 0;
    for (const locality of areas)
      for (const type of types)
        for (const bhk of bhks)
          for (const budget of budgets.slice(0, 3))
            for (const possession of possessions.slice(0, 2))
            for (const category of categories) {
              const url = searchPath({ locality, type, bhk, budget, possession, category });
              const [path] = url.split("?");
              const [, city, ...facets] = path!.split("/");
              checked++;
              if (!resolveFacets(city!, facets)) broken.push(url);
            }
    assert.ok(checked > 500, `only ${checked} combinations checked`);
    assert.deepEqual(broken.slice(0, 8), [], `routes to pages that do not exist:\n${broken.slice(0, 8).join("\n")}`);
  });
});
