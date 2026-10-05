/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HERO BACKDROP — a jaali screen
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Why this is drawn and not photographed ──────────────────────────────
 * Two earlier attempts used a photograph washed back until it was texture,
 * and both read as "still empty". The obvious fix is to make the photograph
 * clearly visible — except every image in the stock library is a
 * Mediterranean villa with a pool or a New England cottage. Faint, that is
 * forgivable texture. Clearly visible on an Ahmedabad property site, it is
 * simply wrong, and a buyer here would clock it immediately.
 *
 * So the background is drawn instead. A *jaali* is the perforated stone
 * lattice screen found all over Gujarati architecture — Sidi Saiyyed's is the
 * emblem of Ahmedabad — which makes it the one ornament that can be large and
 * obvious here without looking borrowed. It is also already the site's motif,
 * just at a scale too small to read as anything but noise.
 *
 * Drawn as an SVG `<pattern>`, so it is a couple of hundred bytes, crisp at
 * any density, needs no network request, and costs the LCP nothing — all of
 * which a full-bleed photograph does not manage.
 *
 * ── Keeping the type readable ───────────────────────────────────────────
 * The lattice is masked with a radial gradient that fades it out behind the
 * headline and the search card, so the pattern is strongest exactly where the
 * page had nothing — the margins — and absent where words are.
 */
export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* ── Ground: a warm wash, not a flat tint ──────────────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(170deg,var(--color-brass-pale)_0%,var(--color-bone)_38%,var(--color-bone)_62%,var(--color-forest-pale)_100%)] opacity-70" />

      {/* ── The lattice ───────────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 size-full text-clay [mask-image:radial-gradient(ellipse_62%_58%_at_50%_42%,transparent_18%,black_78%)]"
        aria-hidden
      >
        <defs>
          {/* An octagram built from a square and the same square turned 45°,
              with a pierced centre and connectors running to the neighbouring
              tiles — the standard construction of a stone jaali. */}
          <pattern
            id="jaali-lattice"
            width="96"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.85">
              <rect x="24" y="24" width="48" height="48" />
              <rect x="24" y="24" width="48" height="48" transform="rotate(45 48 48)" />
              <circle cx="48" cy="48" r="10" />
              <path d="M0 48h24M72 48h24M48 0v24M48 72v24" />
            </g>
            {/* The pierced holes, as the stone would leave them. */}
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

      {/* ── Depth. Two diffuse blooms, warm and cool. ──────────────────── */}
      <div className="absolute -top-56 left-1/2 size-[56rem] -translate-x-1/2 rounded-full bg-brass-pale/60 blur-[150px]" />
      <div className="absolute -bottom-48 -left-40 size-[38rem] rounded-full bg-forest-pale/80 blur-[140px]" />
      <div className="absolute -right-40 top-1/4 size-[32rem] rounded-full bg-brass-pale/45 blur-[130px]" />

      {/* ── Settle the foot of the section so the area tiles start clean ─ */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bone" />
    </div>
  );
}
