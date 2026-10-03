import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Clock } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { EnquiryForm } from "@/components/property/EnquiryForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { guideBySlug, guides } from "@/content/guides";
import { site } from "@/config/site";
import { formatDate } from "@/lib/format";
import { absoluteUrl } from "@/config/site";
import { ORG_ID, breadcrumbSchema, faqSchema, pageMeta } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug.get(slug);

  if (!guide) {
    return pageMeta({
      title: `Guide not found | ${site.name}`,
      description: "This guide does not exist.",
      path: `/guides/${slug}`,
      index: false,
    });
  }

  return pageMeta({
    title: `${guide.metaTitle} | ${site.name}`,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    type: "article",
    publishedAt: guide.updated,
  });
}

/**
 * Guide detail.
 *
 * Emits `Article` schema alongside `FAQPage`, which is the combination that
 * earns both the article treatment and the accordion rich result. The author
 * is the organisation rather than a person — honest, since this is the firm's
 * institutional knowledge rather than one named writer's byline.
 */
export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guideBySlug.get(slug);

  if (!guide) notFound();

  const trail = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.title, path: `/guides/${guide.slug}` },
  ];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.metaTitle,
    description: guide.description,
    datePublished: guide.updated,
    dateModified: guide.updated,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/guides/${guide.slug}`),
    },
    articleSection: guide.category,
    inLanguage: "en-IN",
  };

  const related = guide.related
    .map((s) => guideBySlug.get(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(guide.faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />

      <div className="pt-16 lg:pt-[4.75rem]">
        {/* ══ Masthead ═══════════════════════════════════════════════════ */}
        <header className="border-b border-rule bg-sand">
          <div className="shell py-10 lg:py-14">
            <Breadcrumbs trail={trail} />

            <p className="eyebrow mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-brass">{guide.category}</span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3" strokeWidth={2} aria-hidden />
                {guide.readMinutes} min read
              </span>
              <span>Updated {formatDate(guide.updated)}</span>
            </p>

            <h1 className="display-tight mt-5 max-w-4xl font-display text-h1 text-ink">
              {guide.title}
            </h1>

            <p className="mt-7 max-w-2xl text-lead text-ink-muted">{guide.standfirst}</p>
          </div>
        </header>

        {/* ══ Body ═══════════════════════════════════════════════════════ */}
        <div className="shell grid gap-12 py-12 lg:grid-cols-[1fr_22rem] lg:gap-16 lg:py-16">
          <article className="min-w-0 max-w-prose">
            {guide.sections.map((section, i) => (
              <Reveal key={section.heading} delay={i * 0.03}>
                <section className="mb-14">
                  <h2 className="font-display text-h3 text-ink">{section.heading}</h2>

                  <div className="mt-5 space-y-4 text-[1.0625rem] leading-relaxed text-ink-soft">
                    {section.body.map((para, j) => (
                      <p key={j}>{para}</p>
                    ))}
                  </div>

                  {section.table && (
                    <div className="no-bar mt-7 overflow-x-auto">
                      <table className="w-full min-w-[30rem] border-collapse">
                        <caption className="mb-3 text-left font-mono text-[0.5625rem] tracking-[0.14em] text-ink-muted uppercase">
                          {section.table.caption}
                        </caption>
                        <thead>
                          <tr className="border-b border-rule-strong text-left">
                            {section.table.head.map((h, k) => (
                              <th
                                key={h}
                                scope="col"
                                className={`pb-3 font-mono text-[0.5625rem] tracking-[0.12em] font-normal text-ink-muted uppercase ${
                                  k > 0 ? "text-right" : ""
                                }`}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rule">
                          {section.table.rows.map((row, k) => (
                            <tr key={k}>
                              {row.map((cell, m) => (
                                <td
                                  key={m}
                                  className={`py-3 text-[0.9375rem] ${
                                    m === 0
                                      ? "pr-4 text-ink"
                                      : "text-right tabular-nums text-ink-soft"
                                  }`}
                                  data-numeric={m > 0 ? "" : undefined}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {section.callout && (
                    <aside className="mt-7 rounded-[2px] border border-brass/30 bg-brass-pale/40 p-6">
                      <p className="font-mono text-[0.5625rem] tracking-[0.14em] text-brass-deep uppercase">
                        {section.callout.label}
                      </p>
                      <p className="mt-2.5 leading-relaxed text-ink-soft">
                        {section.callout.text}
                      </p>
                    </aside>
                  )}
                </section>
              </Reveal>
            ))}

            {/* ── FAQ ──────────────────────────────────────────────────── */}
            <Reveal>
              <section aria-labelledby="faq">
                <h2 id="faq" className="font-display text-h3 text-ink">
                  Common questions
                </h2>
                <dl className="mt-6">
                  {guide.faqs.map((faq) => (
                    <div key={faq.q} className="border-b border-rule py-6 first:border-t">
                      <dt className="font-display text-h4 leading-snug text-ink">{faq.q}</dt>
                      <dd className="mt-3 leading-relaxed text-ink-muted">{faq.a}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </Reveal>

            {/* ── Related ──────────────────────────────────────────────── */}
            {related.length > 0 && (
              <Reveal>
                <section className="mt-14" aria-labelledby="related">
                  <h2 id="related" className="eyebrow mb-5 border-b border-rule pb-3">
                    Read next
                  </h2>
                  <ul className="space-y-3">
                    {related.map((g) => (
                      <li key={g.slug}>
                        <Link
                          href={`/guides/${g.slug}`}
                          className="group flex items-start justify-between gap-4 rounded-[2px] border border-rule bg-paper p-5 transition-all duration-400 hover:-translate-y-0.5 hover:border-rule-strong hover:shadow-[var(--shadow-lift)]"
                        >
                          <div>
                            <p className="font-mono text-[0.5rem] tracking-[0.14em] text-brass uppercase">
                              {g.category} · {g.readMinutes} min
                            </p>
                            <p className="mt-1.5 font-display text-h4 leading-snug text-ink">
                              {g.title}
                            </p>
                          </div>
                          <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full border border-rule-strong text-ink-muted transition-all duration-400 group-hover:border-brass group-hover:bg-brass group-hover:text-paper">
                            <ArrowUpRight className="size-3.5" strokeWidth={1.8} aria-hidden />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}
          </article>

          {/* ══ Sidebar ═════════════════════════════════════════════════ */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <EnquiryForm source="contact_form" compact />
          </aside>
        </div>
      </div>
    </>
  );
}
