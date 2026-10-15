import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { SectionHeader } from "@/components/home/SectionHeader";
import { featuredLocalities, localityCount, zoneLabels } from "@/config/site";
import { AHMEDABAD, IN_CONSTRUCTION, IN_TOWERS, unsplash } from "@/lib/imagery";

/** Thumbnails by position — none repeats a photo used elsewhere on the homepage. */
const AREA_THUMBS = [IN_TOWERS[2], IN_TOWERS[3], IN_TOWERS[5], IN_TOWERS[1], IN_CONSTRUCTION[0], IN_CONSTRUCTION[1]];
import { RAIL, RAIL_ITEM, RAIL_TO_GRID } from "@/lib/rail";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AREAS — banner + cards
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Where in the city is usually the buyer's first real question, so areas get
 * a section of their own — but six of them, not 145. The full list is one
 * tap away at /localities.
 *
 * Each card carries the two things a buyer asks next: what it costs (the
 * indicative ₹/sq.ft band, shown only where one is published — covered-tier
 * areas have none rather than an invented figure) and how much is live.
 */
export function AreaSpotlight({ counts }: { counts: Record<string, number> }) {
  // Busiest first; areas with nothing live still show, since a buyer may
  // want to register interest there.
  const areas = [...featuredLocalities]
    .sort((a, b) => (counts[b.slug] ?? 0) - (counts[a.slug] ?? 0))
    .slice(0, 6);

  const fmt = (n: number) => n.toLocaleString("en-IN");

  return (
    <section className="border-t border-rule bg-paper py-14 lg:py-20">
      <div className="shell">
        <SectionHeader
          title="Popular areas in Ahmedabad"
          subtitle="Indicative rates and live homes in the city's most asked-about neighbourhoods."
          action={{ label: `All ${localityCount} areas`, href: "/localities" }}
        />

        <div className="mt-7 grid gap-4 lg:mt-9 lg:grid-cols-12">
          {/* ── The city, as a banner ──────────────────────────────────── */}
          <Link
            href="/localities"
            className="group relative isolate flex min-h-[15rem] overflow-hidden rounded-2xl bg-ink lg:col-span-5 lg:min-h-0"
          >
            <Image
              src={unsplash(AHMEDABAD.cityAerial, 1100, 76)}
              alt="Aerial view over a city of residential neighbourhoods"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/45 to-black/5" aria-hidden />
            <div className="mt-auto p-6 lg:p-8">
              <p className="inline-flex w-fit rounded-full bg-black/40 px-3 py-1 text-[0.8125rem] font-semibold text-white">Ahmedabad &amp; Gandhinagar</p>
              <p className="mt-2.5 text-[1.5rem] leading-tight font-extrabold tracking-[-0.02em] text-white lg:text-[1.875rem]">
                {localityCount} areas, one team that knows them
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-bold text-white">
                Explore every area
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} aria-hidden />
              </span>
            </div>
          </Link>

          {/* ── Six areas ──────────────────────────────────────────────── */}
          <div className={cn(RAIL, RAIL_TO_GRID, "md:grid-cols-2 md:gap-4 lg:col-span-7 lg:grid-cols-2")}>
            {areas.map((a, i) => {
              const live = counts[a.slug] ?? 0;
              return (
                <Link
                  key={a.slug}
                  href={`/${a.city}/${a.slug}`}
                  className={cn(
                    RAIL_ITEM,
                    "group flex w-[78vw] max-w-xs items-center gap-4 rounded-2xl border border-rule bg-bone p-3 transition-colors hover:border-brass/50 hover:bg-paper",
                  )}
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                    <Image
                      src={unsplash(AREA_THUMBS[i % AREA_THUMBS.length]!, 240, 72)}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[1rem] font-bold text-ink">{a.name}</p>
                    <p className="flex items-center gap-1 truncate text-[0.75rem] text-ink-muted">
                      <MapPin className="size-3 shrink-0" strokeWidth={2.2} aria-hidden />
                      {zoneLabels[a.zone]}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.8125rem]">
                      {a.pricePerSqft && (
                        <span className="font-semibold text-ink-soft" data-numeric>
                          ₹{fmt(a.pricePerSqft[0])}–{fmt(a.pricePerSqft[1])}
                          <span className="font-normal text-ink-faint">/sq.ft</span>
                        </span>
                      )}
                      <span className={cn("font-semibold", live ? "text-verdant" : "text-ink-faint")} data-numeric>
                        {live ? `${live} live` : "Ask us"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
