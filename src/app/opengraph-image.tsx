import { ImageResponse } from "next/og";

import { site } from "@/config/site";

/**
 * Default social card, composed rather than photographed.
 *
 * A generated card means there is no 1200×630 JPEG to re-export whenever the
 * brand or the trust numbers change — it rebuilds from `site.config.ts` like
 * everything else. It also stays crisp, which a compressed screenshot does
 * not.
 *
 * `next/og` runs Satori, which supports a deliberately narrow slice of CSS:
 * flexbox only (no grid), no `gap` on some versions, no custom properties,
 * and system fonts unless a font file is fetched. So everything here is
 * inline, absolute or flex, with literal hex values.
 */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf8f4",
          padding: "64px 72px",
          position: "relative",
        }}
      >
        {/* Brass rule along the top edge. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 10,
            background: "#a3762c",
          }}
        />

        {/* Oversized jaali lozenge, bled off the right edge as a watermark. */}
        <svg
          width="520"
          height="520"
          viewBox="0 0 100 100"
          style={{ position: "absolute", right: -130, bottom: -120, opacity: 0.09 }}
        >
          <path d="M50 4 L96 50 L50 96 L4 50 Z" fill="none" stroke="#16150f" strokeWidth="2" />
          <path d="M50 22 L78 50 L50 78 L22 50 Z" fill="none" stroke="#16150f" strokeWidth="2" />
          <path d="M50 38 L62 50 L50 62 L38 50 Z" fill="#16150f" />
        </svg>

        {/* ── Masthead ───────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="44" height="44" viewBox="0 0 40 40">
            <rect x="1" y="1" width="38" height="38" fill="none" stroke="#16150f" strokeWidth="1.6" />
            <path d="M20 7.5 L32.5 20 L20 32.5 L7.5 20 Z" fill="none" stroke="#16150f" strokeWidth="1.3" opacity="0.45" />
            <path d="M20 13.5 L26.5 20 L20 26.5 L13.5 20 Z" fill="#16150f" />
          </svg>

          <div style={{ display: "flex", flexDirection: "column", marginLeft: 18 }}>
            <div style={{ display: "flex", fontSize: 36, letterSpacing: 1, color: "#16150f" }}>
              <span>{site.wordmark.lead}</span>
              <span style={{ color: "#a3762c" }}>{site.wordmark.tail}</span>
            </div>
            <div
              style={{
                fontSize: 13,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#6e685c",
                marginTop: 4,
              }}
            >
              Marketing Services for Builders
            </div>
          </div>
        </div>

        {/* ── Claim ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.04,
              letterSpacing: -2.5,
              color: "#16150f",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Your project deserves</span>
            <span>
              more than{" "}
              <span style={{ color: "#a3762c", fontStyle: "italic" }}>marketing.</span>
            </span>
          </div>

          <div style={{ fontSize: 24, color: "#3d3a31", marginTop: 24, lineHeight: 1.45 }}>
            Project marketing for builders — demand, enquiries, site visits
            and finance coordination, run by one in-house team.
          </div>
        </div>

        {/* ── Trust rail ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            borderTop: "1px solid #e4ddd0",
            paddingTop: 26,
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex" }}>
            {/*
              Stats carrying a currency prefix are skipped here on purpose.
              Satori resolves fonts glyph-by-glyph and has no local face
              covering U+20B9 (₹), so it attempts a remote fetch that fails at
              build time and renders tofu. Rather than ship a font file just
              for one glyph, the card shows the three stats that need only
              Latin digits — the ₹ figure still appears everywhere on-site,
              where the real webfonts are loaded.
            */}
            {site.trust
              .filter((stat) => !("prefix" in stat && stat.prefix))
              .slice(0, 3)
              .map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginRight: 56,
                }}
              >
                <span style={{ fontSize: 40, color: "#16150f", letterSpacing: -1 }}>
                  {stat.value.toLocaleString("en-IN")}
                  {stat.suffix}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    color: "#6e685c",
                    marginTop: 6,
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: 15,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#a3762c",
            }}
          >
            {site.contact.phoneDisplay}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
