import Link from "next/link";
import { CoverImage } from "@/components/ui/media";
import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types/content";

/**
 * News card as a mosaic tile; `featured` makes a taller hero tile. Pastel
 * blue block stands in when a story has no image.
 */
export function NewsCard({
  article,
  featured = false,
  className,
}: {
  article: NewsArticle;
  featured?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className={cn(
        "tile group focus-brand h-full text-white",
        featured ? "min-h-96 sm:min-h-[28rem]" : "min-h-72",
        className,
      )}
    >
      {article.image ? (
        <CoverImage
          src={article.image}
          alt=""
          sizes={featured ? "(min-width:1024px) 66vw, 100vw" : "(min-width:1024px) 33vw, 100vw"}
          className="absolute inset-0"
        />
      ) : (
        <span aria-hidden className="tile-pattern absolute inset-0 bg-tile-blue text-tile-blue-text" />
      )}
      <div className="tile-gradient absolute inset-0 transition-all duration-200 ease-in-out lg:group-hover:bg-backdrop">
        <span className="absolute top-4 left-4 rounded-full bg-white px-3 py-1.5 text-xs leading-none font-bold text-ink">
          {article.category || "News"}
        </span>
        <div className="tile-caption">
          <p className="text-xs font-bold text-white/80">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
          </p>
          <h3
            className={cn(
              "mt-1 transition-all duration-200 ease-in-out lg:group-hover:text-yellow",
              featured ? "heading-l" : "heading-m",
            )}
          >
            {article.title}
          </h3>
          {article.excerpt ? (
            <p className={cn("text-body mt-1", featured ? "line-clamp-3" : "line-clamp-2")}>
              {article.excerpt}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
