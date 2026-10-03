"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";

import { localities, possessionStatuses, propertyTypes } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACTIVE FILTERS — what is on, and one tap to turn it off
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The brief was that searching must be very easy to understand. The biggest
 * obstacle before this existed was that applied filters were only visible as
 * highlighted state *inside the rail* — on mobile, behind a sheet. Someone
 * looking at four results had no way to tell which of their choices had
 * narrowed it that far, so the usual recovery was to leave.
 *
 * So every active filter becomes a chip that names itself in plain words and
 * removes itself in one tap. Nothing here is a new capability — the rail could
 * already clear each one — but it makes the state legible, and legibility is
 * the whole request.
 *
 * ── Design notes ────────────────────────────────────────────────────────
 * • The result count sits here, large, ahead of the chips. "12 homes", then
 *   "because of these filters", is the order a person asks it in.
 * • Budget is one chip, not two. `min` and `max` are implementation; the
 *   range is what the visitor chose.
 * • Multi-selects get one chip per value. A single "3 areas" chip would force
 *   an all-or-nothing undo, which is the opposite of the point.
 * • `lockedKeys` suppresses chips the route path already fixes. On
 *   /ahmedabad/shela/3-bhk-flats a removable "3 BHK" chip would have to
 *   rewrite the path rather than the query, so the page owns that, not this.
 * • `router.replace`, matching the rail: filter tweaks must not fill the
 *   history stack between the visitor and wherever they came from.
 */

type Chip = { key: string; label: string; clear: string[] };

const furnishingLabels: Record<string, string> = {
  unfurnished: "Unfurnished",
  "semi-furnished": "Semi-furnished",
  furnished: "Fully furnished",
};

export function ActiveFilters({
  total,
  lockedKeys = [],
  className,
}: {
  total: number;
  /** Query keys the route path already fixes; no chip is rendered for these. */
  lockedKeys?: string[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const get = (k: string) => {
    if (lockedKeys.includes(k)) return null;
    const v = searchParams.get(k);
    return v && v.trim() !== "" ? v : null;
  };

  const chips: Chip[] = [];

  // ── Free text ─────────────────────────────────────────────────────────
  const q = get("q");
  if (q) chips.push({ key: "q", label: `“${q}”`, clear: ["q"] });

  // ── Budget: one chip for the pair ─────────────────────────────────────
  const min = get("min");
  const max = get("max");
  if (min || max) {
    const minN = min ? Number(min) : undefined;
    const maxN = max ? Number(max) : undefined;
    const label =
      minN && maxN
        ? `${formatPrice(minN)} – ${formatPrice(maxN)}`
        : minN
          ? `Above ${formatPrice(minN)}`
          : `Under ${formatPrice(maxN ?? 0)}`;
    chips.push({ key: "budget", label, clear: ["min", "max"] });
  }

  // ── Bedrooms ──────────────────────────────────────────────────────────
  const bhk = get("bhk");
  if (bhk) chips.push({ key: "bhk", label: `${bhk} BHK or more`, clear: ["bhk"] });

  // ── Property type ─────────────────────────────────────────────────────
  const type = get("type");
  if (type) {
    const name = propertyTypes.find((t) => t.slug === type)?.name ?? type;
    chips.push({ key: "type", label: name, clear: ["type"] });
  }

  // ── Possession ────────────────────────────────────────────────────────
  const possession = get("possession");
  if (possession) {
    const label =
      possessionStatuses.find((p) => p.slug === possession)?.label ?? possession;
    chips.push({ key: "possession", label, clear: ["possession"] });
  }

  // ── Furnishing ────────────────────────────────────────────────────────
  const furnishing = get("furnishing");
  if (furnishing) {
    chips.push({
      key: "furnishing",
      label: furnishingLabels[furnishing] ?? furnishing,
      clear: ["furnishing"],
    });
  }

  // ── Multi-selects, each value independently removable ─────────────────
  for (const slug of (get("locality") ?? "").split(",").filter(Boolean)) {
    const name = localities.find((l) => l.slug === slug)?.name ?? slug;
    chips.push({ key: `locality:${slug}`, label: name, clear: [] });
  }

  for (const amenity of (get("amenities") ?? "").split(",").filter(Boolean)) {
    chips.push({ key: `amenities:${amenity}`, label: amenity, clear: [] });
  }

  const push = (next: URLSearchParams) => {
    // Any change resets pagination — page 4 of a smaller result set is empty.
    next.delete("page");
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const removeKeys = (keys: string[]) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const k of keys) next.delete(k);
    push(next);
  };

  /** Drops one value out of a comma-joined list, deleting the key if empty. */
  const removeFromList = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    const kept = (searchParams.get(key) ?? "")
      .split(",")
      .filter((v) => v && v !== value);
    if (kept.length) next.set(key, kept.join(","));
    else next.delete(key);
    push(next);
  };

  const onRemove = (chip: Chip) => {
    const [listKey, listValue] = chip.key.split(":");
    if (listKey && listValue) removeFromList(listKey, listValue);
    else removeKeys(chip.clear);
  };

  const sortActive = searchParams.get("sort");

  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-3", className)}>
      {/* ── The answer, stated first and plainly ───────────────────────── */}
      <p
        aria-live="polite"
        className={cn(
          "font-display text-[1.375rem] leading-none text-ink transition-opacity duration-200",
          pending && "opacity-50",
        )}
      >
        <span data-numeric>{total}</span>{" "}
        <span className="text-ink-muted">
          {total === 1 ? "home" : "homes"}
          {chips.length > 0 ? " match" : ""}
        </span>
      </p>

      {/* ── Why: the filters doing the narrowing ───────────────────────── */}
      {chips.length > 0 && (
        <>
          <ul className="flex flex-wrap items-center gap-1.5">
            {chips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  onClick={() => onRemove(chip)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-rule-strong bg-paper py-1 pr-2 pl-3 text-[0.8125rem] text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-bone"
                >
                  {chip.label}
                  <X
                    className="size-3 shrink-0 text-ink-faint transition-colors group-hover:text-bone"
                    strokeWidth={2.4}
                    aria-hidden
                  />
                  <span className="sr-only">— remove this filter</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Only worth offering once more than one thing is on. */}
          {chips.length > 1 && (
            <button
              type="button"
              onClick={() => {
                // Locked facets live in the path, so emptying the query string
                // keeps the route and drops only what the visitor added. Sort
                // is a view preference, not a filter, so it survives.
                const next = new URLSearchParams();
                if (sortActive) next.set("sort", sortActive);
                push(next);
              }}
              className="font-semibold text-[0.6875rem] tracking-[0.12em] text-brass uppercase hover:underline"
            >
              Clear all
            </button>
          )}
        </>
      )}
    </div>
  );
}
