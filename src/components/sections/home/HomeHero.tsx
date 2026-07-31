"use client";

/**
 * The full-viewport hero. GSAP timeline: slow scale-settle on the media,
 * masked word-by-word headline reveal, then eyebrow/sub/CTAs. On scroll the
 * media parallaxes and the content quietly lifts away. All initial states
 * are set inside the effect, so no-JS and reduced-motion users see the
 * finished composition.
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { Homepage } from "@/types/content";

export function HomeHero({ hero }: { hero: Homepage["hero"] }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const media = root.current?.querySelector("[data-hero-media]");
      const words = gsap.utils.toArray<HTMLElement>("[data-hero-word] > span");
      const fades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]");
      const hint = root.current?.querySelector("[data-hero-hint]");

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(
        media ?? [],
        { scale: 1.12, opacity: 0.6 },
        { scale: 1, opacity: 1, duration: 2.2, ease: "power2.out" },
        0,
      )
        .fromTo(
          words,
          { yPercent: 115 },
          { yPercent: 0, duration: 1.1, stagger: 0.07 },
          0.45,
        )
        .fromTo(
          fades,
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 },
          1.0,
        )
        .fromTo(
          hint ?? [],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.8 },
          1.5,
        );

      // Scroll: parallax the media, lift the content.
      gsap.to(media ?? [], {
        yPercent: 16,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to("[data-hero-content]", {
        yPercent: -12,
        autoAlpha: 0.2,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "40% top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, root);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const words = hero.headline.split(" ");

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-charcoal text-ivory"
    >
      {/* Media */}
      <div data-hero-media className="absolute inset-0 will-change-transform">
        {hero.mediaType === "video" && hero.videoUrl ? (
          <video
            className="size-full object-cover"
            src={hero.videoUrl}
            poster={hero.poster || undefined}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
          />
        ) : hero.image ? (
          <Image
            src={hero.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
      </div>

      {/* Overlays */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/20 to-charcoal/90"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_100%,rgba(28,27,24,0.55),transparent_60%)]"
      />

      {/* Content */}
      <div data-hero-content className="relative pt-40 pb-24 sm:pb-28">
        <div className="container-site">
          <p data-hero-fade className="eyebrow-light">
            {hero.eyebrow}
          </p>
          <h1 className="heading-display mt-5 max-w-5xl">
            {words.map((word, i) => (
              <span
                key={i}
                data-hero-word
                className="inline-block overflow-hidden pb-1 align-top"
              >
                <span className="inline-block will-change-transform">
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </h1>
          {hero.subheadline ? (
            <p data-hero-fade className="lead mt-6 max-w-xl text-ivory/75">
              {hero.subheadline}
            </p>
          ) : null}
          <div data-hero-fade className="mt-9 flex flex-wrap gap-3">
            {hero.primaryCta.label ? (
              <Button asChild variant="gold" size="xl">
                <Link href={hero.primaryCta.href || "/stores"}>
                  {hero.primaryCta.label}
                </Link>
              </Button>
            ) : null}
            {hero.secondaryCta.label ? (
              <Button asChild variant="outline-light" size="xl">
                <Link href={hero.secondaryCta.href || "/contact"}>
                  {hero.secondaryCta.label}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        data-hero-hint
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        aria-hidden
      >
        <span className="text-[9px] font-semibold tracking-[0.4em] text-ivory/60 uppercase">
          {hero.scrollLabel || "Scroll"}
        </span>
        <span className="relative h-10 w-px overflow-hidden bg-ivory/20">
          <span className="absolute inset-x-0 top-0 h-4 animate-scroll-hint bg-gold" />
        </span>
      </div>
    </section>
  );
}
