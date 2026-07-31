import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { SectionHeading as SectionHeadingContent } from "@/types/content";

/**
 * The recurring section header: gold eyebrow, display heading, optional
 * intro and a quiet "view all" link aligned to the baseline.
 */
export function SectionHeading({
  content,
  ctaHref,
  tone = "light",
  align = "left",
  className,
}: {
  content: SectionHeadingContent;
  ctaHref?: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <Reveal
      className={cn(
        "mb-10 sm:mb-14",
        align === "center" && "text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-end justify-between gap-x-8 gap-y-4",
          align === "center" && "flex-col items-center",
        )}
      >
        <div className={cn("max-w-2xl", align === "center" && "text-center")}>
          {content.eyebrow ? (
            <p className={dark ? "eyebrow-light" : "eyebrow"}>{content.eyebrow}</p>
          ) : null}
          <h2
            className={cn(
              "heading-2 mt-3",
              dark ? "text-ivory" : "text-charcoal",
            )}
          >
            {content.heading}
          </h2>
          {content.intro ? (
            <p className={cn("lead mt-4", dark && "text-ivory/70")}>
              {content.intro}
            </p>
          ) : null}
        </div>
        {ctaHref && content.ctaLabel ? (
          <Link
            href={ctaHref}
            className={cn(
              "link-underline group inline-flex items-center gap-1.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.22em] focus-gold",
              dark ? "text-gold" : "text-bronze",
            )}
          >
            {content.ctaLabel}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : null}
      </div>
    </Reveal>
  );
}
