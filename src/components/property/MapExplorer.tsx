"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { MapPin, SlidersHorizontal } from "lucide-react";

import { SearchMap } from "@/components/property/StaticMap";
import { budgetBands, localityBySlug, propertyTypes, zoneLabels, type Zone } from "@/config/site";
import { formatArea, formatBhk, formatPrice, pricePerSqft } from "@/lib/format";
import { blurPlaceholder, heroImageFor } from "@/lib/imagery";
import { cn } from "@/lib/utils";
import type { PropertyCard } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MAP EXPLORER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Split view: filterable list on the left, map on the right. Selecting a pin
 * scrolls its card into view and vice versa, which is the interaction that
 * makes a map search actually usable.
 *
 * All filtering happens in memory on a capped set (300 listings) rather than
 * re-querying on every pan. That is a real decision about the free tier: a
 * viewport-driven query would fire on every map move and burn Supabase egress
 * for no benefit at this catalogue size. If inventory ever passes a few
 * thousand, this becomes a PostGIS bounding-box query — but not before.
 */
export function MapExplorer({ properties }: { properties: PropertyCard[] }) {
  const [zone, setZone] = useState<Zone | "all">("all");
  const [type, setType] = useState<string>("all");
  const [band, setBand] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (zone !== "all") {
        const locality = localityBySlug.get(p.locality_slug);
        if (!locality || locality.zone !== zone) return false;
      }
      if (type !== "all" && p.property_type !== type) return false;
      if (band !== "all") {
        const b = budgetBands.find((x) => x.slug === band);
        if (b && p.price) {
          if (p.price < b.min) return false;
          if (b.max !== null && p.price > b.max) return false;
        } else if (b) {
          return false; // price-on-request cannot satisfy a band
        }
      }
      return true;
    });
  }, [properties, zone, type, band]);

  /** Pin click → scroll the matching card into view and highlight it. */
  const onSelect = (slug: string) => {
    setSelected(slug);
    const node = listRef.current?.querySelector<HTMLElement>(`[data-slug="${slug}"]`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="lg:grid lg:h-[calc(100svh-4.75rem)] lg:grid-cols-[26rem_1fr] xl:grid-cols-[30rem_1fr]">
      {/* ══ List panel ══════════════════════════════════════════════════ */}
      <div className="flex flex-col border-r border-rule bg-bone lg:overflow-hidden">
        {/* Filters — one row, above the content. */}
        <div className="shrink-0 border-b border-rule px-5 py-4">
          <p className="flex items-center gap-2 font-mono text-[0.5625rem] tracking-[0.14em] text-ink-muted uppercase">
            <SlidersHorizontal className="size-3" strokeWidth={2} aria-hidden />
            {filtered.length} of {properties.length} plotted
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <FilterSelect
              label="Corridor"
              value={zone}
              onChange={(v) => setZone(v as Zone | "all")}
            >
              <option value="all">All</option>
              {(Object.keys(zoneLabels) as Zone[]).map((z) => (
                <option key={z} value={z}>
                  {zoneLabels[z]}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect label="Type" value={type} onChange={setType}>
              <option value="all">All</option>
              {propertyTypes.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect label="Budget" value={band} onChange={setBand}>
              <option value="all">Any</option>
              {budgetBands.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.label}
                </option>
              ))}
            </FilterSelect>
          </div>
        </div>

        {/* Result list */}
        <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="eyebrow">No pins match</p>
              <p className="mt-3 text-[0.9375rem] text-ink-muted">
                Widen the corridor or the budget to see more.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-rule">
              {filtered.map((p) => {
                const locality = localityBySlug.get(p.locality_slug);
                const area = p.carpet_sqft ?? p.super_sqft ?? p.plot_sqft;

                return (
                  <li key={p.id} data-slug={p.slug}>
                    <Link
                      href={`/property/${p.slug}`}
                      onMouseEnter={() => setSelected(p.slug)}
                      className={cn(
                        "flex gap-4 p-4 transition-colors",
                        selected === p.slug ? "bg-brass-pale/50" : "hover:bg-sand",
                      )}
                    >
                      <div className="relative size-24 shrink-0 overflow-hidden rounded-[2px] bg-sand">
                        <Image
                          src={heroImageFor(p, 300)}
                          alt={p.title}
                          fill
                          sizes="96px"
                          placeholder="blur"
                          blurDataURL={blurPlaceholder()}
                          className="photo-warm object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 font-mono text-[0.5rem] tracking-[0.12em] text-ink-muted uppercase">
                          <MapPin className="size-2.5" strokeWidth={2} aria-hidden />
                          {locality?.name ?? p.locality_slug}
                        </p>

                        <p className="mt-1 line-clamp-2 font-display text-[0.9375rem] leading-snug text-ink">
                          {p.title}
                        </p>

                        <p className="mt-1.5 font-display text-[1.0625rem] text-ink" data-numeric>
                          {p.price_on_request ? "On request" : formatPrice(p.price)}
                        </p>

                        <p className="mt-0.5 font-mono text-[0.5625rem] tracking-[0.06em] text-ink-faint">
                          {[
                            p.bhk ? formatBhk(p.bhk) : null,
                            area ? formatArea(area) : null,
                            p.price && area ? pricePerSqft(p.price, area) : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ══ Map panel ═══════════════════════════════════════════════════ */}
      <div className="relative h-[70svh] lg:h-full">
        <SearchMap properties={filtered} onSelect={onSelect} height="100%" />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="truncate font-mono text-[0.5rem] tracking-[0.14em] text-ink-faint uppercase">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 cursor-pointer truncate rounded-[2px] border border-rule-strong bg-paper px-2 py-2 text-[0.75rem] text-ink focus:border-brass focus:outline-none sm:text-[0.8125rem]"
      >
        {children}
      </select>
    </label>
  );
}
