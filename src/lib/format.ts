/**
 * Indian real-estate number formatting.
 *
 * Getting this wrong is the fastest way to look like an outsider. Indian
 * property is quoted in lakh (10⁵) and crore (10⁷), grouped 2-2-3 — ₹45,00,000
 * and never ₹4,500,000. Every price on the site goes through here.
 */

const CRORE = 10_000_000;
const LAKH = 100_000;

/**
 * The headline price format: `₹1.45 Cr`, `₹82 Lakh`, `₹45,000`.
 *
 * Fractions are trimmed rather than padded — ₹2 Cr, not ₹2.00 Cr — because a
 * trailing zero on a price reads as a rounding error to buyers here.
 */
export function formatPrice(paise: number | null | undefined): string {
  if (paise === null || paise === undefined || Number.isNaN(paise)) return "Price on request";
  if (paise <= 0) return "Price on request";

  if (paise >= CRORE) {
    const cr = paise / CRORE;
    // Two decimals below ₹10 Cr, one above — keeps the string short.
    const decimals = cr < 10 ? 2 : 1;
    return `₹${trimZeros(cr.toFixed(decimals))} Cr`;
  }

  if (paise >= LAKH) {
    const lakh = paise / LAKH;
    return `₹${trimZeros(lakh.toFixed(lakh < 10 ? 2 : 0))} Lakh`;
  }

  return `₹${groupIndian(paise)}`;
}

/** A price range, collapsing to a single value when both ends match. */
export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  if (!min && !max) return "Price on request";
  if (min && !max) return `${formatPrice(min)} onwards`;
  if (!min && max) return `Up to ${formatPrice(max)}`;
  if (min === max) return formatPrice(min);

  // Share the unit when both ends land in the same bracket: "₹1.2 – 1.8 Cr".
  if (min! >= CRORE && max! >= CRORE) {
    const a = trimZeros((min! / CRORE).toFixed(2));
    const b = trimZeros((max! / CRORE).toFixed(2));
    return `₹${a} – ${b} Cr`;
  }
  if (min! >= LAKH && max! < CRORE) {
    const a = trimZeros((min! / LAKH).toFixed(0));
    const b = trimZeros((max! / LAKH).toFixed(0));
    return `₹${a} – ${b} Lakh`;
  }
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

/**
 * Full rupee value with Indian 2-2-3 digit grouping.
 * 4500000 → "45,00,000"
 */
export function groupIndian(n: number): string {
  const [whole = "0", frac] = Math.abs(Math.round(n * 100) / 100)
    .toString()
    .split(".");
  const sign = n < 0 ? "-" : "";

  // Last three digits stay together; everything before is grouped in pairs.
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${last3}`
    : last3;

  return sign + grouped + (frac ? `.${frac}` : "");
}

/** `₹45,00,000` — the exact figure, for agreement/legal contexts. */
export function formatRupeesExact(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `₹${groupIndian(Math.round(n))}`;
}

/** Spells the amount in words, the way a sale deed does. */
export function priceInWords(n: number): string {
  if (!n || n <= 0) return "";
  if (n >= CRORE) {
    const cr = n / CRORE;
    return `${trimZeros(cr.toFixed(2))} crore`;
  }
  if (n >= LAKH) {
    return `${trimZeros((n / LAKH).toFixed(2))} lakh`;
  }
  return `${trimZeros((n / 1000).toFixed(1))} thousand`;
}

/** `1,250 sq.ft` */
export function formatArea(sqft: number | null | undefined): string {
  if (!sqft) return "—";
  return `${groupIndian(Math.round(sqft))} sq.ft`;
}

/** Derived ₹/sq.ft, the number serious buyers actually compare on. */
export function pricePerSqft(price: number | null, sqft: number | null): string {
  if (!price || !sqft || sqft <= 0) return "—";
  return `₹${groupIndian(Math.round(price / sqft))}/sq.ft`;
}

/**
 * BHK label. Handles the half-room convention — 2.5 BHK is a real and
 * commonly listed configuration in Ahmedabad.
 */
export function formatBhk(bhk: number | null | undefined): string {
  if (!bhk) return "—";
  return `${bhk % 1 === 0 ? bhk : bhk.toFixed(1)} BHK`;
}

/** Compact counts for stat rails: 1800 → "1.8K". */
export function formatCompact(n: number): string {
  if (n >= CRORE) return `${trimZeros((n / CRORE).toFixed(1))}Cr`;
  if (n >= LAKH) return `${trimZeros((n / LAKH).toFixed(1))}L`;
  if (n >= 1000) return `${trimZeros((n / 1000).toFixed(1))}K`;
  return String(n);
}

/**
 * Possession phrasing. Buyers read "Ready to move" and "Dec 2027"
 * very differently, so never collapse them into a single date string.
 */
export function formatPossession(
  status: string | null,
  date: string | null,
): string {
  if (status === "ready-to-move") return "Ready to move";
  if (status === "new-launch" && !date) return "New launch";
  if (!date) return "On request";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "On request";
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

/** "2 days ago" — relative time, capped at a real date past a month. */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";

  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;

  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Strip trailing `.00` / `.50` → `.5` so prices read naturally. */
function trimZeros(s: string): string {
  return s.replace(/\.?0+$/, "");
}

/** URL-safe slug from free text. Used when the admin creates a listing. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Initials for an avatar fallback. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
