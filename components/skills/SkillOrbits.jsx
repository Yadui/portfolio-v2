"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMotionValue } from "framer-motion";

import { SKILL_PLANETS } from "@/data/skillsData";

import OrbitImages from "./OrbitImages";

/**
 * SkillOrbits — the skills solar system.
 *
 * Seven planets orbit a shared centre on a common tilted plane, one per ring.
 * Each planet carries its moons as small dots revolving around it at all
 * times; hovering the planet enlarges it and sends the dots out along their
 * axes, morphing into the full icons one after another. Every ring stops
 * while a planet is open, because hovering a moving target is unpleasant and
 * the moons need to be readable once they arrive.
 *
 * The seven planets are driven by the frame loop; the moon revolution is a
 * pair of mount-time CSS animations (container spin plus body
 * counter-rotation) that pause via animation-play-state while the section is
 * off-screen.
 *
 * Layout note: OrbitImages' own `responsive` mode forces a 1:1 container,
 * which would leave a very tall box around a deliberately flat orbital plane.
 * Instead every ring is rendered at its natural design size inside one shared
 * stage that this component scales itself, so all rings stay concentric and
 * the section keeps a wide, short footprint.
 */

const BASE_WIDTH = 1400;
/** Height of the design-space stage. Much shorter than BASE_WIDTH: the plane
 *  is viewed close to edge-on. Sized so an open planet's moons and label
 *  still clear the edge at the top and bottom of the outermost orbit. */
const STAGE_HEIGHT = 400;
/** Subtle shared tilt. The separation comes from explicit shell heights,
 *  not aggressive plane rotations. */
const TILT = -6;

/**
 * Four wide rings, and every orbit shares a single period.
 *
 * Equal periods are what keep the planets at fixed distances from one
 * another. Planets on different periods sweep through every alignment over
 * time, so pairs inevitably bunch up and overlap, which makes hovering a
 * lottery; with one period, the arclength gap between any two planets is
 * invariant forever.
 *
 * The phases are not decorative either. They were chosen by search to
 * maximise the closest approach between any two planets across the whole
 * cycle, given these radii and sizes: worst-case edge-to-edge clearance of
 * 20px for the previous phases after each ring received its own tilt.
 * Adjacent-ring alignment is the binding constraint, since the radial gap
 * between rings is only ~73px.
 */
const ORBIT_PERIOD = 64;
const RINGS = [
  // Two planets per wide ring sit opposite one another. Every ring uses the
  // same phase pattern, so corresponding planets remain radially separated
  // instead of crossing through one another as their shells revolve.
  { radiusX: 210, radiusY: 58, phase: 0, size: 58, tilt: 0 },
  { radiusX: 340, radiusY: 96, phase: 24, size: 62, tilt: 0 },
  { radiusX: 470, radiusY: 134, phase: 52, size: 66, tilt: 0 },
  { radiusX: 600, radiusY: 172, phase: 77, size: 60, tilt: 0 },
];

/** Reach of the hover pad: the moon orbit plus a moon radius and some slack,
 *  so the pointer never crosses dead space between a planet and its moons. */
const REACH = 92;

const ellipsePath = (cx, cy, rx, ry) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
/** How far the moons travel out from their planet's centre. */
const MOON_ORBIT = 62;

/** Total window the moon sequence is allowed to occupy, in ms. */
const MOON_WINDOW = 300;
/** Longest gap between two moons arriving, in ms. */
const MOON_STEP_MAX = 90;

function Glyph({ item }) {
  const { Icon, img, color } = item;
  if (img) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img} alt="" aria-hidden="true" draggable={false} />;
  }
  return <Icon aria-hidden="true" style={{ color }} />;
}

function Planet({ planet, size, open, onOpen, onClose }) {
  const count = planet.moons.length;
  // More moons arrive in quicker succession, so a large system does not take
  // meaningfully longer to finish than a small one.
  const step = Math.round(Math.min(MOON_STEP_MAX, MOON_WINDOW / count));

  return (
    <span
      className="planet"
      data-open={open ? "true" : "false"}
      style={{
        width: size,
        height: size,
        // Radius of the closed-state dot orbit: just outside the planet
        // glyph, scaled with the planet so dots never sit on the icon.
        "--dot-orbit": `${Math.round(size / 2 + 10)}px`,
      }}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      {/* Keeps the planet open while the pointer crosses the gap between the
          core and its moons. Only catches events while open, so it cannot
          enlarge the hit area of a closed planet. */}
      <span className="planet-reach" />

      <span className="planet-moons">
        {planet.moons.map((moon, i) => (
          <span
            key={moon.id}
            className="moon"
            style={{
              "--moon-angle": `${(i / count) * 360 - 90}deg`,
              "--moon-delay": `${open ? i * step : 0}ms`,
            }}
          >
            <span className="moon-body">
              <Glyph item={moon} />
              <span className="moon-name">{moon.name}</span>
            </span>
          </span>
        ))}
      </span>

      <span className="planet-core">
        <Glyph item={planet} />
      </span>
      <span className="planet-name">{planet.name}</span>
    </span>
  );
}

export default function SkillOrbits() {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [inView, setInView] = useState(false);
  const [openId, setOpenId] = useState(null);
  // One clock drives every ring. Independent OrbitImages effects can start a
  // few milliseconds apart during HMR or hydration; a shared motion value
  // makes shell phase spacing invariant instead of probabilistic.
  const sharedProgress = useMotionValue(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Four animation loops driving eight subscribers is not work worth doing
  // while the section is nowhere near the viewport.
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

  // Closing is deferred briefly. Without this, moving from one planet to the
  // next passes through a frame where nothing is open, every orbit snaps back
  // to full speed, and the planet just released visibly darts away along its
  // path before the new one takes hold. The grace period lets the handover
  // happen without the system ever returning to 1x.
  const closeTimer = useRef(null);

  const open = useCallback((id) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenId(id);
  }, []);

  const close = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setOpenId(null);
      closeTimer.current = null;
    }, 180);
  }, []);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  useEffect(() => {
    if (reduceMotion || !inView) return undefined;
    let frame = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      const next = sharedProgress.get() + (100 / ORBIT_PERIOD) * dt;
      sharedProgress.set(((next % 100) + 100) % 100);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, sharedProgress]);

  // Everything freezes together while a planet is open. Slowing or stopping
  // individual rings would let their separations drift, undoing the fixed
  // spacing the shared period buys; a full stop also keeps the open planet
  // and its neighbours exactly where the user saw them when they committed
  // to the hover.
  const idle = reduceMotion || !inView;
  const paused = idle || openId !== null;

  return (
    <div
      ref={wrapRef}
      className="skill-orbits"
      data-animating={idle ? "false" : "true"}
      data-open={openId ? "true" : "false"}
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
        {/* Every orbit drawn in a single layer beneath the planets. Drawing
            each path inside its own ring instead would trap it in that ring's
            stacking context, so an outer ring's line would paint over an
            inner ring's planet. */}
        <svg
          className="skill-orbits-paths"
          viewBox={`0 0 ${BASE_WIDTH} ${STAGE_HEIGHT}`}
          aria-hidden="true"
        >
          {RINGS.map((cfg) => (
            <path
              key={cfg.radiusX}
              d={ellipsePath(
                BASE_WIDTH / 2,
                STAGE_HEIGHT / 2,
                cfg.radiusX,
                cfg.radiusY
              )}
              transform={`rotate(${cfg.tilt + TILT} ${BASE_WIDTH / 2} ${STAGE_HEIGHT / 2})`}
              fill="none"
              stroke="rgba(255,255,255,0.13)"
              strokeWidth="1"
            />
          ))}
        </svg>

        {RINGS.map((cfg, ringIndex) => {
          const planets = SKILL_PLANETS.filter((p) => p.ring === ringIndex);
          if (!planets.length) return null;
          return (
            <div
              key={ringIndex}
              className="skill-orbit-ring"
              style={{ marginTop: -BASE_WIDTH / 2, marginLeft: -BASE_WIDTH / 2 }}
            >
              <OrbitImages
                shape="ellipse"
                baseWidth={BASE_WIDTH}
                width={BASE_WIDTH}
                height={BASE_WIDTH}
                radiusX={cfg.radiusX}
                radiusY={cfg.radiusY}
                rotation={cfg.tilt + TILT}
                duration={ORBIT_PERIOD}
                phase={cfg.phase}
                itemSize={cfg.size}
                paused={paused}
                progressValue={sharedProgress}
                items={planets.map((planet) => (
                  <Planet
                    key={planet.id}
                    planet={planet}
                    size={cfg.size}
                    open={openId === planet.id}
                    onOpen={() => open(planet.id)}
                    onClose={close}
                  />
                ))}
              />
            </div>
          );
        })}

        {/* Animated star above the orbit lines. It stays pointer-inert so it
            cannot steal hover from the inner planet. */}
        <div className="skill-orbits-core" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/summer-sun.gif" alt="" draggable={false} />
          <span className="skill-sun-tip">Cool skills</span>
        </div>

      </div>
    </div>
  );
}

export { MOON_ORBIT };
