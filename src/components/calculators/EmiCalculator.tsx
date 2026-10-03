"use client";

import { useMemo, useState } from "react";

import { AmortisationChart, CompositionBar, StatTile } from "@/components/calculators/charts";
import { MoneyField, SliderField } from "@/components/calculators/controls";
import { amortisationSchedule, calculateEmi, homeLoanTaxBenefit } from "@/lib/finance";
import { formatPrice, formatRupeesExact } from "@/lib/format";

/**
 * Home loan EMI.
 *
 * Seeded from `?price=` so the "Full calculator" link on a listing carries
 * that property's price straight in.
 *
 * Two things most Indian EMI calculators get wrong, and this one does not:
 *   · They quote the EMI and stop. The number that changes a decision is
 *     total interest — often more than the loan itself over 25 years — so
 *     that is given equal weight.
 *   · They ignore stamp duty. It is ~5.9% in Gujarat, not financeable, and
 *     due in cash at registration. The cash-needed figure includes it.
 */
export function EmiCalculator({ initialPrice }: { initialPrice?: number }) {
  const [price, setPrice] = useState(initialPrice ?? 8_500_000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const loan = Math.max(0, Math.round(price * (1 - downPct / 100)));
  const downPayment = price - loan;

  const result = useMemo(() => calculateEmi(loan, rate, years), [loan, rate, years]);
  const schedule = useMemo(
    () => amortisationSchedule(loan, rate, years),
    [loan, rate, years],
  );

  // First-year split, used for the indicative tax relief figure.
  const firstYear = schedule[0];
  const tax = useMemo(
    () =>
      homeLoanTaxBenefit({
        annualPrincipal: firstYear?.principalPaid ?? 0,
        annualInterest: firstYear?.interestPaid ?? 0,
        marginalRatePct: 30,
      }),
    [firstYear],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[21rem_1fr] lg:gap-14">
      {/* ── Inputs ──────────────────────────────────────────────────────── */}
      <div className="space-y-7 lg:sticky lg:top-24 lg:self-start">
        <MoneyField
          label="Property price"
          value={price}
          onChange={setPrice}
          min={500_000}
          max={200_000_000}
          step={100_000}
          quick={[5_000_000, 7_500_000, 10_000_000, 20_000_000]}
          hint="The agreement value, before stamp duty and registration."
        />

        <SliderField
          label="Down payment"
          value={downPct}
          display={`${downPct}% · ${formatPrice(downPayment)}`}
          onChange={setDownPct}
          min={10}
          max={70}
          step={5}
          hint="Lenders cap the loan at 75–90% of value depending on ticket size, so 20% is the realistic floor on most purchases."
        />

        <SliderField
          label="Interest rate"
          value={rate}
          display={`${rate.toFixed(2)}% p.a.`}
          onChange={setRate}
          min={7}
          max={13}
          step={0.05}
          hint="Floating rates track the repo-linked benchmark. Your actual rate depends on your credit score and employer category."
        />

        <SliderField
          label="Tenure"
          value={years}
          display={`${years} years`}
          onChange={setYears}
          min={5}
          max={30}
          step={1}
          hint="A longer tenure cuts the monthly figure and raises total interest sharply. Compare both numbers, not just the EMI."
        />
      </div>

      {/* ── Output ──────────────────────────────────────────────────────── */}
      <div className="min-w-0 space-y-10">
        {/* Hero number first — it is the question being asked. */}
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label="Monthly EMI"
            value={formatRupeesExact(Math.round(result.emi))}
            sub={`over ${years * 12} instalments`}
            tone="brass"
          />
          <StatTile
            label="Total interest"
            value={formatPrice(Math.round(result.totalInterest))}
            sub={`${result.interestShare.toFixed(0)}% of everything you pay`}
          />
          <StatTile
            label="Total outflow"
            value={formatPrice(Math.round(result.totalPayment))}
            sub="principal + interest"
          />
        </div>

        {/* Part-to-whole: what the total outflow is made of. */}
        <section
          aria-labelledby="split"
          className="rounded-[2px] border border-rule bg-paper p-6 lg:p-7"
        >
          <h2 id="split" className="eyebrow mb-5">
            What you actually pay the bank
          </h2>
          <CompositionBar
            segments={[
              { label: "Principal", value: loan, slot: 1 },
              { label: "Interest", value: Math.round(result.totalInterest), slot: 2 },
            ]}
            caption={`Over ${years} years at ${rate.toFixed(2)}%, you repay ${formatPrice(
              Math.round(result.totalPayment),
            )} on a ${formatPrice(loan)} loan. The interest is not a fee — it is the price of time.`}
          />
        </section>

        {/* Change over time. */}
        <section
          aria-labelledby="amort"
          className="rounded-[2px] border border-rule bg-paper p-6 lg:p-7"
        >
          <h2 id="amort" className="sr-only">
            Amortisation schedule
          </h2>
          <AmortisationChart rows={schedule} />

          <p className="mt-5 max-w-prose border-t border-rule pt-4 text-caption leading-relaxed text-ink-muted">
            Notice the first few years: almost the entire instalment is
            interest, and the outstanding balance barely moves. That is why
            prepaying early saves disproportionately more than prepaying later —
            and why a 30-year tenure is rarely the bargain the lower EMI makes
            it look.
          </p>
        </section>

        {/* Cash needed — the number that catches buyers out. */}
        <section
          aria-labelledby="cash"
          className="rounded-[2px] border border-brass/30 bg-brass-pale/40 p-6 lg:p-7"
        >
          <h2 id="cash" className="eyebrow mb-5 text-brass-deep">
            Cash you need before the keys
          </h2>

          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
            <div>
              <dt className="text-caption text-ink-muted">Down payment</dt>
              <dd className="font-display text-h4 text-ink" data-numeric>
                {formatPrice(downPayment)}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-ink-muted">Stamp duty + registration</dt>
              <dd className="font-display text-h4 text-ink" data-numeric>
                {formatPrice(Math.round(price * 0.059))}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-ink-muted">Total, in cash</dt>
              <dd className="font-display text-h4 text-brass-deep" data-numeric>
                {formatPrice(Math.round(downPayment + price * 0.059))}
              </dd>
            </div>
          </dl>

          <p className="mt-4 max-w-prose text-[0.75rem] leading-relaxed text-ink-muted">
            Stamp duty and registration cannot be added to the home loan. At
            Gujarat&rsquo;s 4.9% duty plus 1% registration, that is roughly 5.9%
            of the agreement value, payable at the sub-registrar&rsquo;s office.
            Budget it from day one — it is the single most common reason a
            booking falls through.
          </p>
        </section>

        {/* Tax relief, flagged as indicative. */}
        <section aria-labelledby="tax" className="rounded-[2px] border border-rule bg-sand p-6">
          <h2 id="tax" className="eyebrow mb-4">
            Indicative tax relief, first year
          </h2>

          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="text-caption text-ink-muted">§80C — principal</dt>
              <dd className="font-display text-[1.0625rem] text-ink" data-numeric>
                {formatRupeesExact(Math.round(tax.section80C))}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-ink-muted">§24(b) — interest</dt>
              <dd className="font-display text-[1.0625rem] text-ink" data-numeric>
                {formatRupeesExact(Math.round(tax.section24B))}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-ink-muted">Tax saved at 30%</dt>
              <dd className="font-display text-[1.0625rem] text-verdant" data-numeric>
                {formatRupeesExact(Math.round(tax.totalSaving))}
              </dd>
            </div>
          </dl>

          <p className="mt-4 max-w-prose text-[0.75rem] leading-relaxed text-ink-faint">
            Old-regime figures for a self-occupied property, at a 30% marginal
            rate. The new regime removes most of this, and which one suits you
            is a personal calculation — please check with your CA rather than
            relying on this box.
          </p>
        </section>
      </div>
    </div>
  );
}
