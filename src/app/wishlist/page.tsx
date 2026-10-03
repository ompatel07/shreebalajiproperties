import type { Metadata } from "next";

import { WishlistView } from "@/components/property/WishlistView";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

/** `noindex` — per-visitor state, with nothing stable to rank. */
export const metadata: Metadata = pageMeta({
  title: `My Shortlist | ${site.name}`,
  description: "The homes you have saved, ready to send to an advisor.",
  path: "/wishlist",
  index: false,
});

export default function WishlistPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Shortlist", path: "/wishlist" },
  ];

  return (
    <div className="pt-16 lg:pt-[4.75rem]">
      <header className="border-b border-rule bg-sand">
        <div className="shell py-10 lg:py-12">
          <Breadcrumbs trail={trail} />
          <h1 className="display-tight mt-6 font-display text-h2 text-ink">
            Your shortlist
          </h1>
          <p className="mt-5 max-w-2xl text-lead text-ink-muted">
            Saved on this device, no account needed. Send the list to an advisor
            whenever you want a straight opinion on which one is the better buy.
          </p>
        </div>
      </header>

      <div className="shell py-12 lg:py-16">
        <WishlistView />
      </div>
    </div>
  );
}
