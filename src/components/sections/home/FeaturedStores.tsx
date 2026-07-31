"use client";

/**
 * Featured stores — a scroll-snap carousel with elegant arrow controls.
 * No carousel library: native scrolling keeps it light and touch-perfect.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { StoreCard } from "@/components/sections/StoreCard";
import { cn } from "@/lib/utils";
import type { SectionHeading as SectionHeadingContent, Store } from "@/types/content";

export function FeaturedStores({
  heading,
  stores,
}: {
  heading: SectionHeadingContent;
  stores: Store[];
}) {
  const track = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const updateArrows = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 8,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 8,
    });
  }, []);

  useEffect(() => {
    updateArrows();
    const el = track.current;
    el?.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el?.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (stores.length === 0) return null;

  return (
    <section className="bg-stone py-24 sm:py-32">
      <div className="container-site">
        <SectionHeading content={heading} ctaHref="/stores" />
      </div>

      <RevealGroup className="relative">
        <div
          ref={track}
          data-lenis-prevent
          className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pb-2 sm:px-8 lg:px-[max(3rem,calc((100vw-85rem)/2+3rem))]"
        >
          {stores.map((store) => (
            <RevealItem
              key={store.slug}
              className="w-[78vw] shrink-0 snap-start sm:w-80"
            >
              <div data-card className="h-full">
                <StoreCard store={store} className="h-full" />
              </div>
            </RevealItem>
          ))}
        </div>

        {/* Arrows */}
        <div className="container-site mt-8 flex items-center justify-between">
          <div className="hairline-gold" aria-hidden />
          <div className="flex gap-2">
            <CarouselArrow
              direction="left"
              disabled={!canScroll.left}
              onClick={() => scrollBy(-1)}
            />
            <CarouselArrow
              direction="right"
              disabled={!canScroll.right}
              onClick={() => scrollBy(1)}
            />
          </div>
        </div>
      </RevealGroup>
    </section>
  );
}

function CarouselArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Previous stores" : "More stores"}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full border border-charcoal/20 text-charcoal transition-all focus-gold",
        disabled
          ? "opacity-30"
          : "hover:border-bronze hover:bg-charcoal hover:text-ivory",
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
