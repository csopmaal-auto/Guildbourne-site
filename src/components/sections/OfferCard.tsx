"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { CoverImage } from "@/components/ui/media";
import { daysUntil } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { Offer } from "@/types/content";

/**
 * Offer card as a mosaic tile — yellow pastel block (or image) with badge
 * and optional live countdown chip; title yellow-on-hover for image tiles.
 */
export function OfferCard({
  offer,
  storeName,
  large = false,
  className,
}: {
  offer: Offer;
  storeName?: string;
  large?: boolean;
  className?: string;
}) {
  const href = offer.cta.href || (offer.store ? `/stores/${offer.store}` : "/offers");
  const hasImage = Boolean(offer.image);

  return (
    <Link
      href={href}
      className={cn(
        "tile group focus-brand flex h-full flex-col",
        hasImage ? "text-white" : "bg-yellow text-ink lg:hover:brightness-95",
        large ? "min-h-96" : "min-h-72",
        className,
      )}
    >
      {hasImage ? (
        <CoverImage
          src={offer.image}
          alt=""
          sizes={large ? "(min-width:1024px) 66vw, 100vw" : "(min-width:1024px) 33vw, 100vw"}
          className="absolute inset-0"
        />
      ) : (
        <span aria-hidden className="tile-pattern absolute inset-0" />
      )}
      <div
        className={cn(
          "absolute inset-0",
          hasImage &&
            "tile-gradient transition-all duration-200 ease-in-out lg:group-hover:bg-backdrop",
        )}
      >
        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
          {offer.badge ? (
            <span
              className={cn(
                "rounded-full px-3 py-1.5 text-xs leading-none font-bold",
                hasImage ? "bg-white text-ink" : "bg-ink text-yellow",
              )}
            >
              {offer.badge}
            </span>
          ) : null}
          <CountdownChip validUntil={offer.validUntil} onImage={hasImage} />
        </div>
        <div className="tile-caption">
          {storeName ? (
            <p className={cn("text-xs font-bold", hasImage ? "text-white/80" : "text-ink/70")}>
              {storeName}
            </p>
          ) : null}
          <h3
            className={cn(
              "mt-1",
              large ? "heading-l" : "heading-m",
              hasImage &&
                "transition-all duration-200 ease-in-out lg:group-hover:text-yellow",
            )}
          >
            {offer.title}
          </h3>
          {offer.excerpt ? (
            <p
              className={cn(
                "text-body mt-1 line-clamp-3",
                !hasImage && "text-ink/80",
              )}
            >
              {offer.excerpt}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

/** Hydration-safe "Ends in N days" chip. */
function CountdownChip({
  validUntil,
  onImage,
}: {
  validUntil: string;
  onImage: boolean;
}) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    if (!validUntil) return;
    setDays(daysUntil(validUntil));
  }, [validUntil]);

  if (!validUntil || days === null || days < 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs leading-none font-bold",
        onImage ? "bg-ink/70 text-white" : "bg-white text-ink",
      )}
    >
      <Clock className="size-3" aria-hidden />
      {days === 0 ? "Ends today" : days === 1 ? "Ends tomorrow" : `Ends in ${days} days`}
    </span>
  );
}
