"use client";

import { Share2, Trash2 } from "lucide-react";

import { PropertyCard, PropertyCardSkeleton } from "@/components/property/PropertyCard";
import { usePropertiesBySlug } from "@/components/property/use-properties-by-slug";
import { useWishlist } from "@/components/property/wishlist-store";
import { ButtonExternal, ButtonLink } from "@/components/ui/Button";
import { site } from "@/config/site";
import { formatBhk, formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/utils";

/**
 * The shortlist.
 *
 * The one feature that earns its keep here is "send this to an advisor" — it
 * composes a WhatsApp message listing the saved homes with their prices and
 * links. That solves the real problem with device-local storage (the list
 * does not follow you) without building accounts, and it hands the client a
 * pre-qualified lead who has already picked four specific flats.
 *
 * It is a `wa.me` link, so it costs nothing to run.
 */
export function WishlistView() {
  const { items: slugs, ready, clear } = useWishlist();
  const { items, loading } = usePropertiesBySlug(slugs, ready);

  if (!ready || loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) return <EmptyWishlist />;

  // Composed once, used by the WhatsApp CTA.
  const message = [
    `Hi ${site.name}, these are the ${items.length} homes I have shortlisted on your site:`,
    "",
    ...items.map(
      (p, i) =>
        `${i + 1}. ${p.title}${p.bhk ? ` (${formatBhk(p.bhk)})` : ""} — ${
          p.price_on_request ? "price on request" : formatPrice(p.price)
        }\n   ${site.name.toLowerCase()}: /property/${p.slug}`,
    ),
    "",
    "Could you tell me which of these is the better buy, and arrange visits?",
  ].join("\n");

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-5">
        <p className="font-semibold text-micro tracking-[0.1em] text-ink-muted uppercase">
          <span className="text-ink" data-numeric>
            {items.length}
          </span>{" "}
          {items.length === 1 ? "home" : "homes"} saved
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <ButtonExternal
            href={whatsappLink(site.contact.whatsapp, message)}
            variant="brass"
            size="sm"
            icon={<Share2 className="size-3.5" strokeWidth={1.9} aria-hidden />}
          >
            Send to an advisor
          </ButtonExternal>

          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-2 rounded-[2px] border border-rule-strong px-4 py-2 font-semibold text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase transition-colors hover:border-alert hover:text-alert"
          >
            <Trash2 className="size-3.5" strokeWidth={1.8} aria-hidden />
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>

      {/* Honest note about where the list lives. */}
      <div className="mt-12 rounded-[2px] border border-rule bg-sand p-6">
        <p className="eyebrow mb-3">About this list</p>
        <p className="max-w-prose text-[0.9375rem] leading-relaxed text-ink-soft">
          Your shortlist is stored on this device only — we deliberately do not
          make you create an account to save a flat, and nothing here reaches us
          unless you send it. The trade-off is that it will not appear on your
          phone if you saved it on a laptop. Sending it to an advisor on
          WhatsApp is the easiest way to keep a copy, and it means we can start
          looking at the specific homes you picked.
        </p>
      </div>
    </div>
  );
}

function EmptyWishlist() {
  return (
    <div className="relative overflow-hidden rounded-[2px] border border-rule bg-paper px-6 py-20 text-center">
      <div className="jaali absolute inset-0" aria-hidden />
      <div className="relative">
        <p className="eyebrow">Nothing saved yet</p>
        <h2 className="mx-auto mt-4 max-w-md font-display text-h3">
          Tap the heart on anything you like.
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-muted">
          No account needed. Your shortlist stays on this device, and when you
          are ready you can send the whole thing to an advisor in one tap.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/properties" size="lg">
            Browse listings
          </ButtonLink>
          <ButtonLink href="/map" variant="outline" size="lg">
            Explore the map
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
