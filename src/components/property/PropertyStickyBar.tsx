"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";

import { ShortlistButton } from "@/components/property/ShortlistButton";
import { site } from "@/config/site";
import { formatBhk, formatPrice } from "@/lib/format";
import { cn, telLink, whatsappLink } from "@/lib/utils";

/**
 * Sticky summary bar for a listing page.
 *
 * ── Why this exists ─────────────────────────────────────────────────────
 * The global mobile action rail is suppressed on `/property/*`, and until
 * now nothing replaced it — so on the longest, highest-intent page on the
 * site a visitor who had scrolled past the price had no way to act without
 * scrolling back. On mobile that is the whole conversion path.
 *
 * It carries the price as well as the buttons, because by the time someone
 * is deep in the amenities list they have usually forgotten the exact
 * figure, and "what was this one again?" is the moment they bounce.
 *
 * Appears after 620px of scroll — past the gallery and the price block, so
 * it never duplicates what is already on screen.
 */
export function PropertyStickyBar({
  slug,
  title,
  price,
  priceOnRequest,
  bhk,
  locality,
}: {
  slug: string;
  title: string;
  price: number | null;
  priceOnRequest: boolean;
  bhk: number | null;
  locality: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 620);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const message = `Hi ${site.name}, I am interested in "${title}". Could you share more details?`;

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-bone/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="shell flex items-center gap-3 py-2.5 lg:py-3">
        {/* ── Identity. Hidden on the narrowest screens, where the three
               actions need the whole width. ──────────────────────────── */}
        <div className="hidden min-w-0 flex-1 sm:block">
          <p className="truncate font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
            {locality}
            {bhk ? ` · ${formatBhk(bhk)}` : ""}
          </p>
          <p className="truncate text-[1.0625rem] font-semibold leading-tight text-ink" data-numeric>
            {priceOnRequest ? "Price on request" : formatPrice(price)}
          </p>
        </div>

        {/* On a phone the price sits inline with the buttons instead. */}
        <p
          className="shrink-0 text-[1.0625rem] font-semibold leading-none text-ink sm:hidden"
          data-numeric
        >
          {priceOnRequest ? "On request" : formatPrice(price)}
        </p>

        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
          <div className="hidden sm:block">
            <ShortlistButton slug={slug} title={title} />
          </div>

          <a
            href={telLink(site.contact.phoneE164)}
            className="inline-flex flex-1 items-center justify-center gap-2 border border-ink/20 px-3.5 py-2.5 font-semibold text-[0.6875rem] tracking-[0.12em] text-ink uppercase transition-colors hover:border-ink hover:bg-ink hover:text-bone sm:flex-none sm:px-5"
          >
            <Phone className="size-3.5 shrink-0" strokeWidth={1.9} aria-hidden />
            Call
          </a>

          <a
            href={whatsappLink(site.contact.whatsapp, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 bg-verdant px-3.5 py-2.5 font-semibold text-[0.6875rem] tracking-[0.12em] text-paper uppercase transition-colors hover:bg-ink sm:flex-none sm:px-5"
          >
            <MessageCircle className="size-3.5 shrink-0" strokeWidth={1.9} aria-hidden />
            WhatsApp
          </a>

          <a
            href="#enquire"
            className="hidden items-center justify-center gap-2 bg-ink px-5 py-2.5 font-semibold text-[0.6875rem] tracking-[0.12em] text-bone uppercase transition-colors hover:bg-brass-deep lg:inline-flex"
          >
            Enquire
          </a>
        </div>
      </div>
    </div>
  );
}
