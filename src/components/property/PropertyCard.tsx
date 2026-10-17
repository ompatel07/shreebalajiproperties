import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, CalendarClock, MapPin, Maximize2, Sofa } from "lucide-react";

import { ShortlistButton } from "@/components/property/ShortlistButton";
import { furnitureOffer, hasFurnitureOffer, localityBySlug } from "@/config/site";
import { formatArea, formatBhk, formatPossession, formatPrice, pricePerSqft } from "@/lib/format";
import { blurPlaceholder, heroImageFor } from "@/lib/imagery";
import { listingAlt } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { PropertyCard as PropertyCardType } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LISTING CARD
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Laid out in the order a buyer scans a listing, which is not the order the
 * builder would write it in:
 *
 *   1. the photograph
 *   2. the PRICE — first, largest, with ₹/sq.ft beside it, because ₹/sq.ft is
 *      the only number that compares two areas honestly
 *   3. what it is, and where
 *   4. bedrooms · bathrooms · carpet area, as icon chips you read at a glance
 *
 * Carpet area is labelled as carpet. RERA mandates it, and quoting super
 * built-up without saying so is the oldest trick in Indian property.
 *
 * A contained card on white. The previous "plate on the page ground" with
 * small-caps metadata was the magazine look the client read as a template.
 *
 * A server component: only the shortlist heart is client-side, so a grid of
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
  /** Kept for callers that still pass it; every card now shares one layout. */
  size?: "default" | "large" | "compact";
  className?: string;
}) {
  const locality = localityBySlug.get(property.locality_slug);
  const localityName = locality?.name ?? property.locality_slug;
  const area = property.carpet_sqft ?? property.super_sqft ?? property.plot_sqft;
  const areaKind = property.carpet_sqft ? "carpet" : property.plot_sqft ? "plot" : "built-up";
  const large = size === "large";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl bg-paper ring-1 ring-rule transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_-22px_rgba(18,17,16,0.35)] hover:ring-rule-strong",
        className,
      )}
    >
      {/* ── Photograph ─────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <Image
          src={heroImageFor(property, large ? 1200 : 720)}
          alt={listingAlt(property, localityName)}
          fill
          sizes={large ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 32vw"}
          className="object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.05]"
          placeholder="blur"
          blurDataURL={blurPlaceholder()}
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />

        <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {property.is_exclusive && <Chip tone="ink">Exclusive</Chip>}
            {property.status === "under_offer" && <Chip tone="alert">Under offer</Chip>}
            {property.rera_verified ? <Chip tone="verdant">RERA verified</Chip> : <Chip tone="light">Resale</Chip>}
          </div>
          <ShortlistButton slug={property.slug} title={property.title} />
        </div>

        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-paper/95 px-2.5 py-1 text-[0.75rem] font-semibold text-ink shadow-sm">
          <CalendarClock className="size-3.5 text-brass" strokeWidth={2.2} aria-hidden />
          {formatPossession(property.possession, property.possession_date)}
        </span>

        {hasFurnitureOffer(property.property_type) && (
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-brass-light px-2.5 py-1 text-[0.75rem] font-bold text-ink shadow-sm">
            <Sofa className="size-3.5" strokeWidth={2.2} aria-hidden />
            {furnitureOffer.short}
          </span>
        )}
      </div>

      {/* ── Details ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4 lg:p-5">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <p className="text-[1.375rem] leading-none font-extrabold tracking-[-0.025em] text-ink" data-numeric>
            {property.price_on_request ? "Price on request" : formatPrice(property.price)}
          </p>
          {property.price && area && !property.price_on_request && (
            <p className="text-[0.8125rem] font-semibold text-brass tabular-nums" data-numeric>
              {pricePerSqft(property.price, area)}
            </p>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 text-[0.9375rem] leading-snug font-semibold text-ink">
          <Link href={`/property/${property.slug}`} className="hover:text-brass">
            {/* Whole-card click target without nesting interactive elements. */}
            <span className="absolute inset-0 z-10" aria-hidden />
            {property.title}
          </Link>
        </h3>

        <p className="mt-1 flex items-center gap-1 text-[0.8125rem] text-ink-muted">
          <MapPin className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          <span className="truncate">
            {localityName}, {property.city === "ahmedabad" ? "Ahmedabad" : "Gandhinagar"}
          </span>
        </p>

        <ul className="mt-auto flex flex-wrap gap-1.5 pt-4" aria-label="Key details">
          {property.bhk ? <Spec icon={BedDouble}>{formatBhk(property.bhk)}</Spec> : null}
          {property.bathrooms ? <Spec icon={Bath}>{property.bathrooms} bath</Spec> : null}
          {area ? (
            <Spec icon={Maximize2}>
              {formatArea(area)} <span className="font-normal text-ink-faint">{areaKind}</span>
            </Spec>
          ) : null}
        </ul>
      </div>
    </article>
  );
}

function Spec({ icon: Icon, children }: { icon: typeof Bath; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-lg bg-bone px-2.5 py-1.5 text-[0.75rem] font-semibold text-ink-soft tabular-nums ring-1 ring-rule">
      <Icon className="size-3.5 text-ink-faint" strokeWidth={2} aria-hidden />
      {children}
    </li>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone: "ink" | "alert" | "verdant" | "light" }) {
  const tones = {
    ink: "bg-ink text-white",
    alert: "bg-alert text-white",
    verdant: "bg-verdant text-white",
    light: "bg-paper/90 text-ink-soft",
  } as const;
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[0.6875rem] font-bold shadow-sm", tones[tone])}>
      {children}
    </span>
  );
}

/** Loading skeleton. Matches the card's geometry to avoid any shift. */
export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-paper ring-1 ring-rule">
      <div className="shimmer aspect-[4/3]" />
      <div className="space-y-3 p-4">
        <div className="shimmer h-6 w-28 rounded" />
        <div className="shimmer h-4 w-4/5 rounded" />
        <div className="shimmer h-3 w-32 rounded" />
        <div className="flex gap-1.5 pt-2">
          <div className="shimmer h-7 w-16 rounded-lg" />
          <div className="shimmer h-7 w-16 rounded-lg" />
          <div className="shimmer h-7 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
