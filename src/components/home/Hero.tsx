import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Phone } from "lucide-react";

import { RevealLines } from "@/components/motion/Reveal";
import { funnel, site } from "@/config/site";
import { unsplash } from "@/lib/imagery";
import { telLink } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HERO — builder-facing
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Who this page is for ────────────────────────────────────────────────
 * Shree Krishna Properties sells marketing services to **builders**, not
 * flats to buyers. The previous hero said "We only sell what we would buy
 * ourselves" — a brokerage claim that described a different business
 * entirely. This one makes the client's own argument, from their deck: a
 * project does not need more advertising, it needs movement through the
 * funnel.
 *
 * The buyer-facing listing pages still exist and still matter — they are the
 * surface the enquiry-generation service actually runs on. But a developer
 * landing here should know within one screen that this is a partner for
 * their project, not a portal competing for their buyers.
 *
 * Layout keeps the editorial asymmetry: rotated index column, offset
 * headline, and the four-stage funnel breaking the bottom edge instead of a
 * listing card.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[94svh] flex-col overflow-hidden lg:min-h-[100svh]">
      {/* ── Backdrop ───────────────────────────────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={unsplash("1600596542815-ffad4c1539a9", 2400, 76)}
          alt="Contemporary residential development in Ahmedabad at dusk"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="ken-burns photo-warm object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/25" aria-hidden />
        <div className="absolute inset-0 bg-brass-deep/15 mix-blend-multiply" aria-hidden />
      </div>

      {/* ── Rotated index column ───────────────────────────────────────── */}
      <div className="pointer-events-none absolute top-0 bottom-0 left-0 hidden w-12 items-center justify-center border-r border-bone/12 lg:flex xl:w-16">
        <div className="flex flex-col items-center gap-6">
          <span className="h-16 w-px bg-brass-light/60" aria-hidden />
          <span className="label-vertical text-bone/55">{site.discipline}</span>
          <span className="h-16 w-px bg-bone/20" aria-hidden />
        </div>
      </div>

      {/* ── Headline ───────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 items-end pt-24 pb-10 lg:pt-28 lg:pb-14 lg:pl-12 xl:pl-16">
        <div className="shell w-full">
          <div className="max-w-4xl">
            <p className="eyebrow mb-5 flex items-center gap-3 text-brass-light lg:mb-7">
              <span className="h-px w-8 bg-brass-light" aria-hidden />
              For builders &amp; project owners
            </p>

            <h1 className="display-mega font-display text-[clamp(2.5rem,9vw,6.5rem)] leading-[0.94] text-bone">
              <RevealLines
                lines={[
                  "Your project deserves",
                  "more than marketing.",
                  <span key="claim">
                    It deserves{" "}
                    <em className="display-wonk text-brass-light">momentum.</em>
                  </span>,
                ]}
                delay={0.1}
              />
            </h1>

            <p
              data-reveal=""
              style={{ ["--reveal-delay" as string]: "520ms" }}
              className="mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-bone/80 sm:text-lead lg:mt-9"
            >
              A project marketing partner focused on creating demand, managing
              enquiries, and supporting the journey toward sales — with an
              in-house team that handles execution, not just a plan.
            </p>

            <div
              data-reveal=""
              style={{ ["--reveal-delay" as string]: "640ms" }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10"
            >
              <Link
                href="/contact"
                className="group inline-flex h-13 items-center justify-center gap-2.5 bg-brass px-7 font-mono text-[0.75rem] tracking-[0.14em] text-paper uppercase transition-colors duration-300 hover:bg-bone hover:text-ink"
              >
                Discuss your project
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>

              <a
                href={telLink(site.contact.phoneE164)}
                className="inline-flex h-13 items-center justify-center gap-2.5 border border-bone/35 px-7 font-mono text-[0.75rem] tracking-[0.14em] text-bone uppercase transition-all duration-300 hover:border-bone hover:bg-bone hover:text-ink"
              >
                <Phone className="size-4" strokeWidth={1.9} aria-hidden />
                {site.contact.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Funnel strip, breaking the bottom edge ─────────────────────── */}
      <div className="relative border-t border-bone/15 bg-ink/45 backdrop-blur-md lg:pl-12 xl:pl-16">
        <div className="shell">
          <ol className="grid grid-cols-2 divide-bone/10 lg:grid-cols-4 lg:divide-x">
            {funnel.map((stage, i) => (
              <li
                key={stage.label}
                className={[
                  "py-5 lg:px-7 lg:py-6 lg:first:pl-0",
                  i % 2 === 1 ? "border-l border-bone/10 pl-5 lg:border-l lg:pl-7" : "pr-4 lg:pr-0",
                  i > 1 ? "border-t border-bone/10 lg:border-t-0" : "",
                ].join(" ")}
              >
                <p className="flex items-center gap-2.5 font-mono text-[0.5625rem] tracking-[0.16em] text-brass-light uppercase">
                  <span className="tabular-nums" data-numeric>
                    0{i + 1}
                  </span>
                  {stage.label}
                </p>
                <p className="mt-2 text-[0.8125rem] leading-snug text-bone/65">
                  {stage.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <Link
        href="#problem"
        aria-label="Scroll to the next section"
        className="absolute right-6 bottom-44 hidden items-center gap-2 font-mono text-[0.5625rem] tracking-[0.18em] text-bone/50 uppercase transition-colors duration-300 hover:text-bone xl:flex"
      >
        <span className="label-vertical">Scroll</span>
        <ArrowDown className="nudge-down size-3.5" strokeWidth={1.8} aria-hidden />
      </Link>
    </section>
  );
}
