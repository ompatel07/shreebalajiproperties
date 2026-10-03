"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTIMONIALS — one large pull-quote
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Why not a card grid ─────────────────────────────────────────────────
 * Three quote cards side by side is the stock pattern, and at that size
 * every quote gets truncated to the point of saying nothing. One quote set
 * large, with the others as a selectable strip of names beneath, lets the
 * display serif do its job and lets a visitor actually read the thing.
 *
 * ── Craft notes ─────────────────────────────────────────────────────────
 *   · The avatar is a typographic monogram, not a stock headshot. A fake
 *     face next to a real quote undermines the quote.
 *   · The role line carries the transaction — "Bought a 3 BHK in Shela,
 *     2024". A named locality and a year is what makes a testimonial
 *     checkable, and checkable is the only kind worth printing.
 *   · Quotes are moderated through the admin panel; RLS only exposes
 *     `is_published` rows.
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const active = testimonials[index] ?? testimonials[0]!;
  const count = testimonials.length;

  const go = (next: number) => setIndex((next + count) % count);

  return (
    <section id="testimonials" className="border-t border-rule bg-bone py-20 lg:py-28">
      <div className="shell">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-8">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">06 — In their words</p>
              <h2 className="display-tight font-display text-h2">
                Most of our work comes from{" "}
                <em className="display-wonk text-brass">people we have already helped.</em>
              </h2>
            </div>

            <p className="max-w-xs text-caption leading-relaxed text-ink-muted">
              We do not run ads. The pipeline is referrals, which only works if
              the last person was genuinely looked after.
            </p>
          </div>
        </Reveal>

        {/* ── The quote ──────────────────────────────────────────────────── */}
        <Reveal className="mt-12 lg:mt-16">
          <figure className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Oversized quote glyph as a drawn element, not an icon. */}
            <div className="hidden lg:col-span-1 lg:block" aria-hidden>
              <span className="font-display text-[7rem] leading-[0.6] text-clay">&ldquo;</span>
            </div>

            <div className="lg:col-span-8">
              <blockquote
                // `key` restarts the fade when the quote changes.
                key={active.id}
                className="pop-in font-display text-[clamp(1.375rem,2.8vw,2.125rem)] leading-[1.32] text-ink"
              >
                {active.quote}
              </blockquote>

              <figcaption className="mt-8 flex items-center gap-4 border-t border-rule pt-6">
                <span
                  aria-hidden
                  className="grid size-12 shrink-0 place-items-center rounded-full border border-brass/35 bg-brass-pale font-mono text-caption tracking-[0.06em] text-brass-deep"
                >
                  {initials(active.author)}
                </span>

                <div className="min-w-0">
                  <p className="font-display text-[1.125rem] text-ink">{active.author}</p>
                  {active.role && (
                    <p className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
                      {active.role}
                    </p>
                  )}
                </div>

                {active.rating >= 4 && (
                  <div
                    className="ml-auto hidden shrink-0 gap-0.5 sm:flex"
                    aria-label={`${active.rating} out of 5`}
                  >
                    {Array.from({ length: active.rating }, (_, i) => (
                      <Star key={i} className="size-3 fill-brass text-brass" aria-hidden />
                    ))}
                  </div>
                )}
              </figcaption>
            </div>

            {/* ── Selector. Names, not dots — a dot tells you nothing about
                   what you are about to read. ──────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between gap-3 lg:hidden">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label="Previous testimonial"
                  className="grid size-10 place-items-center border border-rule-strong text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone"
                >
                  <ArrowLeft className="size-4" strokeWidth={1.8} aria-hidden />
                </button>

                <span className="font-mono text-[0.625rem] tracking-[0.14em] text-ink-muted tabular-nums" data-numeric>
                  {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>

                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label="Next testimonial"
                  className="grid size-10 place-items-center border border-rule-strong text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone"
                >
                  <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
                </button>
              </div>

              <ul className="hidden lg:block">
                {testimonials.map((t, i) => (
                  <li key={t.id} className="border-t border-rule last:border-b">
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-current={i === index ? "true" : undefined}
                      className={cn(
                        "w-full py-3.5 text-left transition-colors duration-300",
                        i === index ? "text-ink" : "text-ink-faint hover:text-ink-muted",
                      )}
                    >
                      <span className="flex items-baseline gap-2.5">
                        <span
                          className={cn(
                            "font-mono text-[0.5625rem] tabular-nums",
                            i === index ? "text-brass" : "text-ink-faint",
                          )}
                          data-numeric
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[0.9375rem]">{t.author}</span>
                          {t.locality && (
                            <span className="block font-semibold text-[0.6875rem] tracking-[0.12em] uppercase opacity-70">
                              {t.locality}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
