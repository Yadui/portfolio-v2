"use client";

import { projects } from "@/data/projectsMenuData";
import ScrambledText from "@/components/ScrambledText";

import FlowingMenu from "./FlowingMenu";

const getPrimaryLink = (project) =>
  project.links.live || project.links.github || "/work";

export default function Projects({ projectsSectionRef, projectsSurfaceRef }) {
  const menuItems = projects.map((project) => ({
    id: project.id,
    link: getPrimaryLink(project),
    text: project.title,
    image: project.image,
    category: project.category,
    metaText: project.stack.slice(0, 3).join(" · "),
  }));
  const menuHeight = `max(calc(100vh - 6rem), ${menuItems.length * 96}px)`;

  return (
    <section
      id="projects"
      ref={(node) => {
        if (projectsSectionRef) {
          projectsSectionRef.current = node;
        }
      }}
      className="relative min-h-screen overflow-hidden border-y border-white/10 bg-black text-white"
    >
      <div
        ref={(node) => {
          if (projectsSurfaceRef) {
            projectsSurfaceRef.current = node;
          }
        }}
        className="relative z-10 flex min-h-screen flex-col gap-0"
      >
        <div className="w-full bg-black px-[clamp(1.25rem,3vw,3rem)] py-3 md:py-4">
          <ScrambledText
            as="h2"
            text="What I Do"
            triggerOnView
            duration={1.15}
            speed={0.7}
            className="portfolio-title text-5xl text-white md:text-6xl xl:text-7xl"
          />
        </div>

        <div className="w-full overflow-hidden border-y border-white/10 bg-[#120f17] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div style={{ height: menuHeight }}>
            <FlowingMenu
              items={menuItems}
              speed={16}
              textColor="#fffdf8"
              bgColor="#120f17"
              marqueeBgColor="#fffdf8"
              marqueeTextColor="#120f17"
              borderColor="rgba(255,255,255,0.18)"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
