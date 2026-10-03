import { z } from "zod";

import { amenities, localityBySlug, propertyTypes, site } from "@/config/site";

/**
 * Zod is the trust boundary. Nothing from a browser reaches Postgres without
 * passing through a schema in this file first — the DB CHECK constraints in
 * `schema.sql` are the second line, not the first.
 */

/* ── Primitives ──────────────────────────────────────────────────────────── */

/**
 * Indian mobile numbers. Accepts the formats people actually type —
 * `9876543210`, `+91 98765 43210`, `098765-43210` — and normalises to E.164.
 * Rejects 0–5 leading digits, which are not valid Indian mobile prefixes.
 */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .refine((v) => /^(\+?91)?[6-9]\d{9}$/.test(v), {
    message: "Enter a valid 10-digit Indian mobile number",
  })
  .transform((v) => {
    const digits = v.replace(/^\+?91/, "");
    return `+91${digits}`;
  });

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your name")
  .max(120, "That name is too long")
  // Letters, spaces, apostrophes, hyphens, dots. Blocks URLs and markup,
  // which is almost all of what bots put in a name field.
  .regex(/^[\p{L}\p{M}\s.''-]+$/u, "Letters only, please");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("That email does not look right")
  .max(180);

const localitySlugSchema = z
  .string()
  .refine((v) => localityBySlug.has(v), "Unknown locality");

/* ── Public enquiry ──────────────────────────────────────────────────────── */

export const enquirySchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("").transform(() => undefined)),
  message: z.string().trim().max(2000, "Please keep it under 2000 characters").optional(),

  propertyId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),

  budgetMin: z.coerce.number().int().min(0).max(100_000_000_000).optional(),
  budgetMax: z.coerce.number().int().min(0).max(100_000_000_000).optional(),
  preferredBhk: z.coerce.number().min(0).max(20).optional(),
  preferredLocalities: z.array(localitySlugSchema).max(10).optional(),
  timeline: z.enum(["immediate", "3m", "6m", "exploring"]).optional(),

  source: z
    .enum(["property_enquiry", "contact_form", "sell_request", "calculator", "site_visit"])
    .default("property_enquiry"),

  /**
   * Honeypot. A real browser leaves this empty because it is visually hidden
   * and `tabindex="-1"`; naive bots fill every input they find. Cheaper and
   * more private than a CAPTCHA, and costs nothing — which matters here
   * because we are deliberately avoiding paid services.
   */
  botField: z.string().max(0, "Rejected").optional(),

  /**
   * Milliseconds the form was on screen before submit. Humans take a few
   * seconds to read and type; scripted posts are near-instant.
   */
  elapsedMs: z.coerce.number().int().min(0).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

/* ── Site visit ──────────────────────────────────────────────────────────── */

export const siteVisitSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("").transform(() => undefined)),
  propertyId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  slotDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
    .refine((v) => {
      const d = new Date(`${v}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ninety = new Date(today);
      ninety.setDate(ninety.getDate() + 90);
      return d >= today && d <= ninety;
    }, "Pick a date within the next 90 days"),
  slotTime: z.string().regex(/^(1[0-9]|20):(00|30)$/, "Pick a slot between 10:00 and 20:00"),
  partySize: z.coerce.number().int().min(1).max(20).default(1),
  message: z.string().trim().max(1000).optional(),
  botField: z.string().max(0).optional(),
});

/* ── Sell / list-with-us ─────────────────────────────────────────────────── */

export const sellRequestSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("").transform(() => undefined)),
  locality: localitySlugSchema,
  propertyType: z
    .string()
    .refine((v) => propertyTypes.some((t) => t.slug === v), "Pick a property type"),
  bhk: z.coerce.number().min(0).max(20).optional(),
  carpetSqft: z.coerce.number().int().min(50).max(200_000).optional(),
  expectedPrice: z.coerce.number().int().min(100_000).max(100_000_000_000).optional(),
  message: z.string().trim().max(2000).optional(),
  botField: z.string().max(0).optional(),
  elapsedMs: z.coerce.number().int().min(0).optional(),
});

/* ── Admin: property ─────────────────────────────────────────────────────── */

const amenitySchema = z.enum(amenities as unknown as [string, ...string[]]);

export const propertyUpsertSchema = z
  .object({
    id: z.string().uuid().optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3)
      .max(120)
      .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Lowercase letters, numbers and hyphens only"),
    title: z.string().trim().min(6).max(200),

    projectId: z.string().uuid().nullable().optional(),
    builderId: z.string().uuid().nullable().optional(),

    city: z.enum(site.cities.map((c) => c.slug) as unknown as [string, ...string[]]),
    localitySlug: localitySlugSchema,
    address: z.string().trim().max(400).optional(),
    lat: z.coerce.number().min(-90).max(90).nullable().optional(),
    lng: z.coerce.number().min(-180).max(180).nullable().optional(),

    category: z.enum(["residential", "commercial", "land"]),
    propertyType: z
      .string()
      .refine((v) => propertyTypes.some((t) => t.slug === v), "Unknown property type"),
    transaction: z.enum(["sale", "rent", "lease"]).default("sale"),
    status: z
      .enum(["draft", "published", "under_offer", "sold", "rented", "archived"])
      .default("draft"),

    bhk: z.coerce.number().min(0).max(20).nullable().optional(),
    bathrooms: z.coerce.number().int().min(0).max(20).nullable().optional(),
    balconies: z.coerce.number().int().min(0).max(20).nullable().optional(),
    floorNo: z.coerce.number().int().min(-5).max(200).nullable().optional(),
    totalFloors: z.coerce.number().int().min(0).max(200).nullable().optional(),
    facing: z
      .enum(["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"])
      .nullable()
      .optional(),
    furnishing: z.enum(["unfurnished", "semi-furnished", "furnished"]).nullable().optional(),
    ageYears: z.coerce.number().int().min(0).max(120).nullable().optional(),

    carpetSqft: z.coerce.number().int().min(50).max(500_000).nullable().optional(),
    builtupSqft: z.coerce.number().int().min(50).max(500_000).nullable().optional(),
    superSqft: z.coerce.number().int().min(50).max(500_000).nullable().optional(),
    plotSqft: z.coerce.number().int().min(50).max(5_000_000).nullable().optional(),

    price: z.coerce.number().int().min(0).max(100_000_000_000).nullable().optional(),
    priceOnRequest: z.boolean().default(false),
    maintenancePsf: z.coerce.number().min(0).max(1000).nullable().optional(),
    bookingAmount: z.coerce.number().int().min(0).nullable().optional(),
    isNegotiable: z.boolean().default(true),

    possession: z
      .enum([
        "ready-to-move",
        "new-launch",
        "possession-in-1-year",
        "possession-in-2-years",
        "possession-after-2-years",
      ])
      .default("ready-to-move"),
    possessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),

    reraId: z.string().trim().max(120).nullable().optional(),
    reraVerified: z.boolean().default(false),

    description: z.string().trim().max(8000).optional(),
    highlights: z.array(z.string().trim().max(200)).max(12).default([]),
    amenities: z.array(amenitySchema).max(40).default([]),
    nearby: z
      .array(
        z.object({
          name: z.string().trim().max(120),
          type: z.enum(["school", "hospital", "mall", "transit", "office", "park", "temple"]),
          distance_km: z.coerce.number().min(0).max(100),
        }),
      )
      .max(20)
      .default([]),

    heroImage: z.string().url().nullable().optional(),
    videoUrl: z.string().url().nullable().optional(),
    virtualTourUrl: z.string().url().nullable().optional(),

    isFeatured: z.boolean().default(false),
    isExclusive: z.boolean().default(false),
    sortOrder: z.coerce.number().int().min(-9999).max(9999).default(0),
  })
  // Mirrors the DB constraint, so the admin sees a field error instead of a
  // Postgres exception.
  .refine((v) => v.status !== "published" || v.price !== null || v.priceOnRequest, {
    message: "A published listing needs a price, or must be marked 'price on request'",
    path: ["price"],
  })
  .refine((v) => v.category !== "residential" || v.status !== "published" || !!v.carpetSqft, {
    message: "Carpet area is required before a residential listing can go live",
    path: ["carpetSqft"],
  });

export type PropertyUpsertInput = z.infer<typeof propertyUpsertSchema>;

/* ── Admin: lead triage ──────────────────────────────────────────────────── */

export const leadUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z
    .enum([
      "new",
      "contacted",
      "qualified",
      "visit_scheduled",
      "visited",
      "negotiating",
      "closed_won",
      "closed_lost",
    ])
    .optional(),
  notes: z.string().trim().max(4000).optional(),
  followUpAt: z.string().datetime().nullable().optional(),
  assignedTo: z.string().uuid().nullable().optional(),
});

/* ── Search params ───────────────────────────────────────────────────────── */

/**
 * Query-string filters. `catch` everywhere so a hand-edited or truncated URL
 * degrades to the unfiltered view instead of throwing a 500.
 */
export const searchParamsSchema = z.object({
  q: z.string().trim().max(120).optional().catch(undefined),
  type: z.string().optional().catch(undefined),
  category: z.enum(["residential", "commercial", "land"]).optional().catch(undefined),
  bhk: z.coerce.number().min(0).max(20).optional().catch(undefined),
  min: z.coerce.number().min(0).optional().catch(undefined),
  max: z.coerce.number().min(0).optional().catch(undefined),
  locality: z.string().optional().catch(undefined),
  possession: z.string().optional().catch(undefined),
  amenities: z.string().optional().catch(undefined),
  furnishing: z.string().optional().catch(undefined),
  sort: z
    .enum(["relevance", "price-asc", "price-desc", "newest", "area-desc", "psf-asc"])
    .default("relevance")
    .catch("relevance"),
  page: z.coerce.number().int().min(1).max(500).default(1).catch(1),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

/** Flatten Zod issues into `{ field: message }` for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    out[key] ??= issue.message;
  }
  return out;
}
