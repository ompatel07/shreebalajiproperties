import type { Metadata } from "next";

import { Portfolio } from "@/components/home/Portfolio";
import { Process } from "@/components/home/Process";
import { Services } from "@/components/home/Services";
import { TheGap } from "@/components/home/TheGap";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { funnel, site } from "@/config/site";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Project Marketing for Builders | ${site.name}`,
  description:
    "Project marketing services for builders and developers in Ahmedabad: positioning, lead generation, enquiry management, site-visit coordination, customer follow-up and finance coordination.",
  path: "/for-builders",
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FOR BUILDERS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The B2B pitch, in full, on its own page.
 *
 * ── Why it is not the homepage ──────────────────────────────────────────
 * The client's deck is their *builder* pitch, and for a while it drove the
 * homepage. That was the wrong call: the website's main job is helping a home
 * buyer find a property and enquire. A developer evaluating a marketing
 * partner is a much smaller, higher-intent audience who will happily follow
 * one clear link — a buyer who lands on a services pitch just leaves.
 *
 * So the homepage is buyer-first and carries a single compact band pointing
 * here, while everything in the deck lives on this page at full strength.
 */
export default function ForBuildersPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "For Builders", path: "/for-builders" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />

      <div className="pt-16 lg:pt-[4.75rem]">
        {/* ══ Masthead ═══════════════════════════════════════════════════ */}
        <header className="border-b border-rule bg-ink">
          <div className="shell py-12 lg:py-20">
            <Breadcrumbs trail={trail} tone="bone" />

            <p className="eyebrow mt-6 flex items-center gap-3 text-brass-light">
              <span className="h-px w-8 bg-brass-light" aria-hidden />
              For builders &amp; project owners
            </p>

            <h1 className="display-tight mt-5 max-w-4xl font-display text-h1 text-bone">
              Your project deserves more than marketing. It deserves{" "}
              <em className="display-wonk text-brass-light">momentum.</em>
            </h1>

            <p className="mt-7 max-w-2xl text-lead text-bone/80">
              A project marketing partner focused on creating demand, managing
              enquiries, and supporting the journey toward sales — with an
              in-house team that handles execution, not just a plan.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contact" variant="brass" size="lg">
                Discuss your project
              </ButtonLink>
              <ButtonLink
                href="/projects"
                variant="ghost"
                size="lg"
                className="text-bone hover:bg-bone/12"
              >
                See what we market
              </ButtonLink>
            </div>

            {/* Funnel strip */}
            <ol className="mt-12 grid grid-cols-2 gap-px border-t border-bone/15 pt-8 lg:grid-cols-4">
              {funnel.map((stage, i) => (
                <li key={stage.label} className="pr-5">
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
        </header>

        {/* The full pitch, reused from the deck. */}
        <TheGap />
        <Services />
        <Process />
        <Portfolio />
      </div>
    </>
  );
}
