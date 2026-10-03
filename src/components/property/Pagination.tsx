import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Pagination as real `<a href>` links, not buttons.
 *
 * That matters for two reasons: a crawler follows anchors and will discover
 * page 2 onward, and a visitor can open page 3 in a new tab. A JS-only pager
 * breaks both.
 *
 * `rel="prev"/"next"` are retained — Google no longer uses them for indexing,
 * but other crawlers and some browsers still do, and they cost nothing.
 */
export function Pagination({
  page,
  pageCount,
  basePath,
  searchParams = {},
}: {
  page: number;
  pageCount: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Window of pages around the current one, with ellipses. Keeps the control
  // to a fixed width however deep the catalogue gets.
  const pages: (number | "…")[] = [];
  const window = 1;

  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= window) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          rel="prev"
          aria-label="Previous page"
          className="grid size-10 place-items-center rounded-[2px] border border-rule-strong text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone"
        >
          <ChevronLeft className="size-4" strokeWidth={1.8} aria-hidden />
        </Link>
      ) : (
        <span
          aria-hidden
          className="grid size-10 place-items-center rounded-[2px] border border-rule text-ink-faint"
        >
          <ChevronLeft className="size-4" strokeWidth={1.8} />
        </span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="grid size-10 place-items-center font-mono text-micro text-ink-faint"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "grid size-10 place-items-center rounded-[2px] border font-mono text-micro tabular-nums transition-colors",
              p === page
                ? "border-ink bg-ink text-bone"
                : "border-rule-strong text-ink hover:border-ink",
            )}
            data-numeric
          >
            {p}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link
          href={href(page + 1)}
          rel="next"
          aria-label="Next page"
          className="grid size-10 place-items-center rounded-[2px] border border-rule-strong text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone"
        >
          <ChevronRight className="size-4" strokeWidth={1.8} aria-hidden />
        </Link>
      ) : (
        <span
          aria-hidden
          className="grid size-10 place-items-center rounded-[2px] border border-rule text-ink-faint"
        >
          <ChevronRight className="size-4" strokeWidth={1.8} />
        </span>
      )}
    </nav>
  );
}
