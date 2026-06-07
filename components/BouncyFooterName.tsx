"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import type { Body } from "matter-js";
import gsap from "gsap";
import { FaPaperPlane, FaRocket, FaStar, FaCloud } from "react-icons/fa";
import localFont from "next/font/local";



const COLORS = [
  "#00E5FF", "#76FF03", "#FFEA00", "#FF4081",
  "#7C4DFF", "#FF6E40", "#00E676"
];

// Base dimensions (for desktop)
const BASE_LETTER_WIDTH = 280;
const BASE_LETTER_HEIGHT = 350;
const BASE_FONT_SIZE = 400;
const BASE_BODY_WIDTH = 50;
const BASE_BODY_HEIGHT = 250;
const SPACING = 0.8; // <--- lower = closer together

export default function BouncyFooterName() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Animation Refs
  const planeRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  // 1. Handle Resize & Initial Measure
  useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      
      // Update dimensions state
      setDimensions({ width: w, height: h });
      
      // Calculate responsive scale
      const newScale = Math.min(w / 1400, 1);
      setScale(newScale);
    };

    // Initial measure
    measure();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // 2. GSAP Background Animations
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // --- Paper Plane Animation ---
      // Loops across the screen diagonally
      const planeTimeline = gsap.timeline({ repeat: -1, repeatDelay: 3 });
      
      planeTimeline.set(planeRef.current, { 
        x: -100, 
        y: "80%", // Start near bottom
        opacity: 0, 
        rotation: 0, 
        scale: 0.8
      });

      planeTimeline.to(planeRef.current, {
        x: "120%", // Fly off right side
        y: "10%",  // End near top
        rotation: 20,
        opacity: 1,
        duration: 5,
        ease: "power1.inOut",
        onStart: () => {
          // Randomize Y start slightly each loop
          gsap.set(planeRef.current, { y: 50 + Math.random() * 50 + "%" });
        }
      });

      // --- Rocket Animation ---
      // Shoots up from the bottom occasionally
      const rocketTimeline = gsap.timeline({ repeat: -1, repeatDelay: 10 });
      
      rocketTimeline.set(rocketRef.current, { 
        y: 600, 
        x: 0, 
        opacity: 1, 
        scale: 0.5 
      });
      
      rocketTimeline.to(rocketRef.current, {
        y: -800,
        duration: 2.5,
        ease: "power4.in", // Fast acceleration
      });

      // --- Floating Elements (Stars/Clouds) ---
      gsap.to(".floating-item", {
        y: "-=20",
        rotation: 10,
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 2,
          from: "random"
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 3. Run Matter.js Engine
  useEffect(() => {
    if (dimensions.width === 0 || !canvasRef.current) return;

    const { Engine, Render, Runner, Bodies, Composite, MouseConstraint, Mouse } = Matter;

    /** --------------------------
     * SCALED CONSTANTS
     * ------------------------- */
    // Increased body width to match visual better for dragging
    const BODY_WIDTH = (BASE_LETTER_WIDTH * 0.6) * scale; 
    const BODY_HEIGHT = (BASE_LETTER_HEIGHT * 0.8) * scale;
    
    const SPAWN_Y = dimensions.height > 600 ? dimensions.height - 600 : -200;

    /** --------------------------
     * SETUP
     * ------------------------- */
    const engine = Engine.create({
      gravity: { x: 0, y: 1.5 } // Slightly reduced gravity for floatier feel
    });

    const render = Render.create({
      canvas: canvasRef.current,
      engine,
      options: {
        width: dimensions.width,
        height: dimensions.height,
        background: "transparent",
        wireframes: false,
        pixelRatio: window.devicePixelRatio
      }
    });

    /** --------------------------
     * WALLS (Responsive)
     * ------------------------- */
    const boundaryOptions = { isStatic: true, render: { visible: false }, friction: 0.5, restitution: 0.2 };
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

    /** --------------------------
     * LETTERS
     * ------------------------- */
    const text = "ABHINAV".split("");
    // Calculate total width based on the visual spacing we want
    const totalBodyWidth = text.length * (BODY_WIDTH * 1.1); 
    const startX = (dimensions.width - totalBodyWidth) / 2 + BODY_WIDTH / 2;

    const bodies: Body[] = text.map((_, i) => {
      const b = Bodies.rectangle(
        startX + i * (BODY_WIDTH * 1.1),
        SPAWN_Y - Math.random() * 200, // Randomize spawn height slightly
        BODY_WIDTH,
        BODY_HEIGHT,
        {
          restitution: 0.4, // Bounciness
          friction: 0.5,
          frictionAir: 0.01,
          density: 0.002, // Heavier feel
          // Reduced chamfer to prevent rolling like a ball, but kept enough for smooth corners
          chamfer: { radius: 20 * scale }, 
          render: { visible: false }
        }
      ) as Body;

      // Randomize initial state so they don't all fall flat
      Matter.Body.setAngle(b, (Math.random() - 0.5) * 0.5); 
      Matter.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.05);
      return b;
    });

    Composite.add(engine.world, bodies);

    /** --------------------------
     * MOUSE
     * ------------------------- */
    const mouse = Mouse.create(render.canvas);
    
    // @ts-ignore
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    // @ts-ignore
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { 
        stiffness: 0.1, // Softer constraint for smoother drag
        damping: 0.1,
        render: { visible: false } 
      }
    });

    Composite.add(engine.world, mouseConstraint);

    /** --------------------------
     * START
     * ------------------------- */
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    /** --------------------------
     * SYNC LOOP
     * ------------------------- */
    let animationFrameId: number;

    const sync = () => {
      bodies.forEach((body, i) => {
        const el = letterRefs.current[i];
        if (!el) return;

        const { x, y } = body.position;
        const angle = body.angle;
        
        const visualWidth = BASE_LETTER_WIDTH * scale;
        const visualHeight = BASE_LETTER_HEIGHT * scale;

        // Correct centering: subtract half of the VISUAL width/height
        el.style.transform = `
          translate(${x - visualWidth / 2}px,
                    ${y - visualHeight / 2}px)
          rotate(${angle}rad)
        `;
        
        if (y > dimensions.height + 100 || y < -1000) {
           Matter.Body.setPosition(body, {
             x: startX + i * BODY_WIDTH,
             y: -200
           });
           Matter.Body.setVelocity(body, { x: 0, y: 0 });
           Matter.Body.setAngle(body, 0);
        }
      });
      animationFrameId = requestAnimationFrame(sync);
    };

    sync();

    return () => {
      cancelAnimationFrame(animationFrameId);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      Composite.clear(engine.world, false);
      // @ts-ignore
      render.canvas = null;
      // @ts-ignore
      render.context = null;
      render.textures = {};
    };
  }, [dimensions, scale]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300px] md:h-[300px] mt-28 overflow-hidden bg-black"
    >
      {/* ---- BACKGROUND ANIMATION LAYER ---- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Paper Plane */}
        <div 
          ref={planeRef} 
          className="absolute left-0 text-white/10 text-6xl md:text-8xl opacity-0"
        >
          <FaPaperPlane />
        </div>

        {/* Rocket */}
        <div 
          ref={rocketRef} 
          className="absolute left-[50%] bottom-0 -translate-x-1/2 text-white/10 text-5xl md:text-7xl opacity-0"
        >
          <FaRocket />
        </div>

        {/* Floating Items */}
        <div className="floating-item absolute top-[10%] left-[5%] text-white/5 text-4xl"><FaStar /></div>
        <div className="floating-item absolute top-[20%] right-[10%] text-white/5 text-3xl"><FaStar /></div>
        <div className="floating-item absolute bottom-[30%] left-[15%] text-white/5 text-2xl"><FaStar /></div>
        
        <div className="floating-item absolute top-[15%] left-[30%] text-white/5 text-6xl opacity-50"><FaCloud /></div>
        <div className="floating-item absolute top-[40%] right-[25%] text-white/5 text-8xl opacity-30"><FaCloud /></div>
      </div>

      {/* ---- PHYSICS CANVAS ---- */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing" />

      {/* ---- LETTER DIVS ---- */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {"ABHINAV".split("").map((char, i) => (
          <div
            key={i}
            ref={(el) => { letterRefs.current[i] = el; }}
            // Applied Custom Font class here
            className={`absolute flex items-center justify-center select-none will-change-transform font-heading`}
            style={{
              width: BASE_LETTER_WIDTH * scale,
              height: BASE_LETTER_HEIGHT * scale,
              fontSize: BASE_FONT_SIZE * scale,
              lineHeight: `${BASE_LETTER_HEIGHT * scale}px`,
              color: COLORS[i % COLORS.length],
              textShadow: `${10 * scale}px ${10 * scale}px 0px rgba(0,0,0,0.1)`,
              transform: `translate(-1000px, -1000px)`
            }}
          >
            {char}
          </div>
        ))}
      </div>
    </div>
  );
}