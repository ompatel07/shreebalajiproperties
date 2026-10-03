import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { PropertyForm } from "@/components/admin/PropertyForm";
import { Badge } from "@/components/ui/Badge";
import { formatRelative } from "@/lib/format";
import { demoBuilders, demoProjects, demoPropertyDetail, isDemoMode } from "@/lib/demo-data";
import { demoAdminProperties } from "@/lib/demo-studio";
import { createClient } from "@/lib/supabase/server";
import type { Builder, Project, Property } from "@/types/db";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;

  if (isDemoMode()) {
    const card = demoAdminProperties().find((p) => p.id === id);
    if (!card) notFound();

    const row = (demoPropertyDetail(card.slug) ?? {
      ...card,
      description: null,
      highlights: [],
      amenities: [],
      nearby: [],
    }) as unknown as Property;

    return (
      <EditView
        row={{ ...row, id: card.id, status: card.status, title: card.title }}
        builders={demoBuilders.map((b) => ({ id: b.id, name: b.name }))}
        projects={demoProjects.map((p) => ({ id: p.id, name: p.name }))}
      />
    );
  }

  const supabase = await createClient();

  const [{ data: property }, { data: builders }, { data: projects }] = await Promise.all([
    // No status filter: staff must be able to open drafts and archived rows.
    supabase.from("properties").select("*").eq("id", id).maybeSingle(),
    supabase.from("builders").select("id, name").order("name"),
    supabase.from("projects").select("id, name").order("name"),
  ]);

  if (!property) notFound();

  return (
    <EditView
      row={property as Property}
      builders={(builders ?? []) as Pick<Builder, "id" | "name">[]}
      projects={(projects ?? []) as Pick<Project, "id" | "name">[]}
    />
  );
}

function EditView({
  row,
  builders,
  projects,
}: {
  row: Property;
  builders: Pick<Builder, "id" | "name">[];
  projects: Pick<Project, "id" | "name">[];
}) {
  return (
    <div className="p-5 lg:p-10">
      <Link
        href="/studio/listings"
        className="inline-flex items-center gap-1.5 font-mono text-[0.5625rem] tracking-[0.12em] text-ink-muted uppercase hover:text-brass"
      >
        <ChevronLeft className="size-3" strokeWidth={2.2} aria-hidden />
        Listings
      </Link>

      <header className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="eyebrow">Editing</p>
            <Badge tone={row.status === "published" ? "verdant" : "neutral"}>
              {row.status.replace("_", " ")}
            </Badge>
          </div>

          <h1 className="mt-2 font-display text-h3 text-ink">{row.title}</h1>

          <p className="mt-2 font-mono text-[0.5625rem] tracking-[0.1em] text-ink-muted uppercase">
            {row.view_count} views · {row.enquiry_count} enquiries · updated{" "}
            {formatRelative(row.updated_at)}
          </p>
        </div>

        {row.status === "published" && (
          <Link
            href={`/property/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-[2px] border border-rule-strong px-4 py-2.5 font-mono text-[0.5625rem] tracking-[0.12em] text-ink uppercase hover:border-ink hover:bg-ink hover:text-bone"
          >
            View live
            <ExternalLink className="size-3" strokeWidth={1.9} aria-hidden />
          </Link>
        )}
      </header>

      <div className="mt-8">
        <PropertyForm property={row} builders={builders} projects={projects} />
      </div>
    </div>
  );
}
