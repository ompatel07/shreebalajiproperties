import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Handshake, ScrollText, ShieldCheck } from "lucide-react";

import { Counter } from "@/components/motion/Counter";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/home/CtaBand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeading } from "@/components/ui/Section";
import { site } from "@/config/site";
import { blurPlaceholder, unsplash } from "@/lib/imagery";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `About ${site.name} — RERA-Registered Channel Partner in Ahmedabad`,
  description: `${site.name} is a RERA-registered real-estate channel partner in Ahmedabad that co-invests in the projects it recommends. How we work, what we charge, and where our interests lie.`,
  path: "/about",
});

/**
 * About.
 *
 * Written to answer the question a referred client actually arrives with:
 * *why should I trust you rather than the twenty other brokers in Ahmedabad?*
 *
 * So the page is structured around the three uncomfortable questions — who
 * pays you, what happens if the builder fails, and what you will not do —
 * and answers them in plain language. That is more persuasive in this market
 * than a founder photograph and a mission statement.
 */
export default function AboutPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />

      <div className="pt-16 lg:pt-[4.75rem]">
        {/* ══ Masthead ═══════════════════════════════════════════════════ */}
        <header className="border-b border-rule bg-sand">
          <div className="shell py-10 lg:py-16">
            <Breadcrumbs trail={trail} />

            <h1 className="display-tight mt-6 max-w-4xl font-display text-h1 text-ink">
              A broker whose{" "}
              <em className="display-wonk text-brass">incentives you can check.</em>
            </h1>

            <p className="mt-7 max-w-2xl text-lead text-ink-muted">
              {site.name} has been advising buyers in Ahmedabad since{" "}
              {site.foundedYear}. We are a RERA-registered channel partner, we
              co-invest in some of what we sell, and we would rather tell you
              that plainly than have you work it out later.
            </p>
          </div>
        </header>

        {/* ══ Numbers ════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-b border-rule bg-bone">
          <div className="blueprint absolute inset-0" aria-hidden />
          <div className="shell relative py-14">
            <RevealGroup className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4" stagger={0.09}>
              {site.trust.map((stat) => (
                <RevealItem key={stat.label}>
                  <div className="border-t border-ink/15 pt-5">
                    <p className="display-tight font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-none text-ink">
                      {"prefix" in stat && stat.prefix ? (
                        <span className="text-brass">{stat.prefix}</span>
                      ) : null}
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="mt-3 font-mono text-micro tracking-[0.14em] text-ink-muted uppercase">
                      {stat.label}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ══ The three questions ════════════════════════════════════════ */}
        <Section surface="bone">
          <div className="shell">
            <SectionHeading
              index="01"
              eyebrow="The awkward questions"
              title={
                <>
                  Three things every buyer should ask a broker — and{" "}
                  <em className="display-wonk text-brass">our answers.</em>
                </>
              }
              lede="If a broker will not answer these directly, that is itself the answer."
            />

            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
              <Reveal className="lg:sticky lg:top-28 lg:self-start">
                <figure className="relative aspect-[4/5] overflow-hidden rounded-[2px] border border-rule">
                  <Image
                    src={unsplash("1497366216548-37526070297c", 900)}
                    alt="Residential architecture in west Ahmedabad"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    placeholder="blur"
                    blurDataURL={blurPlaceholder()}
                    className="photo-warm object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" aria-hidden />
                  <figcaption className="absolute inset-x-0 bottom-0 p-7">
                    <p className="font-mono text-micro tracking-[0.14em] text-brass-light uppercase">
                      Registered since {site.foundedYear}
                    </p>
                    <p className="mt-3 font-mono text-[0.6875rem] leading-relaxed tracking-[0.06em] text-bone/80">
                      {site.compliance.reraAgentId}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>

              <RevealGroup as="ul" className="space-y-px" stagger={0.08}>
                <Answer
                  n="Q1"
                  icon={Handshake}
                  question="Who actually pays you?"
                  answer="On a new-launch or under-construction purchase, the developer does — at a commission agreed in writing before we show you anything. You pay us nothing, and critically, we never quote you above the developer's own rate to widen that margin. On a resale transaction the brokerage is standard and agreed up front. If we ever hold an investment interest in a project, it is stated on that project's page in plain words, not in a footer."
                />
                <Answer
                  n="Q2"
                  icon={ShieldCheck}
                  question="What happens if the builder does not deliver?"
                  answer="We cannot indemnify you against a developer failing — no broker honestly can, and anyone who says otherwise is selling you something. What we can do is make it much less likely: we keep the delivery record of every developer we deal with, promised date against actual date, project by project, and we show it to you before you book. We also will not represent a builder whose record we would not accept ourselves, which is why our project list is shorter than our competitors'."
                />
                <Answer
                  n="Q3"
                  icon={ScrollText}
                  question="What will you not do?"
                  answer="We will not list a property whose title we have not seen. We will not push an under-construction project on someone whose finances need a ready flat. We will not tell you a locality is 'upcoming' when what we mean is that nothing has been built there yet. And we will not call you eleven times — one conversation, then we leave you alone until you come back."
                />
                <Answer
                  n="Q4"
                  icon={BadgeCheck}
                  question="How do you verify a listing?"
                  answer="Before anything goes on this site: the RERA registration is pulled from the Gujarat portal and matched to the project; the title chain and encumbrance certificate are reviewed; the approved plan is compared against what is actually being built; and the share of common area you are being charged for is calculated. Resale properties in completed buildings are exempt from RERA — where that applies we label the listing as resale rather than implying a registration exists."
                />
              </RevealGroup>
            </div>
          </div>
        </Section>

        {/* ══ Compliance ═════════════════════════════════════════════════ */}
        <Section surface="sand" size="sm">
          <div className="shell">
            <SectionHeading
              index="02"
              eyebrow="Verify us"
              title="Everything you need to check us out."
              lede="You should not take any of the above on trust. Here is what to look up, and where."
            />

            <dl className="grid gap-px bg-rule-strong/40 sm:grid-cols-2 lg:grid-cols-3">
              <Credential
                label="RERA agent registration"
                value={site.compliance.reraAgentId}
                note="Verify at gujrera.gujarat.gov.in → Search Agent"
              />
              <Credential label="GSTIN" value={site.compliance.gstin} note="Verify on the GST portal" />
              <Credential
                label="Registered office"
                value={`${site.office.line1}, ${site.office.locality}, ${site.office.city} ${site.office.postalCode}`}
                note="Walk in during working hours — no appointment needed"
              />
              <Credential label="Trading since" value={String(site.foundedYear)} />
              <Credential label="Phone" value={site.contact.phoneDisplay} note={site.office.hours} />
              <Credential label="Email" value={site.contact.email} />
            </dl>

            <p className="mt-8 max-w-prose text-caption leading-relaxed text-ink-muted">
              A RERA agent registration number is checkable by anyone in about
              thirty seconds, and an agent operating without one is operating
              illegally. If you take one habit away from this page, make it
              that check — on us and on everyone else you speak to.
            </p>
          </div>
        </Section>

        <CtaBand />
      </div>
    </>
  );
}

function Answer({
  n,
  icon: Icon,
  question,
  answer,
}: {
  n: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  question: string;
  answer: string;
}) {
  return (
    <RevealItem as="li" className="group border-t border-rule py-7 last:border-b">
      <div className="flex gap-5 sm:gap-7">
        <div className="flex shrink-0 flex-col items-center gap-3">
          <span className="font-mono text-micro tracking-[0.14em] text-brass">{n}</span>
          <span className="grid size-10 place-items-center rounded-full border border-rule-strong text-ink-muted transition-all duration-400 group-hover:border-brass group-hover:bg-brass group-hover:text-paper">
            <Icon className="size-[1.05rem]" strokeWidth={1.6} />
          </span>
        </div>

        <div>
          <h3 className="font-display text-h4 leading-snug text-ink">{question}</h3>
          <p className="mt-3 max-w-prose leading-relaxed text-ink-muted">{answer}</p>
        </div>
      </div>
    </RevealItem>
  );
}

function Credential({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="bg-bone px-5 py-5">
      <dt className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-faint uppercase">
        {label}
      </dt>
      <dd className="mt-2 font-mono text-[0.8125rem] leading-relaxed break-words text-ink">
        {value}
      </dd>
      {note && <p className="mt-2 text-[0.6875rem] leading-snug text-ink-muted">{note}</p>}
    </div>
  );
}
