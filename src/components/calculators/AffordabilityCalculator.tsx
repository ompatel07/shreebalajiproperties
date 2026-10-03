"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { CompositionBar, StatTile } from "@/components/calculators/charts";
import { MoneyField, SliderField } from "@/components/calculators/controls";
import { budgetBands, localities } from "@/config/site";
import { calculateAffordability, calculateStampDuty } from "@/lib/finance";
import { formatPrice, formatRupeesExact } from "@/lib/format";

/**
 * "What can I actually afford?"
 *
 * The most useful calculator for a first-time buyer, and the one portals
 * almost never build — because the honest answer is usually lower than the
 * buyer hoped, and portals are incentivised to show a bigger number.
 *
 * It models what a lender really underwrites: FOIR on net income, the RBI LTV
 * ceiling by ticket size, and the non-financeable duty. Then it maps the
 * result onto localities where that budget genuinely buys something, which
 * turns a sobering number into a useful next step.
 */
export function AffordabilityCalculator() {
  const [income, setIncome] = useState(150_000);
  const [existingEmis, setExistingEmis] = useState(0);
  const [savings, setSavings] = useState(2_000_000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const result = useMemo(
    () =>
      calculateAffordability({
        netMonthlyIncome: income,
        existingEmis,
        annualRatePct: rate,
        years,
        savings,
      }),
    [income, existingEmis, rate, years, savings],
  );

  // Cash on hand is often the real constraint, not income.
  const cashConstrained = savings > 0 && savings < result.totalCashNeeded;

  const priceFromCash = useMemo(() => {
    if (!cashConstrained) return result.maxPropertyPrice;
    // Solve price where downPayment + duty = savings, at a 20% down / 5.9% duty
    // approximation. Good enough for guidance and transparent about it.
    return savings / (0.2 + 0.059);
  }, [cashConstrained, savings, result.maxPropertyPrice]);

  const workingBudget = Math.min(result.maxPropertyPrice, priceFromCash);
  const duty = calculateStampDuty(workingBudget, "male");

  // Localities where the mid-rate × a 1,250 sq.ft 3 BHK fits the budget.
  const reachable = useMemo(() => {
    const assumedCarpet = 1250;

    // Only areas where we actually hold a rate band can be matched against a
    // budget. The rest are reachable too — we just will not pretend to know
    // the number, so they are not listed here.
    return localities
      .filter(
        (l): l is typeof l & { pricePerSqft: [number, number] } =>
          Boolean(l.pricePerSqft),
      )
      .filter((l) => {
        const mid = (l.pricePerSqft[0] + l.pricePerSqft[1]) / 2;
        return mid * assumedCarpet <= workingBudget;
      })
      .sort(
        (a, b) =>
          (b.pricePerSqft[0] + b.pricePerSqft[1]) / 2 -
          (a.pricePerSqft[0] + a.pricePerSqft[1]) / 2,
      )
      .slice(0, 9);
  }, [workingBudget]);

  const matchedBand = budgetBands.find(
    (b) => workingBudget >= b.min && (b.max === null || workingBudget <= b.max),
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[21rem_1fr] lg:gap-14">
      {/* ── Inputs ──────────────────────────────────────────────────────── */}
      <div className="space-y-7 lg:sticky lg:top-24 lg:self-start">
        <MoneyField
          label="Net monthly income"
          value={income}
          onChange={setIncome}
          min={20_000}
          max={2_000_000}
          step={5_000}
          quick={[75_000, 150_000, 300_000, 500_000]}
          hint="Take-home, after tax and PF. Combined, if you are applying jointly."
        />

        <MoneyField
          label="Existing EMIs"
          value={existingEmis}
          onChange={setExistingEmis}
          min={0}
          max={500_000}
          step={1_000}
          hint="Car, personal, education, credit-card instalments. Lenders count all of it against you."
        />

        <MoneyField
          label="Cash available"
          value={savings}
          onChange={setSavings}
          min={0}
          max={100_000_000}
          step={100_000}
          quick={[1_500_000, 2_500_000, 5_000_000]}
          hint="For the down payment plus stamp duty. Keep an emergency fund out of this figure."
        />

        <SliderField
          label="Interest rate"
          value={rate}
          display={`${rate.toFixed(2)}% p.a.`}
          onChange={setRate}
          min={7}
          max={13}
          step={0.05}
        />

        <SliderField
          label="Tenure"
          value={years}
          display={`${years} years`}
          onChange={setYears}
          min={5}
          max={30}
          step={1}
        />
      </div>

      {/* ── Output ──────────────────────────────────────────────────────── */}
      <div className="min-w-0 space-y-10">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label="Realistic budget"
            value={formatPrice(Math.round(workingBudget))}
            sub={cashConstrained ? "Limited by your cash, not your income" : "Limited by loan eligibility"}
            tone="brass"
          />
          <StatTile
            label="Loan you should get"
            value={formatPrice(Math.round(result.maxLoan))}
            sub={`EMI ${formatRupeesExact(Math.round(result.maxEmi))}/mo`}
          />
          <StatTile
            label="Cash needed up front"
            value={formatPrice(Math.round(workingBudget * 0.2 + duty.total))}
            sub="Down payment + duty, not financeable"
          />
        </div>

        {/* The constraint, named. This is the insight the page exists for. */}
        <div
          className={`rounded-[2px] border p-6 ${
            cashConstrained
              ? "border-alert/25 bg-alert-pale"
              : "border-verdant/25 bg-verdant-pale"
          }`}
        >
          <p className="font-mono text-[0.5625rem] tracking-[0.14em] uppercase">
            {cashConstrained ? "Your binding constraint: cash" : "Your binding constraint: income"}
          </p>
          <p className="mt-3 max-w-prose leading-relaxed text-ink-soft">
            {cashConstrained ? (
              <>
                Your income supports a loan of about{" "}
                {formatPrice(Math.round(result.maxLoan))}, which would reach a{" "}
                {formatPrice(Math.round(result.maxPropertyPrice))} property — but
                that needs roughly{" "}
                {formatPrice(Math.round(result.totalCashNeeded))} in cash for the
                down payment and duty, and you have{" "}
                {formatPrice(savings)}. So the practical ceiling today is{" "}
                <strong className="font-medium text-ink">
                  {formatPrice(Math.round(workingBudget))}
                </strong>
                . Waiting two or three quarters to build the down payment often
                buys more than stretching the loan does.
              </>
            ) : (
              <>
                You have enough cash for the down payment, so the limit is what a
                lender will sanction. At a{" "}
                {result.foirUsed.toFixed(0)}% obligation-to-income ratio your EMI
                can reach {formatRupeesExact(Math.round(result.maxEmi))} a month,
                which supports roughly{" "}
                <strong className="font-medium text-ink">
                  {formatPrice(Math.round(result.maxPropertyPrice))}
                </strong>
                . Clearing an existing EMI before you apply is usually the
                fastest way to lift this.
              </>
            )}
          </p>
        </div>

        <section
          aria-labelledby="funding"
          className="rounded-[2px] border border-rule bg-paper p-6 lg:p-7"
        >
          <h2 id="funding" className="eyebrow mb-5">
            How a {formatPrice(Math.round(workingBudget))} purchase gets funded
          </h2>

          <CompositionBar
            segments={[
              { label: "Home loan", value: Math.round(workingBudget * 0.8), slot: 1 },
              { label: "Down payment", value: Math.round(workingBudget * 0.2), slot: 2 },
              { label: "Stamp duty + registration", value: Math.round(duty.total), slot: 3 },
            ]}
            caption="At a typical 80% loan-to-value. Lenders allow up to 90% below ₹30 lakh and cap at 75% above ₹75 lakh."
          />
        </section>

        {/* Turn the number into a next action. */}
        <section
          aria-labelledby="where"
          className="rounded-[2px] border border-rule bg-sand p-6 lg:p-7"
        >
          <h2 id="where" className="eyebrow mb-2">
            Where that budget actually buys a 3 BHK
          </h2>
          <p className="mb-6 max-w-prose text-caption leading-relaxed text-ink-muted">
            Assuming around 1,250 sq.ft of carpet area, these are the corridors
            where {formatPrice(Math.round(workingBudget))} is realistic at
            current rates. Ordered most to least expensive.
          </p>

          {reachable.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {reachable.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/${l.city}/${l.slug}/3-bhk-flats`}
                    className="group flex items-baseline justify-between gap-3 rounded-[2px] border border-rule bg-paper px-3.5 py-2.5 transition-colors hover:border-ink"
                  >
                    <span className="text-[0.9375rem] text-ink">{l.name}</span>
                    <span
                      className="shrink-0 font-mono text-[0.5625rem] text-ink-faint tabular-nums"
                      data-numeric
                    >
                      ₹{(l.pricePerSqft[0] / 1000).toFixed(1)}K+
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.9375rem] text-ink-muted">
              At this budget a 3 BHK is a stretch in the localities we cover — but
              a 2 BHK, or a 3 BHK further out on the ring road, very likely is.
              Talk to us and we will tell you exactly where.
            </p>
          )}

          {matchedBand && (
            <Link
              href={`/ahmedabad/${matchedBand.slug}`}
              className="group mt-7 inline-flex items-center gap-2 font-mono text-micro tracking-[0.14em] text-brass uppercase"
            >
              <span className="link-draw">
                See everything in {matchedBand.label}
              </span>
              <ArrowUpRight
                className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          )}
        </section>

        <p className="max-w-prose text-[0.75rem] leading-relaxed text-ink-faint">
          Guidance only, not a credit decision. Real sanctions turn on your
          credit score, employer category, job stability, age and the
          property&rsquo;s own legal and technical appraisal. We will put your
          profile in front of several lenders at once so you can compare actual
          offers rather than estimates — at no charge to you.
        </p>
      </div>
    </div>
  );
}
