"use client";

import RevealText from "@/components/RevealText";
import SkillOrbits from "@/components/skills/SkillOrbits";
import { SKILL_RINGS } from "@/data/skillsData";

/**
 * Skills — a solar system.
 *
 * Each orbital ring is one skill group circling a shared centre. This
 * replaced the previous force-simulation "gas chamber" layout; the original
 * implementation is preserved at .backup-animations/Skills.tsx.
 *
 * The orbit itself is decorative and marked aria-hidden inside OrbitImages,
 * so the same inventory is also rendered as a real grouped list. That list is
 * the only skills content on narrow viewports, where a wide orbital plane
 * cannot be read, and it is available to assistive technology at every width.
 */
export default function Skills() {
  return (
    <section
      id="skills"
      className="relative flex flex-col overflow-hidden bg-black pb-[clamp(1.5rem,4vh,5rem)] text-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "86px 86px",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,0.55), transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full flex-col pt-[clamp(1.25rem,3vh,2rem)]">
        <div className="flex-shrink-0 px-[clamp(1.25rem,3vw,3rem)]">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">
            Capabilities
          </span>
          <RevealText
            as="h2"
            className="portfolio-title mt-1 text-4xl uppercase text-white md:text-5xl"
          >
            Skills
          </RevealText>
        </div>

        {/* Orbit: decorative, and only legible with room for the plane. */}
        <div className="mt-4 hidden w-full md:block">
          <SkillOrbits />
        </div>

        {/* The inventory. Visible only on narrow viewports, where the orbital
            plane cannot be read at all; screen-reader-only above that. It is
            not rendered visually on desktop by request, but it must stay in
            the document: the orbit is aria-hidden with non-focusable glyphs,
            so removing this outright would take the entire skill list off the
            page for assistive technology and for crawlers. */}
        <div className="mt-6 grid gap-x-8 gap-y-7 px-[clamp(1.25rem,3vw,3rem)] sm:grid-cols-2 md:sr-only md:mt-0">
          {SKILL_RINGS.map((ring: any) => (
            <div key={ring.id}>
              <h3 className="text-[0.62rem] font-bold uppercase tracking-[0.26em] text-white/45">
                {ring.label}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2">
                {ring.skills.map((skill: any) => (
                  <li
                    key={skill.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[0.72rem] text-white/80"
                  >
                    {skill.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={skill.img}
                        alt=""
                        aria-hidden="true"
                        className="h-3.5 w-3.5 object-contain"
                      />
                    ) : (
                      <skill.Icon
                        aria-hidden="true"
                        style={{ color: skill.color }}
                        className="h-3.5 w-3.5"
                      />
                    )}
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
