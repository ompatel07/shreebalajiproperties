"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Building2, ChevronDown, Home, LandPlot, MapPin, Search, Sparkles, Wallet } from "lucide-react";

import { budgetBands, localities, propertyTypes } from "@/config/site";
import { searchPath } from "@/lib/search-path";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEARCH PANEL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The tabbed search every Indian property portal has taught buyers to expect:
 * pick what you are after first (Buy, New Projects, Commercial, Plots), and
 * the rest of the form adapts — the property-type list only offers types that
 * make sense for that tab.
 *
 * Routing lives in `searchPath()` (src/lib/search-path.ts), which prefers the
 * canonical indexable landing page for any combination it can, and is unit
 * tested so a search can never land on a page that does not exist.
 */

type TabId = "buy" | "projects" | "commercial" | "plots";

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "buy", label: "Buy", icon: Home },
  { id: "projects", label: "New Projects", icon: Sparkles },
  { id: "commercial", label: "Commercial", icon: Building2 },
  { id: "plots", label: "Plots", icon: LandPlot },
];

const CATEGORY_FOR_TAB: Record<TabId, "residential" | "commercial" | "land"> = {
  buy: "residential",
  projects: "residential",
  commercial: "commercial",
  plots: "land",
};

export function SearchPanel({ className }: { className?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("buy");
  const [locality, setLocality] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");

  const typeOptions = useMemo(
    () => propertyTypes.filter((t) => t.category === CATEGORY_FOR_TAB[tab]),
    [tab],
  );

  // Areas sorted alphabetically — 145 of them, so a buyer scanning for
  // "Shela" should not have to guess the order.
  const areaOptions = useMemo(
    () => [...localities].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  function switchTab(next: TabId) {
    setTab(next);
    // A type picked under Buy means nothing under Commercial.
    if (!propertyTypes.some((t) => t.slug === type && t.category === CATEGORY_FOR_TAB[next])) {
      setType("");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(
      searchPath({
        locality: locality || undefined,
        type: type || undefined,
        budget: budget || undefined,
        possession: tab === "projects" ? "new-launch" : undefined,
        // With no type picked, the tab still says what kind of property —
        // so land on that whole category rather than guessing one type.
        category:
          tab === "commercial"
            ? "commercial-properties"
            : tab === "plots"
              ? "land-properties"
              : undefined,
      }),
    );
  }

  return (
    <div
      className={cn(
        "rounded-[20px] bg-paper p-2 shadow-[0_24px_60px_-20px_rgba(18,17,16,0.35),0_2px_6px_rgba(18,17,16,0.06)] ring-1 ring-black/5",
        className,
      )}
    >
      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div role="tablist" aria-label="What are you looking for" className="no-bar flex gap-1 overflow-x-auto px-1 pt-1">
        {TABS.map((t) => {
          const on = t.id === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => switchTab(t.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[0.875rem] font-semibold whitespace-nowrap transition-colors",
                on ? "bg-ink text-white" : "text-ink-soft hover:bg-sand",
              )}
            >
              <Icon className="size-4" strokeWidth={2} aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Fields ─────────────────────────────────────────────────────── */}
      <form
        onSubmit={submit}
        className="mt-2 grid gap-2 rounded-2xl bg-bone p-2 md:grid-cols-[1.3fr_1fr_1fr_auto]"
      >
        <Field icon={MapPin} label="Location">
          <select value={locality} onChange={(e) => setLocality(e.target.value)} aria-label="Location">
            <option value="">All of Ahmedabad</option>
            {areaOptions.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={Home} label="Property type">
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Property type">
            <option value="">Any type</option>
            {typeOptions.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={Wallet} label="Budget">
          <select value={budget} onChange={(e) => setBudget(e.target.value)} aria-label="Budget">
            <option value="">Any budget</option>
            {budgetBands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brass px-7 py-4 text-[0.9375rem] font-bold text-white transition-colors hover:bg-brass-deep md:py-0"
        >
          <Search className="size-[1.05rem]" strokeWidth={2.4} aria-hidden />
          Search
        </button>
      </form>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Home;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="group relative flex min-w-0 cursor-pointer items-center gap-3 rounded-xl bg-paper px-4 py-3 ring-1 ring-rule transition-shadow focus-within:ring-2 focus-within:ring-brass">
      <Icon className="size-[1.1rem] shrink-0 text-brass" strokeWidth={2} aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[0.6875rem] font-semibold tracking-wide text-ink-faint uppercase">{label}</span>
        {/* The select is styled bare; the chevron below is the affordance. */}
        <span className="[&>select]:w-full [&>select]:min-w-0 [&>select]:cursor-pointer [&>select]:appearance-none [&>select]:truncate [&>select]:bg-transparent [&>select]:pr-5 [&>select]:text-[0.9375rem] [&>select]:font-semibold [&>select]:text-ink [&>select]:focus:outline-none">
          {children}
        </span>
      </span>
      <ChevronDown
        className="pointer-events-none absolute right-3 size-4 text-ink-faint transition-transform group-focus-within:rotate-180"
        strokeWidth={2}
        aria-hidden
      />
    </label>
  );
}
