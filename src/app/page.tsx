import type { Metadata } from "next";

import { BuilderMarquee } from "@/components/home/BuilderMarquee";
import { BuyerSteps } from "@/components/home/BuyerSteps";
import { CtaBand } from "@/components/home/CtaBand";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { ForBuildersBand } from "@/components/home/ForBuildersBand";
import { ProjectsBand } from "@/components/home/ProjectsBand";
import { PropertyTypeBand } from "@/components/home/PropertyTypeBand";
import { Hero } from "@/components/home/Hero";
import { LocalityShowcase } from "@/components/home/LocalityShowcase";
import { QuickBrowse } from "@/components/home/QuickBrowse";
import { Testimonials } from "@/components/home/Testimonials";
import { ToolsStrip } from "@/components/home/ToolsStrip";
import { localityCount, site } from "@/config/site";
import {
  getBuilders,
  getFeaturedListings,
  getHomeFacts,
  getPartneredProjects,
  getTestimonials,
} from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOMEPAGE — buyer-first
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The site's main job is helping a home buyer find a property and enquire.
 * An earlier version led with the client's builder pitch, which buried that
 * behind four sections of B2B argument. The pitch is still here in full — it
 * moved to /for-builders, with one compact band pointing at it.
 *
 * Order follows what a buyer needs, in sequence:
 *
 *   Hero         headline + the search box, above the fold
 *   QuickBrowse  one-tap routes in: budget, bedrooms, area, type
 *   Featured     actual properties, as early as possible
 *   Areas        where we cover, with live counts
 *   BuyerSteps   what happens after you enquire, in plain words
 *   Tools        EMI, affordability, stamp duty — free, no sign-up
 *   Proof        testimonials and developer names
 *   Builders     the one band for the other audience
 *   CTA          call, WhatsApp, or send a brief
 *
 * ISR at 10 minutes: five tables read, but the page changes rarely, so edge
 * caching is faster and cheaper on the Supabase free tier where egress is the
 * binding constraint. The admin publish action revalidates it on change.
 */
export const revalidate = 600;

export const metadata: Metadata = pageMeta({
  title: `${site.name} — Property for Sale in Ahmedabad & Gandhinagar`,
  description: `Find flats, villas, offices and plots across ${localityCount} areas in Ahmedabad and Gandhinagar. Search by budget, bedrooms or area — every listing checked, and no charge to buyers.`,
  path: "/",
});

export default async function HomePage() {
  // Issued in parallel: five sequential round trips would add ~400ms to the
  // regeneration of a page that is cached anyway.
  // `getHomeFacts` replaces four separate aggregates that each scanned the
  // same table — see its comment in queries.ts. Five round trips, not eight.
  const [featured, facts, testimonials, builders, projects] = await Promise.all([
    getFeaturedListings(6),
    getHomeFacts("ahmedabad"),
    getTestimonials(5),
    getBuilders(14),
    getPartneredProjects(4),
  ]);

  const { localityCounts, typeCounts, bandCounts } = facts;

  return (
    <>
      <Hero liveCount={facts.live} localityCounts={localityCounts} />
      <PropertyTypeBand counts={typeCounts} />
      <FeaturedListings listings={featured} bandCounts={bandCounts} />
      <ProjectsBand projects={projects} />
      <QuickBrowse />
      <LocalityShowcase counts={localityCounts} />
      <BuyerSteps />
      <ToolsStrip />
      <Testimonials testimonials={testimonials} />
      <BuilderMarquee builders={builders} />
      <ForBuildersBand />
      <CtaBand />
    </>
  );
}
