/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOCALITY TAXONOMY — Ahmedabad & Gandhinagar
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Every area is a crawlable landing page. This is the file that decides how
 * much of the city the site covers.
 *
 * ── TWO TIERS, AND WHY ──────────────────────────────────────────────────
 * The client asked for "all areas of Ahmedabad". There are roughly 130 that
 * matter, and we have verified ₹/sq.ft data for none of them. Inventing a
 * rate band for 130 areas would look impressive and would be the fastest way
 * to destroy the credibility the whole site is built on — a buyer who checks
 * one number and finds it wrong stops believing all of them.
 *
 * So:
 *
 *   tier: "core"     — an indicative rate band and a paragraph that says
 *                      something true about living or building there. The
 *                      band is still an ESTIMATE and is labelled as such in
 *                      the UI; the client must confirm or replace it.
 *
 *   tier: "covered"  — a real page, searchable, linkable and in the sitemap,
 *                      but with NO fabricated rate. The page says we cover
 *                      the area and invites an enquiry. Honest, and it still
 *                      ranks for "<area> property" style queries.
 *
 * Promoting an area from `covered` to `core` is a two-field edit: add
 * `pricePerSqft` and `blurb`. Do that as real data arrives, area by area.
 *
 * ⚠️  The `pricePerSqft` bands below are INDICATIVE ESTIMATES compiled from
 *     general market observation, not from the client's transaction records.
 *     Treat them as a starting point for the client to correct.
 */

export type Zone =
  | "west"
  | "south-west"
  | "north"
  | "east"
  | "south"
  | "central"
  | "gift-gandhinagar";

export interface Locality {
  slug: string;
  name: string;
  city: "ahmedabad" | "gandhinagar";
  zone: Zone;
  /** `core` carries a rate band and editorial copy; `covered` does not. */
  tier: "core" | "covered";
  /** Core tier only. Indicative ₹/sq.ft on carpet — an estimate. */
  pricePerSqft?: [number, number];
  /** Core tier only. Intro copy on the locality landing page. */
  blurb?: string;
  /** Core tier only. Used to centre a map. */
  geo?: { lat: number; lng: number };
  /** Surfaced on the homepage. Core tier only. */
  featured?: boolean;
}

export const zoneLabels: Record<Zone, string> = {
  west: "West Ahmedabad",
  "south-west": "Bopal · Shela Belt",
  north: "North Corridor",
  east: "East Ahmedabad",
  south: "South Ahmedabad",
  central: "Central & Walled City",
  "gift-gandhinagar": "GIFT City · Gandhinagar",
};

/** Shorthand so the long tail stays readable. */
const covered = (
  slug: string,
  name: string,
  zone: Zone,
  city: "ahmedabad" | "gandhinagar" = "ahmedabad",
): Locality => ({ slug, name, city, zone, tier: "covered" });

export const localities: Locality[] = [
  /* ══════════════════════════════════════════════════════════════════════
     CORE — rate band + editorial copy
     ══════════════════════════════════════════════════════════════════════ */

  // ── West: the established premium spine ────────────────────────────────
  {
    slug: "thaltej", name: "Thaltej", city: "ahmedabad", zone: "west", tier: "core",
    geo: { lat: 23.0469, lng: 72.5096 }, pricePerSqft: [7800, 12500], featured: true,
    blurb:
      "The address that set the benchmark for west Ahmedabad. Thaltej pairs mature infrastructure with the city's densest cluster of premium retail and Grade-A offices, which is why resale here holds value better than almost anywhere else in the city.",
  },
  {
    slug: "bodakdev", name: "Bodakdev", city: "ahmedabad", zone: "west", tier: "core",
    geo: { lat: 23.039, lng: 72.5121 }, pricePerSqft: [7500, 11800],
    blurb:
      "Low-rise, tree-lined and quietly expensive. Bodakdev attracts buyers who want to be inside the SG Highway catchment without living on it — large older plots are steadily giving way to boutique 4-BHK projects.",
  },
  {
    slug: "sindhubhavan", name: "Sindhu Bhavan Road", city: "ahmedabad", zone: "west", tier: "core",
    geo: { lat: 23.0416, lng: 72.4869 }, pricePerSqft: [8200, 13500], featured: true,
    blurb:
      "Ahmedabad's restaurant and nightlife corridor, and its most aspirational commercial frontage. Residential stock is limited and premium, which keeps rental yields on the better towers unusually strong.",
  },
  {
    slug: "sg-highway", name: "SG Highway", city: "ahmedabad", zone: "west", tier: "core",
    geo: { lat: 23.0312, lng: 72.5063 }, pricePerSqft: [6800, 11000],
    blurb:
      "The arterial that organises the entire western city. Everything on SG Highway trades on connectivity — if a commute matters more than a garden, start here.",
  },
  {
    slug: "vastrapur", name: "Vastrapur", city: "ahmedabad", zone: "west", tier: "core",
    geo: { lat: 23.0395, lng: 72.5295 }, pricePerSqft: [7200, 11500],
    blurb:
      "Built around the lake and IIM-A, Vastrapur is the rare west-side locality that is genuinely walkable. Very little new supply, so almost all movement here is resale.",
  },
  {
    slug: "satellite", name: "Satellite", city: "ahmedabad", zone: "west", tier: "core",
    geo: { lat: 23.0276, lng: 72.5202 }, pricePerSqft: [6900, 10800],
    blurb:
      "Established, well-served and consistently liquid. Satellite's schools and hospitals make it the default answer for families who want to stop renting and settle.",
  },
  {
    slug: "iskon-ambli", name: "Iskon–Ambli", city: "ahmedabad", zone: "west", tier: "core",
    geo: { lat: 23.0255, lng: 72.4878 }, pricePerSqft: [7400, 12800], featured: true,
    blurb:
      "Where west Ahmedabad's new luxury supply has concentrated: tall towers, deep amenity decks, and the city's highest concentration of 4-BHK-and-above inventory.",
  },
  {
    slug: "ambli", name: "Ambli", city: "ahmedabad", zone: "west", tier: "core",
    geo: { lat: 23.0211, lng: 72.4772 }, pricePerSqft: [7600, 13200],
    blurb:
      "Bungalow country turning vertical. Ambli holds some of the largest private plots inside the AUDA limit, and the villa schemes here are the closest Ahmedabad gets to gated-estate living.",
  },
  {
    slug: "shilaj", name: "Shilaj", city: "ahmedabad", zone: "west", tier: "core",
    geo: { lat: 23.0318, lng: 72.4582 }, pricePerSqft: [6200, 10500], featured: true,
    blurb:
      "The most active new-launch corridor in the city. Shilaj offers newer construction and larger carpets than Thaltej at a meaningful discount — the trade-off is that retail and schools are still arriving.",
  },
  {
    slug: "science-city", name: "Science City", city: "ahmedabad", zone: "west", tier: "core",
    geo: { lat: 23.0795, lng: 72.5006 }, pricePerSqft: [6100, 10200],
    blurb:
      "A planned, green and notably quiet pocket. Science City Road has matured into a genuine family corridor without becoming a thoroughfare.",
  },
  {
    slug: "gota", name: "Gota", city: "ahmedabad", zone: "west", tier: "core",
    geo: { lat: 23.1017, lng: 72.5411 }, pricePerSqft: [4900, 8300], featured: true,
    blurb:
      "The north-west's workhorse locality — big supply, every budget, and an unusually broad spread of 2 and 3-BHK stock. If a project needs volume absorption, Gota has the deepest buyer pool.",
  },
  {
    slug: "prahlad-nagar", name: "Prahladnagar", city: "ahmedabad", zone: "west", tier: "core",
    geo: { lat: 23.0117, lng: 72.5101 }, pricePerSqft: [7000, 11200],
    blurb:
      "Ahmedabad's most complete mixed-use district: corporate parks, the garden, and a retail spine that runs all day. Compact apartments here let almost instantly.",
  },

  // ── South-West: the Bopal / Shela family belt ──────────────────────────
  {
    slug: "bopal", name: "Bopal", city: "ahmedabad", zone: "south-west", tier: "core",
    geo: { lat: 23.0333, lng: 72.4667 }, pricePerSqft: [5400, 8900], featured: true,
    blurb:
      "The original family suburb of the south-west, and still the best-serviced. Bopal's schools, clinics and markets are walkable, which is why it holds families for decades rather than years.",
  },
  {
    slug: "south-bopal", name: "South Bopal", city: "ahmedabad", zone: "south-west", tier: "core",
    geo: { lat: 23.0229, lng: 72.4698 }, pricePerSqft: [5700, 9600], featured: true,
    blurb:
      "Newer, taller and more amenity-led than Bopal proper. South Bopal is where most of the area's 3-BHK supply with a real clubhouse now sits.",
  },
  {
    slug: "shela", name: "Shela", city: "ahmedabad", zone: "south-west", tier: "core",
    geo: { lat: 23.0062, lng: 72.4729 }, pricePerSqft: [5200, 9000], featured: true,
    blurb:
      "The single busiest construction corridor in Ahmedabad. Shela's volume of launches means real competition for attention — and the widest choice of possession dates anywhere in the city.",
  },
  {
    slug: "ghuma", name: "Ghuma", city: "ahmedabad", zone: "south-west", tier: "core",
    geo: { lat: 23.0098, lng: 72.4651 }, pricePerSqft: [5600, 9200],
    blurb:
      "Between the Bopal schools and the Ambli retail belt, Ghuma is a quietly sensible pick for families priced out of both.",
  },

  // ── North: Chandkheda / Zundal growth corridor ─────────────────────────
  {
    slug: "chandkheda", name: "Chandkheda", city: "ahmedabad", zone: "north", tier: "core",
    geo: { lat: 23.1096, lng: 72.5825 }, pricePerSqft: [4600, 7800], featured: true,
    blurb:
      "The north's established centre, with a metro station and direct Gandhinagar access. Chandkheda is the most affordable part of Ahmedabad that still feels fully built-out.",
  },
  {
    slug: "zundal", name: "Zundal", city: "ahmedabad", zone: "north", tier: "core",
    geo: { lat: 23.1357, lng: 72.5571 }, pricePerSqft: [4300, 7600], featured: true,
    blurb:
      "The hinge between Ahmedabad and Gandhinagar, and one of the highest-volume launch corridors in the region. Strong for projects targeting GIFT City employment.",
  },
  {
    slug: "tragad", name: "Tragad", city: "ahmedabad", zone: "north", tier: "core",
    geo: { lat: 23.1022, lng: 72.5603 }, pricePerSqft: [4400, 7400],
    blurb:
      "Riverfront-adjacent and fast-developing. Tragad's newer towers offer Sabarmati views at roughly half what the equivalent costs on the west bank.",
  },
  {
    slug: "motera", name: "Motera", city: "ahmedabad", zone: "north", tier: "core",
    geo: { lat: 23.0981, lng: 72.5977 }, pricePerSqft: [4500, 7700],
    blurb:
      "Reshaped entirely by the Narendra Modi Stadium and the riverfront's northward march. Motera now carries infrastructure well ahead of its price band.",
  },
  {
    slug: "naranpura", name: "Naranpura", city: "ahmedabad", zone: "north", tier: "core",
    geo: { lat: 23.0544, lng: 72.5603 }, pricePerSqft: [6000, 9800],
    blurb:
      "Old-Ahmedabad respectability with new-Ahmedabad access. Naranpura's redevelopment wave is producing some of the best-located mid-rise stock in the city.",
  },

  // ── Central ────────────────────────────────────────────────────────────
  {
    slug: "navrangpura", name: "Navrangpura", city: "ahmedabad", zone: "central", tier: "core",
    geo: { lat: 23.0366, lng: 72.5611 }, pricePerSqft: [6800, 11000],
    blurb:
      "The academic and commercial heart of the old city — Gujarat University, CG Road, and a rental market that never softens because the demand is structural.",
  },
  {
    slug: "ambawadi", name: "Ambawadi", city: "ahmedabad", zone: "central", tier: "core",
    geo: { lat: 23.0203, lng: 72.5553 }, pricePerSqft: [6500, 10400],
    blurb:
      "Central, green and anchored by the city's best hospital cluster. Ambawadi is where buyers land when proximity to care matters most.",
  },
  {
    slug: "paldi", name: "Paldi", city: "ahmedabad", zone: "central", tier: "core",
    geo: { lat: 23.0107, lng: 72.5629 }, pricePerSqft: [5900, 9600],
    blurb:
      "Riverfront, old money and some of the finest mid-century architecture in Ahmedabad. Paldi rewards buyers who care what a building actually looks like.",
  },

  // ── South / East anchors ───────────────────────────────────────────────
  {
    slug: "maninagar", name: "Maninagar", city: "ahmedabad", zone: "south", tier: "core",
    geo: { lat: 22.9969, lng: 72.6029 }, pricePerSqft: [4300, 7200],
    blurb:
      "The east's commercial anchor, with the city's best rail and metro access. Dense, self-sufficient, and much better value than its west-side equivalents.",
  },
  {
    slug: "nikol", name: "Nikol", city: "ahmedabad", zone: "east", tier: "core",
    geo: { lat: 23.0505, lng: 72.6655 }, pricePerSqft: [3600, 6000],
    blurb:
      "One of the fastest-absorbing affordable corridors in the city. Nikol moves volume — the buyer here is price-led and decides quickly, which suits a well-marketed launch.",
  },
  {
    slug: "naroda", name: "Naroda", city: "ahmedabad", zone: "east", tier: "core",
    geo: { lat: 23.0712, lng: 72.6506 }, pricePerSqft: [3400, 5800],
    blurb:
      "Industrial employment at scale with a large resident workforce. Naroda is an affordable-housing and rental market rather than an aspirational one.",
  },

  // ── GIFT City & Gandhinagar ────────────────────────────────────────────
  {
    slug: "gift-city", name: "GIFT City", city: "gandhinagar", zone: "gift-gandhinagar", tier: "core",
    geo: { lat: 23.1602, lng: 72.6847 }, pricePerSqft: [9500, 16000], featured: true,
    blurb:
      "India's only operational IFSC, and the most unusual residential market in Gujarat: walk-to-work towers, a district cooling system, and a tenant pool of banks and funds. Prices behave like a different state.",
  },
  {
    slug: "kudasan", name: "Kudasan", city: "gandhinagar", zone: "gift-gandhinagar", tier: "core",
    geo: { lat: 23.1894, lng: 72.6356 }, pricePerSqft: [5400, 9200], featured: true,
    blurb:
      "The default choice for GIFT City employees who want space. Kudasan combines Gandhinagar's planned grid with Ahmedabad-grade amenities.",
  },
  {
    slug: "randesan", name: "Randesan", city: "gandhinagar", zone: "gift-gandhinagar", tier: "core",
    geo: { lat: 23.1808, lng: 72.6477 }, pricePerSqft: [5200, 8900],
    blurb:
      "Quiet, green and increasingly premium, with direct GIFT access. Randesan's villa stock is the best in the Gandhinagar belt.",
  },
  {
    slug: "sargasan", name: "Sargasan", city: "gandhinagar", zone: "gift-gandhinagar", tier: "core",
    geo: { lat: 23.1689, lng: 72.6294 }, pricePerSqft: [5000, 8600],
    blurb:
      "The high-volume corridor on the Ahmedabad–Gandhinagar highway. Sargasan has the deepest new-launch pipeline in the district.",
  },

  /* ══════════════════════════════════════════════════════════════════════
     COVERED — real pages, no invented rate data
     Promote one to `core` by adding `pricePerSqft`, `blurb` and `geo`.
     ══════════════════════════════════════════════════════════════════════ */

  // ── West ───────────────────────────────────────────────────────────────
  covered("jodhpur", "Jodhpur", "west"),
  covered("shivranjani", "Shivranjani", "west"),
  covered("anandnagar", "Anandnagar", "west"),
  covered("vejalpur", "Vejalpur", "west"),
  covered("jivraj-park", "Jivraj Park", "west"),
  covered("makarba", "Makarba", "west"),
  covered("memnagar", "Memnagar", "west"),
  covered("sola", "Sola", "west"),
  covered("ghatlodia", "Ghatlodia", "west"),
  covered("chandlodia", "Chandlodia", "west"),
  covered("bhadaj", "Bhadaj", "west"),
  covered("ognaj", "Ognaj", "west"),
  covered("hebatpur", "Hebatpur", "west"),
  covered("sanathal", "Sanathal", "west"),
  covered("juhapura", "Juhapura", "west"),
  covered("sarkhej", "Sarkhej", "west"),
  covered("gyaspur", "Gyaspur", "west"),
  covered("ellisbridge", "Ellisbridge", "west"),
  covered("cg-road", "C G Road", "west"),
  covered("law-garden", "Law Garden", "west"),
  covered("panjrapole", "Panjrapole", "west"),
  covered("bopal-ghuma-road", "Bopal–Ghuma Road", "west"),
  covered("thaltej-hebatpur-road", "Thaltej–Hebatpur Road", "west"),

  // ── South-West ─────────────────────────────────────────────────────────
  covered("chharodi", "Chharodi", "south-west"),
  covered("sanand", "Sanand", "south-west"),
  covered("manipur", "Manipur", "south-west"),
  covered("vaishnodevi", "Vaishnodevi Circle", "south-west"),
  covered("khoraj-ahmedabad", "Khoraj", "south-west"),
  covered("telav", "Telav", "south-west"),
  covered("bakrol", "Bakrol", "south-west"),
  covered("kalyangadh", "Kalyangadh", "south-west"),
  covered("rancharda", "Rancharda", "south-west"),

  // ── North ──────────────────────────────────────────────────────────────
  covered("sabarmati", "Sabarmati", "north"),
  covered("new-ranip", "New Ranip", "north"),
  covered("ranip", "Ranip", "north"),
  covered("nava-vadaj", "Nava Vadaj", "north"),
  covered("old-vadaj", "Old Vadaj", "north"),
  covered("jagatpur", "Jagatpur", "north"),
  covered("bhat", "Bhat", "north"),
  covered("koteshwar", "Koteshwar", "north"),
  covered("khodiyar", "Khodiyar", "north"),
  covered("nirnaynagar", "Nirnaynagar", "north"),
  covered("subhash-bridge", "Subhash Bridge", "north"),
  covered("dharnidhar", "Dharnidhar", "north"),
  covered("akhbarnagar", "Akhbarnagar", "north"),

  // ── East ───────────────────────────────────────────────────────────────
  covered("odhav", "Odhav", "east"),
  covered("vastral", "Vastral", "east"),
  covered("ramol", "Ramol", "east"),
  covered("bapunagar", "Bapunagar", "east"),
  covered("rakhial", "Rakhial", "east"),
  covered("amraiwadi", "Amraiwadi", "east"),
  covered("khokhra", "Khokhra", "east"),
  covered("thakkarbapa-nagar", "Thakkarbapa Nagar", "east"),
  covered("krishnanagar", "Krishnanagar", "east"),
  covered("india-colony", "India Colony", "east"),
  covered("saijpur-bogha", "Saijpur Bogha", "east"),
  covered("sardarnagar", "Sardarnagar", "east"),
  covered("meghaninagar", "Meghaninagar", "east"),
  covered("asarwa", "Asarwa", "east"),
  covered("gomtipur", "Gomtipur", "east"),
  covered("saraspur", "Saraspur", "east"),
  covered("kathwada", "Kathwada", "east"),
  covered("singarva", "Singarva", "east"),
  covered("hathijan", "Hathijan", "east"),
  covered("vinzol", "Vinzol", "east"),
  covered("kubernagar", "Kubernagar", "east"),
  covered("nandanvan", "Nandanvan", "east"),
  covered("ctm", "CTM", "east"),
  covered("hatkeshwar", "Hatkeshwar", "east"),

  // ── South ──────────────────────────────────────────────────────────────
  covered("isanpur", "Isanpur", "south"),
  covered("ghodasar", "Ghodasar", "south"),
  covered("vatva", "Vatva", "south"),
  covered("narol", "Narol", "south"),
  covered("lambha", "Lambha", "south"),
  covered("danilimda", "Danilimda", "south"),
  covered("behrampura", "Behrampura", "south"),
  covered("shahwadi", "Shahwadi", "south"),
  covered("piplaj", "Piplaj", "south"),
  covered("jashodanagar", "Jashodanagar", "south"),
  covered("vasna", "Vasna", "south"),
  covered("kankaria", "Kankaria", "south"),
  covered("bhairavnath", "Bhairavnath", "south"),
  covered("vishala", "Vishala", "south"),

  // ── Central & Walled City ──────────────────────────────────────────────
  covered("shahibaug", "Shahibaug", "central"),
  covered("lal-darwaja", "Lal Darwaja", "central"),
  covered("kalupur", "Kalupur", "central"),
  covered("dariapur", "Dariapur", "central"),
  covered("shahpur", "Shahpur", "central"),
  covered("khadia", "Khadia", "central"),
  covered("jamalpur", "Jamalpur", "central"),
  covered("astodia", "Astodia", "central"),
  covered("raipur", "Raipur", "central"),
  covered("mirzapur", "Mirzapur", "central"),
  covered("girdharnagar", "Girdharnagar", "central"),
  covered("relief-road", "Relief Road", "central"),
  covered("income-tax", "Income Tax", "central"),
  covered("usmanpura", "Usmanpura", "central"),
  covered("stadium", "Stadium", "central"),

  // ── Gandhinagar & GIFT ─────────────────────────────────────────────────
  covered("raysan", "Raysan", "gift-gandhinagar", "gandhinagar"),
  covered("koba", "Koba", "gift-gandhinagar", "gandhinagar"),
  covered("adalaj", "Adalaj", "gift-gandhinagar", "gandhinagar"),
  covered("sughad", "Sughad", "gift-gandhinagar", "gandhinagar"),
  covered("pethapur", "Pethapur", "gift-gandhinagar", "gandhinagar"),
  covered("infocity", "Infocity", "gift-gandhinagar", "gandhinagar"),
  covered("pdpu", "PDEU / Raisan", "gift-gandhinagar", "gandhinagar"),
  covered("khoraj-gandhinagar", "Khoraj (Gandhinagar)", "gift-gandhinagar", "gandhinagar"),
  covered("vavol", "Vavol", "gift-gandhinagar", "gandhinagar"),
  covered("urjanagar", "Urjanagar", "gift-gandhinagar", "gandhinagar"),
  covered("chiloda", "Chiloda", "gift-gandhinagar", "gandhinagar"),
  covered("sector-1-10", "Sectors 1–10", "gift-gandhinagar", "gandhinagar"),
  covered("sector-11-20", "Sectors 11–20", "gift-gandhinagar", "gandhinagar"),
  covered("sector-21-30", "Sectors 21–30", "gift-gandhinagar", "gandhinagar"),
  covered("dholakuva", "Dholakuva", "gift-gandhinagar", "gandhinagar"),
  covered("sarkhej-gandhinagar-highway", "Sarkhej–Gandhinagar Highway", "gift-gandhinagar", "gandhinagar"),
];

/* ── Derived lookups. Built once at module load. ─────────────────────────── */

export const localityBySlug = new Map(localities.map((l) => [l.slug, l]));
export const featuredLocalities = localities.filter((l) => l.featured);
export const coreLocalities = localities.filter((l) => l.tier === "core");

/** True when we have a rate band worth showing. */
export function hasRates(
  l: Locality | undefined,
): l is Locality & { pricePerSqft: [number, number] } {
  return Boolean(l?.pricePerSqft);
}

/** Live, honest count for anywhere the site states coverage. */
export const localityCount = localities.length;
export const ahmedabadCount = localities.filter((l) => l.city === "ahmedabad").length;
export const gandhinagarCount = localities.filter((l) => l.city === "gandhinagar").length;
