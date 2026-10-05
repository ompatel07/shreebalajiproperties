import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { localityBySlug } from "@/config/site";
import { formatPriceRange } from "@/lib/format";
import { unsplash, EXTERIORS } from "@/lib/imagery";
import { hashString } from "@/lib/utils";
import type { PartneredProjectCard } from "@/lib/queries";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NEW PROJECTS — large photographic cards
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Projects had no presence on the homepage at all, despite being what this
 * firm actually markets for builders and what a buyer in this market asks
 * for by name. Every comparable portal leads with a project carousel.
 *
 * Deliberately a different card to the listing cards above: bigger, fewer,
 * with the builder named. A project is a brand decision for a buyer here —
 * "is this developer going to deliver?" — so the builder's name does more
 * work than another specification line would.
 *
 * Renders nothing when there are no partnered projects rather than showing an
 * empty rail, because a section heading above six skeletons is worse than no
 * section.
 */
export function ProjectsBand({ projects }: { projects: PartneredProjectCard[] }) {
  if (projects.length === 0) return null;

  const cards = projects.slice(0, 4);

  return (
    <section className="border-t border-rule bg-sand py-14 lg:py-18">
      <div className="shell">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3 text-brass">New launches &amp; under construction</p>
              <h2 className="display-tight font-display text-h2">
                Projects we are{" "}
                <em className="display-wonk text-brass">marketing now.</em>
              </h2>
            </div>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-brass"
            >
              <span className="link-draw">All projects</span>
              <ArrowRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2.2}
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>

        <div
          data-reveal-group=""
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {cards.map((project) => {
            const locality = localityBySlug.get(project.locality_slug);
            // Deterministic, so a card never swaps image between renders.
            const fallback = EXTERIORS[hashString(project.slug) % EXTERIORS.length]!;
            const price = formatPriceRange(project.price_min, project.price_max);

            return (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-rule bg-paper shadow-[var(--shadow-lift)] transition-all duration-400 hover:-translate-y-1 hover:shadow-[var(--shadow-raise)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-sand-deep">
                  <Image
                    src={project.hero_image ?? unsplash(fallback, 700, 70)}
                    alt={project.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-105"
                  />

                  {project.rera_id && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-verdant px-2.5 py-1 text-[0.625rem] font-semibold text-paper">
                      <BadgeCheck className="size-3" strokeWidth={2.4} aria-hidden />
                      RERA
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  {project.builder?.name && (
                    <p className="mb-1 truncate text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-faint uppercase">
                      {project.builder.name}
                    </p>
                  )}

                  <h3 className="truncate text-[1.0625rem] leading-tight font-semibold text-ink">
                    {project.name}
                  </h3>

                  <p className="mt-1.5 flex items-center gap-1.5 truncate text-[0.8125rem] text-ink-muted">
                    <MapPin className="size-3.5 shrink-0 text-brass" strokeWidth={1.9} aria-hidden />
                    {locality?.name ?? project.locality_slug}
                  </p>

                  <p
                    className="mt-auto pt-3 font-display text-[1.25rem] text-ink"
                    data-numeric
                  >
                    {price}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
