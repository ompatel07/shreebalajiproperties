"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { amenities, budgetBands, localities, possessionStatuses, propertyTypes } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILTER RAIL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Writes to the query string, which the server page reads and validates. The
 * URL stays the single source of truth, so a filtered view is shareable, and
 * back/forward behave the way a visitor expects.
 *
 * Two SEO rules this component respects:
 *
 *   1. It uses `router.replace`, not `push`. Ten filter tweaks should not
 *      leave ten entries in the history stack between the visitor and the
 *      page they came from.
 *   2. Any page with filters applied is served `noindex, follow` by the
 *      server component. The canonical path (`/ahmedabad/3-bhk-flats`) is the
 *      indexable surface; `?min=…&amenities=…` permutations are not.
 *
 * `facetLocked` hides controls that the URL path already fixes — showing a
 * "Property type" dropdown on `/ahmedabad/3-bhk-flats` invites the visitor to
 * create a contradictory state.
 */
export function FilterRail({
  total,
  facetLocked = {},
}: {
  total: number;
  facetLocked?: {
    locality?: boolean;
    propertyType?: boolean;
    budget?: boolean;
    possession?: boolean;
    bhk?: boolean;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());

      if (value === null || value === "") next.delete(key);
      else next.set(key, value);

      // Any filter change resets pagination — page 4 of a different result
      // set is almost always empty.
      next.delete("page");

      const qs = next.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  /** Multi-select values travel as a comma-joined list. */
  const toggleInList = useCallback(
    (key: string, value: string) => {
      const current = (searchParams.get(key) ?? "").split(",").filter(Boolean);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setParam(key, next.join(","));
    },
    [searchParams, setParam],
  );

  const inList = (key: string, value: string) =>
    (searchParams.get(key) ?? "").split(",").filter(Boolean).includes(value);

  const activeCount = [
    "type",
    "category",
    "bhk",
    "min",
    "max",
    "locality",
    "possession",
    "amenities",
    "furnishing",
    "q",
  ].filter((k) => searchParams.get(k)).length;

  const clearAll = () => {
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  const body = (
    <div className={cn("space-y-7", pending && "opacity-60 transition-opacity")}>
      {/* ── Active summary ───────────────────────────────────────────── */}
      <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-4">
        {/* The result count used to live here. It now leads the results
            column as a removable-chip bar, so repeating it in the rail only
            invited a double-take about which number was authoritative. */}
        <p className="font-mono text-[0.5625rem] tracking-[0.16em] text-ink-muted uppercase">
          Narrow it down
        </p>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="font-mono text-[0.5625rem] tracking-[0.12em] text-brass uppercase hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Budget ───────────────────────────────────────────────────── */}
      {!facetLocked.budget && (
        <FilterGroup label="Your budget">
          <div className="space-y-1.5">
            {budgetBands.map((band) => {
              const active =
                searchParams.get("min") === String(band.min) &&
                (band.max === null
                  ? !searchParams.get("max")
                  : searchParams.get("max") === String(band.max));

              return (
                <button
                  key={band.slug}
                  type="button"
                  onClick={() => {
                    if (active) {
                      setParam("min", null);
                      setParam("max", null);
                    } else {
                      const next = new URLSearchParams(searchParams.toString());
                      next.set("min", String(band.min));
                      if (band.max) next.set("max", String(band.max));
                      else next.delete("max");
                      next.delete("page");
                      startTransition(() =>
                        router.replace(`${pathname}?${next}`, { scroll: false }),
                      );
                    }
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[2px] px-3 py-2 text-left text-caption transition-colors",
                    active
                      ? "bg-ink text-bone"
                      : "text-ink-soft hover:bg-sand",
                  )}
                >
                  {band.label}
                  {active && <X className="size-3" strokeWidth={2.4} aria-hidden />}
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}

      {/* ── Configuration ────────────────────────────────────────────── */}
      {!facetLocked.bhk && (
        <FilterGroup label="Bedrooms">
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = searchParams.get("bhk") === String(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setParam("bhk", active ? null : String(n))}
                  aria-pressed={active}
                  className={cn(
                    "rounded-[2px] border px-3 py-2.5 text-[0.8125rem] transition-colors",
                    active
                      ? "border-ink bg-ink text-bone"
                      : "border-rule-strong text-ink-soft hover:border-ink",
                  )}
                >
                  {n}+ BHK
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}

      {/* ── Property type ────────────────────────────────────────────── */}
      {!facetLocked.propertyType && (
        <FilterGroup label="Kind of property">
          <div className="space-y-1">
            {propertyTypes.map((type) => {
              const active = searchParams.get("type") === type.slug;
              return (
                <label
                  key={type.slug}
                  className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 text-caption text-ink-soft transition-colors hover:text-ink"
                >
                  <input
                    type="radio"
                    name="type"
                    checked={active}
                    onChange={() => setParam("type", active ? null : type.slug)}
                    onClick={() => active && setParam("type", null)}
                    className="size-3.5 accent-brass"
                    style={{ accentColor: "var(--color-brass)" }}
                  />
                  {type.name}
                </label>
              );
            })}
          </div>
        </FilterGroup>
      )}

      {/* ── Possession ───────────────────────────────────────────────── */}
      {!facetLocked.possession && (
        <FilterGroup label="When you can move in">
          <div className="space-y-1">
            {possessionStatuses.map((p) => {
              const active = searchParams.get("possession") === p.slug;
              return (
                <label
                  key={p.slug}
                  className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 text-caption text-ink-soft transition-colors hover:text-ink"
                >
                  <input
                    type="radio"
                    name="possession"
                    checked={active}
                    onChange={() => setParam("possession", active ? null : p.slug)}
                    onClick={() => active && setParam("possession", null)}
                    className="size-3.5"
                    style={{ accentColor: "var(--color-brass)" }}
                  />
                  {p.label}
                </label>
              );
            })}
          </div>
        </FilterGroup>
      )}

      {/* ── Locality ─────────────────────────────────────────────────── */}
      {!facetLocked.locality && (
        <FilterGroup label="Area" collapsible defaultOpen={false}>
          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {localities.map((l) => (
              <label
                key={l.slug}
                className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 text-caption text-ink-soft transition-colors hover:text-ink"
              >
                <input
                  type="checkbox"
                  checked={inList("locality", l.slug)}
                  onChange={() => toggleInList("locality", l.slug)}
                  className="size-3.5 rounded-[1px]"
                  style={{ accentColor: "var(--color-brass)" }}
                />
                {l.name}
              </label>
            ))}
          </div>
        </FilterGroup>
      )}

      {/* ── Furnishing ───────────────────────────────────────────────── */}
      <FilterGroup label="Furnishing">
        <div className="flex flex-wrap gap-1.5">
          {[
            { v: "unfurnished", l: "Unfurnished" },
            { v: "semi-furnished", l: "Semi" },
            { v: "furnished", l: "Furnished" },
          ].map((f) => {
            const active = searchParams.get("furnishing") === f.v;
            return (
              <button
                key={f.v}
                type="button"
                onClick={() => setParam("furnishing", active ? null : f.v)}
                aria-pressed={active}
                className={cn(
                  "rounded-[2px] border px-3 py-2 text-[0.8125rem] transition-colors",
                  active
                    ? "border-ink bg-ink text-bone"
                    : "border-rule-strong text-ink-soft hover:border-ink",
                )}
              >
                {f.l}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* ── Amenities ────────────────────────────────────────────────── */}
      <FilterGroup label="Must have" collapsible defaultOpen={false}>
        <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
          {amenities.slice(0, 18).map((a) => (
            <label
              key={a}
              className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 text-caption text-ink-soft transition-colors hover:text-ink"
            >
              <input
                type="checkbox"
                checked={inList("amenities", a)}
                onChange={() => toggleInList("amenities", a)}
                className="size-3.5 rounded-[1px]"
                style={{ accentColor: "var(--color-brass)" }}
              />
              {a}
            </label>
          ))}
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <>
      {/* ── Desktop ──────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100svh-8rem)] overflow-y-auto pr-2">
          {body}
        </div>
      </div>

      {/* ── Mobile trigger ──────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="inline-flex items-center gap-2.5 rounded-[2px] border border-rule-strong bg-paper px-4 py-2.5 font-mono text-micro tracking-[0.12em] text-ink uppercase lg:hidden"
      >
        <SlidersHorizontal className="size-3.5" strokeWidth={1.8} aria-hidden />
        Filters
        {activeCount > 0 && (
          <span className="grid size-4 place-items-center rounded-full bg-brass font-mono text-[0.5rem] text-paper">
            {activeCount}
          </span>
        )}
      </button>

      {/* ── Mobile sheet. Mounted always; CSS handles enter/exit. ──── */}
      <div
        className="overlay fixed inset-0 z-[70] bg-ink/45 backdrop-blur-sm lg:hidden"
        data-open={mobileOpen ? "1" : "0"}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
        data-open={mobileOpen ? "1" : "0"}
        className="sheet-bottom fixed inset-x-0 bottom-0 z-[71] flex max-h-[88svh] flex-col rounded-t-[4px] bg-bone lg:hidden"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-rule px-5 py-4">
          <p className="font-display text-h4">Filters</p>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close filters"
            className="grid size-10 place-items-center text-ink"
          >
            <X className="size-5" strokeWidth={1.7} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">{body}</div>

        <div className="shrink-0 border-t border-rule p-5">
          <Button fullWidth size="lg" onClick={() => setMobileOpen(false)}>
            Show {total} {total === 1 ? "home" : "homes"}
          </Button>
        </div>
      </div>

    </>
  );
}

function FilterGroup({
  label,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  label: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="mb-3 flex w-full items-center justify-between font-mono text-[0.5625rem] tracking-[0.16em] text-ink-muted uppercase"
        >
          {label}
          <span className={cn("transition-transform duration-300", open && "rotate-45")} aria-hidden>
            +
          </span>
        </button>
      ) : (
        <p className="mb-3 font-mono text-[0.5625rem] tracking-[0.16em] text-ink-muted uppercase">
          {label}
        </p>
      )}

      {(!collapsible || open) && children}
    </div>
  );
}

/** Sort control. Kept separate so it can sit above the grid, not in the rail. */
export function SortBar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get("sort") ?? "relevance";

  const onChange = (value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "relevance") next.delete("sort");
    else next.set("sort", value);
    next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="sort"
        className="hidden font-mono text-[0.5625rem] tracking-[0.16em] text-ink-muted uppercase sm:block"
      >
        Sort
      </label>
      <select
        id="sort"
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-[2px] border border-rule-strong bg-paper px-3.5 py-2.5 font-mono text-micro tracking-[0.08em] text-ink focus:border-brass focus:outline-none"
      >
        <option value="relevance">Our pick</option>
        <option value="newest">Newest first</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="area-desc">Largest first</option>
      </select>

      <span className="sr-only" aria-live="polite">
        {total} results
      </span>
    </div>
  );
}

/** Formats an active price range for the summary chips. */
export function priceRangeLabel(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  if (min && max) return `${formatPrice(min)} – ${formatPrice(max)}`;
  if (min) return `${formatPrice(min)}+`;
  return `Up to ${formatPrice(max!)}`;
}
