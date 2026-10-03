import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Reveal, RevealGroup } from "@/components/motion/Reveal";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ButtonLink } from "@/components/ui/Button";
import type { PropertyCard as PropertyCardType } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CURRENT INVENTORY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Layout ──────────────────────────────────────────────────────────────
 * Asymmetric on purpose. One large plate occupying seven of twelve columns,
 * two stacked beside it, then a three-up row beneath. A uniform 3×2 grid of
 * identical cards is what made this page look bought rather than designed —
 * and it also flattens the client's merchandising, because the listing they
 * most want seen gets the same weight as the fifth-best.
 *
 * On a phone it becomes a snap-scrolling rail. Six stacked cards is a lot of
 * thumb travel, and a rail signals "there is more sideways" far better than
 * a tall column does.
 *
 * ── The budget chips ────────────────────────────────────────────────────
 * "Under ₹50 lakh" is how buyers self-segment before they know anything else
 * about a home, and each chip is a canonical landing page. Live counts keep
 * the row honest — a band with nothing in it says so rather than leading to
 * an empty page.
 */
export function FeaturedListings({
  listings,
  bandCounts,
}: {
  listings: PropertyCardType[];
  bandCounts: { slug: string; label: string; count: number }[];
}) {
  const [lead, ...rest] = listings;
  const stacked = rest.slice(0, 2);
  const row = rest.slice(2, 5);

  return (
    <section id="inventory" className="bg-bone py-20 lg:py-28">
      <div className="shell">
        {/* ── Heading. Title left, meta column right — a different opening
               shape from the sections either side of it. ─────────────── */}
        <Reveal>
          <div className="grid gap-6 border-b border-rule pb-8 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-4">06 — Live right now</p>
              <h2 className="display-tight font-display text-h2">
                The projects we are{" "}
                <em className="display-wonk text-brass">marketing this month.</em>
              </h2>
            </div>

            <div className="lg:col-span-5 lg:pl-10">
              <p className="max-w-md text-ink-muted">
                Every enquiry on these pages is answered, logged and followed
                up by our team — this is what lead generation and enquiry
                management actually look like in practice.
              </p>
              <Link
                href="/properties"
                className="group mt-5 inline-flex items-center gap-2 font-semibold text-micro tracking-[0.14em] text-brass uppercase"
              >
                <span className="link-draw">Browse all listings</span>
                <ArrowRight
                  className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </Reveal>

        {listings.length > 0 ? (
          <>
            {/* ══ Desktop: asymmetric editorial grid ═══════════════════ */}
            <div className="mt-10 hidden lg:block">
              <RevealGroup className="grid grid-cols-12 gap-x-6 gap-y-14" stagger={0.1}>
                {lead && (
                  <div className="col-span-7">
                    <PropertyCard property={lead} size="large" priority />
                  </div>
                )}

                {stacked.length > 0 && (
                  <div className="col-span-5 flex flex-col gap-10">
                    {stacked.map((p) => (
                      <PropertyCard key={p.id} property={p} size="compact" priority />
                    ))}
                  </div>
                )}
              </RevealGroup>

              {row.length > 0 && (
                <RevealGroup
                  className="mt-14 grid grid-cols-3 gap-x-6 border-t border-rule pt-14"
                  stagger={0.09}
                >
                  {row.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </RevealGroup>
              )}
            </div>

            {/* ══ Mobile / tablet: snap rail ═══════════════════════════ */}
            <div className="mt-8 lg:hidden">
              {/* Bleeds past the shell so cards run to the screen edge. */}
              <div className="rail rail-bleed pb-2">
                {listings.map((p, i) => (
                  <div key={p.id} className="w-[78vw] max-w-sm sm:w-[46vw]">
                    <PropertyCard property={p} priority={i === 0} />
                  </div>
                ))}
              </div>

              <p className="mt-4 font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-faint uppercase">
                Swipe for more →
              </p>
            </div>
          </>
        ) : (
          <EmptyInventory />
        )}

        {/* ── Budget entry points ──────────────────────────────────────── */}
        <div className="mt-16 border-t border-rule pt-10 lg:mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="eyebrow">Start from your budget</p>
            <Link
              href="/properties"
              className="group inline-flex items-center gap-1.5 font-semibold text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase hover:text-brass"
            >
              <span className="link-draw">Or filter everything</span>
              <ArrowUpRight className="size-2.5" strokeWidth={2.2} aria-hidden />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {bandCounts.map((band) => (
              <Link
                key={band.slug}
                href={`/ahmedabad/${band.slug}`}
                className="group inline-flex items-center gap-2.5 border border-rule px-4 py-2.5 transition-all duration-300 hover:border-ink hover:bg-ink"
              >
                <span className="text-[0.875rem] text-ink transition-colors duration-300 group-hover:text-bone">
                  {band.label}
                </span>
                <span
                  className="font-mono text-[0.5625rem] text-ink-faint tabular-nums transition-colors duration-300 group-hover:text-brass-light"
                  data-numeric
                >
                  {band.count > 0 ? String(band.count).padStart(2, "0") : "—"}
                </span>
              </Link>
            ))}
          </div>
        </div>
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
    <div className="relative mt-10 overflow-hidden border border-rule bg-paper px-6 py-20 text-center">
      <div className="jaali absolute inset-0" aria-hidden />
      <div className="relative">
        <p className="eyebrow">Nothing live right now</p>
        <h3 className="mx-auto mt-4 max-w-lg font-display text-h3">
          Our shelves are between restocks.
        </h3>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-muted">
          We would rather show you nothing than show you something we have not
          checked. Tell us what you are looking for and we will call you the day
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
