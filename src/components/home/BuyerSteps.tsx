import Link from "next/link";
import { ArrowRight, MessageCircle, Search, Key, MapPin } from "lucide-react";

import { Reveal, RevealGroup } from "@/components/motion/Reveal";
import { FINANCE_DISCLAIMER, site } from "@/config/site";
import { whatsappLink } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOW IT WORKS — for buyers
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Four steps, written in the plainest language on the site. The client's
 * brief was that it must be very easy to understand, and this is the section
 * most likely to be read by someone who has never bought property before.
 *
 * Deliberately short. The detailed six-stage process is a *builder-facing*
 * argument and lives on /for-builders; a buyer does not need to know how the
 * engagement is structured, only what will happen to them after they tap
 * "enquire".
 *
 * Step 4 carries the finance disclaimer because it mentions home loans.
 */

const steps = [
  {
    n: "1",
    icon: Search,
    title: "Search or tell us",
    body:
      "Use the search above, or just send a message with your budget and the area you want. Either works.",
  },
  {
    n: "2",
    icon: MessageCircle,
    title: "We shortlist for you",
    body:
      "One advisor calls you back, understands the requirement, and sends only the options that genuinely fit — not everything on our books.",
  },
  {
    n: "3",
    icon: MapPin,
    title: "Visit the ones you like",
    body:
      "We arrange the site visits and come with you. We confirm by phone before you travel, so you never arrive to a locked gate.",
  },
  {
    n: "4",
    icon: Key,
    title: "Paperwork and home loan",
    body:
      "We help with documentation and coordinate your home loan with the bank, through to possession.",
  },
];

export function BuyerSteps() {
  const message = `Hi ${site.name}, I am looking for a property in Ahmedabad.`;

  return (
    <section id="how-it-works" className="border-t border-rule bg-sand py-16 lg:py-24">
      <div className="shell">
        <Reveal>
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">How it works</p>
            <h2 className="display-tight font-display text-h2">
              Four steps, and we do{" "}
              <em className="display-wonk text-brass">most of them.</em>
            </h2>
            <p className="mt-5 text-lead text-ink-muted">
              You never pay us anything. We are paid by the builder when a sale
              completes, which means our job is to find you the right home, not
              to sell you the nearest one.
            </p>
          </div>
        </Reveal>

        <RevealGroup
          className="mt-12 grid gap-px bg-rule-strong/40 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.08}
        >
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div key={step.n} className="group bg-sand p-6 lg:p-7">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink font-mono text-[0.75rem] text-bone">
                    {step.n}
                  </span>
                  <Icon className="size-4 text-brass" strokeWidth={1.8} aria-hidden />
                </div>

                <h3 className="mt-4 font-display text-h4 leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-muted">
                  {step.body}
                </p>
              </div>
            );
          })}
        </RevealGroup>

        {/* ── Start now ───────────────────────────────────────────────── */}
        <Reveal className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/properties"
              className="group inline-flex h-13 items-center justify-center gap-2.5 bg-ink px-7 font-semibold text-[0.75rem] tracking-[0.14em] text-bone uppercase transition-colors duration-300 hover:bg-brass-deep"
            >
              Start searching
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2}
                aria-hidden
              />
            </Link>

            <a
              href={whatsappLink(site.contact.whatsapp, message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 items-center justify-center gap-2.5 border border-verdant/40 px-7 font-semibold text-[0.75rem] tracking-[0.14em] text-verdant uppercase transition-colors duration-300 hover:bg-verdant hover:text-paper"
            >
              <MessageCircle className="size-4" strokeWidth={1.9} aria-hidden />
              Just WhatsApp us
            </a>
          </div>

          <p className="mt-5 max-w-prose text-[0.75rem] leading-relaxed text-ink-faint">
            {FINANCE_DISCLAIMER}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
