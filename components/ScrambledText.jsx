"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText);

/**
 * ScrambledText — replaced scramble effect with a letter-by-letter rise-up
 * animation: each character slides up from below into place using GSAP
 * SplitText (chars mask), with a staggered expo ease.
 *
 * Props are intentionally kept compatible with the old ScrambledText API so
 * no call-sites need to change. Scramble-specific props (scrambleChars, speed)
 * are accepted but ignored.
 */
const ScrambledText = ({
  text = "",
  children = "",
  as = "span",
  className = "",
  style = undefined,
  duration = 1.05,
  // stagger per-char derived from duration; can be overridden
  stagger: staggerProp = undefined,
  delay = 0,
  active = true,
  triggerOnView = false,
  once = true,
  onComplete = undefined,
  // legacy scramble props — accepted but unused
  // eslint-disable-next-line no-unused-vars
  scrambleChars: _scrambleChars = undefined,
  // eslint-disable-next-line no-unused-vars
  speed: _speed = undefined,
}) => {
  const Tag = as;
  const rootRef = useRef(null);
  const [inView, setInView] = useState(!triggerOnView);
  const inViewRef = useRef(!triggerOnView);
  inViewRef.current = inView;

  const targetText = typeof text === "string" && text.length > 0
    ? text
    : typeof children === "string"
      ? children
      : String(children ?? "");

  // Stagger: spread letters evenly across ~60% of duration so the last
  // letter lands right before the tween finishes.
  const charCount = targetText.replace(/\s/g, "").length || 1;
  const stagger = staggerProp ?? Math.min(0.06, (duration * 0.6) / charCount);

  // IntersectionObserver gate (mirrors RevealText)
  useEffect(() => {
    if (!triggerOnView || !rootRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [once, triggerOnView]);

  useGSAP(
    () => {
      const node = rootRef.current;
      if (!node || !active) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Hide until IO fires so there is no flash of unsplit text.
      gsap.set(node, { autoAlpha: 0 });

      const split = SplitText.create(node, {
        type: "chars,words",
        mask: "chars",
        charsClass: "rise-char",
        autoSplit: true,
        onSplit(self) {
          // Park all chars below their mask until (or unless) in view.
          if (!inViewRef.current) {
            return gsap.set(self.chars, { yPercent: 120 });
          }

          return gsap.fromTo(
            self.chars,
            { yPercent: 120 },
            {
              yPercent: 0,
              duration,
              stagger,
              delay,
              ease: "expo.out",
              onComplete: () => onComplete?.(),
            }
          );
        },
      });

      gsap.set(node, { autoAlpha: 1 });

      return () => split.revert();
    },
    {
      scope: rootRef,
      dependencies: [active, inView, duration, stagger, delay],
    }
  );

  return (
    <Tag
      ref={rootRef}
      className={className}
      style={style}
      aria-label={targetText}
    >
      {targetText}
    </Tag>
  );
};

export default ScrambledText;
