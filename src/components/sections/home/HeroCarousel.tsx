"use client";

/**
 * The sticky left hero — a full-height rounded panel with cross-fading
 * slides (reference behaviour: 500ms fade with a 200ms delay, caption
 * bottom-left with yellow display headline + pill CTA, dot pagination).
 * Auto-advances every 6s; pauses for reduced-motion users.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/content";

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="relative flex h-svh overflow-hidden lg:h-[calc(100vh-3rem)] lg:rounded-xxl">
      {slides.map((slide, i) => {
        const current = i === active;
        return (
          <div
            key={i}
            aria-hidden={!current}
            className={cn(
              "group absolute inset-0 transition-all delay-200 duration-500 lg:rounded-xxl",
              current ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {slide.image ? (
              <Image
                src={slide.image}
                alt=""
                fill
                priority={i === 0}
                sizes="(min-width:1024px) 45vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-sand" />
            )}
            {/* Scrims: soft top (wordmark legibility) + bottom (caption legibility) */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink/70 lg:rounded-b-xxl"
            />
            <div
              className={cn(
                "absolute bottom-20 px-7 sm:bottom-24 lg:bottom-40 lg:px-12",
                current && "animate-fade-caption",
              )}
            >
              <h1 className="heading-xl mb-3 text-yellow lg:mb-2">
                {slide.headline}
              </h1>
              {slide.subheadline ? (
                <p className="text-body mb-5 text-white lg:mb-8 lg:text-base">
                  {slide.subheadline}
                </p>
              ) : null}
              {slide.cta.label ? (
                <Link href={slide.cta.href || "/"} className="pill-button focus-brand">
                  {slide.cta.label}
                </Link>
              ) : null}
            </div>
          </div>
        );
      })}

      {/* Dots */}
      {slides.length > 1 ? (
        <ul className="absolute right-0 bottom-8 left-0 z-10 flex w-full justify-center gap-3 lg:bottom-10">
          {slides.map((slide, i) => (
            <li key={i}>
              <button
                type="button"
                aria-label={`Show slide ${i + 1}: ${slide.headline}`}
                aria-current={i === active}
                onClick={() => setActive(i)}
                className={cn(
                  "size-2.5 rounded-full transition-all duration-300 focus-brand",
                  i === active ? "w-6 bg-yellow" : "bg-white/60 hover:bg-white",
                )}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
