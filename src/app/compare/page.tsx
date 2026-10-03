import type { Metadata } from "next";

import { CompareTable } from "@/components/property/CompareTable";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

/**
 * Compare. `noindex` — the content is whatever this visitor shortlisted, so
 * there is nothing stable to rank, and indexing it would surface an empty
 * page to searchers.
 */
export const metadata: Metadata = pageMeta({
  title: `Compare Properties | ${site.name}`,
  description:
    "Line up your shortlisted homes side by side on price, rate per sq.ft, carpet area, possession and RERA status.",
  path: "/compare",
  index: false,
});

export default function ComparePage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
  ];

  return (
    <div className="pt-16 lg:pt-[4.75rem]">
      <header className="border-b border-rule bg-sand">
        <div className="shell py-10 lg:py-12">
          <Breadcrumbs trail={trail} />
          <h1 className="display-tight mt-6 font-display text-h2 text-ink">
            Side by side
          </h1>
          <p className="mt-5 max-w-2xl text-lead text-ink-muted">
            The same facts for every home you are considering, in the same
            order, with the best value in each row marked.
          </p>
        </div>
      </header>

      <div className="shell py-12 lg:py-16">
        <CompareTable />
      </div>
    </div>
  );
}
