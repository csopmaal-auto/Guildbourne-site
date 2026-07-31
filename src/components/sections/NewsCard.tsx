import Link from "next/link";
import { CoverImage } from "@/components/ui/media";
import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types/content";

/** Editorial news card; `featured` renders the large magazine variant. */
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
        "group flex h-full flex-col focus-gold",
        featured && "lg:flex-row lg:items-stretch lg:gap-10",
        className,
      )}
    >
      <div
        className={cn(
          "media-zoom relative overflow-hidden",
          featured ? "h-64 sm:h-80 lg:h-auto lg:w-3/5" : "h-52",
        )}
      >
        <CoverImage
          src={article.image || undefined}
          alt=""
          sizes={featured ? "(min-width:1024px) 60vw, 100vw" : "(min-width:1024px) 33vw, 100vw"}
          className="absolute inset-0"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-charcoal/0 transition-colors duration-500 group-hover:bg-charcoal/10"
        />
      </div>
      <div className={cn("flex flex-1 flex-col pt-5", featured && "lg:justify-center lg:pt-0")}>
        <p className="flex items-center gap-2.5 text-[10px] font-bold tracking-[0.22em] text-bronze uppercase">
          {article.category}
          <span aria-hidden className="h-px w-6 bg-gold/60" />
          <time dateTime={article.date} className="font-semibold text-muted-foreground">
            {formatDate(article.date)}
          </time>
        </p>
        <h3
          className={cn(
            "mt-2.5 font-bold tracking-tight text-charcoal transition-colors group-hover:text-bronze",
            featured ? "text-2xl leading-tight sm:text-3xl lg:text-4xl" : "text-lg leading-snug",
          )}
        >
          {article.title}
        </h3>
        {article.excerpt ? (
          <p
            className={cn(
              "mt-2.5 leading-relaxed text-muted-foreground",
              featured ? "line-clamp-3 text-base" : "line-clamp-2 text-[13px]",
            )}
          >
            {article.excerpt}
          </p>
        ) : null}
        <span className="link-underline mt-4 w-fit pb-0.5 text-[11px] font-semibold tracking-[0.22em] text-bronze uppercase">
          Read the story
        </span>
      </div>
    </Link>
  );
}
