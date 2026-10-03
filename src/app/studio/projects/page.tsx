import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Handshake } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { localityBySlug } from "@/config/site";
import { formatPossession, formatPriceRange, formatRelative } from "@/lib/format";
import { blurPlaceholder, heroImageFor } from "@/lib/imagery";
import { demoProjectDetail, demoProjects, isDemoMode } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/types/db";

/**
 * Projects.
 *
 * Read-only in this build, deliberately. A project record carries a
 * masterplan, elevation and progress galleries, floor plans, a spec sheet and
 * a brochure — an editor worth using for that is a bigger piece of work than
 * a listing form, and the client will add perhaps a dozen projects a year
 * versus hundreds of listings.
 *
 * So projects are created in the Supabase table editor for now, and this page
 * gives the client visibility plus a direct link to the live page. The
 * `is_partnered` flag is the commercially important one — it is what drives
 * the "skin in the game" section on the homepage.
 */
export default async function ProjectsPage() {
  if (isDemoMode()) {
    const rows = demoProjects
      .map((p) => demoProjectDetail(p.slug))
      .filter(Boolean) as unknown as Project[];
    return <ProjectsView projects={rows.map((p) => ({ ...p, is_partnered: true }))} error={null} />;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("is_partnered", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(100);

  return <ProjectsView projects={(data ?? []) as Project[]} error={error ? "load" : null} />;
}

function ProjectsView({ projects, error }: { projects: Project[]; error: string | null }) {
  const partnered = projects.filter((p) => p.is_partnered).length;

  return (
    <div className="p-5 lg:p-10">
      <header className="border-b border-rule pb-6">
        <p className="eyebrow">Developments</p>
        <h1 className="mt-2 font-display text-h3 text-ink">
          Projects
          <span className="ml-3 font-semibold text-micro tracking-[0.12em] text-ink-muted uppercase">
            {projects.length} total · {partnered} full mandate
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-caption leading-relaxed text-ink-muted">
          Projects are created in the Supabase table editor — the record carries
          galleries, floor plans and a brochure, and you will add a handful a
          year rather than a handful a week. Ticking{" "}
          <code className="font-mono">is_partnered</code> marks a full
          marketing mandate, which gives the project top billing on the public
          projects page.
        </p>
      </header>

      {error ? (
        <div className="mt-8 rounded-[2px] border border-alert/30 bg-alert-pale p-6">
          <p className="font-semibold text-micro tracking-[0.12em] text-alert uppercase">
            Could not load projects
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="relative mt-8 overflow-hidden rounded-[2px] border border-rule bg-paper px-6 py-20 text-center">
          <div className="jaali absolute inset-0" aria-hidden />
          <div className="relative">
            <p className="eyebrow">Nothing yet</p>
            <h2 className="mt-4 font-display text-h4">No projects</h2>
            <p className="mx-auto mt-3 max-w-md text-caption leading-relaxed text-ink-muted">
              Add rows to the <code className="font-mono">projects</code> table in
              Supabase. The homepage section hides itself while this is empty, and{" "}
              <code className="font-mono">supabase/seed.sql</code> has worked
              examples to copy.
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li
              key={project.id}
              className="overflow-hidden rounded-[2px] border border-rule bg-paper"
            >
              <div className="relative aspect-[16/10] bg-sand">
                <Image
                  src={heroImageFor(project, 600)}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  placeholder="blur"
                  blurDataURL={blurPlaceholder()}
                  className="object-cover"
                />

                <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                  <Badge tone={project.status === "published" ? "verdant" : "neutral"}>
                    {project.status.replace("_", " ")}
                  </Badge>

                  {project.is_partnered && (
                    <Badge
                      tone="brass"
                      icon={<Handshake className="size-3" strokeWidth={2} aria-hidden />}
                    >
                      Full mandate
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-5">
                <p className="font-semibold text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase">
                  {localityBySlug.get(project.locality_slug)?.name ?? project.locality_slug} ·{" "}
                  {project.category}
                </p>

                <h2 className="mt-1.5 font-display text-h4 text-ink">{project.name}</h2>

                {project.tagline && (
                  <p className="mt-2 line-clamp-2 text-caption leading-relaxed text-ink-muted">
                    {project.tagline}
                  </p>
                )}

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-rule pt-4">
                  <div>
                    <dt className="font-semibold text-[0.6875rem] tracking-[0.12em] text-ink-faint uppercase">
                      Price
                    </dt>
                    <dd className="mt-0.5 text-[0.9375rem] font-semibold text-ink" data-numeric>
                      {formatPriceRange(project.price_min, project.price_max)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[0.6875rem] tracking-[0.12em] text-ink-faint uppercase">
                      Possession
                    </dt>
                    <dd className="mt-0.5 text-[0.9375rem] font-semibold text-ink">
                      {formatPossession(project.possession, project.possession_date)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="font-semibold text-[0.6875rem] tracking-[0.1em] text-ink-faint uppercase">
                    {project.rera_id ? `RERA ${project.rera_id.slice(-8)}` : "No RERA on file"} ·{" "}
                    {formatRelative(project.updated_at)}
                  </p>

                  {project.status === "published" && (
                    <Link
                      href={`/projects/${project.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${project.name} on the live site`}
                      className="grid size-8 shrink-0 place-items-center rounded-[2px] text-ink-muted hover:bg-sand hover:text-ink"
                    >
                      <ExternalLink className="size-3.5" strokeWidth={1.8} aria-hidden />
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
