import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The one section header used across the homepage.
 *
 * Deliberately plain: a bold title, one line of context, and a single action
 * on the right. The previous design opened every section with a small-caps
 * label, a serif headline and one gold italic word — the same flourish ten
 * times down the page is what read as a template. Consistency is fine;
 * ornament on repeat is not.
 */
export function SectionHeader({
  title,
  subtitle,
  action,
  tone = "light",
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: { label: string; href: string };
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-3", className)}>
      <div className="max-w-2xl">
        <h2
          className={cn(
            "text-[clamp(1.625rem,3vw,2.375rem)] leading-[1.1] font-extrabold tracking-[-0.03em]",
            dark ? "text-white" : "text-ink",
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={cn("mt-2 text-[0.9375rem] leading-relaxed", dark ? "text-white/70" : "text-ink-muted")}>
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-1.5 text-[0.9375rem] font-bold",
            dark ? "text-brass-light hover:text-white" : "text-brass-deep hover:text-ink",
          )}
        >
          {action.label}
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            strokeWidth={2.4}
            aria-hidden
          />
        </Link>
      )}
    </div>
  );
}
