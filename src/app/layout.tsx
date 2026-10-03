import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";

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
 * Instrument Serif for display, Plus Jakarta Sans for everything structural,
 * IBM Plex Mono for figures only. Self-hosted by next/font at build time, so
 * there is no render-blocking request to Google and no external origin in the
 * CSP.
 *
 * The reference site (ramarealty.in) runs Plus Jakarta Sans for everything.
 * Sharing its body face is deliberate — it is the register this client reads
 * as professional — but the serif display line is ours, and it is what keeps
 * the site from looking like the same purchased template.
 */

/**
 * Display. One weight, high contrast, tight fit. Carries h1/h2 and the hero
 * only; at label sizes it is too delicate, which is why h3/h4 moved to the
 * sans. A single static weight also means a far smaller file than the old
 * variable serif.
 */
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument",
});

/** Everything structural: body, h3/h4, labels, UI. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

/** Figures only — prices, areas, counts. Not labels any more. */
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.discipline} in Ahmedabad`,
    template: `%s`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  publisher: site.legalName,
  keywords: [
    "real estate project marketing Ahmedabad",
    "property marketing agency Ahmedabad",
    "builder marketing services Gujarat",
    "real estate lead generation Ahmedabad",
    "project marketing partner for builders",
    "property in Ahmedabad",
    "flats in Ahmedabad",
    "GIFT City apartments",
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
    title: `${site.name} — ${site.discipline}`,
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
      className={`${instrument.variable} ${jakarta.variable} ${plexMono.variable}`}
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
          className="sr-only-focusable fixed top-4 left-4 z-[100] bg-ink px-5 py-3 font-semibold text-micro tracking-[0.14em] uppercase text-bone"
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
