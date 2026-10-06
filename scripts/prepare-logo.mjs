/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOGO PREPARATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/prepare-logo.mjs <source.png>
 *
 * The supplied artwork is gold on a dark radial gradient, baked in. The site
 * is ivory, so dropping it in as-is puts a black rectangle in the header.
 *
 * ── Why a flood fill and not a luminance key ────────────────────────────
 * The obvious move — "make dark pixels transparent" — destroys the artwork,
 * because the design *contains* dark elements: the charcoal tower blocks
 * beside the house are nearly black, and so are the outlines around every
 * gold form. A threshold cannot tell those from the backdrop.
 *
 * Connectivity can. The backdrop is the only dark region touching the image
 * border, so this floods inward from the edges and clears only what is dark
 * *and reachable from outside*. Interior darks are enclosed by bright gold
 * outlines, so the flood never reaches them.
 *
 * Output: a trimmed, transparent PNG plus a square crop of the emblem for
 * use as a compact mark.
 */
import sharp from "sharp";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("Usage: node scripts/prepare-logo.mjs <source image>");
  process.exit(1);
}

/** Perceptual luminance, 0-255. */
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

const image = sharp(src).ensureAlpha();
const { width, height } = await image.metadata();
const raw = await image.raw().toBuffer();

// Tuned against this artwork: the backdrop glow peaks well under 100, the
// gold sits far above it. Anything in between is edge antialiasing, which the
// soften pass below handles.
const CUT = 100;

const cleared = new Uint8Array(width * height);
const queue = [];

const consider = (x, y) => {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const i = y * width + x;
  if (cleared[i]) return;
  const p = i * 4;
  if (lum(raw[p], raw[p + 1], raw[p + 2]) >= CUT) return;
  cleared[i] = 1;
  queue.push(i);
};

for (let x = 0; x < width; x++) {
  consider(x, 0);
  consider(x, height - 1);
}
for (let y = 0; y < height; y++) {
  consider(0, y);
  consider(width - 1, y);
}

while (queue.length) {
  const i = queue.pop();
  const x = i % width;
  const y = (i - x) / width;
  consider(x + 1, y);
  consider(x - 1, y);
  consider(x, y + 1);
  consider(x, y - 1);
}

let removed = 0;
for (let i = 0; i < cleared.length; i++) {
  if (cleared[i]) {
    raw[i * 4 + 3] = 0;
    removed++;
  }
}

/**
 * Soften the cut edge.
 *
 * A hard alpha boundary leaves a dark fringe where antialiased pixels kept
 * the backdrop's colour. Any surviving pixel that borders a cleared one gets
 * its alpha scaled by how bright it is, so the halo fades instead of ringing.
 */
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const i = y * width + x;
    if (cleared[i]) continue;
    const touchesHole =
      cleared[i - 1] || cleared[i + 1] || cleared[i - width] || cleared[i + width];
    if (!touchesHole) continue;
    const p = i * 4;
    const l = lum(raw[p], raw[p + 1], raw[p + 2]);
    if (l < CUT * 1.8) raw[p + 3] = Math.round(255 * Math.min(1, l / (CUT * 1.8)));
  }
}

const outDir = path.resolve("public");
const base = sharp(raw, { raw: { width, height, channels: 4 } }).png();

// Full lockup: emblem plus wordmark, trimmed to its own bounds.
await base
  .clone()
  .trim({ threshold: 1 })
  .resize({ width: 720, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true })
  .toFile(path.join(outDir, "logo.png"));

// Compact mark: the emblem only.
//
// Trim FIRST, then crop. Cropping the untrimmed canvas and trimming after
// left sharp with an empty region to measure — the top 68% of the raw file is
// mostly cleared backdrop — and it failed with "bad extract area".
const trimmed = await sharp(raw, { raw: { width, height, channels: 4 } })
  .png()
  .trim({ threshold: 1 })
  .toBuffer({ resolveWithObject: true });

const tw = trimmed.info.width;
const th = trimmed.info.height;

// Crop to the emblem, then trim again so the result is tight to the artwork.
//
// Forcing a 256x256 square with fit:contain letterboxed a wide emblem, so at
// a 40px header size it rendered about 25px tall and unreadable. Keeping the
// natural aspect and sizing by HEIGHT in CSS is what makes it legible.
await sharp(trimmed.data)
  .extract({ left: 0, top: 0, width: tw, height: Math.round(th * 0.62) })
  .trim({ threshold: 1 })
  .resize({ height: 160, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(path.join(outDir, "logo-mark.png"));

const markMeta = await sharp(path.join(outDir, "logo-mark.png")).metadata();

const pct = ((removed / (width * height)) * 100).toFixed(1);
console.log(`source      ${width}x${height}`);
console.log(`background  ${pct}% of pixels cleared`);
console.log(`lockup      ${tw}x${th} after trim`);
console.log(`mark        ${markMeta.width}x${markMeta.height}`);
console.log("wrote       public/logo.png, public/logo-mark.png");
