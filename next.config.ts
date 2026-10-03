import type { NextConfig } from "next";

/**
 * Headers that never need a per-request nonce live here so they are applied by
 * the CDN edge even on cached/static responses. The Content-Security-Policy is
 * NOT here on purpose — it is emitted per-request in `middleware.ts` so it can
 * carry a fresh nonce instead of `unsafe-inline`.
 */
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Deny every powerful feature the site does not use.
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=(self)",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "accelerometer=()",
      "interest-cohort=()",
    ].join(", "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Fail the production build on type or lint errors rather than shipping them.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
    formats: ["image/avif", "image/webp"],
    // Matches the breakpoints the layout actually requests.
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920, 2560],
    minimumCacheTTL: 2_592_000, // 30 days
  },

  experimental: {
    // lucide-react only. The animation library was removed entirely —
    // scroll reveals are CSS driven by one shared IntersectionObserver.
    optimizePackageImports: ["lucide-react"],
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Immutable hashed assets.
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // The admin panel must never be cached by a shared cache.
        source: "/studio/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/admin", destination: "/studio", permanent: true },
      { source: "/admin/:path*", destination: "/studio/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
