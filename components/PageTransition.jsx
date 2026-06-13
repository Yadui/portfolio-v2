"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

import { curvePaths, CURVE_HEIGHT } from "@/lib/curve";

const EASE = [0.76, 0, 0.24, 1];

/**
 * Route-change veil sharing the site's liquid-curve identity: on every
 * NAVIGATION a paper panel covers the viewport and slides up, its trailing
 * edge bulging then settling flat — the same motion as the preloader exit
 * and the overlay menu.
 *
 * The veil is skipped entirely on the very first mount: the home page has
 * its own preloader, and racing a second animation under it reads as a
 * glitch. Only client-side route changes animate.
 */
const PageTransition = ({ children }) => {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [width, setWidth] = useState(0);

  // No veil for the first committed route — but once the user has navigated
  // anywhere, every route (including back to the landing one) animates.
  const initialPathRef = useRef(pathname);
  const hasNavigatedRef = useRef(false);
  if (pathname !== initialPathRef.current) {
    hasNavigatedRef.current = true;
  }
  const isInitialRoute = !hasNavigatedRef.current;

  useEffect(() => {
    const measure = () => setWidth(window.innerWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const paths = curvePaths(width);

  const veil = prefersReducedMotion
    ? {
        initial: { opacity: 1 },
        animate: {
          opacity: 0,
          transition: { duration: 0.35, ease: "easeInOut" },
        },
      }
    : {
        initial: { y: 0 },
        animate: {
          y: "-100%",
          transition: { duration: 0.75, ease: EASE, delay: 0.08 },
        },
      };

  const curve = {
    initial: { d: paths.flat },
    animate: {
      d: [paths.flat, paths.bulge, paths.flat],
      transition: { duration: 0.85, ease: EASE, times: [0, 0.5, 1], delay: 0.08 },
    },
  };

  return (
    <AnimatePresence>
      <div key={pathname}>
        {!isInitialRoute && (
          <motion.div
            variants={veil}
            initial="initial"
            animate="animate"
            className="pointer-events-none fixed inset-0 z-[100] bg-[#f5f1e8]"
            aria-hidden="true"
          >
            {width > 0 && !prefersReducedMotion && (
              <svg
                className="pointer-events-none absolute left-0 top-full w-full"
                style={{ height: CURVE_HEIGHT + 20 }}
                viewBox={`0 0 ${width} ${CURVE_HEIGHT + 20}`}
                preserveAspectRatio="none"
              >
                <motion.path
                  variants={curve}
                  initial="initial"
                  animate="animate"
                  fill="#f5f1e8"
                />
              </svg>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </AnimatePresence>
  );
};

export default PageTransition;
