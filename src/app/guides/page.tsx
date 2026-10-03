import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { guides } from "@/content/guides";
import { site } from "@/config/site";
import { formatDate } from "@/lib/format";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Property Buying Guides for Ahmedabad | ${site.name}`,
  description:
    "Plain-language guides to buying property in Ahmedabad and Gandhinagar — carpet versus built-up area, verifying a project on GujRERA, our full diligence checklist, and an honest assessment of GIFT City.",
  path: "/guides",
});

/**
 * Guides index.
 *
 * Deliberately small. Four guides that answer the questions buyers actually
 * ask, rather than thirty thin posts written for a keyword. The long-tail SEO
 * value comes from each one being genuinely the best answer on the page, not
 * from volume.
 */
export default function GuidesPage() {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />

      <div className="pt-16 lg:pt-[4.75rem]">
        <header className="border-b border-rule bg-sand">
          <div className="shell py-10 lg:py-16">
            <Breadcrumbs trail={trail} />

            <h1 className="display-tight mt-6 max-w-4xl font-display text-h1 text-ink">
              The things we end up{" "}
              <em className="display-wonk text-brass">explaining on every call.</em>
            </h1>

            <p className="mt-7 max-w-2xl text-lead text-ink-muted">
              Written down properly, so you can read them before you speak to
              anyone — including us. No email gate, no download form.
            </p>
          </div>
        </header>

        <div className="shell py-12 lg:py-16">
          <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2" stagger={0.08}>
            {guides.map((guide) => (
              <RevealItem as="li" key={guide.slug}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="group flex h-full flex-col rounded-[2px] border border-rule bg-paper p-7 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-rule-strong hover:shadow-[var(--shadow-raise)] lg:p-8"
                >
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[0.5625rem] tracking-[0.14em] uppercase">
                    <span className="text-brass">{guide.category}</span>
                    <span className="flex items-center gap-1.5 text-ink-faint">
                      <Clock className="size-2.5" strokeWidth={2.2} aria-hidden />
                      {guide.readMinutes} min
                    </span>
                  </p>

                  <h2 className="mt-4 font-display text-h3 leading-snug text-ink">
                    <span className="link-draw">{guide.title}</span>
                  </h2>

                  <p className="mt-4 flex-1 leading-relaxed text-ink-muted">
                    {guide.standfirst}
                  </p>

                  <div className="mt-7 flex items-center justify-between gap-3 border-t border-rule pt-5">
                    <span className="font-mono text-[0.5rem] tracking-[0.12em] text-ink-faint uppercase">
                      Updated {formatDate(guide.updated)}
                    </span>
                    <span className="grid size-9 place-items-center rounded-full border border-rule-strong text-ink-muted transition-all duration-400 group-hover:border-brass group-hover:bg-brass group-hover:text-paper">
                      <ArrowUpRight className="size-4" strokeWidth={1.8} aria-hidden />
                    </span>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </>
  );
}
