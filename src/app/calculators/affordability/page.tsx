import type { Metadata } from "next";

import { AffordabilityCalculator } from "@/components/calculators/AffordabilityCalculator";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import { breadcrumbSchema, faqSchema, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Home Affordability Calculator — What Property Can I Afford? | ${site.name}`,
  description:
    "Work backwards from your income to the property price a lender will actually sanction. Models FOIR, RBI loan-to-value caps and non-financeable stamp duty, then maps the result onto Ahmedabad localities.",
  path: "/calculators/affordability",
});

const faqs = [
  {
    q: "How much home loan can I get on my salary?",
    a: "Lenders cap total EMIs at a share of net monthly income — the FOIR, typically 40% below ₹50,000 of income, 45% up to ₹1.2 lakh and 50% above that. Any existing car, personal or credit-card instalment is deducted first. The resulting EMI capacity is then converted to a loan amount at the prevailing rate and tenure, and capped again by the loan-to-value ceiling. On ₹1.5 lakh net income with no existing EMIs, that is usually a loan somewhere around ₹80–90 lakh at current rates.",
  },
  {
    q: "What is FOIR and why does it matter?",
    a: "FOIR, the Fixed Obligation to Income Ratio, is the share of your take-home pay already committed to fixed repayments. It is the single biggest lever on your eligibility: clearing a ₹15,000 car EMI before you apply can lift your sanctioned loan by roughly ₹18–20 lakh. If you are planning a purchase in the next year, closing small loans first is usually worth more than saving the same amount.",
  },
  {
    q: "How much down payment do I need?",
    a: "The RBI caps how much a lender may fund: up to 90% of value below ₹30 lakh, 80% up to ₹75 lakh, and 75% above ₹75 lakh. So the down payment runs from 10% to 25% depending on the ticket size. Add roughly 5.9% for Gujarat stamp duty and registration, which cannot be financed — on a ₹1 crore purchase you should expect to need around ₹31 lakh in cash.",
  },
  {
    q: "Should I stretch to the maximum I am eligible for?",
    a: "Usually not. Eligibility is what a lender will risk, not what is comfortable. A home loan at the FOIR ceiling leaves nothing for a rate rise, a job change, a medical event or school fees — and floating rates do move. Most buyers we work with are better served targeting about 80% of their maximum eligibility and keeping six months of EMIs in reserve.",
  },
];

export default function AffordabilityPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Calculators", path: "/calculators/home-loan-emi" },
    { name: "Affordability", path: "/calculators/affordability" },
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
            What can you actually afford?
          </h1>
          <p className="mt-5 max-w-2xl text-lead text-ink-muted">
            Most calculators flatter you. This one models what a lender really
            underwrites — then tells you whether your limit is your income or
            your cash, and which Ahmedabad corridors that budget genuinely
            reaches.
          </p>
        </div>
      </header>

      <div className="shell py-12 lg:py-16">
        <AffordabilityCalculator />
      </div>

      <section className="border-t border-rule bg-paper py-16" aria-labelledby="faq">
        <div className="shell max-w-4xl">
          <h2 id="faq" className="eyebrow mb-8 border-b border-rule pb-4">
            Eligibility, in plain terms
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
