import { Reveal } from "@/components/motion/Reveal";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import type { Homepage } from "@/types/content";

/** Slim gold-accented newsletter band above the footer. */
export function NewsletterSection({
  newsletter,
}: {
  newsletter: Homepage["newsletter"];
}) {
  return (
    <section className="border-y border-gold/30 bg-gold-soft/25 py-16 sm:py-20">
      <div className="container-site">
        <Reveal className="mx-auto flex max-w-4xl flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <p className="eyebrow">Newsletter</p>
            <h2 className="heading-3 mt-3 text-2xl sm:text-3xl">
              {newsletter.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {newsletter.body}
            </p>
          </div>
          <div className="w-full max-w-sm">
            <NewsletterForm tone="light" />
            {newsletter.disclaimer ? (
              <p className="mt-3 text-xs text-muted-foreground">
                {newsletter.disclaimer}
              </p>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
