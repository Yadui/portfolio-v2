"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText);

/**
 * RevealText — masked line rise-up reveal (GSAP SplitText, free in 3.13+).
 *
 * Split into two distinct phases so they never interfere:
 *
 *  1. Mount (useGSAP, no deps): split the text into masked lines, park them
 *     below their overflow clips, hide the node. Stores the SplitText
 *     instance in a ref so phase 2 can always reach it.
 *
 *  2. IntersectionObserver (useEffect): when the node enters the viewport,
 *     animate the stored lines up. If fonts caused a re-split (autoSplit),
 *     the lines ref is already up-to-date via onSplit.
 *
 * Keeping the two phases separate means the split is created exactly once
 * and is never torn down while the animation is in flight.
 * prefers-reduced-motion: skip split entirely, text stays visible as-is.
 */
const RevealText = ({
  as: Tag = "span",
  children = "",
  className = "",
  style = undefined,
  duration = 1.0,
  stagger = 0.09,
  delay = 0,
  threshold = 0.25,
  ariaLabel = undefined,
}) => {
  const rootRef = useRef(null);
  const linesRef = useRef([]);
  const playedRef = useRef(false);

  // ── Phase 1: split + park (runs once on mount) ──────────────────────────
  useGSAP(
    () => {
      const node = rootRef.current;
      if (!node) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.set(node, { autoAlpha: 0 });

      const split = SplitText.create(node, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          linesRef.current = self.lines;
          gsap.set(self.lines, { yPercent: 110 });
          // If inView already fired before the (re-)split, play immediately.
          if (playedRef.current) {
            gsap.to(self.lines, {
              yPercent: 0,
              duration,
              stagger,
              ease: "expo.out",
              overwrite: true,
            });
          }
        },
      });

      gsap.set(node, { autoAlpha: 1 });
      return () => split.revert();
    },
    // No inView dependency — this block must never re-run after mount.
    { scope: rootRef, dependencies: [] }
  );

  // ── Phase 2: trigger (runs when element enters viewport) ────────────────
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || playedRef.current) return;
        playedRef.current = true;
        observer.disconnect();

        const lines = linesRef.current;
        if (!lines.length) return;

        gsap.to(lines, {
          yPercent: 0,
          duration,
          stagger,
          delay,
          ease: "expo.out",
          overwrite: true,
        });
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [duration, stagger, delay, threshold]);

  return (
    <Tag
      ref={rootRef}
      className={className}
      style={style}
      aria-label={ariaLabel ?? (typeof children === "string" ? children : undefined)}
    >
      {children}
    </Tag>
  );
};

export default RevealText;
