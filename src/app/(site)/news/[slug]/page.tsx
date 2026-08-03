import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CoverImage } from "@/components/ui/media";
import { Prose } from "@/components/ui/prose";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { NewsCard } from "@/components/sections/NewsCard";
import { getArticle, news, newsByDate, settings } from "@/lib/content";
import {
  SITE_URL,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdString,
} from "@/lib/seo";
import { formatDate } from "@/utils/format";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return news.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return {};
  return buildMetadata("/news", {
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`,
    image: article.image || undefined,
    type: "article",
  });
}

export default async function NewsArticlePage({ params }: Params) {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  const related = newsByDate.filter((a) => a.slug !== article.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    image: article.image ? [absoluteUrl(article.image)] : undefined,
    mainEntityOfPage: `${SITE_URL}/news/${article.slug}`,
    author: { "@type": "Organization", name: settings.siteName },
    publisher: { "@type": "Organization", name: settings.siteName, url: SITE_URL },
  };

  return (
    <article>
      <header className="bg-white pt-32 sm:pt-36">
        <div className="container-site">
          <Reveal>
            <nav aria-label="Breadcrumb">
              <Link
                href="/news"
                className="focus-brand inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs leading-none font-bold text-ink transition-colors hover:bg-sand"
              >
                <ArrowLeft className="size-3.5" aria-hidden /> News & stories
              </Link>
            </nav>
            <p className="mt-8 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cream px-3.5 py-1.5 text-xs leading-none font-bold text-ink">
                {article.category || "News"}
              </span>
              <time
                dateTime={article.date}
                className="text-sm font-bold text-ink-soft"
              >
                {formatDate(article.date)}
              </time>
            </p>
            <h1 className="heading-xl mt-4 max-w-4xl text-ink lg:text-[2.75rem] lg:leading-[1.09]">
              {article.title}
            </h1>
            {article.excerpt ? (
              <p className="text-body-l mt-4 max-w-2xl text-ink-soft">
                {article.excerpt}
              </p>
            ) : null}
          </Reveal>
        </div>
      </header>

      <div className="bg-white py-10 sm:py-12">
        <div className="container-narrow">
          {article.image ? (
            <Reveal className="mb-10">
              <CoverImage
                src={article.image}
                alt=""
                sizes="(min-width:768px) 48rem, 100vw"
                className="aspect-[16/9] rounded-xl"
              />
            </Reveal>
          ) : null}
          <Reveal>
            <Prose paragraphs={article.body} />
          </Reveal>
        </div>
      </div>

      {related.length ? (
        <section className="bg-cream py-12 sm:py-16">
          <div className="container-site">
            <Reveal className="mb-8">
              <h2 className="heading-l text-ink">More from the centre</h2>
            </Reveal>
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <RevealItem key={a.slug}>
                  <NewsCard article={a} className="min-h-80" />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "News", path: "/news" },
              { name: article.title, path: `/news/${article.slug}` },
            ]),
          ),
        }}
      />
    </article>
  );
}
