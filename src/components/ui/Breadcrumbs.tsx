import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Breadcrumbs. Paired with `breadcrumbSchema()` on every page that renders
 * them, so the trail shows in the search result as well as on the page.
 *
 * The final crumb is the current page: not a link, and marked
 * `aria-current="page"`.
 */
export function Breadcrumbs({
  trail,
  tone = "ink",
}: {
  trail: { name: string; path: string }[];
  tone?: "ink" | "bone";
}) {
  const inverse = tone === "bone";

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-semibold text-micro tracking-[0.1em] uppercase">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;

          return (
            <li key={crumb.path} className="flex items-center gap-1.5">
              {isLast ? (
                <span
                  aria-current="page"
                  className={`line-clamp-1 max-w-[18rem] ${inverse ? "text-bone/60" : "text-ink-faint"}`}
                >
                  {crumb.name}
                </span>
              ) : (
                <>
                  <Link
                    href={crumb.path}
                    className={`link-draw ${inverse ? "text-bone/75 hover:text-bone" : "text-ink-muted hover:text-ink"}`}
                  >
                    {crumb.name}
                  </Link>
                  <ChevronRight
                    className={`size-3 ${inverse ? "text-bone/30" : "text-ink-faint"}`}
                    strokeWidth={1.8}
                    aria-hidden
                  />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
