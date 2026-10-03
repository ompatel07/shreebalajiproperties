import {
  bhkOptions,
  budgetBands,
  listingCategories,
  localityBySlug,
  possessionStatuses,
  propertyTypes,
  site,
  type Locality,
} from "@/config/site";
import type { PropertyCategory, PossessionStatus } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROGRAMMATIC SEO — URL ⇄ FILTER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * One route, `/[city]/[[...facets]]`, serves every landing page:
 *
 *   /ahmedabad                               → city hub
 *   /ahmedabad/flats                         → type
 *   /ahmedabad/3-bhk-flats                   → bhk + type
 *   /ahmedabad/under-50-lakh                 → budget
 *   /ahmedabad/ready-to-move                 → possession
 *   /ahmedabad/residential-properties        → category
 *   /ahmedabad/shela                         → locality
 *   /ahmedabad/shela/3-bhk-flats             → locality + bhk + type
 *   /ahmedabad/shela/under-50-lakh           → locality + budget
 *
 * Every combination is server-rendered with its own <title>, H1, intro copy,
 * canonical and JSON-LD. Anything that does not resolve cleanly 404s rather
 * than rendering an empty page, which is what keeps this from being a
 * doorway-page farm.
 *
 * Hard rule enforced here and in robots.ts: **nothing indexable lives behind
 * a `?`.** Query strings are for interactive narrowing only, and those
 * responses are served `noindex, follow` with a canonical to the clean path.
 */

export interface ResolvedFacets {
  city: { slug: string; name: string };
  locality: Locality | null;
  propertyType: (typeof propertyTypes)[number] | null;
  bhk: number | null;
  budget: (typeof budgetBands)[number] | null;
  possession: (typeof possessionStatuses)[number] | null;
  category: PropertyCategory | null;
  /** The clean, canonical path for this exact facet combination. */
  canonicalPath: string;
}

/** Pre-computed `3-bhk-flats` style slugs → { bhk, type }. */
const bhkTypeIndex = new Map<string, { bhk: number; type: (typeof propertyTypes)[number] }>();
for (const type of propertyTypes) {
  if (type.category !== "residential") continue;
  for (const bhk of bhkOptions) {
    bhkTypeIndex.set(`${bhk}-bhk-${type.slug}`, { bhk, type });
  }
  // The half-room configuration, genuinely common in Ahmedabad.
  bhkTypeIndex.set(`2-5-bhk-${type.slug}`, { bhk: 2.5, type });
}

/**
 * Each taxonomy array is `as const`, which narrows `.slug` to a union of
 * literals. Left alone, that makes every Map key a literal type and every
 * lookup with a plain `string` a type error. The explicit `<string, T>`
 * widens the key while keeping the value fully typed.
 */
const typeIndex = new Map<string, (typeof propertyTypes)[number]>(
  propertyTypes.map((t) => [t.slug, t]),
);
const budgetIndex = new Map<string, (typeof budgetBands)[number]>(
  budgetBands.map((b) => [b.slug, b]),
);
const possessionIndex = new Map<string, (typeof possessionStatuses)[number]>(
  possessionStatuses.map((p) => [p.slug, p]),
);
const categoryIndex = new Map<string, (typeof listingCategories)[number]>(
  listingCategories.map((c) => [c.slug, c]),
);
const cityIndex = new Map<string, (typeof site.cities)[number]>(
  site.cities.map((c) => [c.slug, c]),
);

export function isKnownCity(slug: string): boolean {
  return cityIndex.has(slug);
}

/**
 * Resolve URL segments into a filter set.
 *
 * Returns `null` for anything unrecognised — an unknown segment, a duplicated
 * facet, or a locality that does not belong to the city in the URL. The route
 * turns that into a 404.
 */
export function resolveFacets(
  citySlug: string,
  segments: string[],
): ResolvedFacets | null {
  const city = cityIndex.get(citySlug);
  if (!city) return null;
  if (segments.length > 2) return null; // keeps the crawl surface bounded

  const out: ResolvedFacets = {
    city: { slug: city.slug, name: city.name },
    locality: null,
    propertyType: null,
    bhk: null,
    budget: null,
    possession: null,
    category: null,
    canonicalPath: `/${city.slug}`,
  };

  for (const raw of segments) {
    const segment = raw.toLowerCase();

    // Locality must come first in the path and must sit in this city.
    const locality = localityBySlug.get(segment);
    if (locality) {
      if (out.locality) return null;
      if (locality.city !== city.slug) return null;
      // A locality may only be the first segment: /ahmedabad/shela/3-bhk-flats
      // is canonical, /ahmedabad/3-bhk-flats/shela is not.
      if (out.propertyType || out.bhk || out.budget || out.possession || out.category) {
        return null;
      }
      out.locality = locality;
      continue;
    }

    const bhkType = bhkTypeIndex.get(segment);
    if (bhkType) {
      if (out.propertyType || out.bhk) return null;
      out.bhk = bhkType.bhk;
      out.propertyType = bhkType.type;
      out.category = bhkType.type.category as PropertyCategory;
      continue;
    }

    const type = typeIndex.get(segment);
    if (type) {
      if (out.propertyType) return null;
      out.propertyType = type;
      out.category = type.category as PropertyCategory;
      continue;
    }

    const budget = budgetIndex.get(segment);
    if (budget) {
      if (out.budget) return null;
      out.budget = budget;
      continue;
    }

    const possession = possessionIndex.get(segment);
    if (possession) {
      if (out.possession) return null;
      out.possession = possession;
      continue;
    }

    const category = categoryIndex.get(segment);
    if (category) {
      if (out.category) return null;
      out.category = category.category as PropertyCategory;
      continue;
    }

    return null; // unknown segment
  }

  out.canonicalPath = buildPath(out);
  return out;
}

/** Rebuild the canonical path from a resolved facet set. */
export function buildPath(f: ResolvedFacets): string {
  const parts: string[] = [f.city.slug];
  if (f.locality) parts.push(f.locality.slug);

  if (f.bhk && f.propertyType) {
    parts.push(`${String(f.bhk).replace(".", "-")}-bhk-${f.propertyType.slug}`);
  } else if (f.propertyType) {
    parts.push(f.propertyType.slug);
  } else if (f.budget) {
    parts.push(f.budget.slug);
  } else if (f.possession) {
    parts.push(f.possession.slug);
  } else if (f.category) {
    const cat = listingCategories.find((c) => c.category === f.category);
    if (cat) parts.push(cat.slug);
  }

  return `/${parts.join("/")}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COPY GENERATION
   Each landing page needs a distinct H1, title, description and intro
   paragraph. Templated — but templated from the facts of the facet, so no two
   pages read the same. Generic pages are what get a site classified as thin
   content; these carry locality price data and real counts.
   ═══════════════════════════════════════════════════════════════════════════ */

/** The noun phrase at the centre of every string: "3 BHK Flats". */
function subject(f: ResolvedFacets): string {
  const bhk = f.bhk ? `${String(f.bhk).replace(/\.0$/, "")} BHK ` : "";
  if (f.propertyType) return `${bhk}${f.propertyType.name}`;
  if (f.category === "commercial") return "Commercial Property";
  if (f.category === "land") return "Plots & Land";
  if (f.category === "residential") return "Residential Property";
  return "Property";
}

function place(f: ResolvedFacets): string {
  return f.locality ? `${f.locality.name}, ${f.city.name}` : f.city.name;
}

export function facetHeading(f: ResolvedFacets): string {
  const base = `${subject(f)} in ${place(f)}`;
  if (f.budget) return `${base} ${f.budget.label.replace("₹", "under ₹").replace("Under under", "under")}`;
  if (f.possession) return `${base} — ${f.possession.label}`;
  return base;
}

export function facetTitle(f: ResolvedFacets, count: number): string {
  const n = count > 0 ? `${count} ` : "";
  const base = `${n}${subject(f)} for Sale in ${place(f)}`;

  if (f.budget) return `${base} ${f.budget.label} | ${site.name}`;
  if (f.possession) return `${base} — ${f.possession.label} | ${site.name}`;
  return `${base} | RERA-Verified | ${site.name}`;
}

export function facetDescription(f: ResolvedFacets, count: number): string {
  const n = count > 0 ? `${count} RERA-verified` : "RERA-verified";
  const bits: string[] = [`Browse ${n} ${subject(f).toLowerCase()} in ${place(f)}.`];

  if (f.budget) bits.push(`Priced ${f.budget.label.toLowerCase()}.`);
  if (f.possession) bits.push(`${f.possession.label} inventory.`);
  // Only quote a rate where we actually hold one. Covered-tier areas get a
  // real page without an invented number.
  if (f.locality?.pricePerSqft) {
    const [lo, hi] = f.locality.pricePerSqft;
    bits.push(`Indicative rate ₹${lo.toLocaleString("en-IN")}–${hi.toLocaleString("en-IN")}/sq.ft.`);
  }
  bits.push(`Photos, floor plans and honest advice from ${site.name}.`);

  return bits.join(" ").slice(0, 300);
}

/**
 * The intro paragraph rendered under the H1. Built from locality data so each
 * page says something true and specific rather than restating its own title.
 */
export function facetIntro(f: ResolvedFacets, count: number): string {
  if (f.locality) {
    const what = subject(f).toLowerCase();
    const have =
      count > 0
        ? `We currently market ${count} ${count === 1 ? "listing" : "listings"} matching ${what} here`
        : `We do not have ${what} listed here this week`;

    // Core tier: real editorial plus an indicative band.
    if (f.locality.blurb && f.locality.pricePerSqft) {
      const [lo, hi] = f.locality.pricePerSqft;
      return `${f.locality.blurb} ${have}, against an indicative rate of ₹${lo.toLocaleString(
        "en-IN",
      )}–${hi.toLocaleString("en-IN")} per sq.ft on carpet.`;
    }

    // Covered tier: say something true rather than inventing a number.
    return `${f.locality.name} is one of the ${localityCountFor(
      f,
    )} areas we cover across ${f.city.name}. ${have}. We do not publish an indicative rate for ${
      f.locality.name
    } because we would rather quote you the actual comparables for a specific building than a city-wide average — ask us and we will send them.`;
  }

  const where = f.city.name;
  if (f.budget) {
    return `${f.budget.label} is one of the most actively traded bands in ${where}. Below is every ${subject(
      f,
    ).toLowerCase()} we can currently stand behind in that range — each one RERA-checked, with the title and approvals verified before it goes on this page.`;
  }
  if (f.possession) {
    return `${f.possession.label} inventory behaves very differently from the rest of the market: pricing, negotiating room and bank disbursal all change with the possession date. These are the ${subject(
      f,
    ).toLowerCase()} options in ${where} at that stage right now.`;
  }
  return `A complete, current view of ${subject(
    f,
  ).toLowerCase()} across ${where} — ${localityCountFor(f)} localities, every listing RERA-checked, and no inventory we would not buy ourselves.`;
}

function localityCountFor(f: ResolvedFacets): number {
  return [...localityBySlug.values()].filter((l) => l.city === f.city.slug).length;
}

/** Breadcrumb trail for both the UI and BreadcrumbList schema. */
export function facetBreadcrumbs(f: ResolvedFacets): { name: string; path: string }[] {
  const trail = [
    { name: "Home", path: "/" },
    { name: f.city.name, path: `/${f.city.slug}` },
  ];

  if (f.locality) {
    trail.push({ name: f.locality.name, path: `/${f.city.slug}/${f.locality.slug}` });
  }

  const leaf = buildPath(f);
  if (leaf !== trail[trail.length - 1]!.path) {
    trail.push({ name: facetHeading(f), path: leaf });
  }

  return trail;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATIC PATH GENERATION
   The exact set of facet pages that get pre-rendered and sitemapped.
   Deliberately curated: every combination of every facet would be ~40,000
   near-identical URLs, which is a crawl-budget liability, not an asset.
   ═══════════════════════════════════════════════════════════════════════════ */

export function allFacetPaths(): { city: string; facets: string[] }[] {
  const paths: { city: string; facets: string[] }[] = [];

  for (const city of site.cities) {
    const cityLocalities = [...localityBySlug.values()].filter((l) => l.city === city.slug);

    // City hub
    paths.push({ city: city.slug, facets: [] });

    // Categories, types, budgets, possession — city-wide
    for (const c of listingCategories) paths.push({ city: city.slug, facets: [c.slug] });
    for (const t of propertyTypes) paths.push({ city: city.slug, facets: [t.slug] });
    for (const b of budgetBands) paths.push({ city: city.slug, facets: [b.slug] });
    for (const p of possessionStatuses) paths.push({ city: city.slug, facets: [p.slug] });

    // BHK × residential type, city-wide. This is the highest-intent query
    // shape in Indian property search ("3 bhk flats in ahmedabad").
    for (const t of propertyTypes.filter((x) => x.category === "residential")) {
      for (const bhk of bhkOptions) {
        paths.push({ city: city.slug, facets: [`${bhk}-bhk-${t.slug}`] });
      }
    }

    // Locality hubs, and the two facet shapes worth having per locality.
    for (const l of cityLocalities) {
      paths.push({ city: city.slug, facets: [l.slug] });

      for (const t of ["flats", "villas", "bungalows", "penthouses", "plots", "offices"]) {
        paths.push({ city: city.slug, facets: [l.slug, t] });
      }
      for (const bhk of [2, 3, 4, 5]) {
        paths.push({ city: city.slug, facets: [l.slug, `${bhk}-bhk-flats`] });
      }
      for (const b of budgetBands) {
        paths.push({ city: city.slug, facets: [l.slug, b.slug] });
      }
      paths.push({ city: city.slug, facets: [l.slug, "ready-to-move"] });
    }
  }

  return paths;
}

/** Map a possession facet onto the DB enum. */
export function possessionToEnum(slug: string): PossessionStatus | null {
  return possessionStatuses.some((p) => p.slug === slug)
    ? (slug as PossessionStatus)
    : null;
}
