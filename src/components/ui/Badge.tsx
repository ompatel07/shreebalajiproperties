import { BadgeCheck } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "neutral" | "brass" | "verdant" | "ink" | "alert" | "outline";

const tones: Record<Tone, string> = {
  neutral: "bg-sand text-ink-muted",
  brass: "bg-brass-pale text-brass-deep",
  verdant: "bg-verdant-pale text-verdant",
  ink: "bg-ink text-bone",
  alert: "bg-alert-pale text-alert",
  outline: "border border-rule-strong text-ink-muted bg-paper/70 backdrop-blur-sm",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 font-mono text-micro font-medium tracking-[0.12em] uppercase",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/**
 * The single most important badge on the site.
 *
 * In Indian residential property, a RERA registration number is the buyer's
 * primary fraud check — it is the difference between an enquiry and a
 * bounce. So it is always visible, always the same green, and when we have
 * the actual registration number we show it rather than just claiming
 * compliance.
 */
export function ReraBadge({
  verified,
  reraId,
  className,
}: {
  verified: boolean;
  reraId?: string | null;
  className?: string;
}) {
  if (!verified && !reraId) {
    return (
      <Badge tone="neutral" className={className}>
        Resale · RERA exempt
      </Badge>
    );
  }

  return (
    <Badge
      tone="verdant"
      className={className}
      icon={<BadgeCheck className="size-3.5" strokeWidth={2.2} aria-hidden />}
    >
      {reraId ? `RERA ${reraId.slice(-10)}` : "RERA Verified"}
    </Badge>
  );
}
