import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SectionHeader } from "@/components/home/SectionHeader";
import { IN_COMMERCIAL, IN_HOUSES, IN_INTERIORS, IN_TOWERS, unsplash } from "@/lib/imagery";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BROWSE BY TYPE — bento
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * One large tile for flats (most of the market) and four for everything
 * else, in a bento rather than a row of equal cards — a different shape from
 * the listing grid below it, so the page does not repeat itself.
 *
 * Photos in full colour. The previous version pushed every photo through a
 * green duotone to make mismatched Western stock look like one set; with
 * real Indian photography there is nothing to hide.
 */
export function CategoryBento({ counts }: { counts: Record<string, number> }) {
  const n = (...t: string[]) => t.reduce((s, k) => s + (counts[k] ?? 0), 0);

  const tiles = [
    {
      title: "Apartments",
      sub: "2, 3 & 4 BHK flats and penthouses",
      count: n("flats", "duplex-flats", "penthouses"),
      href: "/ahmedabad/flats",
      img: IN_TOWERS[4],
      big: true,
    },
    {
      title: "Villas & bungalows",
      sub: "Independent homes",
      count: n("villas", "bungalows", "weekend-villas"),
      href: "/ahmedabad/villas",
      img: IN_HOUSES[1],
    },
    {
      title: "Ready to move",
      sub: "Possession now",
      href: "/ahmedabad/ready-to-move",
      img: IN_INTERIORS[3],
    },
    {
      title: "Commercial",
      sub: "Offices, shops, showrooms",
      count: n("offices", "shops", "showrooms", "warehouses"),
      href: "/ahmedabad/commercial-properties",
      img: IN_COMMERCIAL[1],
    },
    {
      title: "Plots & land",
      sub: "Build your own",
      count: n("plots", "farmland"),
      href: "/ahmedabad/land-properties",
      img: IN_HOUSES[2],
    },
  ];

  return (
    <section className="bg-bone pb-14 lg:pb-20">
      <div className="shell">
        <SectionHeader
          title="What are you looking for?"
          subtitle="Start with the kind of property — we will narrow it down from there."
          action={{ label: "All properties", href: "/properties" }}
        />

        <div className="mt-7 grid grid-cols-2 gap-3 lg:mt-9 lg:h-[34rem] lg:grid-cols-4 lg:grid-rows-2 lg:gap-4">
          {tiles.map((t) => (
            <Link
              key={t.title}
              href={t.href}
              className={cn(
                "group relative isolate overflow-hidden rounded-2xl bg-sand",
                t.big ? "col-span-2 aspect-[16/10] lg:row-span-2 lg:aspect-auto" : "aspect-square lg:aspect-auto",
              )}
            >
              <Image
                src={unsplash(t.img, t.big ? 1200 : 640, 76)}
                alt=""
                fill
                sizes={t.big ? "(min-width: 1024px) 48vw, 100vw" : "(min-width: 1024px) 24vw, 50vw"}
                className="-z-10 object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-105"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/15 to-transparent" aria-hidden />

              <div className="flex h-full flex-col justify-end p-4 lg:p-6">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h3
                      className={cn(
                        "leading-tight font-bold text-white",
                        t.big ? "text-[1.375rem] lg:text-[1.75rem]" : "text-[1rem] lg:text-[1.125rem]",
                      )}
                    >
                      {t.title}
                    </h3>
                    <p className="mt-0.5 truncate text-[0.8125rem] text-white/80">
                      {typeof t.count === "number" && t.count > 0 ? (
                        <>
                          <span className="font-bold text-brass-light" data-numeric>
                            {t.count}
                          </span>{" "}
                          live<span className={cn(!t.big && "hidden sm:inline")}> · {t.sub}</span>
                        </>
                      ) : (
                        t.sub
                      )}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "size-9 shrink-0 place-items-center rounded-full bg-white/90 text-ink transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                      t.big ? "grid" : "hidden sm:grid",
                    )}
                    aria-hidden
                  >
                    <ArrowUpRight className="size-4" strokeWidth={2.4} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
