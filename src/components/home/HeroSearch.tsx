"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";

import { budgetBands, localities, propertyTypes } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Hero search.
 *
 * The important behaviour: when the chosen combination maps onto one of our
 * canonical SEO paths, it navigates THERE — `/ahmedabad/shela/3-bhk-flats` —
 * not to `/properties?locality=shela&bhk=3&type=flats`.
 *
 * That single decision means the pages visitors share and link to are the
 * indexable ones, so every shared search compounds into ranking instead of
 * leaking into a `noindex` query-string view. It falls back to `/properties`
 * with params only for combinations that have no canonical page.
 */
export function HeroSearch() {
  const router = useRouter();
  const [locality, setLocality] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [bhk, setBhk] = useState("");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const grouped = useMemo(
    () => ({
      residential: propertyTypes.filter((t) => t.category === "residential"),
      commercial: propertyTypes.filter((t) => t.category === "commercial"),
      land: propertyTypes.filter((t) => t.category === "land"),
    }),
    [],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const city = locality
      ? (localities.find((l) => l.slug === locality)?.city ?? "ahmedabad")
      : "ahmedabad";

    // A free-text query always goes to the search page — we cannot know it
    // maps to a canonical facet.
    if (query.trim()) {
      const params = new URLSearchParams({ q: query.trim() });
      if (locality) params.set("locality", locality);
      if (type) params.set("type", type);
      if (bhk) params.set("bhk", bhk);
      const band = budgetBands.find((b) => b.slug === budget);
      if (band) {
        params.set("min", String(band.min));
        if (band.max) params.set("max", String(band.max));
      }
      router.push(`/properties?${params}`);
      return;
    }

    // ── Resolve to a canonical path where one exists ──────────────────────
    const segments: string[] = [];
    if (locality) segments.push(locality);

    const isResidentialType = grouped.residential.some((t) => t.slug === type);

    if (bhk && type && isResidentialType) {
      segments.push(`${bhk}-bhk-${type}`);
    } else if (type) {
      segments.push(type);
    } else if (budget) {
      segments.push(budget);
    } else if (bhk) {
      // No type chosen, so default to flats — the overwhelmingly common
      // intent behind a bare "3 BHK" search in this market.
      segments.push(`${bhk}-bhk-flats`);
    }

    // A budget alongside a type/BHK has no canonical page: at most two path
    // segments exist. Carry the budget as a query param on the canonical path
    // so the landing page is still the indexable one.
    const needsBudgetParam = Boolean(budget) && segments.length > (locality ? 1 : 0);
    const path = `/${city}${segments.length ? `/${segments.join("/")}` : ""}`;

    if (needsBudgetParam) {
      const band = budgetBands.find((b) => b.slug === budget);
      const params = new URLSearchParams();
      if (band) {
        params.set("min", String(band.min));
        if (band.max) params.set("max", String(band.max));
      }
      router.push(`${path}?${params}`);
      return;
    }

    router.push(path);
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "rounded-[2px] border bg-bone/95 shadow-[var(--shadow-float)] backdrop-blur-xl transition-colors duration-400",
        focused ? "border-brass" : "border-bone/25",
      )}
    >
      {/* ── Free-text row ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-rule px-4 py-3.5 lg:px-5">
        <Search className="size-[1.1rem] shrink-0 text-ink-faint" strokeWidth={1.7} aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Try “3 BHK in Shela” or a project name"
          aria-label="Search properties, localities or projects"
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent text-[0.9375rem] text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>

      {/* ── Facet row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-px bg-rule lg:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto]">
        <SelectCell label="Locality" value={locality} onChange={setLocality}>
          <option value="">Anywhere</option>
          {localities.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.name}
            </option>
          ))}
        </SelectCell>

        <SelectCell label="Property type" value={type} onChange={setType}>
          <option value="">Any type</option>
          <optgroup label="Residential">
            {grouped.residential.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Commercial">
            {grouped.commercial.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Land">
            {grouped.land.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </optgroup>
        </SelectCell>

        <SelectCell label="Budget" value={budget} onChange={setBudget}>
          <option value="">Any budget</option>
          {budgetBands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.label}
            </option>
          ))}
        </SelectCell>

        <SelectCell label="Config" value={bhk} onChange={setBhk}>
          <option value="">Any</option>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} BHK
            </option>
          ))}
        </SelectCell>

        <button
          type="submit"
          className="group col-span-2 flex items-center justify-center gap-2.5 bg-ink px-7 py-3.5 font-mono text-micro tracking-[0.14em] text-bone uppercase transition-colors duration-300 hover:bg-brass-deep lg:col-span-1 lg:py-4"
        >
          Search
          <ArrowRight
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </div>
    </form>
  );
}

/**
 * A select styled as a labelled cell rather than a dropdown — the label stays
 * visible so the whole bar reads like a specification table.
 */
function SelectCell({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="group flex cursor-pointer flex-col gap-0.5 bg-bone px-3 py-2.5 transition-colors duration-300 hover:bg-sand sm:gap-1 sm:px-4 sm:py-3 lg:px-5">
      <span className="truncate font-mono text-[0.5rem] tracking-[0.14em] text-ink-faint uppercase sm:text-[0.5625rem] sm:tracking-[0.16em]">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none truncate bg-transparent text-[0.8125rem] text-ink focus:outline-none sm:text-[0.9375rem]"
      >
        {children}
      </select>
    </label>
  );
}
