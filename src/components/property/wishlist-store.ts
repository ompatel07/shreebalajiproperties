"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHORTLIST & COMPARE — client-side, deliberately
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Both live in `localStorage`, not in Postgres. That is a design decision,
 * not a shortcut:
 *
 *   · No account needed. Forcing a signup before someone can save a flat is
 *     the single biggest drop-off point on Indian property portals.
 *   · No rows, no auth, no egress — it stays free on the Supabase free tier.
 *   · Nothing personal leaves the device until the visitor chooses to send
 *     their shortlist to an advisor, which is an explicit action.
 *
 * The trade-off is honest and worth stating: a shortlist does not follow the
 * visitor to another device. The "send my shortlist on WhatsApp" action is
 * what bridges that, and it converts better than an account prompt anyway.
 *
 * Cross-component sync uses a window event rather than React context so that
 * any card anywhere on the page updates when one of them toggles, without
 * wrapping the whole tree in a provider.
 */

const WISHLIST_KEY = "sbp:shortlist:v1";
const COMPARE_KEY = "sbp:compare:v1";
const SYNC_EVENT = "sbp:store-sync";

/** Compare tables stop being readable past four columns. */
export const COMPARE_LIMIT = 4;

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Storage is user-writable, so validate rather than trust the shape.
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string").slice(0, 200)
      : [];
  } catch {
    // Private mode, blocked storage, or corrupt JSON. Behave as empty.
    return [];
  }
}

function write(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or privacy mode. The in-memory state still works for this page.
  }
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key } }));
}

/** Shared subscription logic for both stores. */
function useStore(key: string) {
  // Always start empty so the server HTML and the first client render agree;
  // the real value is loaded in the effect below. Seeding from localStorage
  // during render would be a hydration mismatch.
  const [items, setItems] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read(key));
    setReady(true);

    const sync = () => setItems(read(key));

    window.addEventListener(SYNC_EVENT, sync);
    // `storage` fires for the *other* tabs, keeping duplicates in step.
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(SYNC_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);

  return { items, setItems, ready };
}

export function useWishlist() {
  const { items, ready } = useStore(WISHLIST_KEY);

  const toggle = useCallback((slug: string) => {
    const current = read(WISHLIST_KEY);
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [slug, ...current].slice(0, 200);
    write(WISHLIST_KEY, next);
    return next.includes(slug);
  }, []);

  const remove = useCallback((slug: string) => {
    write(
      WISHLIST_KEY,
      read(WISHLIST_KEY).filter((s) => s !== slug),
    );
  }, []);

  const clear = useCallback(() => write(WISHLIST_KEY, []), []);

  return {
    items,
    count: items.length,
    ready,
    has: (slug: string) => items.includes(slug),
    toggle,
    remove,
    clear,
  };
}

export function useCompare() {
  const { items, ready } = useStore(COMPARE_KEY);

  const toggle = useCallback((slug: string): { added: boolean; full: boolean } => {
    const current = read(COMPARE_KEY);

    if (current.includes(slug)) {
      write(
        COMPARE_KEY,
        current.filter((s) => s !== slug),
      );
      return { added: false, full: false };
    }

    if (current.length >= COMPARE_LIMIT) {
      return { added: false, full: true };
    }

    write(COMPARE_KEY, [...current, slug]);
    return { added: true, full: false };
  }, []);

  const remove = useCallback((slug: string) => {
    write(
      COMPARE_KEY,
      read(COMPARE_KEY).filter((s) => s !== slug),
    );
  }, []);

  const clear = useCallback(() => write(COMPARE_KEY, []), []);

  return {
    items,
    count: items.length,
    ready,
    isFull: items.length >= COMPARE_LIMIT,
    has: (slug: string) => items.includes(slug),
    toggle,
    remove,
    clear,
  };
}
