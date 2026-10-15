import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Crosshair,
  Inbox,
  Landmark,
  Megaphone,
  PhoneCall,
} from "lucide-react";

import { portfolio, services } from "@/config/site";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FOR BUILDERS — the door to /for-builders
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The other half of the business, kept to one light card. A developer
 * evaluating a marketing partner is a small, high-intent audience who will
 * follow a clear link; a buyer scrolling past a services pitch just leaves.
 *
 * Light, not the full-width black band it used to be: the advisor panel above
 * is already dark, two in a row read as one heavy block, and the client wants
 * the site bright. The services are icon tiles rather than a numbered
 * monospace list, which was the last of the old template formula.
 */
const ICONS: Record<string, typeof Megaphone> = {
  "project-positioning": Crosshair,
  "lead-generation": Megaphone,
  "enquiry-management": Inbox,
  "site-visit-coordination": CalendarCheck,
  "customer-follow-up": PhoneCall,
  "finance-coordination": Landmark,
};

export function ForBuildersBand() {
  return (
    <section className="bg-paper pb-14 lg:pb-20">
      <div className="shell">
        <div className="grid gap-8 rounded-3xl bg-sand p-6 ring-1 ring-rule sm:p-10 lg:grid-cols-12 lg:items-center lg:gap-12 lg:p-12">
          <div className="lg:col-span-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-[0.8125rem] font-semibold text-brass-deep ring-1 ring-rule">
              <Building2 className="size-4" strokeWidth={2} aria-hidden />
              For builders &amp; developers
            </p>

            <h2 className="mt-4 text-[clamp(1.625rem,3vw,2.375rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-ink">
              Launching a project? We sell it for you.
            </h2>

            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
              One in-house team from positioning to possession, so no enquiry is
              lost between an agency and a sales desk.
            </p>

            <Link
              href="/for-builders"
              className="group mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[0.9375rem] font-bold text-white transition-colors hover:bg-brass-deep"
            >
              See what we do for builders
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} aria-hidden />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {services.map((service) => {
                const Icon = ICONS[service.slug] ?? Megaphone;
                return (
                  <li
                    key={service.slug}
                    className="flex items-center gap-3 rounded-2xl bg-paper p-3.5 ring-1 ring-rule"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brass-pale text-brass-deep">
                      <Icon className="size-4" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="text-[0.8125rem] leading-snug font-semibold text-ink">
                      {service.title}
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-5 text-[0.8125rem] leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">Projects we have marketed:</span>{" "}
              {portfolio.map((p) => p.name).join(" · ")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
