import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, FileCheck2, Landmark, MessageCircle, ShieldCheck, UserRound } from "lucide-react";

import { FINANCE_DISCLAIMER, site } from "@/config/site";
import { IN_INTERIORS, unsplash } from "@/lib/imagery";
import { whatsappLink } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY BUY THROUGH US — split media
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * A photograph on one side, reasons on the other: the one split layout on the
 * page, so it does not echo the grids above and below it. Replaces the old
 * four-steps strip, which said the same things as numbered cards.
 *
 * Every reason is a concrete thing that happens, not an adjective.
 */
const REASONS = [
  {
    icon: ShieldCheck,
    title: "Every listing checked",
    body: "Price, RERA number and possession date are confirmed with the builder before a home goes live.",
  },
  {
    icon: UserRound,
    title: "One advisor, start to finish",
    body: "The same person from your first call to the day you get the keys — no handovers, no repeating yourself.",
  },
  {
    icon: CalendarCheck,
    title: "Site visits, arranged",
    body: "We book the visits, confirm them before you travel, and come with you.",
  },
  {
    icon: Landmark,
    title: "Loan and paperwork",
    body: "We coordinate your home loan with the bank and walk you through the documentation.",
  },
];

export function WhyUs() {
  return (
    <section className="bg-bone py-14 lg:py-20">
      <div className="shell grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        {/* ── Photograph ───────────────────────────────────────────────── */}
        <div className="relative lg:col-span-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand lg:aspect-[5/6]">
            <Image
              src={unsplash(IN_INTERIORS[1], 1100, 78)}
              alt="A modern apartment living room opening onto the kitchen"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>

          {/* The one fact that most surprises buyers, pinned to the photo. */}
          <div className="absolute -bottom-6 left-4 right-4 flex items-center gap-4 rounded-2xl bg-paper p-4 shadow-[0_20px_50px_-20px_rgba(18,17,16,0.4)] ring-1 ring-black/5 sm:right-auto sm:left-6 sm:max-w-sm lg:-right-8 lg:left-auto lg:bottom-10">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brass-pale text-[1.25rem] font-extrabold text-brass" data-numeric>
              ₹0
            </span>
            <p className="text-[0.875rem] leading-snug text-ink-soft">
              <span className="font-bold text-ink">No charge to buyers.</span> We are
              paid by the builder when a sale completes.
            </p>
          </div>
        </div>

        {/* ── Reasons ──────────────────────────────────────────────────── */}
        <div className="pt-6 lg:col-span-6 lg:pt-0">
          <h2 className="text-[clamp(1.75rem,3.2vw,2.625rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-ink">
            Buying a home is a big decision. We make it a simpler one.
          </h2>

          <ul className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {REASONS.map((r) => {
              const Icon = r.icon;
              return (
                <li key={r.title}>
                  <span className="grid size-11 place-items-center rounded-xl bg-ink text-brass-light">
                    <Icon className="size-5" strokeWidth={1.9} aria-hidden />
                  </span>
                  <h3 className="mt-3 text-[1.0625rem] font-bold text-ink">{r.title}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-muted">{r.body}</p>
                </li>
              );
            })}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[0.9375rem] font-bold text-white transition-colors hover:bg-brass-deep"
            >
              <FileCheck2 className="size-4" strokeWidth={2.2} aria-hidden />
              Tell us what you need
            </Link>
            <a
              href={whatsappLink(site.contact.whatsapp, `Hi ${site.name}, I am looking for a property in Ahmedabad.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-verdant/40 px-6 py-3.5 text-[0.9375rem] font-bold text-verdant transition-colors hover:bg-verdant hover:text-white"
            >
              <MessageCircle className="size-4" strokeWidth={2.2} aria-hidden />
              WhatsApp us
            </a>
          </div>

          <p className="mt-5 max-w-prose text-[0.75rem] leading-relaxed text-ink-faint">{FINANCE_DISCLAIMER}</p>
        </div>
      </div>
    </section>
  );
}
