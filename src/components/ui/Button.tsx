import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "brass" | "inverse";
type Size = "sm" | "md" | "lg";

/**
 * Buttons are near-square (2px radius) and the label is monospace small-caps.
 * That combination is doing a lot of the "architectural" work in the design —
 * it reads as a drawing label rather than a web button.
 */
const base =
  "group relative inline-flex items-center justify-center gap-2.5 font-semibold uppercase " +
  "tracking-[0.14em] whitespace-nowrap rounded-[2px] transition-all duration-300 " +
  "ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-45 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-bone hover:bg-brass-deep active:scale-[0.985] shadow-[var(--shadow-lift)] hover:shadow-[var(--shadow-raise)]",
  brass:
    "bg-brass text-paper hover:bg-brass-deep active:scale-[0.985] shadow-[var(--shadow-lift)] hover:shadow-[var(--shadow-raise)]",
  outline:
    "border border-ink/25 text-ink bg-transparent hover:border-ink hover:bg-ink hover:text-bone active:scale-[0.985]",
  ghost: "text-ink hover:bg-sand active:scale-[0.985]",
  inverse:
    "bg-bone text-ink hover:bg-brass-pale active:scale-[0.985] shadow-[var(--shadow-lift)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.6875rem]",
  md: "h-12 px-6 text-[0.75rem]",
  lg: "h-14 px-8 text-[0.8125rem]",
};

interface SharedProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Trailing glyph that nudges on hover. */
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  icon,
  fullWidth,
  ...props
}: SharedProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
      {icon && (
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  icon,
  fullWidth,
  ...props
}: SharedProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
      {icon && (
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </Link>
  );
}

/**
 * External links get `rel="noopener noreferrer"` unconditionally. `noopener`
 * stops the target from reaching back through `window.opener`; `noreferrer`
 * keeps our URLs out of third-party analytics.
 */
export function ButtonExternal({
  variant = "primary",
  size = "md",
  className,
  children,
  icon,
  fullWidth,
  href,
  ...props
}: SharedProps & ComponentProps<"a">) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
      {icon && (
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </a>
  );
}
