"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Header from "@/components/Header";
import Projects from "@/components/Projects";
import Achievements from "@/components/Achievements";
import Contact from "@/components/Contact";
import Timeline from "@/components/Timeline";
import Skills from "@/components/Skills";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const rootRef = useRef(null);
  const projectsSectionRef = useRef(null);
  const projectsSurfaceRef = useRef(null);
  const cardRefs = useRef([]);
  const spacerRefs = useRef([]);

  const sectionLayers = [
    {
      key: "hero",
      node: (
        <Header
          disableScrollTransition
          projectsSectionRef={projectsSectionRef}
          projectsSurfaceRef={projectsSurfaceRef}
        />
      ),
    },
    {
      key: "projects",
      node: (
        <Projects
          projectsSectionRef={projectsSectionRef}
          projectsSurfaceRef={projectsSurfaceRef}
        />
      ),
    },
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
