import type { Metadata } from "next";

import { absoluteUrl, site, siteUrl } from "@/config/site";
import { formatArea, formatBhk } from "@/lib/format";
import type { PropertyWithRelations } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Two deliberate choices here, both lifted from how the strongest property
 * sites in India are built:
 *
 *   1. Every page-level schema block *references* the business and website by
 *      a stable `@id` instead of restating them. Google then treats the whole
 *      site as one entity graph rather than hundreds of unrelated businesses.
 *
 *   2. Listing pages emit `RealEstateListing`, not `Product`. Property is not
 *      a retail good — `Product` invites price-drop and availability
 *      treatments that do not apply and can trigger rich-result warnings.
 */

export const ORG_ID = `${siteUrl}/#organization`;
export const WEBSITE_ID = `${siteUrl}/#website`;

/* ── Page metadata ───────────────────────────────────────────────────────── */

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  /** Pass `false` for filtered / paginated views. */
  index?: boolean;
  image?: string;
  type?: "website" | "article";
  publishedAt?: string;
}

export function pageMeta({
  title,
  description,
  path,
  index = true,
  image,
  type = "website",
  publishedAt,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ?? absoluteUrl("/opengraph-image");

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 }
      : // `follow` matters: filtered views must stay crawlable so the crawler
        // reaches the listings, even while the view itself stays out of the index.
        { index: false, follow: true },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: site.name,
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedAt ? { publishedTime: publishedAt } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/* ── Site-wide entity graph. Rendered once, in the root layout. ──────────── */

export function organizationSchema() {
  const socials = Object.values(site.social).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateAgent",
        "@id": ORG_ID,
        name: site.name,
        legalName: site.legalName,
        url: siteUrl,
        description: site.description,
        slogan: site.tagline,
        foundingDate: String(site.foundedYear),
        telephone: site.contact.phoneE164,
        email: site.contact.email,
        priceRange: "₹₹₹",
        image: absoluteUrl("/opengraph-image"),
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icon.svg"),
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: `${site.office.line1}, ${site.office.line2}`,
          addressLocality: site.office.city,
          addressRegion: site.office.state,
          postalCode: site.office.postalCode,
          addressCountry: site.office.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: site.office.geo.lat,
          longitude: site.office.geo.lng,
        },
        areaServed: site.cities.map((c) => ({ "@type": "City", name: c.name })),
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            opens: "10:00",
            closes: "19:30",
          },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: site.contact.phoneE164,
          email: site.contact.email,
          contactType: "sales",
          areaServed: "IN",
          availableLanguage: ["en", "hi", "gu"],
        },
        ...(socials.length ? { sameAs: socials } : {}),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: site.name,
        url: siteUrl,
        inLanguage: "en-IN",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

/* ── Listing ─────────────────────────────────────────────────────────────── */

export function listingSchema(p: PropertyWithRelations, localityName: string) {
  const url = absoluteUrl(`/property/${p.slug}`);
  const area = p.carpet_sqft ?? p.super_sqft ?? p.plot_sqft;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    url,
    name: p.title,
    description: p.description?.slice(0, 500) ?? site.description,
    datePosted: p.published_at ?? p.created_at,
    image: [p.hero_image, ...p.images.map((i) => i.url)].filter(Boolean).slice(0, 8),
    provider: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },

    ...(p.price && !p.price_on_request
      ? {
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "INR",
            availability:
              p.status === "published"
                ? "https://schema.org/InStock"
                : "https://schema.org/LimitedAvailability",
            seller: { "@id": ORG_ID },
          },
        }
      : {}),

    about: {
      "@type": p.category === "residential" ? "Residence" : "Place",
      name: p.title,
      address: {
        "@type": "PostalAddress",
        streetAddress: p.address ?? localityName,
        addressLocality: localityName,
        addressRegion: "Gujarat",
        addressCountry: "IN",
      },
      ...(p.lat && p.lng
        ? {
            geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
          }
        : {}),
      ...(area
        ? {
            floorSize: {
              "@type": "QuantitativeValue",
              value: area,
              unitCode: "FTK", // UN/CEFACT: square foot
            },
          }
        : {}),
      ...(p.bhk ? { numberOfRooms: p.bhk } : {}),
      ...(p.bathrooms ? { numberOfBathroomsTotal: p.bathrooms } : {}),
      ...(p.amenities.length
        ? {
            amenityFeature: p.amenities.slice(0, 20).map((a) => ({
              "@type": "LocationFeatureSpecification",
              name: a,
              value: true,
            })),
          }
        : {}),
    },
  };
}

/* ── Breadcrumbs ─────────────────────────────────────────────────────────── */

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/* ── Listing collections ─────────────────────────────────────────────────── */

export function itemListSchema(
  items: { slug: string; title: string }[],
  listName: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/property/${item.slug}`),
      name: item.title,
    })),
  };
}

/* ── FAQ. Earns the accordion rich result on locality pages. ─────────────── */

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * A listing's alt text, written for someone who cannot see the photo —
 * not keyword-stuffed for a crawler.
 */
export function listingAlt(
  p: { title: string; bhk: number | null; carpet_sqft: number | null },
  localityName: string,
): string {
  const parts = [p.bhk ? formatBhk(p.bhk) : null, p.title, `in ${localityName}`];
  if (p.carpet_sqft) parts.push(`— ${formatArea(p.carpet_sqft)} carpet`);
  return parts.filter(Boolean).join(" ");
}
