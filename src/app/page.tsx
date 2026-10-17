import type { Metadata } from "next";

import { AdvisorCta } from "@/components/home/AdvisorCta";
import { AreaSpotlight } from "@/components/home/AreaSpotlight";
import { CategoryBento } from "@/components/home/CategoryBento";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { ForBuildersBand } from "@/components/home/ForBuildersBand";
import { Hero } from "@/components/home/Hero";
import { OfferBand } from "@/components/home/OfferBand";
import { ProjectsBand } from "@/components/home/ProjectsBand";
import { Reviews } from "@/components/home/Reviews";
import { ToolsGrid } from "@/components/home/ToolsGrid";
import { WhyUs } from "@/components/home/WhyUs";
import { localityCount, site } from "@/config/site";
import {
  getFeaturedListings,
  getHomeFacts,
  getPartneredProjects,
  getTestimonials,
} from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOMEPAGE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Rebuilt in October 2026 after the client's verdict that the previous design
 * "clearly seems like a template". The diagnosis was structural, not
 * cosmetic: every section opened the same way — small-caps label, serif
 * headline with one gold italic word, grey paragraph, cards — so however
 * polished each one was, ten in a row read as a theme.
 *
 * Each section now has its own SHAPE, so the page has rhythm instead of
 * repetition:
 *
 *   Hero          framed slideshow · tabbed search docked over it · numbers
 *   Types         bento — one large tile, four small
 *   Homes         budget filter, then a uniform card grid
 *   Areas         a city banner beside compact area cards
 *   Projects      large image cards
 *   Why us        split: a photograph and four reasons
 *   Tools         small tool cards on a tinted band
 *   Reviews       quote cards
 *   Advisor       a rounded dark panel with three ways to reach us
 *   Builders      the one band for the other audience, into the footer
 *
 * Photography is real Indian property imagery, shown in full colour — see the
 * curated library at the top of src/lib/imagery.ts.
 *
 * ISR at 10 minutes. The admin publish action revalidates it on change.
 */
export const revalidate = 600;

export const metadata: Metadata = pageMeta({
  title: `${site.name} — Flats, Villas & Offices for Sale in Ahmedabad`,
  description: `Verified flats, villas, bungalows, offices and plots across ${localityCount} areas of Ahmedabad and Gandhinagar. Search by budget, area or type — one advisor from first visit to keys, and no charge to buyers.`,
  path: "/",
});

export default async function HomePage() {
  // Four round trips in parallel. `getHomeFacts` does every count the page
  // needs from one narrow select — see its comment in queries.ts.
  const [featured, facts, testimonials, projects] = await Promise.all([
    getFeaturedListings(6),
    getHomeFacts("ahmedabad"),
    getTestimonials(3),
    getPartneredProjects(4),
  ]);

  return (
    <>
      <Hero typeCounts={facts.typeCounts} />
      <OfferBand />
      <CategoryBento counts={facts.typeCounts} />
      <FeaturedListings listings={featured} bandCounts={facts.bandCounts} total={facts.live} />
      <AreaSpotlight counts={facts.localityCounts} />
      <ProjectsBand projects={projects} />
      <WhyUs />
      <ToolsGrid />
      <Reviews testimonials={testimonials} />
      <AdvisorCta />
      <ForBuildersBand />
    </>
  );
}
