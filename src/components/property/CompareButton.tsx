"use client";

import { useState } from "react";
import { Scale } from "lucide-react";

import { COMPARE_LIMIT, useCompare } from "@/components/property/wishlist-store";
import { cn } from "@/lib/utils";

/**
 * Add-to-compare toggle.
 *
 * When the tray is already full it shows an inline reason rather than
 * silently doing nothing — a dead button with no explanation is the most
 * common way this feature gets abandoned.
 */
export function CompareButton({
  slug,
  variant = "icon",
}: {
  slug: string;
  variant?: "icon" | "full";
}) {
  const { has, toggle, ready } = useCompare();
  const [notice, setNotice] = useState<string | null>(null);
  const active = has(slug);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { full } = toggle(slug);
    if (full) {
      setNotice(`Comparing ${COMPARE_LIMIT} already — remove one first`);
      setTimeout(() => setNotice(null), 2600);
    }
  };

  if (variant === "full") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={onClick}
          aria-pressed={ready ? active : undefined}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-[2px] border px-4 py-3 font-mono text-micro tracking-[0.14em] uppercase transition-all duration-300",
            active
              ? "border-brass bg-brass-pale text-brass-deep"
              : "border-rule-strong text-ink hover:border-ink hover:bg-ink hover:text-bone",
          )}
        >
          <Scale className="size-3.5" strokeWidth={1.8} aria-hidden />
          {active ? "Added to compare" : "Compare"}
        </button>
        {notice && (
          <p role="status" className="mt-2 text-center text-[0.6875rem] text-alert">
            {notice}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={active ? "Remove from comparison" : "Add to comparison"}
        aria-pressed={ready ? active : undefined}
        className={cn(
          "grid size-11 place-items-center rounded-full border transition-all duration-300 active:scale-90",
          active
            ? "border-brass bg-brass text-paper"
            : "border-rule-strong text-ink-muted hover:border-ink hover:bg-ink hover:text-bone",
        )}
      >
        <Scale className="size-4" strokeWidth={1.8} aria-hidden />
      </button>

      {notice && (
        <p
          role="status"
          className="absolute top-full right-0 z-30 mt-2 w-44 rounded-[2px] bg-ink px-3 py-2 text-[0.6875rem] leading-snug text-bone"
        >
          {notice}
        </p>
      )}
    </div>
  );
}
