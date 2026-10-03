import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { DrawRule, Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/**
 * Every section on the site uses this header, which is most of what makes the
 * page feel composed rather than assembled:
 *
 *   numbered eyebrow ─────────────── optional link
 *   Display serif heading
 *   Supporting line, one measure wide
 *
 * The section number is a deliberate Swiss/architectural device — it implies
 * the page was laid out as a single document with an order to it.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  lede,
  link,
  align = "left",
  tone = "ink",
  className,
}: {
  /** Two-digit section number, e.g. "02". */
  index?: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  link?: { href: string; label: string };
  align?: "left" | "center";
  tone?: "ink" | "bone";
  className?: string;
}) {
  const inverse = tone === "bone";

  return (
    <div className={cn("mb-12 lg:mb-16", className)}>
      <Reveal>
        <div
          className={cn(
            "flex flex-wrap items-baseline gap-x-6 gap-y-2",
            align === "center" ? "justify-center" : "justify-between",
          )}
        >
          <p
            className={cn(
              "eyebrow flex items-center gap-3",
              inverse && "text-bone/60",
            )}
          >
            {index && (
              <>
                <span className={inverse ? "text-brass-light" : "text-brass"}>{index}</span>
                <span className={cn("h-px w-8", inverse ? "bg-bone/30" : "bg-rule-strong")} aria-hidden />
              </>
            )}
            {eyebrow}
          </p>

          {link && (
            <Link
              href={link.href}
              className={cn(
                "group inline-flex items-center gap-2 font-semibold text-micro tracking-[0.14em] uppercase transition-colors duration-300",
                inverse ? "text-bone/70 hover:text-bone" : "text-ink-muted hover:text-brass",
              )}
            >
              <span className="link-draw">{link.label}</span>
              <ArrowRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.8}
                aria-hidden
              />
            </Link>
          )}
        </div>
      </Reveal>

      <DrawRule className={cn("mt-4 mb-7", inverse && "bg-bone/20")} />

      <Reveal delay={0.08}>
        <div className={cn(align === "center" && "text-center")}>
          <h2
            className={cn(
              "display-tight max-w-4xl font-display text-h2",
              align === "center" && "mx-auto",
              inverse && "text-bone",
            )}
          >
            {title}
          </h2>

          {lede && (
            <p
              className={cn(
                "mt-5 max-w-2xl text-lead",
                align === "center" && "mx-auto",
                inverse ? "text-bone/70" : "text-ink-muted",
              )}
            >
              {lede}
            </p>
          )}
        </div>
      </Reveal>
    </div>
  );
}

/** Consistent vertical rhythm + optional band colour. */
export function Section({
  children,
  className,
  surface = "bone",
  id,
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  surface?: "bone" | "sand" | "paper" | "ink";
  id?: string;
  size?: "sm" | "md" | "lg";
}) {
  const surfaces = {
    bone: "bg-bone",
    sand: "bg-sand",
    paper: "bg-paper",
    ink: "bg-ink",
  } as const;

  const sizes = {
    sm: "py-16 lg:py-20",
    md: "py-20 lg:py-28",
    lg: "py-24 lg:py-36",
  } as const;

  return (
    <section
      id={id}
      // `scroll-mt` so anchor jumps clear the fixed header.
      className={cn(surfaces[surface], sizes[size], "scroll-mt-24", className)}
    >
      {children}
    </section>
  );
}
