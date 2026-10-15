import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  Crosshair,
  Handshake,
  Inbox,
  Landmark,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Phone,
  PhoneCall,
  TrendingDown,
  Users,
  X,
} from "lucide-react";

import { EnquiryForm } from "@/components/property/EnquiryForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  FINANCE_DISCLAIMER,
  comparison,
  funnel,
  leakPoints,
  portfolio,
  processStages,
  services,
  site,
  teamPillars,
} from "@/config/site";
import { IN_CONSTRUCTION, blurPlaceholder, unsplash } from "@/lib/imagery";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import { telLink, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: `Project Marketing for Builders | ${site.name}`,
  description:
    "Project marketing services for builders and developers in Ahmedabad: positioning, lead generation, enquiry management, site-visit coordination, customer follow-up and finance coordination.",
  path: "/for-builders",
});

const SERVICE_ICONS: Record<string, typeof Megaphone> = {
  "project-positioning": Crosshair,
  "lead-generation": Megaphone,
  "enquiry-management": Inbox,
  "site-visit-coordination": CalendarCheck,
  "customer-follow-up": PhoneCall,
  "finance-coordination": Landmark,
};
const FUNNEL_ICONS = [Megaphone, MessagesSquare, Handshake, Landmark];

const H2 = "text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-extrabold tracking-[-0.03em] text-ink";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FOR BUILDERS — the B2B pitch, on its own page
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The homepage is buyer-first and links here once; everything from the
 * client's deck lives on this page. Rebuilt in the homepage's language: a
 * bright split hero (the old one was a full black block with an empty right
 * half), icon cards instead of numbered paragraphs, a two-card comparison
 * instead of a hairline table, and an enquiry form on the page itself —
 * previously the only action was a link away to /contact.
 *
 * Every claim comes from `config/identity.ts`, i.e. from the deck.
 */
export default function ForBuildersPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "For Builders", path: "/for-builders" },
  ];
  const wa = whatsappLink(
    site.contact.whatsapp,
    `Hi ${site.name}, I am a builder / developer and would like to discuss marketing for my project.`,
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }} />

      <div className="pt-16 lg:pt-[4.75rem]">
        {/* ══ Hero ═══════════════════════════════════════════════════════ */}
        <header className="bg-bone">
          <div className="shell grid gap-10 py-10 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-16">
            <div className="lg:col-span-6">
              <Breadcrumbs trail={trail} />

              <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-paper px-3.5 py-1.5 text-[0.8125rem] font-semibold text-brass-deep ring-1 ring-rule">
                <Building2 className="size-4" strokeWidth={2} aria-hidden />
                For builders &amp; developers
              </p>

              <h1 className="mt-5 text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1.04] font-extrabold tracking-[-0.035em] text-ink">
                Your project deserves momentum, not just marketing.
              </h1>

              <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ink-muted">
                One in-house team that creates demand, works every enquiry, fills
                site visits and supports buyers through financing — from launch to
                possession.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#discuss"
                  className="inline-flex h-13 items-center gap-2 rounded-full bg-ink px-7 text-[0.9375rem] font-bold text-white transition-colors hover:bg-brass-deep"
                >
                  Discuss your project
                  <ArrowRight className="size-4" strokeWidth={2.2} aria-hidden />
                </a>
                <Link
                  href="/projects"
                  className="inline-flex h-13 items-center gap-2 rounded-full px-6 text-[0.9375rem] font-bold text-ink ring-1 ring-rule-strong transition-colors hover:bg-sand"
                >
                  Projects we market
                </Link>
              </div>

              <dl className="mt-9 grid max-w-lg grid-cols-3 gap-3">
                {[
                  { v: `${portfolio.length}+`, l: "Projects marketed" },
                  { v: String(services.length), l: "Services, one team" },
                  { v: "1", l: "Point of contact" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl bg-paper p-3.5 ring-1 ring-rule">
                    <dd className="text-[1.625rem] leading-none font-extrabold tracking-[-0.03em] text-ink" data-numeric>{s.v}</dd>
                    <dt className="mt-1.5 text-[0.75rem] leading-snug font-semibold text-ink-muted">{s.l}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative lg:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand lg:aspect-[5/4]">
                <Image
                  src={unsplash(IN_CONSTRUCTION[1], 1200, 76)}
                  alt="Residential towers under construction"
                  fill
                  priority
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  placeholder="blur"
                  blurDataURL={blurPlaceholder()}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-5 left-4 flex max-w-[20rem] items-center gap-3 rounded-2xl bg-paper p-4 shadow-[0_18px_40px_-18px_rgba(18,17,16,0.35)] ring-1 ring-rule sm:left-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-brass-light">
                  <Users className="size-5" strokeWidth={2} aria-hidden />
                </span>
                <p className="text-[0.8125rem] leading-snug text-ink-muted">
                  <span className="block text-[0.9375rem] font-bold text-ink">Marketing + sales support</span>
                  under one roof, not split across agencies
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ══ The funnel ═════════════════════════════════════════════════ */}
        <section className="bg-paper py-14 lg:py-16">
          <div className="shell">
            <h2 className={H2}>Marketing should not stop at the lead</h2>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              {funnel.map((stage, i) => {
                const Icon = FUNNEL_ICONS[i] ?? Megaphone;
                return (
                  <li key={stage.label} className="relative flex items-center gap-4 rounded-2xl bg-bone p-4 ring-1 ring-rule lg:block lg:p-6">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-brass-light">
                      <Icon className="size-5" strokeWidth={2} aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-[1.0625rem] font-bold text-ink lg:mt-5 lg:text-[1.125rem]">{stage.label}</h3>
                      <p className="mt-0.5 text-[0.875rem] leading-relaxed text-ink-muted lg:mt-1">{stage.detail}</p>
                    </div>
                    {i < funnel.length - 1 && (
                      <ArrowRight
                        className="absolute top-1/2 -right-3.5 z-10 hidden size-7 -translate-y-1/2 rounded-full bg-paper p-1.5 text-brass-deep ring-1 ring-rule lg:block"
                        strokeWidth={2.4}
                        aria-hidden
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ══ Where projects stall ═══════════════════════════════════════ */}
        <section className="bg-sand py-14 lg:py-20">
          <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
            <div className="lg:col-span-5">
              <p className="eyebrow">Where projects stall</p>
              <h2 className={`mt-2 ${H2}`}>A great project can still struggle without a demand engine.</h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
                Not because the building is wrong — because marketing and sales run
                as separate activities, and buyers fall through the gap between
                them. These are the six places it happens.
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-7">
              {leakPoints.map((p) => (
                <li key={p.stage} className="flex items-center gap-3.5 rounded-2xl bg-paper p-4 ring-1 ring-rule">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-alert-pale text-alert">
                    <TrendingDown className="size-[1.125rem]" strokeWidth={2} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[0.75rem] font-bold text-brass-deep">{p.stage}</span>
                    <span className="block text-[0.9375rem] leading-snug font-bold text-ink">{p.leak}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ══ Services ═══════════════════════════════════════════════════ */}
        <section className="bg-paper py-14 lg:py-20">
          <div className="shell">
            <h2 className={H2}>Six services. One team.</h2>
            <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-muted">
              They run together, by the same people, so nothing is handed between
              an agency and a sales desk and lost in between.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              {services.map((s) => {
                const Icon = SERVICE_ICONS[s.slug] ?? Megaphone;
                return (
                  <li key={s.slug} className="flex gap-4 rounded-2xl bg-bone p-4 ring-1 ring-rule transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(18,17,16,0.35)] sm:block sm:p-5 lg:p-6">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brass-pale text-brass-deep">
                      <Icon className="size-5" strokeWidth={2} aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-[1.0625rem] font-bold text-ink sm:mt-5 sm:text-[1.125rem]">{s.title}</h3>
                      <p className="mt-0.5 text-[0.9375rem] font-semibold text-ink-soft sm:mt-1">{s.summary}</p>
                      {/* The long explanation is for a reader at a desk; on a
                          phone the one-line summary carries it. */}
                      <p className="mt-2.5 hidden text-[0.875rem] leading-relaxed text-ink-muted sm:block">{s.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ══ Comparison ═════════════════════════════════════════════════ */}
        <section className="bg-bone py-14 lg:py-20">
          <div className="shell">
            <h2 className={H2}>Not just an agency. A project marketing partner.</h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl bg-paper p-6 ring-1 ring-rule lg:p-8">
                <p className="text-[0.9375rem] font-bold text-ink-muted">A typical agency</p>
                <ul className="mt-5 space-y-3.5">
                  {comparison.map((c) => (
                    <li key={c.conventional} className="flex items-center gap-3 text-[0.9375rem] text-ink-muted">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sand text-ink-faint">
                        <X className="size-3.5" strokeWidth={2.6} aria-hidden />
                      </span>
                      {c.conventional}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-ink p-6 text-white lg:p-8">
                <p className="text-[0.9375rem] font-bold text-brass-light">With {site.name}</p>
                <ul className="mt-5 space-y-3.5">
                  {comparison.map((c) => (
                    <li key={c.ours} className="flex items-center gap-3 text-[0.9375rem] font-semibold">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brass-light text-ink">
                        <Check className="size-3.5" strokeWidth={2.8} aria-hidden />
                      </span>
                      {c.ours}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 flex gap-4 rounded-2xl bg-brass-pale p-5 ring-1 ring-brass/20 lg:p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper text-brass-deep">
                <Landmark className="size-5" strokeWidth={2} aria-hidden />
              </span>
              <div>
                <p className="text-[1rem] font-bold text-ink">Buyers who want the flat should not be lost to paperwork.</p>
                <p className="mt-1 text-[0.875rem] leading-relaxed text-ink-soft">
                  We connect eligible customers with banks and financial-service
                  providers, guide their documentation and coordinate the loan
                  process.
                </p>
                <p className="mt-2 text-[0.75rem] text-ink-muted">{FINANCE_DISCLAIMER}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ Process ════════════════════════════════════════════════════ */}
        <section className="bg-paper py-14 lg:py-20">
          <div className="shell">
            <h2 className={H2}>From launch to customer conversion</h2>
            <p className="mt-2 text-[0.9375rem] text-ink-muted">Six stages, run by one team.</p>

            <ol className="relative mt-10 grid gap-6 lg:grid-cols-6 lg:gap-4">
              <span className="absolute top-5 right-[8%] left-[8%] hidden h-px bg-rule-strong lg:block" aria-hidden />
              {processStages.map((s, i) => (
                <li key={s.label} className="relative flex gap-4 lg:flex-col lg:items-center lg:text-center">
                  <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-ink text-[0.875rem] font-bold text-brass-light ring-4 ring-paper" data-numeric>
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[1rem] font-bold text-ink lg:mt-3">{s.label}</span>
                    <span className="mt-1 block text-[0.8125rem] leading-relaxed text-ink-muted">{s.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ══ Portfolio ══════════════════════════════════════════════════ */}
        <section className="bg-sand py-14 lg:py-16">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className={H2}>Projects we have marketed</h2>
              <Link href="/projects" className="group inline-flex items-center gap-1.5 text-[0.9375rem] font-bold text-brass-deep hover:text-ink">
                Current projects
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} aria-hidden />
              </Link>
            </div>
            <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {portfolio.map((p) => (
                <li key={p.slug} className="flex flex-col gap-3 rounded-2xl bg-paper p-4 ring-1 ring-rule">
                  <span className="grid size-10 place-items-center rounded-xl bg-ink text-brass-light">
                    <Building2 className="size-5" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="text-[0.9375rem] leading-snug font-bold text-ink">{p.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ══ Discuss ════════════════════════════════════════════════════ */}
        <section id="discuss" className="scroll-mt-24 bg-paper py-14 lg:py-20">
          <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <h2 className={H2}>Let&rsquo;s talk about your project</h2>
              <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-ink-muted">
                Tell us where it is, how many units and what stage it is at. The
                people you speak to are the people who would run it.
              </p>
              <ul className="mt-7 space-y-4">
                {teamPillars.map((p) => (
                  <li key={p.title} className="flex gap-3.5">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-verdant text-white">
                      <Check className="size-3.5" strokeWidth={2.8} aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[0.9375rem] font-bold text-ink">{p.title}</span>
                      <span className="block text-[0.875rem] text-ink-muted">{p.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-2.5">
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
            <div className="lg:col-span-6">
              <EnquiryForm
                source="contact_form"
                audience="builder"
                compact
                className="rounded-2xl border-0 shadow-[0_18px_40px_-24px_rgba(18,17,16,0.3)] ring-1 ring-rule"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
