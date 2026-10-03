"use client";

import { useMemo, useState } from "react";

import { CompositionBar, StatTile } from "@/components/calculators/charts";
import { MoneyField, SliderField } from "@/components/calculators/controls";
import { calculateStampDuty, calculateYield } from "@/lib/finance";
import { formatPrice, formatRupeesExact } from "@/lib/format";

/**
 * Rental yield & ROI.
 *
 * The honest version. Ahmedabad residential gross yields sit around 2.5–3.5%,
 * and net yields after maintenance, tax, vacancy and repairs are often under
 * 2% — which is below a fixed deposit. Any calculator that shows only gross
 * yield is flattering the asset by nearly two full points.
 *
 * Saying that plainly is better business than hiding it: an investor who buys
 * on a real number does not come back angry in year three, and they refer
 * people.
 */
export function YieldCalculator() {
  const [price, setPrice] = useState(8_000_000);
  const [rent, setRent] = useState(22_000);
  const [maintenance, setMaintenance] = useState(36_000);
  const [tax, setTax] = useState(9_000);
  const [vacancy, setVacancy] = useState(1);
  const [appreciation, setAppreciation] = useState(6);
  const [horizon, setHorizon] = useState(10);

  const result = useMemo(
    () =>
      calculateYield({
        purchasePrice: price,
        monthlyRent: rent,
        annualMaintenance: maintenance,
        annualPropertyTax: tax,
        vacancyMonths: vacancy,
        appreciationPct: appreciation,
        horizonYears: horizon,
      }),
    [price, rent, maintenance, tax, vacancy, appreciation, horizon],
  );

  const duty = calculateStampDuty(price, "male");
  const allIn = price + duty.total;

  // The comparison that matters: a fixed deposit at ~7% is the alternative.
  const fdValue = allIn * Math.pow(1.07, horizon);
  const propertyValue = result.projectedValue + result.netAnnualIncome * horizon;
  const beatsFd = propertyValue > fdValue;

  return (
    <div className="grid gap-10 lg:grid-cols-[21rem_1fr] lg:gap-14">
      {/* ── Inputs ──────────────────────────────────────────────────────── */}
      <div className="space-y-7 lg:sticky lg:top-24 lg:self-start">
        <MoneyField
          label="Purchase price"
          value={price}
          onChange={setPrice}
          min={500_000}
          max={200_000_000}
          step={100_000}
          quick={[5_000_000, 8_000_000, 15_000_000]}
        />

        <MoneyField
          label="Monthly rent"
          value={rent}
          onChange={setRent}
          min={2_000}
          max={1_000_000}
          step={500}
          quick={[18_000, 25_000, 40_000]}
          hint="What it realistically fetches today — not the asking rent on a portal."
        />

        <MoneyField
          label="Annual maintenance"
          value={maintenance}
          onChange={setMaintenance}
          min={0}
          max={1_000_000}
          step={1_000}
          hint="Society charges. On an amenity-heavy tower this is often ₹3–5/sq.ft per month."
        />

        <MoneyField
          label="Annual property tax"
          value={tax}
          onChange={setTax}
          min={0}
          max={500_000}
          step={500}
        />

        <SliderField
          label="Vacancy allowance"
          value={vacancy}
          display={`${vacancy} ${vacancy === 1 ? "month" : "months"}/yr`}
          onChange={setVacancy}
          min={0}
          max={4}
          step={1}
          hint="One month a year is realistic between tenants. Assuming zero is how yields get overstated."
        />

        <SliderField
          label="Expected appreciation"
          value={appreciation}
          display={`${appreciation}% p.a.`}
          onChange={setAppreciation}
          min={0}
          max={15}
          step={0.5}
          hint="Ahmedabad has averaged roughly 5–8% over the last decade, varying sharply by corridor."
        />

        <SliderField
          label="Holding period"
          value={horizon}
          display={`${horizon} years`}
          onChange={setHorizon}
          min={3}
          max={25}
          step={1}
        />
      </div>

      {/* ── Output ──────────────────────────────────────────────────────── */}
      <div className="min-w-0 space-y-10">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label="Gross yield"
            value={`${result.grossYieldPct.toFixed(2)}%`}
            sub="Annual rent ÷ all-in cost"
          />
          <StatTile
            label="Net yield"
            value={`${result.netYieldPct.toFixed(2)}%`}
            sub="After costs and vacancy — the real number"
            tone="brass"
          />
          <StatTile
            label="Total CAGR"
            value={`${result.cagrPct.toFixed(2)}%`}
            sub={`Rent + appreciation over ${horizon} years`}
          />
        </div>

        {/* The straight comparison. */}
        <div
          className={`rounded-[2px] border p-6 ${
            beatsFd ? "border-verdant/25 bg-verdant-pale" : "border-alert/25 bg-alert-pale"
          }`}
        >
          <p className="font-semibold text-[0.6875rem] tracking-[0.14em] uppercase">
            Against a fixed deposit at 7%
          </p>
          <p className="mt-3 max-w-prose leading-relaxed text-ink-soft">
            Over {horizon} years, {formatPrice(Math.round(allIn))} put into this
            property projects to{" "}
            <strong className="font-medium text-ink" data-numeric>
              {formatPrice(Math.round(propertyValue))}
            </strong>{" "}
            including net rent. The same money in an FD at 7% would reach{" "}
            <strong className="font-medium text-ink" data-numeric>
              {formatPrice(Math.round(fdValue))}
            </strong>
            .{" "}
            {beatsFd
              ? "The property wins here — but it is illiquid, needs managing, and the appreciation figure is an assumption, not a promise."
              : "On these assumptions the FD wins. If this is purely an investment, the appreciation or the rent needs to be higher to justify it — and that is worth knowing before you buy, not after."}
          </p>
        </div>

        <section
          aria-labelledby="income"
          className="rounded-[2px] border border-rule bg-paper p-6 lg:p-7"
        >
          <h2 id="income" className="eyebrow mb-5">
            Where the rent goes, each year
          </h2>

          <CompositionBar
            segments={[
              {
                label: "Kept as income",
                value: Math.max(0, Math.round(result.netAnnualIncome)),
                slot: 1,
              },
              { label: "Maintenance + tax + repairs", value: Math.round(result.annualCosts), slot: 2 },
              {
                label: "Lost to vacancy",
                value: Math.round(rent * vacancy),
                slot: 3,
              },
            ]}
            total={result.annualRent}
            caption={`On ${formatRupeesExact(result.annualRent)} of annual rent you keep ${formatRupeesExact(
              Math.round(result.netAnnualIncome),
            )}. That gap between gross and net is the part a listing never mentions.`}
          />
        </section>

        <section aria-labelledby="facts" className="rounded-[2px] border border-rule bg-sand p-6">
          <h2 id="facts" className="eyebrow mb-5">
            The numbers behind it
          </h2>

          <dl className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
            <Row label="All-in acquisition cost" value={formatRupeesExact(Math.round(allIn))} note="Price + 5.9% duty" />
            <Row label="Annual rent (asking)" value={formatRupeesExact(result.annualRent)} />
            <Row
              label="Annual costs"
              value={formatRupeesExact(Math.round(result.annualCosts))}
              note="Maintenance + tax + 0.5% repairs"
            />
            <Row
              label="Net annual income"
              value={formatRupeesExact(Math.round(result.netAnnualIncome))}
            />
            <Row
              label="Break-even on cost"
              value={
                Number.isFinite(result.breakEvenYears)
                  ? `${result.breakEvenYears.toFixed(1)} years`
                  : "Never, on these costs"
              }
              note="From net rent alone, ignoring appreciation"
            />
            <Row
              label={`Projected value, year ${horizon}`}
              value={formatPrice(Math.round(result.projectedValue))}
            />
          </dl>

          <p className="mt-6 max-w-prose border-t border-rule-strong/50 pt-4 text-[0.75rem] leading-relaxed text-ink-faint">
            Rental income is taxable in your hands after a 30% standard
            deduction, and a sale within 24 months attracts short-term capital
            gains at your slab rate. Neither is modelled above. This excludes
            brokerage on re-letting, and any loan — if the purchase is
            leveraged, the interest will exceed the net rent for most of the
            term.
          </p>
        </section>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule/60 pb-2">
      <dt className="text-caption text-ink-muted">
        {label}
        {note && <span className="block text-[0.6875rem] text-ink-faint">{note}</span>}
      </dt>
      <dd className="shrink-0 text-[1.0625rem] font-semibold text-ink tabular-nums" data-numeric>
        {value}
      </dd>
    </div>
  );
}
