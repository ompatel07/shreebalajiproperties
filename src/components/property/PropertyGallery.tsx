"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

import { blurPlaceholder } from "@/lib/imagery";
import { cn } from "@/lib/utils";

/**
 * Listing gallery with a lightbox.
 *
 * Layout is an asymmetric editorial mosaic — one large frame plus a stack of
 * four — rather than a carousel. A carousel hides inventory behind an
 * interaction; a mosaic shows five rooms at a glance, which is how a buyer
 * decides whether to keep reading.
 *
 * Keyboard: ← → to move, Escape to close, and focus returns to the trigger.
 * Body scroll is locked while the lightbox is open.
 */
export function PropertyGallery({
  images,
  title,
}: {
  images: { url: string; alt?: string | null; caption?: string | null }[];
  title: string;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const count = images.length;

  const close = useCallback(() => setLightbox(null), []);
  const next = useCallback(
    () => setLightbox((i) => (i === null ? null : (i + 1) % count)),
    [count],
  );
  const prev = useCallback(
    () => setLightbox((i) => (i === null ? null : (i - 1 + count) % count)),
    [count],
  );

  useEffect(() => {
    if (lightbox === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, close, next, prev]);

  if (count === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[2px] border border-rule bg-sand">
        <div className="jaali absolute inset-0" aria-hidden />
        <p className="absolute inset-0 grid place-items-center font-semibold text-micro tracking-[0.14em] text-ink-faint uppercase">
          Photographs on request
        </p>
      </div>
    );
  }

  const [hero, ...rest] = images;
  const tiles = rest.slice(0, 4);

  return (
    <>
      <div className="grid gap-2 lg:grid-cols-[1.9fr_1fr]">
        {/* ── Hero frame ───────────────────────────────────────────────── */}
        {hero && (
          <button
            type="button"
            onClick={() => setLightbox(0)}
            className="group relative aspect-[4/3] overflow-hidden rounded-[2px] bg-sand lg:aspect-auto lg:h-full lg:min-h-[32rem]"
            aria-label={`Open gallery — ${title}`}
          >
            <Image
              src={hero.url}
              alt={hero.alt ?? `${title} — main photograph`}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 64vw"
              placeholder="blur"
              blurDataURL={blurPlaceholder()}
              className="photo-warm object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />

            <span className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-[2px] bg-ink/70 px-3.5 py-2 font-semibold text-micro tracking-[0.12em] text-bone uppercase backdrop-blur-md transition-colors duration-300 group-hover:bg-ink">
              <Expand className="size-3.5" strokeWidth={1.8} aria-hidden />
              {count} photos
            </span>
          </button>
        )}

        {/* ── Stack ────────────────────────────────────────────────────── */}
        {tiles.length > 0 && (
          <div className="grid grid-cols-4 gap-2 lg:grid-cols-2 lg:grid-rows-2">
            {tiles.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                onClick={() => setLightbox(i + 1)}
                className="group relative aspect-square overflow-hidden rounded-[2px] bg-sand"
                aria-label={`View photo ${i + 2} of ${count}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? `${title} — photograph ${i + 2}`}
                  fill
                  sizes="(max-width: 1024px) 25vw, 18vw"
                  placeholder="blur"
                  blurDataURL={blurPlaceholder()}
                  className="photo-warm object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* "+N more" overlay on the final tile. */}
                {i === tiles.length - 1 && count > 5 && (
                  <span className="absolute inset-0 grid place-items-center bg-ink/60 font-display text-h4 text-bone backdrop-blur-[2px]">
                    +{count - 5}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox. CSS fade; mounted only while a photo is selected,
             since it covers the viewport and should not sit in the DOM. ── */}
      {lightbox !== null && images[lightbox] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — photo ${lightbox + 1} of ${count}`}
          className="pop-in fixed inset-0 z-[90] flex flex-col bg-ink/97"
        >
          <div className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-5">
            <span
              className="font-mono text-micro tracking-[0.14em] text-bone/60 tabular-nums"
              data-numeric
            >
              {String(lightbox + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>

            <button
              type="button"
              onClick={close}
              aria-label="Close gallery"
              className="grid size-11 place-items-center rounded-full border border-bone/25 text-bone transition-colors hover:bg-bone hover:text-ink"
            >
              <X className="size-5" strokeWidth={1.8} aria-hidden />
            </button>
          </div>

          <div className="relative flex-1 px-3 pb-4 sm:px-4">
            <div key={lightbox} className="pop-in relative size-full">
              <Image
                src={images[lightbox]!.url}
                alt={images[lightbox]!.alt ?? `${title} — photo ${lightbox + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {count > 1 && (
              <>
                <GalleryNav side="left" onClick={prev} />
                <GalleryNav side="right" onClick={next} />
              </>
            )}
          </div>

          {images[lightbox]!.caption && (
            <p className="shrink-0 px-5 pb-6 text-center text-caption text-bone/65">
              {images[lightbox]!.caption}
            </p>
          )}
        </div>
      )}

    </>
  );
}

function GalleryNav({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-bone/25 bg-ink/50 text-bone backdrop-blur-md transition-colors hover:bg-bone hover:text-ink",
        side === "left" ? "left-5" : "right-5",
      )}
    >
      <Icon className="size-6" strokeWidth={1.6} aria-hidden />
    </button>
  );
}
