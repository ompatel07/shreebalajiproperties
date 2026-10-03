/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SITE CONFIG — the single source of brand truth.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Everything client-facing that is NOT inventory lives here: the name, the
 * phone number, the RERA registration, the trust numbers, the service area.
 *
 * Edit this file and nothing else to change the brand — the wordmark,
 * <title> tags, OpenGraph cards, JSON-LD schema, footer, WhatsApp links and
 * e-mail templates all read from here.
 *
 * ⚠️  STILL PLACEHOLDER, must be replaced before launch:
 *     · `legalName` — confirm the registered entity (LLP / Pvt Ltd /
 *       proprietorship). Currently the trading name only.
 *     · every value under `contact`, `office` and `compliance`
 *     · the figures in `trust`
 *
 * Inventory (properties, projects, localities with live counts) comes from
 * Supabase. The locality list below is the *taxonomy* — the set of SEO
 * landing pages that exist — not the listings themselves.
 */

export const site = {
  /* ── Identity ─────────────────────────────────────────────────────────── */
  name: "Shree Balaji Properties",
  /** Shown in the footer and the legal pages. CONFIRM THE REGISTERED ENTITY. */
  legalName: "Shree Balaji Properties",
  /**
   * Rendered as the logotype, split so the second half takes the brass
   * accent. The trailing space on `lead` is deliberate — JSX collapses
   * whitespace between a expression and the next element, so the separator
   * has to live inside the string.
   */
  wordmark: { lead: "SHREE ", tail: "BALAJI" },
  tagline: "Property, told properly.",
  /** One sentence. Used as the default meta description and in schema.org. */
  description:
    "RERA-verified flats, villas, penthouses, offices and land across Ahmedabad and Gandhinagar. Independent advice from a channel partner who co-invests in the projects it recommends.",
  foundedYear: 2018,

  /* ── Contact ──────────────────────────────────────────────────────────── */
  contact: {
    /** E.164, no spaces — used for tel: and wa.me links. */
    phoneE164: "+919876543210",
    /** Human-readable, used in visible copy. */
    phoneDisplay: "+91 98765 43210",
    /** wa.me requires the number with no "+" and no separators. */
    whatsapp: "919876543210",
    email: "hello@shreebalajiproperties.in",
    /** Where enquiry notifications land in the admin inbox. */
    salesEmail: "sales@shreebalajiproperties.in",
  },

  office: {
    line1: "4th Floor, Westgate Business Bay",
    line2: "Near YMCA Club, SG Highway",
    locality: "Makarba",
    city: "Ahmedabad",
    state: "Gujarat",
    postalCode: "380051",
    country: "IN",
    /** Used to centre the office pin on the contact-page map. */
    geo: { lat: 23.0105, lng: 72.5074 },
    hours: "Mon–Sat, 10:00 – 19:30 IST",
  },

  /* ── Compliance. In Indian real estate these are load-bearing trust
        signals, not legal boilerplate — show them prominently. ─────────── */
  compliance: {
    /** Gujarat RERA agent registration. Replace with the client's real number. */
    reraAgentId: "AG/GJ/AHMEDABAD/AHMEDABAD/AUDA/RAA00000/010124",
    reraPortalUrl: "https://gujrera.gujarat.gov.in",
    gstin: "24AAAAA0000A1Z5",
  },

  /* ── Trust numbers. Surfaced in the hero rail and the About page.
        Keep these honest — an inflated number is the fastest way to lose
        a referral in this market. ────────────────────────────────────────── */
  trust: [
    { value: 1800, suffix: "+", label: "Families moved in", kind: "count" },
    { value: 620, prefix: "₹", suffix: " Cr", label: "Property transacted", kind: "count" },
    { value: 53, suffix: "", label: "Localities covered", kind: "count" },
    { value: 100, suffix: "%", label: "RERA-verified listings", kind: "count" },
  ],

  /* ── Social. Empty strings are skipped by the footer renderer. ────────── */
  social: {
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    linkedin: "https://linkedin.com/",
    facebook: "",
  },

  /* ── Service area. Drives the city segment of every SEO route and the
        `areaServed` block in the RealEstateAgent schema. ─────────────────── */
  cities: [
    { slug: "ahmedabad", name: "Ahmedabad", geo: { lat: 23.0225, lng: 72.5714 } },
    { slug: "gandhinagar", name: "Gandhinagar", geo: { lat: 23.2156, lng: 72.6369 } },
  ],
} as const;

/**
 * ─── LOCALITY TAXONOMY ──────────────────────────────────────────────────────
 * The micro-markets this business actually operates in, grouped into the
 * corridors buyers in Ahmedabad think in. `zone` drives the map clustering
 * and the "explore by corridor" navigation; `blurb` is the intro copy on the
 * locality landing page (and is what makes these pages rank rather than read
 * as doorway pages).
 */
export type Zone = "west" | "south-west" | "north" | "gift-gandhinagar" | "central";

export interface Locality {
  slug: string;
  name: string;
  city: "ahmedabad" | "gandhinagar";
  zone: Zone;
  geo: { lat: number; lng: number };
  /** Indicative ₹/sq.ft, carpet. Shown as a range, refreshed quarterly. */
  pricePerSqft: [number, number];
  blurb: string;
  /** Marks the handful of corridors worth featuring on the homepage. */
  featured?: boolean;
}

export const localities: Locality[] = [
  /* ── West: the established premium spine ───────────────────────────────── */
  {
    slug: "thaltej",
    name: "Thaltej",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0469, lng: 72.5096 },
    pricePerSqft: [7800, 12500],
    blurb:
      "The address that set the benchmark for west Ahmedabad. Thaltej pairs mature infrastructure with the city's densest cluster of premium retail and Grade-A offices, which is why resale here holds its value better than almost anywhere else in the city.",
    featured: true,
  },
  {
    slug: "bodakdev",
    name: "Bodakdev",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.039, lng: 72.5121 },
    pricePerSqft: [7500, 11800],
    blurb:
      "Low-rise, tree-lined and quietly expensive. Bodakdev attracts buyers who want to be inside the SG Highway catchment without living on it — large older plots here are steadily giving way to boutique 4-BHK projects.",
  },
  {
    slug: "sindhubhavan",
    name: "Sindhu Bhavan Road",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0416, lng: 72.4869 },
    pricePerSqft: [8200, 13500],
    blurb:
      "Ahmedabad's restaurant and nightlife corridor, and the city's most aspirational commercial frontage. Residential stock is limited and premium, which keeps rental yields on the better towers unusually strong.",
    featured: true,
  },
  {
    slug: "sg-highway",
    name: "SG Highway",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0312, lng: 72.5063 },
    pricePerSqft: [6800, 11000],
    blurb:
      "The arterial that organises the entire western city. Everything on SG Highway trades on connectivity — if a commute matters more than a garden, start your search here.",
  },
  {
    slug: "vastrapur",
    name: "Vastrapur",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0395, lng: 72.5295 },
    pricePerSqft: [7200, 11500],
    blurb:
      "Built around the lake and IIM-A, Vastrapur is the rare west-side locality that is genuinely walkable. Very little new supply, so almost all movement here is resale.",
  },
  {
    slug: "satellite",
    name: "Satellite",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0276, lng: 72.5202 },
    pricePerSqft: [6900, 10800],
    blurb:
      "Established, well-served and consistently liquid. Satellite's schools and hospitals make it the default answer for families who want to stop renting and settle.",
  },
  {
    slug: "iskon-ambli",
    name: "Iskon–Ambli",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0255, lng: 72.4878 },
    pricePerSqft: [7400, 12800],
    blurb:
      "The Iskon–Ambli stretch is where west Ahmedabad's new luxury supply has concentrated: tall towers, deep amenity decks, and the city's highest concentration of 4-BHK-and-above inventory.",
    featured: true,
  },
  {
    slug: "ambli",
    name: "Ambli",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0211, lng: 72.4772 },
    pricePerSqft: [7600, 13200],
    blurb:
      "Bungalow country turning vertical. Ambli holds some of the largest private plots inside the AUDA limit, and the villa projects here are the closest Ahmedabad gets to gated-estate living.",
  },
  {
    slug: "shilaj",
    name: "Shilaj",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0318, lng: 72.4582 },
    pricePerSqft: [6200, 10500],
    blurb:
      "The most active new-launch corridor in the city. Shilaj offers newer construction and larger carpets than Thaltej at a meaningful discount — the trade-off is that the retail and schools are still arriving.",
    featured: true,
  },
  {
    slug: "bhadaj",
    name: "Bhadaj",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0569, lng: 72.4631 },
    pricePerSqft: [5400, 8800],
    blurb:
      "Bhadaj reads as Shilaj did six years ago: low density, ring-road access, and the sort of entry pricing that rewards buyers who can wait out a possession cycle.",
  },
  {
    slug: "ognaj",
    name: "Ognaj",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0724, lng: 72.4857 },
    pricePerSqft: [5200, 8400],
    blurb:
      "Directly on the SP Ring Road with fast access to both the west and the north. Ognaj's appeal is simple arithmetic — more square feet per rupee than anything comparable closer in.",
  },
  {
    slug: "ghuma",
    name: "Ghuma",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0098, lng: 72.4651 },
    pricePerSqft: [5600, 9200],
    blurb:
      "Ghuma sits between the Bopal schools and the Ambli retail belt, which makes it a quietly sensible pick for families priced out of both.",
  },
  {
    slug: "sola",
    name: "Sola",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0758, lng: 72.5201 },
    pricePerSqft: [5800, 9400],
    blurb:
      "Anchored by the civil hospital and the science city road, Sola is dense, well-connected and full of mid-size redevelopment — good hunting ground for value resale.",
  },
  {
    slug: "science-city",
    name: "Science City",
    city: "ahmedabad",
    zone: "west",
    geo: { lat: 23.0795, lng: 72.5006 },
    pricePerSqft: [6100, 10200],
    blurb:
      "A planned, green and notably quiet pocket. Science City Road has matured into a genuine family corridor without ever becoming a thoroughfare.",
  },

  /* ── South-West: the Bopal / Shela family belt ─────────────────────────── */
  {
    slug: "bopal",
    name: "Bopal",
    city: "ahmedabad",
    zone: "south-west",
    geo: { lat: 23.0333, lng: 72.4667 },
    pricePerSqft: [5400, 8900],
    blurb:
      "The original family suburb of the south-west, and still the best-serviced. Bopal's schools, clinics and markets are all walkable, which is why it holds families for decades rather than years.",
    featured: true,
  },
  {
    slug: "south-bopal",
    name: "South Bopal",
    city: "ahmedabad",
    zone: "south-west",
    geo: { lat: 23.0229, lng: 72.4698 },
    pricePerSqft: [5700, 9600],
    blurb:
      "Newer, taller and more amenity-led than Bopal proper. South Bopal is where most of the area's 3-BHK supply with a real clubhouse now sits.",
    featured: true,
  },
  {
    slug: "shela",
    name: "Shela",
    city: "ahmedabad",
    zone: "south-west",
    geo: { lat: 23.0062, lng: 72.4729 },
    pricePerSqft: [5200, 9000],
    blurb:
      "The single busiest construction corridor in Ahmedabad. Shela's volume of new launches means real negotiating room on inventory — and the widest choice of possession dates anywhere in the city.",
    featured: true,
  },
  {
    slug: "vaishnodevi",
    name: "Vaishnodevi Circle",
    city: "ahmedabad",
    zone: "south-west",
    geo: { lat: 23.1116, lng: 72.5351 },
    pricePerSqft: [5300, 9200],
    blurb:
      "The junction of SG Highway and the Gandhinagar corridor, and the natural choice for anyone splitting time between the two cities. Mixed-use density here is rising fast.",
  },
  {
    slug: "sanand",
    name: "Sanand",
    city: "ahmedabad",
    zone: "south-west",
    geo: { lat: 22.9897, lng: 72.3814 },
    pricePerSqft: [3200, 5600],
    blurb:
      "Industrial employment at scale — Tata, Ford's successor plants and the auto ancillary belt. Sanand is a rental-yield and land play, not a lifestyle one.",
  },
  {
    slug: "chharodi",
    name: "Chharodi",
    city: "ahmedabad",
    zone: "south-west",
    geo: { lat: 23.0458, lng: 72.4423 },
    pricePerSqft: [4900, 8200],
    blurb:
      "Ring-road adjacency with genuinely large layouts. Chharodi suits buyers who want a weekend-villa footprint on a primary-residence budget.",
  },
  {
    slug: "makarba",
    name: "Makarba",
    city: "ahmedabad",
    zone: "south-west",
    geo: { lat: 23.0105, lng: 72.5074 },
    pricePerSqft: [5500, 9100],
    blurb:
      "Wedged between Prahladnagar and SG Highway, Makarba trades at a discount to both while sharing their access. Strong commercial pipeline.",
  },
  {
    slug: "prahlad-nagar",
    name: "Prahladnagar",
    city: "ahmedabad",
    zone: "south-west",
    geo: { lat: 23.0117, lng: 72.5101 },
    pricePerSqft: [7000, 11200],
    blurb:
      "Ahmedabad's most complete mixed-use district: corporate parks, the garden, and a retail spine that runs all day. Compact apartments here rent almost instantly.",
  },

  /* ── North: Chandkheda, Tragad, Zundal growth corridor ─────────────────── */
  {
    slug: "chandkheda",
    name: "Chandkheda",
    city: "ahmedabad",
    zone: "north",
    geo: { lat: 23.1096, lng: 72.5825 },
    pricePerSqft: [4600, 7800],
    blurb:
      "The north's established centre, with a metro station and direct Gandhinagar access. Chandkheda is the most affordable locality in Ahmedabad that still feels fully built-out.",
    featured: true,
  },
  {
    slug: "tragad",
    name: "Tragad",
    city: "ahmedabad",
    zone: "north",
    geo: { lat: 23.1022, lng: 72.5603 },
    pricePerSqft: [4400, 7400],
    blurb:
      "Riverfront-adjacent and fast-developing. Tragad's newer towers offer Sabarmati views at roughly half what the equivalent would cost on the west bank.",
  },
  {
    slug: "zundal",
    name: "Zundal",
    city: "ahmedabad",
    zone: "north",
    geo: { lat: 23.1357, lng: 72.5571 },
    pricePerSqft: [4300, 7600],
    blurb:
      "The hinge between Ahmedabad and Gandhinagar, and one of the highest-volume launch corridors in the region. Excellent for buyers whose work sits in GIFT City.",
    featured: true,
  },
  {
    slug: "jagatpur",
    name: "Jagatpur",
    city: "ahmedabad",
    zone: "north",
    geo: { lat: 23.0921, lng: 72.5446 },
    pricePerSqft: [4700, 8000],
    blurb:
      "Quiet, low-rise and close to the riverfront extension. Jagatpur's pricing still reflects its village origins rather than its current connectivity.",
  },
  {
    slug: "new-ranip",
    name: "New Ranip",
    city: "ahmedabad",
    zone: "north",
    geo: { lat: 23.0828, lng: 72.5658 },
    pricePerSqft: [4200, 6900],
    blurb:
      "Dense, practical and very well connected by both metro and BRTS. New Ranip is where first-time buyers in the north usually land.",
  },
  {
    slug: "motera",
    name: "Motera",
    city: "ahmedabad",
    zone: "north",
    geo: { lat: 23.0981, lng: 72.5977 },
    pricePerSqft: [4500, 7700],
    blurb:
      "Reshaped entirely by the Narendra Modi Stadium and the riverfront's northward march. Motera now carries infrastructure well ahead of its price band.",
  },
  {
    slug: "gota",
    name: "Gota",
    city: "ahmedabad",
    zone: "north",
    geo: { lat: 23.1017, lng: 72.5411 },
    pricePerSqft: [4900, 8300],
    blurb:
      "The north-west's workhorse locality — big supply, every budget, and an unusually broad spread of 2 and 3-BHK stock. If you need options, Gota has the most.",
    featured: true,
  },
  {
    slug: "naranpura",
    name: "Naranpura",
    city: "ahmedabad",
    zone: "north",
    geo: { lat: 23.0544, lng: 72.5603 },
    pricePerSqft: [6000, 9800],
    blurb:
      "Old-Ahmedabad respectability with new-Ahmedabad access. Naranpura's redevelopment wave is producing some of the best-located mid-rise stock in the city.",
  },
  {
    slug: "memnagar",
    name: "Memnagar",
    city: "ahmedabad",
    zone: "north",
    geo: { lat: 23.0552, lng: 72.5407 },
    pricePerSqft: [6200, 10000],
    blurb:
      "Central, mature, and tightly held. Very little trades in Memnagar, so when something good lists it moves within weeks.",
  },
  {
    slug: "khodiyar",
    name: "Khodiyar",
    city: "ahmedabad",
    zone: "north",
    geo: { lat: 23.1247, lng: 72.5411 },
    pricePerSqft: [4100, 7000],
    blurb:
      "Entry-level pricing on the Gandhinagar highway with ring-road access. Khodiyar is a patience play with a clear infrastructure tailwind.",
  },

  /* ── Central: the historic core ────────────────────────────────────────── */
  {
    slug: "navrangpura",
    name: "Navrangpura",
    city: "ahmedabad",
    zone: "central",
    geo: { lat: 23.0366, lng: 72.5611 },
    pricePerSqft: [6800, 11000],
    blurb:
      "The academic and commercial heart of the old city — Gujarat University, CG Road, and a rental market that never softens because the demand is structural.",
  },
  {
    slug: "ambawadi",
    name: "Ambawadi",
    city: "ahmedabad",
    zone: "central",
    geo: { lat: 23.0203, lng: 72.5553 },
    pricePerSqft: [6500, 10400],
    blurb:
      "Central, green and anchored by the city's best hospital cluster. Ambawadi is the locality buyers choose when proximity to care matters most.",
  },
  {
    slug: "paldi",
    name: "Paldi",
    city: "ahmedabad",
    zone: "central",
    geo: { lat: 23.0107, lng: 72.5629 },
    pricePerSqft: [5900, 9600],
    blurb:
      "Riverfront, old money and some of the finest mid-century architecture in Ahmedabad. Paldi rewards buyers who care what a building actually looks like.",
  },
  {
    slug: "vasna",
    name: "Vasna",
    city: "ahmedabad",
    zone: "central",
    geo: { lat: 23.0007, lng: 72.5494 },
    pricePerSqft: [4800, 7900],
    blurb:
      "Well-connected and genuinely affordable for how central it is. Vasna's riverfront edge is the part to watch.",
  },
  {
    slug: "maninagar",
    name: "Maninagar",
    city: "ahmedabad",
    zone: "central",
    geo: { lat: 22.9969, lng: 72.6029 },
    pricePerSqft: [4300, 7200],
    blurb:
      "The east's commercial anchor, with the city's best rail and metro access. Dense, self-sufficient, and much better value than its west-side equivalents.",
  },

  /* ── GIFT City & Gandhinagar ───────────────────────────────────────────── */
  {
    slug: "gift-city",
    name: "GIFT City",
    city: "gandhinagar",
    zone: "gift-gandhinagar",
    geo: { lat: 23.1602, lng: 72.6847 },
    pricePerSqft: [9500, 16000],
    blurb:
      "India's only operational IFSC, and the most unusual residential market in Gujarat: walk-to-work towers, a district cooling system, and a tenant pool of banks and funds. Prices behave like a different state.",
    featured: true,
  },
  {
    slug: "kudasan",
    name: "Kudasan",
    city: "gandhinagar",
    zone: "gift-gandhinagar",
    geo: { lat: 23.1894, lng: 72.6356 },
    pricePerSqft: [5400, 9200],
    blurb:
      "The default choice for GIFT City employees who want space. Kudasan combines Gandhinagar's planned grid with Ahmedabad-grade amenities.",
    featured: true,
  },
  {
    slug: "randesan",
    name: "Randesan",
    city: "gandhinagar",
    zone: "gift-gandhinagar",
    geo: { lat: 23.1808, lng: 72.6477 },
    pricePerSqft: [5200, 8900],
    blurb:
      "Quiet, green and increasingly premium, with direct GIFT access. Randesan's villa stock is the best in the Gandhinagar belt.",
  },
  {
    slug: "sargasan",
    name: "Sargasan",
    city: "gandhinagar",
    zone: "gift-gandhinagar",
    geo: { lat: 23.1689, lng: 72.6294 },
    pricePerSqft: [5000, 8600],
    blurb:
      "The high-volume corridor on the Ahmedabad–Gandhinagar highway. Sargasan has the deepest new-launch pipeline in the district.",
  },
  {
    slug: "raysan",
    name: "Raysan",
    city: "gandhinagar",
    zone: "gift-gandhinagar",
    geo: { lat: 23.1727, lng: 72.6614 },
    pricePerSqft: [4800, 8300],
    blurb:
      "Bordering GIFT with notably large plot sizes. Raysan is where the district's bungalow buyers are concentrating.",
  },
  {
    slug: "koba",
    name: "Koba",
    city: "gandhinagar",
    zone: "gift-gandhinagar",
    geo: { lat: 23.2061, lng: 72.6721 },
    pricePerSqft: [4300, 7500],
    blurb:
      "Airport-side Gandhinagar, on the Koba circle. Early in its cycle, with the infrastructure already committed.",
  },
  {
    slug: "adalaj",
    name: "Adalaj",
    city: "gandhinagar",
    zone: "gift-gandhinagar",
    geo: { lat: 23.1663, lng: 72.5806 },
    pricePerSqft: [4200, 7200],
    blurb:
      "Named for the stepwell, and still one of the calmest places to live within reach of both cities. Weekend-home and farmhouse territory.",
  },
  {
    slug: "pdpu",
    name: "PDEU / Raisan",
    city: "gandhinagar",
    zone: "gift-gandhinagar",
    geo: { lat: 23.1538, lng: 72.6654 },
    pricePerSqft: [5100, 8700],
    blurb:
      "Built around the energy university, with a steady academic rental market and the shortest commute into GIFT of any Gandhinagar locality.",
  },
  {
    slug: "khoraj",
    name: "Khoraj",
    city: "gandhinagar",
    zone: "gift-gandhinagar",
    geo: { lat: 23.1403, lng: 72.6033 },
    pricePerSqft: [4400, 7600],
    blurb:
      "On the Zundal–Gandhinagar axis, Khoraj is absorbing spillover from both ends. Good entry pricing, improving roads.",
  },
  {
    slug: "sughad",
    name: "Sughad",
    city: "gandhinagar",
    zone: "gift-gandhinagar",
    geo: { lat: 23.1239, lng: 72.5896 },
    pricePerSqft: [4300, 7300],
    blurb:
      "Between Chandkheda and Adalaj, Sughad is the quiet middle of the northern corridor — and priced accordingly.",
  },
  {
    slug: "sector-21",
    name: "Sector 21",
    city: "gandhinagar",
    zone: "gift-gandhinagar",
    geo: { lat: 23.2156, lng: 72.6369 },
    pricePerSqft: [4900, 8100],
    blurb:
      "Government Gandhinagar at its most liveable: wide sectoral roads, mature trees, and a resale market driven almost entirely by transfers.",
  },
];

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

/* ── Derived lookups. Built once at module load. ─────────────────────────── */
export const localityBySlug = new Map(localities.map((l) => [l.slug, l]));
export const featuredLocalities = localities.filter((l) => l.featured);

export const zoneLabels: Record<Zone, string> = {
  west: "West Ahmedabad",
  "south-west": "Bopal · Shela Belt",
  north: "North Corridor",
  "gift-gandhinagar": "GIFT City · Gandhinagar",
  central: "Central Ahmedabad",
};

/** Absolute site origin, safe on both server and client. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const absoluteUrl = (path: string) =>
  `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
