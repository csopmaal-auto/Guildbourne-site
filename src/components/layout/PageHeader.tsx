import { cn } from "@/lib/utils";
import type { PageHeader as PageHeaderContent } from "@/types/content";

/**
 * Inner-page opener in the reference language: white space, big friendly
 * display heading, quiet grey intro — sitting below the absolute header.
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
    <section className={cn("bg-white pt-32 pb-10 sm:pt-36", className)}>
      <div className="container-site">
        <h1 className="heading-xl max-w-3xl text-ink lg:text-[2.75rem] lg:leading-[1.09]">
          {content.heading}
        </h1>
        {content.intro ? (
          <p className="text-body-l mt-4 max-w-2xl text-ink-soft">{content.intro}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
