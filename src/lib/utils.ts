import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Conditional classes with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Build a `wa.me` deep link. Free — no WhatsApp Business API involved. */
export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function telLink(e164: string): string {
  return `tel:${e164}`;
}

/** Clamp for slider and calculator inputs. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/**
 * Parse a user-typed rupee amount. Accepts "45,00,000", "1.2cr", "85 lakh",
 * "₹75L" — the formats people actually paste into a search box.
 */
export function parseRupees(input: string): number | null {
  const raw = input.trim().toLowerCase().replace(/[₹,\s]/g, "");
  if (!raw) return null;

  const match = raw.match(/^([\d.]+)(cr|crore|l|lakh|lac|k)?$/);
  if (!match) return null;

  const value = Number.parseFloat(match[1]!);
  if (Number.isNaN(value)) return null;

  switch (match[2]) {
    case "cr":
    case "crore":
      return Math.round(value * 10_000_000);
    case "l":
    case "lakh":
    case "lac":
      return Math.round(value * 100_000);
    case "k":
      return Math.round(value * 1000);
    default:
      return Math.round(value);
  }
}

/** Stable shuffle so SSR and the client agree on ordering. */
export function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Debounce for filter inputs and map viewport queries. */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): (...args: A) => void {
  let t: ReturnType<typeof setTimeout>;
  return (...args: A) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Straight-line distance in km. Good enough for "1.4 km from Thaltej
 * Cross Roads" without reaching for a paid routing API.
 */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Lightweight deterministic hash — used to pick a stable placeholder image
 * per listing so a card does not change photo between renders.
 */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
