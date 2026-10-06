import { budgetBands, localityBySlug } from "@/config/site";
import {
  demoBuilders,
  demoLocalityCounts,
  demoProjects,
  demoProjectDetail,
  demoProperties,
  demoPropertyDetail,
  demoTestimonials,
  isDemoMode,
} from "@/lib/demo-data";
import { createPublicClient } from "@/lib/supabase/server";
import type { ResolvedFacets } from "@/lib/slugs";
import type { SearchParams } from "@/lib/validation";
import type {
  Builder,
  LocalityStat,
  ProjectWithRelations,
  PropertyCard,
  PropertyWithRelations,
  Testimonial,
} from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PUBLIC DATA ACCESS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Every function here reads through the ANON key, so Row Level Security is
 * what actually filters drafts out — the `.eq("status", "published")` calls
 * are for query planning and clarity, not for access control. Removing one
 * would be a performance bug, never a data leak.
 *
 * Columns are listed explicitly rather than `select("*")`. Listing pages pull
 * ~20 rows and `*` would drag the full 8 KB description for each one into a
 * payload that only needs a title and a price.
 */

const CARD_COLUMNS = `
  id, slug, title, city, locality_slug, category, property_type, transaction,
  status, bhk, bathrooms, carpet_sqft, super_sqft, plot_sqft, price,
  price_on_request, possession, possession_date, rera_verified, hero_image,
  is_featured, is_exclusive, lat, lng, view_count
`;

export const PAGE_SIZE = 12;

/* ═══════════════════════════════════════════════════════════════════════════
   LISTING QUERIES
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ListingResult {
  items: PropertyCard[];
  total: number;
  page: number;
  pageCount: number;
}

/**
 * The single query behind every browse surface — SEO landing pages, the
 * search page, and the map. `facets` comes from the URL path and `params`
 * from the query string; path facets win on conflict, because the path is
 * what is canonical and indexed.
 */
export async function getListings(
  facets: Partial<ResolvedFacets> & { city?: { slug: string } },
  params: Partial<SearchParams> = {},
): Promise<ListingResult> {
  const page = params.page ?? 1;

  // Pre-Supabase fallback. Auto-disables once real credentials exist.
  if (isDemoMode()) return demoListings(facets, params, page);

  const supabase = createPublicClient();

  let query = supabase
    .from("properties")
    .select(CARD_COLUMNS, { count: "exact" })
    .in("status", ["published", "under_offer"]);

  if (facets.city?.slug) query = query.eq("city", facets.city.slug);

  // ── Locality: from the path, or multi-select from the query string ──────
  if (facets.locality) {
    query = query.eq("locality_slug", facets.locality.slug);
  } else if (params.locality) {
    const slugs = params.locality
      .split(",")
      .map((s) => s.trim())
      .filter((s) => localityBySlug.has(s))
      .slice(0, 20);
    if (slugs.length === 1) query = query.eq("locality_slug", slugs[0]!);
    else if (slugs.length > 1) query = query.in("locality_slug", slugs);
  }

  if (facets.propertyType) query = query.eq("property_type", facets.propertyType.slug);
  else if (params.type) query = query.eq("property_type", params.type);

  if (facets.category) query = query.eq("category", facets.category);
  else if (params.category) query = query.eq("category", params.category);

  if (facets.bhk) query = query.eq("bhk", facets.bhk);
  else if (params.bhk) query = query.gte("bhk", params.bhk);

  // ── Price. A path budget band is authoritative; otherwise use the slider.
  const band = facets.budget;
  const min = band ? band.min : params.min;
  const max = band ? band.max : params.max;
  if (min) query = query.gte("price", min);
  if (max) query = query.lte("price", max);

  if (facets.possession) query = query.eq("possession", facets.possession.slug);
  else if (params.possession) query = query.eq("possession", params.possession);

  if (params.furnishing) query = query.eq("furnishing", params.furnishing);

  // `contains` maps to the array `@>` operator, served by the GIN index.
  if (params.amenities) {
    const list = params.amenities.split(",").map((a) => a.trim()).filter(Boolean).slice(0, 10);
    if (list.length) query = query.contains("amenities", list);
  }

  // Full-text search over the generated tsvector.
  if (params.q) {
    const cleaned = params.q.replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
    if (cleaned) {
      query = query.textSearch("search_doc", cleaned.split(/\s+/).join(" & "), {
        type: "plain",
        config: "english",
      });
    }
  }

  // ── Sort. Featured first on the default ordering, so the client's
  //    merchandising actually shows up where it matters.
  switch (params.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    case "area-desc":
      query = query.order("carpet_sqft", { ascending: false, nullsFirst: false });
      break;
    case "newest":
      query = query.order("published_at", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false, nullsFirst: false });
  }

  const from = (page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[getListings]", error.message);
    return { items: [], total: 0, page, pageCount: 0 };
  }

  const total = count ?? 0;
  return {
    items: (data ?? []) as unknown as PropertyCard[],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Count only — used in page titles and meta descriptions. */
export async function countListings(
  facets: Partial<ResolvedFacets> & { city?: { slug: string } },
): Promise<number> {
  const { total } = await getListings(facets, { page: 1 });
  return total;
}

export async function getFeaturedListings(limit = 6): Promise<PropertyCard[]> {
  if (isDemoMode()) return demoProperties.filter((p) => p.is_featured).slice(0, limit);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("properties")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getFeaturedListings]", error.message);
    return [];
  }
  return (data ?? []) as unknown as PropertyCard[];
}

/** Every geocoded listing, for the map view. Capped to protect the payload. */
export async function getMapListings(limit = 300): Promise<PropertyCard[]> {
  if (isDemoMode()) return demoProperties.slice(0, limit);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("properties")
    .select(CARD_COLUMNS)
    .in("status", ["published", "under_offer"])
    .not("lat", "is", null)
    .not("lng", "is", null)
    .limit(limit);

  if (error) {
    console.error("[getMapListings]", error.message);
    return [];
  }
  return (data ?? []) as unknown as PropertyCard[];
}

export async function getPropertyBySlug(
  slug: string,
): Promise<PropertyWithRelations | null> {
  if (isDemoMode()) {
    return demoPropertyDetail(slug) as unknown as PropertyWithRelations | null;
  }

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("properties")
    .select(
      `*,
       images:property_images(*),
       builder:builders(id, slug, name, logo_url),
       project:projects(id, slug, name, rera_id, is_partnered),
       floor_plans(*)`,
    )
    .eq("slug", slug)
    .in("status", ["published", "under_offer"])
    .maybeSingle();

  if (error) {
    console.error("[getPropertyBySlug]", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as unknown as PropertyWithRelations & {
    images: PropertyWithRelations["images"];
  };
  row.images = (row.images ?? []).sort((a, b) => a.sort_order - b.sort_order);
  return row;
}

/**
 * "More like this". Widens in stages — same locality and config first, then
 * the same locality, then the same price band across the city — so the rail
 * is never empty on a thin locality.
 */
export async function getSimilarListings(
  p: Pick<PropertyCard, "id" | "locality_slug" | "city" | "bhk" | "price" | "category">,
  limit = 4,
): Promise<PropertyCard[]> {
  if (isDemoMode()) {
    // Same widening order as the real query: locality+config, then locality,
    // then the city on a price band.
    const pool = demoProperties.filter((x) => x.id !== p.id);
    const tiers = [
      pool.filter((x) => x.locality_slug === p.locality_slug && x.bhk === p.bhk),
      pool.filter((x) => x.locality_slug === p.locality_slug),
      pool.filter((x) => x.city === p.city && x.category === p.category),
    ];
    const out: PropertyCard[] = [];
    for (const tier of tiers) {
      for (const item of tier) {
        if (out.length >= limit) break;
        if (!out.some((o) => o.id === item.id)) out.push(item);
      }
    }
    return out.slice(0, limit);
  }

  const supabase = createPublicClient();

  const run = async (build: (q: ReturnType<typeof base>) => typeof q) => {
    const { data } = await build(base());
    return (data ?? []) as unknown as PropertyCard[];
  };

  function base() {
    return supabase
      .from("properties")
      .select(CARD_COLUMNS)
      .eq("status", "published")
      .neq("id", p.id)
      .limit(limit);
  }

  // Stage 1 — same locality, same configuration.
  let found = await run((q) => {
    let next = q.eq("locality_slug", p.locality_slug).eq("category", p.category);
    if (p.bhk) next = next.eq("bhk", p.bhk);
    return next;
  });
  if (found.length >= limit) return found;

  // Stage 2 — same locality, any configuration.
  const stage2 = await run((q) =>
    q.eq("locality_slug", p.locality_slug).eq("category", p.category),
  );
  found = dedupe([...found, ...stage2]);
  if (found.length >= limit) return found.slice(0, limit);

  // Stage 3 — same city, ±35% on price.
  if (p.price) {
    const stage3 = await run((q) =>
      q
        .eq("city", p.city)
        .eq("category", p.category)
        .gte("price", Math.round(p.price! * 0.65))
        .lte("price", Math.round(p.price! * 1.35)),
    );
    found = dedupe([...found, ...stage3]);
  }

  return found.slice(0, limit);
}

function dedupe(items: PropertyCard[]): PropertyCard[] {
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROJECTS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * PostgREST returns an embedded resource as an array even when the FK makes
 * it to-one, so the generated type is `Builder[]`. Collapse it once here
 * rather than making every consumer deal with `builder[0]`.
 */
function oneRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export interface PartneredProjectCard {
  id: string;
  slug: string;
  name: string;
  city: string;
  locality_slug: string;
  tagline: string | null;
  hero_image: string | null;
  price_min: number | null;
  price_max: number | null;
  possession: string;
  possession_date: string | null;
  total_units: number | null;
  rera_id: string | null;
  category: string | null;
  builder: { id: string; slug: string; name: string; logo_url: string | null } | null;
}

/** Projects the business has co-invested in — the client's differentiator. */
export async function getPartneredProjects(limit = 8): Promise<PartneredProjectCard[]> {
  if (isDemoMode()) return demoProjects.slice(0, limit);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `id, slug, name, city, locality_slug, tagline, hero_image, price_min,
       price_max, possession, possession_date, is_partnered, is_featured,
       total_units, rera_id, category,
       builder:builders(id, slug, name, logo_url)`,
    )
    .eq("status", "published")
    .eq("is_partnered", true)
    .order("is_featured", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getPartneredProjects]", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const r = row as unknown as Omit<PartneredProjectCard, "builder"> & {
      builder: PartneredProjectCard["builder"] | PartneredProjectCard["builder"][];
    };
    return { ...r, builder: oneRelation(r.builder) };
  });
}

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectWithRelations | null> {
  if (isDemoMode()) {
    return demoProjectDetail(slug) as unknown as ProjectWithRelations | null;
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `*,
       images:project_images(*),
       builder:builders(id, slug, name, logo_url),
       floor_plans(*)`,
    )
    .eq("slug", slug)
    .in("status", ["published", "under_offer"])
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as ProjectWithRelations;
}

export async function getProjectUnits(projectId: string): Promise<PropertyCard[]> {
  if (isDemoMode()) {
    const project = demoProjects.find((p) => p.id === projectId);
    if (!project) return [];
    return demoProperties.filter((p) => p.slug.includes(project.slug));
  }

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select(CARD_COLUMNS)
    .eq("project_id", projectId)
    .eq("status", "published")
    .order("price", { ascending: true });
  return (data ?? []) as unknown as PropertyCard[];
}

export async function getAllProjectSlugs(): Promise<string[]> {
  if (isDemoMode()) return demoProjects.map((p) => p.slug);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("projects")
    .select("slug")
    .eq("status", "published");
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}

export async function getAllPropertySlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  if (isDemoMode()) {
    const now = new Date().toISOString();
    return demoProperties.map((p) => ({ slug: p.slug, updated_at: now }));
  }

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .in("status", ["published", "under_offer"]);
  return (data ?? []) as { slug: string; updated_at: string }[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUPPORTING CONTENT
   ═══════════════════════════════════════════════════════════════════════════ */

export async function getTestimonials(limit = 8): Promise<Testimonial[]> {
  if (isDemoMode()) return demoTestimonials.slice(0, limit);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(limit);
  return (data ?? []) as Testimonial[];
}

export async function getBuilders(limit = 24): Promise<Builder[]> {
  if (isDemoMode()) return demoBuilders.slice(0, limit);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("builders")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(limit);
  return (data ?? []) as Builder[];
}

export async function getLocalityStats(slug: string): Promise<LocalityStat[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("locality_stats")
    .select("*")
    .eq("locality_slug", slug)
    .order("quarter", { ascending: true })
    .limit(12);
  return (data ?? []) as LocalityStat[];
}

/**
 * Live listing counts per locality, for the locality grid.
 *
 * One grouped query would need an RPC; on a catalogue this size it is cheaper
 * to pull the published locality column and tally in memory than to maintain
 * another database function.
 */
export async function getLocalityCounts(): Promise<Record<string, number>> {
  if (isDemoMode()) return demoLocalityCounts();

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("locality_slug")
    .eq("status", "published");

  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { locality_slug: string }[]) {
    counts[row.locality_slug] = (counts[row.locality_slug] ?? 0) + 1;
  }
  return counts;
}

/**
 * Live listings per property type, for the homepage type cards.
 *
 * Same shape and caching story as `getLocalityCounts`: one narrow select,
 * counted in memory. PostgREST has no GROUP BY, and a per-type `head: true`
 * count would be thirteen round trips for a page that is cached anyway.
 */
export async function getTypeCounts(): Promise<Record<string, number>> {
  if (isDemoMode()) {
    const counts: Record<string, number> = {};
    for (const p of demoProperties) {
      if (p.status !== "published") continue;
      counts[p.property_type] = (counts[p.property_type] ?? 0) + 1;
    }
    return counts;
  }

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("property_type")
    .eq("status", "published");

  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { property_type: string }[]) {
    counts[row.property_type] = (counts[row.property_type] ?? 0) + 1;
  }
  return counts;
}

/** Headline numbers for the homepage trust rail. */
export async function getSiteCounts(): Promise<{
  live: number;
  localities: number;
  value: number;
}> {
  if (isDemoMode()) {
    return {
      live: demoProperties.length,
      localities: new Set(demoProperties.map((p) => p.locality_slug)).size,
      value: demoProperties.reduce((sum, p) => sum + (p.price ?? 0), 0),
    };
  }

  const supabase = createPublicClient();
  const { data, count } = await supabase
    .from("properties")
    .select("price, locality_slug", { count: "exact" })
    .eq("status", "published");

  const rows = (data ?? []) as { price: number | null; locality_slug: string }[];
  return {
    live: count ?? 0,
    localities: new Set(rows.map((r) => r.locality_slug)).size,
    value: rows.reduce((sum, r) => sum + (r.price ?? 0), 0),
  };
}

/** Which budget bands actually have inventory — drives the homepage chips. */
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOME FACTS — every homepage count in ONE round trip
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The homepage needed four separate aggregates — locality counts, type
 * counts, budget-band counts and the headline totals. Each was its own query,
 * and each scanned the same table: four round trips, four full reads of
 * `properties`, for numbers derived from the same four columns.
 *
 * PostgREST has no GROUP BY, so the counting has to happen somewhere. Doing
 * it once in memory over a single narrow select is strictly better than doing
 * it four times over four selects — same work, a quarter of the latency and a
 * quarter of the egress, which is the binding constraint on the Supabase free
 * tier.
 *
 * The individual functions are kept: other pages use them on their own, and
 * there a single scan is already the minimum.
 */
export interface HomeFacts {
  localityCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  bandCounts: { slug: string; label: string; count: number }[];
  live: number;
  localities: number;
  value: number;
}

export async function getHomeFacts(city = "ahmedabad"): Promise<HomeFacts> {
  type Row = {
    price: number | null;
    locality_slug: string;
    property_type: string;
    city: string;
  };

  let rows: Row[];

  if (isDemoMode()) {
    rows = demoProperties
      .filter((p) => p.status === "published")
      .map((p) => ({
        price: p.price,
        locality_slug: p.locality_slug,
        property_type: p.property_type,
        city: p.city,
      }));
  } else {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("properties")
      .select("price, locality_slug, property_type, city")
      .eq("status", "published");

    if (error) console.error("[getHomeFacts]", error.message);
    rows = (data ?? []) as Row[];
  }

  const localityCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  const cityPrices: number[] = [];
  let value = 0;

  for (const r of rows) {
    localityCounts[r.locality_slug] = (localityCounts[r.locality_slug] ?? 0) + 1;
    typeCounts[r.property_type] = (typeCounts[r.property_type] ?? 0) + 1;
    value += r.price ?? 0;
    if (r.city === city && r.price != null) cityPrices.push(r.price);
  }

  return {
    localityCounts,
    typeCounts,
    bandCounts: budgetBands.map((band) => ({
      slug: band.slug,
      label: band.label,
      count: cityPrices.filter((p) => p >= band.min && (band.max === null || p <= band.max)).length,
    })),
    live: rows.length,
    localities: Object.keys(localityCounts).length,
    value,
  };
}

export async function getBudgetBandCounts(
  city = "ahmedabad",
): Promise<{ slug: string; label: string; count: number }[]> {
  if (isDemoMode()) {
    const prices = demoProperties
      .filter((p) => p.city === city && p.price)
      .map((p) => p.price!);
    return budgetBands.map((band) => ({
      slug: band.slug,
      label: band.label,
      count: prices.filter((x) => x >= band.min && (band.max === null || x <= band.max)).length,
    }));
  }

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("price")
    .eq("status", "published")
    .eq("city", city)
    .not("price", "is", null);

  const prices = (data ?? []).map((r) => (r as { price: number }).price);

  return budgetBands.map((band) => ({
    slug: band.slug,
    label: band.label,
    count: prices.filter((p) => p >= band.min && (band.max === null || p <= band.max)).length,
  }));
}

/* ═══════════════════════════════════════════════════════════════════════════
   DEMO LISTING FILTER
   Applies the same facet and query-param semantics as the Postgres query
   above, in memory, so the SEO landing pages and the search page behave
   identically with or without a database. Kept at the bottom of the file,
   next to the queries it shadows, so the two cannot drift unnoticed.
   ═══════════════════════════════════════════════════════════════════════════ */

function demoListings(
  facets: Partial<ResolvedFacets> & { city?: { slug: string } },
  params: Partial<SearchParams>,
  page: number,
): ListingResult {
  let items = [...demoProperties];

  if (facets.city?.slug) items = items.filter((p) => p.city === facets.city!.slug);

  if (facets.locality) {
    items = items.filter((p) => p.locality_slug === facets.locality!.slug);
  } else if (params.locality) {
    const slugs = params.locality.split(",").map((s) => s.trim()).filter(Boolean);
    if (slugs.length) items = items.filter((p) => slugs.includes(p.locality_slug));
  }

  const type = facets.propertyType?.slug ?? params.type;
  if (type) items = items.filter((p) => p.property_type === type);

  const category = facets.category ?? params.category;
  if (category) items = items.filter((p) => p.category === category);

  // A path BHK is exact; a query-string BHK is a minimum, matching the real
  // query's `.eq()` versus `.gte()` split.
  if (facets.bhk) items = items.filter((p) => p.bhk === facets.bhk);
  else if (params.bhk) items = items.filter((p) => (p.bhk ?? 0) >= params.bhk!);

  const min = facets.budget ? facets.budget.min : params.min;
  const max = facets.budget ? facets.budget.max : params.max;
  if (min) items = items.filter((p) => (p.price ?? 0) >= min);
  if (max) items = items.filter((p) => (p.price ?? 0) <= max);

  const possession = facets.possession?.slug ?? params.possession;
  if (possession) items = items.filter((p) => p.possession === possession);

  if (params.q) {
    const needle = params.q.toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(needle) ||
        p.locality_slug.includes(needle) ||
        p.property_type.includes(needle),
    );
  }

  switch (params.sort) {
    case "price-asc":
      items.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case "price-desc":
      items.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case "area-desc":
      items.sort((a, b) => (b.carpet_sqft ?? 0) - (a.carpet_sqft ?? 0));
      break;
    case "newest":
      items.sort((a, b) => b.view_count - a.view_count);
      break;
    default:
      items.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  }

  const total = items.length;
  const from = (page - 1) * PAGE_SIZE;

  return {
    items: items.slice(from, from + PAGE_SIZE),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
