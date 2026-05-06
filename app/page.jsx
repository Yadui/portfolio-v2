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
import ImageRailShowcase from "@/components/ImageRailShowcase";

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
    {
      key: "monitor",
      node: (
        <section
          id="monitor"
          className="relative flex min-h-screen w-full items-center bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.22),transparent_22%),linear-gradient(180deg,#050816_0%,#0f172a_100%)] px-6 py-16 text-white md:px-10"
        >
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 py-6 md:gap-10">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">
                Monitor
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
                The live showcase now sits inside the portfolio.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/68 md:text-base">
                The rail is embedded here as part of the main site instead of only living on its isolated showcase route.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(8,12,20,0.78)] p-3 shadow-[0_28px_120px_rgba(0,0,0,0.48)] backdrop-blur-sm md:p-4">
              <div className="mb-3 flex items-center gap-2 px-2 text-white/45 md:mb-4">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-[11px] font-medium uppercase tracking-[0.28em] text-white/38">
                  Portfolio Monitor
                </span>
              </div>

              <div className="h-[56vh] min-h-[360px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#f8f4eb]">
                <ImageRailShowcase
                  enableWheel={false}
                  title="Portfolio monitor showcase"
                />
              </div>
            </div>
          </div>
        </section>
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
