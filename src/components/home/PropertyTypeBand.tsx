import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { propertyTypes } from "@/config/site";
import { unsplash } from "@/lib/imagery";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BROWSE BY PROPERTY TYPE — photographic
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Why this exists ─────────────────────────────────────────────────────
 * "Browse by type" already existed, as a column of six text links inside
 * QuickBrowse. Every Indian portal worth comparing against — Square Yards
 * runs 150+ images on its homepage — shows this as photographs, because
 * "villa" and "plot" are things a buyer pictures rather than reads. A text
 * list is the single most minimal-looking way to present the most visual
 * decision on the site.
 *
 * Each card is one tap to a canonical, indexable landing page, so this is
 * also six more internal links into the facet surface from the homepage.
 *
 * ── The imagery ─────────────────────────────────────────────────────────
 * Pinned per type rather than hashed, because a "Plots" card showing a
 * living room is worse than no picture. The duotone is the same treatment as
 * the hero area tiles so the page reads as one set, and it is what keeps six
 * unrelated Western stock photographs from looking like a grab-bag. Replace
 * the ids with the client's own photography when it arrives — see
 * src/lib/imagery.ts.
 */

/**
 * Only ids whose subject has been looked at and matches the label.
 *
 * The pools in `imagery.ts` are labelled EXTERIORS / COMMERCIAL / LAND, but
 * those labels are not reliable — the file verified that each id returns HTTP
 * 200, not that it depicts what the group name says. "shops" in COMMERCIAL is
 * a residential living room; both LAND entries are houses among trees. A card
 * reading "Plots" over a photograph of a cottage is worse than a card with no
 * photograph, so anything unverified gets the pattern tile below instead.
 */
const TYPE_IMAGE: Record<string, string> = {
  flats: "1600607687939-ce8a6c25118c",
  villas: "1613490493576-7fde63acd811",
  bungalows: "1580587771525-78b9dba3b914",
  offices: "1497366811353-6870744d04b2",
};

const ORDER = ["flats", "villas", "bungalows", "offices", "shops", "plots"];

export function PropertyTypeBand({
  counts,
}: {
  /** property-type slug → number of live listings. */
  counts: Record<string, number>;
}) {
  const cards = ORDER.map((slug) => propertyTypes.find((t) => t.slug === slug)).filter(
    (t): t is (typeof propertyTypes)[number] => Boolean(t),
  );

  return (
    <section className="border-t border-rule bg-bone py-14 lg:py-18">
      <div className="shell">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3 text-brass">What are you looking for</p>
              <h2 className="display-tight font-display text-h2">
                Browse by <em className="display-wonk text-brass">property type.</em>
              </h2>
            </div>
            <Link
              href="/properties"
              className="group inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-brass"
            >
              <span className="link-draw">See everything</span>
              <ArrowUpRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2.2}
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>

        <div
          data-reveal-group=""
          className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6"
        >
          {cards.map((type) => {
            const count = counts[type.slug] ?? 0;
            const id = TYPE_IMAGE[type.slug];

            return (
              <Link
                key={type.slug}
                href={`/ahmedabad/${type.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-sand"
              >
                {id ? (
                  <>
                    <Image
                      src={unsplash(id, 520, 68)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 17vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover grayscale transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-105"
                    />
                    {/* Lighter than the hero tiles: at this size the old
                        70% forest turned the card into a dark slab, which
                        fights a brand that is bright on purpose. */}
                    <div className="absolute inset-0 bg-forest/45 mix-blend-multiply" aria-hidden />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent"
                      aria-hidden
                    />
                  </>
                ) : (
                  // No honest photograph for this type — the jaali instead.
                  <>
                    {/* Forest ground rather than sand: the label is white, to
                        match the photo cards, and white on pale sand was
                        unreadable. On forest the clay lattice reads as a lit
                        screen and the card sits in the same set. */}
                    <div className="absolute inset-0 bg-forest" aria-hidden />
                    <div className="jaali absolute inset-0 opacity-30" aria-hidden />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"
                      aria-hidden
                    />
                  </>
                )}

                <div className="absolute inset-x-0 bottom-0 p-3.5">
                  <p className="text-[0.9375rem] leading-tight font-semibold text-bone">
                    {type.name}
                  </p>
                  <p className="mt-0.5 text-[0.75rem] text-bone/75">
                    {count > 0 ? (
                      <>
                        <span data-numeric>{count}</span> live
                      </>
                    ) : (
                      "Ask us"
                    )}
                  </p>
                </div>

                <span
                  className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-bone/90 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                >
                  <ArrowUpRight className="size-3.5" strokeWidth={2.2} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
