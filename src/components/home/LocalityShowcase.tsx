"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import {
  featuredLocalities,
  localities,
  localityCount,
  zoneLabels,
  type Zone,
} from "@/config/site";
import { EXTERIORS, blurPlaceholder, unsplash } from "@/lib/imagery";
import { cn, hashString } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOCALITIES — hover-swap editorial list
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The SEO engine disguised as editorial content, and it works precisely
 * because it is not disguised very hard.
 *
 * Buyers here do not search "property in Ahmedabad". They search "3 BHK in
 * Shela". Every row is an internal link to a locality landing page carrying a
 * real ₹/sq.ft band and a paragraph that says something true.
 *
 * ── Why a list and not a card grid ──────────────────────────────────────
 * A 3-column card grid is the single most template-looking pattern on the
 * web, and it was what made this page feel generic. A large typographic list
 * with one pinned image that cross-fades on hover does three things a grid
 * cannot: it gives the display serif room to be large, it reads as an index
 * (which is what it is), and it only loads one image at a time.
 *
 * ── Touch ────────────────────────────────────────────────────────────────
 * There is no hover on a phone, so below `lg` this renders as a compact
 * two-column card list instead. The hover mechanic is desktop-only by design
 * rather than by accident.
 */
export function LocalityShowcase({ counts }: { counts: Record<string, number> }) {
  const [active, setActive] = useState(0);
  const zones = Object.keys(zoneLabels) as Zone[];
  const rows = featuredLocalities;

  return (
    <section id="localities" className="relative border-t border-rule bg-bone py-20 lg:py-28">
      <div className="shell">
        {/* ── Heading. Numeral set beside the title rather than an eyebrow
               stacked above it, so this section does not open the same way
               as the one before it. ───────────────────────────────────── */}
        <Reveal>
          <div className="flex items-start gap-6 lg:gap-10">
            <span className="numeral hidden shrink-0 leading-none sm:block" aria-hidden>
              03
            </span>

            <div className="min-w-0 flex-1">
              <p className="eyebrow mb-4">05 — Where we work</p>
              <h2 className="display-tight max-w-3xl font-display text-h2">
                {localityCount} micro-markets.{" "}
                <em className="display-wonk text-brass">One honest read</em> of each.
              </h2>
              <p className="mt-5 max-w-xl text-lead text-ink-muted">
                Ahmedabad is not one market — it is dozens, each with its own
                rate, its own buyer and its own absorption rate. Knowing which
                one a project sits in decides how it should be marketed.
              </p>
            </div>

            <Link
              href="/localities"
              className="group mt-2 hidden shrink-0 items-center gap-2 font-semibold text-micro tracking-[0.14em] text-ink-muted uppercase transition-colors hover:text-brass lg:flex"
            >
              <span className="link-draw">All {localityCount}</span>
              <ArrowUpRight
                className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>

        {/* ══ Desktop: hover-swap list ═══════════════════════════════════ */}
        <div className="mt-14 hidden gap-14 lg:grid lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_28rem]">
          <ul className="swap-host" onMouseLeave={() => setActive(0)}>
            {rows.map((locality, i) => {
              // Featured rows are core tier and carry a band, but the type is
              // optional for the whole set — handle it rather than assert.
              const band = locality.pricePerSqft;
              const n = counts[locality.slug] ?? 0;

              return (
                <li key={locality.slug} className="border-t border-rule last:border-b">
                  <Link
                    href={`/${locality.city}/${locality.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="swap-row group flex items-baseline gap-6 py-6 xl:py-7"
                  >
                    <span
                      className="w-7 shrink-0 font-mono text-[0.625rem] text-ink-faint tabular-nums"
                      data-numeric
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[clamp(1.5rem,2.6vw,2.5rem)] leading-tight tracking-[-0.03em] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                        {locality.name}
                      </span>
                      <span className="mt-1.5 block font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-faint uppercase">
                        {zoneLabels[locality.zone]}
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      <span className="block font-mono text-caption text-ink-soft tabular-nums" data-numeric>
                        {band ? `₹${(band[0] / 1000).toFixed(1)}–${(band[1] / 1000).toFixed(1)}K` : "On request"}
                      </span>
                      <span className="mt-1 block font-semibold text-[0.6875rem] tracking-[0.12em] text-ink-faint uppercase">
                        {n > 0 ? `${n} live` : "we cover this"}
                      </span>
                    </span>

                    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-rule-strong text-ink-faint transition-all duration-400 group-hover:border-brass group-hover:bg-brass group-hover:text-paper">
                      <ArrowUpRight className="size-3.5" strokeWidth={1.8} aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Pinned image stack. All frames mounted, opacity cross-faded —
              so there is no load flicker when the pointer moves. */}
          <div className="sticky top-28 self-start">
            <div className="relative aspect-[4/5] overflow-hidden border border-rule bg-sand">
              {rows.map((locality, i) => (
                <Image
                  key={locality.slug}
                  src={unsplash(
                    EXTERIORS[hashString(locality.slug) % EXTERIORS.length]!,
                    900,
                  )}
                  alt={`Residential architecture in ${locality.name}`}
                  fill
                  sizes="(max-width: 1280px) 22rem, 28rem"
                  placeholder="blur"
                  blurDataURL={blurPlaceholder()}
                  // Only the first is eager; the rest load as the pointer moves.
                  loading={i === 0 ? "eager" : "lazy"}
                  data-active={active === i ? "1" : "0"}
                  className="swap-img photo-warm absolute inset-0 object-cover"
                />
              ))}

              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" aria-hidden />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-semibold text-[0.6875rem] tracking-[0.14em] text-brass-light uppercase">
                  {rows[active]?.name}
                </p>
                <p className="mt-2.5 text-caption leading-relaxed text-bone/80">
                  {(rows[active]?.blurb ?? "").split(". ").slice(0, 2).join(". ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ Mobile: compact cards (no hover to rely on) ════════════════ */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
          {rows.map((locality) => {
            const lo = locality.pricePerSqft?.[0];
            const n = counts[locality.slug] ?? 0;

            return (
              <Link
                key={locality.slug}
                href={`/${locality.city}/${locality.slug}`}
                className="group relative flex min-h-[11rem] flex-col justify-end overflow-hidden border border-rule bg-ink p-4"
              >
                <Image
                  src={unsplash(EXTERIORS[hashString(locality.slug) % EXTERIORS.length]!, 500)}
                  alt=""
                  aria-hidden
                  fill
                  sizes="50vw"
                  placeholder="blur"
                  blurDataURL={blurPlaceholder()}
                  className="photo-warm object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" aria-hidden />

                <div className="relative">
                  <p className="font-display text-[1.125rem] leading-tight text-bone">
                    {locality.name}
                  </p>
                  <p className="mt-1 font-semibold text-[0.6875rem] tracking-[0.12em] text-bone/60 uppercase" data-numeric>
                    {lo ? `₹${(lo / 1000).toFixed(1)}K+ · ` : ""}
                    {n > 0 ? `${n} live` : "We cover this area"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ══ Full index, grouped by corridor ═══════════════════════════ */}
        <div className="mt-16 lg:mt-24">
          <Reveal>
            <p className="eyebrow mb-7 border-b border-rule pb-4">
              Every locality we cover
            </p>
          </Reveal>

          <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-5">
            {zones.map((zone, zi) => (
              <Reveal key={zone} delay={zi * 0.05}>
                <div>
                  <p className="mb-3.5 font-semibold text-[0.6875rem] tracking-[0.14em] text-brass uppercase">
                    {zoneLabels[zone]}
                  </p>
                  <ul className="space-y-1.5">
                    {localities
                      .filter((l) => l.zone === zone)
                      .map((l) => {
                        const n = counts[l.slug] ?? 0;
                        return (
                          <li key={l.slug}>
                            <Link
                              href={`/${l.city}/${l.slug}`}
                              className={cn(
                                "group flex items-baseline justify-between gap-2 py-0.5 text-[0.875rem] transition-colors duration-250",
                                n > 0 ? "text-ink-soft hover:text-brass" : "text-ink-faint hover:text-ink-muted",
                              )}
                            >
                              <span className="link-draw">{l.name}</span>
                              <span
                                className="shrink-0 font-mono text-[0.5625rem] tabular-nums opacity-60"
                                data-numeric
                              >
                                {n > 0 ? String(n).padStart(2, "0") : "—"}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
