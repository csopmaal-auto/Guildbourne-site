import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { PageHeader as PageHeaderContent } from "@/types/content";

/**
 * The charcoal intro band inner pages open with — sits under the fixed
 * transparent header and gives every page a composed, premium opening.
 */
export function PageHeader({
  content,
  children,
  className,
}: {
  content: PageHeaderContent;
  /** Optional extras rendered under the intro (filters, meta rows…). */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "bg-charcoal bg-grain pt-36 pb-14 text-ivory sm:pt-44 sm:pb-20",
        className,
      )}
    >
      <div className="container-site">
        <Reveal>
          {content.eyebrow ? (
            <p className="eyebrow-light">{content.eyebrow}</p>
          ) : null}
          <h1 className="heading-1 mt-4 max-w-3xl">{content.heading}</h1>
          {content.intro ? (
            <p className="lead mt-5 max-w-2xl text-ivory/70">{content.intro}</p>
          ) : null}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
