import { demoProjects, demoProperties } from "@/lib/demo-data";
import type { AdminStats, Lead, Property, SiteVisit } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STUDIO FIXTURES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * So the admin panel is reviewable before Supabase exists. Kept separate
 * from `demo-data.ts` because that module is imported by public pages and
 * one of them is a Client Component — there is no reason to ship lead
 * fixtures into a browser bundle.
 *
 * The lead scores below match what the `score_lead` trigger in `schema.sql`
 * would actually compute from the same inputs, so the pipeline ordering is
 * representative rather than arbitrary.
 *
 * ⚠️  Entirely fictional. Names, numbers and notes are invented.
 */

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const daysAhead = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() + d);
  // Built from local parts — toISOString() would shift the date backwards
  // for anyone east of UTC, which includes all of India.
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
};

interface LeadSeed {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: Lead["source"];
  status: Lead["status"];
  score: number;
  budgetMax?: number;
  bhk?: number;
  localities?: string[];
  timeline?: string;
  hours: number;
  propertyIndex?: number;
  notes?: string;
}

const LEAD_SEEDS: LeadSeed[] = [
  {
    name: "Kaushal Mehta",
    phone: "+919824012345",
    email: "kaushal.mehta@example.com",
    message:
      "Looking at the 3 BHK in Serene Heights. Family of four, need possession before my daughter starts school in June 2028. Loan pre-approved with HDFC for 95 lakh.",
    source: "property_enquiry",
    status: "new",
    score: 85,
    budgetMax: 13_000_000,
    bhk: 3,
    localities: ["shilaj", "shela"],
    timeline: "immediate",
    hours: 3,
    propertyIndex: 0,
  },
  {
    name: "Dr. Anjali Rawal",
    phone: "+919898123456",
    email: "anjali.rawal@example.com",
    message:
      "Interested in the Aurelia 4 BHK. Would like to see the corner unit and understand the maintenance structure before we proceed.",
    source: "site_visit",
    status: "visit_scheduled",
    score: 92,
    budgetMax: 35_000_000,
    bhk: 4,
    localities: ["iskon-ambli", "thaltej"],
    timeline: "immediate",
    hours: 9,
    propertyIndex: 4,
    notes:
      "Visit confirmed for Saturday 11:00. Wants the builder delivery table beforehand — sent.",
  },
  {
    name: "Nirav Shah",
    phone: "+917925678901",
    message: "What is the all-in cost on the Chandkheda 2 BHK including stamp duty?",
    source: "calculator",
    status: "new",
    score: 48,
    budgetMax: 6_000_000,
    bhk: 2,
    localities: ["chandkheda"],
    timeline: "3m",
    hours: 20,
    propertyIndex: 7,
  },
  {
    name: "Pooja Trivedi",
    phone: "+919712345678",
    email: "pooja.t@example.com",
    message:
      "We want to sell our 3 BHK in Thaltej. Bought in 2014, 1,620 sq.ft carpet, 5th floor. What can we expect?",
    source: "sell_request",
    status: "contacted",
    score: 62,
    budgetMax: 15_000_000,
    localities: ["thaltej"],
    timeline: "6m",
    hours: 30,
    notes:
      "Called. Expectation is 1.72 Cr; comparables support 1.48–1.55 Cr. Sending the last four registrations in that tower.",
  },
  {
    name: "Harsh Patel",
    phone: "+919033456789",
    email: "harsh@example.com",
    message:
      "NRI buyer based in Dubai. Interested in GIFT City for the rental yield. Need to understand repatriation.",
    source: "property_enquiry",
    status: "qualified",
    score: 78,
    budgetMax: 30_000_000,
    bhk: 3,
    localities: ["gift-city", "kudasan"],
    timeline: "3m",
    hours: 52,
    propertyIndex: 9,
    notes:
      "Referred to CA for the IFSC banking structure. Genuinely qualified — funds already in an NRE account.",
  },
  {
    name: "Smita Joshi",
    phone: "+919845098765",
    message: "Just exploring options in Shela for now, not in a hurry.",
    source: "contact_form",
    status: "new",
    score: 32,
    bhk: 3,
    localities: ["shela", "south-bopal"],
    timeline: "exploring",
    hours: 70,
  },
  {
    name: "Rajesh Bhatt",
    phone: "+919726543210",
    email: "rbhatt@example.com",
    message:
      "Commercial office on SG Highway — want 6%+ yield. Can you share the current tenant profile at Anantam Axis?",
    source: "property_enquiry",
    status: "negotiating",
    score: 88,
    budgetMax: 12_000_000,
    timeline: "immediate",
    hours: 96,
    propertyIndex: 13,
    notes: "Offered 1.08 Cr against the 1.125 Cr ask. Seller considering. Follow up Monday.",
  },
  {
    name: "Falguni Desai",
    phone: "+919879012345",
    email: "falguni.d@example.com",
    source: "whatsapp",
    status: "closed_won",
    score: 70,
    budgetMax: 11_000_000,
    bhk: 3,
    localities: ["kudasan"],
    timeline: "immediate",
    hours: 240,
    propertyIndex: 10,
    notes:
      "Registered on the 12th of last month. Oorja Vistas 3 BHK. Has already referred two colleagues.",
  },
  {
    name: "Imran Qureshi",
    phone: "+919033112233",
    message: "Budget is 55 lakh max, want a 2 BHK in west Ahmedabad.",
    source: "contact_form",
    status: "closed_lost",
    score: 38,
    budgetMax: 5_500_000,
    bhk: 2,
    localities: ["gota"],
    timeline: "6m",
    hours: 400,
    notes:
      "Budget does not reach a west-side 2 BHK. Told him honestly and suggested Chandkheda or Gota. Went with another broker.",
  },
];

export const demoLeads: Lead[] = LEAD_SEEDS.map((s, i) => ({
  id: `demo-lead-${i + 1}`,
  name: s.name,
  phone: s.phone,
  email: s.email ?? null,
  message: s.message ?? null,
  source: s.source,
  status: s.status,
  property_id: s.propertyIndex !== undefined ? `demo-prop-${s.propertyIndex + 1}` : null,
  project_id: null,
  budget_min: null,
  budget_max: s.budgetMax ?? null,
  preferred_bhk: s.bhk ?? null,
  preferred_localities: s.localities ?? [],
  timeline: s.timeline ?? null,
  score: s.score,
  utm: {},
  referrer: null,
  user_agent: null,
  ip_hash: null,
  assigned_to: null,
  notes: s.notes ?? null,
  follow_up_at: null,
  contacted_at: s.status !== "new" ? hoursAgo(s.hours - 1) : null,
  closed_at: s.status.startsWith("closed") ? hoursAgo(s.hours - 24) : null,
  created_at: hoursAgo(s.hours),
  updated_at: hoursAgo(Math.max(0, s.hours - 2)),
}));

export const demoVisits: SiteVisit[] = [
  {
    id: "demo-visit-1",
    lead_id: "demo-lead-2",
    property_id: "demo-prop-5",
    project_id: null,
    visitor_name: "Dr. Anjali Rawal",
    visitor_phone: "+919898123456",
    slot_date: daysAhead(2),
    slot_time: "11:00",
    party_size: 2,
    status: "confirmed",
    notes: "Wants the builder delivery table in hand before the visit.",
    created_at: hoursAgo(9),
    updated_at: hoursAgo(8),
  },
  {
    id: "demo-visit-2",
    lead_id: "demo-lead-1",
    property_id: "demo-prop-1",
    project_id: null,
    visitor_name: "Kaushal Mehta",
    visitor_phone: "+919824012345",
    slot_date: daysAhead(3),
    slot_time: "17:30",
    party_size: 4,
    status: "requested",
    notes: null,
    created_at: hoursAgo(3),
    updated_at: hoursAgo(3),
  },
  {
    id: "demo-visit-3",
    lead_id: null,
    property_id: "demo-prop-11",
    project_id: null,
    visitor_name: "Sanjay Raval",
    visitor_phone: "+919726001122",
    slot_date: daysAhead(5),
    slot_time: "10:30",
    party_size: 2,
    status: "requested",
    notes: "Coming from Gandhinagar, prefers morning.",
    created_at: hoursAgo(26),
    updated_at: hoursAgo(26),
  },
  {
    id: "demo-visit-4",
    lead_id: "demo-lead-8",
    property_id: "demo-prop-11",
    project_id: null,
    visitor_name: "Falguni Desai",
    visitor_phone: "+919879012345",
    slot_date: "2026-09-12",
    slot_time: "16:00",
    party_size: 3,
    status: "completed",
    notes: "Proceeded to booking.",
    created_at: hoursAgo(300),
    updated_at: hoursAgo(290),
  },
];

export function demoAdminStats(): AdminStats {
  const live = demoProperties.length;

  return {
    properties_total: live + 1, // the one draft below
    properties_live: live,
    properties_draft: 1,
    projects_total: demoProjects.length,
    leads_total: demoLeads.length,
    leads_new: demoLeads.filter((l) => l.status === "new").length,
    leads_week: demoLeads.filter((l) => Date.parse(l.created_at) > Date.now() - 7 * 864e5).length,
    visits_upcoming: demoVisits.filter(
      (v) => v.status === "requested" || v.status === "confirmed",
    ).length,
    views_total: demoProperties.reduce((sum, p) => sum + p.view_count, 0),
    inventory_value: demoProperties.reduce((sum, p) => sum + (p.price ?? 0), 0),
  };
}

/**
 * The admin list shows drafts, which the public fixtures deliberately
 * exclude — so one is synthesised here to demonstrate the publish workflow.
 */
/**
 * The exact shape the studio listings table reads.
 *
 * `demoProperties` is typed `PropertyCard`, which is the *public* card
 * projection — it has no `enquiry_count`, `rera_id` or `updated_at`. The
 * admin table needs all three, and because the page used to cast these rows
 * `as never[]`, TypeScript never checked it: the Activity column rendered
 * "412 views · enq." with the number silently `undefined`. Naming the
 * contract here means the compiler catches the next missing column.
 */
export type AdminPropertyRow = Pick<
  Property,
  | "id" | "slug" | "title" | "status" | "city" | "locality_slug"
  | "property_type" | "category" | "bhk" | "bathrooms" | "carpet_sqft"
  | "price" | "price_on_request" | "hero_image" | "is_featured"
  | "is_exclusive" | "rera_id" | "rera_verified" | "lat" | "lng"
  | "possession" | "possession_date" | "view_count" | "enquiry_count"
  | "updated_at"
>;

export function demoAdminProperties(): AdminPropertyRow[] {
  const dayAgo = (n: number) =>
    new Date(Date.now() - 1000 * 60 * 60 * 24 * n).toISOString();

  const rows: AdminPropertyRow[] = demoProperties.map((p, i) => ({
    ...p,
    // Columns the public card projection does not carry.
    rera_id: p.rera_verified
      ? "PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA11287/310125"
      : null,
    // Roughly one enquiry per 18 views, matching the detail fixtures.
    enquiry_count: Math.round(p.view_count / 18),
    // Staggered so the "recently edited" ordering is actually meaningful.
    updated_at: dayAgo(2 + i),
  }));

  const base = rows[0]!;

  return [
    ...rows,
    {
      ...base,
      id: "demo-prop-draft",
      slug: "3-bhk-draft-example-bodakdev",
      title: "3 BHK in Bodakdev — draft, not yet live",
      locality_slug: "bodakdev",
      status: "draft",
      is_featured: false,
      is_exclusive: false,
      rera_verified: false,
      rera_id: null,
      view_count: 0,
      enquiry_count: 0,
      price: 13_200_000,
      updated_at: dayAgo(0),
    },
  ];
}

/** Demo staff identity for the studio shell. */
export const demoProfile = {
  full_name: "Demo Administrator",
  email: "demo@localhost",
  role: "admin",
};
