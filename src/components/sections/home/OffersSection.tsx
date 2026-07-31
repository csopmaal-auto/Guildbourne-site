import { SectionHeading } from "@/components/ui/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { OfferCard } from "@/components/sections/OfferCard";
import { getStore } from "@/lib/content";
import type { Offer, SectionHeading as SectionHeadingContent } from "@/types/content";

/** Asymmetric offers grid: one tall feature + a stacked pair. */
export function OffersSection({
  heading,
  offers,
}: {
  heading: SectionHeadingContent;
  offers: Offer[];
}) {
  if (offers.length === 0) return null;
  const [first, ...rest] = offers.slice(0, 3);

  return (
    <section className="bg-ivory py-24 sm:py-32">
      <div className="container-site">
        <SectionHeading content={heading} ctaHref="/offers" />
        <RevealGroup className="grid gap-6 lg:grid-cols-2">
          <RevealItem className="h-full">
            <OfferCard
              offer={first}
              storeName={first.store ? getStore(first.store)?.name : undefined}
              large
              className="h-full"
            />
          </RevealItem>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {rest.map((offer) => (
              <RevealItem key={offer.slug}>
                <OfferCard
                  offer={offer}
                  storeName={offer.store ? getStore(offer.store)?.name : undefined}
                />
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
