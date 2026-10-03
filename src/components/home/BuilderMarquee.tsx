import { Reveal } from "@/components/motion/Reveal";
import type { Builder } from "@/types/db";

/**
 * Developer credibility rail.
 *
 * Logos would be better, but using a real builder's trademark without a
 * signed channel-partner agreement is a liability — so until the client
 * confirms which agreements are in place, this renders each name as a
 * typographic plate. It reads as intentional, and swapping in `logo_url`
 * later needs no layout change.
 *
 * CSS-only marquee: the track is duplicated and translated -50%, so it loops
 * seamlessly with no JS and no layout thrash. Pauses on hover (see
 * `.marquee-host` in globals.css) and stops entirely under
 * `prefers-reduced-motion`.
 */
export function BuilderMarquee({ builders }: { builders: Builder[] }) {
  if (builders.length === 0) return null;

  // Duplicated so the -50% translation lands exactly on a repeat.
  const track = [...builders, ...builders];

  return (
    <section className="overflow-hidden border-y border-rule bg-paper py-12 lg:py-16">
      <Reveal className="shell">
        <p className="eyebrow mb-9 text-center">
          Channel partner to developers across Ahmedabad &amp; Gandhinagar
        </p>
      </Reveal>

      <div
        className="marquee-host relative"
        // Decorative rail — the same names are listed and linked in the footer
        // and on /about, so hiding it from assistive tech loses nothing.
        aria-hidden
      >
        {/* Edge fades so names dissolve rather than clip at the viewport. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-paper to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-paper to-transparent" />

        <ul className="marquee-track flex w-max items-center gap-12 lg:gap-16">
          {track.map((builder, i) => (
            <li key={`${builder.id}-${i}`} className="shrink-0">
              <span className="font-display text-[1.375rem] whitespace-nowrap text-ink-faint transition-colors duration-500 hover:text-ink lg:text-[1.625rem]">
                {builder.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
