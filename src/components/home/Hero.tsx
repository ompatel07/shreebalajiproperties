import Link from "next/link";
import { BadgeIndianRupee, CalendarCheck, MapPinned, ShieldCheck } from "lucide-react";

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
  typeCounts,
}: {
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

  // Promises rather than counts. A raw "16 homes live" undersold the firm
  // to the client. Live counts appear per category on the hero slides.
  const promises = [
    { icon: ShieldCheck, title: "RERA-registered", sub: "Every listing's RERA number checked" },
    { icon: MapPinned, title: `${localityCount} areas covered`, sub: "Ahmedabad and Gandhinagar" },
    { icon: BadgeIndianRupee, title: "₹0 for buyers", sub: "The builder pays us, not you" },
    { icon: CalendarCheck, title: "Site visits arranged", sub: "We book them and come with you" },
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
              Verified flats, villas, offices and plots across {localityCount} areas
              of Ahmedabad and Gandhinagar. One advisor from first visit to keys.
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

      {/* ── Promises ────────────────────────────────────────────────────── */}
      <div className="shell pt-8 pb-12 lg:pt-12 lg:pb-16">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {promises.map(({ icon: Icon, title, sub }) => (
            <li
              key={title}
              className="flex flex-col gap-3 rounded-2xl bg-paper p-4 ring-1 ring-rule sm:flex-row sm:items-center lg:p-5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-brass-light">
                <Icon className="size-5" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.9375rem] leading-tight font-bold text-ink">{title}</span>
                <span className="mt-0.5 block text-[0.8125rem] leading-snug text-ink-muted">{sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
