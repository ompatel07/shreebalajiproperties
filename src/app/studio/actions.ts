"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";

import { isDemoMode } from "@/lib/demo-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { LIMITS, clientIp, tokenBucket } from "@/lib/rate-limit";
import { fieldErrors, leadUpdateSchema, propertyUpsertSchema } from "@/lib/validation";
import { slugify } from "@/lib/format";
import type { Property } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADMIN SERVER ACTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Every action here uses the RLS-BOUND client (`createClient`), never the
 * service role. That is the central security decision in the admin panel:
 *
 *   · Authorisation is enforced by Postgres, via the `is_staff()` policies,
 *     not by this TypeScript. If one of these functions forgot its auth
 *     check, the database would still refuse the write.
 *   · So a bug here is a 403, not a breach.
 *
 * The service role is used in exactly one place below — writing the
 * append-only audit log, which no interactive role is permitted to write.
 *
 * `assertStaff()` runs first regardless, so the UI can show a sensible error
 * instead of a raw PostgREST failure.
 */

export interface AdminResult {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  id?: string;
}

/**
 * In demo mode there is no database to write to. Rather than letting every
 * action fail against a dead host, each one short-circuits with an honest
 * message — so the panel stays fully browsable and obviously read-only.
 */
const DEMO_READONLY: AdminResult = {
  ok: false,
  message:
    "Read-only demo. Connect Supabase in .env.local to enable editing — every control here works against a real database.",
};

/**
 * Confirms a verified session AND a staff profile row.
 *
 * `getUser()` revalidates the JWT with Supabase on every call. `getSession()`
 * would only decode a cookie the client controls, which is not an
 * authorisation signal.
 */
async function assertStaff() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/studio/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const row = profile as { id: string; email: string; role: string; full_name: string | null } | null;

  if (!row || !["admin", "agent"].includes(row.role)) {
    redirect("/studio/denied");
  }

  return { supabase, user, profile: row! };
}

/** Append-only audit trail. Service role, because nothing else may write it. */
async function audit(
  actor: { id: string; email: string },
  action: string,
  entity: string,
  entityId: string | null,
  diff?: Record<string, unknown>,
) {
  try {
    await createAdminClient().from("audit_log").insert({
      actor_id: actor.id,
      actor_email: actor.email,
      action,
      entity,
      entity_id: entityId,
      diff: diff ?? null,
    });
  } catch (error) {
    // Never fail a legitimate admin action because logging failed.
    console.error("[audit]", error);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════════════════════════════════ */

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  next: z.string().startsWith("/").max(300).optional(),
});

export async function signIn(formData: FormData): Promise<AdminResult> {
  if (isDemoMode()) {
    return {
      ok: false,
      message:
        "Demo mode — there is no auth backend to sign in against. The studio is already open; browse it directly at /studio.",
    };
  }

  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check your details.",
      errors: fieldErrors(parsed.error),
    };
  }

  // Rate limit by IP, to blunt credential stuffing. Supabase enforces its own
  // limits too, but failing fast here avoids burning them.
  const ip = clientIp(await headers());
  const bucket = tokenBucket(`login:${ip}`, LIMITS.login.limit, LIMITS.login.windowMs);
  if (!bucket.ok) {
    return {
      ok: false,
      message: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    // Deliberately identical for a wrong password and an unknown account —
    // distinguishing them is an account-enumeration oracle.
    return { ok: false, message: "Those credentials did not work." };
  }

  // Authenticating is not the same as being authorised. Without a staff
  // profile row, sign the session straight back out.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = (profile as { role?: string } | null)?.role;

  if (!role || !["admin", "agent"].includes(role)) {
    await supabase.auth.signOut();
    return {
      ok: false,
      message: "This account does not have access to the studio.",
    };
  }

  redirect(parsed.data.next ?? "/studio");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/studio/login");
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROPERTIES
   ═══════════════════════════════════════════════════════════════════════════ */

export async function upsertProperty(formData: FormData): Promise<AdminResult> {
  if (isDemoMode()) return DEMO_READONLY;

  const { supabase, profile } = await assertStaff();

  const raw = Object.fromEntries(formData) as Record<string, string>;

  // Normalise the form's wire format into the schema's shape.
  const candidate = {
    ...raw,
    id: raw.id || undefined,
    slug: raw.slug || slugify(raw.title ?? ""),
    priceOnRequest: raw.priceOnRequest === "on" || raw.priceOnRequest === "true",
    isNegotiable: raw.isNegotiable === "on" || raw.isNegotiable === "true",
    reraVerified: raw.reraVerified === "on" || raw.reraVerified === "true",
    isFeatured: raw.isFeatured === "on" || raw.isFeatured === "true",
    isExclusive: raw.isExclusive === "on" || raw.isExclusive === "true",
    highlights: raw.highlights
      ? raw.highlights.split("\n").map((s) => s.trim()).filter(Boolean)
      : [],
    amenities: formData.getAll("amenities").map(String).filter(Boolean),
    nearby: raw.nearby ? safeJson(raw.nearby) : [],
    // Empty strings must become null, not 0 or "".
    ...emptyToNull(raw, [
      "projectId",
      "builderId",
      "lat",
      "lng",
      "bhk",
      "bathrooms",
      "balconies",
      "floorNo",
      "totalFloors",
      "facing",
      "furnishing",
      "ageYears",
      "carpetSqft",
      "builtupSqft",
      "superSqft",
      "plotSqft",
      "price",
      "maintenancePsf",
      "bookingAmount",
      "possessionDate",
      "reraId",
      "heroImage",
      "videoUrl",
      "virtualTourUrl",
    ]),
  };

  const parsed = propertyUpsertSchema.safeParse(candidate);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: fieldErrors(parsed.error),
    };
  }

  const v = parsed.data;

  // Map camelCase form fields onto the snake_case columns.
  const row = {
    slug: v.slug,
    title: v.title,
    project_id: v.projectId ?? null,
    builder_id: v.builderId ?? null,
    city: v.city,
    locality_slug: v.localitySlug,
    address: v.address ?? null,
    lat: v.lat ?? null,
    lng: v.lng ?? null,
    category: v.category,
    property_type: v.propertyType,
    transaction: v.transaction,
    status: v.status,
    bhk: v.bhk ?? null,
    bathrooms: v.bathrooms ?? null,
    balconies: v.balconies ?? null,
    floor_no: v.floorNo ?? null,
    total_floors: v.totalFloors ?? null,
    facing: v.facing ?? null,
    furnishing: v.furnishing ?? null,
    age_years: v.ageYears ?? null,
    carpet_sqft: v.carpetSqft ?? null,
    builtup_sqft: v.builtupSqft ?? null,
    super_sqft: v.superSqft ?? null,
    plot_sqft: v.plotSqft ?? null,
    price: v.price ?? null,
    price_on_request: v.priceOnRequest,
    maintenance_psf: v.maintenancePsf ?? null,
    booking_amount: v.bookingAmount ?? null,
    is_negotiable: v.isNegotiable,
    possession: v.possession,
    possession_date: v.possessionDate ?? null,
    rera_id: v.reraId ?? null,
    rera_verified: v.reraVerified,
    description: v.description ?? null,
    highlights: v.highlights,
    amenities: v.amenities,
    nearby: v.nearby,
    hero_image: v.heroImage ?? null,
    video_url: v.videoUrl ?? null,
    virtual_tour_url: v.virtualTourUrl ?? null,
    is_featured: v.isFeatured,
    is_exclusive: v.isExclusive,
    sort_order: v.sortOrder,
    // A new listing going straight to published needs its timestamp set here;
    // the DB trigger only fires on UPDATE.
    ...(v.status === "published" && !v.id ? { published_at: new Date().toISOString() } : {}),
  };

  const query = v.id
    ? supabase.from("properties").update(row).eq("id", v.id).select("id, slug").single()
    : supabase.from("properties").insert(row).select("id, slug").single();

  const { data, error } = await query;

  if (error) {
    console.error("[upsertProperty]", error.message);

    // Translate the two constraint violations an editor can actually cause.
    if (error.code === "23505" || error.message.includes("duplicate key")) {
      return {
        ok: false,
        message: "That URL slug is already taken.",
        errors: { slug: "Another listing already uses this slug" },
      };
    }
    if (error.code === "42501") {
      return { ok: false, message: "Your account is not permitted to make this change." };
    }
    return { ok: false, message: "Could not save. Please check the fields and try again." };
  }

  const saved = data as { id: string; slug: string };

  await audit(profile, v.id ? "property.update" : "property.create", "properties", saved.id, {
    slug: saved.slug,
    status: v.status,
  });

  // Bust every surface this listing appears on.
  revalidatePath("/");
  revalidatePath(`/property/${saved.slug}`);
  revalidatePath(`/${v.city}/${v.localitySlug}`);
  revalidatePath(`/${v.city}`);
  revalidatePath("/map");
  revalidatePath("/studio/listings");

  return { ok: true, message: v.id ? "Listing updated." : "Listing created.", id: saved.id };
}

export async function setPropertyStatus(
  id: string,
  status: "draft" | "published" | "under_offer" | "sold" | "rented" | "archived",
): Promise<AdminResult> {
  if (isDemoMode()) return DEMO_READONLY;

  const { supabase, profile } = await assertStaff();

  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, message: "Invalid listing id." };
  }

  const { data, error } = await supabase
    .from("properties")
    .update({
      status,
      ...(status === "published" ? { published_at: new Date().toISOString() } : {}),
    })
    .eq("id", id)
    .select("slug, city, locality_slug")
    .single();

  if (error) {
    console.error("[setPropertyStatus]", error.message);
    return { ok: false, message: "Could not update the status." };
  }

  const row = data as { slug: string; city: string; locality_slug: string };

  await audit(profile, `property.${status}`, "properties", id, { slug: row.slug });

  revalidatePath("/");
  revalidatePath(`/property/${row.slug}`);
  revalidatePath(`/${row.city}/${row.locality_slug}`);
  revalidatePath("/studio/listings");

  return { ok: true, message: `Moved to ${status.replace("_", " ")}.` };
}

/**
 * Archive, not delete.
 *
 * A listing has leads, site visits and audit entries pointing at it, and a
 * hard delete loses the commercial history behind a closed sale. Archiving
 * removes it from the public site (RLS only exposes published rows) while
 * keeping the record intact. Permanent deletion is left to the Supabase
 * dashboard, deliberately — it should be awkward.
 */
export async function archiveProperty(id: string): Promise<AdminResult> {
  return setPropertyStatus(id, "archived");
}

/**
 * Permanently delete a listing.
 *
 * The panel previously stopped at archiving, on the reasoning that a hard
 * delete loses commercial history and should therefore be awkward. The
 * requirement is now that an admin can genuinely remove a listing, so this
 * exists — but it keeps the part of that reasoning that was right:
 *
 *   • The caller must type DELETE. Not a browser `confirm()`, which people
 *     dismiss by reflex.
 *   • The entire row is snapshotted into `audit_log.diff` BEFORE the delete,
 *     so a mistake is recoverable by hand from the audit trail.
 *
 * What the database does with the dependants is already correct and is worth
 * stating, because it is the reason this is safe at all:
 *
 *   property_images, floor_plans  → ON DELETE CASCADE  (media dies with it)
 *   leads, site_visits, testimonials → ON DELETE SET NULL
 *
 * So enquiries and booked visits survive with a null property reference. The
 * commercial history is kept; only the listing goes.
 *
 * Archiving remains the right default and stays one click away in the UI —
 * it hides the listing from the public site (RLS only exposes published rows)
 * while keeping the row joinable.
 */
export async function deleteProperty(
  id: string,
  confirmation: string,
): Promise<AdminResult> {
  if (isDemoMode()) return DEMO_READONLY;

  const { supabase, profile } = await assertStaff();

  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, message: "Invalid listing id." };
  }

  if (confirmation.trim().toUpperCase() !== "DELETE") {
    return { ok: false, message: "Type DELETE to confirm." };
  }

  // Snapshot first. If this read fails there is nothing to recover from, so
  // the delete does not proceed.
  const { data: snapshot, error: readError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (readError || !snapshot) {
    console.error("[deleteProperty] snapshot", readError?.message);
    return { ok: false, message: "Could not find that listing." };
  }

  const row = snapshot as { slug: string; city: string; locality_slug: string; title: string };

  await audit(profile, "property.delete", "properties", id, {
    reason: "permanent delete from studio",
    snapshot,
  });

  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) {
    console.error("[deleteProperty]", error.message);
    return { ok: false, message: "Could not delete the listing." };
  }

  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath(`/property/${row.slug}`);
  revalidatePath(`/${row.city}/${row.locality_slug}`);
  revalidatePath("/studio/listings");

  return { ok: true, message: `Deleted "${row.title}". Recoverable from the audit log.` };
}

/**
 * Duplicate a listing.
 *
 * The single most useful shortcut in this panel: most inventory arrives in
 * batches from one project — same tower, same amenities, different floor and
 * carpet. Copying an existing listing and changing three fields is minutes
 * instead of a quarter of an hour.
 *
 * The copy always lands as a DRAFT with "(copy)" appended and a suffixed
 * slug, so it can never accidentally go live as a duplicate of a real page.
 */
export async function duplicateProperty(id: string): Promise<AdminResult> {
  if (isDemoMode()) return DEMO_READONLY;

  const { supabase, profile } = await assertStaff();

  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, message: "Invalid listing id." };
  }

  const { data: source, error: readError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (readError || !source) {
    return { ok: false, message: "Could not read the listing to copy." };
  }

  const row = source as Property;

  // Strip the identity, telemetry and publication fields — a copy starts
  // fresh on all of them.
  const {
    id: _id,
    created_at: _created,
    updated_at: _updated,
    published_at: _published,
    view_count: _views,
    enquiry_count: _enquiries,
    ...rest
  } = row;

  // A short random suffix avoids a collision if the same listing is copied
  // twice in a row.
  const suffix = Math.random().toString(36).slice(2, 6);

  const { data, error } = await supabase
    .from("properties")
    .insert({
      ...rest,
      slug: `${row.slug}-copy-${suffix}`.slice(0, 118),
      title: `${row.title} (copy)`.slice(0, 200),
      status: "draft",
      is_featured: false,
      published_at: null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[duplicateProperty]", error.message);
    return { ok: false, message: "Could not duplicate the listing." };
  }

  const created = data as { id: string };
  await audit(profile, "property.duplicate", "properties", created.id, { from: row.slug });

  revalidatePath("/studio/listings");

  return { ok: true, message: "Duplicated as a draft.", id: created.id };
}

/**
 * Price-only update, for inline editing in the list.
 *
 * Narrow on purpose: opening a 29-field form to correct a typo in a price was
 * the most common friction in the old panel.
 */
export async function updatePropertyPrice(
  id: string,
  price: number | null,
): Promise<AdminResult> {
  if (isDemoMode()) return DEMO_READONLY;

  const { supabase, profile } = await assertStaff();

  const parsed = z
    .object({
      id: z.string().uuid(),
      price: z.number().int().min(0).max(100_000_000_000).nullable(),
    })
    .safeParse({ id, price });

  if (!parsed.success) {
    return { ok: false, message: "That price does not look right." };
  }

  const { data, error } = await supabase
    .from("properties")
    .update({ price: parsed.data.price })
    .eq("id", parsed.data.id)
    .select("slug, city, locality_slug")
    .single();

  if (error) {
    console.error("[updatePropertyPrice]", error.message);
    return { ok: false, message: "Could not save the price." };
  }

  const r = data as { slug: string; city: string; locality_slug: string };

  await audit(profile, "property.price", "properties", id, { price: parsed.data.price });

  revalidatePath("/");
  revalidatePath(`/property/${r.slug}`);
  revalidatePath(`/${r.city}/${r.locality_slug}`);
  revalidatePath("/studio/listings");

  return { ok: true, message: "Price updated." };
}

/* ═══════════════════════════════════════════════════════════════════════════
   LEADS
   ═══════════════════════════════════════════════════════════════════════════ */

export async function updateLead(formData: FormData): Promise<AdminResult> {
  if (isDemoMode()) return DEMO_READONLY;

  const { supabase, profile } = await assertStaff();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = leadUpdateSchema.safeParse({
    id: raw.id,
    status: raw.status || undefined,
    notes: raw.notes || undefined,
    followUpAt: raw.followUpAt || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Could not save those changes.",
      errors: fieldErrors(parsed.error),
    };
  }

  const v = parsed.data;

  const patch: Record<string, unknown> = {};
  if (v.status) {
    patch.status = v.status;
    // Stamp the lifecycle timestamps the pipeline reports read from.
    if (v.status === "contacted") patch.contacted_at = new Date().toISOString();
    if (v.status === "closed_won" || v.status === "closed_lost") {
      patch.closed_at = new Date().toISOString();
    }
  }
  if (v.notes !== undefined) patch.notes = v.notes;
  if (v.followUpAt !== undefined) patch.follow_up_at = v.followUpAt;

  if (Object.keys(patch).length === 0) {
    return { ok: true, message: "Nothing to change." };
  }

  const { error } = await supabase.from("leads").update(patch).eq("id", v.id);

  if (error) {
    console.error("[updateLead]", error.message);
    return { ok: false, message: "Could not save those changes." };
  }

  await audit(profile, "lead.update", "leads", v.id, patch);
  revalidatePath("/studio/leads");

  return { ok: true, message: "Saved." };
}

export async function updateVisitStatus(
  id: string,
  status: "requested" | "confirmed" | "completed" | "no_show" | "cancelled",
): Promise<AdminResult> {
  if (isDemoMode()) return DEMO_READONLY;

  const { supabase, profile } = await assertStaff();

  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, message: "Invalid visit id." };
  }

  const { error } = await supabase.from("site_visits").update({ status }).eq("id", id);

  if (error) {
    console.error("[updateVisitStatus]", error.message);
    return { ok: false, message: "Could not update the visit." };
  }

  await audit(profile, `visit.${status}`, "site_visits", id);
  revalidatePath("/studio/visits");

  return { ok: true, message: `Visit marked ${status.replace("_", " ")}.` };
}

/* ═══════════════════════════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════════════════════════ */

export async function setTestimonialPublished(
  id: string,
  published: boolean,
): Promise<AdminResult> {
  if (isDemoMode()) return DEMO_READONLY;

  const { supabase, profile } = await assertStaff();

  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, message: "Invalid id." };
  }

  const { error } = await supabase
    .from("testimonials")
    .update({ is_published: published })
    .eq("id", id);

  if (error) return { ok: false, message: "Could not update." };

  await audit(profile, published ? "testimonial.publish" : "testimonial.unpublish", "testimonials", id);
  revalidatePath("/");
  revalidatePath("/studio/testimonials");

  return { ok: true, message: published ? "Published." : "Hidden." };
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** HTML form fields arrive as `""`, which must not become 0 or an empty slug. */
function emptyToNull(
  raw: Record<string, string>,
  keys: string[],
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const key of keys) {
    out[key] = raw[key] === "" || raw[key] === undefined ? undefined : raw[key];
  }
  return out;
}

/** The `nearby` field is edited as JSON; never let a parse error 500. */
function safeJson(input: string): unknown[] {
  try {
    const parsed: unknown = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
