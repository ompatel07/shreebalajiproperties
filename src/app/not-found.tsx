import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { budgetBands, localities, propertyTypes } from "@/config/site";

/**
 * 404.
 *
 * Because `/[city]/[[...facets]]` is a root-level catch-all, every
 * unrecognised path lands here — including a mistyped locality or a facet
 * combination we do not generate. So this page is a wayfinding surface rather
 * than an apology: popular localities, budgets and types are all one click
 * away, which recovers the visit instead of ending it.
 */
export default function NotFound() {
  return (
    <div className="pt-16 lg:pt-[4.75rem]">
      <div className="relative overflow-hidden border-b border-rule bg-sand">
        <div className="jaali absolute inset-0" aria-hidden />

        <div className="shell relative py-20 lg:py-28">
          <p className="eyebrow">Error 404</p>

          <h1 className="display-tight mt-5 max-w-3xl font-display text-h1 text-ink">
            This address does not exist.
          </h1>

          <p className="mt-6 max-w-xl text-lead text-ink-muted">
            The page may have been taken down, or the link may have a typo in
            it. Either way, here is the way back to the things people usually
            want.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/" size="lg">
              Back to the homepage
            </ButtonLink>
            <ButtonLink href="/properties" variant="outline" size="lg">
              Browse all listings
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost" size="lg">
              Ask us directly
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Wayfinding */}
      <div className="shell py-14">
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          <Column
            title="Popular localities"
            links={localities
              .filter((l) => l.featured)
              .map((l) => ({ href: `/${l.city}/${l.slug}`, label: l.name }))}
          />
          <Column
            title="By configuration"
            links={[1, 2, 3, 4, 5].map((n) => ({
              href: `/ahmedabad/${n}-bhk-flats`,
              label: `${n} BHK Flats`,
            }))}
          />
          <Column
            title="By budget"
            links={budgetBands.map((b) => ({
              href: `/ahmedabad/${b.slug}`,
              label: b.label,
            }))}
          />
          <Column
            title="By type"
            links={propertyTypes
              .slice(0, 6)
              .map((t) => ({ href: `/ahmedabad/${t.slug}`, label: t.name }))}
          />
        </div>
      </div>
    </div>
  );
}

function Column({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-4 border-b border-rule pb-3 font-semibold text-micro tracking-[0.12em] text-brass uppercase">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="link-draw text-[0.9375rem] text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
