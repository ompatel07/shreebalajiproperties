import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import {
  budgetBands,
  localities,
  propertyTypes,
  officeAddressLines,
  site,
  zoneLabels,
  type Zone,
} from "@/config/site";
import { telLink, whatsappLink } from "@/lib/utils";

/**
 * The footer does three jobs at once:
 *
 *   1. Internal linking. Every area and facet page is reachable from the
 *      bottom of every page, which is how a crawler discovers and keeps
 *      re-crawling several hundred landing pages.
 *   2. Compliance. Registration identifiers sit here in plain sight — Indian
 *      buyers look for exactly this before they enquire, and a site that
 *      hides it loses them. The block self-hides while the numbers are
 *      still outstanding rather than printing empty labels.
 *   3. The honest note. We are paid by the builder, not the buyer; saying so
 *      out loud is a trust signal, not a liability.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const zones = Object.keys(zoneLabels) as Zone[];

  return (
    <footer className="border-t border-rule bg-paper">
      {/* ── Brand + contact ───────────────────────────────────────────────────── */}
      <div className="shell grid gap-12 py-16 lg:grid-cols-[1.1fr_2fr] lg:gap-20 lg:py-20">
        <div>
          <Logo />

          {/* Written for the buyer reading it. The B2B pitch lives on
              /for-builders; the remuneration disclosure stays in the legal
              line below, where it belongs. */}
          <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-ink-muted">
            Flats, villas, offices and plots across Ahmedabad and Gandhinagar —
            checked before they are listed, shown by one advisor, and free for
            buyers.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <a
              href={whatsappLink(site.contact.whatsapp, `Hi ${site.name}, I am looking for a property.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[0.875rem] font-bold text-white transition-colors hover:bg-brass-deep"
            >
              <MessageCircle className="size-4" strokeWidth={2.2} aria-hidden />
              WhatsApp
            </a>
            <a
              href={telLink(site.contact.phoneE164)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.875rem] font-bold text-ink ring-1 ring-rule-strong transition-colors hover:bg-sand"
            >
              <Phone className="size-4" strokeWidth={2.2} aria-hidden />
              {site.contact.phoneDisplay}
            </a>
          </div>

          <div className="mt-7 space-y-3 text-[0.875rem]">
            <a
              href={`mailto:${site.contact.email}`}
              className="flex items-center gap-3 font-semibold text-ink transition-colors hover:text-brass"
            >
              <Mail className="size-4 shrink-0 text-brass" strokeWidth={2} aria-hidden />
              {site.contact.email}
            </a>
            <p className="flex items-start gap-3 text-ink-muted">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brass" strokeWidth={2} aria-hidden />
              <span>
                {officeAddressLines().map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </p>
            <p className="flex items-center gap-3 text-ink-muted">
              <Clock className="size-4 shrink-0 text-brass" strokeWidth={2} aria-hidden />
              {site.office.hours}
            </p>
          </div>

          {/* Socials */}
          <div className="mt-7 flex gap-2">
            {Object.entries(site.social)
              .filter(([, url]) => Boolean(url))
              .map(([network, url]) => (
                <a
                  key={network}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.name} on ${network}`}
                  className="grid size-10 place-items-center rounded-full text-ink-muted ring-1 ring-rule-strong transition-all duration-300 hover:bg-ink hover:text-white hover:ring-ink"
                >
                  <span className="text-[0.6875rem] font-bold uppercase">
                    {network.slice(0, 2)}
                  </span>
                </a>
              ))}
          </div>
        </div>

        {/* ── Link matrix ─────────────────────────────────────────────── */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <FooterColumn title="Property types">
            {propertyTypes.slice(0, 8).map((t) => (
              <FooterLink key={t.slug} href={`/ahmedabad/${t.slug}`}>
                {t.name} in Ahmedabad
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="By budget">
            {budgetBands.map((b) => (
              <FooterLink key={b.slug} href={`/ahmedabad/${b.slug}`}>
                {b.label}
              </FooterLink>
            ))}
            <FooterLink href="/ahmedabad/ready-to-move">Ready to move</FooterLink>
            <FooterLink href="/ahmedabad/new-launch">New launches</FooterLink>
          </FooterColumn>

          <FooterColumn title="Popular areas">
            {zones.flatMap((zone) =>
              localities
                .filter((l) => l.zone === zone && l.featured)
                .map((l) => (
                  <FooterLink key={l.slug} href={`/${l.city}/${l.slug}`}>
                    {l.name}
                  </FooterLink>
                )),
            )}
            <FooterLink href="/localities">All areas →</FooterLink>
          </FooterColumn>

          <FooterColumn title="Company">
            <FooterLink href="/about">About us</FooterLink>
            <FooterLink href="/projects">New projects</FooterLink>
            <FooterLink href="/sell">Sell your property</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/map">Map search</FooterLink>
            <FooterLink href="/calculators/home-loan-emi">EMI calculator</FooterLink>
            <FooterLink href="/calculators/stamp-duty">Stamp duty</FooterLink>
            <FooterLink href="/guides/rera-gujarat">Buyer guides</FooterLink>
            <FooterLink href="/for-builders">For builders</FooterLink>
          </FooterColumn>
        </div>
      </div>

      {/* ── Compliance strip. Rendered only when the identifiers exist —
             an empty "RERA Agent:" label is worse than none, and these are
             still awaiting the client. ─────────────────────────────────── */}
      {(site.compliance.reraAgentId || site.compliance.gstin) && (
        <div className="border-t border-rule">
          <div className="shell flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
            <dl className="flex flex-wrap gap-x-8 gap-y-2 text-[0.8125rem] font-semibold">
              {site.compliance.reraAgentId && (
                <div className="flex gap-2">
                  <dt className="text-ink-faint">RERA Agent</dt>
                  <dd className="text-ink-muted">{site.compliance.reraAgentId}</dd>
                </div>
              )}
              {site.compliance.gstin && (
                <div className="flex gap-2">
                  <dt className="text-ink-faint">GSTIN</dt>
                  <dd className="text-ink-muted">{site.compliance.gstin}</dd>
                </div>
              )}
            </dl>

            <a
              href={site.compliance.reraPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-brass"
            >
              Verify on GujRERA
              <ArrowUpRight
                className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2}
                aria-hidden
              />
            </a>
          </div>
        </div>
      )}

      {/* ── Legal ──────────────────────────────────────────────────────── */}
      <div className="border-t border-rule">
        <div className="shell flex flex-col gap-5 py-7 lg:flex-row lg:items-start lg:justify-between">
          <p className="max-w-3xl text-caption leading-relaxed text-ink-faint">
            © {year} {site.legalName}. All rights reserved.{" "}
            <span className="text-ink-muted">
              {site.name} provides project marketing services to builders and
              developers. We are engaged and remunerated by the project owner,
              not by the customer, and that does not change the price a
              customer is quoted.
            </span>{" "}
            Prices, availability, carpet areas and possession dates are indicative,
            provided by the developer or owner, and subject to change without notice.
            Please verify all particulars and approvals independently before
            committing to a transaction. Images of unbuilt projects are artist
            impressions.
          </p>

          <nav aria-label="Legal" className="flex shrink-0 gap-6 text-[0.8125rem] font-semibold">
            <Link href="/privacy" className="text-ink-muted transition-colors hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="text-ink-muted transition-colors hover:text-ink">
              Terms
            </Link>
            <Link href="/sitemap.xml" className="text-ink-muted transition-colors hover:text-ink">
              Sitemap
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-4 text-[0.9375rem] font-bold text-ink">{title}</p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-[0.875rem] text-ink-muted transition-colors duration-200 hover:text-brass"
      >
        {children}
      </Link>
    </li>
  );
}
