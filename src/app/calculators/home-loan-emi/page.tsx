import type { Metadata } from "next";

import { EmiCalculator } from "@/components/calculators/EmiCalculator";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import { breadcrumbSchema, faqSchema, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Home Loan EMI Calculator — Monthly Instalment & Total Interest | ${site.name}`,
  description:
    "Free home loan EMI calculator for Indian buyers. See your monthly instalment, total interest, year-by-year amortisation and the cash you need up front including Gujarat stamp duty. No sign-up.",
  path: "/calculators/home-loan-emi",
});

const faqs = [
  {
    q: "How is a home loan EMI calculated in India?",
    a: "Indian lenders use a reducing-balance formula: EMI = P × r × (1+r)ⁿ ÷ ((1+r)ⁿ − 1), where P is the loan amount, r the monthly interest rate (the annual rate divided by twelve) and n the number of monthly instalments. Each instalment is identical, but its split shifts — early instalments are almost entirely interest, and the principal share grows over the term.",
  },
  {
    q: "What interest rate should I assume?",
    a: "Most floating-rate home loans in India are linked to the repo rate plus a spread that depends on your credit score, employer category and loan size. Salaried applicants with a score above 750 typically see the lowest published rates; self-employed applicants are usually quoted 25–75 basis points higher. Assume a realistic rate rather than a teaser one — a 0.5% difference on a ₹70 lakh, 20-year loan is roughly ₹5 lakh of interest.",
  },
  {
    q: "Is a longer tenure better?",
    a: "It lowers the monthly figure and raises the total cost substantially. Extending a ₹60 lakh loan at 8.5% from 15 to 25 years cuts the EMI by about ₹12,000 a month but adds well over ₹30 lakh in interest. The usual advice is to take the longest tenure you qualify for, so the committed EMI stays low, and then prepay aggressively — prepayment in the early years is worth far more than later, because that is when the balance is largest.",
  },
  {
    q: "Does the loan cover stamp duty and registration?",
    a: "No. Lenders fund a percentage of the property's agreement value only. In Gujarat stamp duty is 4.9% and registration is 1% (waived for a sole female purchaser), so roughly 5.9% of the value has to come from your own funds, on top of the down payment, and it is payable at registration. This is the most common reason a booking stalls.",
  },
  {
    q: "How much can I borrow against my income?",
    a: "Lenders underwrite on FOIR — the share of your net monthly income that can go to all EMIs combined, usually 40–50%, tightening at lower incomes. They then cap the loan by the RBI's loan-to-value ceiling: up to 90% below ₹30 lakh, 80% up to ₹75 lakh, and 75% above that. Our affordability calculator works backwards from your income to the price that satisfies both constraints.",
  },
];

interface Props {
  searchParams: Promise<{ price?: string }>;
}

export default async function EmiPage({ searchParams }: Props) {
  const { price } = await searchParams;

  // Seeded from a listing's "Full calculator" link. Clamped so a hand-edited
  // query string cannot push the sliders somewhere absurd.
  const parsed = Number(price);
  const initialPrice =
    Number.isFinite(parsed) && parsed > 100_000 && parsed < 2_000_000_000
      ? Math.round(parsed)
      : undefined;

  const trail = [
    { name: "Home", path: "/" },
    { name: "Calculators", path: "/calculators/home-loan-emi" },
    { name: "Home Loan EMI", path: "/calculators/home-loan-emi" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />

      <header className="border-b border-rule bg-bone">
        <div className="shell py-10 lg:py-14">
          <Breadcrumbs trail={trail} />
          <h1 className="display-tight mt-6 max-w-3xl font-display text-h2 text-ink">
            Home loan EMI calculator
          </h1>
          <p className="mt-5 max-w-2xl text-lead text-ink-muted">
            Your monthly instalment, what it costs in total interest, and the
            cash you need before you get the keys — including the stamp duty most
            calculators quietly leave out.
          </p>
        </div>
      </header>

      <div className="shell py-12 lg:py-16">
        <EmiCalculator initialPrice={initialPrice} />
      </div>

      <section className="border-t border-rule bg-paper py-16" aria-labelledby="faq">
        <div className="shell max-w-4xl">
          <h2 id="faq" className="eyebrow mb-8 border-b border-rule pb-4">
            Home loan questions, answered properly
          </h2>
          <dl>
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-rule py-6">
                <dt className="font-display text-h4 leading-snug text-ink">{faq.q}</dt>
                <dd className="mt-3 max-w-prose leading-relaxed text-ink-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
