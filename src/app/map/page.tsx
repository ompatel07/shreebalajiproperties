import type { Metadata } from "next";

import { MapExplorer } from "@/components/property/MapExplorer";
import { site } from "@/config/site";
import { getMapListings } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

/**
 * Map search.
 *
 * ISR, because the pin set changes only when inventory does. The filtering
 * on top is client-side, so a cached payload still gives an instant,
 * fully interactive map.
 */
export const revalidate = 900;

export const metadata: Metadata = pageMeta({
  title: `Property Map — Ahmedabad & Gandhinagar | ${site.name}`,
  description:
    "Every listing we hold, plotted across Ahmedabad and Gandhinagar. Filter by corridor, property type and budget to see what each area actually costs.",
  path: "/map",
});

export default async function MapPage() {
  const properties = await getMapListings(300);

  return (
    <div className="pt-16 lg:pt-[4.75rem]">
      {/* Visually compact header — the map is the content. */}
      <div className="border-b border-rule bg-sand">
        <div className="shell py-5">
          <h1 className="font-display text-h4 text-ink">
            Property map
            <span className="ml-3 font-semibold text-micro tracking-[0.12em] text-ink-muted uppercase">
              Ahmedabad · Gandhinagar
            </span>
          </h1>
        </div>
      </div>

      <MapExplorer properties={properties} />
    </div>
  );
}
