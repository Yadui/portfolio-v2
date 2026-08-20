"use client";

import { useEffect } from "react";
import { getLenis } from "@/lib/smooth-scroll";
import { IntroContext } from "@/lib/intro-context";

/**
 * HomeClient — keeps the interactive home sections in a client boundary.
 * All SEO-critical content (header, sections, JSON-LD) lives in the Server
 * Component (app/page.jsx) and is delivered in the initial HTML to crawlers.
 *
 * The former full-screen greeting preloader intentionally no longer blocks the
 * first view. The hero is the loading state: it is rendered immediately and
 * the context stays complete so downstream sections do not park underneath a
 * curtain.
 */
export default function HomeClient({ children }) {
  useEffect(() => {
    getLenis()?.start();
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }, []);

  return (
    <IntroContext.Provider value={true}>
      {children}
    </IntroContext.Provider>
  );
}
