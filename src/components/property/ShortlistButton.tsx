"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { useWishlist } from "@/components/property/wishlist-store";
import { cn } from "@/lib/utils";

/**
 * The only interactive element inside a listing card, which is why it is
 * split into its own client component — the card itself stays a server
 * component and a 12-card grid ships almost no JS.
 *
 * `z-20` lifts it above the card's full-area click overlay so the heart wins
 * the hit test instead of navigating to the listing.
 */
export function ShortlistButton({
  slug,
  title,
  size = "md",
}: {
  slug: string;
  title: string;
  size?: "md" | "lg";
}) {
  const { has, toggle, ready } = useWishlist();
  const [pulse, setPulse] = useState(false);
  const saved = has(slug);

  const onClick = (e: React.MouseEvent) => {
    // Sitting inside a card-wide link overlay.
    e.preventDefault();
    e.stopPropagation();

    const nowSaved = toggle(slug);
    if (nowSaved) {
      setPulse(true);
      setTimeout(() => setPulse(false), 420);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      // Until localStorage is read, the state is unknown — so describe the
      // action rather than asserting a possibly-wrong state to a screen reader.
      aria-label={
        !ready ? `Save ${title}` : saved ? `Remove ${title} from shortlist` : `Save ${title} to shortlist`
      }
      aria-pressed={ready ? saved : undefined}
      className={cn(
        "relative z-20 grid shrink-0 place-items-center rounded-full border backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-90",
        size === "lg" ? "size-11" : "size-9",
        saved
          ? "border-brass bg-brass text-paper"
          : "border-paper/45 bg-ink/25 text-paper hover:border-paper hover:bg-paper hover:text-ink",
      )}
    >
      <Heart
        className={cn(
          size === "lg" ? "size-5" : "size-4",
          "transition-transform duration-400",
          pulse && "scale-125",
        )}
        strokeWidth={1.8}
        fill={saved ? "currentColor" : "none"}
        aria-hidden
      />
    </button>
  );
}
