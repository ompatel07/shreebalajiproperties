import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Check, Handshake, Layers, MapPin, Ruler } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { EnquiryForm } from "@/components/property/EnquiryForm";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { SiteVisitForm } from "@/components/property/SiteVisitForm";
import { StaticMap } from "@/components/property/StaticMap";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { localityBySlug, site } from "@/config/site";
import { formatArea, formatPossession, formatPriceRange } from "@/lib/format";
import { galleryFor, heroImageFor } from "@/lib/imagery";
import { getProjectBySlug, getProjectUnits } from "@/lib/queries";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";

export const revalidate = 600;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return pageMeta({
      title: `Project not found | ${site.name}`,
      description: "This project is no longer listed.",
      path: `/projects/${slug}`,
      index: false,
    });
  }

  const locality = localityBySlug.get(project.locality_slug);
  const where = `${locality?.name ?? project.locality_slug}, ${
    project.city === "ahmedabad" ? "Ahmedabad" : "Gandhinagar"
  }`;

  return pageMeta({
    title: `${project.name}, ${where} — Price, Floor Plans & Possession | ${site.name}`,
    description: [
      `${project.name} in ${where}.`,
      project.price_min ? `${formatPriceRange(project.price_min, project.price_max)}.` : null,
      formatPossession(project.possession, project.possession_date) + ".",
      project.rera_id ? `RERA ${project.rera_id}.` : null,
      project.tagline ?? "Floor plans, amenities and an honest view of the developer's delivery record.",
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 300),
    path: `/projects/${project.slug}`,
    image: heroImageFor(project, 1200),
  });
}

/**
 * Project detail.
 *
 * The co-investment disclosure is the first thing on the page when it
 * applies, not a footnote — a buyer is entitled to know whose side the
 * recommendation is coming from before they read the sales copy.
 */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const units = await getProjectUnits(project.id);
  const locality = localityBySlug.get(project.locality_slug);
  const cityName = project.city === "ahmedabad" ? "Ahmedabad" : "Gandhinagar";

  // PostgREST returns embedded to-one relations as arrays.
  const builder = Array.isArray(project.builder) ? project.builder[0] : project.builder;

  const images =
    project.images && project.images.length > 0
      ? project.images.map((i) => ({ url: i.url, alt: i.alt, caption: i.caption }))
      : galleryFor(project.slug, project.category, 6).map((url, i) => ({
          url,
          alt: `${project.name} — representative image ${i + 1}`,
          caption: i === 0 ? "Artist impression — awaiting site photography" : null,
        }));

  const trail = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: project.name, path: `/projects/${project.slug}` },
  ];

  const specs = project.specifications ?? {};

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />

      <div className="pt-16 lg:pt-[4.75rem]">
        <div className="shell py-5">
          <Breadcrumbs trail={trail} />
        </div>

        <div className="shell">
          <PropertyGallery images={images} title={project.name} />
        </div>

        <div className="shell grid gap-10 py-12 lg:grid-cols-[1fr_22rem] lg:gap-14 xl:grid-cols-[1fr_24rem]">
          <div className="min-w-0">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                {project.is_partnered && (
                  <Badge tone="brass" icon={<Handshake className="size-3" strokeWidth={2} aria-hidden />}>
                    We co-invest here
                  </Badge>
                )}
                {project.rera_id ? (
                  <Badge tone="verdant">RERA {project.rera_id.slice(-10)}</Badge>
                ) : (
                  <Badge tone="neutral">RERA pending</Badge>
                )}
                <Badge tone="outline">
                  {formatPossession(project.possession, project.possession_date)}
                </Badge>
              </div>

              <h1 className="display-tight mt-5 font-display text-h2 text-ink">
                {project.name}
              </h1>

              {project.tagline && (
                <p className="mt-4 max-w-2xl text-lead text-ink-muted">{project.tagline}</p>
              )}

              <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-muted">
                <MapPin className="size-4 shrink-0 text-ink-faint" strokeWidth={1.6} aria-hidden />
                {project.address ? `${project.address}, ` : ""}
                <Link
                  href={`/${project.city}/${project.locality_slug}`}
                  className="link-draw text-ink"
                >
                  {locality?.name ?? project.locality_slug}
                </Link>
                , {cityName}
                {builder && (
                  <>
                    {" · by "}
                    <span className="text-ink">{builder.name}</span>
                  </>
                )}
              </p>

              <div className="mt-8 border-y border-rule py-7">
                <p className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-muted uppercase">
                  Price range
                </p>
                <p className="mt-2 font-display text-h2 leading-none text-ink" data-numeric>
                  {formatPriceRange(project.price_min, project.price_max)}
                </p>
              </div>
            </header>

            {/* ── Co-investment disclosure ─────────────────────────────── */}
            {project.is_partnered && (
              <Reveal className="mt-10">
                <aside className="rounded-[2px] border border-brass/30 bg-brass-pale/40 p-6 lg:p-7">
                  <p className="flex items-center gap-2.5 font-mono text-micro tracking-[0.14em] text-brass-deep uppercase">
                    <Handshake className="size-3.5" strokeWidth={2} aria-hidden />
                    Disclosure
                  </p>
                  <h2 className="mt-3 font-display text-h4 leading-snug text-ink">
                    {site.name} holds an investment interest in this project.
                  </h2>
                  <p className="mt-3 max-w-prose leading-relaxed text-ink-soft">
                    We are not only the channel partner here — our own capital is
                    committed alongside the developer&rsquo;s. We tell you that
                    up front because it cuts both ways: it means a delayed
                    possession costs us too, and it means you should weigh our
                    enthusiasm accordingly. Ask us directly what we paid and
                    when we expect to exit — we will tell you.
                  </p>
                </aside>
              </Reveal>
            )}

            {/* ── At a glance ──────────────────────────────────────────── */}
            <Reveal className="mt-12">
              <section aria-labelledby="facts">
                <h2 id="facts" className="eyebrow mb-5 border-b border-rule pb-3">
                  At a glance
                </h2>

                <dl className="grid grid-cols-2 gap-px bg-rule sm:grid-cols-4">
                  {project.total_units ? (
                    <Fact icon={Building2} label="Units" value={String(project.total_units)} />
                  ) : null}
                  {project.total_towers ? (
                    <Fact icon={Layers} label="Towers" value={String(project.total_towers)} />
                  ) : null}
                  {project.floors ? (
                    <Fact icon={Layers} label="Floors" value={String(project.floors)} />
                  ) : null}
                  {project.land_area_acres ? (
                    <Fact
                      icon={Ruler}
                      label="Land area"
                      value={`${project.land_area_acres} acres`}
                    />
                  ) : null}
                </dl>
              </section>
            </Reveal>

            {/* ── Description ──────────────────────────────────────────── */}
            {project.description && (
              <Reveal className="mt-12">
                <section aria-labelledby="about">
                  <h2 id="about" className="eyebrow mb-5 border-b border-rule pb-3">
                    About the development
                  </h2>
                  <div className="max-w-prose space-y-4 text-[1.0625rem] leading-relaxed text-ink-soft">
                    {project.description.split(/\n\n+/).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {/* ── Highlights ───────────────────────────────────────────── */}
            {project.highlights.length > 0 && (
              <Reveal className="mt-12">
                <section aria-labelledby="highlights">
                  <h2 id="highlights" className="eyebrow mb-5 border-b border-rule pb-3">
                    What stands out
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex gap-3 text-[0.9375rem] text-ink-soft">
                        <Check className="mt-1 size-4 shrink-0 text-brass" strokeWidth={2.2} aria-hidden />
                        {h}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            {/* ── Floor plans ──────────────────────────────────────────── */}
            {project.floor_plans && project.floor_plans.length > 0 && (
              <Reveal className="mt-12">
                <section aria-labelledby="plans">
                  <h2 id="plans" className="eyebrow mb-5 border-b border-rule pb-3">
                    Configurations
                  </h2>

                  <div className="no-bar overflow-x-auto">
                    <table className="w-full min-w-[32rem] border-collapse">
                      <thead>
                        <tr className="border-b border-rule-strong text-left">
                          {["Type", "Carpet", "Super built-up", "From"].map((h, i) => (
                            <th
                              key={h}
                              scope="col"
                              className={`pb-3 font-mono text-[0.5625rem] tracking-[0.12em] font-normal text-ink-muted uppercase ${
                                i > 0 ? "text-right" : ""
                              }`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rule">
                        {project.floor_plans
                          .slice()
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((plan) => (
                            <tr key={plan.id}>
                              <th
                                scope="row"
                                className="py-3.5 text-left font-display text-[1.0625rem] font-normal text-ink"
                              >
                                {plan.label}
                              </th>
                              <td className="py-3.5 text-right text-[0.9375rem] text-ink-soft" data-numeric>
                                {plan.carpet_sqft ? formatArea(plan.carpet_sqft) : "—"}
                              </td>
                              <td className="py-3.5 text-right text-[0.9375rem] text-ink-muted" data-numeric>
                                {plan.super_sqft ? formatArea(plan.super_sqft) : "—"}
                              </td>
                              <td
                                className="py-3.5 text-right font-display text-[1.0625rem] text-ink"
                                data-numeric
                              >
                                {plan.price ? formatPriceRange(plan.price, null).replace(" onwards", "") : "On request"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </Reveal>
            )}

            {/* ── Amenities ────────────────────────────────────────────── */}
            {project.amenities.length > 0 && (
              <Reveal className="mt-12">
                <section aria-labelledby="amenities">
                  <h2 id="amenities" className="eyebrow mb-5 border-b border-rule pb-3">
                    Amenities · {project.amenities.length}
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {project.amenities.map((a) => (
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

            {/* ── Specifications ───────────────────────────────────────── */}
            {Object.keys(specs).length > 0 && (
              <Reveal className="mt-12">
                <section aria-labelledby="specs">
                  <h2 id="specs" className="eyebrow mb-5 border-b border-rule pb-3">
                    Specification
                  </h2>
                  <dl className="grid gap-px bg-rule sm:grid-cols-2">
                    {Object.entries(specs).map(([key, value]) => (
                      <div key={key} className="bg-paper px-4 py-3.5">
                        <dt className="font-mono text-[0.5rem] tracking-[0.14em] text-ink-faint uppercase">
                          {key.replace(/_/g, " ")}
                        </dt>
                        <dd className="mt-1 text-[0.9375rem] text-ink-soft">
                          {Array.isArray(value) ? value.join(", ") : String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </Reveal>
            )}

            {/* ── Location ─────────────────────────────────────────────── */}
            {project.lat && project.lng && (
              <Reveal className="mt-12">
                <section aria-labelledby="location">
                  <h2 id="location" className="eyebrow mb-5 border-b border-rule pb-3">
                    Location
                  </h2>
                  <StaticMap
                    property={{
                      id: project.id,
                      slug: project.slug,
                      title: project.name,
                      lat: project.lat,
                      lng: project.lng,
                      price: project.price_min,
                      price_on_request: false,
                      locality_slug: project.locality_slug,
                      bhk: null,
                      carpet_sqft: null,
                    }}
                  />
                </section>
              </Reveal>
            )}

            <Reveal className="mt-12">
              <SiteVisitForm projectId={project.id} propertyTitle={project.name} />
            </Reveal>
          </div>

          {/* ══ Sidebar ═══════════════════════════════════════════════ */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <EnquiryForm projectId={project.id} propertyTitle={project.name} compact />
          </aside>
        </div>

        {/* ── Available units ──────────────────────────────────────────── */}
        {units.length > 0 && (
          <section className="border-t border-rule bg-sand py-20" aria-labelledby="units">
            <div className="shell">
              <h2 id="units" className="eyebrow mb-8 border-b border-rule-strong/50 pb-4">
                Available in {project.name} · {units.length}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {units.map((unit) => (
                  <PropertyCard key={unit.id} property={unit} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-paper px-4 py-4">
      <dt className="flex items-center gap-2 font-mono text-[0.5625rem] tracking-[0.14em] text-ink-faint uppercase">
        <Icon className="size-3" strokeWidth={1.8} />
        {label}
      </dt>
      <dd className="mt-1.5 font-display text-[1.125rem] text-ink" data-numeric>
        {value}
      </dd>
    </div>
  );
}
