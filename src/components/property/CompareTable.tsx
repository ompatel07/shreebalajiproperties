"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Minus, Trophy, X } from "lucide-react";

import { usePropertiesBySlug } from "@/components/property/use-properties-by-slug";
import { useCompare } from "@/components/property/wishlist-store";
import { ButtonLink } from "@/components/ui/Button";
import { localityBySlug, propertyTypes } from "@/config/site";
import {
  formatArea,
  formatBhk,
  formatPossession,
  formatPrice,
  pricePerSqft,
} from "@/lib/format";
import { blurPlaceholder, heroImageFor } from "@/lib/imagery";
import { cn } from "@/lib/utils";
import type { PropertyCard } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPARE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * A comparison table is only useful if it tells you which column wins. So the
 * best value in each measurable row is marked with a trophy — cheapest ₹/sq.ft,
 * largest carpet, most amenities, soonest possession.
 *
 * The caveat under the table is deliberate and important: ₹/sq.ft is the
 * fairest single number, but it cannot see a view, a floor, a builder's
 * delivery record or a legal defect. Letting the table imply otherwise would
 * be the dishonest version of this feature.
 */
export function CompareTable() {
  const { items: slugs, ready, remove, clear } = useCompare();
  const { items, loading } = usePropertiesBySlug(slugs, ready);

  if (!ready || loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="shimmer h-80 rounded-[2px]" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return <EmptyCompare />;

  // ── Winners, computed once ────────────────────────────────────────────
  const withPsf = items.filter((p) => p.price && (p.carpet_sqft ?? p.super_sqft));
  const bestPsf =
    withPsf.length > 1
      ? withPsf.reduce((best, p) =>
          p.price! / (p.carpet_sqft ?? p.super_sqft)! <
          best.price! / (best.carpet_sqft ?? best.super_sqft)!
            ? p
            : best,
        ).id
      : null;

  const areas = items.filter((p) => p.carpet_sqft);
  const biggest =
    areas.length > 1
      ? areas.reduce((best, p) => (p.carpet_sqft! > best.carpet_sqft! ? p : best)).id
      : null;

  const priced = items.filter((p) => p.price && !p.price_on_request);
  const cheapest =
    priced.length > 1
      ? priced.reduce((best, p) => (p.price! < best.price! ? p : best)).id
      : null;

  const readyNow = items.filter((p) => p.possession === "ready-to-move").map((p) => p.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="font-mono text-micro tracking-[0.1em] text-ink-muted uppercase">
          Comparing{" "}
          <span className="text-ink" data-numeric>
            {items.length}
          </span>
        </p>
        <button
          type="button"
          onClick={clear}
          className="font-mono text-micro tracking-[0.12em] text-brass uppercase hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Horizontal scroll on narrow screens; the row labels stay stuck. */}
      <div className="no-bar -mx-5 overflow-x-auto px-5 lg:mx-0 lg:px-0">
        <table className="w-full min-w-[46rem] border-collapse">
          <caption className="sr-only">
            Side-by-side comparison of {items.length} shortlisted properties
          </caption>

          {/* ── Header: the cards ──────────────────────────────────────── */}
          <thead>
            <tr>
              <th scope="row" className="w-36 border-b border-rule bg-bone p-0 align-bottom lg:w-44">
                <span className="sr-only">Attribute</span>
              </th>

              {items.map((p) => {
                const locality = localityBySlug.get(p.locality_slug);
                return (
                  <th
                    key={p.id}
                    scope="col"
                    className="border-b border-l border-rule p-0 align-top"
                  >
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => remove(p.slug)}
                        aria-label={`Remove ${p.title} from comparison`}
                        className="absolute top-2 right-2 z-10 grid size-7 place-items-center rounded-full bg-ink/70 text-bone backdrop-blur-sm transition-colors hover:bg-ink"
                      >
                        <X className="size-3.5" strokeWidth={2.2} aria-hidden />
                      </button>

                      <Link href={`/property/${p.slug}`} className="group block">
                        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                          <Image
                            src={heroImageFor(p, 500)}
                            alt={p.title}
                            fill
                            sizes="25vw"
                            placeholder="blur"
                            blurDataURL={blurPlaceholder()}
                            className="photo-warm object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>

                        <div className="p-3.5 text-left">
                          <p className="font-mono text-[0.5rem] tracking-[0.12em] text-ink-muted uppercase">
                            {locality?.name ?? p.locality_slug}
                          </p>
                          <p className="mt-1 line-clamp-2 font-display text-[0.9375rem] leading-snug text-ink">
                            {p.title}
                          </p>
                        </div>
                      </Link>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            <Row
              label="Price"
              items={items}
              render={(p) => (
                <span className="font-display text-[1.0625rem] text-ink" data-numeric>
                  {p.price_on_request ? "On request" : formatPrice(p.price)}
                </span>
              )}
              winnerId={cheapest}
              winnerNote="Lowest"
            />

            <Row
              label="Rate per sq.ft"
              items={items}
              render={(p) => (
                <span data-numeric>
                  {pricePerSqft(p.price, p.carpet_sqft ?? p.super_sqft)}
                </span>
              )}
              winnerId={bestPsf}
              winnerNote="Best rate"
            />

            <Row
              label="Carpet area"
              items={items}
              render={(p) => (
                <span data-numeric>
                  {p.carpet_sqft ? formatArea(p.carpet_sqft) : "—"}
                </span>
              )}
              winnerId={biggest}
              winnerNote="Largest"
            />

            <Row
              label="Configuration"
              items={items}
              render={(p) => (p.bhk ? formatBhk(p.bhk) : "—")}
            />

            <Row
              label="Bathrooms"
              items={items}
              render={(p) => (p.bathrooms ? String(p.bathrooms) : "—")}
            />

            <Row
              label="Type"
              items={items}
              render={(p) =>
                propertyTypes.find((t) => t.slug === p.property_type)?.singular ??
                p.property_type
              }
            />

            <Row
              label="Possession"
              items={items}
              render={(p) => formatPossession(p.possession, p.possession_date)}
              winnerIds={readyNow}
              winnerNote="Ready"
            />

            <Row
              label="RERA"
              items={items}
              render={(p) =>
                p.rera_verified ? (
                  <span className="inline-flex items-center gap-1.5 text-verdant">
                    <Check className="size-3.5" strokeWidth={2.4} aria-hidden />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-ink-faint">
                    <Minus className="size-3.5" strokeWidth={2.4} aria-hidden />
                    Resale
                  </span>
                )
              }
            />

            <Row
              label="Locality"
              items={items}
              render={(p) => {
                const l = localityBySlug.get(p.locality_slug);
                return l ? (
                  <Link href={`/${l.city}/${l.slug}`} className="link-draw text-ink">
                    {l.name}
                  </Link>
                ) : (
                  p.locality_slug
                );
              }}
            />

            <Row
              label="Locality rate"
              items={items}
              render={(p) => {
                const l = localityBySlug.get(p.locality_slug);
                if (!l) return "—";
                return (
                  <span className="text-caption" data-numeric>
                    ₹{(l.pricePerSqft[0] / 1000).toFixed(1)}–
                    {(l.pricePerSqft[1] / 1000).toFixed(1)}K
                  </span>
                );
              }}
            />

            {/* Action row */}
            <tr>
              <th scope="row" className="border-t border-rule bg-bone px-3 py-4 text-left">
                <span className="sr-only">Actions</span>
              </th>
              {items.map((p) => (
                <td key={p.id} className="border-t border-l border-rule px-3 py-4">
                  <ButtonLink
                    href={`/property/${p.slug}`}
                    size="sm"
                    variant="outline"
                    fullWidth
                  >
                    View
                  </ButtonLink>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-8 max-w-prose text-[0.75rem] leading-relaxed text-ink-faint">
        The trophy marks the best value in each measurable row. Treat it as a
        starting point, not a verdict — ₹/sq.ft cannot see which way a flat
        faces, what floor it is on, how much light it gets in June, or whether
        the developer has delivered its last three projects on time. Those are
        the things that decide whether you are happy in five years, and they are
        the reason to talk to a person.
      </p>
    </div>
  );
}

function Row({
  label,
  items,
  render,
  winnerId,
  winnerIds,
  winnerNote,
}: {
  label: string;
  items: PropertyCard[];
  render: (p: PropertyCard) => React.ReactNode;
  winnerId?: string | null;
  winnerIds?: string[];
  winnerNote?: string;
}) {
  const isWinner = (id: string) =>
    (winnerId && winnerId === id) || (winnerIds && winnerIds.includes(id) && winnerIds.length < items.length);

  return (
    <tr>
      <th
        scope="row"
        className="border-t border-rule bg-bone px-3 py-3.5 text-left align-top font-mono text-[0.5625rem] leading-snug tracking-[0.12em] font-normal text-ink-muted uppercase"
      >
        {label}
      </th>

      {items.map((p) => (
        <td
          key={p.id}
          className={cn(
            "border-t border-l border-rule px-3 py-3.5 align-top text-[0.9375rem] text-ink-soft",
            isWinner(p.id) && "bg-brass-pale/40",
          )}
        >
          <span className="flex items-start gap-2">
            {render(p)}
            {isWinner(p.id) && winnerNote && (
              <span
                className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-[2px] bg-brass px-1.5 py-0.5 font-mono text-[0.5rem] tracking-[0.08em] text-paper uppercase"
                title={winnerNote}
              >
                <Trophy className="size-2.5" strokeWidth={2.2} aria-hidden />
                {winnerNote}
              </span>
            )}
          </span>
        </td>
      ))}
    </tr>
  );
}

function EmptyCompare() {
  return (
    <div className="relative overflow-hidden rounded-[2px] border border-rule bg-paper px-6 py-20 text-center">
      <div className="jaali absolute inset-0" aria-hidden />
      <div className="relative">
        <p className="eyebrow">Nothing to compare yet</p>
        <h2 className="mx-auto mt-4 max-w-md font-display text-h3">
          Add two or three homes and we will line them up.
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-muted">
          Use the scales icon on any listing to add it here. Comparing on
          ₹/sq.ft and carpet area side by side is the fastest way to see which
          one is actually the better buy.
        </p>
        <div className="mt-8">
          <ButtonLink href="/properties" size="lg">
            Browse listings
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
