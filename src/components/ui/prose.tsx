import Link from "next/link";
import Markdown from "markdown-to-jsx";
import { cn } from "@/lib/utils";

/**
 * Renders CMS markdown paragraphs (string[]) safely — raw HTML parsing is
 * disabled, internal links use the router, external links open safely.
 */
export function Prose({
  paragraphs,
  className,
}: {
  paragraphs: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-5 text-[15px] leading-[1.8] text-ink sm:text-base",
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
              h2: { props: { className: "heading-l pt-4 text-ink first:pt-0" } },
              h3: { props: { className: "heading-m pt-2 text-ink" } },
              strong: { props: { className: "font-bold text-ink" } },
              ul: { props: { className: "list-disc space-y-1.5 pl-5" } },
              ol: { props: { className: "list-decimal space-y-1.5 pl-5" } },
              blockquote: {
                props: { className: "border-l-4 border-yellow pl-4 italic" },
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
    "font-bold text-ink underline decoration-yellow decoration-2 underline-offset-4 transition-colors hover:text-ink-soft";
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
