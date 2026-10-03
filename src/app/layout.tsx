import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Inter_Tight } from "next/font/google";

import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { site, siteUrl } from "@/config/site";
import { organizationSchema } from "@/lib/seo";

import "./globals.css";

/**
 * ── Type system ───────────────────────────────────────────────────────────
 *
 * Three families, each doing one job. Self-hosted by next/font at build time,
 * which means no render-blocking request to Google and no external origin in
 * the CSP.
 *
 * The reference site (ramarealty.in) ships a single geometric sans for
 * everything. A serif/sans/mono split is the main reason this reads as an
 * editorial property brand rather than a SaaS dashboard.
 */

/**
 * Display. Only the SOFT and WONK axes are requested: those are the two the
 * stylesheet actually varies (`.display-tight` / `.display-wonk`). Asking for
 * `opsz` as well would ship a larger variable font for an axis nothing uses.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK"],
});

/** Body. Tighter and more architectural than plain Inter. */
const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

/** Data and eyebrow labels. The drafting-table register. */
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.tagline} | Property in Ahmedabad & Gandhinagar`,
    template: `%s`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  publisher: site.legalName,
  keywords: [
    "property in Ahmedabad",
    "flats in Ahmedabad",
    "RERA verified property Ahmedabad",
    "3 BHK Ahmedabad",
    "property in Gandhinagar",
    "GIFT City apartments",
    "real estate channel partner Ahmedabad",
  ],
  formatDetection: { telephone: true, address: true, email: true },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
  category: "real estate",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom stays available. Capping it is an accessibility failure.
  maximumScale: 5,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#faf8f4" }],
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${fraunces.variable} ${interTight.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Supabase is the origin every page hits for data — warm it early. */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="" />
        )}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/*
          Site-wide entity graph, emitted once. Page-level schema references
          these two @ids instead of restating the business, so Google resolves
          the whole site to one organisation.

          No nonce: a <script> with a non-JavaScript MIME type is a data block
          per the HTML spec and is never prepared for execution, so CSP's
          script-src does not apply to it.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
      </head>

      <body className="min-h-dvh bg-bone text-ink-soft antialiased">
        {/* First tab stop on every page. */}
        <a
          href="#main"
          className="sr-only-focusable fixed top-4 left-4 z-[100] bg-ink px-5 py-3 font-mono text-micro tracking-[0.16em] uppercase text-bone"
        >
          Skip to content
        </a>

        <Header />

        <main id="main" className="min-h-dvh">
          {children}
        </main>

        {/*
          Placed between main and the footer rather than above the header:
          the header is `position: fixed` and every page offsets its top
          padding against it, so injecting a band above it would shift the
          whole layout. Renders only in demo mode.
        */}
        <DemoBanner />

        <Footer />

        {/* Call / WhatsApp rail. Mobile only — where the leads come from. */}
        <StickyActionBar />

        {/*
          One IntersectionObserver for every scroll reveal on the page. This
          is what replaced framer-motion — the Reveal components are now
          server-rendered and ship no JavaScript of their own.
        */}
        <ScrollReveal />
      </body>
    </html>
  );
}
