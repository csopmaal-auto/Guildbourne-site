"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { CoverImage } from "@/components/ui/media";
import { daysUntil } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { Offer } from "@/types/content";

/** Promotional card with optional live countdown chip. */
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

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden bg-charcoal text-ivory transition-all duration-500 hover:shadow-[0_24px_50px_-20px_rgba(28,27,24,0.5)]",
        className,
      )}
    >
      <div className={cn("media-zoom relative", large ? "min-h-56 flex-1" : "h-40")}>
        <CoverImage
          src={offer.image || undefined}
          alt=""
          sizes={large ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 100vw"}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/35 to-charcoal/10" />
        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
          {offer.badge ? (
            <span className="bg-gold px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-charcoal uppercase">
              {offer.badge}
            </span>
          ) : null}
          <CountdownChip validUntil={offer.validUntil} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        {storeName ? (
          <p className="text-[10px] font-bold tracking-[0.22em] text-gold uppercase">
            {storeName}
          </p>
        ) : null}
        <h3
          className={cn(
            "mt-1.5 font-bold tracking-tight",
            large ? "text-2xl sm:text-3xl" : "text-xl",
          )}
        >
          {offer.title}
        </h3>
        {offer.excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ivory/65">
            {offer.excerpt}
          </p>
        ) : null}
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[11px] font-semibold tracking-[0.22em] text-gold uppercase transition-colors group-hover:text-gold-soft focus-gold"
        >
          <span className="link-underline pb-0.5">
            {offer.cta.label || "Find out more"}
          </span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
          <span className="absolute inset-0" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

/** Hydration-safe "Ends in N days" chip. */
function CountdownChip({ validUntil }: { validUntil: string }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    if (!validUntil) return;
    setDays(daysUntil(validUntil));
  }, [validUntil]);

  if (!validUntil || days === null || days < 0) return null;
  return (
    <span className="inline-flex items-center gap-1 bg-charcoal/80 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-ivory/90 uppercase backdrop-blur-sm">
      <Clock className="size-3" aria-hidden />
      {days === 0 ? "Ends today" : days === 1 ? "Ends tomorrow" : `Ends in ${days} days`}
    </span>
  );
}
