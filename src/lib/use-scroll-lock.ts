"use client";

import { useEffect } from "react";

/**
 * Freeze the page behind a drawer, sheet or lightbox — on iPhone too.
 *
 * `body { overflow: hidden }` alone is ignored by iOS Safari for touch
 * scrolling, so the page slid around under the open menu. The reliable
 * technique pins the body with `position: fixed` at the current scroll
 * offset, then restores that offset on release. Locks are counted, so two
 * overlays (e.g. filters opened from a page whose menu just closed) cannot
 * release each other's lock.
 */
let locks = 0;
let savedY = 0;

function lock() {
  if (locks++ > 0) return;
  savedY = window.scrollY;
  const b = document.body.style;
  b.position = "fixed";
  b.top = `-${savedY}px`;
  b.left = "0";
  b.right = "0";
  b.width = "100%";
  document.documentElement.style.overflow = "hidden";
}

function unlock() {
  if (locks === 0 || --locks > 0) return;
  const b = document.body.style;
  b.position = "";
  b.top = "";
  b.left = "";
  b.right = "";
  b.width = "";
  document.documentElement.style.overflow = "";
  // `scroll-behavior: smooth` on <html> would animate this jump back.
  window.scrollTo({ top: savedY, behavior: "instant" as ScrollBehavior });
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
