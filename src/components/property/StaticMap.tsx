"use client";

import dynamic from "next/dynamic";

import type { PropertyCard } from "@/types/db";

/**
 * Client-only wrapper for the Leaflet map.
 *
 * Leaflet touches `window` at module scope, so it cannot be imported during
 * SSR — `ssr: false` is required, not a preference. That also means `dynamic`
 * has to be called from a Client Component, which is the only reason this
 * file exists as a separate layer.
 *
 * The loading state matches the map's final height exactly so the page does
 * not shift when the tiles arrive.
 */
const PropertyMap = dynamic(
  () => import("@/components/property/PropertyMap").then((m) => m.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-[24rem] w-full overflow-hidden rounded-[2px] border border-rule bg-sand">
        <div className="jaali absolute inset-0" aria-hidden />
        <p className="absolute inset-0 grid place-items-center font-semibold text-micro tracking-[0.14em] text-ink-faint uppercase">
          Loading map…
        </p>
      </div>
    ),
  },
);

type MinimalProperty = Pick<
  PropertyCard,
  "id" | "slug" | "title" | "lat" | "lng" | "price" | "price_on_request" | "locality_slug" | "bhk" | "carpet_sqft"
>;

export function StaticMap({ property }: { property: MinimalProperty }) {
  if (property.lat == null || property.lng == null) return null;

  return (
    <PropertyMap
      properties={[property as PropertyCard]}
      center={{ lat: property.lat, lng: property.lng }}
      zoom={15}
      height="24rem"
      interactive
    />
  );
}

/** Full-page map view. Same component, different framing. */
export function SearchMap({
  properties,
  onSelect,
  height = "calc(100svh - 4.75rem)",
}: {
  properties: PropertyCard[];
  onSelect?: (slug: string) => void;
  height?: string;
}) {
  return (
    <PropertyMap
      properties={properties}
      height={height}
      interactive
      onSelect={onSelect}
    />
  );
}
