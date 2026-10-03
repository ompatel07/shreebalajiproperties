"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * Admin nav. Client-side only because it needs `usePathname` to mark the
 * active item — everything else in the shell stays a server component.
 *
 * `/studio` is matched exactly; every other item matches its subtree, so
 * `/studio/listings/new` still highlights "Listings".
 */
export function StudioNav({
  items,
  orientation = "vertical",
}: {
  items: { href: string; label: string }[];
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/studio" ? pathname === "/studio" : pathname.startsWith(href);

  if (orientation === "horizontal") {
    return (
      <nav aria-label="Studio sections" className="no-bar overflow-x-auto border-t border-rule">
        <ul className="flex gap-1 px-4 py-2">
          {items.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "inline-block rounded-[2px] px-3.5 py-2 font-mono text-[0.625rem] tracking-[0.12em] uppercase transition-colors",
                  isActive(item.href)
                    ? "bg-ink text-bone"
                    : "text-ink-muted hover:bg-bone hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Studio sections" className="relative flex-1 overflow-y-auto p-3">
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "block rounded-[2px] px-3.5 py-2.5 font-mono text-[0.625rem] tracking-[0.12em] uppercase transition-colors",
                isActive(item.href)
                  ? "bg-ink text-bone"
                  : "text-ink-muted hover:bg-bone hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
