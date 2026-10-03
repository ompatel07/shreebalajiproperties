import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import {
  budgetBands,
  localities,
  propertyTypes,
  site,
  zoneLabels,
  type Zone,
} from "@/config/site";
import { telLink } from "@/lib/utils";

/**
 * The footer does three jobs at once:
 *
 *   1. Internal linking. Every locality and facet page is reachable from the
 *      bottom of every page, which is how a crawler discovers and keeps
 *      re-crawling several hundred landing pages.
 *   2. Compliance. The RERA agent registration and GSTIN sit here in plain
 *      sight — Indian buyers look for exactly this before they enquire, and
 *      a site that hides it loses them.
 *   3. The honest-broker note. A channel partner earns commission from the
 *      developer; saying so out loud is a trust signal, not a liability.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const zones = Object.keys(zoneLabels) as Zone[];

  return (
    <footer className="mt-px border-t border-rule bg-sand">
      {/* ── Masthead ───────────────────────────────────────────────────── */}
      <div className="shell grid gap-12 py-16 lg:grid-cols-[1.1fr_2fr] lg:gap-20 lg:py-20">
        <div>
          <Logo showTagline />

          <p className="mt-7 max-w-sm text-[0.9375rem] leading-relaxed text-ink-muted">
            {site.description}
          </p>

          <div className="mt-8 space-y-3.5 text-[0.9375rem]">
            <a
              href={telLink(site.contact.phoneE164)}
              className="group flex items-center gap-3 text-ink transition-colors hover:text-brass"
            >
              <Phone className="size-4 shrink-0 text-ink-faint" strokeWidth={1.6} aria-hidden />
              <span className="link-draw">{site.contact.phoneDisplay}</span>
            </a>

            <a
              href={`mailto:${site.contact.email}`}
              className="group flex items-center gap-3 text-ink transition-colors hover:text-brass"
            >
              <Mail className="size-4 shrink-0 text-ink-faint" strokeWidth={1.6} aria-hidden />
              <span className="link-draw">{site.contact.email}</span>
            </a>

            <p className="flex items-start gap-3 text-ink-muted">
              <MapPin className="mt-1 size-4 shrink-0 text-ink-faint" strokeWidth={1.6} aria-hidden />
              <span>
                {site.office.line1}
                <br />
                {site.office.line2}
                <br />
                {site.office.locality}, {site.office.city} {site.office.postalCode}
              </span>
            </p>
          </div>

          <p className="mt-6 font-mono text-micro tracking-[0.1em] text-ink-faint uppercase">
            {site.office.hours}
          </p>

          {/* Socials */}
          <div className="mt-8 flex gap-2">
            {Object.entries(site.social)
              .filter(([, url]) => Boolean(url))
              .map(([network, url]) => (
                <a
                  key={network}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.name} on ${network}`}
                  className="grid size-10 place-items-center rounded-[2px] border border-rule-strong text-ink-muted transition-all duration-300 hover:border-ink hover:bg-ink hover:text-bone"
                >
                  <span className="font-mono text-[0.625rem] uppercase">
                    {network.slice(0, 2)}
                  </span>
                </a>
              ))}
          </div>
        </div>

        {/* ── Link matrix ─────────────────────────────────────────────── */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <FooterColumn title="Property Types">
            {propertyTypes.slice(0, 8).map((t) => (
              <FooterLink key={t.slug} href={`/ahmedabad/${t.slug}`}>
                {t.name} in Ahmedabad
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="By Budget">
            {budgetBands.map((b) => (
              <FooterLink key={b.slug} href={`/ahmedabad/${b.slug}`}>
                {b.label}
              </FooterLink>
            ))}
            <FooterLink href="/ahmedabad/ready-to-move">Ready to Move</FooterLink>
            <FooterLink href="/ahmedabad/new-launch">New Launches</FooterLink>
          </FooterColumn>

          <FooterColumn title="Localities">
            {zones.flatMap((zone) =>
              localities
                .filter((l) => l.zone === zone && l.featured)
                .map((l) => (
                  <FooterLink key={l.slug} href={`/${l.city}/${l.slug}`}>
                    {l.name}
                  </FooterLink>
                )),
            )}
            <FooterLink href="/localities">All localities →</FooterLink>
          </FooterColumn>

          <FooterColumn title="Company">
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/projects">Our Projects</FooterLink>
            <FooterLink href="/sell">Sell With Us</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/map">Map Search</FooterLink>
            <FooterLink href="/calculators/home-loan-emi">EMI Calculator</FooterLink>
            <FooterLink href="/calculators/stamp-duty">Stamp Duty</FooterLink>
            <FooterLink href="/guides/rera-gujarat">Guides</FooterLink>
          </FooterColumn>
        </div>
      </div>

      {/* ── Compliance strip ───────────────────────────────────────────── */}
      <div className="border-t border-rule-strong/60">
        <div className="shell flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
          <dl className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-micro tracking-[0.1em] uppercase">
            <div className="flex gap-2">
              <dt className="text-ink-faint">RERA Agent</dt>
              <dd className="text-ink-muted">{site.compliance.reraAgentId}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-faint">GSTIN</dt>
              <dd className="text-ink-muted">{site.compliance.gstin}</dd>
            </div>
          </dl>

          <a
            href={site.compliance.reraPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 font-mono text-micro tracking-[0.12em] text-brass uppercase"
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

      {/* ── Legal ──────────────────────────────────────────────────────── */}
      <div className="border-t border-rule-strong/60">
        <div className="shell flex flex-col gap-5 py-7 lg:flex-row lg:items-start lg:justify-between">
          <p className="max-w-3xl text-caption leading-relaxed text-ink-faint">
            © {year} {site.legalName}. All rights reserved.{" "}
            <span className="text-ink-muted">
              {site.name} acts as a registered channel partner and real-estate agent.
              We are remunerated by the developer on a successful sale, and we
              disclose any project in which we hold an investment interest on that
              project&rsquo;s own page.
            </span>{" "}
            Prices, availability, carpet areas and possession dates are indicative,
            provided by the developer or owner, and subject to change without notice.
            Please verify all particulars and approvals independently before
            committing to a transaction. Images of unbuilt projects are artist
            impressions.
          </p>

          <nav aria-label="Legal" className="flex shrink-0 gap-6 font-mono text-micro tracking-[0.12em] uppercase">
            <Link href="/privacy" className="link-draw text-ink-muted">
              Privacy
            </Link>
            <Link href="/terms" className="link-draw text-ink-muted">
              Terms
            </Link>
            <Link href="/sitemap.xml" className="link-draw text-ink-muted">
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
      <p className="eyebrow mb-4 border-b border-rule-strong/50 pb-3">{title}</p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="link-draw text-caption text-ink-muted transition-colors duration-250 hover:text-ink"
      >
        {children}
      </Link>
    </li>
  );
}
