import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Phone } from "lucide-react";

import { HeroSearch } from "@/components/home/HeroSearch";
import { RevealLines } from "@/components/motion/Reveal";
import { localityCount, site } from "@/config/site";
import { unsplash } from "@/lib/imagery";
import { telLink } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HERO — buyer-first
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Who this page is for ────────────────────────────────────────────────
 * Home buyers. The site's main job is helping someone find a property and
 * enquire; the builder-facing pitch is a real part of the business but lives
 * at /for-builders, reachable from one clear link below.
 *
 * ── Why the search box is the hero ──────────────────────────────────────
 * Someone arriving here has one question — "what can I get, where, for my
 * budget?" — so the search sits directly under the headline at full width
 * rather than below the fold. Everything else on this screen is secondary to
 * getting them into a result set in one action.
 *
 * The headline is deliberately plain. Buyers scan; clever copy costs
 * comprehension, and the client's brief was that the site must be very easy
 * to understand.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden lg:min-h-[96svh]">
      {/* ── Backdrop ───────────────────────────────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={unsplash("1600596542815-ffad4c1539a9", 2400, 76)}
          alt="Residential buildings in Ahmedabad"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="ken-burns photo-warm object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/30" aria-hidden />
        <div className="absolute inset-0 bg-brass-deep/12 mix-blend-multiply" aria-hidden />
      </div>

      {/* ── Copy ───────────────────────────────────────────────────────── */}
      <div className="shell relative pt-28 pb-6 lg:pt-32 lg:pb-8">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4 flex items-center gap-3 text-brass-light lg:mb-6">
            <span className="h-px w-8 bg-brass-light" aria-hidden />
            Ahmedabad &amp; Gandhinagar
          </p>

          <h1 className="display-tight font-display text-[clamp(2.25rem,7vw,5rem)] leading-[0.98] text-bone">
            <RevealLines
              lines={[
                "Find a home you",
                <span key="claim">
                  actually{" "}
                  <em className="display-wonk text-brass-light">want to live in.</em>
                </span>,
              ]}
              delay={0.1}
            />
          </h1>

          <p
            data-reveal=""
            style={{ ["--reveal-delay" as string]: "480ms" }}
            className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-bone/80 sm:text-lead lg:mt-7"
          >
            Flats, villas, offices and plots across {localityCount} areas. Tell
            us what you are looking for — we will show you what is genuinely
            available, and what it really costs.
          </p>
        </div>
      </div>

      {/* ── Search. The main event, full width, above the fold. ────────── */}
      <div className="shell relative pb-5">
        <div data-reveal="" style={{ ["--reveal-delay" as string]: "600ms" }}>
          <HeroSearch />
        </div>
      </div>

      {/* ── Reassurance strip + the one builder link ───────────────────── */}
      <div className="relative border-t border-bone/15 bg-ink/40 backdrop-blur-md">
        <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              "Every listing checked before it goes up",
              "No charge to buyers",
              "One advisor, start to finish",
            ].map((claim) => (
              <li
                key={claim}
                className="flex items-center gap-2 font-mono text-[0.625rem] tracking-[0.1em] text-bone/70 uppercase"
              >
                <BadgeCheck className="size-3 shrink-0 text-brass-light" strokeWidth={2.2} aria-hidden />
                {claim}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-5">
            <a
              href={telLink(site.contact.phoneE164)}
              className="inline-flex items-center gap-2 font-mono text-[0.625rem] tracking-[0.12em] text-bone uppercase hover:text-brass-light"
            >
              <Phone className="size-3.5" strokeWidth={1.9} aria-hidden />
              {site.contact.phoneDisplay}
            </a>

            {/* The builder audience gets one clear door, not the homepage. */}
            <Link
              href="/for-builders"
              className="group inline-flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.12em] text-bone/60 uppercase transition-colors hover:text-bone"
            >
              <span className="link-draw">Are you a builder?</span>
              <ArrowRight
                className="size-3 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
