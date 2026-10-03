"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";

import { CompositionBar, StatTile } from "@/components/calculators/charts";
import { ChoiceField, MoneyField } from "@/components/calculators/controls";
import { GUJARAT_RATES, calculateStampDuty, type BuyerType } from "@/lib/finance";
import { formatPrice, formatRupeesExact } from "@/lib/format";

/**
 * Gujarat stamp duty & registration.
 *
 * The most valuable calculator on the site for two reasons: it is a genuinely
 * high-intent search ("stamp duty calculator Gujarat"), and almost no
 * competitor surfaces the female-buyer registration waiver clearly — which is
 * a real, often-missed saving of 1% of the property value.
 */
export function StampDutyCalculator({ initialPrice }: { initialPrice?: number }) {
  const [value, setValue] = useState(initialPrice ?? 7_500_000);
  const [buyer, setBuyer] = useState<BuyerType>("male");

  const result = useMemo(() => calculateStampDuty(value, buyer), [value, buyer]);

  return (
    <div className="grid gap-10 lg:grid-cols-[21rem_1fr] lg:gap-14">
      {/* ── Inputs ──────────────────────────────────────────────────────── */}
      <div className="space-y-7 lg:sticky lg:top-24 lg:self-start">
        <MoneyField
          label="Property value"
          value={value}
          onChange={setValue}
          min={100_000}
          max={200_000_000}
          step={50_000}
          quick={[5_000_000, 7_500_000, 10_000_000, 25_000_000]}
          hint="Duty is charged on whichever is HIGHER — your agreement value or the government jantri rate. Enter the higher figure."
        />

        <ChoiceField
          label="Ownership"
          value={buyer}
          onChange={setBuyer}
          options={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female (sole)" },
            { value: "joint", label: "Joint" },
          ]}
          hint="Gujarat waives the 1% registration fee when the sole purchaser is a woman. On a joint purchase the fee applies."
        />

        <div className="rounded-[2px] border border-rule bg-sand p-5">
          <p className="flex items-center gap-2 font-mono text-[0.5625rem] tracking-[0.14em] text-ink-muted uppercase">
            <Info className="size-3" strokeWidth={2} aria-hidden />
            Rates applied
          </p>
          <dl className="mt-3 space-y-1.5 text-caption">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Basic stamp duty</dt>
              <dd className="text-ink tabular-nums">{GUJARAT_RATES.basicStampDutyPct}%</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Surcharge (of basic)</dt>
              <dd className="text-ink tabular-nums">{GUJARAT_RATES.surchargeOfBasicPct}%</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-rule pt-1.5">
              <dt className="text-ink-muted">Effective duty</dt>
              <dd className="text-ink tabular-nums">
                {GUJARAT_RATES.effectiveStampDutyPct}%
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Registration</dt>
              <dd className="text-ink tabular-nums">
                {GUJARAT_RATES.registrationPct[buyer]}%
              </dd>
            </div>
          </dl>
          <p className="mt-3 font-mono text-[0.5rem] tracking-[0.1em] text-ink-faint uppercase">
            Per {GUJARAT_RATES.asOf}
          </p>
        </div>
      </div>

      {/* ── Output ──────────────────────────────────────────────────────── */}
      <div className="min-w-0 space-y-10">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label="Stamp duty"
            value={formatRupeesExact(Math.round(result.stampDuty))}
            sub={`${GUJARAT_RATES.effectiveStampDutyPct}% of value`}
          />
          <StatTile
            label="Registration"
            value={formatRupeesExact(Math.round(result.registration))}
            sub={
              buyer === "female"
                ? "Waived for a sole female purchaser"
                : `${GUJARAT_RATES.registrationPct[buyer]}% of value`
            }
          />
          <StatTile
            label="Total payable"
            value={formatRupeesExact(Math.round(result.total))}
            sub={`${result.effectiveRatePct.toFixed(2)}% all-in`}
            tone="brass"
          />
        </div>

        {/* The saving, when it applies. Worth its own callout — it is real
            money and most buyers do not know it exists. */}
        {result.savingsVsMale > 0 && (
          <div className="rounded-[2px] border border-verdant/30 bg-verdant-pale p-6">
            <p className="font-mono text-[0.5625rem] tracking-[0.14em] text-verdant uppercase">
              Saving available
            </p>
            <p className="mt-2 font-display text-h3 text-ink" data-numeric>
              {formatRupeesExact(Math.round(result.savingsVsMale))}
            </p>
            <p className="mt-2 max-w-prose text-caption leading-relaxed text-ink-soft">
              Registering the property in the name of a sole female purchaser
              waives the 1% registration fee in Gujarat. On this value that is{" "}
              {formatRupeesExact(Math.round(result.savingsVsMale))} saved. It is
              a genuine concession, but it also decides who legally owns the
              asset — worth a conversation with your CA before you structure it
              that way.
            </p>
          </div>
        )}

        <section
          aria-labelledby="breakdown"
          className="rounded-[2px] border border-rule bg-paper p-6 lg:p-7"
        >
          <h2 id="breakdown" className="eyebrow mb-5">
            Total acquisition cost
          </h2>

          <CompositionBar
            segments={[
              { label: "Property value", value, slot: 1 },
              { label: "Stamp duty", value: Math.round(result.stampDuty), slot: 2 },
              { label: "Registration", value: Math.round(result.registration), slot: 3 },
            ]}
            caption={`A ${formatPrice(value)} property actually costs ${formatPrice(
              Math.round(value + result.total),
            )} to acquire. None of the duty or registration is financeable — it is due in cash at the sub-registrar's office.`}
          />
        </section>

        <section aria-labelledby="notes" className="rounded-[2px] border border-rule bg-sand p-6">
          <h2 id="notes" className="eyebrow mb-4">
            What this does not include
          </h2>
          <ul className="max-w-prose space-y-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
            <li>
              <strong className="font-medium text-ink">Jantri rate.</strong> Duty
              is levied on the higher of your agreement value and the
              government&rsquo;s jantri valuation for that survey number. If
              jantri is higher, your duty is higher — we check this for you
              before you sign anything.
            </li>
            <li>
              <strong className="font-medium text-ink">GST.</strong> Under-construction
              property attracts GST (currently 1% on affordable, 5% otherwise,
              without input credit). A ready, completed property does not.
            </li>
            <li>
              <strong className="font-medium text-ink">Legal and incidental.</strong>{" "}
              Advocate fees, society transfer charges, share-money, and the
              lender&rsquo;s processing fee and mortgage-deed duty on the loan
              itself.
            </li>
          </ul>

          <p className="mt-5 border-t border-rule-strong/50 pt-4 text-[0.75rem] leading-relaxed text-ink-faint">
            These rates are maintained by hand against the{" "}
            {GUJARAT_RATES.asOf} and are provided for planning only. Always
            confirm the current rate with the sub-registrar or your advocate
            before a transaction — we do not accept liability for a figure taken
            from this page.
          </p>
        </section>
      </div>
    </div>
  );
}
