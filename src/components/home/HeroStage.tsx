"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Phone, Play } from "lucide-react";

import { cn } from "@/lib/utils";

export interface HeroSlide {
  /** Full image URL. */
  src: string;
  /** Short category label, e.g. "Villas & bungalows". */
  label: string;
  /** One line describing the slide. */
  caption: string;
  /** Live count for the category, if one applies. */
  count?: number;
  cta: { label: string; href: string };
  /** CSS object-position, to keep the subject in frame when cropped. */
  position?: string;
}

const INTERVAL_MS = 6500;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HERO STAGE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * A framed, crossfading slideshow — one slide per thing a buyer comes for
 * (flats, villas, ready homes, commercial, the city itself), each with a live
 * count and a one-tap route into it.
 *
 * The HEADLINE does not change per slide. An h1 that rotates is bad for
 * search and confusing for screen readers, and the promise is the same
 * whichever photo is showing; only the caption card changes.
 *
 * ── Behaving well ───────────────────────────────────────────────────────
 * • Autoplay pauses on hover, on keyboard focus inside the stage, and while
 *   the tab is hidden — and never starts for visitors who prefer reduced
 *   motion. There is also an explicit pause button (WCAG 2.2.2).
 * • Only the slides already shown, plus the next one, have their image in
 *   the DOM — and the next one is only added once the page has loaded, so on
 *   a slow phone connection it never competes with the first photo.
 * • The photos are shown in full colour. A gradient sits only under the
 *   text, on the left; the right of the frame stays bright.
 */
export function HeroStage({
  slides,
  headline,
  subline,
  phone,
}: {
  slides: HeroSlide[];
  headline: React.ReactNode;
  subline: React.ReactNode;
  phone: { href: string; label: string };
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  const stageRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (i: number) => {
      const next = (i + slides.length) % slides.length;
      setActive(next);
      // Pre-load the one after, so the crossfade never lands on a blank frame.
      setLoaded((s) => new Set(s).add(next).add((next + 1) % slides.length));
    },
    [slides.length],
  );

  // Queue slide 2 after the load event; the first rotation is 6.5s away.
  useEffect(() => {
    const queue = () => setLoaded((s) => new Set(s).add(1 % slides.length));
    if (document.readyState === "complete") queue();
    else window.addEventListener("load", queue, { once: true });
    return () => window.removeEventListener("load", queue);
  }, [slides.length]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const running = playing && !hovering && !focused && !reduced;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      if (document.visibilityState === "visible") go(active + 1);
    }, INTERVAL_MS);
    return () => clearTimeout(t);
  }, [running, active, go]);

  const slide = slides[active]!;

  return (
    <div
      ref={stageRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured property categories"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!stageRef.current?.contains(e.relatedTarget as Node)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(active + 1);
        if (e.key === "ArrowLeft") go(active - 1);
      }}
      className="relative isolate h-[clamp(540px,78vh,760px)] overflow-hidden rounded-[22px] bg-ink lg:rounded-[28px]"
    >
      {/* ── Slides ───────────────────────────────────────────────────── */}
      {slides.map((s, i) => (
        <div
          key={s.src}
          aria-hidden={i !== active}
          className={cn(
            "absolute inset-0 transition-opacity duration-[1400ms] ease-[var(--ease-editorial)]",
            i === active ? "opacity-100" : "opacity-0",
          )}
        >
          {loaded.has(i) && (
            <Image
              src={s.src}
              alt=""
              fill
              priority={i === 0}
              fetchPriority={i === 0 ? "high" : "low"}
              sizes="(min-width: 1536px) 1440px, (min-width: 1024px) 94vw, 100vw"
              style={{ objectPosition: s.position ?? "50% 50%" }}
              className={cn(
                "object-cover",
                // Slow push-in on the visible slide only; off for reduced motion.
                i === active && !reduced && "animate-[hero-zoom_9s_ease-out_forwards]",
              )}
            />
          )}
        </div>
      ))}

      {/* ── Legibility: under the text only, never a full-frame wash ───── */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.45)_45%,rgba(0,0,0,0.08)_100%)] lg:bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.55)_34%,rgba(0,0,0,0.1)_62%,transparent_80%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent lg:h-1/2 lg:from-black/45"
        aria-hidden
      />

      {/* ── Story-style progress, top ────────────────────────────────── */}
      <div className="absolute inset-x-5 top-5 z-10 flex gap-1.5 lg:inset-x-auto lg:right-8 lg:top-8 lg:w-56">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show ${s.label}`}
            aria-current={i === active}
            className="group h-6 flex-1 py-2.5"
          >
            <span className="block h-[3px] overflow-hidden rounded-full bg-white/30">
              <span
                // Re-keyed per activation so the fill animation restarts.
                key={i === active ? `on-${active}-${running}` : `off-${i}`}
                className={cn(
                  "block h-full origin-left rounded-full bg-white",
                  i < active && "scale-x-100",
                  i > active && "scale-x-0",
                  i === active &&
                    (running
                      ? "animate-[hero-progress_6500ms_linear_forwards]"
                      : "scale-x-100 opacity-70"),
                )}
              />
            </span>
          </button>
        ))}
      </div>

      {/* ── The promise ──────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-24 sm:px-8 lg:inset-y-0 lg:flex lg:max-w-[54rem] lg:flex-col lg:justify-center lg:px-14 lg:pb-20">
        <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-black/35 px-3.5 py-1.5 text-[0.75rem] font-semibold text-white ring-1 ring-white/25">
          <span className="size-1.5 rounded-full bg-brass-light" aria-hidden />
          RERA-registered channel partner · Ahmedabad
        </p>

        <h1 className="text-[clamp(2.25rem,4.7vw,4.125rem)] leading-[1.03] font-extrabold tracking-[-0.035em] text-white">
          {headline}
        </h1>

        <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-white/85 sm:text-[1.0625rem] lg:mt-5">
          {subline}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-8">
          <Link
            href="/properties"
            className="group inline-flex items-center gap-2 rounded-full bg-brass-light px-6 py-3.5 text-[0.9375rem] font-bold text-ink transition-colors hover:bg-white"
          >
            Browse all homes
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={2.4}
              aria-hidden
            />
          </Link>
          <a
            href={phone.href}
            className="inline-flex items-center gap-2 rounded-full bg-black/30 px-5 py-3.5 text-[0.9375rem] font-semibold text-white ring-1 ring-white/35 transition-colors hover:bg-white hover:text-ink"
          >
            <Phone className="size-4" strokeWidth={2.2} aria-hidden />
            {phone.label}
          </a>
        </div>
      </div>

      {/* ── Slide caption, bottom-right (desktop) ────────────────────── */}
      <div className="absolute right-8 bottom-28 z-10 hidden w-[23rem] lg:block">
        <div
          key={active}
          className="animate-[hero-caption_700ms_var(--ease-editorial)_both] rounded-2xl bg-black/55 p-5 text-white ring-1 ring-white/20"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-[0.8125rem] font-bold text-white">
              <span className="size-1.5 rounded-full bg-brass-light" aria-hidden />
              {slide.label}
            </p>
            {typeof slide.count === "number" && slide.count > 0 && (
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[0.75rem] font-bold" data-numeric>
                {slide.count} live
              </span>
            )}
          </div>
          <p className="mt-2 text-[1.0625rem] leading-snug font-semibold">{slide.caption}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Link
              href={slide.cta.href}
              className="group inline-flex items-center gap-1.5 text-[0.875rem] font-bold text-white"
            >
              {slide.cta.label}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2.4}
                aria-hidden
              />
            </Link>
            {/* Controls live in the card on desktop, so nothing floats in
                the corner where the docked search meets the frame. */}
            <div className="flex items-center gap-1.5">
              <span className="mr-1 text-[0.75rem] font-semibold text-white/70 tabular-nums" data-numeric>
                {String(active + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
              </span>
              <CtrlButton small label={playing ? "Pause slideshow" : "Play slideshow"} onClick={() => setPlaying((p) => !p)}>
                {playing ? <Pause className="size-3.5" strokeWidth={2.4} /> : <Play className="size-3.5" strokeWidth={2.4} />}
              </CtrlButton>
              <CtrlButton small label="Previous slide" onClick={() => go(active - 1)}>
                <ChevronLeft className="size-4" strokeWidth={2.4} />
              </CtrlButton>
              <CtrlButton small label="Next slide" onClick={() => go(active + 1)}>
                <ChevronRight className="size-4" strokeWidth={2.4} />
              </CtrlButton>
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="absolute right-5 bottom-[4.75rem] z-10 flex items-center gap-2 lg:hidden">
        <span className="mr-1 hidden text-[0.8125rem] font-semibold text-white/80 tabular-nums sm:inline" data-numeric>
          {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <CtrlButton label={playing ? "Pause slideshow" : "Play slideshow"} onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause className="size-4" strokeWidth={2.4} /> : <Play className="size-4" strokeWidth={2.4} />}
        </CtrlButton>
        <CtrlButton label="Previous slide" onClick={() => go(active - 1)}>
          <ChevronLeft className="size-5" strokeWidth={2.2} />
        </CtrlButton>
        <CtrlButton label="Next slide" onClick={() => go(active + 1)}>
          <ChevronRight className="size-5" strokeWidth={2.2} />
        </CtrlButton>
      </div>

      {/* Mobile: what this slide is, small, top-left under the progress. */}
      <Link
        href={slide.cta.href}
        className="absolute top-12 left-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-[0.75rem] font-semibold text-white lg:hidden"
      >
        {slide.label}
        {typeof slide.count === "number" && slide.count > 0 && (
          <span className="text-brass-light" data-numeric>· {slide.count}</span>
        )}
        <ArrowRight className="size-3" strokeWidth={2.4} aria-hidden />
      </Link>

      <p className="sr-only" aria-live="polite">
        Slide {active + 1} of {slides.length}: {slide.label}
      </p>
    </div>
  );
}

function CtrlButton({
  label,
  onClick,
  small = false,
  children,
}: {
  label: string;
  onClick: () => void;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid place-items-center rounded-full bg-black/35 text-white ring-1 ring-white/30 transition-colors hover:bg-white hover:text-ink",
        small ? "size-8" : "size-10",
      )}
    >
      {children}
    </button>
  );
}
