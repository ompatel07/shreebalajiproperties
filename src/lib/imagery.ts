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
 * ⚠️  The group names below are NOT reliable as subject labels. Every ID was
 *     verified to return HTTP 200 — not to depict what the group is called.
 *     Spot-checked Oct 2026: "1560448204-e02f11c3d0e2" in COMMERCIAL is a
 *     residential living room, and both of the first two LAND entries are
 *     houses among trees, not plots. Look at an image before using it
 *     anywhere the label is shown to a visitor.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   CURATED INDIAN LIBRARY — Oct 2026
   ═══════════════════════════════════════════════════════════════════════════

   Every id below was LOOKED AT, on a contact sheet, before it went in — not
   just checked for HTTP 200. That is the difference from the older pools
   further down, whose group names turned out to be unreliable (a "shop" that
   was a living room, "land" that was a cottage in a forest).

   They replace the Western stock that made the site read as a template: a
   Mediterranean villa with a pool, North American suburbs. These are Indian
   residential towers in the terracotta-and-grey cladding new Ahmedabad
   projects actually use, Gujarati bungalows, Indian apartment interiors
   (false ceilings, ceiling fans, a jaali screen and a mandir), and the Atal
   Bridge on the Sabarmati riverfront — Ahmedabad's own landmark.

   Still stock. The client's real project photography replaces all of it. */

/** Residential towers and townships. */
export const IN_TOWERS = [
  "1779976955613-b74623824d1c", // terracotta-clad residential tower, clear sky
  "1779976955617-23056bd0f82e", // same tower, balconies close-up
  "1750715831822-b9156ee618a5", // residential towers above palms
  "1751105723621-88018850a9ec", // tower rising above greenery
  "1689574120966-c7b1e57a8cfe", // township towers, bright sky
  "1689574666875-6c591bca0b32", // township from above
] as const;

/** Independent houses — the modern Gujarati bungalow. */
export const IN_HOUSES = [
  "1626249893783-cc4a9f66880a", // brick-and-white modern bungalow, lawn
  "1626249893889-c044fd88e9f7", // two-storey bungalow, lawn
  "1580892138193-0781eef7caf2", // villa township with landscaped lawns
] as const;

/** Indian apartment interiors. */
export const IN_INTERIORS = [
  "1745301558339-44eb3217d5da", // marble living room, jaali screen, mandir
  "1745429523615-2a82c60bfc02", // open kitchen with screen partition
  "1745429523617-0d837856ca35", // neutral living room
  "1720247520862-7e4b14176fa8", // living room, false ceiling
  "1713192706955-6ef5c71811bd", // sunlit living room
  "1615529182904-14819c35db37", // warm living room, pendant lights
] as const;

/** Offices and commercial frontage. */
export const IN_COMMERCIAL = [
  "1594233666755-d1cb282abd25", // glass office blocks, Indian flag
  "1743875781694-594be96b090b", // patterned commercial facade
] as const;

/** Construction in progress — honest imagery for under-construction stock. */
export const IN_CONSTRUCTION = [
  "1632398461186-37c76a70062f", // towers under construction, palms
  "1630061712710-2539eb457c55", // structures rising, daylight
] as const;

/** Ahmedabad itself. */
export const AHMEDABAD = {
  atalBridge: "1774666011220-e1cc2b19ed79", // Atal Bridge over the Sabarmati
  atalCanopy: "1704730827544-ad473ecae95d", // under the bridge canopy
  cityAerial: "1687840430404-b82859282de4", // a city from above (from an Ahmedabad search; location unverified, so alt text does not claim it)
} as const;

/* ── Second pool: listings and projects ONLY ─────────────────────────────
   Disjoint from the library above, which the homepage sections use. With one
   shared pool, a listing card could show the same building as the hero slide
   above it — the repetition the client called out. Every id looked at. */

/** Exteriors for listing cards. */
export const LISTING_EXTERIORS = [
  "1764996915324-91919cee14d3", // residential blocks among trees
  "1630618468400-ac074bd3408f", // white towers, orange accent
  "1600555179901-107bf80d25cf", // towers seen from a green balcony
  "1636392881522-e1f0e14fcfe2", // blue tower, looking up
  "1564486593523-38d62206e706", // beige tower, balconies
  "1775582336512-8d79600fa7d5", // white apartment blocks above trees
  "1549499090-c9203d2b20ad", // white residential block, balconies
  "1663985139222-6af2f8646104", // white tower over a landscaped drive
  "1719139834652-11a5fb80cba5", // apartments behind bougainvillea
  "1711089654306-0ac17363dd8e", // twin towers at sunset
  "1661188136450-4d6afd17abe2", // brown tower, balconies
  "1562602136-b64ddd991ea2", // white tower, stacked balconies
  "1714983007778-b370188238b8", // glass-and-white tower through trees
  "1681057969807-61048ecb91e6", // towers above greenery
] as const;

/** Interiors for listing cards. */
export const LISTING_INTERIORS = [
  "1750420556288-d0e32a6f517b", // bedroom, arched headboard wall
  "1682662045846-77f6e1ce55b4", // modular kitchen, grey gloss
  "1785232273548-4beae5334903", // bedroom, cove ceiling
  "1785402231092-859d0a6c4397", // living and dining, marble floor
  "1789121274503-0adf44908a2a", // bedroom, wood panelling
  "1755771984341-546c2a04f236", // L-shaped modular kitchen
  "1771328756144-02bde5549a9a", // bedroom, tufted headboard
  "1641356916420-a4b06a824bb7", // living and dining, balcony doors
  "1746004082380-9f50baddd58c", // white modular kitchen
  "1682662045815-9016c6225dd3", // galley kitchen, dark units
] as const;

/** Exteriors for PROJECT cards — the four strongest single-tower shots. */
export const PROJECT_EXTERIORS = [
  "1787055482226-8544df1e754a", // tower at sunset above greenery
  "1782544088839-0e293fc78470", // three slim towers, blue sky
  "1773470920361-4f6cbb702ce0", // towers around a landscaped pool
  "1706543308471-297210245ebc", // tower at dawn
] as const;

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
 * Residential card photos: the building first, as a buyer expects, with one
 * interior every few cards for variety. Exactly one kitchen, and never two
 * near-identical rooms — the grey kitchens at LISTING_INTERIORS[1], [5] and
 * [9] read as the same photo when they landed side by side. With 18 entries
 * and sequential ref_nos, the first 18 listings all get different photos.
 */
const CARD_INTERIORS = [
  LISTING_INTERIORS[3], // living room, gallery wall
  LISTING_INTERIORS[4], // bedroom, wood panelling
  LISTING_INTERIORS[7], // living-dining, warm light
  LISTING_INTERIORS[8], // light kitchen
] as const;

const RESIDENTIAL: readonly string[] = [
  ...LISTING_EXTERIORS.slice(0, 3), CARD_INTERIORS[0],
  ...LISTING_EXTERIORS.slice(3, 7), CARD_INTERIORS[1],
  ...LISTING_EXTERIORS.slice(7, 10), CARD_INTERIORS[2],
  ...LISTING_EXTERIORS.slice(10, 14), CARD_INTERIORS[3],
];

/**
 * Deterministic photo for a listing, so a card never swaps image between
 * server render and hydration, or between two page views.
 */
export function heroImageFor(
  row: {
    hero_image?: string | null;
    slug: string;
    category?: string | null;
    ref_no?: number | null;
  },
  width = 1200,
): string {
  if (row.hero_image) return row.hero_image;

  const pool =
    row.category === "commercial"
      ? IN_COMMERCIAL
      : row.category === "land"
        ? IN_HOUSES
        : RESIDENTIAL;
  // (Commercial and land still draw on the section library — there are only a
  // couple of such listings, and no further honest photos of either.)

  // ── Why ref_no and not a hash ─────────────────────────────────────────
  // Hashing the slug into a pool of ten guaranteed collisions with 17
  // listings — the first two featured cards on the homepage were the same
  // photograph, side by side, which reads as exactly the repetition the
  // client complained about. `ref_no` is sequential, so walking the pool by
  // it gives consecutive listings consecutive, different photos. The hash
  // remains only as a fallback for rows without a reference (demo fixtures).
  const index = row.ref_no ?? hashString(row.slug);
  return unsplash(pool[index % pool.length]!, width);
}

export function localityImage(slug: string, width = 700): string {
  const pool = [...IN_TOWERS, ...IN_HOUSES];
  return unsplash(pool[hashString(slug) % pool.length]!, width, 74);
}

/** A stable gallery for a listing that has no uploaded images yet. */
export function galleryFor(slug: string, category: string | null, count = 6): string[] {
  const seed = hashString(slug);
  const pool: readonly string[] =
    category === "commercial"
      ? [...IN_COMMERCIAL, ...IN_TOWERS]
      : category === "land"
        ? [...IN_HOUSES, ...IN_TOWERS]
        : [...LISTING_INTERIORS, ...LISTING_EXTERIORS];

  return Array.from({ length: Math.min(count, pool.length) }, (_, i) =>
    unsplash(pool[(seed + i * 5) % pool.length]!, 1400),
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
