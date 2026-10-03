import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Terms of Use | ${site.name}`,
  description: `Terms governing the use of the ${site.name} website and the information published on it.`,
  path: "/terms",
});

/**
 * Terms of use.
 *
 * ⚠️  Drafted in good faith to describe how this site actually works. It is
 *     NOT legal advice and must be reviewed by a lawyer before launch —
 *     particularly the liability and jurisdiction clauses, and anything
 *     touching RERA agent obligations under the Gujarat rules.
 */
export default function TermsPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Terms", path: "/terms" },
  ];

  return (
    <div className="pt-16 lg:pt-[4.75rem]">
      <header className="border-b border-rule bg-sand">
        <div className="shell py-10 lg:py-14">
          <Breadcrumbs trail={trail} />
          <h1 className="display-tight mt-6 font-display text-h2 text-ink">Terms of use</h1>
          <p className="mt-4 font-semibold text-micro tracking-[0.12em] text-ink-muted uppercase">
            Last updated 3 October 2026
          </p>
        </div>
      </header>

      <div className="shell-tight py-12 lg:py-16">
        <div className="space-y-10">
          <Clause title="What this site is">
            <p>
              This website is published by {site.legalName}, which provides
              project marketing services to builders and developers in
              Ahmedabad and Gandhinagar. We are not the promoter or developer
              of any project described here — we are engaged by the project
              owner to market it, manage enquiries and coordinate site visits
              on their behalf.
            </p>
          </Clause>

          <Clause title="Information is indicative">
            <p>
              Prices, carpet areas, built-up areas, availability, possession
              dates, amenities, floor plans and locality rates on this site are
              provided to us by developers and owners, or compiled from our own
              market observation. They are indicative and may change without
              notice.
            </p>
            <p>
              Nothing on this site is an offer, an invitation to offer, or a
              contract. Images of unbuilt or under-construction property are
              artist impressions and do not depict the delivered product. Where
              stock photography is used pending the client&rsquo;s own
              photography, it is captioned as a representative image.
            </p>
            <p>
              <strong>
                Please verify every particular independently before you commit
                money.
              </strong>{" "}
              That means checking the RERA registration on the Gujarat portal,
              reading the title documents and the sanctioned plan, and taking
              your own legal advice. We will help you do all of that — but the
              verification is yours to rely on, not ours.
            </p>
          </Clause>

          <Clause title="Our calculators">
            <p>
              The EMI, affordability, stamp duty and rental yield tools are
              provided free and for planning only. They are arithmetic, not
              advice, and they do not constitute a credit decision, a valuation,
              or a tax opinion.
            </p>
            <p>
              The Gujarat stamp duty and registration rates used are maintained
              by hand and were current as at the 2024&ndash;25 notification.
              Statutory rates change, and duty is charged on the higher of the
              agreement value and the government jantri valuation — which we
              cannot look up automatically. Confirm the figure with the
              sub-registrar or your advocate before relying on it.
            </p>
          </Clause>

          <Clause title="How we are paid">
            <p>
              We are engaged and paid by the builder or project owner, on
              terms agreed in writing before work begins. A customer pays us
              nothing, and our engagement does not increase the price a
              customer is quoted for a unit.
            </p>
            <p>
              Where we hold the full marketing mandate for a project, that is
              stated on the project&rsquo;s own page, so you always know who
              you are dealing with when you enquire.
            </p>
          </Clause>

          <Clause title="Acceptable use">
            <ul>
              <li>
                Do not scrape, crawl at scale, or systematically copy listing
                data from this site.
              </li>
              <li>
                Do not submit false contact details, or use the enquiry forms to
                send unsolicited commercial messages.
              </li>
              <li>
                Do not attempt to access the administrative area, probe for
                vulnerabilities, or interfere with the service.
              </li>
            </ul>
            <p>
              If you believe you have found a security vulnerability, please
              report it to{" "}
              <a href={`mailto:${site.contact.email}`} className="link-draw text-brass">
                {site.contact.email}
              </a>{" "}
              rather than disclosing it publicly. We will respond and we will not
              pursue anyone who reports in good faith.
            </p>
          </Clause>

          <Clause title="Third-party content">
            <p>
              Map tiles are supplied by OpenStreetMap contributors and CARTO,
              under their respective licences. Developer names and project names
              are the trademarks of their owners and are used here descriptively,
              to identify the inventory we represent.
            </p>
          </Clause>

          <Clause title="Liability">
            <p>
              We provide this site on an &ldquo;as is&rdquo; basis. To the
              extent permitted by law, we are not liable for loss arising from
              reliance on indicative information published here, from a
              developer&rsquo;s delay or default, or from any decision taken on
              the basis of a calculator output. Nothing in these terms limits
              liability that cannot lawfully be limited, including for fraud or
              for our obligations as a registered agent under the Real Estate
              (Regulation and Development) Act, 2016 and the Gujarat rules made
              under it.
            </p>
          </Clause>

          <Clause title="Governing law">
            <p>
              These terms are governed by the laws of India. The courts at
              Ahmedabad, Gujarat have exclusive jurisdiction over any dispute
              arising from this website. Disputes relating to a specific
              registered real-estate project may additionally fall within the
              jurisdiction of the Gujarat Real Estate Regulatory Authority.
            </p>
          </Clause>

          <Clause title="Contact">
            <p>
              {site.legalName}
              <br />
              {site.office.line1}, {site.office.line2}
              <br />
              {site.office.locality}, {site.office.city} {site.office.postalCode}
              <br />
              {site.contact.phoneDisplay} ·{" "}
              <a href={`mailto:${site.contact.email}`} className="link-draw text-brass">
                {site.contact.email}
              </a>
              <br />
              GSTIN {site.compliance.gstin}
            </p>
          </Clause>
        </div>
      </div>
    </div>
  );
}

function Clause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-h3 text-ink">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-ink-soft [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-ink [&_ul]:space-y-2.5">
        {children}
      </div>
    </section>
  );
}
