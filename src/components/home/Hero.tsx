import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck } from "lucide-react";

import { HeroSearch } from "@/components/home/HeroSearch";
import { RevealLines } from "@/components/motion/Reveal";
import {
  featuredLocalities,
  localityCount,
  zoneLabels,
  type Locality,
} from "@/config/site";
import { localityImage, unsplash } from "@/lib/imagery";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HERO — search-first
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Why there is barely a photograph above the fold ─────────────────────
 * Two earlier versions led with a big picture: a dark full-bleed overlay,
 * then a bright split with the photo in its own column. Both were rejected,
 * and the reason is the same in each case — a decorative photograph is a
 * brochure gesture. It tells a buyer nothing and it costs the fold.
 *
 * This is the portal pattern instead: say what the site has, give one large
 * search, then show the places as photographs you can actually click. Every
 * pixel above the fold is now either a fact or a control.
 *
 * ── The area tiles are the real hero ────────────────────────────────────
 * They are the only imagery, and they earn it: each one is a real locality
 * with a live count, linking to a canonical indexable landing page. That
 * makes them useful to a buyer ("how much is there in Bopal?"), useful for
 * ranking (six internal links to facet pages from the homepage), and honest
 * — the number under each name comes from the database, not from copy.
 *
 * Counts arrive as props from the page, which already queries them for other
 * sections; fetching them again here would double the round trips.
 */
export function Hero({
  liveCount,
  localityCounts,
}: {
  /** Total published listings. */
  liveCount: number;
  /** locality slug → number of live listings. */
  localityCounts: Record<string, number>;
}) {
  // Busiest featured areas first. An area tile reading "0 homes" is worse
  // than no tile, so anything empty drops out rather than being padded.
  const tiles: Locality[] = [...featuredLocalities]
    .sort((a, b) => (localityCounts[b.slug] ?? 0) - (localityCounts[a.slug] ?? 0))
    .filter((l) => (localityCounts[l.slug] ?? 0) > 0)
    .slice(0, 6);

  const shortcuts = [
    { label: "2 BHK", href: "/ahmedabad/2-bhk-flats" },
    { label: "3 BHK", href: "/ahmedabad/3-bhk-flats" },
    { label: "Ready to move in", href: "/ahmedabad/ready-to-move" },
    { label: "Under ₹50 Lakh", href: "/ahmedabad/under-50-lakh" },
    { label: "Villas", href: "/ahmedabad/villas" },
    { label: "New launches", href: "/ahmedabad/new-launch" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-bone pt-16 lg:pt-[4.75rem]">
      {/* ══ Backdrop ═══════════════════════════════════════════════════════
          Four layers, all decorative, all behind the type.

          The page was reading as a flat sheet of ivory with a search box on
          it. The fix is depth, not darkness — the brand is bright on purpose,
          so a photograph here is washed almost to the background colour and
          does the job a paper stock does: you feel it before you notice it.

          Order matters. Photograph, then the ivory veil that mutes it, then
          the drafting grid and jaali on top of the veil so they stay crisp
          rather than being dulled along with the picture.
          ════════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        {/* 1. Architectural geometry. Desaturated and at 14% it reads as
              texture, not as a building — which also means it makes no claim
              about being a local project. */}
        <Image
          src={unsplash("1486406146926-c627a92ad1ab", 1800, 52)}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-[0.2] grayscale"
        />

        {/* 2. The veil, shaped rather than flat.
              A uniform wash muted the photograph everywhere, including the
              wide empty margins either side of the centred column — which is
              exactly where the page looked bare. So the ivory is opaque in an
              ellipse behind the type and opens up towards the edges: the
              headline stays on clean ground, and the margins get texture
              instead of nothing. */}
        <div className="absolute inset-0 bg-gradient-to-b from-bone via-bone/45 to-bone" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_56%_50%_at_50%_40%,var(--color-bone)_0%,var(--color-bone)_55%,transparent_100%)]" />

        {/* 3. Two diffuse blooms, warm and cool, so the ground has a gradient
              rather than a single flat tint. */}
        <div className="absolute -top-56 left-1/2 size-[52rem] -translate-x-1/2 rounded-full bg-brass-pale/55 blur-[150px]" />
        <div className="absolute -bottom-40 -left-32 size-[34rem] rounded-full bg-forest-pale/70 blur-[130px]" />

        {/* 4. Drafting grid and the jaali lattice — the two pieces of house
              vernacular. Masked so neither runs rules across the headline. */}
        <div className="blueprint absolute inset-0 opacity-[0.35] [mask-image:linear-gradient(to_bottom,transparent,black_55%,transparent)]" />
        <div className="jaali absolute -top-24 -right-24 size-[28rem] [mask-image:radial-gradient(circle_at_70%_30%,black,transparent_70%)]" />
        <div className="jaali absolute -bottom-28 -left-28 size-[24rem] [mask-image:radial-gradient(circle_at_30%_70%,black,transparent_70%)]" />
      </div>

      <div className="shell relative">
        {/* ── The claim ───────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl pt-9 text-center lg:pt-12">
          <p data-reveal="" className="eyebrow mb-4 text-brass">
            Ahmedabad &amp; Gandhinagar
          </p>

          <h1 className="display-tight font-display text-[clamp(2.25rem,4.8vw,3.875rem)] leading-[1.04] text-ink">
            <RevealLines
              lines={[
                "Find a home in Ahmedabad",
                <span key="claim">
                  <em className="display-wonk text-brass">you actually want.</em>
                </span>,
              ]}
              delay={0.1}
            />
          </h1>

          <p
            data-reveal=""
            style={{ ["--reveal-delay" as string]: "420ms" }}
            className="mx-auto mt-5 max-w-xl text-lead text-ink-muted"
          >
            <span data-numeric className="font-semibold text-ink">
              {liveCount}
            </span>{" "}
            properties across{" "}
            <span data-numeric className="font-semibold text-ink">
              {localityCount}
            </span>{" "}
            areas. Search below, or just tell us what you need.
          </p>
        </div>

        {/* ── The control. The widest thing on the page, by intent. ───── */}
        <div
          data-reveal=""
          style={{ ["--reveal-delay" as string]: "540ms" }}
          className="relative z-20 mx-auto mt-8 max-w-5xl [&>form]:shadow-[var(--shadow-float)]"
        >
          <HeroSearch />
        </div>

        {/* ── One-tap shortcuts, for people who will not use a dropdown ─ */}
        <div
          data-reveal=""
          style={{ ["--reveal-delay" as string]: "620ms" }}
          className="mx-auto mt-5 flex max-w-5xl flex-wrap items-center justify-center gap-2"
        >
          {shortcuts.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-full border border-rule-strong bg-paper px-3.5 py-1.5 text-[0.8125rem] font-medium text-ink-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-bone"
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* ── Reassurance. Three facts, no adjectives. ────────────────── */}
        <ul
          data-reveal=""
          style={{ ["--reveal-delay" as string]: "680ms" }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5"
        >
          {[
            "Every listing checked",
            "No charge to buyers",
            "One advisor, start to finish",
          ].map((claim) => (
            <li
              key={claim}
              className="flex items-center gap-2 text-[0.8125rem] font-medium text-ink-soft"
            >
              <BadgeCheck className="size-4 shrink-0 text-verdant" strokeWidth={2} aria-hidden />
              {claim}
            </li>
          ))}
        </ul>

        {/* ── Areas, as photographs you can click ─────────────────────── */}
        {tiles.length > 0 && (
          <div className="pt-10 pb-14 lg:pt-12 lg:pb-20">
            <div
              data-reveal=""
              className="mb-5 flex flex-wrap items-baseline justify-between gap-3"
            >
              <p className="eyebrow">Where people are buying</p>
              <Link
                href="/localities"
                className="group inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-brass"
              >
                <span className="link-draw">All {localityCount} areas</span>
                <ArrowRight
                  className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </div>

            <div
              data-reveal-group=""
              className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6"
            >
              {tiles.map((l, i) => {
                const count = localityCounts[l.slug] ?? 0;

                return (
                  <Link
                    key={l.slug}
                    href={`/${l.city}/${l.slug}`}
                    className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-sand"
                  >
                    <Image
                      src={localityImage(l.slug, 520)}
                      alt=""
                      fill
                      /* The first row is above the fold on a laptop. */
                      priority={i < 3}
                      sizes="(min-width: 1024px) 17vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover grayscale transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-105"
                    />
                    {/* ── Duotone ────────────────────────────────────────
                        Six unrelated stock photographs side by side read as
                        a grab-bag — a glass tower next to a New England
                        cottage next to a Spanish villa. Desaturating and
                        pushing them all through one brand colour makes them
                        a deliberate set instead, and it survives the client
                        swapping in their own photos later. */}
                    <div
                      className="absolute inset-0 bg-forest/75 mix-blend-multiply"
                      aria-hidden
                    />
                    {/* Deep enough for white type at the foot, clear at the top. */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent"
                      aria-hidden
                    />

                    <div className="absolute inset-x-0 bottom-0 p-3.5">
                      <p className="text-[0.9375rem] leading-tight font-semibold text-bone">
                        {l.name}
                      </p>
                      <p className="mt-0.5 text-[0.75rem] text-bone/75">
                        <span data-numeric>{count}</span>{" "}
                        {count === 1 ? "home" : "homes"}
                      </p>
                    </div>

                    <span
                      className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-bone/90 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    >
                      <ArrowUpRight className="size-3.5" strokeWidth={2.2} />
                    </span>

                    {/* Zone is useful orientation for someone new to the city. */}
                    <span className="sr-only">
                      {zoneLabels[l.zone]}, {count} listings
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
