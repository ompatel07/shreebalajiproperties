import type { Metadata } from "next";

import { YieldCalculator } from "@/components/calculators/YieldCalculator";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import { breadcrumbSchema, faqSchema, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Rental Yield & ROI Calculator for Indian Property | ${site.name}`,
  description:
    "Gross and net rental yield after maintenance, property tax, vacancy and repairs, plus total return against a fixed deposit. Built for Ahmedabad and Gandhinagar investors. Free, no sign-up.",
  path: "/calculators/rental-yield",
});

const faqs = [
  {
    q: "What is a good rental yield in Ahmedabad?",
    a: "Residential gross yields in Ahmedabad typically run 2.5–3.5%, and net yields after society maintenance, property tax, a vacancy allowance and repairs often fall below 2%. Commercial property — offices on SG Highway or Prahladnagar, retail on Sindhu Bhavan — generally yields 6–9% gross, which is why most genuine yield investors here buy commercial rather than residential. If someone quotes you a residential yield above 4%, check whether they are using gross figures and ignoring vacancy.",
  },
  {
    q: "What is the difference between gross and net yield?",
    a: "Gross yield is annual rent divided by the purchase price. Net yield subtracts what you actually spend to keep the asset let: society maintenance, property tax, repairs, and the rent lost between tenants. On an amenity-heavy tower the maintenance alone can consume a quarter of the rent. Net yield is the only figure worth comparing against a fixed deposit, and this calculator also measures it against the all-in cost including stamp duty rather than just the sticker price.",
  },
  {
    q: "Should I include stamp duty when calculating yield?",
    a: "Yes. Stamp duty and registration are roughly 5.9% of value in Gujarat and are part of what the asset cost you, so excluding them overstates your yield by about 6% in relative terms. This calculator includes them in the denominator by default, which is why its yield figures look slightly lower than most online tools.",
  },
  {
    q: "Is property a better investment than a fixed deposit?",
    a: "It depends almost entirely on the appreciation assumption, which is the one number nobody can verify in advance. Net rental yield on Ahmedabad residential property is usually below the FD rate, so the case rests on capital appreciation — and that varies enormously between a mature corridor like Thaltej and an emerging one like Bhadaj. The comparison panel above shows both outcomes side by side at whatever appreciation rate you think is realistic. We would rather you ran that honestly than bought on a number we flattered.",
  },
  {
    q: "How is rental income taxed in India?",
    a: "Rental income is added to your total income and taxed at your slab rate, after a flat 30% standard deduction on the net annual value and a deduction for municipal taxes paid. Home loan interest on a let-out property is also deductible, which can make a leveraged rental loss-making on paper and therefore tax-efficient. None of this is modelled above — please take it to your CA.",
  },
];

export default function RentalYieldPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Calculators", path: "/calculators/home-loan-emi" },
    { name: "Rental Yield", path: "/calculators/rental-yield" },
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
            Rental yield &amp; ROI
          </h1>
          <p className="mt-5 max-w-2xl text-lead text-ink-muted">
            The honest version. Net of maintenance, tax, vacancy and repairs,
            measured against what the property actually cost you — stamp duty
            included — and compared with simply leaving the money in a fixed
            deposit.
          </p>
        </div>
      </header>

      <div className="shell py-12 lg:py-16">
        <YieldCalculator />
      </div>

      <section className="border-t border-rule bg-paper py-16" aria-labelledby="faq">
        <div className="shell max-w-4xl">
          <h2 id="faq" className="eyebrow mb-8 border-b border-rule pb-4">
            Yield questions investors ask us
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
