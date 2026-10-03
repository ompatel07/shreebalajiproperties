import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { EnquiryForm } from "@/components/property/EnquiryForm";
import { StaticMap } from "@/components/property/StaticMap";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import { telLink, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: `Contact ${site.name} — Property Advisors in Ahmedabad`,
  description: `Talk to a RERA-registered property advisor in Ahmedabad. Call ${site.contact.phoneDisplay}, message us on WhatsApp, or send a brief. ${site.office.hours}.`,
  path: "/contact",
});

/**
 * Contact.
 *
 * Phone and WhatsApp first, form second. In this market most buyers want to
 * talk, and a page that leads with a form and hides the number below the fold
 * converts worse — so the hierarchy here matches behaviour rather than
 * fashion.
 */
export default function ContactPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ];

  const waMessage = `Hi ${site.name}, I would like help finding a property in Ahmedabad.`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />

      <div className="pt-16 lg:pt-[4.75rem]">
        <header className="border-b border-rule bg-sand">
          <div className="shell py-10 lg:py-14">
            <Breadcrumbs trail={trail} />

            <h1 className="display-tight mt-6 max-w-3xl font-display text-h2 text-ink">
              Tell us the budget and the commute.
            </h1>

            <p className="mt-5 max-w-2xl text-lead text-ink-muted">
              Twenty minutes on a call usually saves a month of site visits. If
              Ahmedabad does not have what you are describing at that number, we
              will say so — and tell you what it would actually take.
            </p>
          </div>
        </header>

        <div className="shell grid gap-12 py-12 lg:grid-cols-[1fr_26rem] lg:gap-16 lg:py-16">
          {/* ══ Direct channels ═══════════════════════════════════════════ */}
          <div className="min-w-0">
            <section aria-labelledby="direct">
              <h2 id="direct" className="eyebrow mb-6 border-b border-rule pb-3">
                Reach us directly
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={telLink(site.contact.phoneE164)}
                  className="group flex items-start gap-4 rounded-[2px] border border-rule bg-paper p-6 transition-all duration-400 hover:-translate-y-0.5 hover:border-ink hover:shadow-[var(--shadow-lift)]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-[2px] border border-rule text-ink transition-colors duration-400 group-hover:border-ink group-hover:bg-ink group-hover:text-bone">
                    <Phone className="size-[1.1rem]" strokeWidth={1.7} aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
                      Call
                    </p>
                    <p className="mt-1.5 font-display text-h4 text-ink">
                      {site.contact.phoneDisplay}
                    </p>
                    <p className="mt-1 text-[0.75rem] text-ink-muted">
                      A person answers. No IVR.
                    </p>
                  </div>
                </a>

                <a
                  href={whatsappLink(site.contact.whatsapp, waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-[2px] border border-verdant/30 bg-verdant-pale/50 p-6 transition-all duration-400 hover:-translate-y-0.5 hover:border-verdant hover:shadow-[var(--shadow-lift)]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-[2px] border border-verdant/40 text-verdant transition-colors duration-400 group-hover:bg-verdant group-hover:text-paper">
                    <MessageCircle className="size-[1.1rem]" strokeWidth={1.7} aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-[0.6875rem] tracking-[0.14em] text-verdant uppercase">
                      WhatsApp
                    </p>
                    <p className="mt-1.5 font-display text-h4 text-ink">Message us</p>
                    <p className="mt-1 text-[0.75rem] text-ink-muted">
                      Best for sending a shortlist.
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${site.contact.email}`}
                  className="group flex items-start gap-4 rounded-[2px] border border-rule bg-paper p-6 transition-all duration-400 hover:-translate-y-0.5 hover:border-ink"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-[2px] border border-rule text-ink transition-colors duration-400 group-hover:border-ink group-hover:bg-ink group-hover:text-bone">
                    <Mail className="size-[1.1rem]" strokeWidth={1.7} aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
                      Email
                    </p>
                    <p className="mt-1.5 text-[0.9375rem] break-all text-ink">
                      {site.contact.email}
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-4 rounded-[2px] border border-rule bg-paper p-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[2px] border border-rule text-ink">
                    <Clock className="size-[1.1rem]" strokeWidth={1.7} aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
                      Hours
                    </p>
                    <p className="mt-1.5 text-[0.9375rem] text-ink">{site.office.hours}</p>
                    <p className="mt-1 text-[0.75rem] text-ink-muted">
                      Closed Sunday. Site visits by arrangement.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ══ Office ════════════════════════════════════════════════ */}
            <section className="mt-12" aria-labelledby="office">
              <h2 id="office" className="eyebrow mb-6 border-b border-rule pb-3">
                The office
              </h2>

              <div className="flex items-start gap-4">
                <MapPin className="mt-1 size-5 shrink-0 text-brass" strokeWidth={1.7} aria-hidden />
                <address className="text-[1.0625rem] leading-relaxed text-ink-soft not-italic">
                  {site.office.line1}
                  <br />
                  {site.office.line2}
                  <br />
                  {site.office.locality}, {site.office.city} {site.office.postalCode}
                  <br />
                  {site.office.state}, India
                </address>
              </div>

              <div className="mt-7">
                <StaticMap
                  property={{
                    id: "office",
                    slug: "contact",
                    title: `${site.name} — office`,
                    lat: site.office.geo.lat,
                    lng: site.office.geo.lng,
                    price: null,
                    price_on_request: true,
                    locality_slug: site.office.locality.toLowerCase(),
                    bhk: null,
                    carpet_sqft: null,
                  }}
                />
              </div>

              <p className="mt-5 max-w-prose text-caption leading-relaxed text-ink-muted">
                Walk in during working hours — no appointment needed. If you are
                coming from Gandhinagar, call first and we will check whether
                one of us is already at a site nearer to you.
              </p>
            </section>

            {/* ══ Compliance ════════════════════════════════════════════ */}
            <section className="mt-12 rounded-[2px] border border-rule bg-sand p-6">
              <h2 className="eyebrow mb-4">Before you call anyone</h2>
              <p className="max-w-prose leading-relaxed text-ink-soft">
                Check their RERA agent registration. Ours is{" "}
                <span className="font-mono text-[0.8125rem] break-words text-ink">
                  {site.compliance.reraAgentId}
                </span>
                , searchable at{" "}
                <a
                  href={site.compliance.reraPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-draw text-brass"
                >
                  gujrera.gujarat.gov.in
                </a>
                . An agent operating without one is operating illegally, and
                the check takes about thirty seconds.
              </p>
            </section>
          </div>

          {/* ══ Form ════════════════════════════════════════════════════ */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <EnquiryForm source="contact_form" />
          </aside>
        </div>
      </div>
    </>
  );
}
