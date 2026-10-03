import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Handshake } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { localityBySlug } from "@/config/site";
import { formatPossession, formatPriceRange } from "@/lib/format";
import { blurPlaceholder, heroImageFor } from "@/lib/imagery";
import type { PartneredProjectCard } from "@/lib/queries";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PARTNERED PROJECTS — the commercial differentiator
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The client is a channel partner who also co-invests in some of what they
 * sell. Most brokers would bury that; it is in fact the strongest thing they
 * can say, so it gets the one dark band on an otherwise bright site — which
 * is exactly why the eye goes to it.
 *
 * The argument: a broker earning only commission is indifferent to whether
 * the building gets delivered. A broker holding equity in it is not. That is
 * a real alignment of interest and the hardest claim in Ahmedabad to copy.
 *
 * ── Layout ──────────────────────────────────────────────────────────────
 * A horizontal rail at every breakpoint, not a card grid. Partnered projects
 * are a short, curated set (four, not forty) and a rail says "these are the
 * ones" where a grid implies a catalogue. It also keeps the section short
 * vertically, so the dark band is a punctuation mark rather than a chapter.
 */
export function PartneredProjects({ projects }: { projects: PartneredProjectCard[] }) {
  if (projects.length === 0) return null;

  return (
    <section id="projects" className="relative overflow-hidden bg-ink py-20 lg:py-28">
      {/* Faint jaali at very low opacity — texture, not pattern. */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden>
        <div className="jaali size-full" />
      </div>

      <div className="relative">
        <div className="shell">
          <Reveal>
            <div className="grid gap-7 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="eyebrow mb-4 flex items-center gap-2.5 text-brass-light">
                  <Handshake className="size-3.5" strokeWidth={2} aria-hidden />
                  04 — Skin in the game
                </p>
                <h2 className="display-tight font-display text-h2 text-bone">
                  Projects where our own{" "}
                  <em className="display-wonk text-brass-light">capital is at risk</em>{" "}
                  alongside yours.
                </h2>
              </div>

              <div className="lg:col-span-4">
                <p className="text-bone/70">
                  A broker paid only on commission stops caring the day you
                  sign. In these we are a co-investor, so a delayed possession
                  costs us too.
                </p>
                <Link
                  href="/projects"
                  className="group mt-5 inline-flex items-center gap-2 font-mono text-micro tracking-[0.14em] text-brass-light uppercase"
                >
                  <span className="link-draw">All projects</span>
                  <ArrowUpRight
                    className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2}
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── Rail. Bleeds to the screen edge so it reads as continuing
               past the viewport. ──────────────────────────────────────── */}
        <div className="rail mt-12 gap-5 px-[1.125rem] pb-3 sm:px-7 lg:mt-16 lg:px-12 2xl:px-[4.5rem]">
          {projects.map((project) => {
            const locality = localityBySlug.get(project.locality_slug);

            return (
              <article key={project.id} className="w-[82vw] max-w-[23rem] sm:w-[52vw] lg:w-[26rem]">
                <Link
                  href={`/projects/${project.slug}`}
                  className="group flex h-full flex-col border border-bone/12 transition-colors duration-500 hover:border-brass/50"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={heroImageFor(
                        {
                          hero_image: project.hero_image,
                          slug: project.slug,
                          category: project.category,
                        },
                        800,
                      )}
                      alt={`${project.name} — ${locality?.name ?? project.locality_slug}`}
                      fill
                      sizes="(max-width: 640px) 82vw, (max-width: 1024px) 52vw, 26rem"
                      placeholder="blur"
                      blurDataURL={blurPlaceholder()}
                      className="photo-warm object-cover transition-transform duration-[1.3s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/75 to-transparent" aria-hidden />

                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-brass px-2 py-1 font-mono text-[0.5rem] tracking-[0.12em] text-paper uppercase">
                      <Handshake className="size-2.5" strokeWidth={2.4} aria-hidden />
                      Co-invested
                    </span>

                    {/* Name over the photo — gives the plate a cover feel. */}
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="font-mono text-[0.5rem] tracking-[0.14em] text-bone/60 uppercase">
                        {project.builder?.name ?? "Independent"} ·{" "}
                        {locality?.name ?? project.locality_slug}
                      </p>
                      <h3 className="mt-1.5 font-display text-h4 text-bone">
                        <span className="link-draw">{project.name}</span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    {project.tagline && (
                      <p className="line-clamp-2 text-caption leading-relaxed text-bone/60">
                        {project.tagline}
                      </p>
                    )}

                    <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-bone/12 pt-4">
                      <div>
                        <dt className="font-mono text-[0.5rem] tracking-[0.14em] text-bone/40 uppercase">
                          Price
                        </dt>
                        <dd className="mt-1 font-display text-[1.0625rem] text-bone" data-numeric>
                          {formatPriceRange(project.price_min, project.price_max)}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[0.5rem] tracking-[0.14em] text-bone/40 uppercase">
                          Possession
                        </dt>
                        <dd className="mt-1 font-display text-[1.0625rem] text-bone">
                          {formatPossession(project.possession, project.possession_date)}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="font-mono text-[0.5rem] tracking-[0.1em] text-bone/35 uppercase">
                        {project.rera_id ? `RERA ${project.rera_id.slice(-8)}` : "RERA pending"}
                      </span>
                      <span className="grid size-8 place-items-center rounded-full border border-bone/25 text-bone transition-all duration-400 group-hover:border-brass group-hover:bg-brass group-hover:text-ink">
                        <ArrowUpRight className="size-3.5" strokeWidth={1.8} aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        <div className="shell">
          <p className="mt-6 font-mono text-[0.5625rem] tracking-[0.14em] text-bone/35 uppercase">
            {projects.length} of our projects carry our own capital · Swipe →
          </p>
        </div>
      </div>
    </section>
  );
}
