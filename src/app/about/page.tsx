import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Handshake, Layers, ScrollText, Users } from "lucide-react";

import { Counter } from "@/components/motion/Counter";
import { Reveal, RevealGroup } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/home/CtaBand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeading } from "@/components/ui/Section";
import {
  FINANCE_DISCLAIMER,
  localityCount,
  portfolio,
  site,
  teamPillars,
} from "@/config/site";
import { blurPlaceholder, unsplash } from "@/lib/imagery";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `About ${site.name} — ${site.discipline} in Ahmedabad`,
  description: `${site.name} is a project marketing partner for builders in Ahmedabad. How we work, what we take on, and the questions a developer should ask before appointing anyone.`,
  path: "/about",
});

/**
 * About.
 *
 * Written for a **builder deciding whether to appoint us**, not for a home
 * buyer. So it is structured around the questions a developer actually asks
 * in that meeting — what do you own, what happens to my enquiries, how are
 * you paid, what will you not do — and answers them directly.
 *
 * In this market a straight answer to an uncomfortable question is more
 * persuasive than a mission statement, and it is the one thing an agency
 * pitching on creative work rarely offers.
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
              You bring the project.{" "}
              <em className="display-wonk text-brass">We bring the execution.</em>
            </h1>

            <p className="mt-7 max-w-2xl text-lead text-ink-muted">
              {site.name} is a project marketing partner for builders in
              Ahmedabad. We create demand, manage the enquiries it produces,
              coordinate site visits and support customers through financing —
              with an in-house team, so nothing is handed between an agency and
              a sales desk and lost in between.
            </p>

            <p className="mt-6 font-semibold text-micro tracking-[0.14em] text-brass uppercase">
              {site.strapline}
            </p>
          </div>
        </header>

        {/* ══ Numbers ════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-b border-rule bg-bone">
          <div className="blueprint absolute inset-0" aria-hidden />
          <div className="shell relative py-14">
            <RevealGroup
              className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4"
              stagger={0.09}
            >
              {site.trust.map((stat) => (
                <div key={stat.label} className="border-t border-ink/15 pt-5">
                  <p className="display-tight font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-none text-ink">
                    {stat.prefix ? <span className="text-brass">{stat.prefix}</span> : null}
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-3 font-semibold text-micro tracking-[0.14em] text-ink-muted uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ══ The questions ══════════════════════════════════════════════ */}
        <Section surface="bone">
          <div className="shell">
            <SectionHeading
              index="01"
              eyebrow="Before you appoint anyone"
              title={
                <>
                  Questions worth asking —{" "}
                  <em className="display-wonk text-brass">and our answers.</em>
                </>
              }
              lede="If a marketing partner will not answer these directly, that is itself the answer."
            />

            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
              <Reveal className="lg:sticky lg:top-28 lg:self-start">
                <figure className="relative aspect-[4/5] overflow-hidden border border-rule">
                  <Image
                    src={unsplash("1497366216548-37526070297c", 900)}
                    alt="Residential development under construction in Ahmedabad"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    placeholder="blur"
                    blurDataURL={blurPlaceholder()}
                    className="photo-warm object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent"
                    aria-hidden
                  />

                  <figcaption className="absolute inset-x-0 bottom-0 p-7">
                    <p className="font-semibold text-micro tracking-[0.14em] text-brass-light uppercase">
                      Projects marketed
                    </p>
                    <ul className="mt-3 space-y-1">
                      {portfolio.map((project) => (
                        <li key={project.slug} className="text-caption text-bone/80">
                          {project.name}
                        </li>
                      ))}
                    </ul>
                  </figcaption>
                </figure>
              </Reveal>

              <RevealGroup as="ul" className="space-y-px" stagger={0.08}>
                <Answer
                  n="Q1"
                  icon={Layers}
                  question="What exactly do you take ownership of?"
                  answer="Positioning, promotion, enquiry generation, enquiry management, site-visit coordination, customer follow-up and finance coordination. Not a campaign handed back with a report — the whole path from a stranger seeing the project to a buyer who is ready to transact. The deliverable is movement through that funnel, not impressions."
                />
                <Answer
                  n="Q2"
                  icon={Users}
                  question="What happens to an enquiry after it arrives?"
                  answer="It is logged, scored and worked by the same in-house team that generated it. Most enquiries in this market die in the gap between the first call and the second — not because nobody cared, but because the lead sat in a spreadsheet while the sales desk assumed marketing was on it. Removing that handover is most of the value we add."
                />
                <Answer
                  n="Q3"
                  icon={Handshake}
                  question="How are you paid, and does it change the customer's price?"
                  answer="We are engaged and paid by the builder, on terms agreed in writing before work starts. It does not change what a customer is quoted — we are not inserting a margin between you and your buyer. Where a project is under a full marketing mandate, that is stated on the public project page, so a buyer knows who they are dealing with."
                />
                <Answer
                  n="Q4"
                  icon={ScrollText}
                  question="What will you not do?"
                  answer="We will not take on a project we do not believe can absorb at the price it is being launched at — saying so in the first meeting is cheaper for both of us than six months of soft enquiries. We will not promise a lead number before knowing the ticket size and the micro-market. And we will not call a customer eleven times; follow-up is structured, not relentless."
                />
                <Answer
                  n="Q5"
                  icon={BadgeCheck}
                  question="What does the finance coordination actually involve?"
                  answer={`Working relationships with banks and financial-service providers, documentation guidance for the customer, and coordination through the loan process so a willing buyer is not lost to paperwork. ${FINANCE_DISCLAIMER}`}
                />
              </RevealGroup>
            </div>
          </div>
        </Section>

        {/* ══ The team ═══════════════════════════════════════════════════ */}
        <Section surface="sand" size="sm">
          <div className="shell">
            <SectionHeading
              index="02"
              eyebrow="How the work gets done"
              title="One team, under one roof."
              lede="Experience, execution and market understanding in the same place — which is why moving between an enquiry, a site visit and a follow-up takes minutes rather than a meeting."
            />

            <RevealGroup
              className="grid gap-px bg-rule-strong/40 sm:grid-cols-2 lg:grid-cols-4"
              stagger={0.07}
            >
              {teamPillars.map((pillar) => (
                <div key={pillar.title} className="bg-sand p-6">
                  <p className="font-display text-h4 leading-snug text-ink">{pillar.title}</p>
                  <p className="mt-3 text-caption leading-relaxed text-ink-muted">
                    {pillar.detail}
                  </p>
                </div>
              ))}
            </RevealGroup>

            <p className="mt-10 max-w-prose text-caption leading-relaxed text-ink-muted">
              Market coverage runs to {localityCount} areas across Ahmedabad and
              Gandhinagar. That matters less as a boast than as a practical
              point: how a project in Nikol should be marketed has very little
              in common with one in Iskon&ndash;Ambli, and that difference is
              the whole job.
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
    <li className="group border-t border-rule py-7 last:border-b">
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
    </li>
  );
}
