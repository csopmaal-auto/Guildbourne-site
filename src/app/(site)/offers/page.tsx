import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { OfferCard } from "@/components/sections/OfferCard";
import { getStore, offers, pages } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata("/offers");
export const dynamic = "force-static";

export default function OffersPage() {
  return (
    <>
      <PageHeader content={pages.offers} />
      <div className="bg-ivory py-16 sm:py-20">
        <div className="container-site">
          {offers.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              No offers right now — check back soon.
            </p>
          ) : (
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer, i) => (
                <RevealItem
                  key={offer.slug}
                  className={i === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""}
                >
                  <OfferCard
                    offer={offer}
                    storeName={offer.store ? getStore(offer.store)?.name : undefined}
                    large={i === 0}
                    className="h-full"
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </div>
    </>
  );
}
