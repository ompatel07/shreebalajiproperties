import { Quote, Star } from "lucide-react";

import { SectionHeader } from "@/components/home/SectionHeader";
import { RAIL, RAIL_ITEM, RAIL_TO_GRID } from "@/lib/rail";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REVIEWS — quote cards
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Three cards side by side on a desktop, a swipe on a phone. Each carries the
 * thing that makes a testimonial checkable rather than decorative: what the
 * person bought, where, and when (the `role` field).
 *
 * Renders nothing with no published testimonials — an empty "what clients
 * say" heading is worse than no section.
 */
export function Reviews({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  const shown = testimonials.slice(0, 3);

  return (
    <section className="bg-paper py-14 lg:py-20">
      <div className="shell">
        <SectionHeader
          title="What buyers say about us"
          subtitle="Most of our work comes from people we have already helped, and the people they send."
        />

        <div className={cn(RAIL, RAIL_TO_GRID, "mt-7 md:grid-cols-3 md:gap-5 lg:mt-9")}>
          {shown.map((t) => (
            <figure
              key={t.id}
              className={cn(
                RAIL_ITEM,
                "flex w-[84vw] max-w-sm flex-col rounded-2xl bg-bone p-6 ring-1 ring-rule lg:p-7",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5" role="img" aria-label={`${t.rating} out of 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn("size-4", i < t.rating ? "fill-brass-light text-brass-light" : "text-rule-strong")}
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  ))}
                </div>
                <Quote className="size-7 text-brass-pale" fill="currentColor" strokeWidth={0} aria-hidden />
              </div>

              <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
                {/* Long quotes are trimmed on the card; the full text is a
                    content decision for the client, not a layout one. */}
                <p className="line-clamp-6">{t.quote}</p>
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-rule pt-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-[0.875rem] font-bold text-brass-light">
                  {initials(t.author)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.9375rem] font-bold text-ink">{t.author}</span>
                  {t.role && <span className="block truncate text-[0.8125rem] text-ink-muted">{t.role}</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
