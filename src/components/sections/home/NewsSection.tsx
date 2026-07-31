import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { NewsCard } from "@/components/sections/NewsCard";
import { Separator } from "@/components/ui/separator";
import type { NewsArticle, SectionHeading as SectionHeadingContent } from "@/types/content";

/** Magazine layout: one featured story, then a two-up row. */
export function NewsSection({
  heading,
  articles,
}: {
  heading: SectionHeadingContent;
  articles: NewsArticle[];
}) {
  if (articles.length === 0) return null;
  const [featured, ...rest] = articles.slice(0, 3);

  return (
    <section className="bg-ivory py-24 sm:py-32">
      <div className="container-site">
        <SectionHeading content={heading} ctaHref="/news" />
        <Reveal>
          <NewsCard article={featured} featured />
        </Reveal>
        {rest.length ? (
          <>
            <Separator className="my-12 bg-charcoal/10" />
            <RevealGroup className="grid gap-10 sm:grid-cols-2">
              {rest.map((article) => (
                <RevealItem key={article.slug}>
                  <NewsCard article={article} />
                </RevealItem>
              ))}
            </RevealGroup>
          </>
        ) : null}
      </div>
    </section>
  );
}
