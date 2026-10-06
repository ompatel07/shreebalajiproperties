import Image from "next/image";
import Link from "next/link";

import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * The client's mark, paired with the wordmark.
 *
 * ── On the artwork ──────────────────────────────────────────────────────
 * The supplied file is gold on a baked-in dark radial gradient, which would
 * put a black rectangle in an ivory header. `scripts/prepare-logo.mjs` floods
 * inward from the border to clear only backdrop — a plain luminance key would
 * have eaten the artwork's own dark outlines — and writes:
 *
 *   public/logo-mark.png   the emblem alone, transparent (used here)
 *   public/logo.png        full lockup, transparent
 *   public/logo-full.png   untouched original, for dark surfaces where the
 *                          original gold-on-black is faithful
 *
 * `<Monogram>` is kept as the jaali fallback — it is still used for the
 * favicon and the OG image, which need a vector.
 *
 * NOTE: the artwork reads "Shree Krishna REAL ESTATE" while `site.name` is
 * "Shree Krishna Properties" (from the client's own proposal PDF). The
 * wordmark here follows the config. Confirm which is correct — it is a
 * one-line change in `src/config/identity.ts`.
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
      {/* ── The mark, on a plaque ──────────────────────────────────────
          The artwork is gold, drawn to sit on black. Dropped straight onto
          ivory it reads as a pale smudge — correct colours, no contrast. An
          ink plaque gives it the ground it was designed for, and a small dark
          badge beside a serif wordmark is a normal premium lockup rather than
          a workaround.

          On already-dark surfaces the plaque would be invisible, so there it
          is dropped and the mark sits directly on the background.

          Sized by HEIGHT with width auto: the emblem is about 2.2:1, and a
          square box letterboxes it to half the usable height. */}
      <span
        className={cn(
          "grid shrink-0 place-items-center transition-colors duration-500",
          isInverse
            ? ""
            : "rounded-[var(--radius-card)] bg-ink px-2 py-1.5 group-hover:bg-brass-deep",
        )}
      >
        <Image
          src="/logo-mark.png"
          alt=""
          width={350}
          height={160}
          priority
          className="h-7 w-auto object-contain lg:h-8"
        />
      </span>

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
