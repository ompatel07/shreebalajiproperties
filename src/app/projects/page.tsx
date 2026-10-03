import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Handshake } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { localityBySlug, site } from "@/config/site";
import { formatPossession, formatPriceRange } from "@/lib/format";
import { blurPlaceholder, heroImageFor } from "@/lib/imagery";
import { demoProjectDetail, demoProjects, isDemoMode } from "@/lib/demo-data";
import { createPublicClient } from "@/lib/supabase/server";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import type { Project } from "@/types/db";

export const revalidate = 900;

export const metadata: Metadata = pageMeta({
  title: `New Projects in Ahmedabad & Gandhinagar | ${site.name}`,
  description:
    "Residential and commercial developments we market across Ahmedabad and Gandhinagar. Current enquiries, floor plans, pricing and site visits.",
  path: "/projects",
});

/**
 * Projects index.
 *
 * Projects under a full marketing mandate lead, separated from inventory we
 * list more loosely. A builder browsing this page should be able to tell at
 * a glance which engagements are end-to-end.
 */
export default async function ProjectsPage() {
  // Demo fallback. This page queries Supabase directly rather than going
  // through `queries.ts`, so it needs its own guard — the omission is what
  // failed the first Vercel build.
  if (isDemoMode()) {
    const rows = demoProjects
      .map((p) => demoProjectDetail(p.slug))
      .filter(Boolean) as unknown as Project[];

    return <ProjectsPageView projects={rows.map((p) => ({ ...p, is_partnered: true }))} />;
  }

  const supabase = createPublicClient();

  const { data } = await supabase
    .from("projects")
    .select("*")
    .in("status", ["published", "under_offer"])
    .order("is_partnered", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true })
    .limit(60);

  return <ProjectsPageView projects={(data ?? []) as Project[]} />;
}

/** Shared presentation, fed from Postgres or from fixtures. */
function ProjectsPageView({ projects }: { projects: Project[] }) {
  const partnered = projects.filter((p) => p.is_partnered);
  const others = projects.filter((p) => !p.is_partnered);

  const trail = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />

      <div className="pt-16 lg:pt-[4.75rem]">
        <header className="border-b border-rule bg-sand">
          <div className="shell py-10 lg:py-16">
            <Breadcrumbs trail={trail} />

            <h1 className="display-tight mt-6 max-w-4xl font-display text-h2 text-ink">
              Developments we are{" "}
              <em className="display-wonk text-brass">actively marketing.</em>
            </h1>

            <p className="mt-6 max-w-2xl text-lead text-ink-muted">
              Each of these is a live engagement: positioning, promotion,
              enquiry management, site-visit coordination and finance support,
              run by our in-house team on the builder&rsquo;s behalf.
            </p>
          </div>
        </header>

        {/* ══ Full mandate ═══════════════════════════════════════════════ */}
        {partnered.length > 0 && (
          <section className="py-16 lg:py-20" aria-labelledby="partnered">
            <div className="shell">
              <Reveal>
                <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4 border-b border-rule pb-4">
                  <h2 id="partnered" className="eyebrow flex items-center gap-2.5">
                    <Handshake className="size-3.5 text-brass" strokeWidth={2} aria-hidden />
                    Full marketing mandate
                  </h2>
                  <span className="font-mono text-[0.5625rem] tracking-[0.1em] text-ink-faint uppercase">
                    {partnered.length} {partnered.length === 1 ? "project" : "projects"}
                  </span>
                </div>
              </Reveal>

              <RevealGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" stagger={0.08}>
                {partnered.map((project) => (
                  <ProjectCard key={project.id} project={project} highlight />
                ))}
              </RevealGroup>
            </div>
          </section>
        )}

        {/* ══ Everything else ═══════════════════════════════════════════ */}
        {others.length > 0 && (
          <section
            className={`py-16 lg:py-20 ${partnered.length > 0 ? "border-t border-rule bg-sand" : ""}`}
            aria-labelledby="represented"
          >
            <div className="shell">
              <Reveal>
                <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4 border-b border-rule-strong/50 pb-4">
                  <h2 id="represented" className="eyebrow">
                    Also marketed by us
                  </h2>
                  <span className="font-mono text-[0.5625rem] tracking-[0.1em] text-ink-faint uppercase">
                    {others.length} {others.length === 1 ? "project" : "projects"}
                  </span>
                </div>
              </Reveal>

              <RevealGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" stagger={0.06}>
                {others.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </RevealGroup>
            </div>
          </section>
        )}

        {projects.length === 0 && (
          <div className="shell py-20">
            <div className="relative overflow-hidden rounded-[2px] border border-rule bg-paper px-6 py-20 text-center">
              <div className="jaali absolute inset-0" aria-hidden />
              <div className="relative">
                <p className="eyebrow">Between launches</p>
                <h2 className="mx-auto mt-4 max-w-lg font-display text-h3">
                  Nothing listed here this week.
                </h2>
                <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-muted">
                  New launches move quickly, and a fair amount of what we
                  transact never reaches a public page. Tell us what you are
                  after and we will call you when something fits.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <ButtonLink href="/contact" size="lg">
                    Register your requirement
                  </ButtonLink>
                  <ButtonLink href="/properties" variant="outline" size="lg">
                    Browse listings
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ProjectCard({
  project,
  highlight = false,
}: {
  project: Project;
  highlight?: boolean;
}) {
  const locality = localityBySlug.get(project.locality_slug);

  return (
    <RevealItem as="article">
      <Link
        href={`/projects/${project.slug}`}
        className={`group flex h-full flex-col overflow-hidden rounded-[2px] border bg-paper transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-raise)] ${
          highlight ? "border-brass/35" : "border-rule hover:border-rule-strong"
        }`}
      >
        <div className="relative aspect-[16/11] overflow-hidden bg-sand">
          <Image
            src={heroImageFor(project, 800)}
            alt={`${project.name} — ${locality?.name ?? project.locality_slug}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL={blurPlaceholder()}
            className="photo-warm object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            {project.is_partnered ? (
              <Badge tone="brass" icon={<Handshake className="size-3" strokeWidth={2} aria-hidden />}>
                Full mandate
              </Badge>
            ) : (
              <Badge tone="outline">Channel partner</Badge>
            )}

            {project.status === "under_offer" && <Badge tone="alert">Selling fast</Badge>}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <p className="font-mono text-micro tracking-[0.12em] text-ink-muted uppercase">
            {locality?.name ?? project.locality_slug} ·{" "}
            {project.city === "ahmedabad" ? "Ahmedabad" : "Gandhinagar"}
          </p>

          <h3 className="mt-2 font-display text-h4 text-ink">
            <span className="link-draw">{project.name}</span>
          </h3>

          {project.tagline && (
            <p className="mt-3 line-clamp-2 text-caption leading-relaxed text-ink-muted">
              {project.tagline}
            </p>
          )}

          <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-rule pt-5">
            <div>
              <dt className="font-mono text-[0.5rem] tracking-[0.14em] text-ink-faint uppercase">
                Price
              </dt>
              <dd className="mt-1 font-display text-[1.0625rem] text-ink" data-numeric>
                {formatPriceRange(project.price_min, project.price_max)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.5rem] tracking-[0.14em] text-ink-faint uppercase">
                Possession
              </dt>
              <dd className="mt-1 font-display text-[1.0625rem] text-ink">
                {formatPossession(project.possession, project.possession_date)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="font-mono text-[0.5rem] tracking-[0.1em] text-ink-faint uppercase">
              {project.rera_id ? `RERA ${project.rera_id.slice(-8)}` : "Resale · RERA exempt"}
            </span>
            <span className="grid size-8 place-items-center rounded-full border border-rule-strong text-ink-muted transition-all duration-400 group-hover:border-brass group-hover:bg-brass group-hover:text-paper">
              <ArrowUpRight className="size-3.5" strokeWidth={1.8} aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </RevealItem>
  );
}
