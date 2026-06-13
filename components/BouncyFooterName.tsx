"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import type { Body } from "matter-js";
import gsap from "gsap";
import { FaPaperPlane, FaRocket, FaStar, FaCloud } from "react-icons/fa";

const COLORS = [
  "#00E5FF", "#76FF03", "#FFEA00", "#FF4081",
  "#7C4DFF", "#FF6E40", "#00E676",
];

const NAME = "ABHINAV";

// Base dimensions (for desktop)
const BASE_LETTER_WIDTH = 280;
const BASE_LETTER_HEIGHT = 350;
const BASE_FONT_SIZE = 400;

export default function BouncyFooterName() {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Animation Refs
  const planeRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 0. Respect prefers-reduced-motion — render a static name instead.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // 1. Handle Resize & Initial Measure.
  //    Debounced, and small height-only changes (mobile URL-bar show/hide)
  //    are ignored so the physics world isn't pointlessly rebuilt.
  useEffect(() => {
    if (!containerRef.current) return undefined;

    const lastMeasured = { width: 0, height: 0 };
    let debounceId = 0;

    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      const widthChanged = Math.abs(w - lastMeasured.width) > 1;
      const heightChanged = Math.abs(h - lastMeasured.height) > 150;
      if (lastMeasured.width !== 0 && !widthChanged && !heightChanged) return;

      lastMeasured.width = w;
      lastMeasured.height = h;
      setDimensions({ width: w, height: h });
      setScale(Math.min(w / 1400, 1));
    };

    measure();

    const observer = new ResizeObserver(() => {
      window.clearTimeout(debounceId);
      debounceId = window.setTimeout(measure, 200);
    });
    observer.observe(containerRef.current);

    return () => {
      window.clearTimeout(debounceId);
      observer.disconnect();
    };
  }, []);

  // 2. GSAP Background Animations — paused whenever the footer is off-screen.
  useEffect(() => {
    if (!containerRef.current || reducedMotion) return undefined;

    const animations: (gsap.core.Timeline | gsap.core.Tween)[] = [];

    const ctx = gsap.context(() => {
      // --- Paper Plane: loops across the band diagonally ---
      const planeTimeline = gsap.timeline({ repeat: -1, repeatDelay: 3, paused: true });
      planeTimeline.set(planeRef.current, {
        x: -100,
        y: "80%",
        opacity: 0,
        rotation: 0,
        scale: 0.8,
      });
      planeTimeline.to(planeRef.current, {
        x: "120%",
        y: "10%",
        rotation: 20,
        opacity: 1,
        duration: 5,
        ease: "power1.inOut",
        onStart: () => {
          gsap.set(planeRef.current, { y: 50 + Math.random() * 50 + "%" });
        },
      });
      animations.push(planeTimeline);

      // --- Rocket: shoots up occasionally ---
      const rocketTimeline = gsap.timeline({ repeat: -1, repeatDelay: 10, paused: true });
      rocketTimeline.set(rocketRef.current, { y: 600, x: 0, opacity: 1, scale: 0.5 });
      rocketTimeline.to(rocketRef.current, { y: -800, duration: 2.5, ease: "power4.in" });
      animations.push(rocketTimeline);

      // --- Floating stars / clouds ---
      const floatTween = gsap.to(".floating-item", {
        y: "-=20",
        rotation: 10,
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        paused: true,
        stagger: { amount: 2, from: "random" },
      });
      animations.push(floatTween);
    }, containerRef);

    const io = new IntersectionObserver(
      ([entry]) => {
        animations.forEach((animation) =>
          entry.isIntersecting ? animation.play() : animation.pause()
        );
      },
      { threshold: 0.05 }
    );
    io.observe(containerRef.current);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [reducedMotion]);

  // 3. Matter.js physics — no canvas renderer (letters are DOM nodes), the
  //    engine only steps while the footer is on screen, and the simulation
  //    doesn't start until first scrolled into view (so the letter-drop is
  //    actually seen).
  useEffect(() => {
    const container = containerRef.current;
    if (dimensions.width === 0 || !container || reducedMotion) return undefined;

    const { Engine, Runner, Bodies, Composite, MouseConstraint, Mouse } = Matter;

    const BODY_WIDTH = BASE_LETTER_WIDTH * 0.6 * scale;
    const BODY_HEIGHT = BASE_LETTER_HEIGHT * 0.8 * scale;
    const SPAWN_Y = dimensions.height > 600 ? dimensions.height - 600 : -200;

    const engine = Engine.create({ gravity: { x: 0, y: 1.5 } });

    /** Walls */
    const boundaryOptions = {
      isStatic: true,
      render: { visible: false },
      friction: 0.5,
      restitution: 0.2,
    };
    const wallThickness = 100;
    const ground = Bodies.rectangle(
      dimensions.width / 2,
      dimensions.height + wallThickness / 2,
      dimensions.width,
      wallThickness,
      boundaryOptions
    );
    const leftWall = Bodies.rectangle(
      0 - wallThickness / 2,
      dimensions.height / 2,
      wallThickness,
      dimensions.height * 2,
      boundaryOptions
    );
    const rightWall = Bodies.rectangle(
      dimensions.width + wallThickness / 2,
      dimensions.height / 2,
      wallThickness,
      dimensions.height * 2,
      boundaryOptions
    );
    Composite.add(engine.world, [ground, leftWall, rightWall]);

    /** Letters */
    const text = NAME.split("");
    const totalBodyWidth = text.length * (BODY_WIDTH * 1.1);
    const startX = (dimensions.width - totalBodyWidth) / 2 + BODY_WIDTH / 2;

    const bodies: Body[] = text.map((_, i) => {
      const b = Bodies.rectangle(
        startX + i * (BODY_WIDTH * 1.1),
        SPAWN_Y - Math.random() * 200,
        BODY_WIDTH,
        BODY_HEIGHT,
        {
          restitution: 0.4,
          friction: 0.5,
          frictionAir: 0.01,
          density: 0.002,
          chamfer: { radius: 20 * scale },
          render: { visible: false },
        }
      ) as Body;

      Matter.Body.setAngle(b, (Math.random() - 0.5) * 0.5);
      Matter.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.05);
      return b;
    });
    Composite.add(engine.world, bodies);

    /** Mouse drag — fine pointers only, so touch scrolling is never hijacked. */
    let mouse: Matter.Mouse | null = null;
    let removeMouseListeners: (() => void) | null = null;
    if (window.matchMedia("(pointer: fine)").matches) {
      mouse = Mouse.create(container);

      // Strip Matter's wheel + touch listeners: scroll and touch gestures
      // must always pass through to the page.
      const mouseAny = mouse as any;
      container.removeEventListener("mousewheel", mouseAny.mousewheel);
      container.removeEventListener("DOMMouseScroll", mouseAny.mousewheel);
      container.removeEventListener("wheel", mouseAny.mousewheel);
      container.removeEventListener("touchstart", mouseAny.mousedown);
      container.removeEventListener("touchmove", mouseAny.mousemove);
      container.removeEventListener("touchend", mouseAny.mouseup);

      // Matter never unbinds its DOM listeners — do it ourselves on cleanup
      // (the container persists across rebuilds, so they'd accumulate).
      removeMouseListeners = () => {
        container.removeEventListener("mousemove", mouseAny.mousemove);
        container.removeEventListener("mousedown", mouseAny.mousedown);
        container.removeEventListener("mouseup", mouseAny.mouseup);
      };

      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.1,
          damping: 0.1,
          render: { visible: false },
        },
      });
      Composite.add(engine.world, mouseConstraint);
    }

    /** Runner + DOM sync loop — gated by viewport visibility */
    const runner = Runner.create();
    let animationFrameId = 0;
    let running = false;

    const sync = () => {
      bodies.forEach((body, i) => {
        const el = letterRefs.current[i];
        if (!el) return;

        const { x, y } = body.position;
        const angle = body.angle;
        const visualWidth = BASE_LETTER_WIDTH * scale;
        const visualHeight = BASE_LETTER_HEIGHT * scale;

        el.style.transform = `translate(${x - visualWidth / 2}px, ${
          y - visualHeight / 2
        }px) rotate(${angle}rad)`;

        if (y > dimensions.height + 100 || y < -1000) {
          Matter.Body.setPosition(body, { x: startX + i * BODY_WIDTH, y: -200 });
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
          Matter.Body.setAngle(body, 0);
        }
      });
      animationFrameId = requestAnimationFrame(sync);
    };

    const start = () => {
      if (running) return;
      running = true;
      Runner.run(runner, engine);
      animationFrameId = requestAnimationFrame(sync);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      Runner.stop(runner);
      cancelAnimationFrame(animationFrameId);
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.05 }
    );
    io.observe(container);

    return () => {
      io.disconnect();
      stop();
      removeMouseListeners?.();
      if (mouse) Mouse.clearSourceEvents(mouse);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [dimensions, scale, reducedMotion]);

  // Static fallback for reduced-motion users.
  if (reducedMotion) {
    return (
      <div className="relative flex w-full items-center justify-center overflow-hidden bg-black py-10">
        <p className="flex select-none gap-1 font-heading text-[clamp(3rem,11vw,9rem)] leading-none">
          {NAME.split("").map((char, i) => (
            <span key={i} style={{ color: COLORS[i % COLORS.length] }}>
              {char}
            </span>
          ))}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[300px] w-full cursor-grab overflow-hidden bg-black active:cursor-grabbing"
      aria-hidden="true"
    >
      {/* ---- BACKGROUND ANIMATION LAYER ---- */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Paper Plane */}
        <div
          ref={planeRef}
          className="absolute left-0 text-6xl text-white/10 opacity-0 md:text-8xl"
        >
          <FaPaperPlane />
        </div>

        {/* Rocket */}
        <div
          ref={rocketRef}
          className="absolute bottom-0 left-[50%] -translate-x-1/2 text-5xl text-white/10 opacity-0 md:text-7xl"
        >
          <FaRocket />
        </div>

        {/* Floating Items */}
        <div className="floating-item absolute left-[5%] top-[10%] text-4xl text-white/5"><FaStar /></div>
        <div className="floating-item absolute right-[10%] top-[20%] text-3xl text-white/5"><FaStar /></div>
        <div className="floating-item absolute bottom-[30%] left-[15%] text-2xl text-white/5"><FaStar /></div>
        <div className="floating-item absolute left-[30%] top-[15%] text-6xl text-white/5 opacity-50"><FaCloud /></div>
        <div className="floating-item absolute right-[25%] top-[40%] text-8xl text-white/5 opacity-30"><FaCloud /></div>
      </div>

      {/* ---- LETTER DIVS (driven by the physics bodies) ---- */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {NAME.split("").map((char, i) => (
          <div
            key={i}
            ref={(el) => {
              letterRefs.current[i] = el;
            }}
            className="absolute flex select-none items-center justify-center font-heading will-change-transform"
            style={{
              width: BASE_LETTER_WIDTH * scale,
              height: BASE_LETTER_HEIGHT * scale,
              fontSize: BASE_FONT_SIZE * scale,
              lineHeight: `${BASE_LETTER_HEIGHT * scale}px`,
              color: COLORS[i % COLORS.length],
              textShadow: `${10 * scale}px ${10 * scale}px 0px rgba(0,0,0,0.1)`,
              transform: `translate(-1000px, -1000px)`,
            }}
          >
            {char}
          </div>
        ))}
      </div>
    </div>
  );
}
