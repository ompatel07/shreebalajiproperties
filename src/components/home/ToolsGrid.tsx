import Link from "next/link";
import { ArrowUpRight, Calculator, Map, Scale, TrendingUp, Wallet } from "lucide-react";

import { SectionHeader } from "@/components/home/SectionHeader";
import { RAIL, RAIL_ITEM, RAIL_TO_GRID } from "@/lib/rail";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PLAN YOUR PURCHASE — tool cards
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Five free tools as compact cards on a tinted band. Replaces the editorial
 * numbered list, which ran long on a phone and read like a contents page.
 */
const TOOLS = [
  {
    href: "/calculators/home-loan-emi",
    icon: Calculator,
    title: "EMI calculator",
    body: "Monthly instalment and total interest, year by year.",
    tag: "Most used",
  },
  {
    href: "/calculators/affordability",
    icon: Wallet,
    title: "What can I afford?",
    body: "The price a lender will realistically sanction on your income.",
  },
  {
    href: "/calculators/stamp-duty",
    icon: Scale,
    title: "Stamp duty",
    body: "Gujarat rates, including the 1% concession for women buyers.",
    tag: "Gujarat",
  },
  {
    href: "/calculators/rental-yield",
    icon: TrendingUp,
    title: "Rental yield",
    body: "Net return after maintenance, vacancy and tax.",
  },
  {
    href: "/map",
    icon: Map,
    title: "Map search",
    body: "Every listing plotted across the city.",
  },
];

export function ToolsGrid() {
  return (
    <section className="bg-sand py-14 lg:py-20">
      <div className="shell">
        <SectionHeader
          title="Plan your purchase"
          subtitle="Free calculators — no sign-up, no form in the way."
        />

        <div className={cn(RAIL, RAIL_TO_GRID, "mt-7 md:grid-cols-3 md:gap-4 lg:mt-9 lg:grid-cols-5")}>
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  RAIL_ITEM,
                  "group relative flex w-[62vw] max-w-[16rem] flex-col rounded-2xl bg-paper p-5 ring-1 ring-rule transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(18,17,16,0.3)] hover:ring-brass/40",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="grid size-11 place-items-center rounded-xl bg-brass-pale text-brass transition-colors group-hover:bg-brass group-hover:text-white">
                    <Icon className="size-5" strokeWidth={2} aria-hidden />
                  </span>
                  {t.tag && (
                    <span className="rounded-full bg-ink px-2 py-0.5 text-[0.6875rem] font-semibold text-white">
                      {t.tag}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-[1.0625rem] font-bold text-ink">{t.title}</h3>
                <p className="mt-1 flex-1 text-[0.875rem] leading-relaxed text-ink-muted">{t.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[0.875rem] font-bold text-brass">
                  Open
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.4} aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
