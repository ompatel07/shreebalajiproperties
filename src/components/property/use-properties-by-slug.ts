"use client";

import { useEffect, useState } from "react";

import { demoProperties, isDemoMode } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/client";
import type { PropertyCard } from "@/types/db";

/**
 * Hydrate the shortlist / compare tray from slugs held in localStorage.
 *
 * Fetched client-side with the anon key, which is safe and correct here:
 *   · RLS still applies, so only published listings come back — a stale slug
 *     for something since taken off-market simply returns nothing.
 *   · The slug list lives only on the device, so there is nothing for a
 *     server component to render anyway.
 *   · These pages are intentionally `noindex` (they are per-visitor state),
 *     so losing server rendering costs no SEO.
 *
 * Results are reordered to match the stored sequence, because the order a
 * visitor saved things in is meaningful to them and PostgREST will not
 * preserve it.
 */
export function usePropertiesBySlug(slugs: string[], ready: boolean) {
  const [items, setItems] = useState<PropertyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Join the list so the effect re-runs on content change, not identity.
  const key = slugs.join(",");

  useEffect(() => {
    if (!ready) return;

    const list = key ? key.split(",") : [];

    if (list.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    // Demo mode: resolve from the same fixtures the server uses, so the
    // shortlist and compare tray work before Supabase is connected. Reads
    // NEXT_PUBLIC_SUPABASE_URL, which is available in the browser.
    if (isDemoMode()) {
      const bySlug = new Map(demoProperties.map((r) => [r.slug, r]));
      setItems(list.map((s) => bySlug.get(s)).filter((r): r is PropertyCard => Boolean(r)));
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      const { data, error: queryError } = await createClient()
        .from("properties")
        .select(
          `id, slug, title, city, locality_slug, category, property_type,
           transaction, status, bhk, bathrooms, carpet_sqft, super_sqft,
           plot_sqft, price, price_on_request, possession, possession_date,
           rera_verified, hero_image, is_featured, is_exclusive, lat, lng,
           view_count`,
        )
        .in("slug", list.slice(0, 50))
        .in("status", ["published", "under_offer"]);

      if (cancelled) return;

      if (queryError) {
        setError("We could not load your saved homes just now.");
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as unknown as PropertyCard[];
      const bySlug = new Map(rows.map((r) => [r.slug, r]));

      // Preserve the visitor's own ordering.
      setItems(list.map((s) => bySlug.get(s)).filter((r): r is PropertyCard => Boolean(r)));
      setError(null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [key, ready]);

  return { items, loading, error };
}
