import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MOTION LANGUAGE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * These are **server components**. They emit an element carrying a data
 * attribute and nothing else — no hooks, no client bundle. The shared
 * observer in `ScrollReveal` flips `data-in="1"`; the transitions live in
 * `globals.css`.
 *
 * The rules the system enforces:
 *   · One easing curve across the entire site.
 *   · Everything animates once.
 *   · Transforms and opacity only — nothing here can trigger reflow, which
 *     matters on the mid-range Android most buyers in this market use.
 *   · `prefers-reduced-motion` renders the final state immediately.
 */

type Tag = "div" | "section" | "li" | "span" | "article" | "header" | "figure" | "ul" | "dl";

export function Reveal({
  children,
  delay = 0,
  y,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  /** Seconds, to keep the call sites unchanged from the old API. */
  delay?: number;
  /** Travel distance, in rem. Defaults to 1.75rem. */
  y?: number;
  className?: string;
  as?: Tag;
}) {
  const Component = Tag as "div";

  return (
    <Component
      data-reveal=""
      className={className}
      style={{
        ...(delay ? { ["--reveal-delay" as string]: `${Math.round(delay * 1000)}ms` } : {}),
        ...(y !== undefined ? { ["--reveal-y" as string]: `${y}rem` } : {}),
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Staggers its direct children. The delay comes from `:nth-child` in CSS, so
 * the children need no wrapper component and cost nothing.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  y,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Seconds between children. */
  stagger?: number;
  /** Seconds before the first child starts. */
  delay?: number;
  y?: number;
  as?: Tag;
}) {
  const Component = Tag as "div";

  return (
    <Component
      data-reveal-group=""
      className={className}
      style={{
        ["--stagger" as string]: `${Math.round(stagger * 1000)}ms`,
        ...(delay ? { ["--reveal-delay" as string]: `${Math.round(delay * 1000)}ms` } : {}),
        ...(y !== undefined ? { ["--reveal-y" as string]: `${y}rem` } : {}),
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Kept so existing call sites compile unchanged. Inside a `RevealGroup` the
 * stagger is applied by CSS to whatever the direct children are, so this is
 * now a plain wrapper with no behaviour of its own.
 */
export function RevealItem({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  as?: Tag;
}) {
  const Component = Tag as "div";
  return <Component className={className}>{children}</Component>;
}

/**
 * Headline that reveals line by line from behind its own mask.
 *
 * The caller splits the copy into lines rather than this measuring them —
 * measuring would need a layout pass before first paint, which is exactly
 * where a hero animation goes wrong.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  /** Seconds before the first line starts rising. */
  delay?: number;
}) {
  return (
    <span
      className={cn("lines", className)}
      style={delay ? { ["--reveal-delay" as string]: `${Math.round(delay * 1000)}ms` } : undefined}
    >
      {lines.map((line, i) => (
        <span key={i}>
          <span className={lineClassName}>{line}</span>
        </span>
      ))}
    </span>
  );
}

/** A hairline that draws itself across. The recurring section divider. */
export function DrawRule({
  className,
  origin = "left",
}: {
  className?: string;
  delay?: number;
  origin?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "draw-rule h-px w-full bg-rule",
        origin === "center" && "origin-center",
        className,
      )}
    />
  );
}
