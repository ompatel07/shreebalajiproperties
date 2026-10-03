"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FileSearch, Handshake, KeyRound, Landmark, Scale, Search } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { blurPlaceholder, unsplash } from "@/lib/imagery";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOW WE WORK — sticky-scroll sequence
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Almost every competitor runs a three-step "Search → Visit → Buy" strip.
 * It is filler and buyers read past it. This is a six-stage diligence
 * process with the unglamorous parts left in — title search, encumbrance
 * certificate, builder delivery record, loan sanction. Those are what a
 * first-time buyer in Ahmedabad is actually anxious about, and naming them
 * is more persuasive than any adjective.
 *
 * ── Why sticky-scroll rather than a list ────────────────────────────────
 * The image column pins and swaps as each stage scrolls into view, so the
 * section is one continuous motion instead of six stacked rows. It is the
 * one piece of scroll choreography on the page — used once, where the
 * content is genuinely sequential, rather than sprinkled everywhere.
 *
 * Driven by a single IntersectionObserver over the six steps. On mobile the
 * pinning is dropped (there is no room for two columns) and it degrades to a
 * clean numbered list with the image above it.
 */

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Position",
    body:
      "Define how the project should be presented. Who it is for, what it is worth, and which three things about it are worth repeating. A project marketed without a position competes on price alone.",
    image: "1486406146926-c627a92ad1ab",
  },
  {
    n: "02",
    icon: FileSearch,
    title: "Promote",
    body:
      "Build digital and local visibility around the project rather than around a generic campaign. The objective is reach among people who can actually finance the ticket size.",
    image: "1497366216548-37526070297c",
  },
  {
    n: "03",
    icon: Landmark,
    title: "Generate",
    body:
      "Create customer enquiries. Volume matters far less than fit — an enquiry from someone who cannot clear the loan costs the sales team the same hour as one who can.",
    image: "1551038247-3d9af20df552",
  },
  {
    n: "04",
    icon: Scale,
    title: "Engage",
    body:
      "Manage enquiries and follow-ups. Most prospects are lost in the gap between the first call and the second, so every enquiry is logged, scored and worked rather than left to memory.",
    image: "1554469384-e58fac16e23a",
  },
  {
    n: "05",
    icon: Handshake,
    title: "Visit",
    body:
      "Coordinate site visits and customer interactions, including the confirmation call before anyone travels. A visit that does not happen is the most expensive kind of lead.",
    image: "1600585154340-be6161a56a0c",
  },
  {
    n: "06",
    icon: KeyRound,
    title: "Support",
    body:
      "Assist sales and eligible customers with financing coordination — bank relationships, documentation guidance and loan-process follow-through, so a willing buyer is not lost to paperwork.",
    image: "1600607687939-ce8a6c25118c",
  },
];

export function Process() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // One observer for all six steps. The step closest to the middle of the
    // viewport wins, which is what makes the swap feel tied to the scroll.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const index = stepRefs.current.indexOf(visible.target as HTMLLIElement);
        if (index >= 0) setActive(index);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.5, 1] },
    );

    for (const node of stepRefs.current) {
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="process" className="border-t border-rule bg-sand py-20 lg:py-28">
      <div className="shell">
        <Reveal>
          <div className="max-w-3xl border-b border-rule-strong/50 pb-8">
            <p className="eyebrow mb-4">03 — The engagement</p>
            <h2 className="display-tight font-display text-h2">
              From project launch to{" "}
              <em className="display-wonk text-brass">customer conversion support.</em>
            </h2>
            <p className="mt-5 text-lead text-ink-muted">
              Six stages, run by one team. The handover points between
              marketing and sales are where projects normally leak — so there
              are none.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* ══ Pinned image column ═════════════════════════════════════ */}
          <div className="lg:sticky lg:top-28 lg:h-fit lg:self-start">
            <figure className="relative aspect-[4/3] overflow-hidden border border-rule lg:aspect-[4/5]">
              {steps.map((step, i) => (
                <Image
                  key={step.n}
                  src={unsplash(step.image, 900)}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  placeholder="blur"
                  blurDataURL={blurPlaceholder()}
                  loading={i === 0 ? "eager" : "lazy"}
                  data-active={active === i ? "1" : "0"}
                  className="swap-img photo-warm absolute inset-0 object-cover"
                />
              ))}

              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" aria-hidden />

              {/* Oversized stage numeral — the progress indicator. */}
              <figcaption className="absolute inset-x-0 bottom-0 p-6 lg:p-7">
                <p
                  className="font-display text-[clamp(3rem,7vw,5rem)] leading-none text-brass-light tabular-nums"
                  data-numeric
                >
                  {steps[active]?.n}
                </p>
                <p className="mt-3 max-w-sm font-display text-h4 leading-snug text-bone">
                  {steps[active]?.title}
                </p>

                {/* Progress ticks */}
                <div className="mt-5 flex gap-1.5" aria-hidden>
                  {steps.map((step, i) => (
                    <span
                      key={step.n}
                      className={cn(
                        "h-px flex-1 transition-colors duration-500",
                        i <= active ? "bg-brass-light" : "bg-bone/25",
                      )}
                    />
                  ))}
                </div>
              </figcaption>
            </figure>
          </div>

          {/* ══ Steps ═══════════════════════════════════════════════════ */}
          <ol className="space-y-0">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = active === i;

              return (
                <li
                  key={step.n}
                  ref={(node) => {
                    stepRefs.current[i] = node;
                  }}
                  className={cn(
                    "border-t border-rule-strong/40 py-8 transition-opacity duration-500 last:border-b lg:py-10",
                    // Dim the inactive steps on desktop so the pinned image
                    // and the live step read as one unit.
                    isActive ? "opacity-100" : "lg:opacity-45",
                  )}
                >
                  <div className="flex gap-5 sm:gap-7">
                    <div className="flex shrink-0 flex-col items-center gap-3">
                      <span
                        className="font-mono text-micro tracking-[0.16em] text-brass tabular-nums"
                        data-numeric
                      >
                        {step.n}
                      </span>
                      <span
                        className={cn(
                          "grid size-10 place-items-center rounded-full border transition-colors duration-500",
                          isActive
                            ? "border-brass bg-brass text-paper"
                            : "border-rule-strong text-ink-muted",
                        )}
                      >
                        <Icon className="size-[1.05rem]" strokeWidth={1.6} aria-hidden />
                      </span>
                      {i < steps.length - 1 && (
                        <span className="hidden w-px flex-1 bg-rule-strong/60 lg:block" aria-hidden />
                      )}
                    </div>

                    <div>
                      <h3 className="font-display text-h4 leading-snug text-ink">{step.title}</h3>
                      <p className="mt-2.5 max-w-prose leading-relaxed text-ink-muted">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ── Standing rule, as a pull-quote band ─────────────────────── */}
        <Reveal className="mt-14">
          <blockquote className="border-l-2 border-brass pl-6 lg:pl-8">
            <p className="max-w-2xl font-display text-h3 leading-snug text-ink">
              Every marketing activity should contribute to moving the
              customer one step closer to a decision.
            </p>
            <footer className="mt-4 font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
              How we judge the work
            </footer>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
