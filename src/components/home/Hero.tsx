import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, ShieldCheck } from "lucide-react";

import { HeroSearch } from "@/components/home/HeroSearch";
import { RevealLines } from "@/components/motion/Reveal";
import { localityBySlug, site } from "@/config/site";
import { formatArea, formatBhk, formatPrice } from "@/lib/format";
import { blurPlaceholder, heroImageFor, unsplash } from "@/lib/imagery";
import type { PropertyCard } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HERO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The thesis of the design in one screen. Four decisions carry it:
 *
 *   1. **Asymmetry.** A narrow rotated index column on the left, the headline
 *      offset from it, and a listing card breaking the bottom-right corner.
 *      Nothing is centred, which is what separates an editorial layout from
 *      a landing-page template.
 *
 *   2. **Extreme type contrast.** A ~7rem display serif against a 0.56rem
 *      monospace label. Mid-size type everywhere is the single clearest
 *      symptom of a theme.
 *
 *   3. **Layering.** The listing card overlaps the photograph and the search
 *      bar sits on the hero's bottom edge rather than below it, so the
 *      sections interlock instead of stacking.
 *
 *   4. **A claim, not a greeting.** "Find your dream home" is what every
 *      competitor says and carries no information. The claim here is about
 *      conflict of interest — the one thing a channel partner who
 *      co-invests can say that a pure broker cannot.
 */
export function Hero({ spotlight }: { spotlight?: PropertyCard }) {
  const locality = spotlight ? localityBySlug.get(spotlight.locality_slug) : null;

  return (
    <section className="relative isolate flex min-h-[94svh] flex-col overflow-hidden lg:min-h-[100svh]">
      {/* ── Backdrop ───────────────────────────────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        <Image
          // LCP element: priority + real `sizes` so the optimiser serves an
          // AVIF at the right width. Most of the gap between a 1.2s and a
          // 3s mobile LCP is right here.
          src={unsplash("1600596542815-ffad4c1539a9", 2400, 76)}
          alt="Contemporary residential architecture in west Ahmedabad at dusk"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="ken-burns photo-warm object-cover object-center"
        />
        {/* Bottom-weighted scrim: type sits on the darkest part of the frame
            while the sky stays open. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" aria-hidden />
        {/* Warm multiply ties the photo to the bone/brass palette so it does
            not read as stock dropped onto the page. */}
        <div className="absolute inset-0 bg-brass-deep/15 mix-blend-multiply" aria-hidden />
      </div>

      {/* ── Rotated index column. Desktop only — it is a margin note. ──── */}
      <div className="pointer-events-none absolute top-0 bottom-0 left-0 hidden w-12 items-center justify-center border-r border-bone/12 lg:flex xl:w-16">
        <div className="flex flex-col items-center gap-6">
          <span className="h-16 w-px bg-brass-light/60" aria-hidden />
          <span className="label-vertical text-bone/55">
            Est. {site.foundedYear} — Ahmedabad &amp; Gandhinagar
          </span>
          <span className="h-16 w-px bg-bone/20" aria-hidden />
        </div>
      </div>

      {/* ── Headline ───────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 items-end pt-24 pb-8 lg:pt-28 lg:pb-12 lg:pl-12 xl:pl-16">
        <div className="shell w-full">
          <div className="grid items-end gap-10 lg:grid-cols-12">
            {/* Type block */}
            <div className="lg:col-span-8 xl:col-span-7">
              <p className="eyebrow mb-5 flex items-center gap-3 text-brass-light lg:mb-7">
                <span className="h-px w-8 bg-brass-light" aria-hidden />
                RERA-registered channel partner
              </p>

              <h1 className="display-mega font-display text-[clamp(2.75rem,10.5vw,7.5rem)] leading-[0.92] text-bone">
                <RevealLines
                  lines={[
                    "We only sell",
                    "what we would",
                    <span key="claim">
                      <em className="display-wonk text-brass-light">buy ourselves.</em>
                    </span>,
                  ]}
                  delay={0.1}
                />
              </h1>

              <p
                data-reveal=""
                style={{ ["--reveal-delay" as string]: "520ms" }}
                className="mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-bone/80 sm:text-lead lg:mt-9"
              >
                We put our own money into the projects we recommend. When we
                show you a home, we have already underwritten it — and we tell
                you where we hold a stake.
              </p>

              {/* Inline trust row — a hairline list, not three blocky tiles. */}
              <ul
                data-reveal=""
                style={{ ["--reveal-delay" as string]: "640ms" }}
                className="mt-8 hidden flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-bone/15 pt-5 sm:flex lg:mt-10"
              >
                {[
                  "Every listing RERA-checked",
                  "Interests disclosed, always",
                  "Written mandate, fixed fee",
                ].map((claim) => (
                  <li
                    key={claim}
                    className="flex items-center gap-2 font-mono text-[0.625rem] tracking-[0.12em] text-bone/65 uppercase"
                  >
                    <ShieldCheck className="size-3 shrink-0 text-brass-light" strokeWidth={2} aria-hidden />
                    {claim}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Spotlight card. Breaks the corner, overlapping the photo
                   and the search bar below it. Desktop only — on a phone it
                   would push the headline off-screen. ──────────────────── */}
            {spotlight && (
              <div
                data-reveal=""
                style={{ ["--reveal-delay" as string]: "760ms", ["--reveal-y" as string]: "2.5rem" }}
                className="hidden lg:col-span-4 lg:block xl:col-span-5 xl:pl-12"
              >
                <Link
                  href={`/property/${spotlight.slug}`}
                  className="group block max-w-sm border border-bone/20 bg-ink/35 p-1.5 backdrop-blur-md transition-colors duration-500 hover:border-brass/60 xl:ml-auto"
                >
                  <div className="relative aspect-[5/3] overflow-hidden">
                    <Image
                      src={heroImageFor(spotlight, 640)}
                      alt={spotlight.title}
                      fill
                      sizes="(max-width: 1280px) 33vw, 28vw"
                      placeholder="blur"
                      blurDataURL={blurPlaceholder()}
                      className="photo-warm object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-brass px-2 py-1 font-mono text-[0.5rem] tracking-[0.14em] text-paper uppercase">
                      This week
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="font-mono text-[0.5rem] tracking-[0.14em] text-bone/55 uppercase">
                      {locality?.name ?? spotlight.locality_slug}
                    </p>
                    <p className="mt-1.5 line-clamp-1 font-display text-[1.0625rem] text-bone">
                      {spotlight.title}
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-3 border-t border-bone/15 pt-3">
                      <div>
                        <p className="font-display text-h4 leading-none text-bone" data-numeric>
                          {spotlight.price_on_request ? "On request" : formatPrice(spotlight.price)}
                        </p>
                        <p className="mt-1.5 font-mono text-[0.5rem] tracking-[0.1em] text-bone/50 uppercase">
                          {[
                            spotlight.bhk ? formatBhk(spotlight.bhk) : null,
                            spotlight.carpet_sqft ? `${formatArea(spotlight.carpet_sqft)} carpet` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>

                      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-bone/30 text-bone transition-all duration-400 group-hover:border-brass group-hover:bg-brass group-hover:text-ink">
                        <ArrowUpRight className="size-3.5" strokeWidth={1.9} aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Search, pinned to the hero's bottom edge so the sections
             interlock rather than stack. ─────────────────────────────────── */}
      <div className="relative lg:pl-12 xl:pl-16">
        <div className="shell pb-6 lg:pb-10">
          <HeroSearch />
        </div>
      </div>

      {/* Scroll cue — desktop only, where there is room for it. */}
      <Link
        href="#inventory"
        aria-label="Scroll to current inventory"
        className="absolute right-6 bottom-28 hidden items-center gap-2 font-mono text-[0.5625rem] tracking-[0.18em] text-bone/50 uppercase transition-colors duration-300 hover:text-bone xl:flex"
      >
        <span className="label-vertical">Scroll</span>
        <ArrowDown className="nudge-down size-3.5" strokeWidth={1.8} aria-hidden />
      </Link>
    </section>
  );
}
