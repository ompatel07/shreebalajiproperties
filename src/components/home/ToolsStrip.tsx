import Link from "next/link";
import { ArrowUpRight, Calculator, Map, Scale, TrendingUp, Wallet } from "lucide-react";

import { Reveal, RevealGroup } from "@/components/motion/Reveal";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FREE TOOLS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Strategically the highest-leverage section on the site. Nobody links to a
 * listing page, but people do link to a working EMI calculator — and
 * "stamp duty Gujarat" style queries bring in buyers months before they are
 * ready to transact, by which point we already have the relationship.
 *
 * All four run client-side with no API: the maths is arithmetic, the Gujarat
 * rates are statutory and hard-coded, and the map uses OpenStreetMap tiles.
 * Zero marginal cost, which is the whole point.
 *
 * ── Layout ──────────────────────────────────────────────────────────────
 * A numbered index list rather than icon cards. The tools are a *menu*, and
 * a menu wants to be read in one vertical sweep — which also lets each row
 * carry a real sentence about what the tool does, instead of the four-word
 * label a card forces.
 */

const tools = [
  {
    n: "01",
    href: "/calculators/home-loan-emi",
    icon: Calculator,
    label: "Home Loan EMI",
    body: "Monthly instalment, total interest, and a year-by-year amortisation schedule you can actually read.",
    tag: "Most used",
  },
  {
    n: "02",
    href: "/calculators/affordability",
    icon: Wallet,
    label: "What Can I Afford?",
    body: "Works backwards from your income and existing EMIs to the price a lender will realistically sanction.",
  },
  {
    n: "03",
    href: "/calculators/stamp-duty",
    icon: Scale,
    label: "Stamp Duty & Registration",
    body: "Gujarat rates, including the female-buyer concession worth 1% of the property value.",
    tag: "Gujarat-specific",
  },
  {
    n: "04",
    href: "/calculators/rental-yield",
    icon: TrendingUp,
    label: "Rental Yield & ROI",
    body: "Gross and net yield after maintenance, vacancy and tax — measured against a fixed deposit.",
  },
  {
    n: "05",
    href: "/map",
    icon: Map,
    label: "Map Search",
    body: "Every listing plotted across Ahmedabad and Gandhinagar. Pan, filter, see what a corridor really costs.",
  },
];

export function ToolsStrip() {
  return (
    <section id="tools" className="border-t border-rule bg-paper py-14 lg:py-20">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* ── Sticky heading column ──────────────────────────────────── */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:h-fit lg:self-start">
            <Reveal>
              <p className="eyebrow mb-4">Free, no sign-up</p>
              <h2 className="display-tight font-display text-h2">
                Run the numbers before you{" "}
                <em className="display-wonk text-brass">talk to anyone.</em>
              </h2>
              <p className="mt-5 text-ink-muted">
                Including us. These are the same calculations we run for
                clients — no email gate, no lead form in the way.
              </p>

              <Link
                href="/contact"
                className="group mt-7 inline-flex items-center gap-2 font-semibold text-micro tracking-[0.14em] text-brass uppercase"
              >
                <span className="link-draw">Prefer we ran them for you?</span>
                <ArrowUpRight
                  className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </Reveal>
          </div>

          {/* ── Index list ─────────────────────────────────────────────── */}
          <RevealGroup as="ul" className="lg:col-span-8" stagger={0.07}>
            {tools.map((tool) => {
              const Icon = tool.icon;

              return (
                <li key={tool.href} className="border-t border-rule last:border-b">
                  <Link
                    href={tool.href}
                    className="group flex items-start gap-5 py-6 transition-colors duration-400 sm:gap-7 lg:py-7"
                  >
                    <span
                      className="w-7 shrink-0 pt-1 font-mono text-[0.625rem] text-ink-faint tabular-nums"
                      data-numeric
                    >
                      {tool.n}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="font-display text-h4 leading-tight text-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">
                          {tool.label}
                        </span>
                        {tool.tag && (
                          <span className="bg-brass-pale px-2 py-0.5 font-semibold text-[0.6875rem] tracking-[0.12em] text-brass-deep uppercase">
                            {tool.tag}
                          </span>
                        )}
                      </span>

                      <span className="mt-2 block max-w-xl text-caption leading-relaxed text-ink-muted">
                        {tool.body}
                      </span>
                    </span>

                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-rule-strong text-ink-faint transition-all duration-400 group-hover:border-brass group-hover:bg-brass group-hover:text-paper">
                      <Icon className="size-4" strokeWidth={1.7} aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
