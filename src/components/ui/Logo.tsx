import Link from "next/link";

import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * A purely typographic logotype, by design.
 *
 * The client has no mark yet, and a placeholder pictogram would look like a
 * stock icon. Instead: a drawn monogram built from the jaali lattice motif,
 * plus the wordmark in the display serif with the second half in brass. It
 * reads as finished work rather than a gap, and when a real mark arrives it
 * drops into `<Monogram>` alone.
 *
 * Everything reads from `site.wordmark`, so renaming the business is a
 * one-line change in `src/config/site.ts`.
 */

export function Monogram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("size-9 shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* Outer frame — the architectural plate the mark sits on. */}
      <rect x="0.75" y="0.75" width="38.5" height="38.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Jaali lattice: two overlaid diagonals forming a lozenge, the
          simplest reduction of a Gujarati screen. */}
      <path d="M20 7.5 L32.5 20 L20 32.5 L7.5 20 Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      <path d="M20 13.5 L26.5 20 L20 26.5 L13.5 20 Z" fill="currentColor" opacity="0.9" />
      {/* Corner ticks — drafting registration marks. */}
      <path d="M7.5 20 H4 M36 20 H32.5 M20 7.5 V4 M20 36 V32.5" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
    </svg>
  );
}

export function Logo({
  className,
  tone = "ink",
  showTagline = false,
}: {
  className?: string;
  tone?: "ink" | "bone";
  showTagline?: boolean;
}) {
  const isInverse = tone === "bone";

  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <Monogram
        className={cn(
          "transition-colors duration-500",
          isInverse ? "text-bone/80 group-hover:text-bone" : "text-ink/75 group-hover:text-brass",
        )}
      />

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.375rem] leading-none tracking-[0.02em]",
            isInverse ? "text-bone" : "text-ink",
          )}
        >
          {site.wordmark.lead}
          <span className="text-brass-light transition-colors duration-500 group-hover:text-brass">
            {site.wordmark.tail}
          </span>
        </span>

        {showTagline && (
          <span
            className={cn(
              "mt-1 font-semibold text-[0.6875rem] tracking-[0.2em] uppercase",
              isInverse ? "text-bone/55" : "text-ink-muted",
            )}
          >
            {site.tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
