import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";

import { Reveal, RevealGroup } from "@/components/motion/Reveal";
import { portfolio, teamPillars, whyPillars } from "@/config/site";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PORTFOLIO + WHY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The six developments named in the client's deck. These replaced the
 * "projects we co-invest in" section, which described a different business
 * model entirely and was invented.
 *
 * ⚠️  The names are REAL and client-supplied. Everything else about them —
 *     locality, builder, configuration, year, outcome — is unknown, and this
 *     section deliberately shows nothing it cannot support. Once the client
 *     confirms those details, each becomes a proper case study with a real
 *     result, which is far stronger than a name plate. The `portfolio` array
 *     in `identity.ts` already has a `locality` field waiting for it.
 *
 * Rendered as engraved plates rather than photo cards for exactly that
 * reason: a card implies a photograph and a story we do not yet have, while
 * a plate reads as a credential and is honest about being only a name.
 */
export function Portfolio() {
  return (
    <section id="portfolio" className="relative overflow-hidden bg-ink py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden>
        <div className="jaali size-full" />
      </div>

      <div className="relative">
        <div className="shell">
          <Reveal>
            <div className="grid gap-7 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="eyebrow mb-4 flex items-center gap-2.5 text-brass-light">
                  <Building2 className="size-3.5" strokeWidth={2} aria-hidden />
                  04 — Track record
                </p>
                <h2 className="display-tight font-display text-h2 text-bone">
                  Experience across multiple{" "}
                  <em className="display-wonk text-brass-light">
                    residential developments.
                  </em>
                </h2>
              </div>

              <div className="lg:col-span-4">
                <p className="text-bone/70">
                  Projects marketed with a builder-focused, result-oriented
                  approach — not campaigns run and handed back.
                </p>
              </div>
            </div>
          </Reveal>

          {/* ── The plates ─────────────────────────────────────────────── */}
          <RevealGroup
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3"
            stagger={0.08}
          >
            {portfolio.map((project, i) => (
              <article
                key={project.slug}
                className="group relative border border-bone/15 bg-bone/[0.04] p-7 transition-colors duration-500 hover:border-brass/50 hover:bg-bone/[0.07] lg:p-8"
              >
                <p
                  className="font-mono text-[0.625rem] text-brass-light tabular-nums"
                  data-numeric
                >
                  {String(i + 1).padStart(2, "0")}
                </p>

                <h3 className="mt-4 font-display text-h4 leading-tight text-bone">
                  {project.name}
                </h3>

                <p className="mt-5 border-t border-bone/12 pt-4 font-mono text-[0.5rem] tracking-[0.14em] text-bone/40 uppercase">
                  Residential · Marketed
                </p>
              </article>
            ))}
          </RevealGroup>
        </div>

        {/* ── Why owners choose a partner who executes ─────────────────── */}
        <div className="shell mt-20 lg:mt-24">
          <Reveal>
            <h3 className="display-tight max-w-3xl font-display text-h3 text-bone">
              Why project owners prefer a partner who{" "}
              <em className="display-wonk text-brass-light">understands execution.</em>
            </h3>
          </Reveal>

          <RevealGroup
            className="mt-10 grid gap-px bg-bone/10 sm:grid-cols-2 lg:grid-cols-5"
            stagger={0.06}
          >
            {whyPillars.map((pillar) => (
              <div key={pillar.title} className="bg-ink p-6">
                <p className="font-display text-[1.0625rem] leading-snug text-bone">
                  {pillar.title}
                </p>
                <p className="mt-2.5 text-caption leading-relaxed text-bone/60">
                  {pillar.detail}
                </p>
              </div>
            ))}
          </RevealGroup>
        </div>

        {/* ── The in-house team ───────────────────────────────────────── */}
        <div className="shell mt-16 lg:mt-20">
          <Reveal>
            <div className="border border-bone/15 p-7 lg:p-10">
              <p className="eyebrow mb-3 text-brass-light">The in-house team</p>
              <h3 className="max-w-2xl font-display text-h4 leading-snug text-bone">
                When marketing, enquiries and follow-up move together,
                execution gets faster.
              </h3>

              <dl className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
                {teamPillars.map((pillar) => (
                  <div key={pillar.title} className="border-t border-bone/15 pt-4">
                    <dt className="font-mono text-[0.5625rem] tracking-[0.14em] text-brass-light uppercase">
                      {pillar.title}
                    </dt>
                    <dd className="mt-2.5 text-caption leading-relaxed text-bone/65">
                      {pillar.detail}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-8 border-t border-bone/15 pt-5 font-display text-[1.0625rem] text-bone/80">
                Experience, execution and market understanding under one roof.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="shell mt-10">
          <Link
            href="/about"
            className="group inline-flex items-center gap-2 font-mono text-micro tracking-[0.14em] text-brass-light uppercase"
          >
            <span className="link-draw">How we work</span>
            <ArrowUpRight
              className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2}
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
