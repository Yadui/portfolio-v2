"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { projects } from "@/data/projectsMenuData";
import { useIntroComplete } from "@/lib/intro-context";

import ProjectListMenu from "./ProjectListMenu";
import RevealText from "./RevealText";

const getPrimaryLink = (project) =>
  project.links.live || project.links.github || "/work";

/**
 * Work section. No heading choreography — upon arrival (each mount, and
 * only after the preloader has finished on a fresh load) the project list
 * simply fades in from below, titles rising with a light stagger.
 * Reduced-motion visitors see the final state immediately.
 */
export default function Projects({
  projectsSectionRef,
  projectsSurfaceRef,
}) {
  const introComplete = useIntroComplete();
  const rootRef = useRef(null);
  const playedRef = useRef(false);

  const menuItems = projects.map((project) => ({
    id: project.id,
    link: getPrimaryLink(project),
    text: project.title,
    image: project.image,
    category: project.category,
    workCategory: project.workCategory,
    metaText: project.stack.slice(0, 3).join(" · "),
  }));

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const rows = gsap.utils.toArray("[data-menu-row]");
      if (!rows.length) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion || playedRef.current) {
        gsap.set(rows, { y: 0, autoAlpha: 1 });
        playedRef.current = true;
        return;
      }

      // Parked: titles sit slightly sunk + hidden until the section arrives
      // (i.e. the preloader curtain has lifted).
      gsap.set(rows, { y: 36, autoAlpha: 0 });

      if (!introComplete) return;
      playedRef.current = true;

      const tl = gsap.timeline({ delay: 0.15 });
      tl.to(rows, {
        y: 0,
        autoAlpha: 1,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.03,
      });

      return () => tl.kill();
    },
    { scope: rootRef, dependencies: [introComplete] }
  );

  return (
    <section
      id="projects"
      ref={(node) => {
        rootRef.current = node;
        if (projectsSectionRef) {
          projectsSectionRef.current = node;
        }
      }}
      className="relative min-h-below-nav overflow-hidden border-y border-white/10 bg-black text-white"
    >
      <div
        ref={(node) => {
          if (projectsSurfaceRef) {
            projectsSurfaceRef.current = node;
          }
        }}
        className="relative z-10 flex min-h-below-nav flex-col gap-0"
      >
        <div className="w-full bg-black px-[clamp(1.25rem,3vw,3rem)] pt-[clamp(2.25rem,7vh,5rem)] pb-2 md:pb-3">
          {/* Heading + metadata counterweight */}
          <div className="flex items-end justify-between gap-4">
            {/* The title rises in only after the preloader curtain has lifted
                (mounting RevealText early would play it under the curtain). */}
            {introComplete ? (
              <RevealText
                as="h2"
                className="portfolio-title text-5xl uppercase text-white md:text-6xl xl:text-7xl"
              >
                WORK
              </RevealText>
            ) : (
              <h2
                aria-hidden="true"
                className="portfolio-title text-5xl uppercase text-white opacity-0 md:text-6xl xl:text-7xl"
              >
                WORK
              </h2>
            )}
            <div className="mb-1 hidden flex-col items-end gap-1 md:flex">
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-white/25">
                {menuItems.length} projects
              </span>
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-white/25">
                2022 – 2025
              </span>
            </div>
          </div>
        </div>

        <div className="relative w-full px-[clamp(1.25rem,4vw,4rem)] pb-[clamp(3rem,8vh,5.5rem)] pt-[clamp(0.5rem,2vh,1.25rem)]">
          {/* Ledger rule system — horizontal lines aligned to list rhythm */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "100% 72px",
              backgroundPosition: "0 0",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
              maskImage:
                "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          />
          <ProjectListMenu items={menuItems} />
        </div>
      </div>
    </section>
  );
}
