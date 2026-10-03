import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, TrendingUp } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { FilterRail, SortBar } from "@/components/property/FilterRail";
import { Pagination } from "@/components/property/Pagination";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import {
  budgetBands,
  localities,
  localityBySlug,
  possessionStatuses,
  propertyTypes,
  site,
  zoneLabels,
} from "@/config/site";
import { formatPrice } from "@/lib/format";
import { getListings } from "@/lib/queries";
import {
  allFacetPaths,
  facetBreadcrumbs,
  facetDescription,
  facetHeading,
  facetIntro,
  facetTitle,
  isKnownCity,
  resolveFacets,
} from "@/lib/slugs";
import { breadcrumbSchema, faqSchema, itemListSchema, pageMeta } from "@/lib/seo";
import { searchParamsSchema } from "@/lib/validation";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE PROGRAMMATIC SEO ROUTE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * One file serves several hundred landing pages:
 *
 *   /ahmedabad                         /ahmedabad/shela
 *   /ahmedabad/flats                   /ahmedabad/shela/3-bhk-flats
 *   /ahmedabad/3-bhk-flats             /ahmedabad/shela/under-50-lakh
 *   /ahmedabad/under-50-lakh           /gandhinagar/gift-city
 *
 * Each one is server-rendered with its own title, H1, intro, canonical,
 * breadcrumbs and JSON-LD — which is the whole advantage over the reference
 * site, a client-rendered SPA where every one of these is a JS route.
 *
 * Three rules keep this an asset rather than a doorway-page farm:
 *
 *   1. **Unresolvable URLs 404.** `resolveFacets` returns null for an unknown
 *      segment, a duplicated facet, or a locality in the wrong city. We never
 *      render a page for a combination we did not intend.
 *   2. **Query strings are never indexed.** Applying a filter switches the
 *      page to `noindex, follow` with the canonical still pointing at the
 *      clean path, so filter permutations cannot cannibalise it.
 *   3. **Every page says something specific.** The intro paragraph is built
 *      from the locality's real ₹/sq.ft band and live inventory counts, not
 *      from a restatement of the title.
 */

export const revalidate = 900;
/** Combinations outside `generateStaticParams` still render, on demand. */
export const dynamicParams = true;

interface Props {
  params: Promise<{ city: string; facets?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Pre-render the curated facet set at build time.
 *
 * Deliberately not the full cross-product: every facet against every other
 * would be tens of thousands of near-identical URLs, which burns crawl budget
 * and dilutes the pages that matter. See `allFacetPaths()`.
 */
export async function generateStaticParams() {
  return allFacetPaths().map(({ city, facets }) => ({ city, facets }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { city, facets = [] } = await params;
  const resolved = resolveFacets(city, facets);

  if (!resolved) {
    return pageMeta({
      title: `Not found | ${site.name}`,
      description: "This page does not exist.",
      path: `/${city}`,
      index: false,
    });
  }

  const sp = await searchParams;
  const hasFilters = Object.keys(sp).some((k) =>
    ["q", "type", "bhk", "min", "max", "locality", "possession", "amenities", "furnishing", "page"].includes(k),
  );

  const { total } = await getListings(resolved, { page: 1 });

  return pageMeta({
    title: facetTitle(resolved, total),
    description: facetDescription(resolved, total),
    // Canonical always points at the clean path, even on a filtered view.
    path: resolved.canonicalPath,
    index: !hasFilters,
  });
}

export default async function FacetPage({ params, searchParams }: Props) {
  const { city, facets = [] } = await params;

  if (!isKnownCity(city)) notFound();

  const resolved = resolveFacets(city, facets);
  if (!resolved) notFound();

  const sp = await searchParams;
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) {
    flat[k] = Array.isArray(v) ? v[0] : v;
  }

  // `.catch()` on every field means a hand-mangled URL degrades to the
  // unfiltered view instead of throwing a 500.
  const query = searchParamsSchema.parse(flat);

  const { items, total, page, pageCount } = await getListings(resolved, query);

  const trail = facetBreadcrumbs(resolved);
  const heading = facetHeading(resolved);
  const intro = facetIntro(resolved, total);
  const faqs = buildFaqs(resolved, total);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemListSchema(items, heading)),
          }}
        />
      )}
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
        />
      )}

      <div className="pt-16 lg:pt-[4.75rem]">
        {/* ── Masthead ─────────────────────────────────────────────────── */}
        <header className="border-b border-rule bg-sand">
          <div className="shell py-10 lg:py-14">
            <Breadcrumbs trail={trail} />

            <h1 className="display-tight mt-6 max-w-4xl font-display text-h2 text-ink">
              {heading}
            </h1>

            <p className="mt-5 max-w-3xl text-lead text-ink-muted">{intro}</p>

            {/* Locality price band — the one fact that makes these pages
                useful rather than a wrapper around a grid. */}
            {resolved.locality && (
              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-rule-strong/50 pt-6">
                {/* A rate is shown only where we hold one, and it is labelled
                    an estimate. Covered-tier areas say so instead. */}
                <div>
                  <dt className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-faint uppercase">
                    {resolved.locality.pricePerSqft ? "Indicative rate" : "Rate"}
                  </dt>
                  <dd className="mt-1 font-display text-h4 text-ink" data-numeric>
                    {resolved.locality.pricePerSqft ? (
                      <>
                        ₹{resolved.locality.pricePerSqft[0].toLocaleString("en-IN")} –{" "}
                        {resolved.locality.pricePerSqft[1].toLocaleString("en-IN")}
                        <span className="ml-1 font-mono text-micro text-ink-muted">/sq.ft</span>
                      </>
                    ) : (
                      <span className="text-ink-muted">On request</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-faint uppercase">
                    Corridor
                  </dt>
                  <dd className="mt-1 font-display text-h4 text-ink">
                    {zoneLabels[resolved.locality.zone]}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-faint uppercase">
                    Live listings
                  </dt>
                  <dd className="mt-1 font-display text-h4 text-ink" data-numeric>
                    {total}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </header>

        {/* ── Results ──────────────────────────────────────────────────── */}
        <div className="shell grid gap-10 py-10 lg:grid-cols-[15rem_1fr] lg:gap-12 lg:py-14">
          <FilterRail
            total={total}
            facetLocked={{
              locality: Boolean(resolved.locality),
              propertyType: Boolean(resolved.propertyType),
              budget: Boolean(resolved.budget),
              possession: Boolean(resolved.possession),
              bhk: Boolean(resolved.bhk),
            }}
          />

          <div className="min-w-0">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-5">
              <p className="font-mono text-micro tracking-[0.1em] text-ink-muted uppercase">
                Showing{" "}
                <span className="text-ink" data-numeric>
                  {items.length}
                </span>{" "}
                of{" "}
                <span className="text-ink" data-numeric>
                  {total}
                </span>
              </p>
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
                  basePath={resolved.canonicalPath}
                  searchParams={flat}
                />
              </>
            ) : (
              <NoResults heading={heading} city={resolved.city.name} />
            )}
          </div>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        {faqs.length > 0 && (
          <section className="border-t border-rule bg-paper py-16" aria-labelledby="faq">
            <div className="shell max-w-4xl">
              <Reveal>
                <h2 id="faq" className="eyebrow mb-8 border-b border-rule pb-4">
                  Questions buyers ask us about this
                </h2>
              </Reveal>

              <dl className="space-y-px">
                {faqs.map((faq, i) => (
                  <Reveal key={faq.q} delay={i * 0.04}>
                    <div className="border-b border-rule py-6">
                      <dt className="font-display text-h4 leading-snug text-ink">{faq.q}</dt>
                      <dd className="mt-3 max-w-prose leading-relaxed text-ink-muted">
                        {faq.a}
                      </dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>
          </section>
        )}

        {/* ── Internal linking ─────────────────────────────────────────── */}
        <RelatedFacets resolved={resolved} />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════════════════ */

function NoResults({ heading, city }: { heading: string; city: string }) {
  return (
    <div className="relative overflow-hidden rounded-[2px] border border-rule bg-paper px-6 py-20 text-center">
      <div className="jaali absolute inset-0" aria-hidden />
      <div className="relative">
        <p className="eyebrow">Nothing matching, today</p>
        <h2 className="mx-auto mt-4 max-w-xl font-display text-h3">
          We have nothing live for {heading.toLowerCase()} this week.
        </h2>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-muted">
          That is usually a timing problem, not a market one — stock in {city}{" "}
          turns over weekly. Tell us the requirement and we will call you the
          day something fits, often before it is listed anywhere.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/contact" size="lg">
            Register the requirement
          </ButtonLink>
          <ButtonLink href="/properties" variant="outline" size="lg">
            Browse everything
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL LINKING
   Sibling facets, so both visitors and crawlers move laterally through the
   taxonomy instead of dead-ending on a thin page. This block is a large part
   of why these pages get crawled regularly.
   ═══════════════════════════════════════════════════════════════════════════ */

function RelatedFacets({
  resolved,
}: {
  resolved: NonNullable<ReturnType<typeof resolveFacets>>;
}) {
  const citySlug = resolved.city.slug;
  const cityLocalities = localities.filter((l) => l.city === citySlug);

  // On a locality page, show neighbours in the same corridor — that is the
  // substitution a buyer actually makes.
  const neighbours = resolved.locality
    ? cityLocalities
        .filter((l) => l.zone === resolved.locality!.zone && l.slug !== resolved.locality!.slug)
        .slice(0, 8)
    : cityLocalities.filter((l) => l.featured).slice(0, 8);

  const base = resolved.locality ? `/${citySlug}/${resolved.locality.slug}` : `/${citySlug}`;

  return (
    <section className="border-t border-rule bg-sand py-16" aria-labelledby="related">
      <div className="shell">
        <h2 id="related" className="eyebrow mb-8 border-b border-rule-strong/50 pb-4">
          Keep looking
        </h2>

        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          <LinkColumn
            title={resolved.locality ? `Also in ${zoneLabels[resolved.locality.zone]}` : "Popular localities"}
            links={neighbours.map((l) => ({
              href: `/${l.city}/${l.slug}`,
              label: l.name,
              meta: l.pricePerSqft ? `₹${(l.pricePerSqft[0] / 1000).toFixed(1)}K+/sqft` : undefined,
            }))}
          />

          <LinkColumn
            title="By configuration"
            links={[2, 3, 4, 5].map((bhk) => ({
              href: `${base}/${bhk}-bhk-flats`,
              label: `${bhk} BHK Flats`,
            }))}
          />

          <LinkColumn
            title="By budget"
            links={budgetBands.map((b) => ({
              href: `${base}/${b.slug}`,
              label: b.label,
            }))}
          />

          <LinkColumn
            title="By type & possession"
            links={[
              ...["villas", "bungalows", "penthouses", "plots", "offices"].map((t) => ({
                href: `${base}/${t}`,
                label: propertyTypes.find((p) => p.slug === t)?.name ?? t,
              })),
              ...possessionStatuses.slice(0, 2).map((p) => ({
                href: `/${citySlug}/${p.slug}`,
                label: p.label,
              })),
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; meta?: string }[];
}) {
  return (
    <div>
      <p className="mb-4 font-mono text-micro tracking-[0.12em] text-brass uppercase">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex items-baseline justify-between gap-3 text-[0.9375rem] text-ink-soft transition-colors duration-250 hover:text-brass"
            >
              <span className="link-draw">{link.label}</span>
              {link.meta ? (
                <span className="shrink-0 font-mono text-[0.5625rem] text-ink-faint">
                  {link.meta}
                </span>
              ) : (
                <ArrowUpRight
                  className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  strokeWidth={2}
                  aria-hidden
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FAQ GENERATION
   Real answers, assembled from locality data. These earn the accordion rich
   result and — more importantly — answer what a buyer actually types into
   Google before they are ready to enquire.
   ═══════════════════════════════════════════════════════════════════════════ */

function buildFaqs(
  resolved: NonNullable<ReturnType<typeof resolveFacets>>,
  total: number,
): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  const locality = resolved.locality;
  const subject = resolved.bhk
    ? `${resolved.bhk} BHK ${resolved.propertyType?.name.toLowerCase() ?? "homes"}`
    : (resolved.propertyType?.name.toLowerCase() ?? "property");

  if (locality?.pricePerSqft) {
    const [lo, hi] = locality.pricePerSqft;
    const mid = Math.round((lo + hi) / 2);

    faqs.push({
      q: `What is the current property rate in ${locality.name}?`,
      a: `${locality.name} is transacting at roughly ₹${lo.toLocaleString("en-IN")} to ₹${hi.toLocaleString(
        "en-IN",
      )} per sq.ft on carpet area, with most deals landing near ₹${mid.toLocaleString(
        "en-IN",
      )}. Where a project sits in that band depends on the tower's age, the floor, the amenity deck and the developer's track record. We quote carpet area throughout — a super built-up quote elsewhere will look cheaper per sq.ft for the same flat.`,
    });

    faqs.push({
      q: `Is ${locality.name} a good area to buy in?`,
      a: `${locality.blurb ?? ""} For a buyer, the practical questions are commute, schools and how much new supply is still coming — more supply means more negotiating room now, and slower appreciation later. We will give you a straight read on all three for your specific budget.`,
    });

    if (resolved.bhk) {
      faqs.push({
        q: `How much does a ${resolved.bhk} BHK cost in ${locality.name}?`,
        a: `A ${resolved.bhk} BHK in ${locality.name} typically carries ${
          resolved.bhk === 2 ? "850–1,150" : resolved.bhk === 3 ? "1,250–1,750" : "1,800–2,600"
        } sq.ft of carpet, which at local rates works out to roughly ${formatPrice(
          (resolved.bhk === 2 ? 1000 : resolved.bhk === 3 ? 1500 : 2200) * lo,
        )} to ${formatPrice(
          (resolved.bhk === 2 ? 1000 : resolved.bhk === 3 ? 1500 : 2200) * hi,
        )}. Add about 5.9% for stamp duty and registration on top — that is not financeable, so it has to come from your own funds.`,
      });
    }
  }

  faqs.push({
    q: `Are these listings RERA registered?`,
    a: `Every under-construction project on this site carries its Gujarat RERA registration number, which you can verify yourself on gujrera.gujarat.gov.in before you speak to us. Resale flats in completed buildings are legally exempt from RERA registration — where that is the case we label the listing as resale rather than implying a registration exists.`,
  });

  faqs.push({
    q: `Do you charge the buyer a fee?`,
    a: `No. On a new-launch or under-construction purchase we are paid by the developer, at a rate agreed in writing before we start, and that does not change your price — quoting you above the developer's own rate to widen a margin is the practice this business was set up to avoid. On a resale transaction the brokerage is standard and agreed up front, in writing, before we show you anything.`,
  });

  if (total === 0) {
    faqs.push({
      q: `There is nothing listed here — can you still help?`,
      a: `Usually, yes. A good deal in Ahmedabad is often sold before it reaches a portal, and a fair amount of what we transact never gets listed publicly at all. Register your requirement and you go on the call list for the matching inventory as it comes up.`,
    });
  }

  return faqs.slice(0, 5);
}
