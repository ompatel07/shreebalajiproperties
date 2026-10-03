/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IDENTITY — the single source of brand truth
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Everything client-facing that is NOT inventory lives here: the name, the
 * phone number, the service list, the process, the portfolio. Edit this file
 * and nothing else to change the brand — the wordmark, <title> tags,
 * OpenGraph cards, JSON-LD schema, footer, WhatsApp links and e-mail
 * templates all read from here.
 *
 * ── WHAT THIS BUSINESS ACTUALLY IS ─────────────────────────────────────
 * Shree Krishna Properties is a **project marketing partner for builders**,
 * not a brokerage selling to home buyers. The paying client is the
 * developer; the service is demand generation and enquiry management for
 * their project, through to site visits and finance coordination.
 *
 * That shapes the whole site: the homepage argues to a builder, while the
 * project and listing pages are the delivery layer those services run on —
 * because you cannot "generate and manage enquiries" without somewhere for
 * a buyer to land.
 *
 * Sourced from the client's own marketing deck (Oct 2026). Anything NOT in
 * that deck is marked PLACEHOLDER below and must be confirmed before launch.
 */

export const site = {
  /* ── Identity ─────────────────────────────────────────────── from deck ─ */
  name: "Shree Krishna Properties",
  /** PLACEHOLDER: confirm the registered entity (LLP / Pvt Ltd / proprietor). */
  legalName: "Shree Krishna Properties",
  /** Rendered as the logotype; the second half takes the brass accent.
   *  The trailing space on `lead` is deliberate — JSX collapses whitespace
   *  between an expression and the next element. */
  wordmark: { lead: "SHREE ", tail: "KRISHNA" },

  tagline: "Building Success, Together.",
  /** The three-beat line from the deck's cover. */
  strapline: "Building Trust · Creating Demand · Delivering Results",
  /** What they sell, in the client's own words. */
  discipline: "Marketing Services for Builders",

  /** One sentence. Default meta description and schema.org description. */
  description:
    "A project marketing partner for builders in Ahmedabad. Shree Krishna Properties creates demand, manages enquiries, coordinates site visits and supports customers through financing — so projects move, not just get advertised.",

  /** PLACEHOLDER: the deck does not state a founding year. */
  foundedYear: 2018,

  /* ── Contact ─────────────────────────────────────────────── from deck ─ */
  contact: {
    phoneE164: "+919016506054",
    phoneDisplay: "+91 90165 06054",
    whatsapp: "919016506054",
    /** PLACEHOLDER: not in the deck. */
    email: "contact@shreekrishnaproperties.in",
    salesEmail: "projects@shreekrishnaproperties.in",
  },

  /** PLACEHOLDER: the deck gives no address. Confirm before launch — the
   *  office appears in the footer, the contact map and the LocalBusiness
   *  schema, all of which are trust signals in this market. */
  office: {
    line1: "Office address to be confirmed",
    line2: "",
    locality: "Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    postalCode: "380015",
    country: "IN",
    geo: { lat: 23.0225, lng: 72.5714 },
    hours: "Mon–Sat, 10:00 – 19:30 IST",
  },

  /** PLACEHOLDER: not in the deck. A RERA agent registration is the single
   *  strongest trust signal in Indian property — get the real number. */
  compliance: {
    reraAgentId: "",
    reraPortalUrl: "https://gujrera.gujarat.gov.in",
    gstin: "",
  },

  /* ── Numbers. Only what the deck supports. ──────────────────────────────
     `projects.length` is real. The rest are PLACEHOLDER and must be
     confirmed — an inflated figure is the fastest way to lose a referral. */
  trust: [
    { prefix: "", value: 6, suffix: "+", label: "Residential projects marketed" },
    { prefix: "", value: 6, suffix: "", label: "Growth functions, one partner" },
    { prefix: "", value: 1, suffix: "", label: "In-house team, end to end" },
    { prefix: "", value: 100, suffix: "%", label: "Builder-focused engagements" },
  ],

  social: {
    instagram: "",
    youtube: "",
    linkedin: "",
    facebook: "",
  },

  cities: [
    { slug: "ahmedabad", name: "Ahmedabad", geo: { lat: 23.0225, lng: 72.5714 } },
    { slug: "gandhinagar", name: "Gandhinagar", geo: { lat: 23.2156, lng: 72.6369 } },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   THE PITCH — all of this is lifted from the client's deck
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The problem the deck opens on: a good project still stalls when marketing
 * and sales are disconnected. Each entry is a leak point in the funnel.
 */
export const leakPoints = [
  { stage: "Visibility", leak: "Low project visibility" },
  { stage: "Enquiries", leak: "Inconsistent enquiry generation" },
  { stage: "Follow-up", leak: "Slow follow-up" },
  { stage: "Site visits", leak: "Missed site visits" },
  { stage: "Financing", leak: "Customer hesitation" },
  { stage: "Conversion", leak: "Financing and documentation barriers" },
] as const;

/** The four-tier funnel from the deck: marketing should not stop at the lead. */
export const funnel = [
  { label: "Attract", detail: "Project positioning + promotion" },
  { label: "Engage", detail: "Lead generation + enquiry management" },
  { label: "Convert", detail: "Customer follow-up + site visits" },
  { label: "Support", detail: "Sales coordination + financing assistance" },
] as const;

/** The six services, verbatim from the deck. */
export const services = [
  {
    slug: "project-positioning",
    title: "Project Positioning",
    summary: "Build the right market-facing proposition.",
    detail:
      "Before a single rupee goes into promotion, we decide what the project actually is to a buyer — who it is for, what it is worth, and which three things about it are worth repeating. A project marketed without a position is just an advertisement competing on price.",
  },
  {
    slug: "lead-generation",
    title: "Lead Generation",
    summary: "Create customer enquiry opportunities.",
    detail:
      "Digital and local visibility built around the project, not around a generic campaign. The objective is qualified enquiries from people who can actually finance the ticket size, not volume for a dashboard.",
  },
  {
    slug: "enquiry-management",
    title: "Enquiry Management",
    summary: "Ensure prospects do not disappear after the first interaction.",
    detail:
      "Most enquiries are lost in the gap between the first call and the second. Every enquiry is logged, scored and worked — so the builder is never relying on someone remembering to call back.",
  },
  {
    slug: "site-visit-coordination",
    title: "Site-Visit Coordination",
    summary: "Move interested prospects closer to the project.",
    detail:
      "Scheduling, confirming and following through on visits, including the confirmation call before anyone travels. A visit that does not happen is the most expensive kind of lead.",
  },
  {
    slug: "customer-follow-up",
    title: "Customer Follow-Up",
    summary: "Maintain communication and relationship momentum.",
    detail:
      "Structured follow-up through the decision window, which in residential property is usually weeks rather than days. The point is to stay present without becoming the broker who calls eleven times.",
  },
  {
    slug: "finance-coordination",
    title: "Finance Coordination",
    summary: "Support eligible customers through financing channels.",
    detail:
      "Working relationships with banks and financial-service providers, documentation guidance, and coordination through the loan process — so a buyer who wants the flat is not lost to paperwork.",
  },
] as const;

/** The six-stage engagement, verbatim from the deck. */
export const processStages = [
  { n: "01", label: "Position", detail: "Define how the project should be presented." },
  { n: "02", label: "Promote", detail: "Build digital and local visibility." },
  { n: "03", label: "Generate", detail: "Create customer enquiries." },
  { n: "04", label: "Engage", detail: "Manage enquiries and follow-ups." },
  { n: "05", label: "Visit", detail: "Coordinate site visits and customer interactions." },
  {
    n: "06",
    label: "Support",
    detail: "Assist sales and eligible customers with financing coordination.",
  },
] as const;

/** Conventional agency vs this partner. The deck's comparison table. */
export const comparison = [
  { conventional: "Campaign focused", ours: "Project focused" },
  { conventional: "Lead generation", ours: "Lead + enquiry management" },
  { conventional: "Marketing silo", ours: "Marketing + sales support" },
  { conventional: "Promotion", ours: "Promotion + site-visit coordination" },
  { conventional: "Customer acquisition", ours: "Customer journey support" },
  { conventional: "Separate finance dependency", ours: "Banking & financial-service coordination" },
] as const;

/** Why an in-house team changes execution speed. */
export const teamPillars = [
  {
    title: "Day-to-day execution",
    detail: "Managing active project marketing rather than handing over a plan.",
  },
  {
    title: "Market insight",
    detail: "Understanding customer behaviour and local market requirements.",
  },
  {
    title: "Rapid coordination",
    detail: "Instant movement between enquiries, site visits and follow-ups.",
  },
  {
    title: "Stakeholder alignment",
    detail: "Consistent communication with builders and project owners.",
  },
] as const;

/** Why project owners choose a partner who understands execution. */
export const whyPillars = [
  { title: "In-house team", detail: "Dedicated marketing execution." },
  { title: "Project experience", detail: "Experience across multiple developments." },
  { title: "Market knowledge", detail: "Understanding of customer demand." },
  { title: "Finance network", detail: "Banking and financial-service channels." },
  { title: "Result focus", detail: "Marketing aligned with project sales goals." },
] as const;

/**
 * Projects marketed, named in the deck.
 *
 * These are REAL project names supplied by the client. The locality and
 * description for each are PLACEHOLDER — the deck lists names only. Confirm
 * each one's area, configuration and builder before launch, because a
 * portfolio page with a wrong locality is worse than no portfolio page.
 */
export const portfolio = [
  { slug: "kailash-tirth-avenue", name: "Kailash Tirth Avenue", locality: null },
  { slug: "pushp-heights", name: "Pushp Heights", locality: null },
  { slug: "vraj-residency", name: "Vraj Residency", locality: null },
  { slug: "shivam-elegance", name: "Shivam Elegance", locality: null },
  { slug: "kushal-aavas-2-3", name: "Kushal Aavas 2 & 3", locality: null },
  { slug: "maruti-elanza", name: "Maruti Elanza", locality: null },
] as const;

/** Required wherever financing is mentioned. Straight from the deck. */
export const FINANCE_DISCLAIMER =
  "Final loan approval remains subject to the respective financial institution's policies.";

/* ── Site origin ─────────────────────────────────────────────────────────── */

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const absoluteUrl = (path: string) =>
  `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
