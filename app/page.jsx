"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";

import Preloader from "@/components/Preloader";
import BlogButton from "@/components/BlogButton";
import Projects from "@/components/Projects";
import Achievements from "@/components/Achievements";
import Contact from "@/components/Contact";
import Timeline from "@/components/Timeline";
import Skills from "@/components/Skills";

gsap.registerPlugin(ScrollTrigger);

const SITE_URL = "https://abhinav.maoverse.xyz";

// ProfilePage structured data for the homepage. It ties back to the Person
// entity declared site-wide in the root layout (#person), which is the
// recommended pattern for a personal portfolio's main page.
const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profilepage`,
  url: SITE_URL,
  name: "Abhinav Yadav — Software Engineer & Creative Developer",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#person` },
  mainEntity: { "@id": `${SITE_URL}/#person` },
  inLanguage: "en-US",
};

const Home = () => {
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const spacerRefs = useRef([]);

  // Words preloader plays first; when it finishes, the panel slides up to
  // reveal the Projects section (now the first real section on the page).
  const [isIntroActive, setIsIntroActive] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  // Lock scrolling and keep the viewport at the top until the intro's slide-up
  // reveal has fully finished, so it lands exactly on the Projects section.
  useEffect(() => {
    if (introComplete) return undefined;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [introComplete]);

  // After the intro reveal finishes, recalculate the pinned-section metrics so
  // the stacked scroll is accurate from the very first scroll on Projects.
  useEffect(() => {
    if (!introComplete) return;
    ScrollTrigger.refresh();
  }, [introComplete]);

  const sectionLayers = [
    { key: "projects", node: <Projects /> },
    { key: "achievements", node: <Achievements /> },
    { key: "timeline", node: <Timeline /> },
    { key: "skills", node: <Skills /> },
    { key: "contact", node: <Contact /> },
  ];
  const lastSectionIndex = sectionLayers.length - 1;

  // Each section is pinned (sticky h-screen). While pinned, its inner content
  // translates upward so the user reads the section's FULL content within the
  // fixed viewport. Only after the content is fully revealed (+ a small linger)
  // does the next section rise from below and stack over the current one.
  useGSAP(
    () => {
      const LINGER_VH = 0.45; // extra dwell after content fully shown
      const triggers = [];
      const observers = [];

      cardRefs.current.forEach((sectionEl, index) => {
        if (!sectionEl) return;
        const inner = sectionEl.querySelector("[data-stack-inner]");
        const spacer = spacerRefs.current[index];
        if (!inner) return;

        const measure = () => {
          const vh = window.innerHeight;
          // scrollHeight is unaffected by transforms — measures natural content size.
          const contentH = inner.scrollHeight;
          const scrollDist = Math.max(0, contentH - vh);
          const lingerPx = vh * LINGER_VH;
          if (spacer) {
            spacer.style.height = `${scrollDist + lingerPx}px`;
          }
          return scrollDist;
        };

        measure();

        const tween = gsap.fromTo(
          inner,
          { y: 0 },
          {
            y: () => -measure(),
            ease: "none",
            scrollTrigger: {
              trigger: sectionEl,
              start: "top top",
              end: () => `+=${Math.max(1, measure())}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);

        const ro = new ResizeObserver(() => {
          measure();
          ScrollTrigger.refresh();
        });
        ro.observe(inner);
        observers.push(ro);
      });

      return () => {
        triggers.forEach((t) => t?.kill());
        observers.forEach((o) => o.disconnect());
      };
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="stacked-scroll-site relative isolate bg-[radial-gradient(circle_at_top_left,rgba(0,255,153,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,191,115,0.2),transparent_24%),linear-gradient(180deg,#fffdf8_0%,#f3efe6_100%)]"
    >
      {/* Crawlable, screen-reader-only intro. Gives search engines and assistive
          tech a clear, text-based summary of the page, independent of the
          animated preloader and scrambled hero headings. */}
      <header className="sr-only">
        <h1>Abhinav Yadav — Software Engineer &amp; Creative Developer</h1>
        <p>
          Portfolio of Abhinav Yadav, a software engineer and creative developer
          building cloud, AI, and full-stack web applications with React,
          Next.js, and Azure. Explore featured projects, achievements, skills,
          and writing.
        </p>
        {/* Internal links so crawlers can reach every key page from the
            homepage (the visual Nav is not rendered on this route, and the
            Timeline's case-study links live inside animated markup). */}
        <nav aria-label="Primary">
          <ul>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/resume">Résumé</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <p>Work experience case studies:</p>
          <ul>
            <li><Link href="/work/foetron">Foetron — Cloud and AI Engineer</Link></li>
            <li><Link href="/work/outlier">Outlier — Prompt Engineer</Link></li>
            <li><Link href="/work/vmcoders">Vm Coders — Frontend Developer</Link></li>
          </ul>
        </nav>
      </header>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageJsonLd) }}
      />

      <AnimatePresence mode="wait" onExitComplete={() => setIntroComplete(true)}>
        {isIntroActive && (
          <Preloader onComplete={() => setIsIntroActive(false)} />
        )}
      </AnimatePresence>

      {/* Floating Blog button — z-110 keeps it beneath the preloader (z-120)
          so it stays hidden until the intro panel slides up to reveal it. */}
      <BlogButton />

      {sectionLayers.map((section, index) => {
        const isLast = index === lastSectionIndex;
        return (
          <div key={section.key} className="contents">
            {/* Full-bleed section pinned to the viewport. Inner content
                translates upward (via GSAP) so the section's full content
                scrolls within this fixed-height window before the next
                section rises from below. */}
            <section
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className="sticky top-0 h-screen w-full overflow-hidden"
              style={{
                // Later siblings paint on top — each new sticky section
                // covers the previous one as it rises into view.
                zIndex: 10 + index,
              }}
            >
              <div
                data-stack-inner
                className="w-full will-change-transform"
              >
                {section.node}
              </div>
            </section>
            {/* Dynamic spacer: its height = (contentHeight - viewportHeight)
                + linger, so the section pins long enough to scroll all of
                its content, then waits, then the next section rises. */}
            {!isLast ? (
              <div
                ref={(node) => {
                  spacerRefs.current[index] = node;
                }}
                aria-hidden="true"
                className="w-full"
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default Home;
