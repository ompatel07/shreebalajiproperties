import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import { VisitActions } from "@/components/admin/VisitActions";
import { Badge } from "@/components/ui/Badge";
import { formatRelative } from "@/lib/format";
import { isDemoMode } from "@/lib/demo-data";
import { demoVisits, demoAdminProperties } from "@/lib/demo-studio";
import { createClient } from "@/lib/supabase/server";
import type { SiteVisit } from "@/types/db";

/**
 * Site visits.
 *
 * Split into upcoming and past rather than one long table: the only visits
 * needing action are the ones that have not happened yet, and burying those
 * under a month of completed rows is how a request gets missed.
 */
export default async function VisitsPage() {
  const today = new Date().toISOString().slice(0, 10);

  if (isDemoMode()) {
    const titles = new Map(
      demoAdminProperties().map((p) => [p.id, { title: p.title, slug: p.slug }]),
    );
    return (
      <VisitsView
        upcoming={demoVisits.filter((v) => v.slot_date >= today)}
        past={demoVisits.filter((v) => v.slot_date < today)}
        titles={titles}
      />
    );
  }

  const supabase = await createClient();

  const [{ data: upcomingData }, { data: pastData }] = await Promise.all([
    supabase
      .from("site_visits")
      .select("*")
      .gte("slot_date", today)
      .order("slot_date", { ascending: true })
      .order("slot_time", { ascending: true })
      .limit(100),
    supabase
      .from("site_visits")
      .select("*")
      .lt("slot_date", today)
      .order("slot_date", { ascending: false })
      .limit(40),
  ]);

  const upcoming = (upcomingData ?? []) as SiteVisit[];
  const past = (pastData ?? []) as SiteVisit[];

  // One extra query resolves listing titles for both sets.
  const ids = [
    ...new Set([...upcoming, ...past].map((v) => v.property_id).filter(Boolean)),
  ] as string[];
  const titles = new Map<string, { title: string; slug: string }>();

  if (ids.length > 0) {
    const { data } = await supabase.from("properties").select("id, title, slug").in("id", ids);
    for (const p of (data ?? []) as { id: string; title: string; slug: string }[]) {
      titles.set(p.id, { title: p.title, slug: p.slug });
    }
  }

  return <VisitsView upcoming={upcoming} past={past} titles={titles} />;
}

function VisitsView({
  upcoming,
  past,
  titles,
}: {
  upcoming: SiteVisit[];
  past: SiteVisit[];
  titles: Map<string, { title: string; slug: string }>;
}) {
  return (
    <div className="p-5 lg:p-10">
      <header className="border-b border-rule pb-6">
        <p className="eyebrow">Schedule</p>
        <h1 className="mt-2 font-display text-h3 text-ink">
          Site visits
          <span className="ml-3 font-mono text-micro tracking-[0.12em] text-ink-muted uppercase">
            {upcoming.length} upcoming
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-caption leading-relaxed text-ink-muted">
          Requests arrive unconfirmed on purpose — the public form promises a
          confirmation call before anyone travels. Confirm the slot here, then
          make that call.
        </p>
      </header>

      <section className="mt-8" aria-labelledby="upcoming">
        <h2 id="upcoming" className="eyebrow border-b border-rule pb-3">
          Upcoming
        </h2>

        {upcoming.length === 0 ? (
          <div className="relative mt-5 overflow-hidden rounded-[2px] border border-rule bg-paper px-6 py-14 text-center">
            <div className="jaali absolute inset-0" aria-hidden />
            <p className="relative font-display text-h4">Nothing booked</p>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {upcoming.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                linked={visit.property_id ? titles.get(visit.property_id) : null}
              />
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-12" aria-labelledby="past">
          <h2 id="past" className="eyebrow border-b border-rule pb-3">
            Past
          </h2>
          <ul className="mt-5 space-y-2">
            {past.map((visit) => (
              <li
                key={visit.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-rule bg-bone px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-display text-[0.9375rem] text-ink">
                    {visit.visitor_name}
                  </p>
                  <p className="font-mono text-[0.5625rem] tracking-[0.1em] text-ink-muted uppercase">
                    {visit.slot_date} · {visit.slot_time}
                    {visit.property_id && titles.get(visit.property_id)
                      ? ` · ${titles.get(visit.property_id)!.title}`
                      : ""}
                  </p>
                </div>
                <Badge tone={visit.status === "completed" ? "verdant" : "neutral"}>
                  {visit.status.replace("_", " ")}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function VisitCard({
  visit,
  linked,
}: {
  visit: SiteVisit;
  linked?: { title: string; slug: string } | null;
}) {
  const when = new Date(`${visit.slot_date}T00:00:00`);

  return (
    <li className="rounded-[2px] border border-rule bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-h4 text-ink">{visit.visitor_name}</p>
            <Badge tone={visit.status === "confirmed" ? "verdant" : "brass"}>
              {visit.status}
            </Badge>
            {visit.party_size > 1 && <Badge tone="neutral">{visit.party_size} people</Badge>}
          </div>

          <p className="mt-2 font-display text-[1.0625rem] text-brass" data-numeric>
            {when.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            at {visit.slot_time}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={`tel:${visit.visitor_phone}`}
              className="inline-flex items-center gap-1.5 font-mono text-caption text-ink hover:text-brass"
            >
              <Phone className="size-3" strokeWidth={1.9} aria-hidden />
              {visit.visitor_phone}
            </a>
            <a
              href={`https://wa.me/${visit.visitor_phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-caption text-verdant hover:underline"
            >
              <MessageCircle className="size-3" strokeWidth={1.9} aria-hidden />
              WhatsApp
            </a>
          </div>

          {linked && (
            <p className="mt-3 font-mono text-[0.5625rem] tracking-[0.1em] text-ink-muted uppercase">
              Listing ·{" "}
              <Link
                href={`/property/${linked.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-draw text-ink normal-case"
              >
                {linked.title}
              </Link>
            </p>
          )}

          {visit.notes && (
            <p className="mt-3 max-w-2xl rounded-[2px] bg-sand px-3.5 py-3 text-caption leading-relaxed text-ink-soft">
              {visit.notes}
            </p>
          )}

          <p className="mt-2 font-mono text-[0.5rem] tracking-[0.1em] text-ink-faint uppercase">
            Requested {formatRelative(visit.created_at)}
          </p>
        </div>

        <VisitActions id={visit.id} status={visit.status} />
      </div>
    </li>
  );
}
