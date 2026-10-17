import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Sofa } from "lucide-react";

import { furnitureOffer, site } from "@/config/site";
import { IN_INTERIORS, unsplash } from "@/lib/imagery";
import { whatsappLink } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OFFER BAND — free furniture with every flat
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Directly under the hero, so the offer is seen before any listing. Gold on
 * purpose: it is the only gold block on the page, which is what makes it
 * read as an offer rather than another section. Copy lives in
 * `config/offers.ts`; switching the offer off removes this band.
 */
export function OfferBand() {
  if (!furnitureOffer.enabled) return null;

  return (
    <section className="bg-bone pb-14 lg:pb-20" aria-labelledby="offer-title">
      <div className="shell">
        <div className="relative isolate grid overflow-hidden rounded-3xl bg-gradient-to-br from-brass-light via-[#e2bd5c] to-[#c99a2e] lg:grid-cols-12">
          <div className="relative z-10 p-6 sm:p-9 lg:col-span-7 lg:p-12">
            <p className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-[0.8125rem] font-bold text-brass-light">
              <Sofa className="size-4" strokeWidth={2.2} aria-hidden />
              Special offer
            </p>

            <h2 id="offer-title" className="mt-4 text-[clamp(1.875rem,3.6vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.035em] text-ink">
              {furnitureOffer.title}
            </h2>

            <p className="mt-3 max-w-lg text-[1rem] leading-relaxed text-ink/80">{furnitureOffer.detail}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/ahmedabad/flats"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[0.9375rem] font-bold text-white transition-colors hover:bg-brass-deep"
              >
                See flats with the offer
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} aria-hidden />
              </Link>
              <a
                href={whatsappLink(site.contact.whatsapp, `Hi ${site.name}, I would like to know more about the free furniture offer on flats.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white/70 px-6 text-[0.9375rem] font-bold text-ink transition-colors hover:bg-white"
              >
                <MessageCircle className="size-4 text-[#1a9e4b]" strokeWidth={2.2} aria-hidden />
                Ask about the offer
              </a>
            </div>

            <p className="mt-5 text-[0.75rem] font-medium text-ink/65">{furnitureOffer.terms}</p>
          </div>

          <div className="relative min-h-[14rem] lg:col-span-5 lg:min-h-0">
            <Image
              src={unsplash(IN_INTERIORS[2], 1000, 76)}
              alt="A furnished living room with a sofa, rug and coffee table"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#c99a2e]/40 to-transparent lg:bg-gradient-to-r lg:from-[#d4ac45] lg:via-transparent" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
