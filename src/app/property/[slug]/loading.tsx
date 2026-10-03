/**
 * Streamed while a listing resolves. Matches the detail page's gallery
 * mosaic and two-column body so the layout does not jump.
 */
export default function Loading() {
  return (
    <div className="pt-16 lg:pt-[4.75rem]">
      <div className="shell py-5">
        <div className="shimmer h-2.5 w-72 rounded-[1px]" />
      </div>

      {/* Gallery mosaic */}
      <div className="shell grid gap-2 lg:grid-cols-[1.9fr_1fr]">
        <div className="shimmer aspect-[4/3] lg:aspect-auto lg:min-h-[32rem]" />
        <div className="grid grid-cols-4 gap-2 lg:grid-cols-2 lg:grid-rows-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="shimmer aspect-square" />
          ))}
        </div>
      </div>

      <div className="shell grid gap-10 py-12 lg:grid-cols-[1fr_22rem] lg:gap-14 xl:grid-cols-[1fr_24rem]">
        <div className="min-w-0">
          <div className="shimmer h-6 w-40 rounded-[1px]" />
          <div className="shimmer mt-5 h-12 w-full max-w-2xl rounded-[1px]" />
          <div className="shimmer mt-3 h-4 w-72 rounded-[1px]" />

          <div className="mt-8 border-y border-rule py-7">
            <div className="shimmer h-10 w-48 rounded-[1px]" />
            <div className="shimmer mt-3 h-3 w-64 rounded-[1px]" />
          </div>

          <div className="mt-12 grid grid-cols-2 gap-px bg-rule sm:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-paper px-4 py-4">
                <div className="shimmer h-2 w-16 rounded-[1px]" />
                <div className="shimmer mt-2 h-5 w-20 rounded-[1px]" />
              </div>
            ))}
          </div>

          <div className="mt-12 space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer h-4 w-full rounded-[1px]" />
            ))}
          </div>
        </div>

        <div className="shimmer h-[30rem] rounded-[1px]" />
      </div>
    </div>
  );
}
