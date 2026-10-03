import Link from "next/link";
import { ArrowUpRight, Eye, Phone, Plus, TrendingUp } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { localityBySlug } from "@/config/site";
import { formatPrice, formatRelative, groupIndian } from "@/lib/format";
import { isDemoMode } from "@/lib/demo-data";
import { demoAdminProperties, demoAdminStats, demoLeads, demoVisits } from "@/lib/demo-studio";
import { createClient } from "@/lib/supabase/server";
import type { AdminStats, Lead, Property, SiteVisit } from "@/types/db";

/**
 * Studio overview.
 *
 * Built around one question: *what needs doing today?* So the page leads with
 * new leads and upcoming visits rather than vanity totals — a dashboard that
 * opens on "1,800 page views" tells the client nothing actionable.
 *
 * Counters come from the `admin_stats()` RPC, which does all ten aggregates in
 * a single round trip and re-checks `is_staff()` server-side.
 */
export default async function StudioDashboard() {
  if (isDemoMode()) {
    return (
      <DashboardView
        stats={demoAdminStats()}
        leads={demoLeads.slice(0, 8)}
        visits={demoVisits.filter((v) => v.status === "requested" || v.status === "confirmed")}
        drafts={demoAdminProperties().filter((p) => p.status === "draft") as never[]}
      />
    );
  }

  const supabase = await createClient();

  const [{ data: statsData }, { data: leadsData }, { data: visitsData }, { data: draftsData }] =
    await Promise.all([
      supabase.rpc("admin_stats"),
      supabase
        .from("leads")
        .select("id, name, phone, email, message, source, status, score, created_at, property_id")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("site_visits")
        .select("id, visitor_name, visitor_phone, slot_date, slot_time, status, property_id")
        .gte("slot_date", new Date().toISOString().slice(0, 10))
        .in("status", ["requested", "confirmed"])
        .order("slot_date", { ascending: true })
        .limit(6),
      supabase
        .from("properties")
        .select("id, slug, title, status, locality_slug, price, updated_at")
        .in("status", ["draft", "under_offer"])
        .order("updated_at", { ascending: false })
        .limit(6),
    ]);

  const stats = (statsData ?? null) as AdminStats | null;
  const leads = (leadsData ?? []) as Pick<
    Lead,
    "id" | "name" | "phone" | "email" | "message" | "source" | "status" | "score" | "created_at" | "property_id"
  >[];
  const visits = (visitsData ?? []) as Pick<
    SiteVisit,
    "id" | "visitor_name" | "visitor_phone" | "slot_date" | "slot_time" | "status" | "property_id"
  >[];
  const drafts = (draftsData ?? []) as Pick<
    Property,
    "id" | "slug" | "title" | "status" | "locality_slug" | "price" | "updated_at"
  >[];

  return <DashboardView stats={stats} leads={leads} visits={visits} drafts={drafts} />;
}

/** Shared presentation, fed from Postgres or from fixtures. */
function DashboardView({
  stats,
  leads,
  visits,
  drafts,
}: {
  stats: AdminStats | null;
  leads: Pick<
    Lead,
    "id" | "name" | "phone" | "email" | "message" | "source" | "status" | "score" | "created_at" | "property_id"
  >[];
  visits: Pick<
    SiteVisit,
    "id" | "visitor_name" | "visitor_phone" | "slot_date" | "slot_time" | "status" | "property_id"
  >[];
  drafts: Pick<
    Property,
    "id" | "slug" | "title" | "status" | "locality_slug" | "price" | "updated_at"
  >[];
}) {
  return (
    <div className="p-5 lg:p-10">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="mt-2 font-display text-h3 text-ink">
            {stats && stats.leads_new > 0
              ? `${stats.leads_new} ${stats.leads_new === 1 ? "lead" : "leads"} waiting on a call`
              : "Nothing outstanding"}
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

      {/* ── Counters ─────────────────────────────────────────────────────── */}
      {stats ? (
        <div className="mt-8 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="New leads"
            value={String(stats.leads_new)}
            note={`${stats.leads_week} this week`}
            tone={stats.leads_new > 0 ? "brass" : "default"}
            href="/studio/leads"
          />
          <Stat
            label="Live listings"
            value={String(stats.properties_live)}
            note={`${stats.properties_draft} in draft`}
            href="/studio/listings"
          />
          <Stat
            label="Upcoming visits"
            value={String(stats.visits_upcoming)}
            note="requested or confirmed"
            href="/studio/visits"
          />
          <Stat
            label="Inventory value"
            value={formatPrice(stats.inventory_value)}
            note={`${groupIndian(stats.views_total)} total views`}
          />
        </div>
      ) : (
        <div className="mt-8 rounded-[2px] border border-alert/30 bg-alert-pale p-6">
          <p className="font-semibold text-micro tracking-[0.12em] text-alert uppercase">
            Could not load counters
          </p>
          <p className="mt-2 text-caption leading-relaxed text-ink-soft">
            The <code className="font-mono">admin_stats()</code> function did not
            respond. Confirm <code className="font-mono">supabase/schema.sql</code>{" "}
            has been run in full against this project, and that your account has
            a <code className="font-mono">profiles</code> row with the role{" "}
            <code className="font-mono">admin</code> or{" "}
            <code className="font-mono">agent</code>.
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        {/* ══ Leads ══════════════════════════════════════════════════════ */}
        <section aria-labelledby="recent-leads">
          <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
            <h2 id="recent-leads" className="eyebrow">
              Latest enquiries
            </h2>
            <Link
              href="/studio/leads"
              className="group inline-flex items-center gap-1.5 font-semibold text-[0.6875rem] tracking-[0.12em] text-brass uppercase"
            >
              <span className="link-draw">All leads</span>
              <ArrowUpRight className="size-2.5" strokeWidth={2.2} aria-hidden />
            </Link>
          </div>

          {leads.length === 0 ? (
            <EmptyPanel
              title="No enquiries yet"
              body="Enquiries from the site land here automatically, scored by how serious they look."
            />
          ) : (
            <ul className="divide-y divide-rule">
              {leads.map((lead) => (
                <li key={lead.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[1.0625rem] font-semibold text-ink">{lead.name}</p>
                        <ScoreChip score={lead.score} />
                        <Badge tone="neutral">{lead.source.replace(/_/g, " ")}</Badge>
                      </div>

                      <a
                        href={`tel:${lead.phone}`}
                        className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-caption text-ink-soft hover:text-brass"
                      >
                        <Phone className="size-3" strokeWidth={1.9} aria-hidden />
                        {lead.phone}
                      </a>

                      {lead.message && (
                        <p className="mt-2 line-clamp-2 max-w-xl text-caption leading-relaxed text-ink-muted">
                          {lead.message}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-[0.6875rem] tracking-[0.1em] text-ink-faint uppercase">
                        {formatRelative(lead.created_at)}
                      </p>
                      <p className="mt-1 font-semibold text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase">
                        {lead.status.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ══ Side rail ══════════════════════════════════════════════════ */}
        <div className="space-y-10">
          {/* Visits */}
          <section aria-labelledby="visits">
            <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
              <h2 id="visits" className="eyebrow">
                Next site visits
              </h2>
              <Link
                href="/studio/visits"
                className="font-semibold text-[0.6875rem] tracking-[0.12em] text-brass uppercase"
              >
                All
              </Link>
            </div>

            {visits.length === 0 ? (
              <EmptyPanel title="Nothing booked" body="Requested visits appear here." />
            ) : (
              <ul className="divide-y divide-rule">
                {visits.map((visit) => (
                  <li key={visit.id} className="flex items-center justify-between gap-3 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-[0.9375rem] font-semibold text-ink">
                        {visit.visitor_name}
                      </p>
                      <a
                        href={`tel:${visit.visitor_phone}`}
                        className="font-mono text-[0.625rem] text-ink-muted hover:text-brass"
                      >
                        {visit.visitor_phone}
                      </a>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-mono text-[0.625rem] text-ink tabular-nums" data-numeric>
                        {new Date(`${visit.slot_date}T00:00:00`).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        {visit.slot_time}
                      </p>
                      <Badge tone={visit.status === "confirmed" ? "verdant" : "neutral"}>
                        {visit.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Drafts — the "finish this" list. */}
          <section aria-labelledby="drafts">
            <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
              <h2 id="drafts" className="eyebrow">
                Needs attention
              </h2>
              <Link
                href="/studio/listings"
                className="font-semibold text-[0.6875rem] tracking-[0.12em] text-brass uppercase"
              >
                All
              </Link>
            </div>

            {drafts.length === 0 ? (
              <EmptyPanel title="All clear" body="No drafts or listings under offer." />
            ) : (
              <ul className="divide-y divide-rule">
                {drafts.map((p) => (
                  <li key={p.id} className="py-3.5">
                    <Link href={`/studio/listings/${p.id}`} className="group block">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[0.9375rem] font-semibold text-ink group-hover:text-brass">
                            {p.title}
                          </p>
                          <p className="font-semibold text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase">
                            {localityBySlug.get(p.locality_slug)?.name ?? p.locality_slug}
                            {p.price ? ` · ${formatPrice(p.price)}` : ""}
                          </p>
                        </div>
                        <Badge tone={p.status === "draft" ? "neutral" : "alert"}>
                          {p.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ── Atoms ──────────────────────────────────────────────────────────────── */

function Stat({
  label,
  value,
  note,
  tone = "default",
  href,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "default" | "brass";
  href?: string;
}) {
  const inner = (
    <div
      className={`h-full p-5 transition-colors ${
        tone === "brass" ? "bg-brass-pale/60" : "bg-paper"
      } ${href ? "hover:bg-sand" : ""}`}
    >
      <p className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-h3 leading-none text-ink" data-numeric>
        {value}
      </p>
      {note && <p className="mt-2 text-[0.75rem] text-ink-muted">{note}</p>}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

/** Visual weight for the lead score, so the list can be worked top-down. */
function ScoreChip({ score }: { score: number }) {
  const tone = score >= 70 ? "brass" : score >= 45 ? "verdant" : "neutral";
  const label = score >= 70 ? "Hot" : score >= 45 ? "Warm" : "Cold";

  return (
    <Badge tone={tone} icon={score >= 70 ? <TrendingUp className="size-3" aria-hidden /> : undefined}>
      {label} · {score}
    </Badge>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="relative overflow-hidden rounded-[2px] border border-rule bg-paper px-5 py-10 text-center">
      <div className="jaali absolute inset-0" aria-hidden />
      <div className="relative">
        <p className="flex items-center justify-center gap-2 text-[1.0625rem] font-semibold text-ink">
          <Eye className="size-4 text-ink-faint" strokeWidth={1.7} aria-hidden />
          {title}
        </p>
        <p className="mx-auto mt-2 max-w-xs text-caption leading-relaxed text-ink-muted">
          {body}
        </p>
      </div>
    </div>
  );
}
