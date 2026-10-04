"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarCheck,
  Home,
  LayoutDashboard,
  MessageSquareQuote,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Admin nav. A Client Component because it needs `usePathname` to mark the
 * active item.
 *
 * ── Why icons are looked up by name ─────────────────────────────────────
 * The layout is a Server Component, and a React component reference is not
 * serialisable across that boundary — so the icon cannot be passed as a prop.
 * The layout sends a string key and this module resolves it. The previous
 * version imported the icons in the layout and then dropped them on the floor
 * (`navItems.map(({ icon, ...rest }) => rest)`), so the nav had no icons at
 * all despite the work being done to define them.
 *
 * ── Why the counts matter ───────────────────────────────────────────────
 * This panel is used by one or two people checking "is there anything for me
 * to do?". A badge on Leads and Site visits answers that from any page in the
 * panel without a click, which is the single highest-value thing the nav can
 * do. A zero is deliberately not rendered — an empty badge is noise.
 */

const ICONS: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  listings: Home,
  leads: Users,
  visits: CalendarCheck,
  projects: Building2,
  testimonials: MessageSquareQuote,
};

export interface StudioNavItem {
  href: string;
  label: string;
  /** Key into ICONS above — a string, because this crosses the RSC boundary. */
  icon: string;
  /** Live count. Omitted or 0 renders no badge. */
  badge?: number;
  /** Draws the badge as work waiting rather than as a neutral total. */
  urgent?: boolean;
}

export function StudioNav({
  items,
  orientation = "vertical",
}: {
  items: StudioNavItem[];
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  // `/studio` matches exactly; everything else matches its subtree, so
  // `/studio/listings/new` still highlights "Listings".
  const isActive = (href: string) =>
    href === "/studio" ? pathname === "/studio" : pathname.startsWith(href);

  if (orientation === "horizontal") {
    return (
      <nav aria-label="Studio sections" className="no-bar overflow-x-auto border-t border-rule">
        <ul className="flex gap-1 px-4 py-2">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = ICONS[item.icon] ?? LayoutDashboard;

            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.8125rem] font-semibold whitespace-nowrap transition-colors",
                    active ? "bg-ink text-bone" : "text-ink-muted hover:bg-bone hover:text-ink",
                  )}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.9} aria-hidden />
                  {item.label}
                  <Badge count={item.badge} urgent={item.urgent} active={active} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Studio sections" className="relative flex-1 overflow-y-auto p-3">
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = ICONS[item.icon] ?? LayoutDashboard;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-card)] px-3.5 py-2.5 text-[0.875rem] font-semibold transition-colors",
                  active ? "bg-ink text-bone" : "text-ink-soft hover:bg-bone hover:text-ink",
                )}
              >
                <Icon
                  className={cn("size-[1.05rem] shrink-0", active ? "text-bone" : "text-ink-faint")}
                  strokeWidth={1.9}
                  aria-hidden
                />
                <span className="flex-1 truncate">{item.label}</span>
                <Badge count={item.badge} urgent={item.urgent} active={active} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Badge({
  count,
  urgent,
  active,
}: {
  count?: number;
  urgent?: boolean;
  active: boolean;
}) {
  if (!count) return null;

  return (
    <span
      data-numeric
      className={cn(
        "ml-auto inline-grid min-w-[1.5rem] shrink-0 place-items-center rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular-nums",
        active
          ? "bg-bone/20 text-bone"
          : urgent
            ? "bg-brass text-paper"
            : "bg-sand-deep text-ink-muted",
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
