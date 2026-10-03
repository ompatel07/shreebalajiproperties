import type { MetadataRoute } from "next";

import { absoluteUrl, siteUrl } from "@/config/site";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROBOTS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The important rule is `Disallow: /*?`.
 *
 * Every filterable page rewrites its own URL as the visitor narrows a search,
 * which generates effectively unlimited near-duplicates of the clean landing
 * page they hang off. Those responses already carry `noindex, follow` and a
 * canonical pointing at the clean parent — but `noindex` only takes effect
 * *after* a crawl. Blocking the pattern here keeps them out of the crawl
 * budget in the first place, which on a site with ~1,100 real landing pages
 * is the difference between those pages being re-crawled weekly or monthly.
 *
 * Nothing indexable on this site lives behind a `?`. Clean paths only:
 *     /ahmedabad/shela
 *     /ahmedabad/3-bhk-flats
 *     /ahmedabad/shela/under-50-lakh
 *
 * NOTE: `Disallow` also blocks the crawler from *reading* those URLs, so a
 * `noindex` on a blocked page is never seen. That is fine here — the clean
 * parent is canonical and reachable — but it is why the two mechanisms are
 * belt and braces rather than redundant.
 */
export default function robots(): MetadataRoute.Robots {
  // Block indexing entirely on preview deployments, so a Vercel preview URL
  // can never outrank or duplicate production.
  const isProduction =
    siteUrl.includes("://") &&
    !siteUrl.includes("localhost") &&
    !siteUrl.includes("vercel.app");

  if (!isProduction) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/*?",          // every filter / pagination permutation
          "/studio",      // admin panel
          "/studio/",
          "/api/",
          "/wishlist",    // per-visitor state, not content
          "/compare",
          "/properties",  // the query-driven search surface
        ],
      },
      {
        // Image crawlers should still reach listing photography.
        userAgent: "Googlebot-Image",
        allow: ["/", "/_next/image"],
        disallow: ["/studio"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
