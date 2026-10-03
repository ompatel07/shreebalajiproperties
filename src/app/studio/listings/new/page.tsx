import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { PropertyForm } from "@/components/admin/PropertyForm";
import { demoBuilders, demoProjects, isDemoMode } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import type { Builder, Project } from "@/types/db";

export default async function NewListingPage() {
  const demo = isDemoMode();

  // Fetched for the relation dropdowns. Staff session, so RLS allows drafts.
  const [builders, projects] = demo
    ? [
        demoBuilders.map((b) => ({ id: b.id, name: b.name })),
        demoProjects.map((p) => ({ id: p.id, name: p.name })),
      ]
    : await (async () => {
        const supabase = await createClient();
        const [{ data: b }, { data: pr }] = await Promise.all([
          supabase.from("builders").select("id, name").order("name"),
          supabase.from("projects").select("id, name").order("name"),
        ]);
        return [b, pr] as const;
      })();

  return (
    <div className="p-5 lg:p-10">
      <Link
        href="/studio/listings"
        className="inline-flex items-center gap-1.5 font-semibold text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase hover:text-brass"
      >
        <ChevronLeft className="size-3" strokeWidth={2.2} aria-hidden />
        Listings
      </Link>

      <header className="mt-5 border-b border-rule pb-6">
        <p className="eyebrow">New</p>
        <h1 className="mt-2 font-display text-h3 text-ink">Create a listing</h1>
        <p className="mt-3 max-w-2xl text-caption leading-relaxed text-ink-muted">
          Saves as a draft unless you set the status to Published. Carpet area
          and a price (or “price on request”) are required before a residential
          listing can go live — the form will tell you if either is missing.
        </p>
      </header>

      <div className="mt-8">
        <PropertyForm
          builders={(builders ?? []) as Pick<Builder, "id" | "name">[]}
          projects={(projects ?? []) as Pick<Project, "id" | "name">[]}
        />
      </div>
    </div>
  );
}
