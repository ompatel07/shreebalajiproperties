"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect, useRef } from "react";

import { formatPrice } from "@/lib/format";
import type { PropertyCard } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MAP — Leaflet + OpenStreetMap
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Google Maps JS API needs a billing-enabled key, so this uses Leaflet with
 * CARTO's light raster tiles (OSM data). Free, no key, no quota, and the
 * muted basemap suits the palette far better than Google's default styling —
 * the tiles are desaturated further in `globals.css` so the brass price pins
 * are the only saturated thing on screen.
 *
 * Driven imperatively rather than through react-leaflet: one dependency
 * fewer, and no wrapper-library churn across React versions. The map instance
 * is created once and the marker layer is swapped when `properties` changes.
 *
 * Attribution is a licence requirement for OSM data, not a courtesy —
 * `attributionControl` stays on.
 */
export function PropertyMap({
  properties,
  center = { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
  zoom = 11,
  height = "32rem",
  interactive = true,
  onSelect,
}: {
  properties: PropertyCard[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  interactive?: boolean;
  onSelect?: (slug: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // ── Create once ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: interactive,
      scrollWheelZoom: false, // never hijack page scroll
      dragging: interactive,
      doubleClickZoom: interactive,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
      detectRetina: true,
    }).addTo(map);

    // Ctrl/⌘ + wheel zooms, which keeps the page scrollable over the map.
    if (interactive) {
      map.getContainer().addEventListener("wheel", (e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          map.scrollWheelZoom.enable();
        } else {
          map.scrollWheelZoom.disable();
        }
      });
    }

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [center.lat, center.lng, zoom, interactive]);

  // ── Re-render markers when the result set changes ──────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const points: L.LatLngExpression[] = [];

    for (const p of properties) {
      if (p.lat == null || p.lng == null) continue;
      points.push([p.lat, p.lng]);

      // The pin IS the price — a buyer scanning a map wants the number, not
      // a teardrop they have to click.
      const label = p.price_on_request ? "On req." : formatPrice(p.price);

      const marker = L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: "sbp-pin",
          html: `<span class="sbp-pin__label">${escapeHtml(label)}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
        title: p.title,
        keyboard: true,
        alt: p.title,
      });

      marker.bindPopup(popupHtml(p), {
        closeButton: true,
        maxWidth: 260,
        className: "sbp-popup",
      });

      if (onSelect) marker.on("click", () => onSelect(p.slug));

      marker.addTo(layer);
    }

    // Frame the results, but never zoom so far in that context is lost.
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 14 });
    } else if (points.length === 1) {
      map.setView(points[0]!, 15);
    }
  }, [properties, onSelect]);

  return (
    <>
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full overflow-hidden rounded-[2px] border border-rule bg-sand"
        role="application"
        aria-label={`Map showing ${properties.length} properties`}
      />

      {/*
        Pin styling. Scoped, injected once with the component, and kept here
        rather than in globals.css because it only makes sense alongside the
        divIcon markup above.
      */}
      <style>{`
        .sbp-pin { background: none; border: none; }
        .sbp-pin__label {
          position: absolute;
          transform: translate(-50%, -100%);
          white-space: nowrap;
          background: var(--color-ink);
          color: var(--color-bone);
          font-family: var(--font-mono), monospace;
          font-size: 0.6875rem;
          letter-spacing: 0.04em;
          font-variant-numeric: tabular-nums;
          padding: 0.3rem 0.55rem;
          border-radius: 2px;
          box-shadow: 0 2px 10px rgba(22,21,15,0.3);
          cursor: pointer;
          transition: background-color 0.25s, transform 0.25s;
        }
        .sbp-pin__label::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -4px;
          width: 7px; height: 7px;
          background: inherit;
          transform: translateX(-50%) rotate(45deg);
        }
        .sbp-pin:hover .sbp-pin__label,
        .sbp-pin:focus-visible .sbp-pin__label {
          background: var(--color-brass);
          transform: translate(-50%, -100%) scale(1.06);
          z-index: 500;
        }
        .sbp-popup .leaflet-popup-content-wrapper {
          border-radius: 2px;
          box-shadow: 0 8px 32px rgba(22,21,15,0.18);
          background: var(--color-paper);
        }
        .sbp-popup .leaflet-popup-content { margin: 0; width: auto !important; }
        .sbp-popup .leaflet-popup-tip { background: var(--color-paper); }
      `}</style>
    </>
  );
}

/**
 * Popup markup is assembled as an HTML string because that is Leaflet's API.
 * Every interpolated value therefore MUST go through `escapeHtml` — a listing
 * title comes from the database and is attacker-influenced if an admin
 * account is ever compromised.
 */
function popupHtml(p: PropertyCard): string {
  const price = p.price_on_request ? "Price on request" : formatPrice(p.price);
  const bits = [
    p.bhk ? `${p.bhk} BHK` : null,
    p.carpet_sqft ? `${p.carpet_sqft} sq.ft carpet` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return `
    <div style="font-family: var(--font-sans), sans-serif; padding: 0.9rem 1rem;">
      <p style="margin:0;font-family:var(--font-mono),monospace;font-size:0.5625rem;letter-spacing:0.14em;text-transform:uppercase;color:#6e685c;">
        ${escapeHtml(p.locality_slug.replace(/-/g, " "))}
      </p>
      <p style="margin:0.4rem 0 0;font-family:var(--font-display),serif;font-size:1rem;line-height:1.3;color:#16150f;">
        ${escapeHtml(p.title)}
      </p>
      <p style="margin:0.5rem 0 0;font-family:var(--font-display),serif;font-size:1.0625rem;color:#a3762c;">
        ${escapeHtml(price)}
      </p>
      ${bits ? `<p style="margin:0.25rem 0 0;font-size:0.75rem;color:#6e685c;">${escapeHtml(bits)}</p>` : ""}
      <a href="/property/${encodeURIComponent(p.slug)}"
         style="display:inline-block;margin-top:0.75rem;font-family:var(--font-mono),monospace;font-size:0.5625rem;letter-spacing:0.14em;text-transform:uppercase;color:#16150f;border-bottom:1px solid #a3762c;padding-bottom:1px;">
        View details
      </a>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
