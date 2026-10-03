import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  Check,
  Compass,
  Layers,
  MapPin,
  Ruler,
  Sofa,
} from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { CompareButton } from "@/components/property/CompareButton";
import { EmiWidget } from "@/components/property/EmiWidget";
import { EnquiryForm } from "@/components/property/EnquiryForm";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyStickyBar } from "@/components/property/PropertyStickyBar";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ShortlistButton } from "@/components/property/ShortlistButton";
import { SiteVisitForm } from "@/components/property/SiteVisitForm";
import { StaticMap } from "@/components/property/StaticMap";
import { ViewPing } from "@/components/property/ViewPing";
import { Badge, ReraBadge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { localityBySlug, propertyTypes, site } from "@/config/site";
import {
  formatArea,
  formatBhk,
  formatDate,
  formatPossession,
  formatPrice,
  formatRupeesExact,
  pricePerSqft,
  priceInWords,
} from "@/lib/format";
import { galleryFor, heroImageFor } from "@/lib/imagery";
import { getPropertyBySlug, getSimilarListings } from "@/lib/queries";
import { breadcrumbSchema, listingSchema, pageMeta } from "@/lib/seo";
import { areaConversions } from "@/lib/finance";
import type { NearbyPlace } from "@/types/db";

/**
 * Listing detail.
 *
 * ISR with a 5-minute window: a price change or a status flip needs to be
 * live quickly, but these pages are read far more often than they are edited.
 * The admin publish action calls `revalidatePath` so an edit appears at once
 * rather than waiting out the window.
 */
export const revalidate = 300;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return pageMeta({
      title: `Listing not found | ${site.name}`,
      description: "This listing is no longer available.",
      path: `/property/${slug}`,
      index: false,
    });
  }

  const locality = localityBySlug.get(property.locality_slug);
  const localityName = locality?.name ?? property.locality_slug;
  const area = property.carpet_sqft ?? property.super_sqft;

  // Title is built from the facts a searcher types: config, type, locality,
  // price. Not "Luxurious Dream Home" — that ranks for nothing.
  const title = [
    property.bhk ? formatBhk(property.bhk) : null,
    typeLabel(property.property_type),
    `in ${localityName}, ${property.city === "ahmedabad" ? "Ahmedabad" : "Gandhinagar"}`,
    property.price && !property.price_on_request ? `— ${formatPrice(property.price)}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const description = [
    property.bhk ? `${formatBhk(property.bhk)} ${typeLabel(property.property_type).toLowerCase()}` : typeLabel(property.property_type),
    `for sale in ${localityName}.`,
    area ? `${formatArea(area)} carpet.` : null,
    property.price && !property.price_on_request ? `${formatPrice(property.price)}.` : null,
    formatPossession(property.possession, property.possession_date) + ".",
    property.rera_verified ? "RERA verified." : null,
    `Photos, floor plan and honest advice from ${site.name}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return pageMeta({
    title: `${title} | ${site.name}`,
    description,
    path: `/property/${property.slug}`,
    image: heroImageFor(property, 1200),
    // Sold and rented listings stay reachable (people share links) but leave
    // the index, so we never rank for inventory we cannot sell.
    index: property.status === "published" || property.status === "under_offer",
  });
}

function typeLabel(slug: string): string {
  return propertyTypes.find((t) => t.slug === slug)?.singular ?? "Property";
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) notFound();

  const locality = localityBySlug.get(property.locality_slug);
  const localityName = locality?.name ?? property.locality_slug;
  const cityName = property.city === "ahmedabad" ? "Ahmedabad" : "Gandhinagar";

  const similar = await getSimilarListings(
    {
      id: property.id,
      locality_slug: property.locality_slug,
      city: property.city,
      bhk: property.bhk,
      price: property.price,
      category: property.category,
    },
    4,
  );

  // Uploaded images win; otherwise a stable placeholder set so the page never
  // looks broken before the client's photography is in.
  const images =
    property.images.length > 0
      ? property.images.map((i) => ({ url: i.url, alt: i.alt, caption: i.caption }))
      : galleryFor(property.slug, property.category, 6).map((url, i) => ({
          url,
          alt: `${property.title} — placeholder photograph ${i + 1}`,
          caption: i === 0 ? "Representative image — awaiting site photography" : null,
        }));

  const area = property.carpet_sqft ?? property.super_sqft ?? property.plot_sqft;
  const nearby = (property.nearby ?? []) as NearbyPlace[];

  const trail = [
    { name: "Home", path: "/" },
    { name: cityName, path: `/${property.city}` },
    { name: localityName, path: `/${property.city}/${property.locality_slug}` },
    { name: property.title, path: `/property/${property.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(listingSchema(property, localityName)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />

      {/* Fire-and-forget view counter. */}
      <ViewPing slug={property.slug} />

      {/* Replaces the global mobile action rail, which is suppressed here. */}
      <PropertyStickyBar
        slug={property.slug}
        title={property.title}
        price={property.price}
        priceOnRequest={property.price_on_request}
        bhk={property.bhk}
        locality={localityName}
      />

      <div className="pt-16 pb-20 lg:pt-[4.75rem] lg:pb-24">
        {/* ── Breadcrumbs ──────────────────────────────────────────────── */}
        <div className="shell py-5">
          <Breadcrumbs trail={trail} />
        </div>

        {/* ── Gallery ──────────────────────────────────────────────────── */}
        <div className="shell">
          <PropertyGallery images={images} title={property.title} />
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="shell grid gap-10 py-12 lg:grid-cols-[1fr_22rem] lg:gap-14 xl:grid-cols-[1fr_24rem]">
          {/* ══ Main column ══════════════════════════════════════════════ */}
          <div className="min-w-0">
            {/* Title block */}
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <ReraBadge verified={property.rera_verified} reraId={property.rera_id} />
                {property.is_exclusive && <Badge tone="ink">Sole mandate</Badge>}
                {property.status === "under_offer" && <Badge tone="alert">Under offer</Badge>}
                {property.project?.is_partnered && (
                  <Badge tone="brass">Marketed by us</Badge>
                )}
              </div>

              <h1 className="display-tight mt-5 font-display text-h2 text-ink">
                {property.title}
              </h1>

              <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-muted">
                <MapPin className="size-4 shrink-0 text-ink-faint" strokeWidth={1.6} aria-hidden />
                {property.address ? `${property.address}, ` : ""}
                <Link
                  href={`/${property.city}/${property.locality_slug}`}
                  className="link-draw text-ink"
                >
                  {localityName}
                </Link>
                , {cityName}
              </p>

              {/* Price block — with the ₹/sq.ft that makes it comparable. */}
              <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-y border-rule py-7">
                <div>
                  <p className="font-display text-h2 leading-none text-ink" data-numeric>
                    {property.price_on_request ? "Price on request" : formatPrice(property.price)}
                  </p>

                  {property.price && !property.price_on_request && (
                    <p className="mt-2.5 font-semibold text-micro tracking-[0.08em] text-ink-muted uppercase">
                      {formatRupeesExact(property.price)}
                      {area ? ` · ${pricePerSqft(property.price, area)}` : ""}
                      {property.is_negotiable ? " · Negotiable" : ""}
                    </p>
                  )}

                  {property.price && !property.price_on_request && (
                    <p className="mt-1 text-caption text-ink-faint">
                      Rupees {priceInWords(property.price)} only
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ShortlistButton slug={property.slug} title={property.title} size="lg" />
                  <CompareButton slug={property.slug} />
                </div>
              </div>
            </header>

            {/* ── Spec grid ────────────────────────────────────────────── */}
            <Reveal className="mt-12">
              <section aria-labelledby="specs">
                <h2 id="specs" className="eyebrow mb-5 border-b border-rule pb-3">
                  Specification
                </h2>

                <dl className="grid grid-cols-2 gap-px bg-rule sm:grid-cols-3 lg:grid-cols-4">
                  {property.bhk && (
                    <Spec icon={Layers} label="Configuration" value={formatBhk(property.bhk)} />
                  )}
                  {property.carpet_sqft && (
                    <Spec
                      icon={Ruler}
                      label="Carpet area"
                      value={formatArea(property.carpet_sqft)}
                      note="RERA carpet"
                    />
                  )}
                  {property.super_sqft && (
                    <Spec icon={Ruler} label="Super built-up" value={formatArea(property.super_sqft)} />
                  )}
                  {property.plot_sqft && (
                    <Spec icon={Ruler} label="Plot area" value={formatArea(property.plot_sqft)} />
                  )}
                  {property.bathrooms ? (
                    <Spec icon={Layers} label="Bathrooms" value={String(property.bathrooms)} />
                  ) : null}
                  {property.balconies ? (
                    <Spec icon={Layers} label="Balconies" value={String(property.balconies)} />
                  ) : null}
                  {property.floor_no !== null && (
                    <Spec
                      icon={Building2}
                      label="Floor"
                      value={`${property.floor_no}${property.total_floors ? ` of ${property.total_floors}` : ""}`}
                    />
                  )}
                  {property.facing && (
                    <Spec icon={Compass} label="Facing" value={property.facing} />
                  )}
                  {property.furnishing && (
                    <Spec
                      icon={Sofa}
                      label="Furnishing"
                      value={property.furnishing.replace("-", " ")}
                      className="capitalize"
                    />
                  )}
                  <Spec
                    icon={Calendar}
                    label="Possession"
                    value={formatPossession(property.possession, property.possession_date)}
                  />
                  {property.age_years !== null && property.age_years > 0 && (
                    <Spec icon={Calendar} label="Age" value={`${property.age_years} years`} />
                  )}
                  {property.maintenance_psf ? (
                    <Spec
                      icon={Building2}
                      label="Maintenance"
                      value={`₹${property.maintenance_psf}/sq.ft`}
                    />
                  ) : null}
                </dl>

                {/* The carpet/built-up explainer. This single table defuses
                    the most common misunderstanding in Indian property. */}
                {property.carpet_sqft && !property.super_sqft && (
                  <AreaExplainer carpet={property.carpet_sqft} />
                )}
              </section>
            </Reveal>

            {/* ── Description ──────────────────────────────────────────── */}
            {property.description && (
              <Reveal className="mt-14">
                <section aria-labelledby="about">
                  <h2 id="about" className="eyebrow mb-5 border-b border-rule pb-3">
                    About this property
                  </h2>
                  <div className="max-w-prose space-y-4 text-[1.0625rem] leading-relaxed text-ink-soft">
                    {property.description.split(/\n\n+/).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {/* ── Highlights ───────────────────────────────────────────── */}
            {property.highlights.length > 0 && (
              <Reveal className="mt-14">
                <section aria-labelledby="highlights">
                  <h2 id="highlights" className="eyebrow mb-5 border-b border-rule pb-3">
                    Why we shortlisted it
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {property.highlights.map((h) => (
                      <li key={h} className="flex gap-3 text-[0.9375rem] text-ink-soft">
                        <Check className="mt-1 size-4 shrink-0 text-brass" strokeWidth={2.2} aria-hidden />
                        {h}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            {/* ── Amenities ────────────────────────────────────────────── */}
            {property.amenities.length > 0 && (
              <Reveal className="mt-14">
                <section aria-labelledby="amenities">
                  <h2 id="amenities" className="eyebrow mb-5 border-b border-rule pb-3">
                    Amenities · {property.amenities.length}
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {property.amenities.map((a) => (
                      <li
                        key={a}
                        className="rounded-[2px] border border-rule bg-paper px-3.5 py-2 text-caption text-ink-soft"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            {/* ── Floor plans ──────────────────────────────────────────── */}
            {property.floor_plans && property.floor_plans.length > 0 && (
              <Reveal className="mt-14">
                <section aria-labelledby="plans">
                  <h2 id="plans" className="eyebrow mb-5 border-b border-rule pb-3">
                    Floor plans
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {property.floor_plans.map((plan) => (
                      <figure
                        key={plan.id}
                        className="overflow-hidden rounded-[2px] border border-rule bg-paper"
                      >
                        {plan.image_url && (
                          <div className="relative aspect-[4/3] bg-sand">
                            <Image
                              src={plan.image_url}
                              alt={`${plan.label} floor plan`}
                              fill
                              sizes="(max-width: 640px) 100vw, 40vw"
                              className="object-contain p-3"
                            />
                          </div>
                        )}
                        <figcaption className="flex items-baseline justify-between gap-3 border-t border-rule px-4 py-3">
                          <span className="text-[1.0625rem] font-semibold text-ink">
                            {plan.label}
                          </span>
                          <span className="font-mono text-[0.625rem] text-ink-muted" data-numeric>
                            {plan.carpet_sqft ? formatArea(plan.carpet_sqft) : ""}
                          </span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {/* ── Location ─────────────────────────────────────────────── */}
            <Reveal className="mt-14">
              <section aria-labelledby="location">
                <h2 id="location" className="eyebrow mb-5 border-b border-rule pb-3">
                  Location &amp; neighbourhood
                </h2>

                {property.lat && property.lng ? (
                  <StaticMap
                    property={{
                      id: property.id,
                      slug: property.slug,
                      title: property.title,
                      lat: property.lat,
                      lng: property.lng,
                      price: property.price,
                      price_on_request: property.price_on_request,
                      locality_slug: property.locality_slug,
                      bhk: property.bhk,
                      carpet_sqft: property.carpet_sqft,
                    }}
                  />
                ) : (
                  <div className="relative overflow-hidden rounded-[2px] border border-rule bg-sand p-12 text-center">
                    <div className="jaali absolute inset-0" aria-hidden />
                    <p className="relative font-semibold text-micro tracking-[0.14em] text-ink-muted uppercase">
                      Exact location shared on enquiry
                    </p>
                  </div>
                )}

                {nearby.length > 0 && (
                  <dl className="mt-6 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
                    {nearby.map((place) => (
                      <div key={place.name} className="flex items-baseline justify-between gap-3 bg-paper px-4 py-3.5">
                        <div className="min-w-0">
                          <dt className="truncate text-[0.9375rem] text-ink">{place.name}</dt>
                          <p className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-faint uppercase">
                            {place.type}
                          </p>
                        </div>
                        <dd className="shrink-0 font-mono text-caption text-brass tabular-nums" data-numeric>
                          {place.distance_km} km
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {locality && (
                  <div className="mt-7 rounded-[2px] border border-rule bg-sand p-6">
                    <p className="eyebrow mb-3">On {locality.name}</p>
                    <p className="max-w-prose text-[0.9375rem] leading-relaxed text-ink-soft">
                      {locality.blurb}
                    </p>
                    <Link
                      href={`/${locality.city}/${locality.slug}`}
                      className="group mt-5 inline-flex items-center gap-2 font-semibold text-micro tracking-[0.14em] text-brass uppercase"
                    >
                      <span className="link-draw">
                        Everything we have in {locality.name}
                      </span>
                      <ArrowUpRight
                        className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </Link>
                  </div>
                )}
              </section>
            </Reveal>

            {/* ── Site visit ───────────────────────────────────────────── */}
            <Reveal className="mt-14">
              <SiteVisitForm propertyId={property.id} propertyTitle={property.title} />
            </Reveal>

            {/* ── Provenance ───────────────────────────────────────────── */}
            <div className="mt-14 border-t border-rule pt-6">
              <dl className="flex flex-wrap gap-x-8 gap-y-2 font-semibold text-micro tracking-[0.1em] text-ink-faint uppercase">
                <div className="flex gap-2">
                  <dt>Listed</dt>
                  <dd className="text-ink-muted">
                    {formatDate(property.published_at ?? property.created_at)}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt>Updated</dt>
                  <dd className="text-ink-muted">{formatDate(property.updated_at)}</dd>
                </div>
                {property.builder && (
                  <div className="flex gap-2">
                    <dt>Developer</dt>
                    <dd className="text-ink-muted">{property.builder.name}</dd>
                  </div>
                )}
                {property.project && (
                  <div className="flex gap-2">
                    <dt>Project</dt>
                    <dd>
                      <Link
                        href={`/projects/${property.project.slug}`}
                        className="link-draw text-ink-muted"
                      >
                        {property.project.name}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* ══ Sticky sidebar ═══════════════════════════════════════════ */}
          <aside id="enquire" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-5">
              <EnquiryForm
                propertyId={property.id}
                propertyTitle={property.title}
                compact
              />

              {property.price && !property.price_on_request && (
                <EmiWidget price={property.price} />
              )}
            </div>
          </aside>
        </div>

        {/* ── Similar ──────────────────────────────────────────────────── */}
        {similar.length > 0 && (
          <section className="border-t border-rule bg-sand py-20" aria-labelledby="similar">
            <div className="shell">
              <h2 id="similar" className="eyebrow mb-8 border-b border-rule-strong/50 pb-4">
                Comparable homes in {localityName} and nearby
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {similar.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

/* ── Atoms ──────────────────────────────────────────────────────────────── */

function Spec({
  icon: Icon,
  label,
  value,
  note,
  className,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  note?: string;
  className?: string;
}) {
  return (
    <div className="bg-paper px-4 py-4">
      <dt className="flex items-center gap-2 font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-faint uppercase">
        <Icon className="size-3" strokeWidth={1.8} />
        {label}
      </dt>
      <dd className={`mt-1.5 font-display text-[1.125rem] text-ink ${className ?? ""}`}>
        {value}
        {note && (
          <span className="ml-1.5 font-semibold text-[0.6875rem] tracking-[0.1em] text-brass uppercase">
            {note}
          </span>
        )}
      </dd>
    </div>
  );
}

/**
 * Carpet → built-up → super built-up, spelled out.
 *
 * Shown when a listing quotes carpet only. The point is educational and
 * defensive at once: it tells the buyer what the same flat would be
 * advertised as elsewhere, so our smaller-sounding number reads as honesty
 * rather than a worse deal.
 */
function AreaExplainer({ carpet }: { carpet: number }) {
  const a = areaConversions(carpet);

  return (
    <div className="mt-5 rounded-[2px] border border-brass/25 bg-brass-pale/40 p-5">
      <p className="font-semibold text-[0.6875rem] tracking-[0.14em] text-brass-deep uppercase">
        What the same flat would be advertised as
      </p>
      <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
        <div>
          <dt className="text-caption text-ink-muted">Carpet (RERA)</dt>
          <dd className="text-[1.0625rem] font-semibold text-ink" data-numeric>
            {formatArea(a.carpet)}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-ink-muted">Built-up ≈</dt>
          <dd className="text-[1.0625rem] font-semibold text-ink-muted" data-numeric>
            {formatArea(a.builtup)}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-ink-muted">Super built-up ≈</dt>
          <dd className="text-[1.0625rem] font-semibold text-ink-muted" data-numeric>
            {formatArea(a.superBuiltup)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-muted">
        We quote carpet area, which is the only figure RERA recognises and the
        only space you can actually use. Built-up and super built-up figures
        above are indicative conversions at typical Ahmedabad loading.
      </p>
    </div>
  );
}
