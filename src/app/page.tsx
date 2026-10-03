import type { Metadata } from "next";

import { BuilderMarquee } from "@/components/home/BuilderMarquee";
import { CtaBand } from "@/components/home/CtaBand";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { Hero } from "@/components/home/Hero";
import { LocalityShowcase } from "@/components/home/LocalityShowcase";
import { PartneredProjects } from "@/components/home/PartneredProjects";
import { Process } from "@/components/home/Process";
import { Testimonials } from "@/components/home/Testimonials";
import { ToolsStrip } from "@/components/home/ToolsStrip";
import { TrustRail } from "@/components/home/TrustRail";
import { site } from "@/config/site";
import {
  getBudgetBandCounts,
  getBuilders,
  getFeaturedListings,
  getLocalityCounts,
  getPartneredProjects,
  getTestimonials,
} from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

/**
 * ISR: regenerate at most once every 10 minutes.
 *
 * The homepage reads six tables but almost never changes between publishes,
 * so serving it from the edge cache is both faster and cheaper than querying
 * per request — which matters on the Supabase free tier, where egress is the
 * binding constraint rather than compute. `revalidatePath("/")` in the admin
 * publish action busts it immediately when inventory actually changes.
 */
export const revalidate = 600;

export const metadata: Metadata = pageMeta({
  title: `${site.name} — ${site.tagline} | RERA-Verified Property in Ahmedabad`,
  description: site.description,
  path: "/",
});

export default async function HomePage() {
  // Issued in parallel — six sequential round trips to Supabase would add
  // ~400ms to the regeneration of a page that is cached anyway.
  const [featured, projects, localityCounts, bandCounts, testimonials, builders] =
    await Promise.all([
      getFeaturedListings(6),
      getPartneredProjects(6),
      getLocalityCounts(),
      getBudgetBandCounts("ahmedabad"),
      getTestimonials(5),
      getBuilders(14),
    ]);

  return (
    <>
      {/* The lead featured listing doubles as the hero's spotlight card. */}
      <Hero spotlight={featured[0]} />
      <TrustRail />
      <FeaturedListings listings={featured} bandCounts={bandCounts} />
      <LocalityShowcase counts={localityCounts} />
      <PartneredProjects projects={projects} />
      <Process />
      <ToolsStrip />
      <Testimonials testimonials={testimonials} />
      <BuilderMarquee builders={builders} />
      <CtaBand />
    </>
  );
}
