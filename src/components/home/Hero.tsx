import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Phone } from "lucide-react";

import { HeroSearch } from "@/components/home/HeroSearch";
import { RevealLines } from "@/components/motion/Reveal";
import { ahmedabadCount, localityCount, site } from "@/config/site";
import { unsplash } from "@/lib/imagery";
import { telLink } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HERO — bright split composition
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Why this is no longer a dark photo with an overlay ──────────────────
 * It was a full-bleed image under a near-black gradient, which is the hero
 * every property site in this market ships — and it quietly contradicted the
 * brand, which is bright on purpose because light reads as honest here.
 * Dimming a photograph until white text sits on it also throws the
 * photograph away.
 *
 * So: an ivory ground, the headline set large in the display serif, and the
 * photograph kept bright and full-contrast in its own column, bleeding off
 * the right edge on wide screens. Breaking one element out of the shell is
 * the composition's single piece of asymmetry, and it is what stops the page
 * reading as a stack of centred boxes.
 *
 * ── The header depends on this ──────────────────────────────────────────
 * Because the top of this section is ivory, the header sits transparent over
 * it in its normal ink colourway. The photo starts below the header's height
 * for exactly that reason; when it bled upward, the nav lost contrast against
 * the sky — which is what it was doing in the screenshot that prompted this.
 *
 * The search sits under the headline, full width, above the fold. Everything
 * else here is secondary to getting someone into a result set.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bone pt-16 lg:pt-[4.75rem]">
      {/* Drafting grid. Masked to the top-right so it never runs rules
          across the headline, where it read as a stray table border. */}
      <div
        className="blueprint pointer-events-none absolute inset-0 opacity-[0.3] [mask-image:radial-gradient(circle_at_85%_0%,black,transparent_60%)]"
        aria-hidden
      />
      {/* One warm bloom behind the type, so the ivory is not flat. */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 size-[34rem] rounded-full bg-brass-pale/50 blur-[120px]"
        aria-hidden
      />

      <div className="shell relative">
        <div className="grid items-center gap-10 pt-8 lg:grid-cols-12 lg:gap-14 lg:pt-10">
          {/* ── Copy ──────────────────────────────────────────────────── */}
          <div className="min-w-0 lg:col-span-6">
            <p data-reveal="" className="eyebrow mb-5 flex items-center gap-3 text-brass">
              <span className="h-px w-8 bg-brass" aria-hidden />
              Ahmedabad &amp; Gandhinagar
            </p>

            <h1 className="display-tight font-display text-[clamp(2.5rem,6.2vw,4.75rem)] leading-[1.02] text-ink">
              <RevealLines
                lines={[
                  "Find a home you",
                  <span key="claim">
                    actually{" "}
                    <em className="display-wonk text-brass">want to live in.</em>
                  </span>,
                ]}
                delay={0.1}
              />
            </h1>

            <p
              data-reveal=""
              style={{ ["--reveal-delay" as string]: "440ms" }}
              className="mt-6 max-w-lg text-lead text-ink-muted"
            >
              Flats, villas, offices and plots across {localityCount} areas.
              Tell us what you are looking for — we will show you what is
              genuinely available, and what it really costs.
            </p>

            {/* ── Reassurance. Three facts, no adjectives. ───────────── */}
            <ul
              data-reveal=""
              style={{ ["--reveal-delay" as string]: "560ms" }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5"
            >
              {[
                "Every listing checked",
                "No charge to buyers",
                "One advisor, start to finish",
              ].map((claim) => (
                <li
                  key={claim}
                  className="flex items-center gap-2 text-[0.8125rem] font-medium text-ink-soft"
                >
                  <BadgeCheck
                    className="size-4 shrink-0 text-verdant"
                    strokeWidth={2}
                    aria-hidden
                  />
                  {claim}
                </li>
              ))}
            </ul>

            <div
              data-reveal=""
              style={{ ["--reveal-delay" as string]: "640ms" }}
              className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3"
            >
              <a
                href={telLink(site.contact.phoneE164)}
                className="group inline-flex items-center gap-2.5 text-[0.9375rem] font-semibold text-ink transition-colors hover:text-brass"
              >
                <span className="grid size-9 place-items-center rounded-full bg-forest-pale text-forest transition-colors duration-300 group-hover:bg-forest group-hover:text-bone">
                  <Phone className="size-4" strokeWidth={2} aria-hidden />
                </span>
                <span data-numeric>{site.contact.phoneDisplay}</span>
              </a>

              {/* The builder audience gets one clear door, not the homepage. */}
              <Link
                href="/for-builders"
                className="group inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink-muted transition-colors hover:text-ink"
              >
                <span className="link-draw">Are you a builder?</span>
                <ArrowRight
                  className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </div>
          </div>

          {/* ── Photograph ────────────────────────────────────────────── */}
          {/* Bleeds off the right edge from xl. The negative margin is matched
              to the shell gutter rather than using 100vw, which on desktop
              includes the scrollbar and shoves the layout sideways. */}
          <div className="min-w-0 lg:col-span-6 xl:-mr-12 2xl:-mr-[4.5rem]">
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-sand lg:aspect-[4/3.4]">
                <Image
                  src={unsplash("1600607687939-ce8a6c25118c", 1400, 80)}
                  /* An interior, deliberately. Every exterior in the stock
                     library is a Mediterranean villa with a pool or a North
                     American suburb — instantly wrong for Ahmedabad, and the
                     old alt text claimed it was a local development, which
                     was simply false. An interior carries no location tell,
                     so it is both better looking and honest. Still stock:
                     replace with the client's own project photography before
                     launch. See src/lib/imagery.ts. */
                  alt="A naturally lit living room in a modern home"
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="ken-burns object-cover object-center"
                />
                {/* Just enough to seat the card — nowhere near a dimming layer. */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/35 to-transparent"
                  aria-hidden
                />
              </div>

              {/* ── The one floating element on the page. ─────────────── */}
              <div
                data-reveal=""
                style={{ ["--reveal-delay" as string]: "700ms" }}
                className="absolute bottom-5 left-5 rounded-[var(--radius-card)] bg-bone/95 px-5 py-4 shadow-[var(--shadow-float)] backdrop-blur-sm sm:bottom-6 sm:left-6"
              >
                <p className="font-display text-[2.25rem] leading-none text-ink">
                  <span data-numeric>{localityCount}</span>
                  <span className="text-brass">.</span>
                </p>
                <p className="mt-1.5 max-w-[11rem] text-[0.8125rem] leading-snug text-ink-muted">
                  areas covered — {ahmedabadCount} across Ahmedabad, the rest in
                  Gandhinagar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search. The main event, full width, above the fold. ──────── */}
        <div
          data-reveal=""
          style={{ ["--reveal-delay" as string]: "760ms" }}
          className="relative z-10 pt-9 pb-14 lg:pt-10 lg:pb-20"
        >
          <HeroSearch />
        </div>
      </div>
    </section>
  );
}
