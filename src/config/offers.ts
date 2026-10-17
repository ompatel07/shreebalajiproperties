/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OFFERS — the one place to change or switch off a promotion
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The free-furniture offer appears in the homepage hero, an offer band on
 * the homepage, every flat's listing card and every flat's detail page. All
 * of them read from here, so rewording it or ending it is a one-line change:
 * set `enabled: false` and it disappears everywhere.
 *
 * "Every flat" means the flat-type listings below — not villas, plots or
 * commercial units. The package itself (what furniture, any conditions) was
 * not specified by the client, so the copy promises the offer and says the
 * details are confirmed in writing at booking. Fill in `detail` once known.
 */
export const furnitureOffer = {
  enabled: true,
  /** Headline wherever there is room. */
  title: "Free furniture with every flat",
  /** Card chips and badges. */
  short: "Free furniture",
  detail:
    "Book any flat through us and get it furnished at no extra cost. We confirm the furniture package for your flat in writing at booking.",
  terms: "T&C apply. The furniture package is confirmed in writing at booking.",
  /** property_type slugs that count as a flat. */
  propertyTypes: ["flats", "duplex-flats", "penthouses"] as readonly string[],
} as const;

/** Whether a listing of this type carries the furniture offer. */
export function hasFurnitureOffer(propertyType: string | null | undefined): boolean {
  return furnitureOffer.enabled && !!propertyType && furnitureOffer.propertyTypes.includes(propertyType);
}
