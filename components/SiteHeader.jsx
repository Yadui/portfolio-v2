"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

import { getLenis } from "@/lib/smooth-scroll";
import { curvePaths } from "@/lib/curve";
import { isIntroDone, onIntroDone } from "@/lib/intro-state";
import { socialLinks, contactLinks } from "@/data/siteContent";

const EASE = [0.76, 0, 0.24, 1];

const MENU_LINKS = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Blog", href: "/blog" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL_ICONS = {
  github: <FaGithub />,
  linkedin: <FaLinkedinIn />,
  twitter: <FaXTwitter />,
};

// Admin / utility routes where the floating chrome would get in the way.
const HIDDEN_PREFIXES = ["/login", "/blog/create", "/blog/edit"];

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
      {time ? `GGN, IN — ${time} IST` : "GGN, IN"}
    </span>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [panelSize, setPanelSize] = useState({ width: 0, height: 0 });
  const firstLinkRef = useRef(null);

  // Stay hidden while the home preloader plays; drop in once it has exited.
  // Sub-pages (no preloader) reveal immediately.
  const [revealed, setRevealed] = useState(
    () => isIntroDone() || pathname !== "/"
  );

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => onIntroDone(() => setRevealed(true)), []);

  // Measure for the SVG curve on the panel's leading edge.
  useEffect(() => {
    const measure = () =>
      setPanelSize({ width: window.innerWidth, height: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Close on route change.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Scroll lock + Escape + initial focus while the menu is open.
  useEffect(() => {
    if (!isOpen) return undefined;

    const lenis = getLenis();
    lenis?.stop();
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    const focusTimer = window.setTimeout(() => {
      firstLinkRef.current?.focus({ preventScroll: true });
    }, 450);

    return () => {
      html.style.overflow = prevOverflow;
      lenis?.start();
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, close]);

  if (HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) {
    return null;
  }

  const { width } = panelSize;
  // Liquid leading edge: flat when parked, bulges mid-slide, settles flat.
  const { flat: flatPath, bulge: bulgePath } = curvePaths(width);

  const panelVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        enter: { opacity: 1, transition: { duration: 0.25 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        initial: { y: "-100%" },
        enter: { y: "0%", transition: { duration: 0.8, ease: EASE } },
        exit: {
          y: "-100%",
          transition: { duration: 0.65, ease: EASE, delay: 0.08 },
        },
      };

  const curveVariants = {
    initial: { d: flatPath },
    enter: {
      d: [flatPath, bulgePath, flatPath],
      transition: { duration: 0.9, ease: EASE, times: [0, 0.5, 1] },
    },
    exit: {
      d: [flatPath, bulgePath, flatPath],
      transition: { duration: 0.75, ease: EASE, times: [0, 0.5, 1] },
    },
  };

  const rowVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        enter: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { y: "115%" },
        enter: (index) => ({
          y: "0%",
          transition: { duration: 0.6, ease: EASE, delay: 0.32 + index * 0.06 },
        }),
        exit: { y: "115%", transition: { duration: 0.3, ease: EASE } },
      };

  const metaVariants = {
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
    enter: (index) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE, delay: 0.55 + index * 0.07 },
    }),
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const email = contactLinks.find((link) => link.type === "email");

  return (
    <>
      {/* Fixed masthead — opaque black bar, always full-opacity background.
          Only the content fades/slides on first reveal so the bg never
          goes transparent and bleeds the section behind it. */}
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
          <Link
            href="/"
            onClick={close}
            className="font-heading text-base font-medium tracking-tight text-white transition-opacity duration-200 hover:opacity-60 md:text-lg"
          >
            Abhinav Yadav
          </Link>

          <div className="flex items-center gap-6">
            <LocalClock className="hidden font-body text-[0.7rem] font-medium uppercase tracking-[0.22em] text-white/60 md:block" />

            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-expanded={isOpen}
              aria-controls="site-menu"
              className="group flex items-center gap-3 text-white"
            >
              <span className="font-body text-[0.7rem] font-semibold uppercase tracking-[0.28em]">
                {isOpen ? "Close" : "Menu"}
              </span>
              <span className="relative block h-3 w-7" aria-hidden="true">
                <span
                  className={`absolute left-0 top-0 block h-[1.5px] w-full bg-current transition-all duration-300 ${
                    isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : ""
                  } group-hover:w-3/4`}
                />
                <span
                  className={`absolute bottom-0 left-0 block h-[1.5px] w-full bg-current transition-all duration-300 ${
                    isOpen ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </motion.div>
      </header>

      {/* Full-screen overlay menu — paper panel with a liquid curve edge. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            variants={panelVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="fixed inset-0 z-[105] bg-[#f5f1e8] text-[#101828]"
          >
            {width > 0 && !prefersReducedMotion && (
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-full h-[320px] w-full"
                viewBox={`0 0 ${width} 320`}
                preserveAspectRatio="none"
              >
                <motion.path
                  variants={curveVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  fill="#f5f1e8"
                />
              </svg>
            )}

            <nav
              aria-label="Primary"
              className="flex h-full flex-col justify-between px-[clamp(1.25rem,3vw,3rem)] pb-10 pt-28 md:pb-14"
            >
              <ul className="flex flex-col">
                {MENU_LINKS.map((item, index) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname?.startsWith(item.href);
                  return (
                    <li
                      key={item.href}
                      className="overflow-hidden border-b border-[#101828]/10"
                    >
                      <motion.div
                        custom={index}
                        variants={rowVariants}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                      >
                        <Link
                          ref={index === 0 ? firstLinkRef : undefined}
                          href={item.href}
                          onClick={close}
                          className="group flex items-baseline gap-4 py-[clamp(0.5rem,1.6vh,1rem)] outline-none md:gap-6"
                        >
                          <span className="font-body text-[0.7rem] font-semibold tracking-[0.3em] text-[#101828]/40 transition-colors duration-300 group-hover:text-[#00b86b] group-focus-visible:text-[#00b86b]">
                            0{index + 1}
                          </span>
                          <span className="relative font-heading text-[clamp(2.4rem,7.5vh,4.6rem)] font-light leading-[1.02] tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3 group-focus-visible:translate-x-3">
                            {item.label}
                            {isActive && (
                              <span
                                aria-hidden="true"
                                className="absolute -right-6 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#00ff99]"
                              />
                            )}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <motion.div
                  custom={0}
                  variants={metaVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className="flex flex-col gap-1"
                >
                  <span className="font-body text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#101828]/40">
                    Get in touch
                  </span>
                  {email && (
                    <a
                      href={email.href}
                      className="font-heading text-lg tracking-tight transition-colors duration-200 hover:text-[#00b86b] md:text-xl"
                    >
                      {email.value}
                    </a>
                  )}
                </motion.div>

                <motion.div
                  custom={1}
                  variants={metaVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className="flex items-center gap-5"
                >
                  <span className="flex items-center gap-2 font-body text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#101828]/60">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff99] opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00c97e]" />
                    </span>
                    Open to work
                  </span>
                  <span className="h-4 w-px bg-[#101828]/15" aria-hidden="true" />
                  <ul className="flex items-center gap-4">
                    {socialLinks.map((social) => (
                      <li key={social.type}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.type}
                          className="block text-lg text-[#101828]/70 transition-all duration-200 hover:-translate-y-0.5 hover:text-[#101828]"
                        >
                          {SOCIAL_ICONS[social.type]}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
