import type { Metadata } from "next";

import { StampDutyCalculator } from "@/components/calculators/StampDutyCalculator";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import { breadcrumbSchema, faqSchema, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Stamp Duty & Registration Calculator — Gujarat 2026 Rates | ${site.name}`,
  description:
    "Calculate stamp duty and registration charges on property in Ahmedabad and Gandhinagar. Gujarat rates: 4.9% stamp duty, 1% registration, waived for a sole female purchaser. Free, no sign-up.",
  path: "/calculators/stamp-duty",
});

const faqs = [
  {
    q: "What is the stamp duty on property in Gujarat?",
    a: "Gujarat levies a basic stamp duty of 3.5% of the property's market value, plus a surcharge of 40% of that basic duty, giving an effective rate of 4.9%. A registration fee of 1% applies on top. So a male or joint purchaser pays roughly 5.9% of the value in total, and a sole female purchaser pays 4.9% because the registration fee is waived.",
  },
  {
    q: "Do women pay less stamp duty in Gujarat?",
    a: "The stamp duty itself is the same at 4.9%, but Gujarat waives the 1% registration fee when the sole purchaser is a woman. On a ₹75 lakh property that is a genuine saving of ₹75,000. The waiver does not apply to a joint purchase with a male co-owner. Because this changes who legally owns the asset, it is worth discussing with your CA before structuring a purchase around it.",
  },
  {
    q: "Is stamp duty charged on the agreement value or the jantri rate?",
    a: "On whichever is higher. Jantri is the Gujarat government's own notified valuation for a given survey number, revised periodically. If the jantri valuation of the property exceeds what you are paying, duty is calculated on the jantri figure, not your agreement value. We check the applicable jantri rate before you commit, because the difference can be substantial in areas that were recently revised.",
  },
  {
    q: "Can stamp duty be included in a home loan?",
    a: "Generally no. Lenders fund a percentage of the agreement value, and stamp duty and registration must be paid from your own funds at the time of registration. A few lenders will consider a composite loan covering it, usually at a higher rate and lower LTV. Plan for it as cash — it is the most common reason a transaction stalls at the last step.",
  },
  {
    q: "Is GST payable as well as stamp duty?",
    a: "They are separate and both can apply. GST is charged on under-construction property — currently 1% for affordable housing and 5% otherwise, without input tax credit — and is not payable at all on a completed property with an occupancy certificate. Stamp duty and registration apply either way. So an under-construction purchase can carry both, which materially changes the comparison against a ready flat.",
  },
];

export default function StampDutyPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Calculators", path: "/calculators/home-loan-emi" },
    { name: "Stamp Duty", path: "/calculators/stamp-duty" },
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
            Stamp duty &amp; registration, Gujarat
          </h1>
          <p className="mt-5 max-w-2xl text-lead text-ink-muted">
            The cost that turns up at the sub-registrar&rsquo;s office and
            cannot be financed. Includes the registration waiver for a sole
            female purchaser, which is worth 1% of the property value and is
            routinely missed.
          </p>
        </div>
      </header>

      <div className="shell py-12 lg:py-16">
        <StampDutyCalculator />
      </div>

      <section className="border-t border-rule bg-paper py-16" aria-labelledby="faq">
        <div className="shell max-w-4xl">
          <h2 id="faq" className="eyebrow mb-8 border-b border-rule pb-4">
            Gujarat stamp duty, explained
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
