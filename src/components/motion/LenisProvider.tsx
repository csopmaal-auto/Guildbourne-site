"use client";

/**
 * Lenis smooth scroll, driven by the GSAP ticker and kept in sync with
 * ScrollTrigger. Disabled entirely for users who prefer reduced motion.
 */
import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true,
    });

    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", update);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // reducedMotion="user" makes every framer-motion animation respect the OS setting.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
