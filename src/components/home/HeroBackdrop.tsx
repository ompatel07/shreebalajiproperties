import Image from "next/image";

import { unsplash } from "@/lib/imagery";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HERO BACKDROP — arched photo panels behind a jaali screen
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── The composition ─────────────────────────────────────────────────────
 * Property photography, but framed rather than pasted behind the headline.
 * Four tall panels sit in the margins either side of the centred column —
 * the part of the page that was empty — each cut to a round-topped arch and
 * bleeding off the edge of the screen. The jaali lattice runs over the whole
 * section on top of them, so the photographs are seen *through* the screen,
 * which is what a jaali is actually for.
 *
 * ── Why framed and not full-bleed ───────────────────────────────────────
 * A full-bleed photograph behind the type was tried twice and rejected
 * twice. It also forces a choice between legible text and a visible picture.
 * Panels in the margins avoid that entirely: the photographs are large and
 * obvious where there is room, and nowhere near the words.
 *
 * ── Why they are duotoned ───────────────────────────────────────────────
 * The stock library is entirely Western — Mediterranean villas, North
 * American suburbs — which is wrong for Ahmedabad at full colour. Desaturated
 * and pushed through the brand's forest and brass they read as decoration
 * rather than as listings, and they stop looking like four unrelated
 * photographs. The treatment also survives the client swapping in their own
 * project photography, which is the point of keeping it in one place.
 *
 * Panels are `xl:` and up only. Below that the margins do not exist, so they
 * would either crowd the search or overflow the viewport.
 */

/** Left/right margin panels. `side` is a Tailwind inset, not a raw value. */
const PANELS = [
  {
    id: "1580587771525-78b9dba3b914",
    className: "left-0 top-[15%] h-[21rem] w-[14rem] -translate-x-12 2xl:-translate-x-2",
    delay: "200ms",
  },
  {
    id: "1600607687939-ce8a6c25118c",
    className: "left-0 bottom-[3%] h-[13rem] w-[10rem] translate-x-16 2xl:translate-x-32",
    delay: "320ms",
  },
  {
    id: "1613490493576-7fde63acd811",
    className: "right-0 top-[17%] h-[16rem] w-[11.5rem] -translate-x-14 2xl:-translate-x-28",
    delay: "260ms",
  },
  {
    id: "1564013799919-ab600027ffc6",
    className: "right-0 bottom-0 h-[20rem] w-[13rem] translate-x-10 2xl:translate-x-0",
    delay: "380ms",
  },
] as const;

export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* ── Ground: a warm wash, not a flat tint ──────────────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(170deg,var(--color-brass-pale)_0%,var(--color-bone)_38%,var(--color-bone)_62%,var(--color-forest-pale)_100%)] opacity-70" />

      {/* ── Arched photo panels ───────────────────────────────────────
          Bounded to the top 40rem of the section. Positioned against the
          section itself they drifted down over "Where people are buying" and
          the "All 145 areas" link, which a backdrop must never do — the
          panels are decoration and decoration does not get to sit on top of
          a navigational link. */}
      <div className="absolute inset-x-0 top-0 hidden h-[40rem] xl:block">
        {PANELS.map((panel) => (
          <div
            key={panel.id}
            data-reveal=""
            style={{ ["--reveal-delay" as string]: panel.delay }}
            className={`absolute ${panel.className}`}
          >
            {/* The arch. A full round top is the Mughal/Gujarati opening the
                jaali screens usually sit inside. */}
            <div className="relative size-full overflow-hidden rounded-t-full border border-brass/30 bg-sand ring-1 ring-bone/60 shadow-[var(--shadow-raise)]">
              <Image
                src={unsplash(panel.id, 600, 62)}
                alt=""
                fill
                sizes="15rem"
                className="object-cover grayscale"
              />
              <div className="absolute inset-0 bg-forest/45 mix-blend-multiply" />
              <div className="absolute inset-0 bg-brass/20 mix-blend-overlay" />
              {/* Only the foot fades, so the panel sits in the page without
                  being washed away. An even veil over the whole thing is what
                  made the first version invisible. */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bone/70" />
            </div>
          </div>
        ))}
      </div>

      {/* ── The jaali, over the photographs ───────────────────────────────
          An octagram built from a square and the same square turned 45°,
          with a pierced centre and connectors into the neighbouring tiles —
          how the stone version is actually constructed. Masked so it is
          strongest in the margins and fades out behind the headline and the
          search card, which keeps the type on clean ground. */}
      <svg
        className="absolute inset-0 size-full text-clay [mask-image:radial-gradient(ellipse_60%_55%_at_50%_42%,transparent_20%,black_80%)]"
        aria-hidden
      >
        <defs>
          <pattern id="jaali-lattice" width="96" height="96" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.85">
              <rect x="24" y="24" width="48" height="48" />
              <rect x="24" y="24" width="48" height="48" transform="rotate(45 48 48)" />
              <circle cx="48" cy="48" r="10" />
              <path d="M0 48h24M72 48h24M48 0v24M48 72v24" />
            </g>
            <g fill="currentColor" opacity="0.28">
              <circle cx="48" cy="48" r="3.2" />
              <circle cx="0" cy="0" r="2.4" />
              <circle cx="96" cy="0" r="2.4" />
              <circle cx="0" cy="96" r="2.4" />
              <circle cx="96" cy="96" r="2.4" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#jaali-lattice)" />
      </svg>

      {/* ── Depth. Three diffuse blooms, warm and cool. ────────────────── */}
      <div className="absolute -top-56 left-1/2 size-[56rem] -translate-x-1/2 rounded-full bg-brass-pale/55 blur-[150px]" />
      <div className="absolute -bottom-48 -left-40 size-[38rem] rounded-full bg-forest-pale/70 blur-[140px]" />
      <div className="absolute top-1/4 -right-40 size-[32rem] rounded-full bg-brass-pale/40 blur-[130px]" />

      {/* ── Settle the foot so the area tiles start on clean ivory ─────── */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bone" />
    </div>
  );
}
