"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { SKILL_RINGS } from "@/data/skillsData";

import OrbitImages from "./OrbitImages";

/**
 * SkillOrbits — the skills solar system.
 *
 * Each ring is one skill group, orbiting a shared centre on a common tilted
 * plane. Rings differ in radius, period and direction so the field never
 * settles into a repeating pattern.
 *
 * Layout note: OrbitImages' own `responsive` mode forces a 1:1 container,
 * which would leave a very tall box around a deliberately flat orbital plane.
 * Instead every ring is rendered at its natural design size inside one shared
 * stage that this component scales itself, so all rings stay concentric and
 * the section keeps a wide, short footprint.
 */

const BASE_WIDTH = 1400;
/** Height of the design-space stage. Much shorter than BASE_WIDTH: the plane
 *  is viewed close to edge-on, so it needs little vertical room. */
const STAGE_HEIGHT = 540;
/** Shared tilt, so every ring reads as one orbital plane rather than N rings. */
const TILT = -10;
/**
 * Vertical squash. Matches the reference proportion (radiusY / radiusX of
 * roughly 0.24): high enough to keep the rings distinct, low enough that the
 * plane reads as skewed rather than as a stack of concentric circles.
 */
const FLATTEN = 0.26;

/**
 * Inward to outward. Radial spacing is set so the rings stay clearly separated
 * at their left and right extremes, which is where a flat ellipse is read.
 * Near the top and bottom the rings sit closer together and glyphs can pass
 * one another, which is the correct behaviour for an orbital plane seen at
 * this angle rather than something to design out.
 * The outer radius plus half its itemSize stays inside BASE_WIDTH / 2 so
 * nothing is clipped by the stage.
 */
const RINGS = [
  { radiusX: 200, duration: 26, direction: "normal", itemSize: 44 },
  { radiusX: 370, duration: 38, direction: "reverse", itemSize: 46 },
  { radiusX: 530, duration: 52, direction: "normal", itemSize: 48 },
  { radiusX: 670, duration: 68, direction: "reverse", itemSize: 50 },
];

function SkillGlyph({ skill, size }) {
  const { Icon, img, name, color } = skill;
  return (
    <span className="skill-orbit-glyph" style={{ width: size, height: size }}>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" aria-hidden="true" draggable={false} />
      ) : (
        <Icon aria-hidden="true" style={{ color }} />
      )}
      <span className="skill-orbit-tip">{name}</span>
    </span>
  );
}

export default function SkillOrbits() {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Four infinite animation loops driving 36 transform subscribers is not
  // work worth doing while the section is nowhere near the viewport, so the
  // whole system idles until it is close to being seen.
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const paused = reduceMotion || !inView;

  // One measurement drives every ring, so they cannot drift out of concentric.
  useLayoutEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;
    const update = () => setScale(node.clientWidth / BASE_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="skill-orbits"
      // Drives will-change: promoting 36 elements to their own compositor
      // layers is only worth paying for while they actually move.
      data-animating={paused ? "false" : "true"}
      style={{ height: scale ? STAGE_HEIGHT * scale : undefined }}
    >
      <div
        className="skill-orbits-stage"
        style={{
          width: BASE_WIDTH,
          height: STAGE_HEIGHT,
          transform: scale ? `scale(${scale})` : undefined,
          visibility: scale === null ? "hidden" : undefined,
        }}
      >
        {SKILL_RINGS.map((ring, i) => {
          const cfg = RINGS[i];
          if (!cfg) return null;
          return (
            <div
              key={ring.id}
              className="skill-orbit-ring"
              style={{ marginTop: -BASE_WIDTH / 2, marginLeft: -BASE_WIDTH / 2 }}
            >
              <OrbitImages
                shape="ellipse"
                baseWidth={BASE_WIDTH}
                width={BASE_WIDTH}
                height={BASE_WIDTH}
                radiusX={cfg.radiusX}
                radiusY={Math.round(cfg.radiusX * FLATTEN)}
                rotation={TILT}
                duration={cfg.duration}
                direction={cfg.direction}
                itemSize={cfg.itemSize}
                paused={paused}
                showPath
                pathColor="rgba(255,255,255,0.13)"
                pathWidth={1}
                items={ring.skills.map((skill) => (
                  <SkillGlyph
                    key={skill.id}
                    skill={skill}
                    size={cfg.itemSize}
                  />
                ))}
              />
            </div>
          );
        })}

        {/* The star at the centre of the system. */}
        <div className="skill-orbits-core" aria-hidden="true">
          <span className="skill-orbits-core-glow" />
          <span className="skill-orbits-core-label">
            Cloud
            <br />
            and AI
          </span>
        </div>
      </div>
    </div>
  );
}
