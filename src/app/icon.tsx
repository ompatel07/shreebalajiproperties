import { ImageResponse } from "next/og";

/**
 * Favicon, generated at build time from the same jaali monogram as the
 * logotype — so the tab icon and the wordmark are the same mark, and there is
 * no binary .ico to keep in sync when the brand changes.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#16150f",
        }}
      >
        {/* The lozenge from the monogram, in brass on ink. At 32px the
            lattice and registration ticks would turn to mud, so only the
            solid centre survives. */}
        <svg width="32" height="32" viewBox="0 0 32 32">
          <path d="M16 6 L26 16 L16 26 L6 16 Z" fill="none" stroke="#c79a4f" strokeWidth="1.6" opacity="0.55" />
          <path d="M16 10.5 L21.5 16 L16 21.5 L10.5 16 Z" fill="#c79a4f" />
        </svg>
      </div>
    ),
    size,
  );
}
