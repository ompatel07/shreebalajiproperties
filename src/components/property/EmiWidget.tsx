"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { calculateEmi } from "@/lib/finance";
import { formatPrice, formatRupeesExact } from "@/lib/format";

/**
 * Inline EMI estimator for the property sidebar.
 *
 * Pre-filled from the listing price at 80% LTV — the number a buyer wants is
 * "what will this cost me a month", and making them type the price again to
 * find out is pointless friction.
 *
 * Interest rate defaults to a realistic current floor rather than an
 * optimistic teaser; the whole credibility of the tool rests on not
 * flattering the figure.
 */
export function EmiWidget({ price }: { price: number }) {
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const loan = Math.max(0, Math.round(price * (1 - downPct / 100)));
  const result = useMemo(() => calculateEmi(loan, rate, years), [loan, rate, years]);

  return (
    <div className="rounded-[2px] border border-rule bg-sand p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Monthly, roughly</p>
        <Link
          href={`/calculators/home-loan-emi?price=${price}`}
          className="group inline-flex items-center gap-1 font-mono text-[0.5625rem] tracking-[0.12em] text-brass uppercase"
        >
          <span className="link-draw">Full calculator</span>
          <ArrowUpRight
            className="size-2.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={2.2}
            aria-hidden
          />
        </Link>
      </div>

      <p className="mt-3 font-display text-h2 leading-none text-ink" data-numeric>
        {formatRupeesExact(Math.round(result.emi))}
        <span className="ml-1.5 font-mono text-micro tracking-[0.1em] text-ink-muted uppercase">
          /mo
        </span>
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-rule-strong/50 py-4 font-mono text-[0.625rem] tracking-[0.08em] uppercase">
        <div className="flex justify-between gap-2">
          <dt className="text-ink-faint">Loan</dt>
          <dd className="text-ink-soft" data-numeric>
            {formatPrice(loan)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-ink-faint">Interest</dt>
          <dd className="text-ink-soft" data-numeric>
            {formatPrice(Math.round(result.totalInterest))}
          </dd>
        </div>
      </dl>

      <div className="mt-5 space-y-4">
        <Slider
          label="Down payment"
          value={downPct}
          display={`${downPct}% · ${formatPrice(Math.round(price * (downPct / 100)))}`}
          min={10}
          max={60}
          step={5}
          onChange={setDownPct}
        />
        <Slider
          label="Interest rate"
          value={rate}
          display={`${rate.toFixed(2)}% p.a.`}
          min={7}
          max={12}
          step={0.05}
          onChange={setRate}
        />
        <Slider
          label="Tenure"
          value={years}
          display={`${years} years`}
          min={5}
          max={30}
          step={1}
          onChange={setYears}
        />
      </div>

      <p className="mt-5 text-[0.6875rem] leading-relaxed text-ink-faint">
        Indicative only. Your actual rate depends on your credit profile and the
        lender, and this excludes stamp duty, registration and processing fees.
      </p>
    </div>
  );
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-muted uppercase">
          {label}
        </span>
        <span className="font-mono text-[0.625rem] text-ink tabular-nums" data-numeric>
          {display}
        </span>
      </span>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        // `accent-color` styles the native track and thumb in one property —
        // a custom-drawn slider would lose keyboard and touch behaviour.
        className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-rule-strong accent-brass"
        style={{ accentColor: "var(--color-brass)" }}
      />
    </label>
  );
}
