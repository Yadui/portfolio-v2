"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Preloader from "@/components/Preloader";
import { getLenis } from "@/lib/smooth-scroll";
import { isIntroDone, markIntroDone } from "@/lib/intro-state";
import { IntroContext } from "@/lib/intro-context";

/**
 * HomeClient — owns the preloader lifecycle only.
 * All SEO-critical content (header, sections, JSON-LD) lives in the Server
 * Component (app/page.jsx) and is delivered in the initial HTML to crawlers.
 *
 * Provides IntroContext so child client components (e.g. Projects) can gate
 * entrance animations on `introComplete` without requiring prop-drilling
 * through the server component tree.
 */
export default function HomeClient({ children }) {
  const [isIntroActive, setIsIntroActive] = useState(() => !isIntroDone());
  const [introComplete, setIntroComplete] = useState(() => isIntroDone());

  // Lock scroll until the preloader's slide-up finishes.
  useEffect(() => {
    if (introComplete) return undefined;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    getLenis()?.stop();
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      getLenis()?.start();
    };
  }, [introComplete]);

  return (
    <IntroContext.Provider value={introComplete}>
      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          setIntroComplete(true);
          markIntroDone();
        }}
      >
        {isIntroActive && (
          <Preloader onComplete={() => setIsIntroActive(false)} />
        )}
      </AnimatePresence>
      {children}
    </IntroContext.Provider>
  );
}
