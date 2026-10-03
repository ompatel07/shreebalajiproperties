import { Star } from "lucide-react";

import { TestimonialToggle } from "@/components/admin/TestimonialToggle";
import { Badge } from "@/components/ui/Badge";
import { formatDate, initials } from "@/lib/format";
import { demoTestimonials, isDemoMode } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types/db";

/**
 * Testimonial moderation.
 *
 * Nothing appears on the public site until it is published here — the RLS
 * policy exposes only `is_published` rows. Unpublished-first ordering puts
 * whatever needs a decision at the top.
 *
 * There is no public submission form for these on purpose. Testimonials are
 * collected by the client in conversation and entered here, which keeps the
 * table from becoming a spam target.
 */
export default async function TestimonialsPage() {
  if (isDemoMode()) {
    return <TestimonialsView testimonials={demoTestimonials} error={null} />;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("is_published", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(100);

  return <TestimonialsView testimonials={(data ?? []) as Testimonial[]} error={error ? "load" : null} />;
}

function TestimonialsView({
  testimonials,
  error,
}: {
  testimonials: Testimonial[];
  error: string | null;
}) {
  const pending = testimonials.filter((t) => !t.is_published).length;

  return (
    <div className="p-5 lg:p-10">
      <header className="border-b border-rule pb-6">
        <p className="eyebrow">Social proof</p>
        <h1 className="mt-2 font-display text-h3 text-ink">
          Testimonials
          {pending > 0 && (
            <span className="ml-3 font-mono text-micro tracking-[0.12em] text-brass uppercase">
              {pending} awaiting review
            </span>
          )}
        </h1>
        <p className="mt-3 max-w-2xl text-caption leading-relaxed text-ink-muted">
          Nothing shows on the site until you publish it. Add new ones directly
          in the Supabase table editor — the <code className="font-mono">role</code>{" "}
          field is what makes a quote checkable, so write it as
          &ldquo;Bought a 3 BHK in Shela, 2024&rdquo; rather than
          &ldquo;Happy customer&rdquo;.
        </p>
      </header>

      {error ? (
        <div className="mt-8 rounded-[2px] border border-alert/30 bg-alert-pale p-6">
          <p className="font-mono text-micro tracking-[0.12em] text-alert uppercase">
            Could not load testimonials
          </p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="relative mt-8 overflow-hidden rounded-[2px] border border-rule bg-paper px-6 py-20 text-center">
          <div className="jaali absolute inset-0" aria-hidden />
          <div className="relative">
            <p className="eyebrow">Nothing yet</p>
            <h2 className="mt-4 font-display text-h4">No testimonials</h2>
            <p className="mx-auto mt-3 max-w-sm text-caption leading-relaxed text-ink-muted">
              The homepage section hides itself entirely while this is empty, so
              the site will not look unfinished.
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          {testimonials.map((t) => (
            <li
              key={t.id}
              className={`rounded-[2px] border p-5 ${
                t.is_published ? "border-rule bg-paper" : "border-brass/30 bg-brass-pale/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-brass/30 bg-brass-pale font-mono text-[0.6875rem] text-brass-deep"
                  >
                    {initials(t.author)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[1.0625rem] text-ink">{t.author}</p>
                    {t.role && (
                      <p className="truncate font-mono text-[0.5625rem] tracking-[0.1em] text-ink-muted uppercase">
                        {t.role}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {t.is_featured && <Badge tone="brass">Featured</Badge>}
                  <div className="flex gap-0.5" aria-label={`${t.rating} out of 5`}>
                    {Array.from({ length: t.rating }, (_, i) => (
                      <Star key={i} className="size-3 fill-brass text-brass" aria-hidden />
                    ))}
                  </div>
                </div>
              </div>

              <blockquote className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">
                {t.quote}
              </blockquote>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
                <p className="font-mono text-[0.5rem] tracking-[0.1em] text-ink-faint uppercase">
                  {formatDate(t.created_at)}
                  {t.locality ? ` · ${t.locality}` : ""}
                </p>
                <TestimonialToggle id={t.id} published={t.is_published} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
