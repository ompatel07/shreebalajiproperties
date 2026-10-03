import Image from "next/image";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";

import { ListingRowActions } from "@/components/admin/ListingRowActions";
import {
  countBySeverity,
  completenessScore,
  draftFromProperty,
  evaluateReadiness,
} from "@/components/admin/listing-readiness";
import { StatusMenu } from "@/components/admin/StatusMenu";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { localityBySlug, propertyTypes } from "@/config/site";
import { formatArea, formatBhk, formatPrice, formatRelative } from "@/lib/format";
import { blurPlaceholder, heroImageFor } from "@/lib/imagery";
import { isDemoMode } from "@/lib/demo-data";
import { demoAdminProperties } from "@/lib/demo-studio";
import { createClient } from "@/lib/supabase/server";
import type { ListingStatus, Property } from "@/types/db";

/**
 * Inventory management.
 *
 * Shows ALL statuses including drafts and archived — unlike the public
 * queries, which RLS restricts to published rows. This page can see them
 * because the signed-in staff session satisfies the `is_staff()` policy.
 *
 * Status changes happen inline. Publishing a flat should be one click from a
 * list, not a trip through an edit form.
 */

const STATUS_TABS: { value: ListingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Live" },
  { value: "draft", label: "Draft" },
  { value: "under_offer", label: "Under offer" },
  { value: "sold", label: "Sold" },
  { value: "archived", label: "Archived" },
];

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function ListingsPage({ searchParams }: Props) {
  const { status, q } = await searchParams;
  const demo = isDemoMode();

  if (demo) {
    const activeStatus = STATUS_TABS.some((t) => t.value === status) ? status : "all";
    let items = demoAdminProperties();
    if (activeStatus && activeStatus !== "all") {
      items = items.filter((p) => p.status === activeStatus);
    }
    if (q) {
      const needle = q.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(needle));
    }
    return (
      <ListingsView
        listings={items as never[]}
        count={items.length}
        activeStatus={activeStatus ?? "all"}
        q={q}
        error={null}
      />
    );
  }

  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(
      `id, slug, title, status, city, locality_slug, property_type, category,
       bhk, bathrooms, carpet_sqft, price, price_on_request, hero_image,
       is_featured, is_exclusive, rera_id, rera_verified, lat, lng,
       possession, possession_date, view_count, enquiry_count, updated_at`,
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .limit(100);

  const activeStatus = STATUS_TABS.some((t) => t.value === status) ? status : "all";
  if (activeStatus && activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  if (q) {
    // `ilike` rather than the tsvector index: an admin searching their own
    // catalogue wants substring matching on a partial title, not stemmed
    // full-text relevance.
    query = query.ilike("title", `%${q.replace(/[%_]/g, "")}%`);
  }

  const { data, count, error } = await query;

  // `Row` is declared below, next to the view that consumes it.
  const listings = (data ?? []) as Row[];

  return (
    <ListingsView
      listings={listings}
      count={count}
      activeStatus={activeStatus ?? "all"}
      q={q}
      error={error ? "load" : null}
    />
  );
}

type Row = Pick<
  Property,
  | "id" | "slug" | "title" | "status" | "city" | "locality_slug" | "property_type"
  | "category" | "bhk" | "bathrooms" | "carpet_sqft" | "price" | "price_on_request"
  | "hero_image" | "is_featured" | "is_exclusive" | "rera_id" | "rera_verified"
  | "lat" | "lng" | "possession" | "possession_date" | "view_count"
  | "enquiry_count" | "updated_at"
>;

function ListingsView({
  listings,
  count,
  activeStatus,
  q,
  error,
}: {
  listings: Row[];
  count: number | null;
  activeStatus: string;
  q?: string;
  error: string | null;
}) {
  return (
    <div className="p-5 lg:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 className="mt-2 font-display text-h3 text-ink">
            Listings
            {count !== null && (
              <span className="ml-3 font-mono text-micro tracking-[0.12em] text-ink-muted uppercase">
                {count} total
              </span>
            )}
          </h1>
        </div>

        <ButtonLink
          href="/studio/listings/new"
          size="sm"
          icon={<Plus className="size-3.5" strokeWidth={2.2} aria-hidden />}
        >
          New listing
        </ButtonLink>
      </header>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <nav aria-label="Filter by status" className="no-bar -mx-1 overflow-x-auto px-1">
          <ul className="flex gap-1">
            {STATUS_TABS.map((tab) => (
              <li key={tab.value} className="shrink-0">
                <Link
                  href={
                    tab.value === "all"
                      ? "/studio/listings"
                      : `/studio/listings?status=${tab.value}`
                  }
                  aria-current={activeStatus === tab.value ? "page" : undefined}
                  className={`inline-block rounded-[2px] px-3.5 py-2 font-mono text-[0.625rem] tracking-[0.1em] uppercase transition-colors ${
                    activeStatus === tab.value
                      ? "bg-ink text-bone"
                      : "border border-rule-strong text-ink-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <form action="/studio/listings" method="get" className="ml-auto">
          {activeStatus !== "all" && (
            <input type="hidden" name="status" value={activeStatus} />
          )}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search titles…"
            aria-label="Search listings by title"
            className="w-48 rounded-[2px] border border-rule-strong bg-paper px-3 py-2 text-caption text-ink focus:border-brass focus:outline-none"
          />
        </form>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      {error ? (
        <div className="mt-8 rounded-[2px] border border-alert/30 bg-alert-pale p-6">
          <p className="font-mono text-micro tracking-[0.12em] text-alert uppercase">
            Could not load listings
          </p>
          <p className="mt-2 text-caption text-ink-soft">
            Check that <code className="font-mono">supabase/schema.sql</code> has
            been applied and that your profile carries a staff role.
          </p>
        </div>
      ) : listings.length === 0 ? (
        <div className="relative mt-8 overflow-hidden rounded-[2px] border border-rule bg-paper px-6 py-20 text-center">
          <div className="jaali absolute inset-0" aria-hidden />
          <div className="relative">
            <p className="eyebrow">Nothing here</p>
            <h2 className="mt-4 font-display text-h4">
              {q ? `No listings match “${q}”` : "No listings in this view"}
            </h2>
            <div className="mt-7">
              <ButtonLink href="/studio/listings/new" size="sm">
                Create the first one
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-bar mt-6 overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse">
            <caption className="sr-only">All listings with status controls</caption>
            <thead>
              <tr className="border-b border-rule-strong text-left">
                {["Property", "Health", "Config", "Price · actions", "Status", "Activity", ""].map((h, i) => (
                  <th
                    key={h || i}
                    scope="col"
                    className="pb-3 font-mono text-[0.5625rem] tracking-[0.12em] font-normal text-ink-muted uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-rule">
              {listings.map((p) => (
                <tr key={p.id} className="group align-middle">
                  {/* Property */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-[2px] bg-sand">
                        <Image
                          src={heroImageFor(p, 120)}
                          alt=""
                          fill
                          sizes="48px"
                          placeholder="blur"
                          blurDataURL={blurPlaceholder()}
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={`/studio/listings/${p.id}`}
                          className="line-clamp-1 font-display text-[0.9375rem] text-ink group-hover:text-brass"
                        >
                          {p.title}
                        </Link>
                        <p className="font-mono text-[0.5rem] tracking-[0.1em] text-ink-muted uppercase">
                          {localityBySlug.get(p.locality_slug)?.name ?? p.locality_slug} ·{" "}
                          {propertyTypes.find((t) => t.slug === p.property_type)?.singular ??
                            p.property_type}
                          {p.is_featured ? " · Featured" : ""}
                          {p.is_exclusive ? " · Exclusive" : ""}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Health — scored with the same rules the editor uses */}
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <HealthCell property={p} />
                  </td>

                  {/* Config */}
                  <td className="py-3 pr-4 font-mono text-[0.625rem] whitespace-nowrap text-ink-soft">
                    {[p.bhk ? formatBhk(p.bhk) : null, p.carpet_sqft ? formatArea(p.carpet_sqft) : null]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>

                  {/* Price — editable inline, plus duplicate */}
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <ListingRowActions
                      id={p.id}
                      slug={p.slug}
                      price={p.price}
                      priceOnRequest={p.price_on_request}
                    />
                  </td>

                  {/* Status — inline control */}
                  <td className="py-3 pr-4">
                    <StatusMenu id={p.id} status={p.status} />
                  </td>

                  {/* Activity */}
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <p className="font-mono text-[0.625rem] text-ink-soft tabular-nums" data-numeric>
                      {p.view_count} views · {p.enquiry_count} enq.
                    </p>
                    <p className="font-mono text-[0.5rem] tracking-[0.1em] text-ink-faint uppercase">
                      {formatRelative(p.updated_at)}
                    </p>
                  </td>

                  {/* Links */}
                  <td className="py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {p.status === "published" && (
                        <Link
                          href={`/property/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${p.title} on the live site`}
                          className="grid size-8 place-items-center rounded-[2px] text-ink-muted hover:bg-sand hover:text-ink"
                        >
                          <Eye className="size-3.5" strokeWidth={1.8} aria-hidden />
                        </Link>
                      )}
                      <Link
                        href={`/studio/listings/${p.id}`}
                        className="rounded-[2px] border border-rule-strong px-3 py-1.5 font-mono text-[0.5625rem] tracking-[0.1em] text-ink uppercase hover:border-ink hover:bg-ink hover:text-bone"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RERA count — a compliance nudge rather than a vanity metric. */}
      {listings.length > 0 && (
        <p className="mt-6 flex flex-wrap items-center gap-3 border-t border-rule pt-5 font-mono text-[0.5625rem] tracking-[0.12em] text-ink-muted uppercase">
          <Badge tone={listings.every((p) => p.rera_verified) ? "verdant" : "neutral"}>
            {listings.filter((p) => p.rera_verified).length} of {listings.length} RERA-verified
          </Badge>
          <span className="text-ink-faint normal-case">
            The homepage claims 100% RERA-verified listings — keep this honest or
            change the claim in{" "}
            <code className="font-mono">src/config/site.ts</code>.
          </span>
        </p>
      )}
    </div>
  );
}

/**
 * Publish readiness.
 *
 * Scored by `evaluateReadiness` — the exact rules the editor enforces — so
 * the list and the form can never disagree about whether something can go
 * live. A red dot means Postgres would reject publishing it.
 *
 * Content checks (description length, amenities, highlights) are filtered
 * out: those columns are not selected for the list view, because up to 8 KB
 * of description across 100 rows is not worth the payload. Judging them from
 * absent data would report a warning on every row.
 */
const CONTENT_ONLY_CHECKS = new Set(["description", "amenities", "highlights", "hero"]);

function HealthCell({
  property,
}: {
  property: Parameters<typeof draftFromProperty>[0];
}) {
  const items = evaluateReadiness(draftFromProperty(property)).filter(
    (i) => !CONTENT_ONLY_CHECKS.has(i.id),
  );
  const { blockers, warnings } = countBySeverity(items);
  const score = completenessScore(items);

  const tone =
    blockers > 0
      ? { dot: "bg-alert", text: "text-alert", label: `${blockers} blocker${blockers === 1 ? "" : "s"}` }
      : warnings > 0
        ? { dot: "bg-brass", text: "text-ink-muted", label: `${warnings} to improve` }
        : { dot: "bg-verdant", text: "text-verdant", label: "Complete" };

  return (
    <span className="flex items-center gap-2" title={items.map((i) => i.label).join(" · ")}>
      <span className={`size-1.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
      <span className="flex flex-col leading-tight">
        <span className={`font-mono text-[0.5625rem] tracking-[0.08em] uppercase ${tone.text}`}>
          {tone.label}
        </span>
        <span className="font-mono text-[0.5rem] text-ink-faint tabular-nums" data-numeric>
          {score}%
        </span>
      </span>
    </span>
  );
}
