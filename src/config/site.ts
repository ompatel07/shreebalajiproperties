/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SITE CONFIG — aggregator
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This file used to hold everything. It was split once the brand content and
 * the locality taxonomy both grew past a few hundred lines:
 *
 *   · `identity.ts`    — who the business is, what it sells, the process,
 *                        the portfolio. Edit this to rebrand.
 *   · `localities.ts`  — ~130 Ahmedabad and Gandhinagar areas, two tiers.
 *   · this file        — the search taxonomy (types, configurations, budget
 *                        bands, possession, amenities) plus re-exports, so
 *                        no existing import path had to change.
 */

export * from "@/config/identity";
export * from "@/config/localities";

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH TAXONOMY
   These arrays are the authoritative list of programmatic SEO landing pages.
   `src/lib/slugs.ts` parses incoming URLs against them, `sitemap.ts` emits
   them, and the filter rail renders from them — so a facet added here
   immediately becomes a crawlable, filterable, sitemapped page.
   ═══════════════════════════════════════════════════════════════════════════ */

export const propertyTypes = [
  { slug: "flats", name: "Flats", singular: "Flat", category: "residential" },
  { slug: "villas", name: "Villas", singular: "Villa", category: "residential" },
  { slug: "bungalows", name: "Bungalows", singular: "Bungalow", category: "residential" },
  { slug: "penthouses", name: "Penthouses", singular: "Penthouse", category: "residential" },
  { slug: "duplex-flats", name: "Duplex Flats", singular: "Duplex", category: "residential" },
  { slug: "tenements", name: "Tenements", singular: "Tenement", category: "residential" },
  { slug: "weekend-villas", name: "Weekend Villas", singular: "Weekend Villa", category: "residential" },
  { slug: "offices", name: "Offices", singular: "Office", category: "commercial" },
  { slug: "shops", name: "Shops", singular: "Shop", category: "commercial" },
  { slug: "showrooms", name: "Showrooms", singular: "Showroom", category: "commercial" },
  { slug: "warehouses", name: "Warehouses", singular: "Warehouse", category: "commercial" },
  { slug: "plots", name: "Plots", singular: "Plot", category: "land" },
  { slug: "farmland", name: "Farmland", singular: "Farmland", category: "land" },
] as const;

export const bhkOptions = [1, 2, 3, 4, 5, 6] as const;

/** Budget bands in rupees. Labels follow Indian lakh/crore convention. */
export const budgetBands = [
  { slug: "under-50-lakh", label: "Under ₹50 Lakh", min: 0, max: 5_000_000 },
  { slug: "50-lakh-to-75-lakh", label: "₹50 – 75 Lakh", min: 5_000_000, max: 7_500_000 },
  { slug: "75-lakh-to-1-crore", label: "₹75 Lakh – ₹1 Cr", min: 7_500_000, max: 10_000_000 },
  { slug: "1-crore-to-2-crore", label: "₹1 – 2 Cr", min: 10_000_000, max: 20_000_000 },
  { slug: "2-crore-to-3-crore", label: "₹2 – 3 Cr", min: 20_000_000, max: 30_000_000 },
  { slug: "3-crore-to-5-crore", label: "₹3 – 5 Cr", min: 30_000_000, max: 50_000_000 },
  { slug: "above-5-crore", label: "Above ₹5 Cr", min: 50_000_000, max: null },
] as const;

export const possessionStatuses = [
  { slug: "ready-to-move", label: "Ready to Move" },
  { slug: "new-launch", label: "New Launch" },
  { slug: "possession-in-1-year", label: "Possession in 1 Year" },
  { slug: "possession-in-2-years", label: "Possession in 2 Years" },
  { slug: "possession-after-2-years", label: "Possession after 2 Years" },
] as const;

export const listingCategories = [
  { slug: "residential-properties", label: "Residential", category: "residential" },
  { slug: "commercial-properties", label: "Commercial", category: "commercial" },
  { slug: "land-properties", label: "Land & Plots", category: "land" },
] as const;

/** Amenity vocabulary. Kept closed so filters and cards stay consistent. */
export const amenities = [
  "Clubhouse",
  "Swimming Pool",
  "Gymnasium",
  "Landscaped Garden",
  "Children's Play Area",
  "Indoor Games",
  "Jogging Track",
  "Multipurpose Hall",
  "Yoga Deck",
  "Senior Citizen Zone",
  "Amphitheatre",
  "Covered Parking",
  "Visitor Parking",
  "EV Charging",
  "24×7 Security",
  "CCTV Surveillance",
  "Video Door Phone",
  "Power Backup",
  "Lift",
  "Rainwater Harvesting",
  "Sewage Treatment Plant",
  "Solar Panels",
  "Fire Safety",
  "Vastu Compliant",
  "Temple",
  "Co-working Lounge",
  "Pet Park",
  "Terrace Garden",
] as const;

/* ── Legacy re-export. `siteUrl` / `absoluteUrl` now live in identity.ts and
      are re-exported above; nothing else needs to change at the call sites. */
