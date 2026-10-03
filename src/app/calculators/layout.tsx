import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/config/site";

/**
 * Shared chrome for the four calculators.
 *
 * The cross-nav is deliberate: someone who lands on "stamp duty" from Google
 * is mid-purchase, and the EMI and affordability tools are the natural next
 * questions. Keeping all four one click apart is what turns a single
 * high-intent visit into a session.
 */

const tools = [
  { href: "/calculators/home-loan-emi", label: "EMI" },
  { href: "/calculators/affordability", label: "Affordability" },
  { href: "/calculators/stamp-duty", label: "Stamp Duty" },
  { href: "/calculators/rental-yield", label: "Rental Yield" },
];

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-16 lg:pt-[4.75rem]">
      {/* Tool switcher. Horizontally scrollable on a phone rather than
          wrapping to two rows. */}
      <div className="border-b border-rule bg-sand">
        <nav aria-label="Calculators" className="shell">
          <ul className="no-bar flex gap-1 overflow-x-auto py-3">
            {tools.map((tool) => (
              <li key={tool.href} className="shrink-0">
                <Link
                  href={tool.href}
                  className="inline-block rounded-[2px] px-4 py-2 font-semibold text-micro tracking-[0.12em] text-ink-muted uppercase transition-colors hover:bg-bone hover:text-ink"
                >
                  {tool.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {children}

      {/* ── Closing CTA, shared by all four ──────────────────────────────── */}
      <section className="border-t border-rule bg-ink py-20">
        <div className="shell max-w-3xl text-center">
          <p className="eyebrow mb-6 text-bone/55">Numbers are the easy part</p>
          <h2 className="display-tight font-display text-h2 text-bone">
            A calculator cannot tell you whether the{" "}
            <em className="display-wonk text-brass-light">builder delivers on time.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lead text-bone/70">
            We keep the delivery record of every developer we deal with — promised
            date against actual, project by project. That is the part no tool
            gives you, and it is usually what decides whether a purchase works
            out.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact" variant="brass" size="lg">
              Talk to an advisor
            </ButtonLink>
            <ButtonLink
              href="/properties"
              variant="ghost"
              size="lg"
              className="text-bone hover:bg-bone/12"
            >
              Browse listings
            </ButtonLink>
          </div>

          <p className="mt-8 font-semibold text-micro tracking-[0.12em] text-bone/40 uppercase">
            {site.office.hours}
          </p>
        </div>
      </section>
    </div>
  );
}
