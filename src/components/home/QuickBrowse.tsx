import Link from "next/link";
import { ArrowUpRight, Banknote, Home, MapPin, Sparkles } from "lucide-react";

import { Reveal, RevealGroup } from "@/components/motion/Reveal";
import { budgetBands, featuredLocalities, propertyTypes } from "@/config/site";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK BROWSE — search without filling in a form
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The brief was that the site must be very easy to search and understand.
 * The strongest lever for that is removing the form entirely for the common
 * cases: most buyers arrive thinking in one of four ways —
 *
 *   "I have X budget"      → budget bands
 *   "I need N bedrooms"    → BHK
 *   "I want to live in Y"  → area
 *   "I want a villa"       → property type
 *
 * Every chip here is a single tap to a canonical, indexable landing page. No
 * dropdowns, no multi-step, no thinking. The hero search is still there for
 * anyone who wants to combine criteria.
 *
 * It doubles as the site's internal-linking backbone: a crawler following
 * these reaches the whole taxonomy from the homepage.
 */
export function QuickBrowse() {
  const popular = [
    { label: "2 BHK under ₹50 Lakh", href: "/ahmedabad/under-50-lakh" },
    { label: "3 BHK in Shela", href: "/ahmedabad/shela/3-bhk-flats" },
    { label: "Ready to move in", href: "/ahmedabad/ready-to-move" },
    { label: "Villas in Ambli", href: "/ahmedabad/ambli/villas" },
    { label: "New launches", href: "/ahmedabad/new-launch" },
    { label: "Offices on SG Highway", href: "/ahmedabad/sg-highway/offices" },
  ];

  return (
    <section className="border-t border-rule bg-bone py-16 lg:py-20">
      <div className="shell">
        {/* ── Popular searches: the fastest path in ───────────────────── */}
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="eyebrow flex items-center gap-2.5">
              <Sparkles className="size-3.5 text-brass" strokeWidth={2} aria-hidden />
              Popular right now
            </p>
            <Link
              href="/properties"
              className="group inline-flex items-center gap-1.5 font-mono text-[0.5625rem] tracking-[0.12em] text-brass uppercase"
            >
              <span className="link-draw">See everything</span>
              <ArrowUpRight className="size-2.5" strokeWidth={2.2} aria-hidden />
            </Link>
          </div>
        </Reveal>

        <RevealGroup className="mt-5 flex flex-wrap gap-2" stagger={0.04}>
          {popular.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border border-rule-strong bg-paper px-4 py-2.5 text-[0.875rem] text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-bone"
            >
              {item.label}
            </Link>
          ))}
        </RevealGroup>

        {/* ── Four ways in, matching how buyers actually think ─────────── */}
        <div className="mt-14 grid gap-px bg-rule md:grid-cols-2 xl:grid-cols-4">
          <Column
            icon={Banknote}
            title="By budget"
            hint="Know your number?"
            links={budgetBands.map((b) => ({
              label: b.label,
              href: `/ahmedabad/${b.slug}`,
            }))}
          />

          <Column
            icon={Home}
            title="By bedrooms"
            hint="Know your size?"
            links={[1, 2, 3, 4, 5].map((n) => ({
              label: `${n} BHK`,
              href: `/ahmedabad/${n}-bhk-flats`,
            }))}
            extra={{ label: "Penthouses", href: "/ahmedabad/penthouses" }}
          />

          <Column
            icon={MapPin}
            title="By area"
            hint="Know where?"
            links={featuredLocalities.slice(0, 6).map((l) => ({
              label: l.name,
              href: `/${l.city}/${l.slug}`,
            }))}
            extra={{ label: "All areas", href: "/localities" }}
          />

          <Column
            icon={Home}
            title="By type"
            hint="Know what?"
            links={propertyTypes
              .filter((t) => ["flats", "villas", "bungalows", "plots", "offices", "shops"].includes(t.slug))
              .map((t) => ({ label: t.name, href: `/ahmedabad/${t.slug}` }))}
          />
        </div>
      </div>
    </section>
  );
}

function Column({
  icon: Icon,
  title,
  hint,
  links,
  extra,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  hint: string;
  links: { label: string; href: string }[];
  extra?: { label: string; href: string };
}) {
  return (
    <div className="bg-bone p-6 lg:p-7">
      <div className="flex items-center gap-2.5 border-b border-rule pb-3">
        <Icon className="size-4 shrink-0 text-brass" strokeWidth={1.7} aria-hidden />
        <div>
          <p className="font-display text-[1.0625rem] leading-none text-ink">{title}</p>
          <p className="mt-1 font-mono text-[0.5rem] tracking-[0.12em] text-ink-faint uppercase">
            {hint}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex items-center justify-between gap-2 py-0.5 text-[0.9375rem] text-ink-soft transition-colors duration-250 hover:text-brass"
            >
              <span className="link-draw">{link.label}</span>
              <ArrowUpRight
                className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          </li>
        ))}

        {extra && (
          <li className="pt-1">
            <Link
              href={extra.href}
              className="font-mono text-[0.5625rem] tracking-[0.12em] text-brass uppercase hover:underline"
            >
              {extra.label} →
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
