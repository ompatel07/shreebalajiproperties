import type { MetadataRoute } from "next";

import { absoluteUrl, localities, site } from "@/config/site";
import { guides } from "@/content/guides";
import { getAllProjectSlugs, getAllPropertySlugs } from "@/lib/queries";
import { allFacetPaths } from "@/lib/slugs";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SITEMAP
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Emits every canonical URL on the site and nothing else. Specifically it
 * does NOT include:
 *
 *   · anything with a query string (filter permutations are `noindex`)
 *   · /properties, /compare, /wishlist — per-visitor state
 *   · /studio/** — the admin panel
 *
 * `priority` and `changeFrequency` are set with a light touch. Google has
 * said it largely ignores both; they are here for the other crawlers that
 * still read them, and the values are honest rather than all-1.0 (a sitemap
 * where everything is top priority conveys nothing).
 *
 * Regenerated hourly. If this ever exceeds 50,000 URLs or 50 MB it must be
 * split into a sitemap index — at the current taxonomy it is around 1,100.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static pages ───────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/projects"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/localities"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/sell"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/map"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    // Calculators carry real long-tail traffic, so they are not an
    // afterthought in the priority ordering.
    { url: absoluteUrl("/calculators/home-loan-emi"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/calculators/affordability"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/calculators/stamp-duty"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/calculators/rental-yield"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/guides"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // ── Guides. `lastModified` is the real `updated` date from the content
  //    file, so a crawler can tell which guide actually changed.
  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: absoluteUrl(`/guides/${guide.slug}`),
    lastModified: new Date(guide.updated),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ── Programmatic facet pages ───────────────────────────────────────────
  const facetRoutes: MetadataRoute.Sitemap = allFacetPaths().map(({ city, facets }) => {
    const path = `/${[city, ...facets].join("/")}`;

    // A city hub and a locality hub outrank a deep budget-and-type page.
    const depth = facets.length;
    const isLocality = depth === 1 && localities.some((l) => l.slug === facets[0]);

    return {
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: depth === 0 ? 0.9 : isLocality ? 0.8 : depth === 1 ? 0.7 : 0.6,
    };
  });

  // ── Listings & projects ────────────────────────────────────────────────
  // Wrapped: a Supabase outage must degrade the sitemap, not 500 it. A
  // sitemap missing its listing section recovers on the next revalidation;
  // a 500 teaches the crawler to back off.
  let propertyRoutes: MetadataRoute.Sitemap = [];
  let projectRoutes: MetadataRoute.Sitemap = [];

  try {
    const properties = await getAllPropertySlugs();
    propertyRoutes = properties.map((p) => ({
      url: absoluteUrl(`/property/${p.slug}`),
      // Real row timestamp, so a crawler can tell what actually changed.
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[sitemap] properties", error);
  }

  try {
    const slugs = await getAllProjectSlugs();
    projectRoutes = slugs.map((slug) => ({
      url: absoluteUrl(`/projects/${slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[sitemap] projects", error);
  }

  const all = [
    ...staticRoutes,
    ...guideRoutes,
    ...facetRoutes,
    ...propertyRoutes,
    ...projectRoutes,
  ];

  if (all.length > 45_000) {
    console.warn(
      `[sitemap] ${all.length} URLs — approaching the 50,000 limit. Split into a sitemap index for ${site.name}.`,
    );
  }

  return all;
}
