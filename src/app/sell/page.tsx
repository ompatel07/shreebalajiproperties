import type { Metadata } from "next";
import Image from "next/image";
import {
  BadgeCheck,
  Camera,
  Check,
  ClipboardList,
  FileCheck,
  IndianRupee,
  KeyRound,
  MessageCircle,
  Phone,
  Plus,
  ShieldAlert,
  Users,
} from "lucide-react";

import { SellForm } from "@/components/property/SellForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import { IN_INTERIORS, blurPlaceholder, unsplash } from "@/lib/imagery";
import { breadcrumbSchema, faqSchema, pageMeta } from "@/lib/seo";
import { telLink, whatsappLink } from "@/lib/utils";

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

/** Four steps, owner's-eye view. */
const steps = [
  {
    icon: ClipboardList,
    title: "Share the basics",
    body: "The flat, the area and what you expect. Two minutes, here or on WhatsApp.",
  },
  {
    icon: IndianRupee,
    title: "Get an honest valuation",
    body: "From what homes in your building actually registered at — not portal asking prices.",
  },
  {
    icon: Camera,
    title: "Paperwork and photos",
    body: "Documents checked before listing; daylight photos and a scaled floor plan, free.",
  },
  {
    icon: KeyRound,
    title: "Qualified buyers, then keys",
    body: "Our buyer list first, viewings only with funded buyers, and help through registration.",
  },
];

/** What every seller gets, at no cost. */
const included = [
  { icon: IndianRupee, title: "Pricing from real registrations", body: "Sub-registrar figures for your building and lane, usually 8–15% below what portals imply." },
  { icon: FileCheck, title: "Paperwork checked first", body: "Society NOC, loan release, share certificate, tax receipts and carpet-area certificate." },
  { icon: Camera, title: "Professional photography", body: "Wide-angle daylight photos, a floor plan redrawn to scale and an honest written listing." },
  { icon: Users, title: "Our buyer list before portals", body: "Buyers already looking in your area at your budget, whose finances we have checked." },
  { icon: BadgeCheck, title: "Qualified viewings only", body: "No weekend parade of unfunded visitors — only people who can actually buy." },
];

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SELL — for owners selling or letting
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Built in the homepage's language: a bright split hero with a photograph,
 * a four-step strip, the valuation form beside what is included, and an
 * accordion FAQ. The previous version was a text-only header over five long
 * numbered paragraphs, which read as a brochure rather than a service.
 *
 * The positioning is unchanged — pricing honesty, and that we will sometimes
 * advise against selling — just said in fewer words.
 */
export default function SellPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Sell", path: "/sell" },
  ];
  const wa = whatsappLink(site.contact.whatsapp, `Hi ${site.name}, I would like a valuation for my property.`);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }} />

      <div className="pt-16 lg:pt-[4.75rem]">
        {/* ══ Hero ═══════════════════════════════════════════════════════ */}
        <header className="bg-bone">
          <div className="shell grid gap-10 py-10 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-16">
            <div className="lg:col-span-6">
              <Breadcrumbs trail={trail} />

              <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-paper px-3.5 py-1.5 text-[0.8125rem] font-semibold text-brass-deep ring-1 ring-rule">
                <KeyRound className="size-4" strokeWidth={2} aria-hidden />
                For owners · Sell or rent out
              </p>

              <h1 className="mt-5 text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1.04] font-extrabold tracking-[-0.035em] text-ink">
                Sell at the right price — in weeks, not months.
              </h1>

              <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ink-muted">
                We price from what homes in your building actually registered at,
                clear the paperwork first, and bring only buyers who can pay. You
                pay nothing until it sells.
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {["No listing fee", "Free photography", "Pay only on completion"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[0.8125rem] font-semibold text-ink ring-1 ring-rule">
                    <Check className="size-3.5 text-verdant" strokeWidth={2.6} aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#valuation"
                  className="inline-flex h-13 items-center gap-2 rounded-full bg-ink px-7 text-[0.9375rem] font-bold text-white transition-colors hover:bg-brass-deep"
                >
                  Get a free valuation
                </a>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-13 items-center gap-2 rounded-full px-6 text-[0.9375rem] font-bold text-ink ring-1 ring-rule-strong transition-colors hover:bg-sand"
                >
                  <MessageCircle className="size-4 text-[#1a9e4b]" strokeWidth={2.2} aria-hidden />
                  WhatsApp us
                </a>
              </div>
            </div>

            <div className="relative lg:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand lg:aspect-[5/4]">
                <Image
                  src={unsplash(IN_INTERIORS[4], 1200, 76)}
                  alt="A bright, well-kept living room with warm wooden furniture"
                  fill
                  priority
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  placeholder="blur"
                  blurDataURL={blurPlaceholder()}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-5 left-4 flex max-w-[19rem] items-center gap-3 rounded-2xl bg-paper p-4 shadow-[0_18px_40px_-18px_rgba(18,17,16,0.35)] ring-1 ring-rule sm:left-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-brass-light">
                  <IndianRupee className="size-5" strokeWidth={2} aria-hidden />
                </span>
                <p className="text-[0.8125rem] leading-snug text-ink-muted">
                  <span className="block text-[0.9375rem] font-bold text-ink">Priced from real registrations</span>
                  not from portal asking prices
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ══ How it works ═══════════════════════════════════════════════ */}
        <section className="bg-paper py-14 lg:py-20">
          <div className="shell">
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-extrabold tracking-[-0.03em] text-ink">
              How selling with us works
            </h2>
            <p className="mt-2 text-[0.9375rem] text-ink-muted">Four steps, one advisor from the first call to registration.</p>

            <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              {steps.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="relative rounded-2xl bg-bone p-4 ring-1 ring-rule sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-ink text-brass-light">
                      <Icon className="size-5" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="text-[0.8125rem] font-bold text-brass-deep">Step {i + 1}</span>
                  </div>
                  <h3 className="mt-3.5 text-[1.0625rem] font-bold text-ink lg:mt-5">{title}</h3>
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-muted">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ══ Valuation: what's included + the form ══════════════════════ */}
        <section id="valuation" className="scroll-mt-24 bg-sand py-14 lg:py-20">
          <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-extrabold tracking-[-0.03em] text-ink">
                Get your free valuation
              </h2>
              <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted">
                Everything below is included at no cost. Standard brokerage is
                agreed in writing up front and paid only when the sale completes.
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {included.map(({ icon: Icon, title, body }, i) => (
                  <li
                    key={title}
                    className={`flex gap-3.5 rounded-2xl bg-paper p-4 ring-1 ring-rule ${i === included.length - 1 && included.length % 2 ? "sm:col-span-2" : ""}`}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brass-pale text-brass-deep">
                      <Icon className="size-[1.125rem]" strokeWidth={2} aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[0.9375rem] font-bold text-ink">{title}</span>
                      <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-ink-muted">{body}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <aside className="mt-6 flex gap-4 rounded-2xl bg-ink p-5 text-white lg:p-6">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-brass-light">
                  <ShieldAlert className="size-5" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <p className="text-[1rem] font-bold">Sometimes we will tell you not to sell.</p>
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-white/70">
                    If a metro extension or ring-road link is two years out, selling
                    now can cost you more than our fee. We lose the mandate by saying
                    so — and gain the referrals that this business runs on.
                  </p>
                </div>
              </aside>
            </div>

            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <SellForm />
              </div>
            </div>
          </div>
        </section>

        {/* ══ FAQ ════════════════════════════════════════════════════════ */}
        <section className="bg-paper py-14 lg:py-20">
          <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-extrabold tracking-[-0.03em] text-ink">
                Questions sellers ask
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
                Anything else — ask the person who would handle your sale.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <a href={telLink(site.contact.phoneE164)} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[0.875rem] font-bold text-white transition-colors hover:bg-brass-deep">
                  <Phone className="size-4" strokeWidth={2.2} aria-hidden />
                  {site.contact.phoneDisplay}
                </a>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[0.875rem] font-bold text-ink ring-1 ring-rule-strong transition-colors hover:bg-sand">
                  <MessageCircle className="size-4 text-[#1a9e4b]" strokeWidth={2.2} aria-hidden />
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="space-y-3 lg:col-span-8">
              {faqs.map((faq, i) => (
                <details key={faq.q} open={i === 0} className="group rounded-2xl bg-bone ring-1 ring-rule open:bg-paper open:ring-rule-strong">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-[1rem] font-bold text-ink [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sand text-ink transition-transform duration-300 group-open:rotate-45">
                      <Plus className="size-4" strokeWidth={2.4} aria-hidden />
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-[0.9375rem] leading-relaxed text-ink-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
