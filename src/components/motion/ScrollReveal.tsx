"use client";

import { useEffect } from "react";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCROLL REVEAL — one observer for the whole page
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Mounted once in the root layout. It finds every `[data-reveal]` and
 * `[data-reveal-group]` element, watches them with a SINGLE
 * IntersectionObserver, and sets `data-in="1"` when they enter. The
 * transitions themselves are pure CSS (see globals.css).
 *
 * Why it is built this way:
 *
 *   · **No animation library.** This replaced framer-motion across the whole
 *     site — about 50 kB gzipped off every single page.
 *   · **Reveal components stay server-rendered.** They emit a `div` with a
 *     data attribute and ship zero JavaScript of their own, so a grid of
 *     twelve cards costs nothing.
 *   · **One observer, not one per element.** A page with 80 revealed elements
 *     creates 1 observer instead of 80.
 *   · **Unobserve after firing.** Everything animates once; re-triggering on
 *     scroll-up is nausea-inducing and makes long pages feel unstable.
 *
 * A MutationObserver picks up nodes added later (client-side navigation,
 * filter results), so this works without re-mounting per route.
 */
export function ScrollReveal() {
  useEffect(() => {
    const SELECTOR = "[data-reveal],[data-reveal-group],.lines,.draw-rule,.clip-reveal";

    // Respect the OS setting by showing the final state immediately.
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        el.dataset.in = "1";
      });
      return;
    }

    // Older browsers: reveal everything rather than leave it invisible.
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        el.dataset.in = "1";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "1";
          observer.unobserve(entry.target);
        }
      },
      {
        // Fire slightly before the element is fully on screen, and treat
        // anything already past the fold as visible.
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      },
    );

    const seen = new WeakSet<Element>();

    const register = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (seen.has(el) || el.dataset.in === "1") return;
        seen.add(el);

        // Anything already in view on first paint is revealed without a
        // transition, so above-the-fold content is never briefly invisible.
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
          el.dataset.in = "1";
          return;
        }

        observer.observe(el);
      });
    };

    register(document);

    // Catch elements added by client navigation or re-rendered lists.
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) register(node as Element);
        }
      }
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
