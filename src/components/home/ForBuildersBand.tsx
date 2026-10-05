import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { portfolio, services } from "@/config/site";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FOR BUILDERS — compact band
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The other half of the business, in one screen-width strip rather than four
 * homepage sections.
 *
 * ── Why it is this small ────────────────────────────────────────────────
 * The full builder pitch used to occupy most of the homepage, which buried
 * the thing most visitors came for. A developer evaluating a marketing
 * partner is a small, high-intent audience who will gladly follow a clear
 * link; a home buyer scrolling past a services pitch just leaves. So the
 * whole argument moved to /for-builders and this band is the door to it.
 *
 * It still does real work: it names the six services and the six projects,
 * so a builder who lands on the homepage immediately knows this firm does
 * their side of the market too.
 */
export function ForBuildersBand() {
  return (
    <section className="relative overflow-hidden bg-ink py-14 lg:py-18">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden>
        <div className="jaali size-full" />
      </div>

      <div className="shell relative">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
            {/* ── The pitch ───────────────────────────────────────────── */}
            <div className="lg:col-span-7">
              <p className="eyebrow mb-4 text-brass-light">For builders &amp; developers</p>

              <h2 className="display-tight font-display text-h2 text-bone">
                Marketing a project?{" "}
                <em className="display-wonk text-brass-light">
                  We do that side too.
                </em>
              </h2>

              <p className="mt-5 max-w-xl text-bone/70">
                Positioning, lead generation, enquiry management, site visits,
                follow-up and finance coordination — run by one in-house team,
                so nothing is lost between an agency and a sales desk.
              </p>

              <Link
                href="/for-builders"
                className="group mt-7 inline-flex h-13 items-center gap-2.5 bg-brass px-7 font-semibold text-[0.75rem] tracking-[0.14em] text-paper uppercase transition-colors duration-300 hover:bg-bone hover:text-ink"
              >
                See what we do for builders
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </div>

            {/* ── Proof: the six services and the six projects ─────────── */}
            <div className="lg:col-span-5">
              <ul className="grid grid-cols-2 gap-x-5 gap-y-2.5 border-t border-bone/15 pt-6">
                {services.map((service, i) => (
                  <li
                    key={service.slug}
                    className="flex items-baseline gap-2 text-[0.8125rem] text-bone/75"
                  >
                    <span
                      className="font-mono text-[0.5625rem] text-brass-light tabular-nums"
                      data-numeric
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {service.title}
                  </li>
                ))}
              </ul>

              <p className="mt-6 border-t border-bone/15 pt-4 font-semibold text-[0.6875rem] leading-relaxed tracking-[0.12em] text-bone/45 uppercase">
                Marketed · {portfolio.map((p) => p.name).join(" · ")}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
