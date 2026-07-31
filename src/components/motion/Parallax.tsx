"use client";

/** GSAP scroll-scrubbed parallax wrapper — used on section imagery. */
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function Parallax({
  children,
  strength = 12,
  className,
}: {
  children: ReactNode;
  /** Percent of element height to travel over the scroll range. */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tween = gsap.fromTo(
      el,
      { yPercent: -strength },
      {
        yPercent: strength,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Re-sync ScrollTrigger measurements after route changes. */
export function refreshScrollTriggers(): void {
  ScrollTrigger.refresh();
}
