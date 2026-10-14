import { budgetBands, localities, propertyTypes } from "@/config/site";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEARCH → URL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Turns what a visitor picked in the homepage search into a URL. Pulled out of
 * the component so it can be unit-tested, because the rule it encodes matters
 * more than it looks:
 *
 *   When the combination maps onto one of the canonical landing pages —
 *   `/ahmedabad/shela/3-bhk-flats` — go THERE, not to
 *   `/properties?locality=shela&bhk=3&type=flats`.
 *
 * The canonical pages are the indexable ones. Every search a visitor shares
 * or bookmarks then points at a page that can rank, instead of leaking into a
 * `noindex` query-string view. Query strings are used only for combinations
 * no canonical page exists for.
 */

export interface SearchInput {
  query?: string;
  locality?: string;
  type?: string;
  budget?: string;
  bhk?: string;
  /** Possession facet slug, e.g. "new-launch" — set by the New Projects tab. */
  possession?: string;
  /**
   * Category facet slug, e.g. "commercial-properties" — the broadest facet,
   * used when a tab implies a category but no specific type was chosen.
   */
  category?: string;
}

const residentialSlugs = new Set<string>(
  propertyTypes.filter((t) => t.category === "residential").map((t) => t.slug),
);

function budgetParams(budget: string | undefined, params = new URLSearchParams()) {
  const band = budgetBands.find((b) => b.slug === budget);
  if (band) {
    params.set("min", String(band.min));
    if (band.max) params.set("max", String(band.max));
  }
  return params;
}

export function searchPath(input: SearchInput): string {
  const { locality, type, budget, bhk, possession, category } = input;
  const query = input.query?.trim();

  const city = locality
    ? (localities.find((l) => l.slug === locality)?.city ?? "ahmedabad")
    : "ahmedabad";

  // Free text cannot be mapped to a facet with confidence — the search page.
  if (query) {
    const params = new URLSearchParams({ q: query });
    if (locality) params.set("locality", locality);
    if (type) params.set("type", type);
    if (bhk) params.set("bhk", bhk);
    if (possession) params.set("possession", possession);
    budgetParams(budget, params);
    return `/properties?${params}`;
  }

  const segments: string[] = [];
  if (locality) segments.push(locality);

  // At most ONE facet segment after the locality. Pick the most specific the
  // visitor gave us; anything left over travels as a query parameter.
  if (bhk && type && residentialSlugs.has(type)) {
    segments.push(`${bhk}-bhk-${type}`);
  } else if (type) {
    segments.push(type);
  } else if (bhk) {
    // A bare "3 BHK" in this market overwhelmingly means a flat.
    segments.push(`${bhk}-bhk-flats`);
  } else if (possession) {
    segments.push(possession);
  } else if (category) {
    // Before budget: "commercial under ₹2 Cr" should land on commercial
    // property with a budget filter, not on a mixed budget page.
    segments.push(category);
  } else if (budget) {
    segments.push(budget);
  }

  const path = `/${city}${segments.length ? `/${segments.join("/")}` : ""}`;

  // Budget not already expressed as the facet segment rides along as params.
  const budgetIsSegment = segments[segments.length - 1] === budget;
  const params = budget && !budgetIsSegment ? budgetParams(budget) : new URLSearchParams();
  // Possession that lost out to a more specific facet still applies.
  if (possession && segments[segments.length - 1] !== possession) {
    params.set("possession", possession);
  }

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
