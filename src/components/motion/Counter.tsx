"use client";

import { useEffect, useRef, useState } from "react";

import { groupIndian } from "@/lib/format";

/**
 * Count-up for the trust rails.
 *
 * Driven by `requestAnimationFrame` writing straight to the DOM text node —
 * animating a React state value at 60fps would re-render the subtree sixty
 * times a second for a number nobody interacts with.
 *
 * The final value is also the server-rendered value, so a crawler and a
 * reduced-motion visitor both see the real figure rather than a row of zeroes.
 */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  duration = 1800,
  grouped = true,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  grouped?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || done) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      setDone(true);
      return;
    }

    let frame = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        observer.disconnect();
        const start = performance.now();

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // easeOutExpo — settles fast, so the final value is readable early.
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          const current = Math.round(value * eased);

          node.textContent = grouped ? groupIndian(current) : String(current);

          if (t < 1) frame = requestAnimationFrame(tick);
          else setDone(true);
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration, grouped, done]);

  const text = grouped ? groupIndian(value) : String(value);

  return (
    <span data-numeric className="inline-flex items-baseline tabular-nums">
      {prefix}
      {/* Server renders the real figure; the effect animates up to it. */}
      <span ref={ref}>{text}</span>
      {suffix}
    </span>
  );
}
