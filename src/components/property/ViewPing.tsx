"use client";

import { useEffect } from "react";

import { isDemoMode } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/client";

/**
 * Increments a listing's view counter, once per session per listing.
 *
 * Why it is built this way:
 *   · It calls the `bump_property_view` RPC, which can only ever add 1 to one
 *     integer on a published row. The browser is never granted UPDATE on
 *     `properties`, so this is the entire write surface.
 *   · `sessionStorage` dedupes, so a visitor flicking back and forth between
 *     tabs does not inflate the number the client makes decisions on.
 *   · A 1.2s delay filters out bounces and prefetches, and failures are
 *     swallowed — an analytics counter must never surface an error to a
 *     buyer.
 */
export function ViewPing({ slug }: { slug: string }) {
  useEffect(() => {
    // No database to count against, and `createBrowserClient` throws on an
    // undefined URL — so skip entirely rather than error in the console on
    // every listing view.
    if (isDemoMode()) return;

    const key = `sbp:viewed:${slug}`;

    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      // Private mode. Fall through and count it — at worst we over-count by
      // one for a visitor whose browser blocks storage.
    }

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }

      void createClient()
        .rpc("bump_property_view", { p_slug: slug })
        .then(
          () => undefined,
          () => undefined,
        );
    }, 1200);

    return () => clearTimeout(timer);
  }, [slug]);

  return null;
}
