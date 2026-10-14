"use client";

import { Children, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ZONE TABS — one corridor at a time on a phone, all of them on a desktop
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * /localities lists 145 areas across seven corridors. On a desktop that is a
 * scannable reference page. On a phone it was one 7,069px column — more than
 * eight screens of area names — which is the "too long to scroll" the client
 * reported.
 *
 * Below `md` this shows a sticky row of corridor tabs and renders only the
 * selected corridor. From `md` up every corridor is visible and the tabs are
 * hidden, so the desktop page is unchanged.
 *
 * ── Why the hiding is CSS, not conditional rendering ────────────────────
 * Every corridor is rendered on the server and merely hidden on small
 * screens (`max-md:hidden`). So:
 *
 *   • there is no hydration mismatch — server and client produce identical
 *     markup, and the first corridor is active in both;
 *   • every area link stays in the HTML, so crawlers still reach all 145
 *     landing pages from this page, which is the main reason it exists;
 *   • the desktop layout needs no JavaScript at all.
 */
export function ZoneTabs({
  zones,
  children,
}: {
  zones: { id: string; label: string; count: number }[];
  /** One child per zone, in the same order as `zones`. */
  children: ReactNode;
}) {
  const [active, setActive] = useState(zones[0]?.id);
  const panels = Children.toArray(children);

  function select(id: string) {
    setActive(id);
    // Bring the start of the corridor into view rather than leaving the
    // reader halfway down the previous one.
    document
      .getElementById("zone-panels")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* ── Tabs: phones only, stuck under the header while you read ──── */}
      <div
        role="tablist"
        aria-label="Corridors"
        className="no-bar sticky top-16 z-20 -mx-[1.125rem] mb-6 flex gap-2 overflow-x-auto border-b border-rule bg-bone/95 px-[1.125rem] py-3 backdrop-blur-md sm:-mx-7 sm:px-7 md:hidden"
      >
        {zones.map((z) => {
          const on = z.id === active;
          return (
            <button
              key={z.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`zone-panel-${z.id}`}
              onClick={() => select(z.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium whitespace-nowrap transition-colors",
                on
                  ? "border-ink bg-ink text-bone"
                  : "border-rule-strong bg-paper text-ink-soft hover:border-ink",
              )}
            >
              {z.label}
              <span
                className={cn(
                  "text-[0.6875rem] font-semibold",
                  on ? "text-bone/70" : "text-ink-faint",
                )}
                data-numeric
              >
                {z.count}
              </span>
            </button>
          );
        })}
      </div>

      <div id="zone-panels" className="scroll-mt-32 space-y-16">
        {panels.map((panel, i) => {
          const zone = zones[i];
          if (!zone) return null;
          return (
            <div
              key={zone.id}
              id={`zone-panel-${zone.id}`}
              role="tabpanel"
              className={cn(zone.id !== active && "max-md:hidden")}
            >
              {panel}
            </div>
          );
        })}
      </div>
    </>
  );
}
