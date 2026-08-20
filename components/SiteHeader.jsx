"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.76, 0, 0.24, 1];

// Admin / utility routes where the header would get in the way.
const HIDDEN_PREFIXES = ["/login", "/blog/create", "/blog/edit"];

// Google Drive direct-download URL for the résumé PDF.
const RESUME_URL =
  "https://drive.google.com/uc?export=download&id=14e4ZxTUuAw0Xs6lieYDKiNrKS_zhpJ-i";

const NAV_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Resume", href: RESUME_URL, download: true },
];

/**
 * SiteHeader — a floating pill in the top-right corner.
 *
 * On the home page the pill stays hidden until the hero load sequence has
 * finished. That is driven by the `intro-running` class, which an inline
 * script in the root layout sets before first paint (so the pill never
 * flashes) and the hero clears when its timeline completes.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  if (HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) {
    return null;
  }

  return (
    <header className="site-header fixed right-0 top-0 z-[110] p-[clamp(0.85rem,2vw,1.5rem)]">
      <motion.nav
        aria-label="Primary"
        initial="show"
        animate="show"
        variants={{
          hidden: { y: prefersReducedMotion ? 0 : -8, opacity: 0 },
          show: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.55, ease: EASE, delay: 0.1 },
          },
        }}
        className="site-header-pill"
      >
        {NAV_LINKS.map((link) => {
          // Download links (e.g. résumé) open/download directly — plain
          // <a>, not a Next route.
          if (link.download) {
            return (
              <a
                key={link.label}
                href={link.href}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="site-header-link"
              >
                {link.label}
              </a>
            );
          }

          const isActive = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className="site-header-link"
              data-active={isActive ? "true" : "false"}
            >
              {link.label}
            </Link>
          );
        })}
      </motion.nav>
    </header>
  );
}
