/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LISTING READINESS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Answers one question the old form never did: **what is stopping this from
 * going live?**
 *
 * Previously you filled in 29 fields, hit Save, and Postgres told you after
 * the fact that a published residential listing needs a carpet area. This
 * computes the same rules up front, continuously, so the answer is visible
 * before you try.
 *
 * The three tiers are deliberate:
 *
 *   · `blocker`  — the DB CHECK constraints and Zod refinements in
 *                  `validation.ts` will actually reject this. Publishing is
 *                  disabled until these clear.
 *   · `warning`  — it will save and publish, but the public page will look
 *                  unfinished or lose a trust signal.
 *   · `polish`   — worth doing, costs nothing to skip.
 *
 * Keep this in step with `propertyUpsertSchema`. If a rule is added there,
 * add it here too, or the form will start lying about what is required.
 */

export type Severity = "blocker" | "warning" | "polish";

export interface ReadinessItem {
  id: string;
  severity: Severity;
  label: string;
  /** Which tab to jump to when the item is clicked. */
  tab: "essentials" | "spec" | "content" | "location";
  /** The field to focus after switching tab, if any. */
  field?: string;
}

export interface ListingDraft {
  title: string;
  slug: string;
  localitySlug: string;
  propertyType: string;
  category: string;
  price: string;
  priceOnRequest: boolean;
  carpetSqft: string;
  bhk: string;
  bathrooms: string;
  description: string;
  heroImage: string;
  reraId: string;
  reraVerified: boolean;
  lat: string;
  lng: string;
  amenities: string[];
  highlights: string;
  possession: string;
  possessionDate: string;
}

export function evaluateReadiness(draft: ListingDraft): ReadinessItem[] {
  const items: ReadinessItem[] = [];
  const has = (v: string) => v.trim().length > 0;
  const isResidential = draft.category === "residential";
  const isLand = draft.category === "land";

  /* ── Blockers: these mirror Zod + the DB constraints ──────────────────── */

  if (draft.title.trim().length < 6) {
    items.push({
      id: "title",
      severity: "blocker",
      label: "Title needs at least 6 characters",
      tab: "essentials",
      field: "title",
    });
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(draft.slug) || draft.slug.length < 3) {
    items.push({
      id: "slug",
      severity: "blocker",
      label: "URL slug is missing or invalid",
      tab: "essentials",
      field: "slug",
    });
  }

  if (!has(draft.localitySlug)) {
    items.push({
      id: "locality",
      severity: "blocker",
      label: "Pick a locality",
      tab: "essentials",
      field: "localitySlug",
    });
  }

  if (!has(draft.propertyType)) {
    items.push({
      id: "type",
      severity: "blocker",
      label: "Pick a property type",
      tab: "essentials",
      field: "propertyType",
    });
  }

  // Mirrors `properties_price_required_when_live`.
  if (!draft.priceOnRequest && !has(draft.price)) {
    items.push({
      id: "price",
      severity: "blocker",
      label: "Add a price, or tick “price on request”",
      tab: "essentials",
      field: "price",
    });
  }

  // Mirrors the Zod refinement on residential listings.
  if (isResidential && !has(draft.carpetSqft)) {
    items.push({
      id: "carpet",
      severity: "blocker",
      label: "Carpet area is required for a residential listing",
      tab: "essentials",
      field: "carpetSqft",
    });
  }

  /* ── Warnings: it will publish, but it will not look finished ─────────── */

  if (isResidential && !has(draft.bhk)) {
    items.push({
      id: "bhk",
      severity: "warning",
      label: "No configuration (BHK) — buyers filter on this",
      tab: "essentials",
      field: "bhk",
    });
  }

  if (!has(draft.heroImage)) {
    items.push({
      id: "hero",
      severity: "warning",
      label: "No photograph — a stock placeholder will be shown",
      tab: "content",
      field: "heroImage",
    });
  }

  if (draft.description.trim().length < 120) {
    items.push({
      id: "description",
      severity: "warning",
      label: "Description is short — this is the main sales copy",
      tab: "content",
      field: "description",
    });
  }

  // The RERA badge is the strongest trust signal on the public page. Claiming
  // verification without the number undermines it.
  if (draft.reraVerified && !has(draft.reraId)) {
    items.push({
      id: "rera-mismatch",
      severity: "warning",
      label: "Marked RERA-verified but no registration number entered",
      tab: "essentials",
      field: "reraId",
    });
  }

  if (!has(draft.lat) || !has(draft.lng)) {
    items.push({
      id: "geo",
      severity: "warning",
      label: "No coordinates — it will not appear on the map page",
      tab: "location",
      field: "lat",
    });
  }

  if (
    (draft.possession === "possession-in-1-year" ||
      draft.possession === "possession-in-2-years" ||
      draft.possession === "possession-after-2-years") &&
    !has(draft.possessionDate)
  ) {
    items.push({
      id: "possession-date",
      severity: "warning",
      label: "Under-construction listing with no possession date",
      tab: "essentials",
      field: "possessionDate",
    });
  }

  /* ── Polish ───────────────────────────────────────────────────────────── */

  if (draft.amenities.length === 0 && !isLand) {
    items.push({
      id: "amenities",
      severity: "polish",
      label: "No amenities selected",
      tab: "content",
    });
  }

  if (draft.highlights.trim().length === 0) {
    items.push({
      id: "highlights",
      severity: "polish",
      label: "No highlights — these render as “why we shortlisted it”",
      tab: "content",
      field: "highlights",
    });
  }

  if (isResidential && !has(draft.bathrooms)) {
    items.push({
      id: "bathrooms",
      severity: "polish",
      label: "Bathroom count not set",
      tab: "spec",
      field: "bathrooms",
    });
  }

  return items;
}

export function countBySeverity(items: ReadinessItem[]) {
  return {
    blockers: items.filter((i) => i.severity === "blocker").length,
    warnings: items.filter((i) => i.severity === "warning").length,
    polish: items.filter((i) => i.severity === "polish").length,
  };
}

/**
 * A 0–100 completeness score for the list view, so the client can see at a
 * glance which listings need work. Weighted so a blocker costs far more than
 * a missing amenity list.
 */
export function completenessScore(items: ReadinessItem[]): number {
  const { blockers, warnings, polish } = countBySeverity(items);
  const penalty = blockers * 22 + warnings * 8 + polish * 3;
  return Math.max(0, Math.min(100, 100 - penalty));
}

/**
 * Adapter: a database row → the draft shape this module evaluates.
 *
 * Lets the listings table score existing inventory with exactly the same
 * rules the editor applies, so the two can never disagree about whether a
 * listing is publishable.
 */
export function draftFromProperty(p: {
  title: string;
  slug: string;
  locality_slug: string;
  property_type: string;
  category: string;
  price: number | null;
  price_on_request: boolean;
  carpet_sqft: number | null;
  bhk: number | null;
  bathrooms: number | null;
  description?: string | null;
  hero_image: string | null;
  rera_id?: string | null;
  rera_verified: boolean;
  lat: number | null;
  lng: number | null;
  amenities?: string[] | null;
  highlights?: string[] | null;
  possession: string;
  possession_date: string | null;
}): ListingDraft {
  const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

  return {
    title: p.title ?? "",
    slug: p.slug ?? "",
    localitySlug: p.locality_slug ?? "",
    propertyType: p.property_type ?? "",
    category: p.category ?? "residential",
    price: str(p.price),
    priceOnRequest: p.price_on_request,
    carpetSqft: str(p.carpet_sqft),
    bhk: str(p.bhk),
    bathrooms: str(p.bathrooms),
    description: p.description ?? "",
    heroImage: p.hero_image ?? "",
    reraId: p.rera_id ?? "",
    reraVerified: p.rera_verified,
    lat: str(p.lat),
    lng: str(p.lng),
    amenities: p.amenities ?? [],
    highlights: (p.highlights ?? []).join("\n"),
    possession: p.possession ?? "ready-to-move",
    possessionDate: p.possession_date ?? "",
  };
}
