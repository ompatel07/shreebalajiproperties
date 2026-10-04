import { hashString } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IMAGERY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Placeholder photography for the demo build, served straight from Unsplash's
 * CDN — free, no API key, no rate limit on hotlinking their image host.
 *
 * ⚠️  BEFORE LAUNCH: replace these with the client's own photographs, uploaded
 *     to the `property-media` Supabase bucket. Stock interiors are fine for a
 *     pitch and actively harmful once real buyers arrive expecting the flat in
 *     the picture. `heroImageFor()` already reads `hero_image` from the row
 *     first, so swapping a listing's photo is just a field edit in the admin
 *     panel — no code change.
 *
 * Every ID below was HTTP-200 verified at build time.
 */

/** Exteriors, elevations, towers. */
export const EXTERIORS = [
  "1600596542815-ffad4c1539a9",
  "1512917774080-9991f1c4c750",
  "1570129477492-45c003edd2be",
  "1564013799919-ab600027ffc6",
  "1568605114967-8130f3a36994",
  "1613490493576-7fde63acd811",
  "1605276374104-dee2a0ed3cd6",
  "1486406146926-c627a92ad1ab",
  "1497366216548-37526070297c",
  "1580587771525-78b9dba3b914",
] as const;

/** Living rooms, kitchens, bedrooms. */
export const INTERIORS = [
  "1600585154340-be6161a56a0c",
  "1600607687939-ce8a6c25118c",
  "1600566753086-00f18fb6b3ea",
  "1600047509807-ba8f99d2cdde",
  "1502672260266-1c1ef2d93688",
  "1522708323590-d24dbb6b0267",
  "1545324418-cc1a3fa10c00",
  "1556912172-45b7abe8b7e1",
  "1493809842364-78817add7ffb",
  "1503174971373-b1f69850bded",
] as const;

/** Offices, lobbies, commercial frontage. */
export const COMMERCIAL = [
  "1497366811353-6870744d04b2",
  "1522771739844-6a9f6d5f14af",
  "1542621334-a254cf47733d",
  "1560448204-e02f11c3d0e2",
  "1536376072261-38c75010e6c9",
] as const;

/** Land, plots, open sites. */
export const LAND = [
  "1449844908441-8829872d2607",
  "1531971589569-0d9370cbe1e5",
  "1592595896551-12b371d546d5",
] as const;

/**
 * Build a sized Unsplash URL.
 *
 * `fm=webp` plus an explicit width is what keeps these small — the raw files
 * are 5–8 MB each. Next's image optimiser re-encodes anyway, but asking the
 * origin for the right size first saves real bandwidth on the free tier.
 */
export function unsplash(id: string, width = 1600, quality = 72): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=${quality}&fm=webp`;
}

/**
 * Deterministic photo for a listing, so a card never swaps image between
 * server render and hydration, or between two page views.
 */
export function heroImageFor(
  row: { hero_image?: string | null; slug: string; category?: string | null },
  width = 1200,
): string {
  if (row.hero_image) return row.hero_image;

  const pool =
    row.category === "commercial"
      ? COMMERCIAL
      : row.category === "land"
        ? LAND
        : hashString(row.slug) % 3 === 0
          ? EXTERIORS
          : INTERIORS;

  const id = pool[hashString(row.slug) % pool.length]!;
  return unsplash(id, width);
}

/**
 * A stable photo for an AREA tile on the homepage.
 *
 * Exteriors only — an area tile is about a place, and a living room says
 * nothing about Shela. Seeded off the slug so the same area always shows the
 * same photo across renders and page views.
 */
export function localityImage(slug: string, width = 700): string {
  return unsplash(EXTERIORS[hashString(slug) % EXTERIORS.length]!, width, 74);
}

/** A stable gallery for a listing that has no uploaded images yet. */
export function galleryFor(slug: string, category: string | null, count = 6): string[] {
  const seed = hashString(slug);
  const pool =
    category === "commercial"
      ? [...COMMERCIAL, ...EXTERIORS]
      : category === "land"
        ? [...LAND, ...EXTERIORS]
        : [...INTERIORS, ...EXTERIORS];

  return Array.from({ length: Math.min(count, pool.length) }, (_, i) =>
    unsplash(pool[(seed + i * 7) % pool.length]!, 1400),
  );
}

/**
 * Inline SVG shown while a photo loads, and as the fallback if one 404s.
 *
 * A bone-coloured jaali lattice rather than a grey box — on a site this
 * warm, a neutral grey placeholder reads as a broken image. Encoded with
 * `encodeURIComponent` rather than base64 so it stays small enough to inline.
 */
export function blurPlaceholder(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30">
<rect width="40" height="30" fill="#f2ece2"/>
<path d="M0 15h40M20 0v30" stroke="#ddd2bf" stroke-width="0.5"/>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\n/g, ""))}`;
}
