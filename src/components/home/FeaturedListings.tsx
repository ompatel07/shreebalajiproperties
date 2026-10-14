import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { RevealGroup } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/home/SectionHeader";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ButtonLink } from "@/components/ui/Button";
import { RAIL, RAIL_ITEM, RAIL_TO_GRID, RAIL_TO_WRAP } from "@/lib/rail";
import { cn } from "@/lib/utils";
import type { PropertyCard as PropertyCardType } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FEATURED HOMES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The section a buyer actually came for, so it is laid out like a results
 * page rather than a magazine spread:
 *
 *   heading → budget filter → results → "see all"
 *
 * ── What changed and why ────────────────────────────────────────────────
 * • The heading read "The projects we are marketing this month", with body
 *   copy about "lead generation and enquiry management". That was the builder
 *   pitch left behind on a buyer section — and it sat directly above a second
 *   section titled "Projects we are marketing now", which is the clearest
 *   case of the repetition the client called out.
 * • Budget chips moved ABOVE the cards. They filter this content, and a
 *   filter goes before its results. Below the cards they read as an
 *   afterthought, and showed counts as zero-padded mono ("03", "—").
 * • Desktop was an asymmetric editorial grid — one large card, two stacked,
 *   then a row of three. It left a visible hole whenever the stacked column
 *   was shorter than the lead card. A uniform grid has no holes and scans
 *   the way every property portal a buyer has used before scans.
 */
export function FeaturedListings({
  listings,
  bandCounts,
  total,
}: {
  listings: PropertyCardType[];
  bandCounts: { slug: string; label: string; count: number }[];
  /** All live listings, for the "see all" link. */
  total: number;
}) {
  return (
    <section id="inventory" className="bg-paper py-14 lg:py-20">
      <div className="shell">
        <SectionHeader
          title="Homes for sale"
          subtitle="Price, RERA number and possession date confirmed with the builder before any of these went live."
          action={{ label: `View all ${total} homes`, href: "/properties" }}
        />

        {/* ── Budget: the filter, before the results ──────────────────── */}
        {/* One swipeable row on a phone rather than three wrapped lines. */}
        <div className={cn(RAIL, RAIL_TO_WRAP, "mt-6 gap-2")}>
          {bandCounts.map((band) => {
            const empty = band.count === 0;
            return (
              <Link
                key={band.slug}
                href={`/ahmedabad/${band.slug}`}
                className={cn(
                  "inline-flex shrink-0 snap-start items-center gap-2 rounded-full border px-4 py-2 text-[0.8125rem] font-medium whitespace-nowrap transition-colors duration-200",
                  empty
                    ? "border-rule text-ink-faint hover:border-rule-strong"
                    : "border-rule-strong bg-paper text-ink hover:border-ink hover:bg-ink hover:text-bone",
                )}
              >
                {band.label}
                {!empty && (
                  <span
                    className="rounded-full bg-sand-deep px-1.5 py-0.5 text-[0.6875rem] font-semibold text-ink-muted"
                    data-numeric
                  >
                    {band.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {listings.length > 0 ? (
          <>
            {/* ── Results ─────────────────────────────────────────────── */}
            {/* Phones: one swipeable row. Tablet and up: a uniform grid. */}
            <RevealGroup
              className={cn(RAIL, RAIL_TO_GRID, "mt-7 pb-1 md:grid-cols-2 md:gap-x-5 md:gap-y-9 md:pb-0 lg:grid-cols-3")}
              stagger={0.06}
            >
              {listings.slice(0, 6).map((p, i) => (
                <div key={p.id} className={cn(RAIL_ITEM, "w-[80vw] max-w-sm")}>
                  <PropertyCard property={p} priority={i < 3} />
                </div>
              ))}
            </RevealGroup>

            <div className="mt-6 md:hidden">
              <Link
                href="/properties"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-[0.9375rem] font-semibold text-bone"
              >
                View all {total} homes
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </>
        ) : (
          <EmptyInventory />
        )}
      </div>
    </section>
  );
}

/**
 * Shown on a fresh install and if every listing goes off-market at once. The
 * client will see this on day one, so it should look deliberate.
 */
function EmptyInventory() {
  return (
    <div className="relative mt-8 overflow-hidden rounded-[var(--radius-lg)] border border-rule bg-paper px-6 py-16 text-center">
      <div className="jaali absolute inset-0" aria-hidden />
      <div className="relative">
        <p className="eyebrow">Nothing live right now</p>
        <h3 className="mx-auto mt-4 max-w-lg font-display text-h3">
          New homes are being checked.
        </h3>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-muted">
          Tell us what you are looking for and we will call you the day
          something fits.
        </p>
        <div className="mt-8">
          <ButtonLink
            href="/contact"
            size="lg"
            icon={<ArrowRight className="size-4" strokeWidth={2} aria-hidden />}
          >
            Register your requirement
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
