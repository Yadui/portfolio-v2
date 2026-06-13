"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { setLenis } from "@/lib/smooth-scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide inertia scrolling (Lenis) kept in perfect sync with GSAP's
 * ScrollTrigger. Lenis preserves native scroll position, so the home page's
 * `position: sticky` stacked sections keep working — only the scroll feel
 * changes.
 *
 * - Driven by gsap.ticker (single rAF for the whole site).
 * - Skipped entirely for users who prefer reduced motion.
 * - `anchors: true` smooth-scrolls same-page #hash links.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      anchors: true,
    });
    setLenis(lenis);

    const update = (time) => {
      // gsap.ticker time is in seconds; Lenis expects ms.
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
