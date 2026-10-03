import { Reveal, RevealGroup } from "@/components/motion/Reveal";
import { leakPoints } from "@/config/site";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE PROBLEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The client's deck opens on a diagnosis rather than a pitch: a good project
 * still stalls when marketing and sales are disconnected, and it leaks at a
 * specific, nameable point in the funnel.
 *
 * That framing is the right one to lead with for a builder audience, because
 * every developer has watched at least one of these happen on their own site
 * and will recognise it immediately. Naming the leak is more persuasive than
 * claiming competence.
 *
 * Rendered as a pipeline with the leaks dropping out beneath it — the visual
 * argument being that attention is not the problem, retention through the
 * stages is.
 */
export function TheGap() {
  return (
    <section id="problem" className="border-t border-rule bg-sand py-20 lg:py-28">
      <div className="shell">
        <Reveal>
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">01 — Where projects stall</p>
            <h2 className="display-tight font-display text-h2">
              A great project can still struggle without a{" "}
              <em className="display-wonk text-brass">strong demand engine.</em>
            </h2>
            <p className="mt-5 text-lead text-ink-muted">
              Not because the building is wrong. Because marketing and sales
              run as separate activities, and a prospect falls through the gap
              between them.
            </p>
          </div>
        </Reveal>

        {/* ── Pipeline with leaks ──────────────────────────────────────── */}
        <RevealGroup
          className="mt-14 grid gap-px bg-rule-strong/40 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.07}
        >
          {leakPoints.map((point, i) => (
            <div key={point.stage} className="group bg-sand p-6 lg:p-7">
              <div className="flex items-baseline gap-3">
                <span
                  className="font-mono text-[0.625rem] text-brass tabular-nums"
                  data-numeric
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-mono text-[0.5625rem] tracking-[0.16em] text-ink-muted uppercase">
                  {point.stage}
                </p>
              </div>

              {/* The leak is the headline, not the stage — that is the point. */}
              <p className="mt-3 font-display text-h4 leading-snug text-ink">
                {point.leak}
              </p>

              {/* A hairline that visually "drops" out of the stage. */}
              <div className="mt-5 flex items-center gap-2" aria-hidden>
                <span className="h-px flex-1 bg-rule-strong" />
                <span className="size-1 rotate-45 bg-brass/60" />
              </div>
            </div>
          ))}
        </RevealGroup>

        <Reveal className="mt-12">
          <p className="max-w-3xl font-display text-h3 leading-snug text-ink">
            The challenge isn&rsquo;t simply getting attention.{" "}
            <em className="display-wonk text-brass">
              The challenge is moving prospects forward.
            </em>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
