import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { ShortlistButton } from "@/components/property/ShortlistButton";
import { localityBySlug } from "@/config/site";
import { formatArea, formatBhk, formatPossession, formatPrice, pricePerSqft } from "@/lib/format";
import { blurPlaceholder, heroImageFor } from "@/lib/imagery";
import { listingAlt } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { PropertyCard as PropertyCardType } from "@/types/db";

/**
 * The listing card.
 *
 * ── Why it has no box ────────────────────────────────────────────────────
 * It used to be a bordered white card with a shadow on hover. That is the
 * most recognisable component on the commercial web and it was the main
 * reason the grids read as a template. Now it is a photograph with type set
 * beneath it on the page ground — the way a magazine sets a plate. The frame
 * is a single hairline under the image, not a container around everything.
 *
 * ── Decisions earned from how buyers scan ────────────────────────────────
 *   · **₹/sq.ft sits next to the price.** The only number that lets a buyer
 *     compare two localities honestly, and most portals bury it a click in.
 *   · **Carpet area, labelled as carpet.** RERA mandates carpet; quoting
 *     super built-up without saying so is the oldest trick in Indian real
 *     estate and we do not play it.
 *   · **Possession is on the card.** It changes the financing conversation
 *     entirely, so it belongs in the scan.
 *
 * A server component. Only the shortlist heart is client-side, so a grid of
 * twelve costs essentially no JavaScript.
 */
export function PropertyCard({
  property,
  priority = false,
  size = "default",
  className,
}: {
  property: PropertyCardType;
  /** Set on the first row only — these are the LCP candidates. */
  priority?: boolean;
  /** `large` is used as the lead plate in asymmetric grids. */
  size?: "default" | "large" | "compact";
  className?: string;
}) {
  const locality = localityBySlug.get(property.locality_slug);
  const localityName = locality?.name ?? property.locality_slug;
  const area = property.carpet_sqft ?? property.super_sqft ?? property.plot_sqft;

  const isLarge = size === "large";

  return (
    <article className={cn("group relative flex flex-col", className)}>
      {/* ── Plate ──────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative overflow-hidden bg-sand",
          isLarge ? "aspect-[4/3] lg:aspect-[16/11]" : size === "compact" ? "aspect-[16/11]" : "aspect-[4/3]",
        )}
      >
        <Image
          src={heroImageFor(property, isLarge ? 1400 : 760)}
          alt={listingAlt(property, localityName)}
          fill
          sizes={
            isLarge
              ? "(max-width: 1024px) 100vw, 58vw"
              : "(max-width: 640px) 86vw, (max-width: 1024px) 50vw, 32vw"
          }
          className="photo-warm object-cover transition-transform duration-[1.3s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          placeholder="blur"
          blurDataURL={blurPlaceholder()}
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />

        {/* Scrim only behind the chips, so the photo stays clean. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/45 to-transparent"
          aria-hidden
        />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {property.is_exclusive && <Chip tone="ink">Exclusive</Chip>}
            {property.status === "under_offer" && <Chip tone="alert">Under offer</Chip>}
            {property.rera_verified ? (
              <Chip tone="verdant">RERA ✓</Chip>
            ) : (
              <Chip tone="glass">Resale</Chip>
            )}
          </div>

          <ShortlistButton slug={property.slug} title={property.title} />
        </div>

        {/* Possession, bottom-left on the image — scannable without reading. */}
        <span className="absolute bottom-3 left-3 bg-bone/92 px-2.5 py-1 font-semibold text-[0.6875rem] tracking-[0.12em] text-ink uppercase backdrop-blur-sm">
          {formatPossession(property.possession, property.possession_date)}
        </span>
      </div>

      {/* ── Type, set on the page ground ───────────────────────────────── */}
      <div className="flex flex-1 flex-col border-t border-rule pt-4">
        <p className="flex items-center gap-1.5 font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
          <MapPin className="size-2.5" strokeWidth={2} aria-hidden />
          {localityName}
          <span className="text-ink-faint">
            · {property.city === "ahmedabad" ? "Ahmedabad" : "Gandhinagar"}
          </span>
        </p>

        <h3
          className={cn(
            "mt-2 font-display leading-snug text-ink",
            isLarge ? "text-h3" : "text-[1.125rem]",
          )}
        >
          <Link href={`/property/${property.slug}`} className="link-draw">
            {/* Whole-plate click target without nesting interactive elements. */}
            <span className="absolute inset-0 z-10" aria-hidden />
            {property.title}
          </Link>
        </h3>

        {/* Price + the comparable rate */}
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p
              className={cn("font-display leading-none text-ink", isLarge ? "text-h3" : "text-h4")}
              data-numeric
            >
              {property.price_on_request ? "On request" : formatPrice(property.price)}
            </p>
            {property.price && area && (
              <p className="font-mono text-[0.625rem] tracking-[0.06em] text-brass" data-numeric>
                {pricePerSqft(property.price, area)}
              </p>
            )}
          </div>

          {/* One monospace spec line rather than a row of icon chips. */}
          <p className="mt-2 font-mono text-[0.625rem] tracking-[0.08em] text-ink-muted" data-numeric>
            {[
              property.bhk ? formatBhk(property.bhk) : null,
              property.bathrooms ? `${property.bathrooms} bath` : null,
              area
                ? `${formatArea(area)} ${
                    property.carpet_sqft ? "carpet" : property.plot_sqft ? "plot" : "built-up"
                  }`
                : null,
            ]
              .filter(Boolean)
              .join("  ·  ")}
          </p>
        </div>
      </div>
    </article>
  );
}

function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "ink" | "alert" | "verdant" | "glass";
}) {
  const tones = {
    ink: "bg-ink text-bone",
    alert: "bg-alert text-paper",
    verdant: "bg-verdant text-paper",
    glass: "bg-bone/85 text-ink-muted backdrop-blur-sm",
  } as const;

  return (
    <span
      className={cn(
        "px-2 py-0.5 font-semibold text-[0.6875rem] tracking-[0.12em] uppercase",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Loading skeleton. Matches the card's geometry to avoid any shift. */
export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="shimmer aspect-[4/3]" />
      <div className="space-y-3 border-t border-rule pt-4">
        <div className="shimmer h-2 w-24 rounded-[1px]" />
        <div className="shimmer h-4 w-4/5 rounded-[1px]" />
        <div className="shimmer h-6 w-28 rounded-[1px]" />
        <div className="shimmer h-2.5 w-40 rounded-[1px]" />
      </div>
    </div>
  );
}
