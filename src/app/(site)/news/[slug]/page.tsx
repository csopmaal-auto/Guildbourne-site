import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
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
      <header className="bg-charcoal bg-grain pt-32 pb-12 text-ivory sm:pt-40 sm:pb-16">
        <div className="container-site">
          <Reveal>
            <nav aria-label="Breadcrumb">
              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.22em] text-ivory/60 uppercase transition-colors hover:text-gold focus-gold"
              >
                <ArrowLeft className="size-3.5" aria-hidden /> News & stories
              </Link>
            </nav>
            <p className="mt-8 flex items-center gap-3 text-[11px] font-bold tracking-[0.22em] text-gold uppercase">
              {article.category}
              <span aria-hidden className="h-px w-8 bg-gold/50" />
              <time dateTime={article.date} className="font-semibold text-ivory/60">
                {formatDate(article.date)}
              </time>
            </p>
            <h1 className="heading-1 mt-4 max-w-4xl">{article.title}</h1>
            {article.excerpt ? (
              <p className="lead mt-5 max-w-2xl text-ivory/70">{article.excerpt}</p>
            ) : null}
          </Reveal>
        </div>
      </header>

      <div className="bg-ivory py-16 sm:py-20">
        <div className="container-narrow">
          {article.image ? (
            <Reveal className="mb-10">
              <CoverImage
                src={article.image}
                alt=""
                sizes="(min-width:768px) 48rem, 100vw"
                className="aspect-[16/9]"
              />
            </Reveal>
          ) : null}
          <Reveal>
            <Prose paragraphs={article.body} />
          </Reveal>
        </div>
      </div>

      {related.length ? (
        <section className="bg-stone py-16 sm:py-20">
          <div className="container-site">
            <Reveal className="mb-10">
              <p className="eyebrow">Keep reading</p>
              <h2 className="heading-2 mt-3">More from the journal</h2>
            </Reveal>
            <RevealGroup className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <RevealItem key={a.slug}>
                  <NewsCard article={a} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      <Script
        id={`ld-article-${article.slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Script
        id={`ld-breadcrumb-article-${article.slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
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
