import { Counter } from "@/components/motion/Counter";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/config/site";

/**
 * The numbers band.
 *
 * ── Why it looks like this ──────────────────────────────────────────────
 * It was a four-column card row, which is the same shape as every other
 * stat block on the web. Now the figures sit on a single hairline-divided
 * baseline over a drafting grid, with the label set *above* the number in
 * monospace — a specification table rather than a dashboard.
 *
 * On a phone it is a 2×2 grid, because four numbers side by side at 360px
 * would shrink the display serif to the point of pointlessness.
 *
 * Counts animate up, but the final value is also the server-rendered value,
 * so a crawler and a reduced-motion visitor both see real figures.
 */
export function TrustRail() {
  return (
    <section className="relative overflow-hidden border-y border-rule bg-sand">
      <div className="blueprint absolute inset-0" aria-hidden />

      <div className="shell relative py-12 lg:py-16">
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-ink/12 pb-6">
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-brass" aria-hidden />
              Since {site.foundedYear}, in numbers
            </p>
            <p className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-faint uppercase">
              Verifiable on request
            </p>
          </div>
        </Reveal>

        <dl className="grid grid-cols-2 lg:grid-cols-4" data-reveal-group="" style={{ ["--stagger" as string]: "90ms" }}>
          {site.trust.map((stat, i) => (
            <div
              key={stat.label}
              className={[
                "py-7 lg:py-9",
                // Hairlines between columns, but never a trailing one.
                i % 2 === 1 ? "border-l border-ink/10 pl-5" : "pr-5",
                "lg:border-l lg:border-ink/10 lg:pl-7 lg:first:border-l-0 lg:first:pl-0",
                // The 2-col mobile grid needs its own row divider.
                i > 1 ? "border-t border-ink/10 lg:border-t-0" : "",
              ].join(" ")}
            >
              <dt className="font-semibold text-[0.6875rem] leading-relaxed tracking-[0.14em] text-ink-muted uppercase">
                {stat.label}
              </dt>
              <dd className="display-tight mt-3 font-display text-[clamp(2.25rem,5.5vw,3.5rem)] leading-none text-ink">
                {stat.prefix ? <span className="text-brass">{stat.prefix}</span> : null}
                <Counter value={stat.value} suffix={stat.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
