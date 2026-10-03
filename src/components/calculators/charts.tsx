"use client";

import { useId, useState } from "react";
import { Table2 } from "lucide-react";

import { formatPrice, formatRupeesExact, groupIndian } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHART PRIMITIVES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Hand-built in SVG and HTML — no charting library. On a site whose whole
 * premise is zero marginal cost, adding 120 KB of Recharts to draw two
 * stacked bars is the wrong trade.
 *
 * The rules these follow (all verifiable):
 *   · Series colours come from `--color-series-{1,2,3}`, assigned BY SLOT and
 *     never cycled. Those three were validated for colour-vision separation
 *     against the bone surface; see the note in globals.css.
 *   · Identity is never colour-alone: a legend is always present for ≥2
 *     series, and segments carry direct labels wherever they fit.
 *   · Stacked segments are separated by a 2px surface-coloured gap, so the
 *     boundary reads without relying on hue contrast.
 *   · Every chart has a table view. That is the accessibility fallback and
 *     also what a buyer actually wants when they are checking a number.
 *   · One axis. Rupees only — never a second scale for percentages.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   HERO NUMBER
   The answer to the question, before any chart. Most of these calculators
   have a single headline figure, and a chart would bury it.
   ═══════════════════════════════════════════════════════════════════════════ */

export function StatTile({
  label,
  value,
  sub,
  tone = "default",
  size = "lg",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "brass" | "verdant";
  size?: "lg" | "md";
}) {
  const tones = {
    default: "bg-paper border-rule",
    brass: "bg-brass-pale/50 border-brass/30",
    verdant: "bg-verdant-pale border-verdant/25",
  } as const;

  return (
    <div className={cn("rounded-[2px] border p-5", tones[tone])}>
      <p className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-muted uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display leading-none text-ink",
          size === "lg" ? "text-[clamp(1.75rem,3.5vw,2.5rem)]" : "text-h4",
        )}
        data-numeric
      >
        {value}
      </p>
      {sub && <p className="mt-2 text-caption leading-snug text-ink-muted">{sub}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSITION BAR
   One horizontal stacked bar: "what makes up this total".
   The right form for a part-to-whole with 2–4 parts — a pie would make the
   same comparison harder and a grouped bar would lose the total.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface Segment {
  label: string;
  value: number;
  /** 1-indexed series slot. Fixed per entity, never by rank. */
  slot: 1 | 2 | 3;
}

export function CompositionBar({
  segments,
  total,
  caption,
}: {
  segments: Segment[];
  total?: number;
  caption?: string;
}) {
  const sum = total ?? segments.reduce((s, x) => s + x.value, 0);
  const [showTable, setShowTable] = useState(false);

  if (sum <= 0) return null;

  return (
    <figure>
      {/* ── Bar ──────────────────────────────────────────────────────────── */}
      <div
        className="flex h-11 w-full gap-[2px] overflow-hidden rounded-[2px]"
        role="img"
        aria-label={segments
          .map((s) => `${s.label}: ${formatRupeesExact(s.value)}`)
          .join("; ")}
      >
        {segments
          .filter((s) => s.value > 0)
          .map((s) => {
            const pct = (s.value / sum) * 100;
            return (
              <div
                key={s.label}
                // The 2px flex gap above IS the surface spacer between fills.
                style={{
                  width: `${pct}%`,
                  backgroundColor: `var(--color-series-${s.slot})`,
                }}
                className="group relative grid place-items-center transition-opacity hover:opacity-90"
                title={`${s.label} — ${formatRupeesExact(s.value)} (${pct.toFixed(1)}%)`}
              >
                {/* Direct label, but only where it will actually fit. */}
                {pct > 11 && (
                  <span className="px-1 font-mono text-[0.5625rem] tracking-[0.08em] text-white/95 tabular-nums">
                    {pct.toFixed(0)}%
                  </span>
                )}
              </div>
            );
          })}
      </div>

      {/* ── Legend. Always present for ≥2 series; swatch carries the hue,
             the text stays in ink tokens. ─────────────────────────────────── */}
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5">
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <li key={s.label} className="flex items-baseline gap-2">
              <span
                aria-hidden
                className="mt-1 size-2.5 shrink-0 rounded-[1px]"
                style={{ backgroundColor: `var(--color-series-${s.slot})` }}
              />
              <span className="text-caption text-ink-muted">
                {s.label}
                <span className="ml-1.5 text-ink tabular-nums" data-numeric>
                  {formatPrice(s.value)}
                </span>
              </span>
            </li>
          ))}
      </ul>

      {caption && (
        <figcaption className="mt-3 text-[0.75rem] leading-relaxed text-ink-faint">
          {caption}
        </figcaption>
      )}

      <TableToggle open={showTable} onToggle={() => setShowTable((v) => !v)} />

      {showTable && (
        <table className="mt-3 w-full border-collapse text-caption">
          <caption className="sr-only">Breakdown by component</caption>
          <thead>
            <tr className="border-b border-rule text-left">
              <th scope="col" className="py-2 font-mono text-[0.5625rem] tracking-[0.12em] text-ink-muted uppercase">
                Component
              </th>
              <th scope="col" className="py-2 text-right font-mono text-[0.5625rem] tracking-[0.12em] text-ink-muted uppercase">
                Amount
              </th>
              <th scope="col" className="py-2 text-right font-mono text-[0.5625rem] tracking-[0.12em] text-ink-muted uppercase">
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {segments.map((s) => (
              <tr key={s.label} className="border-b border-rule/60">
                <th scope="row" className="py-2 text-left font-normal text-ink-soft">
                  {s.label}
                </th>
                <td className="py-2 text-right text-ink tabular-nums" data-numeric>
                  {formatRupeesExact(s.value)}
                </td>
                <td className="py-2 text-right text-ink-muted tabular-nums" data-numeric>
                  {((s.value / sum) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
            <tr className="font-medium">
              <th scope="row" className="py-2 text-left">
                Total
              </th>
              <td className="py-2 text-right text-ink tabular-nums" data-numeric>
                {formatRupeesExact(sum)}
              </td>
              <td className="py-2 text-right text-ink-muted">100%</td>
            </tr>
          </tbody>
        </table>
      )}
    </figure>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AMORTISATION — stacked bars over time
   Change-over-time with a part-to-whole inside each period, so: stacked
   columns, one per year. This is the chart that shows borrowers the thing
   they least expect — how little principal the early years retire.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface AmortPoint {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

export function AmortisationChart({ rows }: { rows: AmortPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const clipId = useId();

  if (rows.length === 0) return null;

  // One axis, in rupees. The tallest yearly outflow sets the scale.
  const max = Math.max(...rows.map((r) => r.principalPaid + r.interestPaid));
  if (max <= 0) return null;

  const H = 190; // plot height in px
  const active = hover !== null ? rows[hover] : null;

  return (
    <figure>
      <div className="flex items-baseline justify-between gap-4">
        <figcaption className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-muted uppercase">
          Where each year&rsquo;s instalments go
        </figcaption>

        {/* Legend — always present, two series. */}
        <ul className="flex gap-4">
          {[
            { label: "Principal", slot: 1 as const },
            { label: "Interest", slot: 2 as const },
          ].map((s) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2.5 rounded-[1px]"
                style={{ backgroundColor: `var(--color-series-${s.slot})` }}
              />
              <span className="font-mono text-[0.5625rem] tracking-[0.1em] text-ink-muted uppercase">
                {s.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Plot ─────────────────────────────────────────────────────────── */}
      <div
        className="relative mt-5"
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Amortisation over ${rows.length} years. Interest dominates the early years; principal repayment accelerates later.`}
      >
        {/* Recessive gridlines — three only. More would compete with the marks. */}
        <div className="absolute inset-x-0 top-0" style={{ height: H }} aria-hidden>
          {[0, 0.5, 1].map((t) => (
            <div
              key={t}
              className="absolute inset-x-0 border-t border-rule"
              style={{ top: `${t * 100}%` }}
            />
          ))}
        </div>

        <div className="relative flex items-end gap-[2px]" style={{ height: H }}>
          {rows.map((r, i) => {
            const totalYear = r.principalPaid + r.interestPaid;
            const hPct = (totalYear / max) * 100;
            const principalShare = totalYear > 0 ? r.principalPaid / totalYear : 0;
            const isHover = hover === i;

            return (
              <button
                key={r.year}
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onClick={() => setHover(isHover ? null : i)}
                aria-label={`Year ${r.year}: principal ${formatRupeesExact(
                  r.principalPaid,
                )}, interest ${formatRupeesExact(r.interestPaid)}, balance ${formatRupeesExact(
                  r.balance,
                )}`}
                // Hit target spans the full column height, not just the bar.
                className="group relative flex h-full flex-1 cursor-pointer flex-col justify-end"
                style={{ minWidth: 6 }}
              >
                <div
                  className={cn(
                    "flex w-full flex-col gap-[2px] overflow-hidden rounded-t-[4px] transition-opacity",
                    hover !== null && !isHover && "opacity-45",
                  )}
                  style={{ height: `${hPct}%` }}
                >
                  {/* Interest on top, principal at the baseline — the growing
                      gold block at the bottom is the story. */}
                  <div
                    className="w-full"
                    style={{
                      height: `${(1 - principalShare) * 100}%`,
                      backgroundColor: "var(--color-series-2)",
                    }}
                  />
                  <div
                    className="w-full"
                    style={{
                      height: `${principalShare * 100}%`,
                      backgroundColor: "var(--color-series-1)",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* X axis — label every fifth year so they never collide. */}
        <div className="mt-2 flex gap-[2px] border-t border-rule-strong pt-2">
          {rows.map((r, i) => (
            <span
              key={r.year}
              className="flex-1 text-center font-mono text-[0.5rem] text-ink-faint tabular-nums"
              style={{ minWidth: 6 }}
            >
              {i === 0 || (r.year % 5 === 0 && i !== rows.length - 1) || i === rows.length - 1
                ? r.year
                : ""}
            </span>
          ))}
        </div>

        {/* Tooltip. Positioned above the plot rather than following the
            cursor, so it never covers the bar being inspected. */}
        {active && (
          <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-[2px] border border-rule bg-paper px-4 py-3 shadow-[var(--shadow-float)]">
            <p className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-muted uppercase">
              Year {active.year}
            </p>
            <dl className="mt-2 space-y-1">
              <TooltipRow slot={1} label="Principal" value={active.principalPaid} />
              <TooltipRow slot={2} label="Interest" value={active.interestPaid} />
              <div className="flex items-center justify-between gap-6 border-t border-rule pt-1">
                <dt className="text-[0.6875rem] text-ink-muted">Outstanding</dt>
                <dd className="text-[0.6875rem] text-ink tabular-nums" data-numeric>
                  {formatRupeesExact(Math.round(active.balance))}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <TableToggle open={showTable} onToggle={() => setShowTable((v) => !v)} />

      {showTable && (
        <div className="mt-3 max-h-72 overflow-y-auto">
          <table className="w-full border-collapse text-caption">
            <caption className="sr-only">Year-by-year amortisation schedule</caption>
            <thead className="sticky top-0 bg-bone">
              <tr className="border-b border-rule-strong text-left">
                {["Year", "Principal", "Interest", "Outstanding"].map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className={cn(
                      "py-2 font-mono text-[0.5625rem] tracking-[0.12em] text-ink-muted uppercase",
                      i > 0 && "text-right",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.year} className="border-b border-rule/60">
                  <th scope="row" className="py-1.5 text-left font-normal text-ink-soft tabular-nums">
                    {r.year}
                  </th>
                  <td className="py-1.5 text-right text-ink tabular-nums" data-numeric>
                    {groupIndian(Math.round(r.principalPaid))}
                  </td>
                  <td className="py-1.5 text-right text-ink tabular-nums" data-numeric>
                    {groupIndian(Math.round(r.interestPaid))}
                  </td>
                  <td className="py-1.5 text-right text-ink-muted tabular-nums" data-numeric>
                    {groupIndian(Math.round(r.balance))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

function TooltipRow({
  slot,
  label,
  value,
}: {
  slot: 1 | 2 | 3;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <dt className="flex items-center gap-1.5 text-[0.6875rem] text-ink-muted">
        <span
          aria-hidden
          className="size-2 rounded-[1px]"
          style={{ backgroundColor: `var(--color-series-${slot})` }}
        />
        {label}
      </dt>
      <dd className="text-[0.6875rem] text-ink tabular-nums" data-numeric>
        {formatRupeesExact(Math.round(value))}
      </dd>
    </div>
  );
}

function TableToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="mt-4 inline-flex items-center gap-1.5 font-mono text-[0.5625rem] tracking-[0.12em] text-ink-muted uppercase transition-colors hover:text-brass"
    >
      <Table2 className="size-3" strokeWidth={1.8} aria-hidden />
      {open ? "Hide table" : "View as table"}
    </button>
  );
}
