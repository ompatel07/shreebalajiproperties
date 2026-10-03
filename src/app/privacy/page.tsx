import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Privacy Policy | ${site.name}`,
  description: `How ${site.name} collects, uses and protects your personal information.`,
  path: "/privacy",
});

/**
 * Privacy policy.
 *
 * ⚠️  This is a good-faith description of what the code in this repository
 *     actually does — not legal advice, and not a substitute for review by a
 *     lawyer before launch. India's DPDP Act 2023 imposes specific obligations
 *     (notice, consent, grievance redressal, breach notification) that depend
 *     on facts outside the code, and those should be checked by counsel.
 *
 *     It is written to match the implementation precisely: no third-party
 *     analytics, salted IP hashes rather than raw addresses, device-local
 *     shortlists. If you add analytics or an email service later, update this
 *     page in the same commit.
 */
export default function PrivacyPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Privacy", path: "/privacy" },
  ];

  return (
    <div className="pt-16 lg:pt-[4.75rem]">
      <header className="border-b border-rule bg-sand">
        <div className="shell py-10 lg:py-14">
          <Breadcrumbs trail={trail} />
          <h1 className="display-tight mt-6 font-display text-h2 text-ink">
            Privacy policy
          </h1>
          <p className="mt-4 font-mono text-micro tracking-[0.12em] text-ink-muted uppercase">
            Last updated 3 October 2026
          </p>
        </div>
      </header>

      <div className="shell-tight py-12 lg:py-16">
        <div className="space-y-10">
          <Clause title="Who we are">
            <p>
              {site.legalName} ({site.name}) is a RERA-registered real-estate
              agent with its registered office at {site.office.line1},{" "}
              {site.office.line2}, {site.office.locality}, {site.office.city}{" "}
              {site.office.postalCode}, Gujarat, India. For any question about
              this policy or your data, write to{" "}
              <a href={`mailto:${site.contact.email}`} className="link-draw text-brass">
                {site.contact.email}
              </a>{" "}
              or call {site.contact.phoneDisplay}.
            </p>
          </Clause>

          <Clause title="What we collect">
            <p>We only collect what you give us, plus the minimum needed to keep the site working.</p>
            <ul>
              <li>
                <strong>When you send an enquiry, request a site visit, or ask
                for a valuation:</strong> your name and mobile number, and
                optionally your email, budget, preferred localities,
                configuration, timeline, and whatever you write in the message
                field.
              </li>
              <li>
                <strong>Technical information attached to that submission:</strong>{" "}
                your browser&rsquo;s user-agent string, the page you submitted
                from, and any campaign (UTM) parameters in that URL. We also
                store a <em>salted cryptographic hash</em> of your IP address —
                not the address itself — purely to enforce rate limits and
                investigate abuse. The hash cannot be reversed to recover your
                IP.
              </li>
              <li>
                <strong>Nothing else.</strong> We do not run Google Analytics,
                Meta Pixel, or any third-party advertising or tracking script.
                There is no cookie banner on this site because there are no
                tracking cookies to consent to.
              </li>
            </ul>
          </Clause>

          <Clause title="Your shortlist stays on your device">
            <p>
              Properties you save with the heart icon, and anything you add to
              the comparison tray, are stored in your own browser&rsquo;s local
              storage. They are never transmitted to us and we cannot see them.
              That is also why your shortlist does not follow you to another
              device — the trade-off for not making you create an account. If
              you choose to send your shortlist to an advisor on WhatsApp, that
              is an explicit action, and at that point the list reaches us
              through WhatsApp.
            </p>
          </Clause>

          <Clause title="Why we use it">
            <ul>
              <li>To call or message you back about the enquiry you made.</li>
              <li>
                To match you against inventory as it comes up, if you asked us
                to.
              </li>
              <li>
                To arrange and confirm a site visit, including sharing your name
                and number with the developer&rsquo;s site team where a visit
                requires it.
              </li>
              <li>
                To keep the site working — rate limiting, blocking automated
                abuse, and diagnosing errors.
              </li>
            </ul>
            <p>
              We do not sell, rent or trade your contact details. We do not add
              you to a marketing list you did not ask for, and we do not share
              your number with other brokers.
            </p>
          </Clause>

          <Clause title="Who else sees it">
            <ul>
              <li>
                <strong>Supabase</strong> hosts our database. Your submission is
                stored there under row-level security, and only our own
                authenticated staff accounts can read it.
              </li>
              <li>
                <strong>Vercel</strong> hosts and serves this website.
              </li>
              <li>
                <strong>The developer or owner</strong> of a specific property,
                where you have asked us to arrange a visit or progress a
                negotiation on it — and only to the extent needed for that.
              </li>
              <li>
                <strong>A lender</strong>, only if you explicitly ask us to help
                arrange financing, and only with the details that application
                requires.
              </li>
            </ul>
          </Clause>

          <Clause title="How long we keep it">
            <p>
              Enquiry records are retained for three years from your last contact
              with us, because property purchases in this market frequently
              restart after a long pause and the history is genuinely useful to
              you as well as to us. Ask us to delete your record sooner and we
              will, subject to any record we are required by law to retain.
            </p>
          </Clause>

          <Clause title="Your rights">
            <p>
              You can ask us to show you what we hold about you, correct
              anything wrong, delete it, or stop contacting you. Write to{" "}
              <a href={`mailto:${site.contact.email}`} className="link-draw text-brass">
                {site.contact.email}
              </a>{" "}
              and we will respond within thirty days. You do not need to give a
              reason, and asking will not affect how we deal with you.
            </p>
          </Clause>

          <Clause title="Security">
            <p>
              The site is served over HTTPS with HSTS. Database access is
              governed by row-level security policies, so our public key cannot
              read your enquiry at all. The administrative panel requires an
              allow-listed account and is excluded from search engines and
              shared caches. No system is perfectly secure, but we have tried
              not to collect anything we do not need in the first place — which
              is the only protection that cannot fail.
            </p>
          </Clause>

          <Clause title="Changes">
            <p>
              If we change how we handle your data, we will update this page and
              the date at the top of it. Material changes affecting people who
              have already enquired will be communicated directly.
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
