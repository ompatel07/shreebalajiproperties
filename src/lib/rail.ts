/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MOBILE RAIL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * On a phone, a collection of cards becomes one swipeable row that bleeds to
 * the screen edge; from `md` up it becomes an ordinary grid. This single
 * pattern is most of why the homepage dropped from 26 phone-screens of
 * scrolling: six cards stacked one per row is six screens, the same six in a
 * rail is one.
 *
 * ── Why these are Tailwind utilities and not the `.rail` class ──────────
 * globals.css has hand-written `.rail` / `.rail-bleed` classes inside
 * `@layer utilities`, emitted AFTER Tailwind's generated utilities. Equal
 * specificity, later source wins — so `.rail { display: flex }` beat
 * `md:grid`, and `.rail-bleed`'s negative margins beat `md:mx-0`. Responsive
 * overrides on top of those classes silently did nothing. Built from
 * Tailwind's own utilities, every `md:` override composes the normal way.
 *
 * The bleed values match the `.shell` gutter at each breakpoint (1.125rem,
 * then 1.75rem from `sm`), and `scroll-px` matches it too so snapping lands
 * the first card on the gutter rather than on the screen edge.
 */

/** Phone layout: a horizontal, snapping, edge-bleeding row. */
export const RAIL =
  "no-bar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain " +
  "-mx-[1.125rem] px-[1.125rem] scroll-px-[1.125rem] " +
  "sm:-mx-7 sm:px-7 sm:scroll-px-7";

/** Undo the rail from `md` up, leaving the caller to set its grid columns. */
export const RAIL_TO_GRID =
  "md:mx-0 md:grid md:snap-none md:overflow-visible md:px-0";

/** Undo the rail from `md` up but keep a wrapping flex row (chips). */
export const RAIL_TO_WRAP =
  "md:mx-0 md:flex-wrap md:snap-none md:overflow-visible md:px-0";

/** Each item in a rail: fixed width on a phone, fluid in the grid. */
export const RAIL_ITEM = "shrink-0 snap-start md:w-auto md:max-w-none";
