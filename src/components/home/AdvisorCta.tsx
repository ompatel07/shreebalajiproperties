import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";

import { site } from "@/config/site";
import { IN_INTERIORS, unsplash } from "@/lib/imagery";
import { telLink, whatsappLink } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TALK TO AN ADVISOR — closing panel
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * A rounded panel inside the page rather than another full-bleed dark band:
 * the builders band and the footer below are both dark, and three in a row
 * would read as one heavy block. Black-and-gold, from the logo.
 *
 * Three ways to reach someone, in the order people in this market use them:
 * WhatsApp, a call, then a written brief.
 */
export function AdvisorCta() {
  const message = `Hi ${site.name}, I am looking for a property in Ahmedabad. Can you help?`;

  return (
    <section className="bg-paper pb-14 lg:pb-20">
      <div className="shell">
        <div className="relative isolate overflow-hidden rounded-3xl bg-ink">
          <Image
            src={unsplash(IN_INTERIORS[5], 1600, 70)}
            alt=""
            fill
            sizes="100vw"
            className="-z-10 object-cover opacity-35"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/40" aria-hidden />

          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-12 lg:items-center lg:p-14">
            <div className="lg:col-span-7">
              <p className="text-[0.875rem] font-semibold text-brass-light">Not sure where to start?</p>
              <h2 className="mt-2 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-white">
                Tell us your budget and where you work. We will send a shortlist.
              </h2>
              <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-white/70">
                One advisor reads your requirement and sends back only the homes
                that genuinely fit — usually the same day.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:col-span-5">
              <a
                href={whatsappLink(site.contact.whatsapp, message)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-full bg-white px-6 py-4 text-[1rem] font-bold text-ink transition-colors hover:bg-brass-pale"
              >
                <MessageCircle className="size-5 text-[#1a9e4b]" strokeWidth={2.2} aria-hidden />
                WhatsApp us
              </a>
              <a
                href={telLink(site.contact.phoneE164)}
                className="flex items-center justify-center gap-2.5 rounded-full px-6 py-4 text-[1rem] font-bold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10"
              >
                <Phone className="size-5 text-brass-light" strokeWidth={2.2} aria-hidden />
                Call {site.contact.phoneDisplay}
              </a>
              <Link
                href="/contact"
                className="group flex items-center justify-center gap-2 px-6 py-2 text-[0.9375rem] font-semibold text-white/75 transition-colors hover:text-white"
              >
                Send a written brief
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
