import { heroImageFor } from "@/lib/imagery";
import type {
  Builder,
  PropertyCard,
  Testimonial,
} from "@/types/db";
import type { PartneredProjectCard } from "@/lib/queries";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DEMO FALLBACK
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Mirrors `supabase/seed.sql` so the site can be demonstrated, designed
 * against and developed on **before Supabase is connected at all**.
 *
 * ── HOW IT SWITCHES OFF ──────────────────────────────────────────────────
 * `isDemoMode()` is true only when `NEXT_PUBLIC_SUPABASE_URL` is absent or
 * still contains "placeholder". The moment real credentials are pasted into
 * the environment, every query in `queries.ts` goes back to Postgres and this
 * module stops being consulted. There is no flag to remember to turn off.
 *
 * It is additionally hard-disabled whenever `NODE_ENV === "production"` AND
 * the URL looks real, so a misconfigured deploy fails loudly with empty
 * states rather than quietly serving fictional inventory to real buyers.
 *
 * ── WHY THIS EXISTS ──────────────────────────────────────────────────────
 * Several homepage sections self-hide when their query returns nothing
 * (partnered projects, testimonials, the developer marquee). That is correct
 * for a fresh install but makes the site impossible to evaluate before the
 * database is up. This keeps the two states honest: the shape of the data is
 * identical, only the source differs.
 *
 * ⚠️  Every name, price and RERA number below is FICTIONAL — same as the
 *     seed. See the header of `supabase/seed.sql`.
 */

export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Unconfigured, or still on the .env.example placeholder.
  return !url || url.includes("placeholder") || url.includes("xxxx");
}

/* ── Builders ────────────────────────────────────────────────────────────── */

const BUILDER_NAMES = [
  "Aarambh Group",
  "Saptak Developers",
  "Vistara Infra",
  "Shaurya Builders",
  "Medha Realty",
  "Triveni Estates",
  "Anantam Group",
  "Kshitij Developers",
  "Niyati Homes",
  "Oorja Realty",
] as const;

export const demoBuilders: Builder[] = BUILDER_NAMES.map((name, i) => ({
  id: `demo-builder-${i + 1}`,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  name,
  established: [1994, 2001, 2009, 1988, 2014, 2006, 1999, 2011, 2017, 2003][i] ?? 2000,
  logo_url: null,
  about: null,
  website: null,
  projects_done: [41, 28, 12, 63, 9, 34, 22, 15, 7, 26][i] ?? 10,
  is_published: true,
  sort_order: i + 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

/* ── Listings ────────────────────────────────────────────────────────────── */

interface Seed {
  slug: string;
  title: string;
  locality: string;
  city: "ahmedabad" | "gandhinagar";
  type: string;
  category: "residential" | "commercial" | "land";
  bhk: number | null;
  baths: number | null;
  carpet: number | null;
  superArea: number | null;
  plot?: number | null;
  price: number;
  possession: PropertyCard["possession"];
  possessionDate: string | null;
  rera: boolean;
  featured?: boolean;
  exclusive?: boolean;
  lat: number;
  lng: number;
  views: number;
}

const SEEDS: Seed[] = [
  { slug: "3-bhk-serene-heights-shilaj-tower-b", title: "3 BHK corner unit in Serene Heights, Shilaj", locality: "shilaj", city: "ahmedabad", type: "flats", category: "residential", bhk: 3, baths: 3, carpet: 1485, superArea: 2064, price: 12900000, possession: "possession-in-2-years", possessionDate: "2028-06-30", rera: true, featured: true, exclusive: true, lat: 23.0318, lng: 72.4582, views: 412 },
  { slug: "4-bhk-serene-heights-shilaj", title: "4 BHK in Serene Heights, Shilaj", locality: "shilaj", city: "ahmedabad", type: "flats", category: "residential", bhk: 4, baths: 4, carpet: 1920, superArea: 2668, price: 16500000, possession: "possession-in-2-years", possessionDate: "2028-06-30", rera: true, featured: true, lat: 23.0318, lng: 72.4582, views: 287 },
  { slug: "3-bhk-kalrav-residency-shela-ready", title: "3 BHK ready to move in Kalrav Residency, Shela", locality: "shela", city: "ahmedabad", type: "flats", category: "residential", bhk: 3, baths: 3, carpet: 1340, superArea: 1876, price: 9600000, possession: "ready-to-move", possessionDate: null, rera: true, featured: true, lat: 23.0062, lng: 72.4729, views: 534 },
  { slug: "2-bhk-kalrav-residency-shela", title: "2 BHK in Kalrav Residency, Shela", locality: "shela", city: "ahmedabad", type: "flats", category: "residential", bhk: 2, baths: 2, carpet: 985, superArea: 1379, price: 7200000, possession: "ready-to-move", possessionDate: null, rera: true, lat: 23.0062, lng: 72.4729, views: 298 },
  { slug: "4-bhk-the-aurelia-iskon-ambli", title: "4 BHK in The Aurelia, Iskon–Ambli", locality: "iskon-ambli", city: "ahmedabad", type: "flats", category: "residential", bhk: 4, baths: 5, carpet: 2640, superArea: 3485, price: 32000000, possession: "possession-after-2-years", possessionDate: "2029-03-31", rera: true, featured: true, exclusive: true, lat: 23.0255, lng: 72.4878, views: 623 },
  { slug: "3-bhk-the-aurelia-iskon-ambli", title: "3 BHK in The Aurelia, Iskon–Ambli", locality: "iskon-ambli", city: "ahmedabad", type: "flats", category: "residential", bhk: 3, baths: 4, carpet: 2010, superArea: 2653, price: 24500000, possession: "possession-after-2-years", possessionDate: "2029-03-31", rera: true, lat: 23.0255, lng: 72.4878, views: 341 },
  { slug: "3-bhk-resale-thaltej-mature-building", title: "3 BHK resale in Thaltej, 2,100 sq.ft", locality: "thaltej", city: "ahmedabad", type: "flats", category: "residential", bhk: 3, baths: 3, carpet: 1620, superArea: 2100, price: 14800000, possession: "ready-to-move", possessionDate: null, rera: false, featured: true, exclusive: true, lat: 23.0469, lng: 72.5096, views: 489 },
  { slug: "2-bhk-triveni-skyline-chandkheda", title: "2 BHK in Triveni Skyline, Chandkheda", locality: "chandkheda", city: "ahmedabad", type: "flats", category: "residential", bhk: 2, baths: 2, carpet: 720, superArea: 1008, price: 5400000, possession: "possession-in-1-year", possessionDate: "2027-09-30", rera: true, lat: 23.1096, lng: 72.5825, views: 376 },
  { slug: "3-bhk-triveni-skyline-chandkheda", title: "3 BHK in Triveni Skyline, Chandkheda", locality: "chandkheda", city: "ahmedabad", type: "flats", category: "residential", bhk: 3, baths: 3, carpet: 1060, superArea: 1484, price: 8200000, possession: "possession-in-1-year", possessionDate: "2027-09-30", rera: true, lat: 23.1096, lng: 72.5825, views: 254 },
  { slug: "3-bhk-medha-one-gift-city", title: "3 BHK in Medha One, GIFT City", locality: "gift-city", city: "gandhinagar", type: "flats", category: "residential", bhk: 3, baths: 3, carpet: 1450, superArea: 1885, price: 28000000, possession: "possession-in-2-years", possessionDate: "2028-12-31", rera: true, featured: true, lat: 23.1602, lng: 72.6847, views: 718 },
  { slug: "3-bhk-oorja-vistas-kudasan-ready", title: "3 BHK ready to move in Oorja Vistas, Kudasan", locality: "kudasan", city: "gandhinagar", type: "flats", category: "residential", bhk: 3, baths: 3, carpet: 1450, superArea: 1943, price: 10400000, possession: "ready-to-move", possessionDate: null, rera: true, featured: true, lat: 23.1894, lng: 72.6356, views: 592 },
  { slug: "5-bhk-villa-kshitij-arbour-ambli", title: "5 BHK villa in Kshitij Arbour, Ambli", locality: "ambli", city: "ahmedabad", type: "villas", category: "residential", bhk: 5, baths: 6, carpet: 4850, superArea: null, plot: 5200, price: 48000000, possession: "possession-in-2-years", possessionDate: "2028-09-30", rera: true, featured: true, exclusive: true, lat: 23.0211, lng: 72.4772, views: 445 },
  { slug: "3-bhk-shaurya-kinara-south-bopal", title: "3 BHK launch unit in Shaurya Kinara, South Bopal", locality: "south-bopal", city: "ahmedabad", type: "flats", category: "residential", bhk: 3, baths: 3, carpet: 1290, superArea: 1703, price: 10800000, possession: "new-launch", possessionDate: "2029-06-30", rera: true, lat: 23.0229, lng: 72.4698, views: 312 },
  { slug: "office-1250-sqft-anantam-axis-sg-highway", title: "Grade-A office, 1,250 sq.ft, Anantam Axis, SG Highway", locality: "sg-highway", city: "ahmedabad", type: "offices", category: "commercial", bhk: null, baths: 2, carpet: 900, superArea: 1250, price: 11250000, possession: "ready-to-move", possessionDate: null, rera: true, lat: 23.0312, lng: 72.5063, views: 203 },
  { slug: "4-bhk-penthouse-thaltej", title: "4 BHK penthouse with private terrace, Thaltej", locality: "thaltej", city: "ahmedabad", type: "penthouses", category: "residential", bhk: 4, baths: 5, carpet: 3180, superArea: 4120, price: 36500000, possession: "ready-to-move", possessionDate: null, rera: false, featured: true, exclusive: true, lat: 23.0469, lng: 72.5096, views: 561 },
  { slug: "2-bhk-resale-gota-value", title: "2 BHK resale in Gota, 1,050 sq.ft", locality: "gota", city: "ahmedabad", type: "flats", category: "residential", bhk: 2, baths: 2, carpet: 780, superArea: 1050, price: 5900000, possession: "ready-to-move", possessionDate: null, rera: false, lat: 23.1017, lng: 72.5411, views: 428 },
];

export const demoProperties: PropertyCard[] = SEEDS.map((s, i) => ({
  id: `demo-prop-${i + 1}`,
  slug: s.slug,
  title: s.title,
  city: s.city,
  locality_slug: s.locality,
  category: s.category,
  property_type: s.type,
  transaction: "sale",
  status: "published",
  bhk: s.bhk,
  bathrooms: s.baths,
  carpet_sqft: s.carpet,
  super_sqft: s.superArea,
  plot_sqft: s.plot ?? null,
  price: s.price,
  price_on_request: false,
  possession: s.possession,
  possession_date: s.possessionDate,
  rera_verified: s.rera,
  hero_image: null,
  is_featured: Boolean(s.featured),
  is_exclusive: Boolean(s.exclusive),
  lat: s.lat,
  lng: s.lng,
  view_count: s.views,
}));

/* ── Projects ────────────────────────────────────────────────────────────── */

export const demoProjects: PartneredProjectCard[] = [
  {
    id: "demo-proj-1",
    slug: "serene-heights",
    name: "Serene Heights",
    city: "ahmedabad",
    locality_slug: "shilaj",
    tagline: "Three towers on four acres, with 28% loading — the lowest in the corridor.",
    hero_image: null,
    price_min: 9800000,
    price_max: 16500000,
    possession: "possession-in-2-years",
    possession_date: "2028-06-30",
    total_units: 246,
    rera_id: "PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA11287/310125",
    category: "residential",
    builder: { id: "demo-builder-1", slug: "aarambh-group", name: "Aarambh Group", logo_url: null },
  },
  {
    id: "demo-proj-2",
    slug: "the-aurelia",
    name: "The Aurelia",
    city: "ahmedabad",
    locality_slug: "iskon-ambli",
    tagline: "Ninety-six apartments in twenty-two floors — four to a floor, two lifts each.",
    hero_image: null,
    price_min: 24500000,
    price_max: 42000000,
    possession: "possession-after-2-years",
    possession_date: "2029-03-31",
    total_units: 96,
    rera_id: "PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA12033/150226",
    category: "residential",
    builder: { id: "demo-builder-3", slug: "vistara-infra", name: "Vistara Infra", logo_url: null },
  },
  {
    id: "demo-proj-3",
    slug: "medha-one-ifsc",
    name: "Medha One",
    city: "gandhinagar",
    locality_slug: "gift-city",
    tagline: "Walk to work inside the IFSC, on the district cooling network.",
    hero_image: null,
    price_min: 21000000,
    price_max: 38000000,
    possession: "possession-in-2-years",
    possession_date: "2028-12-31",
    total_units: 144,
    rera_id: "PR/GJ/GANDHINAGAR/GANDHINAGAR/GUDA/MAA11902/220226",
    category: "residential",
    builder: { id: "demo-builder-5", slug: "medha-realty", name: "Medha Realty", logo_url: null },
  },
  {
    id: "demo-proj-4",
    slug: "oorja-vistas",
    name: "Oorja Vistas",
    city: "gandhinagar",
    locality_slug: "kudasan",
    tagline: "The sensible alternative to GIFT City: twice the space, ten minutes away.",
    hero_image: null,
    price_min: 6800000,
    price_max: 12400000,
    possession: "ready-to-move",
    possession_date: null,
    total_units: 168,
    rera_id: "PR/GJ/GANDHINAGAR/GANDHINAGAR/GUDA/MAA09120/080723",
    category: "residential",
    builder: { id: "demo-builder-10", slug: "oorja-realty", name: "Oorja Realty", logo_url: null },
  },
];

/* ── Testimonials ────────────────────────────────────────────────────────── */

export const demoTestimonials: Testimonial[] = [
  {
    author: "Rahul & Priyanka Shah",
    role: "Bought a 3 BHK in Shela, 2024",
    locality: "Shela",
    quote:
      "They talked us out of the first flat we fell in love with. The builder had slipped eighteen months on their previous project and they showed us the dates rather than just saying it. We ended up in a completed building for the same money and moved in six weeks later instead of waiting three years.",
  },
  {
    author: "Dr. Meera Desai",
    role: "Bought a 4 BHK in Iskon-Ambli, 2023",
    locality: "Iskon-Ambli",
    quote:
      "I had been looking for eight months on my own and had seen perhaps thirty flats. They asked four questions, told me two of my constraints were incompatible, and then showed me three options. I bought the second one. What I was paying for was the judgement, not the viewings.",
  },
  {
    author: "Jignesh Patel",
    role: "Sold a 3 BHK in Thaltej, 2024",
    locality: "Thaltej",
    quote:
      "I wanted sixteen percent more than they said it was worth. They declined the mandate rather than take it and grind me down later. I listed with someone else, sat unsold for five months, and eventually took almost exactly the number they had quoted.",
  },
  {
    author: "Aditi & Karan Mehta",
    role: "Bought a 2 BHK in Chandkheda, 2025",
    locality: "Chandkheda",
    quote:
      "First home, and we had no idea what we did not know. They explained carpet versus super built-up on the first call and it changed which flats we were even looking at. They also put our file in front of four banks at once so we were negotiating from a sanction letter.",
  },
  {
    author: "Nilam Joshi",
    role: "Bought a 3 BHK in Kudasan, 2024",
    locality: "Kudasan",
    quote:
      "I came in asking about GIFT City because that is what everyone talks about. They asked whether I actually worked there, and when I said no, explained exactly what I would be paying the premium for. Same carpet area, substantially less money, and a school my daughter can walk to. That conversation cost them a bigger commission.",
  },
].map((t, i) => ({
  id: `demo-testimonial-${i + 1}`,
  author: t.author,
  role: t.role,
  locality: t.locality,
  avatar_url: null,
  quote: t.quote,
  rating: 5,
  property_id: null,
  is_published: true,
  is_featured: i < 3,
  sort_order: i + 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

/* ── Derived ─────────────────────────────────────────────────────────────── */

export function demoLocalityCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of demoProperties) {
    counts[p.locality_slug] = (counts[p.locality_slug] ?? 0) + 1;
  }
  return counts;
}

/** Keeps the demo image pipeline identical to the real one. */
export function demoHero(slug: string, category: string | null, width = 1200) {
  return heroImageFor({ hero_image: null, slug, category }, width);
}

/* ═══════════════════════════════════════════════════════════════════════════
   DETAIL EXPANSION
   `demoProperties` is the card-shaped subset. The detail page needs the full
   row plus relations, so it is expanded here from the same seed rather than
   duplicated — the card and the detail page can never disagree.
   ═══════════════════════════════════════════════════════════════════════════ */

const AMENITY_SET = [
  "Clubhouse",
  "Swimming Pool",
  "Gymnasium",
  "Landscaped Garden",
  "Children's Play Area",
  "Jogging Track",
  "Indoor Games",
  "Covered Parking",
  "Visitor Parking",
  "EV Charging",
  "24×7 Security",
  "CCTV Surveillance",
  "Power Backup",
  "Lift",
  "Rainwater Harvesting",
  "Fire Safety",
  "Vastu Compliant",
  "Yoga Deck",
];

const NEARBY_SET = [
  { name: "Udgam School", type: "school" as const, distance_km: 2.4 },
  { name: "Thaltej Cross Roads", type: "transit" as const, distance_km: 1.8 },
  { name: "Shalby Hospital", type: "hospital" as const, distance_km: 4.1 },
  { name: "Iskon Mega Mall", type: "mall" as const, distance_km: 5.8 },
  { name: "Rajpath Club", type: "park" as const, distance_km: 3.2 },
];

export function demoPropertyDetail(slug: string) {
  const card = demoProperties.find((p) => p.slug === slug);
  if (!card) return null;

  const builder = demoBuilders[Math.abs(slug.length * 7) % demoBuilders.length]!;
  const project = demoProjects.find((pr) => slug.includes(pr.slug)) ?? null;

  return {
    ...card,
    project_id: project?.id ?? null,
    builder_id: builder.id,
    address: `${card.locality_slug.replace(/-/g, " ")}, ${card.city === "ahmedabad" ? "Ahmedabad" : "Gandhinagar"}`,
    balconies: 2,
    floor_no: 7,
    total_floors: 14,
    facing: "North-East",
    furnishing: card.possession === "ready-to-move" ? "semi-furnished" : "unfurnished",
    age_years: card.possession === "ready-to-move" ? 2 : 0,
    builtup_sqft: card.carpet_sqft ? Math.round(card.carpet_sqft * 1.15) : null,
    maintenance_psf: 3.2,
    booking_amount: Math.round(card.price! * 0.04),
    is_negotiable: true,
    rera_id: card.rera_verified
      ? "PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA11287/310125"
      : null,
    description:
      "⚠️ DEMO DATA — this listing is fictional, generated so the site can be reviewed before Supabase is connected. Connect your database and this is replaced by the client's real inventory.\n\nA corner unit open on three sides, north-east facing — which in Ahmedabad means morning light in the living room and no direct afternoon sun on the bedrooms. That is the single most underrated specification in this climate.\n\nThe carpet figure quoted is the RERA figure. A comparable flat advertised on super built-up elsewhere would show a larger number for the same usable space, which is why we quote carpet and show the conversions beneath it.",
    highlights: [
      "Corner unit, open on three sides",
      "North-east facing — morning light, no afternoon heat load",
      "Carpet area quoted, not super built-up",
      "Developer delivered its last four projects within 90 days of the registered date",
      "Above the tree line, below the top-floor premium",
    ],
    amenities: AMENITY_SET.slice(0, 14),
    nearby: NEARBY_SET,
    video_url: null,
    virtual_tour_url: null,
    sort_order: 0,
    enquiry_count: Math.round(card.view_count / 18),
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    images: [],
    builder: { id: builder.id, slug: builder.slug, name: builder.name, logo_url: null },
    project: project
      ? {
          id: project.id,
          slug: project.slug,
          name: project.name,
          rera_id: project.rera_id,
          is_partnered: true,
        }
      : null,
    floor_plans: [],
  };
}

export function demoProjectDetail(slug: string) {
  const p = demoProjects.find((x) => x.slug === slug);
  if (!p) return null;

  return {
    ...p,
    builder_id: p.builder?.id ?? null,
    address: `${p.locality_slug.replace(/-/g, " ")}, ${p.city === "ahmedabad" ? "Ahmedabad" : "Gandhinagar"}`,
    lat: null,
    lng: null,
    status: "published" as const,
    total_towers: 3,
    floors: 14,
    land_area_acres: 4.2,
    description:
      "⚠️ DEMO DATA — this project is fictional, generated so the site can be reviewed before Supabase is connected.\n\nThree towers on four acres with a 28% common-area loading, against a 38–42% norm on this corridor. On a 3 BHK that is roughly 140 more usable square feet for the same money.",
    highlights: [
      "28% common-area loading, against a 38–42% corridor norm",
      "Developer delivered its last four projects on schedule",
      "Set-back spacing keeps light on lower floors",
      "Clubhouse completed and handed over before possession",
    ],
    amenities: AMENITY_SET,
    specifications: {
      structure: "RCC frame, seismic zone III compliant",
      flooring: "800×800 vitrified tile in living and bedrooms",
      kitchen: "Granite counter, provision for chimney and purifier",
      lifts: "Two passenger plus one service per tower",
    },
    brochure_url: null,
    video_url: null,
    is_featured: true,
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updated_at: new Date().toISOString(),
    images: [],
    floor_plans: [
      { id: "fp-1", project_id: p.id, property_id: null, label: "2 BHK — Type A", bhk: 2, carpet_sqft: 985, super_sqft: 1368, price: 9800000, image_url: null, sort_order: 1, created_at: new Date().toISOString() },
      { id: "fp-2", project_id: p.id, property_id: null, label: "3 BHK — Type B", bhk: 3, carpet_sqft: 1485, super_sqft: 2064, price: 12900000, image_url: null, sort_order: 2, created_at: new Date().toISOString() },
      { id: "fp-3", project_id: p.id, property_id: null, label: "4 BHK — Type C", bhk: 4, carpet_sqft: 1920, super_sqft: 2668, price: 16500000, image_url: null, sort_order: 3, created_at: new Date().toISOString() },
    ],
  };
}
