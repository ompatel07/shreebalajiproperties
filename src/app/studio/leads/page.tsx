import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";

import { LeadRow } from "@/components/admin/LeadRow";
import { Badge } from "@/components/ui/Badge";
import { localityBySlug } from "@/config/site";
import { formatPrice, formatRelative } from "@/lib/format";
import { isDemoMode } from "@/lib/demo-data";
import { demoLeads, demoAdminProperties } from "@/lib/demo-studio";
import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadStatus } from "@/types/db";

/**
 * Lead pipeline.
 *
 * Default ordering is by score, then recency — the client should work the
 * list top-down rather than chronologically. The score is computed by a
 * Postgres trigger (`score_lead`) from signals like a disclosed budget, an
 * enquiry on a specific unit, and a stated timeline; the logic is in
 * `supabase/schema.sql` and is deliberately simple enough to read.
 *
 * Phone numbers are `tel:` and `wa.me` links, so a lead can be worked from a
 * phone with one tap. That is how this will actually be used.
 */

const STATUS_TABS: { value: LeadStatus | "all" | "open"; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "visit_scheduled", label: "Visit set" },
  { value: "negotiating", label: "Negotiating" },
  { value: "closed_won", label: "Won" },
  { value: "closed_lost", label: "Lost" },
  { value: "all", label: "All" },
];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function LeadsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const active = STATUS_TABS.some((t) => t.value === status) ? status! : "open";

  if (isDemoMode()) {
    let items = [...demoLeads];
    if (active === "open") {
      items = items.filter((l) => !l.status.startsWith("closed"));
    } else if (active !== "all") {
      items = items.filter((l) => l.status === active);
    }
    items.sort((a, b) => b.score - a.score);

    const titles = new Map(
      demoAdminProperties().map((p) => [p.id, { title: p.title, slug: p.slug }]),
    );

    return <LeadsView leads={items} count={items.length} active={active} titles={titles} error={null} />;
  }

  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (active === "open") {
    query = query.not("status", "in", "(closed_won,closed_lost)");
  } else if (active !== "all") {
    query = query.eq("status", active);
  }

  const { data, count, error } = await query;
  const leads = (data ?? []) as Lead[];

  // Resolve linked listing titles in one extra query rather than a join, so
  // the main query stays a flat select.
  const propertyIds = [...new Set(leads.map((l) => l.property_id).filter(Boolean))] as string[];
  const titles = new Map<string, { title: string; slug: string }>();

  if (propertyIds.length > 0) {
    const { data: props } = await supabase
      .from("properties")
      .select("id, title, slug")
      .in("id", propertyIds);

    for (const p of (props ?? []) as { id: string; title: string; slug: string }[]) {
      titles.set(p.id, { title: p.title, slug: p.slug });
    }
  }

  return <LeadsView leads={leads} count={count} active={active} titles={titles} error={error ? "load" : null} />;
}

function LeadsView({
  leads,
  count,
  active,
  titles,
  error,
}: {
  leads: Lead[];
  count: number | null;
  active: string;
  titles: Map<string, { title: string; slug: string }>;
  error: string | null;
}) {
  return (
    <div className="p-5 lg:p-10">
      <header className="border-b border-rule pb-6">
        <p className="eyebrow">Pipeline</p>
        <h1 className="mt-2 font-display text-h3 text-ink">
          Leads
          {count !== null && (
            <span className="ml-3 font-semibold text-micro tracking-[0.12em] text-ink-muted uppercase">
              {count} {active === "open" ? "open" : ""}
            </span>
          )}
        </h1>
        <p className="mt-3 max-w-2xl text-caption leading-relaxed text-ink-muted">
          Sorted by score, highest first. Score rises with a disclosed budget, an
          enquiry on a specific listing, a stated timeline and a booked visit —
          so the top of this list is where the money is.
        </p>
      </header>

      {/* ── Status filter ────────────────────────────────────────────────── */}
      <nav aria-label="Filter leads by status" className="no-bar mt-6 -mx-1 overflow-x-auto px-1">
        <ul className="flex gap-1">
          {STATUS_TABS.map((tab) => (
            <li key={tab.value} className="shrink-0">
              <Link
                href={tab.value === "open" ? "/studio/leads" : `/studio/leads?status=${tab.value}`}
                aria-current={active === tab.value ? "page" : undefined}
                className={`inline-block rounded-[2px] px-3.5 py-2 font-semibold text-[0.6875rem] tracking-[0.1em] uppercase transition-colors ${
                  active === tab.value
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

      {/* ── List ─────────────────────────────────────────────────────────── */}
      {error ? (
        <div className="mt-8 rounded-[2px] border border-alert/30 bg-alert-pale p-6">
          <p className="font-semibold text-micro tracking-[0.12em] text-alert uppercase">
            Could not load leads
          </p>
          <p className="mt-2 text-caption text-ink-soft">
            Confirm the schema has been applied and your profile has a staff role.
          </p>
        </div>
      ) : leads.length === 0 ? (
        <div className="relative mt-8 overflow-hidden rounded-[2px] border border-rule bg-paper px-6 py-20 text-center">
          <div className="jaali absolute inset-0" aria-hidden />
          <div className="relative">
            <p className="eyebrow">Nothing in this view</p>
            <h2 className="mt-4 font-display text-h4">
              {active === "open" ? "No open leads" : "No leads with that status"}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-caption leading-relaxed text-ink-muted">
              Every enquiry, site-visit request and sell request from the public
              site lands here automatically.
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {leads.map((lead) => {
            const linked = lead.property_id ? titles.get(lead.property_id) : null;

            return (
              <li
                key={lead.id}
                className="rounded-[2px] border border-rule bg-paper p-5 transition-colors hover:border-rule-strong"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* ── Identity ───────────────────────────────────────── */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-h4 text-ink">{lead.name}</p>
                      <ScoreChip score={lead.score} />
                      <Badge tone="neutral">{lead.source.replace(/_/g, " ")}</Badge>
                      {lead.timeline === "immediate" && <Badge tone="brass">Ready now</Badge>}
                    </div>

                    {/* Contact rail — one tap each. */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center gap-1.5 font-mono text-caption text-ink hover:text-brass"
                      >
                        <Phone className="size-3" strokeWidth={1.9} aria-hidden />
                        {lead.phone}
                      </a>

                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-caption text-verdant hover:underline"
                      >
                        <MessageCircle className="size-3" strokeWidth={1.9} aria-hidden />
                        WhatsApp
                      </a>

                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="inline-flex items-center gap-1.5 font-mono text-caption text-ink-muted hover:text-brass"
                        >
                          <Mail className="size-3" strokeWidth={1.9} aria-hidden />
                          {lead.email}
                        </a>
                      )}
                    </div>

                    {/* What they asked for */}
                    {lead.message && (
                      <p className="mt-3 max-w-2xl rounded-[2px] bg-sand px-3.5 py-3 text-caption leading-relaxed text-ink-soft">
                        {lead.message}
                      </p>
                    )}

                    <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 font-semibold text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase">
                      {lead.budget_max ? (
                        <div className="flex gap-2">
                          <dt className="text-ink-faint">Budget</dt>
                          <dd data-numeric>up to {formatPrice(lead.budget_max)}</dd>
                        </div>
                      ) : null}

                      {lead.preferred_bhk ? (
                        <div className="flex gap-2">
                          <dt className="text-ink-faint">Config</dt>
                          <dd>{lead.preferred_bhk} BHK</dd>
                        </div>
                      ) : null}

                      {lead.preferred_localities.length > 0 && (
                        <div className="flex gap-2">
                          <dt className="text-ink-faint">Areas</dt>
                          <dd>
                            {lead.preferred_localities
                              .map((s) => localityBySlug.get(s)?.name ?? s)
                              .join(", ")}
                          </dd>
                        </div>
                      )}

                      {linked && (
                        <div className="flex gap-2">
                          <dt className="text-ink-faint">Listing</dt>
                          <dd>
                            <Link
                              href={`/property/${linked.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-draw normal-case text-ink"
                            >
                              {linked.title}
                            </Link>
                          </dd>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <dt className="text-ink-faint">Received</dt>
                        <dd>{formatRelative(lead.created_at)}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* ── Triage controls ────────────────────────────────── */}
                  <LeadRow
                    id={lead.id}
                    status={lead.status}
                    notes={lead.notes}
                    followUpAt={lead.follow_up_at}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ScoreChip({ score }: { score: number }) {
  const tone = score >= 70 ? "brass" : score >= 45 ? "verdant" : "neutral";
  const label = score >= 70 ? "Hot" : score >= 45 ? "Warm" : "Cold";
  return (
    <Badge tone={tone}>
      {label} · {score}
    </Badge>
  );
}
