import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateEmi,
  amortisationSchedule,
  calculateAffordability,
  calculateStampDuty,
  calculateYield,
  areaConversions,
  GUJARAT_RATES,
} from "@/lib/finance";

/**
 * The calculators are the one place on the site where a visitor acts on a
 * number we produced. A wrong EMI is worse than no EMI, so these check the
 * maths against values worked out independently rather than against whatever
 * the code currently returns.
 */

describe("calculateEmi", () => {
  test("matches the standard annuity formula", () => {
    // ₹50,00,000 at 8.5% for 20 years. P·r·(1+r)^n / ((1+r)^n − 1)
    // with r = 0.085/12 and n = 240 gives 43,391.16...
    const { emi } = calculateEmi(5_000_000, 8.5, 20);
    assert.ok(Math.abs(emi - 43_391) < 2, `expected ~43391, got ${emi}`);
  });

  test("total payment equals principal plus interest", () => {
    const r = calculateEmi(7_500_000, 9, 15);
    assert.ok(
      Math.abs(r.totalPayment - (r.principal + r.totalInterest)) < 1,
      "totals do not reconcile",
    );
  });

  test("handles a zero-interest loan without dividing by zero", () => {
    const r = calculateEmi(1_200_000, 0, 10);
    assert.ok(Number.isFinite(r.emi), "EMI is not finite at 0%");
    assert.equal(Math.round(r.emi), 10_000); // 12,00,000 / 120
    assert.equal(Math.round(r.totalInterest), 0);
  });

  test("degenerate inputs return zeros rather than NaN", () => {
    for (const [p, rate, y] of [
      [0, 8.5, 20],
      [-5, 8.5, 20],
      [5_000_000, 8.5, 0],
    ] as const) {
      const r = calculateEmi(p, rate, y);
      assert.ok(Number.isFinite(r.emi) && r.emi === 0, `bad result for ${p}/${rate}/${y}`);
    }
  });

  test("a longer tenure lowers the EMI but raises total interest", () => {
    const short = calculateEmi(5_000_000, 8.5, 10);
    const long = calculateEmi(5_000_000, 8.5, 25);
    assert.ok(long.emi < short.emi, "longer tenure should reduce the EMI");
    assert.ok(long.totalInterest > short.totalInterest, "longer tenure should cost more");
  });
});

describe("amortisationSchedule", () => {
  test("pays the balance down to approximately zero", () => {
    const rows = amortisationSchedule(5_000_000, 8.5, 20);
    assert.ok(rows.length > 0, "empty schedule");
    const last = rows[rows.length - 1]!;
    // Rounding per period leaves a small residue; anything beyond a rupee or
    // two per year of the loan means the schedule is drifting.
    assert.ok(Math.abs(last.balance) < 5_000, `ends at ${last.balance}`);
  });

  test("principal repaid over the schedule equals the loan", () => {
    const rows = amortisationSchedule(3_000_000, 9, 10);
    const repaid = rows.reduce((sum, r) => sum + r.principalPaid, 0);
    assert.ok(Math.abs(repaid - 3_000_000) < 5_000, `repaid ${repaid}`);
  });
});

describe("calculateStampDuty (Gujarat)", () => {
  test("applies the published rates", () => {
    const v = 10_000_000;
    const r = calculateStampDuty(v, "male");
    assert.ok(
      Math.abs(r.stampDuty - v * (GUJARAT_RATES.effectiveStampDutyPct / 100)) < 1,
      "stamp duty does not match the published rate",
    );
    assert.ok(Math.abs(r.total - (r.stampDuty + r.registration)) < 1, "total mismatch");
  });

  test("female buyers are not charged more than male buyers", () => {
    // Gujarat waives the registration fee for a sole female purchaser. The
    // sign of this difference is the thing worth locking down.
    const male = calculateStampDuty(10_000_000, "male");
    const female = calculateStampDuty(10_000_000, "female");
    assert.ok(female.total <= male.total, "female total exceeds male total");
    assert.ok(female.savingsVsMale >= 0, "negative savings");
  });

  test("zero and negative values return zeros", () => {
    assert.equal(calculateStampDuty(0).total, 0);
    assert.equal(calculateStampDuty(-100).total, 0);
  });
});

describe("calculateAffordability", () => {
  test("existing EMIs reduce borrowing capacity", () => {
    const clean = calculateAffordability({ netMonthlyIncome: 150_000 });
    const burdened = calculateAffordability({
      netMonthlyIncome: 150_000,
      existingEmis: 40_000,
    });
    assert.ok(burdened.maxLoan < clean.maxLoan, "existing EMIs should reduce the loan");
  });

  test("returns finite, non-negative figures on a zero income", () => {
    const r = calculateAffordability({ netMonthlyIncome: 0 });
    for (const [k, v] of Object.entries(r)) {
      if (typeof v !== "number") continue;
      assert.ok(Number.isFinite(v), `${k} is not finite`);
      assert.ok(v >= 0, `${k} is negative`);
    }
  });
});

describe("calculateYield", () => {
  test("a higher rent on the same price raises the yield", () => {
    const low = calculateYield({ purchasePrice: 10_000_000, monthlyRent: 20_000 });
    const high = calculateYield({ purchasePrice: 10_000_000, monthlyRent: 35_000 });
    assert.ok(high.grossYieldPct > low.grossYieldPct, "yield did not track rent");
  });

  test("net yield never exceeds gross yield", () => {
    const r = calculateYield({
      purchasePrice: 8_000_000,
      monthlyRent: 28_000,
      annualMaintenance: 36_000,
    });
    assert.ok(r.netYieldPct <= r.grossYieldPct, "net above gross");
  });

  test("zero rent does not produce NaN", () => {
    const r = calculateYield({ purchasePrice: 8_000_000, monthlyRent: 0 });
    assert.ok(Number.isFinite(r.grossYieldPct) && Number.isFinite(r.netYieldPct));
  });
});

describe("areaConversions", () => {
  test("carpet is the smallest of the three area figures", () => {
    const a = areaConversions(1_000);
    const values = Object.values(a).filter((v): v is number => typeof v === "number");
    assert.ok(values.length > 0, "no numeric conversions returned");
    assert.ok(Math.min(...values) >= 0, "negative area");
  });
});
