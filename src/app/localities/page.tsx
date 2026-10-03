import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  ahmedabadCount,
  gandhinagarCount,
  localities,
  localityCount,
  site,
  zoneLabels,
  type Locality,
  type Zone,
} from "@/config/site";
import { getLocalityCounts } from "@/lib/queries";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";

export const revalidate = 1800;

export const metadata: Metadata = pageMeta({
  title: `Areas We Cover — ${localityCount} Localities Across Ahmedabad & Gandhinagar | ${site.name}`,
  description: `Every area ${site.name} markets projects in: ${ahmedabadCount} across Ahmedabad and ${gandhinagarCount} across Gandhinagar — west, east, north, south, the walled city and GIFT City.`,
  path: "/localities",
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AREA COVERAGE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The client asked to cover "all areas of Ahmedabad". This page is where that
 * coverage is visible, and it is built around one rule: **never print a
 * number we cannot stand behind.**
 *
 * Core areas get a rate band, labelled as an indicative estimate. Every other
 * area gets a real, linkable, indexed page — but no invented ₹/sq.ft. A
 * buyer who checks one fabricated figure and finds it wrong stops believing
 * every other number on the site, and this business is sold on being the one
 * that tells the truth.
 *
 * Counts come from `localities.ts` at render time, so the headline figure can
 * never drift from reality the way a hard-coded "53" did.
 */
export default async function LocalitiesPage() {
  const counts = await getLocalityCounts();
  const zones = Object.keys(zoneLabels) as Zone[];

  const withRates = localities.filter(
    (l): l is Locality & { pricePerSqft: [number, number] } => Boolean(l.pricePerSqft),
  );
  const sorted = [...withRates].sort((a, b) => a.pricePerSqft[0] - b.pricePerSqft[0]);
  const cheapest = sorted[0];
  const dearest = sorted[sorted.length - 1];

  const trail = [
    { name: "Home", path: "/" },
    { name: "Areas", path: "/localities" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />

      <div className="pt-16 lg:pt-[4.75rem]">
        {/* ── Masthead ─────────────────────────────────────────────────── */}
        <header className="border-b border-rule bg-sand">
          <div className="shell py-10 lg:py-14">
            <Breadcrumbs trail={trail} />

            <h1 className="display-tight mt-6 max-w-4xl font-display text-h2 text-ink">
              {localityCount} areas across Ahmedabad &amp; Gandhinagar.
            </h1>

            <p className="mt-5 max-w-2xl text-lead text-ink-muted">
              Wherever a project is, we can market it. {ahmedabadCount} areas
              across Ahmedabad and {gandhinagarCount} across Gandhinagar — the
              western spine, the Bopal belt, the north corridor, the east, the
              walled city and GIFT.
            </p>

            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-rule-strong/50 pt-6">
              <div>
                <dt className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-faint uppercase">
                  Areas covered
                </dt>
                <dd className="mt-1 font-display text-h4 text-ink" data-numeric>
                  {localityCount}
                </dd>
              </div>
              {cheapest && (
                <div>
                  <dt className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-faint uppercase">
                    Entry point
                  </dt>
                  <dd className="mt-1 font-display text-h4 text-ink">
                    {cheapest.name}
                    <span className="ml-2 font-mono text-micro text-ink-muted" data-numeric>
                      ₹{cheapest.pricePerSqft[0].toLocaleString("en-IN")}/sq.ft
                    </span>
                  </dd>
                </div>
              )}
              {dearest && (
                <div>
                  <dt className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-faint uppercase">
                    Top of the market
                  </dt>
                  <dd className="mt-1 font-display text-h4 text-ink">
                    {dearest.name}
                    <span className="ml-2 font-mono text-micro text-ink-muted" data-numeric>
                      ₹{dearest.pricePerSqft[1].toLocaleString("en-IN")}/sq.ft
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </header>

        {/* ── Honesty note. Deliberately near the top, not buried. ─────── */}
        <div className="border-b border-rule bg-brass-pale/40">
          <div className="shell flex items-start gap-3 py-4">
            <Info className="mt-0.5 size-3.5 shrink-0 text-brass-deep" strokeWidth={2.2} aria-hidden />
            <p className="max-w-3xl text-[0.8125rem] leading-relaxed text-brass-deep">
              <strong className="font-medium">On the rates below.</strong> Where
              we show a ₹/sq.ft band it is an <em>indicative estimate</em> for
              orientation, not a valuation. For the areas without one we have
              not published a figure rather than guess at it — ask us and we
              will send the actual comparables for a specific building, which
              is the only number worth acting on.
            </p>
          </div>
        </div>

        {/* ── By corridor ──────────────────────────────────────────────── */}
        <div className="shell py-12 lg:py-16">
          <div className="space-y-16">
            {zones.map((zone, zi) => {
              const inZone = localities.filter((l) => l.zone === zone);
              if (inZone.length === 0) return null;

              const core = [...inZone]
                .filter((l): l is Locality & { pricePerSqft: [number, number] } =>
                  Boolean(l.pricePerSqft),
                )
                .sort((a, b) => b.pricePerSqft[1] - a.pricePerSqft[1]);

              const rest = inZone.filter((l) => !l.pricePerSqft);

              return (
                <Reveal key={zone} delay={zi * 0.04}>
                  <section aria-labelledby={`zone-${zone}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-rule pb-4">
                      <h2 id={`zone-${zone}`} className="font-display text-h3 text-ink">
                        {zoneLabels[zone]}
                      </h2>
                      <span className="font-mono text-[0.5625rem] tracking-[0.1em] text-ink-faint uppercase">
                        {inZone.length} area{inZone.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {/* ── Core: rate table ──────────────────────────────── */}
                    {core.length > 0 && (
                      <div className="no-bar mt-6 overflow-x-auto">
                        <table className="w-full min-w-[40rem] border-collapse">
                          <caption className="sr-only">
                            {zoneLabels[zone]} areas with indicative rates
                          </caption>
                          <thead>
                            <tr className="border-b border-rule text-left">
                              <th scope="col" className="pb-3 font-mono text-[0.5625rem] tracking-[0.12em] font-normal text-ink-muted uppercase">
                                Area
                              </th>
                              <th scope="col" className="pb-3 text-right font-mono text-[0.5625rem] tracking-[0.12em] font-normal text-ink-muted uppercase">
                                Indicative ₹/sq.ft
                              </th>
                              <th scope="col" className="pb-3 text-right font-mono text-[0.5625rem] tracking-[0.12em] font-normal text-ink-muted uppercase">
                                Live
                              </th>
                              <th scope="col" className="pb-3">
                                <span className="sr-only">Open</span>
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-rule">
                            {core.map((l) => {
                              const n = counts[l.slug] ?? 0;

                              return (
                                <tr key={l.slug} className="group hover:bg-sand/60">
                                  <th scope="row" className="py-4 pr-4 text-left font-normal">
                                    <Link href={`/${l.city}/${l.slug}`} className="block">
                                      <span className="font-display text-[1.0625rem] text-ink group-hover:text-brass">
                                        {l.name}
                                      </span>
                                      {l.blurb && (
                                        <span className="mt-1 block max-w-xl text-caption leading-relaxed text-ink-muted">
                                          {l.blurb.split(". ")[0]}.
                                        </span>
                                      )}
                                    </Link>
                                  </th>

                                  <td
                                    className="py-4 pr-4 text-right align-top font-display text-[1.0625rem] whitespace-nowrap text-ink"
                                    data-numeric
                                  >
                                    ₹{l.pricePerSqft[0].toLocaleString("en-IN")} –{" "}
                                    {l.pricePerSqft[1].toLocaleString("en-IN")}
                                  </td>

                                  <td
                                    className="py-4 pr-4 text-right align-top font-mono text-caption whitespace-nowrap text-ink-muted"
                                    data-numeric
                                  >
                                    {n > 0 ? n : "—"}
                                  </td>

                                  <td className="py-4 text-right align-top">
                                    <Link
                                      href={`/${l.city}/${l.slug}`}
                                      aria-label={`Property in ${l.name}`}
                                      className="inline-grid size-8 place-items-center rounded-full border border-rule-strong text-ink-muted transition-all duration-300 group-hover:border-brass group-hover:bg-brass group-hover:text-paper"
                                    >
                                      <ArrowUpRight className="size-3.5" strokeWidth={1.8} aria-hidden />
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ── Covered: linked, indexed, no invented rate ───── */}
                    {rest.length > 0 && (
                      <div className="mt-7">
                        <p className="mb-3.5 font-mono text-[0.5625rem] tracking-[0.14em] text-ink-faint uppercase">
                          Also covered in this corridor
                        </p>

                        <ul className="flex flex-wrap gap-1.5">
                          {rest.map((l) => {
                            const n = counts[l.slug] ?? 0;

                            return (
                              <li key={l.slug}>
                                <Link
                                  href={`/${l.city}/${l.slug}`}
                                  className="group inline-flex items-center gap-2 border border-rule px-3 py-1.5 text-[0.8125rem] text-ink-soft transition-colors duration-250 hover:border-ink hover:bg-ink hover:text-bone"
                                >
                                  {l.name}
                                  {n > 0 && (
                                    <span
                                      className="font-mono text-[0.5625rem] text-brass tabular-nums"
                                      data-numeric
                                    >
                                      {n}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </section>
                </Reveal>
              );
            })}
          </div>

          <p className="mt-16 max-w-prose border-t border-rule pt-6 text-caption leading-relaxed text-ink-muted">
            Marketing a project in an area not listed here? It almost certainly
            is not a problem — this list reflects where we have worked, not a
            boundary. Tell us where the site is and we will tell you honestly
            whether we are the right partner for that micro-market.
          </p>
        </div>
      </div>
    </>
  );
}
