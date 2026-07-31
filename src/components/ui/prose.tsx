import Link from "next/link";
import Markdown from "markdown-to-jsx";
import { cn } from "@/lib/utils";

/**
 * Renders CMS markdown paragraphs (string[]) safely — raw HTML parsing is
 * disabled, internal links use the router, external links open safely.
 */
export function Prose({
  paragraphs,
  tone = "light",
  className,
}: {
  paragraphs: string[];
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "space-y-5 text-[15px] leading-[1.85] sm:text-base",
        dark ? "text-ivory/75" : "text-charcoal/75",
        className,
      )}
    >
      {paragraphs.map((paragraph, i) => (
        <Markdown
          key={i}
          options={{
            disableParsingRawHTML: true,
            forceBlock: true,
            overrides: {
              a: { component: SafeLink },
              h2: {
                props: {
                  className: cn(
                    "heading-3 pt-4 first:pt-0",
                    dark ? "text-ivory" : "text-charcoal",
                  ),
                },
              },
              h3: {
                props: {
                  className: cn(
                    "pt-2 text-lg font-bold tracking-tight",
                    dark ? "text-ivory" : "text-charcoal",
                  ),
                },
              },
              strong: {
                props: {
                  className: cn("font-bold", dark ? "text-ivory" : "text-charcoal"),
                },
              },
              ul: { props: { className: "list-disc space-y-1.5 pl-5" } },
              ol: { props: { className: "list-decimal space-y-1.5 pl-5" } },
              blockquote: {
                props: {
                  className: "border-l-2 border-gold pl-4 italic",
                },
              },
            },
          }}
        >
          {paragraph}
        </Markdown>
      ))}
    </div>
  );
}

function SafeLink({
  href = "",
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const className =
    "font-semibold text-bronze underline decoration-gold/50 underline-offset-4 transition-colors hover:text-charcoal hover:decoration-gold";
  const safe = /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(href) ? href : "#";
  if (safe.startsWith("/") || safe.startsWith("#")) {
    return (
      <Link href={safe} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={safe}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </a>
  );
}
