import type { Metadata } from "next";

import { BuilderMarquee } from "@/components/home/BuilderMarquee";
import { CtaBand } from "@/components/home/CtaBand";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { Hero } from "@/components/home/Hero";
import { LocalityShowcase } from "@/components/home/LocalityShowcase";
import { Portfolio } from "@/components/home/Portfolio";
import { Process } from "@/components/home/Process";
import { Services } from "@/components/home/Services";
import { Testimonials } from "@/components/home/Testimonials";
import { TheGap } from "@/components/home/TheGap";
import { ToolsStrip } from "@/components/home/ToolsStrip";
import { TrustRail } from "@/components/home/TrustRail";
import { site } from "@/config/site";
import {
  getBudgetBandCounts,
  getBuilders,
  getFeaturedListings,
  getLocalityCounts,
  getTestimonials,
} from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOMEPAGE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ordered as an argument to a **builder**, following the client's own deck:
 *
 *   Hero       — the claim: a project needs momentum, not more advertising
 *   TheGap     — the diagnosis: where projects actually leak
 *   Services   — the six functions, and why an agency is not the same thing
 *   Process    — the six-stage engagement, position through finance support
 *   Portfolio  — the developments marketed, and why execution matters
 *   Localities — market coverage, as evidence of micro-market knowledge
 *   Listings   — the projects being marketed right now
 *   Tools      — buyer-facing calculators, which are a demand-generation asset
 *   Proof      — testimonials and developer names
 *   CTA        — talk to us
 *
 * The buyer-facing listing and calculator surfaces are deliberately kept:
 * "lead generation" and "enquiry management" are two of the six services, and
 * neither can be delivered without somewhere for a buyer to land.
 *
 * ISR at 10 minutes. The page reads five tables but changes rarely, so edge
 * caching is faster and cheaper on the Supabase free tier, where egress
 * rather than compute is the binding constraint. `revalidatePath("/")` in the
 * admin publish action busts it the moment inventory actually changes.
 */
export const revalidate = 600;

export const metadata: Metadata = pageMeta({
  title: `${site.name} — ${site.discipline} in Ahmedabad`,
  description: site.description,
  path: "/",
});

export default async function HomePage() {
  // Issued in parallel: five sequential round trips would add ~400ms to the
  // regeneration of a page that is cached anyway.
  const [featured, localityCounts, bandCounts, testimonials, builders] =
    await Promise.all([
      getFeaturedListings(6),
      getLocalityCounts(),
      getBudgetBandCounts("ahmedabad"),
      getTestimonials(5),
      getBuilders(14),
    ]);

  return (
    <>
      <Hero />
      <TrustRail />
      <TheGap />
      <Services />
      <Process />
      <Portfolio />
      <LocalityShowcase counts={localityCounts} />
      <FeaturedListings listings={featured} bandCounts={bandCounts} />
      <ToolsStrip />
      <Testimonials testimonials={testimonials} />
      <BuilderMarquee builders={builders} />
      <CtaBand />
    </>
  );
}
