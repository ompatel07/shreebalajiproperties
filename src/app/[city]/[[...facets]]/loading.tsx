import { PropertyCardSkeleton } from "@/components/property/PropertyCard";

/**
 * Streamed while a facet page resolves.
 *
 * Mirrors the real page's geometry — masthead block, filter rail, 12-card
 * grid — so there is no layout shift when the content lands. A spinner would
 * tell the visitor nothing; a skeleton of the right shape tells them what is
 * coming and makes the wait feel shorter than it is.
 */
export default function Loading() {
  return (
    <div className="pt-16 lg:pt-[4.75rem]">
      <header className="border-b border-rule bg-sand">
        <div className="shell py-10 lg:py-14">
          <div className="shimmer h-2.5 w-56 rounded-[1px]" />
          <div className="shimmer mt-6 h-11 w-full max-w-2xl rounded-[1px]" />
          <div className="shimmer mt-4 h-4 w-full max-w-3xl rounded-[1px]" />
          <div className="shimmer mt-2 h-4 w-2/3 max-w-xl rounded-[1px]" />
        </div>
      </header>

      <div className="shell grid gap-10 py-10 lg:grid-cols-[15rem_1fr] lg:gap-12 lg:py-14">
        <div className="hidden space-y-6 lg:block">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div className="shimmer h-2 w-24 rounded-[1px]" />
              <div className="mt-3 space-y-2">
                {[0, 1, 2, 3].map((j) => (
                  <div key={j} className="shimmer h-7 w-full rounded-[1px]" />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="min-w-0">
          <div className="mb-7 flex items-center justify-between border-b border-rule pb-5">
            <div className="shimmer h-3 w-32 rounded-[1px]" />
            <div className="shimmer h-9 w-36 rounded-[1px]" />
          </div>

          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
