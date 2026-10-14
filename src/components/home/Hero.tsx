import Link from "next/link";

import { HeroStage, type HeroSlide } from "@/components/home/HeroStage";
import { SearchPanel } from "@/components/home/SearchPanel";
import { localityCount, site } from "@/config/site";
import {
  AHMEDABAD,
  IN_COMMERCIAL,
  IN_HOUSES,
  IN_INTERIORS,
  IN_TOWERS,
  unsplash,
} from "@/lib/imagery";
import { telLink } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HERO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Three layers, top to bottom:
 *
 *   1. The stage — a framed slideshow of real Indian property photography,
 *      one slide per thing buyers come for, under a single fixed headline.
 *   2. The search — tabbed (Buy / New Projects / Commercial / Plots) and
 *      docked over the stage's bottom edge, so it reads as the next step
 *      rather than another section.
 *   3. The numbers — four facts, large, directly under the search.
 *
 * Captions make category claims only. The one slide that names a place —
 * the Atal Bridge — is a photograph of that place.
 */
export function Hero({
  liveCount,
  typeCounts,
}: {
  liveCount: number;
  /** property_type slug → live listings */
  typeCounts: Record<string, number>;
}) {
  const n = (...types: string[]) => types.reduce((sum, t) => sum + (typeCounts[t] ?? 0), 0);

  const slides: HeroSlide[] = [
    {
      src: unsplash(IN_TOWERS[0], 2000, 78),
      label: "Apartments",
      caption: "2, 3 and 4 BHK flats in new and ready towers",
      count: n("flats", "duplex-flats", "penthouses"),
      cta: { label: "View flats", href: "/ahmedabad/flats" },
      position: "50% 30%",
    },
    {
      src: unsplash(IN_HOUSES[0], 2000, 78),
      label: "Villas & bungalows",
      caption: "Independent homes with a garden and room to grow",
      count: n("villas", "bungalows", "weekend-villas"),
      cta: { label: "View villas", href: "/ahmedabad/villas" },
      position: "50% 45%",
    },
    {
      src: unsplash(IN_INTERIORS[0], 2000, 78),
      label: "Ready to move",
      caption: "Finished homes you can move into this month",
      cta: { label: "View ready homes", href: "/ahmedabad/ready-to-move" },
      position: "50% 55%",
    },
    {
      src: unsplash(IN_COMMERCIAL[0], 2000, 78),
      label: "Commercial",
      caption: "Offices, shops and showrooms for your business",
      count: n("offices", "shops", "showrooms", "warehouses"),
      cta: { label: "View commercial", href: "/ahmedabad/commercial-properties" },
      position: "50% 40%",
    },
    {
      src: unsplash(AHMEDABAD.atalBridge, 2000, 78),
      label: "Ahmedabad",
      caption: `${localityCount} areas, from the Sabarmati riverfront to GIFT City`,
      cta: { label: "Explore areas", href: "/localities" },
      position: "50% 60%",
    },
  ];

  const stats = [
    { value: String(liveCount), label: "Verified homes live" },
    { value: String(localityCount), label: "Areas across the city" },
    { value: "6+", label: "Projects marketed" },
    { value: "₹0", label: "Charged to buyers" },
  ];

  return (
    <section className="relative bg-bone pt-[4.5rem] lg:pt-[5.25rem]">
      <div className="mx-auto w-full max-w-[96rem] px-3 sm:px-5 lg:px-6">
        <HeroStage
          slides={slides}
          headline={
            <>
              Find your next home
              <br className="hidden sm:block" /> in{" "}
              <span className="text-brass-light">Ahmedabad</span>
            </>
          }
          subline={
            <>
              {liveCount} verified homes across {localityCount} areas — flats,
              villas, offices and plots. One advisor from first visit to keys.
            </>
          }
          phone={{ href: telLink(site.contact.phoneE164), label: site.contact.phoneDisplay }}
        />
      </div>

      {/* ── Search, docked over the stage's bottom edge ─────────────────── */}
      <div className="shell relative z-20 -mt-14 lg:-mt-16">
        <SearchPanel className="mx-auto max-w-5xl" />

        <div className="mx-auto mt-4 flex max-w-5xl flex-wrap items-center gap-x-2 gap-y-2 px-1">
          <span className="text-[0.8125rem] font-semibold text-ink-muted">Popular:</span>
          {[
            ["2 BHK flats", "/ahmedabad/2-bhk-flats"],
            ["3 BHK flats", "/ahmedabad/3-bhk-flats"],
            ["Under ₹50 Lakh", "/ahmedabad/under-50-lakh"],
            ["Shela", "/ahmedabad/shela"],
            ["Thaltej", "/ahmedabad/thaltej"],
            ["GIFT City", "/gandhinagar/gift-city"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href!}
              className="rounded-full border border-rule-strong bg-paper px-3 py-1.5 text-[0.8125rem] font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── The numbers ─────────────────────────────────────────────────── */}
      <div className="shell pt-10 pb-12 lg:pt-14 lg:pb-16">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-rule ring-1 ring-rule lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse bg-paper px-5 py-6 lg:px-8 lg:py-8">
              <dt className="mt-1.5 text-[0.8125rem] font-medium text-ink-muted lg:text-[0.875rem]">
                {s.label}
              </dt>
              <dd
                className="text-[clamp(1.875rem,3.6vw,2.75rem)] leading-none font-extrabold tracking-[-0.04em] text-ink"
                data-numeric
              >
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
