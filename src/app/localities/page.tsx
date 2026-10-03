import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { localities, site, zoneLabels, type Zone } from "@/config/site";
import { getLocalityCounts } from "@/lib/queries";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";

export const revalidate = 1800;

export const metadata: Metadata = pageMeta({
  title: `Property by Locality — Ahmedabad & Gandhinagar Rates | ${site.name}`,
  description:
    "Every locality we cover across Ahmedabad and Gandhinagar, with indicative ₹/sq.ft rates and live inventory counts. Thaltej, Shela, Shilaj, South Bopal, GIFT City, Kudasan and more.",
  path: "/localities",
});

/**
 * Locality index.
 *
 * A rate table rather than a tile grid. Someone reaching this page is
 * comparing areas, and the only thing that supports that comparison is the
 * ₹/sq.ft band next to the name — so it is the primary content, sorted
 * expensive-first within each corridor.
 *
 * This is also the hub that links every locality landing page, which is how
 * the crawler keeps finding them.
 */
export default async function LocalitiesPage() {
  const counts = await getLocalityCounts();
  const zones = Object.keys(zoneLabels) as Zone[];

  const trail = [
    { name: "Home", path: "/" },
    { name: "Localities", path: "/localities" },
  ];

  // Cheapest and dearest across the whole set, for the orientation line.
  const sorted = [...localities].sort((a, b) => a.pricePerSqft[0] - b.pricePerSqft[0]);
  const cheapest = sorted[0];
  const dearest = sorted[sorted.length - 1];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />

      <div className="pt-16 lg:pt-[4.75rem]">
        <header className="border-b border-rule bg-sand">
          <div className="shell py-10 lg:py-14">
            <Breadcrumbs trail={trail} />

            <h1 className="display-tight mt-6 max-w-4xl font-display text-h2 text-ink">
              {localities.length} localities, and what each one actually costs.
            </h1>

            <p className="mt-5 max-w-2xl text-lead text-ink-muted">
              Indicative carpet-area rates across Ahmedabad and Gandhinagar,
              grouped into the corridors buyers here think in. Refreshed
              quarterly from what we see transacting, not from portal asking
              prices.
            </p>

            {cheapest && dearest && (
              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-rule-strong/50 pt-6">
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
              </dl>
            )}
          </div>
        </header>

        {/* ══ By corridor ═══════════════════════════════════════════════ */}
        <div className="shell py-12 lg:py-16">
          <div className="space-y-16">
            {zones.map((zone, zi) => {
              const inZone = [...localities]
                .filter((l) => l.zone === zone)
                .sort((a, b) => b.pricePerSqft[1] - a.pricePerSqft[1]);

              if (inZone.length === 0) return null;

              return (
                <Reveal key={zone} delay={zi * 0.04}>
                  <section aria-labelledby={`zone-${zone}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-rule pb-4">
                      <h2 id={`zone-${zone}`} className="font-display text-h3 text-ink">
                        {zoneLabels[zone]}
                      </h2>
                      <span className="font-mono text-[0.5625rem] tracking-[0.1em] text-ink-faint uppercase">
                        {inZone.length} localities
                      </span>
                    </div>

                    <div className="no-bar mt-6 overflow-x-auto">
                      <table className="w-full min-w-[40rem] border-collapse">
                        <caption className="sr-only">
                          {zoneLabels[zone]} localities with indicative rates
                        </caption>
                        <thead>
                          <tr className="border-b border-rule text-left">
                            <th
                              scope="col"
                              className="pb-3 font-mono text-[0.5625rem] tracking-[0.12em] font-normal text-ink-muted uppercase"
                            >
                              Locality
                            </th>
                            <th
                              scope="col"
                              className="pb-3 text-right font-mono text-[0.5625rem] tracking-[0.12em] font-normal text-ink-muted uppercase"
                            >
                              ₹/sq.ft carpet
                            </th>
                            <th
                              scope="col"
                              className="pb-3 text-right font-mono text-[0.5625rem] tracking-[0.12em] font-normal text-ink-muted uppercase"
                            >
                              Live
                            </th>
                            <th scope="col" className="pb-3">
                              <span className="sr-only">Open</span>
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-rule">
                          {inZone.map((l) => {
                            const n = counts[l.slug] ?? 0;

                            return (
                              <tr key={l.slug} className="group hover:bg-sand/60">
                                <th scope="row" className="py-4 pr-4 text-left font-normal">
                                  <Link href={`/${l.city}/${l.slug}`} className="block">
                                    <span className="font-display text-[1.0625rem] text-ink group-hover:text-brass">
                                      {l.name}
                                    </span>
                                    <span className="mt-1 block max-w-xl text-caption leading-relaxed text-ink-muted">
                                      {l.blurb.split(". ")[0]}.
                                    </span>
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
                  </section>
                </Reveal>
              );
            })}
          </div>

          <p className="mt-16 max-w-prose border-t border-rule pt-6 text-caption leading-relaxed text-ink-muted">
            Rates are indicative bands on carpet area, for orientation rather
            than valuation. The achieved price for a specific unit turns on the
            floor, the facing, the age of the building, the amenity load and the
            developer&rsquo;s reputation — which is why a tower at the top of a
            locality&rsquo;s band and one at the bottom can sit on the same
            street. Ask us for the comparables on a specific building and we
            will send them.
          </p>
        </div>
      </div>
    </>
  );
}
