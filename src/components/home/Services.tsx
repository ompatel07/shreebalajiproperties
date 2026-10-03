import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Reveal, RevealGroup } from "@/components/motion/Reveal";
import { FINANCE_DISCLAIMER, comparison, services } from "@/config/site";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVICES + THE COMPARISON
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The six functions from the client's deck, and the table that explains why
 * they are sold as one engagement rather than six line items.
 *
 * The comparison is the sharpest asset in the deck — "campaign focused" vs
 * "project focused", "lead generation" vs "lead + enquiry management" — so it
 * gets real weight here rather than being buried on a services sub-page. It
 * is the clearest answer to the question a builder is actually asking: why
 * you and not the agency I already use?
 */
export function Services() {
  return (
    <section id="services" className="border-t border-rule bg-bone py-20 lg:py-28">
      <div className="shell">
        <Reveal>
          <div className="grid gap-6 border-b border-rule pb-8 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-4">02 — What we run</p>
              <h2 className="display-tight font-display text-h2">
                One partner.{" "}
                <em className="display-wonk text-brass">Six growth functions.</em>
              </h2>
            </div>

            <div className="lg:col-span-5 lg:pl-10">
              <p className="max-w-md text-ink-muted">
                Marketing shouldn&rsquo;t stop at the lead. These run together,
                by the same in-house team, so nothing is handed between an
                agency and a sales desk and lost in between.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ── The six services ─────────────────────────────────────────── */}
        <RevealGroup
          className="mt-10 grid gap-px bg-rule md:grid-cols-2 lg:grid-cols-3"
          stagger={0.06}
        >
          {services.map((service, i) => (
            <article key={service.slug} className="group bg-bone p-6 lg:p-8">
              <p
                className="font-mono text-[0.625rem] text-brass tabular-nums"
                data-numeric
              >
                {String(i + 1).padStart(2, "0")}
              </p>

              <h3 className="mt-3 font-display text-h4 leading-snug text-ink">
                {service.title}
              </h3>

              <p className="mt-2.5 text-[0.9375rem] leading-snug text-ink">
                {service.summary}
              </p>

              <p className="mt-4 text-caption leading-relaxed text-ink-muted">
                {service.detail}
              </p>
            </article>
          ))}
        </RevealGroup>

        {/* ── Not just an agency ───────────────────────────────────────── */}
        <div className="mt-20 lg:mt-24">
          <Reveal>
            <div className="max-w-3xl">
              <p className="eyebrow mb-4">The difference</p>
              <h3 className="display-tight font-display text-h3">
                Not just an agency.{" "}
                <em className="display-wonk text-brass">A project marketing partner.</em>
              </h3>
            </div>
          </Reveal>

          <Reveal className="mt-10">
            <div className="no-bar overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse">
                <caption className="sr-only">
                  Conventional agency approach compared with a project
                  marketing partner
                </caption>

                <thead>
                  <tr className="border-b border-rule-strong text-left">
                    <th
                      scope="col"
                      className="w-1/2 pb-3 font-mono text-[0.5625rem] tracking-[0.14em] font-normal text-ink-faint uppercase"
                    >
                      Conventional approach
                    </th>
                    <th
                      scope="col"
                      className="w-1/2 pb-3 pl-6 font-mono text-[0.5625rem] tracking-[0.14em] font-normal text-brass uppercase"
                    >
                      With us
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-rule">
                  {comparison.map((row) => (
                    <tr key={row.ours} className="group">
                      <td className="py-4 pr-6 align-top text-[0.9375rem] text-ink-faint line-through decoration-rule-strong">
                        {row.conventional}
                      </td>
                      <td className="border-l border-rule py-4 pl-6 align-top font-display text-[1.0625rem] text-ink">
                        {row.ours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>

        {/* ── Finance coordination. Carries the deck's disclaimer. ─────── */}
        <Reveal className="mt-16">
          <aside className="border border-brass/30 bg-brass-pale/40 p-7 lg:p-9">
            <div className="grid gap-7 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7">
                <p className="eyebrow mb-3 text-brass-deep">
                  Because sometimes the sale needs more than a lead
                </p>
                <h3 className="font-display text-h3 leading-snug text-ink">
                  We connect eligible customers with suitable financing
                  channels.
                </h3>
                <p className="mt-4 max-w-prose leading-relaxed text-ink-soft">
                  A buyer who wants the flat and cannot navigate the paperwork
                  is still a lost sale. Working relationships with banks,
                  documentation guidance and loan-process coordination turn an
                  interested customer into one who is actually ready to
                  purchase.
                </p>
              </div>

              <ol className="lg:col-span-5">
                {[
                  "Working relationships with banks",
                  "Documentation guidance",
                  "Loan-process coordination",
                  "Greater purchase readiness",
                ].map((step, i, all) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 border-b border-brass/20 py-3 last:border-b-0"
                  >
                    <span
                      className="mt-0.5 font-mono text-[0.625rem] text-brass tabular-nums"
                      data-numeric
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={
                        i === all.length - 1
                          ? "font-display text-[1.0625rem] text-brass-deep"
                          : "text-[0.9375rem] text-ink-soft"
                      }
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Required wherever financing is mentioned. */}
            <p className="mt-7 border-t border-brass/25 pt-4 text-[0.75rem] text-ink-muted italic">
              {FINANCE_DISCLAIMER}
            </p>
          </aside>
        </Reveal>

        <Reveal className="mt-12">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 font-mono text-micro tracking-[0.14em] text-brass uppercase"
          >
            <span className="link-draw">Talk to us about your project</span>
            <ArrowUpRight
              className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2}
              aria-hidden
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
