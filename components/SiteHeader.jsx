"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import { isIntroDone, onIntroDone } from "@/lib/intro-state";

const EASE = [0.76, 0, 0.24, 1];

// Admin / utility routes where the header would get in the way.
const HIDDEN_PREFIXES = ["/login", "/blog/create", "/blog/edit"];

// Google Drive direct-download URL for the résumé PDF.
const RESUME_URL =
  "https://drive.google.com/uc?export=download&id=14e4ZxTUuAw0Xs6lieYDKiNrKS_zhpJ-i";

const NAV_LINKS = [
  { label: "Blog",   href: "/blog" },
  { label: "Resume", href: RESUME_URL, download: true },
];

/** Local time in Gurgaon (IST) — the small "alive" detail jurors love. */
function LocalClock({ className = "" }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {time ? `GGN, IN — ${time}` : "GGN, IN"}
    </span>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  // Stay hidden while the home preloader plays; drop in once it has exited.
  // Sub-pages (no preloader) reveal immediately.
  const [revealed, setRevealed] = useState(
    () => isIntroDone() || pathname !== "/"
  );

  useEffect(() => onIntroDone(() => setRevealed(true)), []);

  if (HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) {
    return null;
  }

  return (
    <header
      className="fixed inset-x-0 top-0 z-[110] border-b border-white/10 bg-black"
      style={{ visibility: revealed ? "visible" : "hidden" }}
    >
      <motion.div
        initial={revealed ? "show" : "hidden"}
        animate={revealed ? "show" : "hidden"}
        variants={{
          hidden: { y: prefersReducedMotion ? 0 : -8, opacity: 0 },
          show: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.55, ease: EASE, delay: 0.1 },
          },
        }}
        className="flex items-center justify-between px-[clamp(1.25rem,3vw,3rem)] text-white"
        style={{ height: "var(--site-header-h)" }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="font-heading text-base font-medium tracking-tight text-white transition-opacity duration-200 hover:opacity-60 md:text-lg"
        >
          Abhinav Yadav
        </Link>

        {/* Right side: clock + nav links */}
        <div className="flex items-center gap-6">
          <LocalClock className="hidden font-body text-[0.7rem] font-medium uppercase tracking-[0.22em] text-white/50 md:block" />

          <nav className="flex items-center gap-1" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const linkClass = `relative px-3 py-1.5 font-body text-[0.7rem] font-semibold uppercase tracking-[0.22em] transition-colors duration-200 text-white/55 hover:text-white`;

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
                    className={linkClass}
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
                  className={`relative px-3 py-1.5 font-body text-[0.7rem] font-semibold uppercase tracking-[0.22em] transition-colors duration-200 ${
                    isActive ? "text-white" : "text-white/55 hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-3 right-3 h-px bg-[#00ff99]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.div>
    </header>
  );
}
