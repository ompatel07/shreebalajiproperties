/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROPERTY FINANCE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Pure functions, no dependencies, no API calls. Every calculator on the site
 * runs on these, which is what makes the whole tool suite free to operate.
 *
 * ⚠️  STATUTORY RATES: the Gujarat stamp-duty and registration figures below
 *     are the rates in force as of the 2024–25 notification. They do change.
 *     `GUJARAT_RATES` is the single place to update them, and the UI shows the
 *     `asOf` date so a visitor can tell how fresh the number is. Always
 *     verify against the Gujarat Revenue Department before relying on it for
 *     an actual transaction — the UI says this too.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   HOME LOAN
   ═══════════════════════════════════════════════════════════════════════════ */

export interface EmiResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  /** Interest as a share of total outflow — the number that shocks people. */
  interestShare: number;
}

/**
 * Standard reducing-balance EMI:
 *
 *   EMI = P · r · (1+r)ⁿ / ((1+r)ⁿ − 1)
 *
 * where r is the MONTHLY rate and n the number of months. Indian lenders all
 * quote an annual rate on a reducing balance, so that conversion is the only
 * subtlety.
 */
export function calculateEmi(
  principal: number,
  annualRatePct: number,
  years: number,
): EmiResult {
  const months = Math.round(years * 12);

  if (principal <= 0 || months <= 0) {
    return { emi: 0, totalPayment: 0, totalInterest: 0, principal: 0, interestShare: 0 };
  }

  // A zero-interest loan is a divide-by-zero in the formula above.
  if (annualRatePct <= 0) {
    const emi = principal / months;
    return {
      emi,
      totalPayment: principal,
      totalInterest: 0,
      principal,
      interestShare: 0,
    };
  }

  const r = annualRatePct / 12 / 100;
  const growth = Math.pow(1 + r, months);
  const emi = (principal * r * growth) / (growth - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  return {
    emi,
    totalPayment,
    totalInterest,
    principal,
    interestShare: totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0,
  };
}

export interface AmortRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
  /** Share of the original loan retired by the end of this year. */
  equityPct: number;
}

/**
 * Year-by-year amortisation.
 *
 * Worth showing because it reveals the thing borrowers least expect: in the
 * first five years of a 20-year loan, the overwhelming majority of each
 * instalment is interest, and the outstanding principal barely moves.
 */
export function amortisationSchedule(
  principal: number,
  annualRatePct: number,
  years: number,
): AmortRow[] {
  const { emi } = calculateEmi(principal, annualRatePct, years);
  if (emi <= 0) return [];

  const r = annualRatePct / 12 / 100;
  const months = Math.round(years * 12);
  const rows: AmortRow[] = [];

  let balance = principal;

  for (let year = 1; year <= Math.ceil(years); year++) {
    let principalPaid = 0;
    let interestPaid = 0;

    for (let m = 0; m < 12; m++) {
      const monthIndex = (year - 1) * 12 + m;
      if (monthIndex >= months || balance <= 0) break;

      const interest = balance * r;
      // Final instalment: never amortise past zero.
      const principalPart = Math.min(emi - interest, balance);

      interestPaid += interest;
      principalPaid += principalPart;
      balance -= principalPart;
    }

    if (principalPaid <= 0 && interestPaid <= 0) break;

    rows.push({
      year,
      principalPaid,
      interestPaid,
      balance: Math.max(0, balance),
      equityPct: ((principal - Math.max(0, balance)) / principal) * 100,
    });
  }

  return rows;
}

/* ═══════════════════════════════════════════════════════════════════════════
   AFFORDABILITY
   ═══════════════════════════════════════════════════════════════════════════ */

export interface AffordabilityResult {
  maxEmi: number;
  maxLoan: number;
  maxPropertyPrice: number;
  /** Down payment implied by the LTV cap. */
  downPaymentNeeded: number;
  /** All-in cost including stamp duty and registration. */
  totalCashNeeded: number;
  foirUsed: number;
}

/**
 * Works backwards from income to a realistic purchase price.
 *
 * Uses FOIR (Fixed Obligation to Income Ratio), which is what Indian lenders
 * actually underwrite on: total EMIs must stay under ~50% of net monthly
 * income, tightening for lower incomes. Then applies the RBI LTV ceiling,
 * which caps the loan as a share of property value by ticket size:
 *
 *   ≤ ₹30 L   →  90%
 *   ≤ ₹75 L   →  80%
 *   >  ₹75 L  →  75%
 *
 * Because the LTV band depends on the price we are solving for, this iterates
 * to a fixed point rather than pretending one pass is correct.
 */
export function calculateAffordability({
  netMonthlyIncome,
  existingEmis = 0,
  annualRatePct = 8.5,
  years = 20,
  savings = 0,
}: {
  netMonthlyIncome: number;
  existingEmis?: number;
  annualRatePct?: number;
  years?: number;
  savings?: number;
}): AffordabilityResult {
  // Lenders are stricter at lower incomes.
  const foir =
    netMonthlyIncome < 50_000 ? 0.4 : netMonthlyIncome < 120_000 ? 0.45 : 0.5;

  const maxEmi = Math.max(0, netMonthlyIncome * foir - existingEmis);

  // Invert the EMI formula for principal.
  const r = annualRatePct / 12 / 100;
  const months = Math.round(years * 12);
  const growth = Math.pow(1 + r, months);
  const maxLoan = r > 0 ? (maxEmi * (growth - 1)) / (r * growth) : maxEmi * months;

  // Fixed-point iteration over the LTV band.
  let price = maxLoan / 0.8;
  for (let i = 0; i < 6; i++) {
    const ltv = price <= 3_000_000 ? 0.9 : price <= 7_500_000 ? 0.8 : 0.75;
    const next = maxLoan / ltv;
    if (Math.abs(next - price) < 1000) {
      price = next;
      break;
    }
    price = next;
  }

  const ltv = price <= 3_000_000 ? 0.9 : price <= 7_500_000 ? 0.8 : 0.75;
  const downPaymentNeeded = price * (1 - ltv);
  const duty = calculateStampDuty(price, "male");

  return {
    maxEmi,
    maxLoan,
    maxPropertyPrice: price,
    downPaymentNeeded,
    // The cost buyers forget: duty and registration are not financeable.
    totalCashNeeded: downPaymentNeeded + duty.total,
    foirUsed: foir * 100,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   STAMP DUTY & REGISTRATION — GUJARAT
   ═══════════════════════════════════════════════════════════════════════════ */

export const GUJARAT_RATES = {
  /** Basic stamp duty on market value. */
  basicStampDutyPct: 3.5,
  /** Surcharge, levied as a percentage OF the basic duty (not of value). */
  surchargeOfBasicPct: 40,
  /** Effective stamp duty = 3.5% + (40% × 3.5%) = 4.9%. */
  effectiveStampDutyPct: 4.9,
  /** Registration fee. Gujarat waives it for a sole female purchaser. */
  registrationPct: { male: 1.0, female: 0, joint: 1.0 },
  asOf: "2024-25 notification",
} as const;

export type BuyerType = "male" | "female" | "joint";

export interface StampDutyResult {
  stampDuty: number;
  registration: number;
  total: number;
  effectiveRatePct: number;
  /** Rupees saved versus a male sole purchaser. */
  savingsVsMale: number;
}

/**
 * Gujarat stamp duty and registration.
 *
 * Charged on the HIGHER of the agreement value and the jantri (government
 * circle) rate. We cannot look up jantri without a paid API, so the UI asks
 * the visitor to enter the higher figure and says why.
 */
export function calculateStampDuty(
  value: number,
  buyer: BuyerType = "male",
): StampDutyResult {
  if (value <= 0) {
    return { stampDuty: 0, registration: 0, total: 0, effectiveRatePct: 0, savingsVsMale: 0 };
  }

  const stampDuty = value * (GUJARAT_RATES.effectiveStampDutyPct / 100);
  const registration = value * (GUJARAT_RATES.registrationPct[buyer] / 100);
  const total = stampDuty + registration;

  const maleTotal = stampDuty + value * (GUJARAT_RATES.registrationPct.male / 100);

  return {
    stampDuty,
    registration,
    total,
    effectiveRatePct: (total / value) * 100,
    savingsVsMale: Math.max(0, maleTotal - total),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENTAL YIELD & ROI
   ═══════════════════════════════════════════════════════════════════════════ */

export interface YieldResult {
  grossYieldPct: number;
  netYieldPct: number;
  annualRent: number;
  annualCosts: number;
  netAnnualIncome: number;
  /** Years for cumulative net rent to repay the all-in purchase cost. */
  breakEvenYears: number;
  /** Total return including capital appreciation, over the horizon. */
  totalReturnPct: number;
  cagrPct: number;
  projectedValue: number;
}

/**
 * Gross and net rental yield, plus a total-return view.
 *
 * Net yield subtracts the four costs Indian landlords routinely ignore:
 * society maintenance, property tax, a vacancy allowance, and repairs. A
 * gross yield alone flatters every Ahmedabad apartment by 1.5–2 points.
 */
export function calculateYield({
  purchasePrice,
  monthlyRent,
  annualMaintenance = 0,
  annualPropertyTax = 0,
  vacancyMonths = 1,
  annualRepairsPct = 0.5,
  appreciationPct = 6,
  horizonYears = 10,
  includeAcquisitionCosts = true,
}: {
  purchasePrice: number;
  monthlyRent: number;
  annualMaintenance?: number;
  annualPropertyTax?: number;
  vacancyMonths?: number;
  annualRepairsPct?: number;
  appreciationPct?: number;
  horizonYears?: number;
  includeAcquisitionCosts?: boolean;
}): YieldResult {
  if (purchasePrice <= 0) {
    return {
      grossYieldPct: 0,
      netYieldPct: 0,
      annualRent: 0,
      annualCosts: 0,
      netAnnualIncome: 0,
      breakEvenYears: 0,
      totalReturnPct: 0,
      cagrPct: 0,
      projectedValue: 0,
    };
  }

  // Yield must be measured against what the asset actually cost, duty
  // included — otherwise every number is ~5% too flattering.
  const allInCost = includeAcquisitionCosts
    ? purchasePrice + calculateStampDuty(purchasePrice, "male").total
    : purchasePrice;

  const annualRent = monthlyRent * 12;
  const collectedRent = monthlyRent * Math.max(0, 12 - vacancyMonths);
  const annualCosts =
    annualMaintenance + annualPropertyTax + purchasePrice * (annualRepairsPct / 100);

  const netAnnualIncome = collectedRent - annualCosts;

  const projectedValue = purchasePrice * Math.pow(1 + appreciationPct / 100, horizonYears);
  const cumulativeRent = netAnnualIncome * horizonYears;
  const totalGain = projectedValue - purchasePrice + cumulativeRent;

  return {
    grossYieldPct: (annualRent / allInCost) * 100,
    netYieldPct: (netAnnualIncome / allInCost) * 100,
    annualRent,
    annualCosts,
    netAnnualIncome,
    breakEvenYears: netAnnualIncome > 0 ? allInCost / netAnnualIncome : Infinity,
    totalReturnPct: (totalGain / allInCost) * 100,
    cagrPct:
      horizonYears > 0
        ? (Math.pow((allInCost + totalGain) / allInCost, 1 / horizonYears) - 1) * 100
        : 0,
    projectedValue,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAX
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Indicative income-tax relief on a self-occupied home loan under the OLD
 * regime: §80C on principal (cap ₹1.5 L) and §24(b) on interest (cap ₹2 L).
 *
 * Flagged as indicative on purpose — the new regime removes most of this, and
 * which regime is better is a personal calculation we will not pretend to
 * make for someone.
 */
export function homeLoanTaxBenefit({
  annualPrincipal,
  annualInterest,
  marginalRatePct = 30,
}: {
  annualPrincipal: number;
  annualInterest: number;
  marginalRatePct?: number;
}): { section80C: number; section24B: number; totalSaving: number } {
  const section80C = Math.min(annualPrincipal, 150_000);
  const section24B = Math.min(annualInterest, 200_000);

  return {
    section80C,
    section24B,
    totalSaving: (section80C + section24B) * (marginalRatePct / 100),
  };
}

/** Carpet → built-up → super built-up, using typical Ahmedabad loading. */
export function areaConversions(carpetSqft: number) {
  return {
    carpet: carpetSqft,
    builtup: Math.round(carpetSqft * 1.15), // ~15% for walls
    superBuiltup: Math.round(carpetSqft * 1.4), // ~40% total loading
    carpetSqm: +(carpetSqft * 0.092903).toFixed(2),
  };
}
