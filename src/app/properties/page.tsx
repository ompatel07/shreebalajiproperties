import type { Metadata } from "next";
import Link from "next/link";
import { Map as MapIcon, Search } from "lucide-react";

import { ActiveFilters } from "@/components/property/ActiveFilters";
import { FilterRail, SortBar } from "@/components/property/FilterRail";
import { Pagination } from "@/components/property/Pagination";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { budgetBands, localities, propertyTypes, site } from "@/config/site";
import { getListings } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { searchParamsSchema } from "@/lib/validation";

/**
 * The interactive search surface.
 *
 * Unlike the facet routes, this page is **always `noindex, follow`**. That is
 * deliberate: `/properties?bhk=3&locality=shela` and `/ahmedabad/shela/3-bhk-flats`
 * would otherwise compete for the same query, and the clean path is the one
 * worth ranking. `follow` keeps every listing link crawlable from here.
 *
 * Rendered dynamically because the result set depends entirely on the query
 * string — caching it would mean caching one visitor's filters for everyone.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: `Search Property in Ahmedabad & Gandhinagar | ${site.name}`,
  description:
    "Filter RERA-verified flats, villas, penthouses, offices and plots across Ahmedabad and Gandhinagar by budget, configuration, locality and possession date.",
  path: "/properties",
  index: false,
});

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PropertiesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) {
    flat[k] = Array.isArray(v) ? v[0] : v;
  }

  const query = searchParamsSchema.parse(flat);
  const { items, total, page, pageCount } = await getListings({}, query);

  const trail = [
    { name: "Home", path: "/" },
    { name: "Search", path: "/properties" },
  ];

  return (
    <div className="pt-16 lg:pt-[4.75rem]">
      {/* ── Masthead ───────────────────────────────────────────────────── */}
      <header className="border-b border-rule bg-sand">
        <div className="shell py-10 lg:py-12">
          <Breadcrumbs trail={trail} />

          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="display-tight font-display text-h2 text-ink">
                {query.q ? (
                  <>
                    Results for{" "}
                    <em className="display-wonk text-brass">“{query.q}”</em>
                  </>
                ) : (
                  "Search properties"
                )}
              </h1>
              <p className="mt-4 max-w-2xl text-lead text-ink-muted">
                {total > 0
                  ? `${total} ${total === 1 ? "property" : "properties"} in Ahmedabad and Gandhinagar. Use the filters to narrow it down, or just type what you want.`
                  : "Nothing matches that yet. Try a bigger budget range, or a different area."}
              </p>
            </div>

            <ButtonLink
              href="/map"
              variant="outline"
              icon={<MapIcon className="size-4" strokeWidth={1.8} aria-hidden />}
            >
              View on map
            </ButtonLink>
          </div>

          {/* Free-text search — a GET form, so it works without JS. */}
          <form action="/properties" method="get" className="mt-8 max-w-2xl">
            {/* Preserve the active filters across a new text search. */}
            {Object.entries(flat)
              .filter(([k]) => !["q", "page"].includes(k) && flat[k])
              .map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}

            <div className="flex items-center gap-3 rounded-[2px] border border-rule-strong bg-paper px-4 py-3 focus-within:border-brass">
              <Search className="size-[1.1rem] shrink-0 text-ink-faint" strokeWidth={1.7} aria-hidden />
              <input
                type="search"
                name="q"
                defaultValue={query.q ?? ""}
                placeholder="Try “3 BHK in Shela” or a project name"
                aria-label="Search listings"
                enterKeyHint="search"
                maxLength={120}
                className="min-w-0 flex-1 bg-transparent text-[0.9375rem] text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-[2px] bg-ink px-4 py-2 font-semibold text-micro tracking-[0.12em] text-bone uppercase transition-colors hover:bg-brass-deep"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* ── Results ────────────────────────────────────────────────────── */}
      <div className="shell grid gap-10 py-10 lg:grid-cols-[15rem_1fr] lg:gap-12 lg:py-14">
        <FilterRail total={total} />

        <div className="min-w-0">
          {/* The count and the active filters lead; sort is secondary. The
              page number moved to the paginator, where it belongs — it was
              answering a question nobody asks on arrival. */}
          <div className="mb-7 flex flex-wrap items-start justify-between gap-x-6 gap-y-4 border-b border-rule pb-5">
            <ActiveFilters total={total} />
            <SortBar total={total} />
          </div>

          {items.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((p, i) => (
                  <PropertyCard key={p.id} property={p} priority={i < 3} />
                ))}
              </div>

              <Pagination
                page={page}
                pageCount={pageCount}
                basePath="/properties"
                searchParams={flat}
              />
            </>
          ) : (
            <EmptySearch />
          )}
        </div>
      </div>

      {/* ── Entry points. Also the internal-link surface for this page. ── */}
      <section className="border-t border-rule bg-sand py-16" aria-labelledby="browse">
        <div className="shell">
          <h2 id="browse" className="eyebrow mb-8 border-b border-rule-strong/50 pb-4">
            Or browse by
          </h2>

          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            <QuickColumn
              title="Residential"
              links={propertyTypes
                .filter((t) => t.category === "residential")
                .map((t) => ({ href: `/ahmedabad/${t.slug}`, label: t.name }))}
            />
            <QuickColumn
              title="Bedrooms"
              links={[1, 2, 3, 4, 5].map((n) => ({
                href: `/ahmedabad/${n}-bhk-flats`,
                label: `${n} BHK Flats`,
              }))}
            />
            <QuickColumn
              title="Budget"
              links={budgetBands.map((b) => ({
                href: `/ahmedabad/${b.slug}`,
                label: b.label,
              }))}
            />
            <QuickColumn
              title="Popular areas"
              links={localities
                .filter((l) => l.featured)
                .map((l) => ({ href: `/${l.city}/${l.slug}`, label: l.name }))}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptySearch() {
  return (
    <div className="relative overflow-hidden rounded-[2px] border border-rule bg-paper px-6 py-20 text-center">
      <div className="jaali absolute inset-0" aria-hidden />
      <div className="relative">
        <p className="eyebrow">No matches</p>
        <h2 className="mx-auto mt-4 max-w-md font-display text-h3">
          Nothing matches all of those.
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-muted">
          Remove a filter using the chips above, or tell us what you are looking
          for and we will check what is available — including properties not
          listed on the site yet.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/properties" variant="outline" size="lg">
            Clear all filters
          </ButtonLink>
          <ButtonLink href="/contact" size="lg">
            Tell us what you need
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function QuickColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-4 font-semibold text-micro tracking-[0.12em] text-brass uppercase">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="link-draw text-[0.9375rem] text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
