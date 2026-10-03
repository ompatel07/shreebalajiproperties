import type { Metadata } from "next";
import Image from "next/image";
import { Camera, FileCheck, IndianRupee, Megaphone, Users } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SellForm } from "@/components/property/SellForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeading } from "@/components/ui/Section";
import { site } from "@/config/site";
import { blurPlaceholder, unsplash } from "@/lib/imagery";
import { breadcrumbSchema, faqSchema, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Sell or Rent Out Your Property in Ahmedabad | ${site.name}`,
  description:
    "Sell or let a flat, villa, office or plot in Ahmedabad or Gandhinagar. Honest valuation from real transaction comparables, professional photography, and a shortlist of qualified buyers rather than endless viewings.",
  path: "/sell",
});

const faqs = [
  {
    q: "How do you decide what my property is worth?",
    a: "From what comparable units in your building and immediate locality have actually transacted at, not from asking prices on portals. Asking prices in Ahmedabad routinely sit 8–15% above achieved prices, which is why a property listed off a portal average tends to sit unsold for months and then sell below what a correctly priced listing would have fetched in weeks.",
  },
  {
    q: "What do you charge?",
    a: "Standard brokerage on a resale transaction, agreed in writing before we start, and payable only on completion. There is no listing fee, no photography charge, and no retainer. If we cannot sell it, you owe us nothing.",
  },
  {
    q: "How long does a sale take in Ahmedabad?",
    a: "A correctly priced, clean-title flat in an established west-side locality typically transacts in six to ten weeks from listing to registration. Add time for a disputed title, a pending society NOC, an outstanding home loan to be cleared, or a price set above the comparables. We will tell you honestly which of those applies to you before we list.",
  },
  {
    q: "Do I need to be in Ahmedabad to sell?",
    a: "No — a significant share of what we transact is for owners living in Mumbai, Bengaluru or overseas. We handle viewings, coordinate with your society, and can work with a registered power of attorney for the registration itself. NRI sellers should talk to us early, because the TDS and repatriation mechanics materially change the timeline.",
  },
  {
    q: "Will you list it everywhere?",
    a: "We will put it in front of our own buyer list first, which is where most of our resale transactions actually close, and then on the portals if it has not moved. Blanketing every portal on day one sounds like effort but mostly generates calls from other brokers.",
  },
];

/**
 * Sell page.
 *
 * Positioned against the thing sellers in this market complain about most:
 * being talked into an inflated asking price to win the mandate, then being
 * ground down over four months. So the page leads with pricing honesty and
 * says plainly that we will sometimes advise against selling at all.
 */
export default function SellPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Sell", path: "/sell" },
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

      <div className="pt-16 lg:pt-[4.75rem]">
        <header className="border-b border-rule bg-sand">
          <div className="shell py-10 lg:py-16">
            <Breadcrumbs trail={trail} />

            <h1 className="display-tight mt-6 max-w-4xl font-display text-h1 text-ink">
              We will not flatter your price to{" "}
              <em className="display-wonk text-brass">win the mandate.</em>
            </h1>

            <p className="mt-7 max-w-2xl text-lead text-ink-muted">
              The oldest trick in resale is agreeing to whatever number the owner
              wants, taking the listing, and then spending four months talking
              them down. We would rather have the difficult conversation first and
              sell it in six weeks.
            </p>
          </div>
        </header>

        <div className="shell grid gap-12 py-12 lg:grid-cols-[1fr_26rem] lg:gap-16 lg:py-16">
          {/* ══ What we do ════════════════════════════════════════════════ */}
          <div className="min-w-0">
            <SectionHeading
              index="01"
              eyebrow="What we actually do"
              title="Five things, properly."
              lede="Not a list of services — the five that decide whether a property sells at the right price."
              className="mb-10"
            />

            <RevealGroup as="ul" className="space-y-px" stagger={0.07}>
              <Step
                n="01"
                icon={IndianRupee}
                title="Price it off real comparables"
                body="We pull what units in your building and your lane have actually registered at — the figures from the sub-registrar, not the asking prices on a portal. That is usually 8–15% below what portals imply, and pricing against it is the single biggest determinant of how fast you sell."
              />
              <Step
                n="02"
                icon={FileCheck}
                title="Clear the paperwork before we list"
                body="Society NOC, outstanding loan and release of the original documents, share certificate, property-tax receipts, and the carpet-area certificate. A buyer who finds a gap in these mid-negotiation will use it to reprice you. We would rather find it first."
              />
              <Step
                n="03"
                icon={Camera}
                title="Photograph it like it matters"
                body="Wide-angle, shot in daylight, at no cost to you. Most resale listings in Ahmedabad are let down by four dark phone photos, which is why they get half the enquiries of an identical flat next door."
              />
              <Step
                n="04"
                icon={Users}
                title="Our buyer list first, portals second"
                body="We take it to buyers already looking in your locality at your budget — people we have spoken to and whose finances we have checked. Most of our resale transactions close there, before the listing goes public at all."
              />
              <Step
                n="05"
                icon={Megaphone}
                title="Qualified viewings only"
                body="We check that someone can actually finance your flat before we bring them to it. Twenty viewings from unfunded buyers is not marketing, it is just four weekends of your life."
              />
            </RevealGroup>

            {/* ── The honest bit ────────────────────────────────────────── */}
            <Reveal className="mt-14">
              <aside className="relative overflow-hidden rounded-[2px] border border-brass/30 bg-brass-pale/40 p-7 lg:p-8">
                <p className="eyebrow text-brass-deep">Sometimes the answer is no</p>
                <h2 className="mt-3 max-w-2xl font-display text-h3 leading-snug text-ink">
                  We will occasionally tell you not to sell.
                </h2>
                <p className="mt-4 max-w-prose leading-relaxed text-ink-soft">
                  If you are in a corridor where a metro extension or a ring-road
                  link is two years out, selling now can cost you more than the
                  brokerage we would have earned. We lose that fee by saying so.
                  We say it anyway, because the person who gets that advice is
                  the person who refers us three buyers later — and referrals are
                  how this business actually grows.
                </p>
              </aside>
            </Reveal>

            {/* ── Photo ─────────────────────────────────────────────────── */}
            <Reveal className="mt-14">
              <figure className="relative aspect-[16/9] overflow-hidden rounded-[2px] border border-rule">
                <Image
                  src={unsplash("1600566753086-00f18fb6b3ea", 1400)}
                  alt="A well-lit, professionally photographed living room"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  placeholder="blur"
                  blurDataURL={blurPlaceholder()}
                  className="photo-warm object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-6">
                  <p className="font-mono text-micro tracking-[0.12em] text-brass-light uppercase">
                    Included, at no cost
                  </p>
                  <p className="mt-2 max-w-md text-caption leading-relaxed text-bone/80">
                    Daylight photography, a floor plan redrawn to scale, and a
                    written listing that describes the flat rather than praising
                    it.
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          </div>

          {/* ══ Form ═════════════════════════════════════════════════════ */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <SellForm />
          </aside>
        </div>

        {/* ══ FAQ ════════════════════════════════════════════════════════ */}
        <Section surface="paper" size="sm">
          <div className="shell max-w-4xl">
            <h2 className="eyebrow mb-8 border-b border-rule pb-4">
              What sellers ask us
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
        </Section>
      </div>
    </>
  );
}

function Step({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body: string;
}) {
  return (
    <RevealItem as="li" className="group border-t border-rule py-7 last:border-b">
      <div className="flex gap-5 sm:gap-7">
        <div className="flex shrink-0 flex-col items-center gap-3">
          <span className="font-mono text-micro tracking-[0.16em] text-brass tabular-nums" data-numeric>
            {n}
          </span>
          <span className="grid size-10 place-items-center rounded-full border border-rule-strong text-ink-muted transition-all duration-400 group-hover:border-brass group-hover:bg-brass group-hover:text-paper">
            <Icon className="size-[1.05rem]" strokeWidth={1.6} />
          </span>
        </div>

        <div>
          <h3 className="font-display text-h4 leading-snug text-ink">{title}</h3>
          <p className="mt-3 max-w-prose leading-relaxed text-ink-muted">{body}</p>
        </div>
      </div>
    </RevealItem>
  );
}
