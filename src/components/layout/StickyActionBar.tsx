"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, MessageCircle, Phone } from "lucide-react";

import { site } from "@/config/site";
import { useWishlist } from "@/components/property/wishlist-store";
import { cn, telLink, whatsappLink } from "@/lib/utils";

/**
 * Mobile contact rail.
 *
 * Most property enquiries in this market arrive by phone or WhatsApp rather
 * than by form, so on a phone those two actions stay one thumb-reach away.
 * Appears after 400px of scroll so it never covers the hero, and hides on
 * pages with their own sticky CTA or where it would obstruct the UI.
 *
 * Slides with a CSS transform rather than an animation library.
 */
export function StickyActionBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const { count } = useWishlist();

  const suppressed =
    pathname.startsWith("/studio") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/property/");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (suppressed) return null;

  const message = `Hi ${site.name}, I am looking for property in Ahmedabad. Could you help me?`;

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        // pb-safe keeps it clear of the iOS home indicator.
        "fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-rule bg-bone/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <a
        href={telLink(site.contact.phoneE164)}
        className="flex flex-col items-center gap-1 py-3 text-ink active:bg-sand"
      >
        <Phone className="size-[1.15rem]" strokeWidth={1.7} aria-hidden />
        <span className="font-semibold text-[0.6875rem] tracking-[0.14em] uppercase">Call</span>
      </a>

      <a
        href={whatsappLink(site.contact.whatsapp, message)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 border-x border-rule py-3 text-verdant active:bg-sand"
      >
        <MessageCircle className="size-[1.15rem]" strokeWidth={1.7} aria-hidden />
        <span className="font-semibold text-[0.6875rem] tracking-[0.14em] uppercase">WhatsApp</span>
      </a>

      <Link
        href="/wishlist"
        className="relative flex flex-col items-center gap-1 py-3 text-ink active:bg-sand"
      >
        <span className="relative">
          <Heart className="size-[1.15rem]" strokeWidth={1.7} aria-hidden />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-2 grid size-4 place-items-center rounded-full bg-brass font-mono text-[0.5rem] text-paper">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </span>
        <span className="font-semibold text-[0.6875rem] tracking-[0.14em] uppercase">Saved</span>
      </Link>
    </div>
  );
}
