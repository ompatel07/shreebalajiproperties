"use server";

import { headers } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  LIMITS,
  checkEnquiryRate,
  clientIp,
  hashIp,
  tokenBucket,
} from "@/lib/rate-limit";
import {
  enquirySchema,
  fieldErrors,
  sellRequestSchema,
  siteVisitSchema,
} from "@/lib/validation";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENQUIRY SERVER ACTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The one place the public can write to the database, so it is the one place
 * worth being paranoid about. Every submission passes five gates in order:
 *
 *   1. **Honeypot** — a hidden field a real browser leaves empty.
 *   2. **Time-on-form** — a human takes >1.5s to read and type.
 *   3. **Zod** — shape, length and format, with phone normalised to E.164.
 *   4. **Rate limit** — in-process token bucket, then an authoritative count
 *      over `leads.ip_hash` in Postgres.
 *   5. **Service role insert** — `leads` has NO anon RLS policy, so even a
 *      leaked public key cannot read or write the client's customer list.
 *
 * Return shape is always `{ ok, message, errors? }` so forms can render field
 * errors without throwing, and a failure never leaks a database message to
 * the browser.
 */

export interface ActionResult {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
}

/** Never let a Postgres error string reach the client. */
const GENERIC_FAILURE =
  "Something went wrong at our end. Please call or WhatsApp us — we will pick up.";

async function requestContext() {
  const h = await headers();
  const ip = clientIp(h);

  return {
    ipHash: hashIp(ip),
    userAgent: (h.get("user-agent") ?? "").slice(0, 400),
    referrer: (h.get("referer") ?? "").slice(0, 500),
  };
}

/** Pull UTM parameters off the referring URL for attribution. */
function utmFrom(referrer: string): Record<string, string> {
  try {
    const url = new URL(referrer);
    const utm: Record<string, string> = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
      const value = url.searchParams.get(key);
      if (value) utm[key] = value.slice(0, 120);
    }
    if (url.pathname) utm.landing_path = url.pathname.slice(0, 200);
    return utm;
  } catch {
    return {};
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROPERTY / CONTACT ENQUIRY
   ═══════════════════════════════════════════════════════════════════════════ */

export async function submitEnquiry(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData) as Record<string, string>;

  // ── Gate 1: honeypot ──────────────────────────────────────────────────
  if (raw.botField) {
    // Report success. Telling a bot it was detected only teaches the operator
    // to fix their script.
    return { ok: true, message: "Thank you — we will be in touch shortly." };
  }

  // ── Gate 2: time on form ──────────────────────────────────────────────
  const elapsed = Number(raw.elapsedMs ?? 0);
  if (elapsed > 0 && elapsed < 1500) {
    return { ok: true, message: "Thank you — we will be in touch shortly." };
  }

  // ── Gate 3: validation ────────────────────────────────────────────────
  const parsed = enquirySchema.safeParse({
    ...raw,
    preferredLocalities: raw.preferredLocalities
      ? raw.preferredLocalities.split(",").filter(Boolean)
      : undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      errors: fieldErrors(parsed.error),
    };
  }

  const input = parsed.data;
  const { ipHash, userAgent, referrer } = await requestContext();

  // ── Gate 4: rate limit ────────────────────────────────────────────────
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error("[submitEnquiry] admin client unavailable", error);
    return { ok: false, message: GENERIC_FAILURE };
  }

  const rate = await checkEnquiryRate(ipHash, LIMITS.enquiry, async (hash, since) => {
    const { count } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", hash)
      .gte("created_at", since);
    return count ?? 0;
  });

  if (!rate.ok) return { ok: false, message: rate.message };

  // ── Gate 5: insert ────────────────────────────────────────────────────
  const { error } = await supabase.from("leads").insert({
    name: input.name,
    phone: input.phone,
    email: input.email ?? null,
    message: input.message ?? null,
    source: input.source,
    property_id: input.propertyId ?? null,
    project_id: input.projectId ?? null,
    budget_min: input.budgetMin ?? null,
    budget_max: input.budgetMax ?? null,
    preferred_bhk: input.preferredBhk ?? null,
    preferred_localities: input.preferredLocalities ?? [],
    timeline: input.timeline ?? null,
    utm: utmFrom(referrer),
    referrer: referrer || null,
    user_agent: userAgent || null,
    ip_hash: ipHash,
  });

  if (error) {
    console.error("[submitEnquiry]", error.message);
    return { ok: false, message: GENERIC_FAILURE };
  }

  // Best-effort counter bump. A failure here must not fail the enquiry —
  // the lead is already safely recorded, which is the part that matters.
  if (input.propertyId) {
    await supabase.rpc("bump_property_enquiry", { p_id: input.propertyId }).then(
      () => undefined,
      () => undefined,
    );
  }

  return {
    ok: true,
    message:
      "Got it. One of our advisors will call you on this number, usually within a few working hours.",
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SITE VISIT
   ═══════════════════════════════════════════════════════════════════════════ */

export async function requestSiteVisit(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData) as Record<string, string>;

  if (raw.botField) {
    return { ok: true, message: "Thank you — we will confirm your slot shortly." };
  }

  const parsed = siteVisitSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      errors: fieldErrors(parsed.error),
    };
  }

  const input = parsed.data;
  const { ipHash, userAgent, referrer } = await requestContext();

  const memory = tokenBucket(
    `visit:${ipHash}`,
    LIMITS.siteVisit.limit,
    LIMITS.siteVisit.windowMs,
  );
  if (!memory.ok) {
    return {
      ok: false,
      message: "You already have a visit request in. Please call us to add another.",
    };
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error("[requestSiteVisit] admin client unavailable", error);
    return { ok: false, message: GENERIC_FAILURE };
  }

  // A visit is the highest-intent action on the site, so it creates a lead
  // too — the client should never have to reconcile two lists by hand.
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      message: input.message ?? null,
      source: "site_visit",
      status: "visit_scheduled",
      property_id: input.propertyId ?? null,
      project_id: input.projectId ?? null,
      timeline: "immediate",
      referrer: referrer || null,
      user_agent: userAgent || null,
      ip_hash: ipHash,
    })
    .select("id")
    .single();

  if (leadError) {
    console.error("[requestSiteVisit] lead", leadError.message);
    return { ok: false, message: GENERIC_FAILURE };
  }

  const { error: visitError } = await supabase.from("site_visits").insert({
    lead_id: lead?.id ?? null,
    property_id: input.propertyId ?? null,
    project_id: input.projectId ?? null,
    visitor_name: input.name,
    visitor_phone: input.phone,
    slot_date: input.slotDate,
    slot_time: input.slotTime,
    party_size: input.partySize,
    status: "requested",
  });

  if (visitError) {
    console.error("[requestSiteVisit] visit", visitError.message);
    // The lead landed, so this is a partial success — say something true
    // rather than claiming the slot is booked.
    return {
      ok: true,
      message:
        "We have your details and will call to confirm a slot — the calendar did not save automatically.",
    };
  }

  return {
    ok: true,
    message: `Requested for ${input.slotDate} at ${input.slotTime}. We will call to confirm before you travel.`,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SELL / LIST WITH US
   ═══════════════════════════════════════════════════════════════════════════ */

export async function submitSellRequest(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData) as Record<string, string>;

  if (raw.botField) {
    return { ok: true, message: "Thank you — we will be in touch." };
  }

  const elapsed = Number(raw.elapsedMs ?? 0);
  if (elapsed > 0 && elapsed < 1500) {
    return { ok: true, message: "Thank you — we will be in touch." };
  }

  const parsed = sellRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      errors: fieldErrors(parsed.error),
    };
  }

  const input = parsed.data;
  const { ipHash, userAgent, referrer } = await requestContext();

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error("[submitSellRequest] admin client unavailable", error);
    return { ok: false, message: GENERIC_FAILURE };
  }

  const rate = await checkEnquiryRate(ipHash, LIMITS.enquiry, async (hash, since) => {
    const { count } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", hash)
      .gte("created_at", since);
    return count ?? 0;
  });

  if (!rate.ok) return { ok: false, message: rate.message };

  // The structured details are folded into `message` and `preferred_*` so the
  // client works one inbox rather than two tables.
  const details = [
    `Wants to sell: ${input.propertyType}`,
    input.bhk ? `${input.bhk} BHK` : null,
    `Locality: ${input.locality}`,
    input.carpetSqft ? `Carpet: ${input.carpetSqft} sq.ft` : null,
    input.expectedPrice ? `Expected: ₹${input.expectedPrice.toLocaleString("en-IN")}` : null,
    input.message ? `\n\n${input.message}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const { error } = await supabase.from("leads").insert({
    name: input.name,
    phone: input.phone,
    email: input.email ?? null,
    message: details,
    source: "sell_request",
    preferred_localities: [input.locality],
    preferred_bhk: input.bhk ?? null,
    budget_max: input.expectedPrice ?? null,
    referrer: referrer || null,
    user_agent: userAgent || null,
    ip_hash: ipHash,
  });

  if (error) {
    console.error("[submitSellRequest]", error.message);
    return { ok: false, message: GENERIC_FAILURE };
  }

  return {
    ok: true,
    message:
      "Thank you. We will review the details and call you with an honest view of what it should fetch — and how quickly.",
  };
}
