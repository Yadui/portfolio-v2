"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AppleHelloEnglishEffect } from "@/components/ui/shadcn-io/apple-hello-effect";
import AnimatedPathText from "@/components/fancy/text/text-along-path";

gsap.registerPlugin(ScrollTrigger);

const HeaderHome = ({ arrowRef }) => {
  const containerRef = useRef(null);
  const pillRef = useRef(null);
  const nameRef = useRef(null);
  const [stage, setStage] = useState(0);
  const [helloComplete, setHelloComplete] = useState(false);

  const navItems = [
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
    { label: "Blog", href: "/blog" },
  ];

  const nameText = "I'm Abhinav";
  const ringTextBase =
    "Cloud Architect · AI Solutions · Data Engineering · UI/UX · Platform Engineering · Automation · DevOps · Cloud Security · Product Systems · Integrations · Scalable APIs ·";
  const ringText = ringTextBase.repeat(1);

  useGSAP(
    () => {
      gsap.fromTo(
        pillRef.current,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.8,
          ease: "power2.out",
          onStart: () => setStage(1),
          onComplete: () => setStage(2),
        }
      );
    },
    { scope: containerRef }
  );

  useGSAP(
    () => {
      if (!helloComplete) return undefined;

      const tl = gsap.timeline({
        onComplete: () => {
          setStage(4);
        },
      });

      tl.to(nameRef.current, {
        width: "auto",
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        onStart: () => setStage(3),
      })
        .fromTo(
          ".char",
          { x: 15, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.025,
            duration: 0.35,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .fromTo(
          "#header-pill-ring",
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: "power2.out" }
        )
        .to(
          ".nav-curtain",
          {
            scaleY: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.inOut",
          },
          "-=0.8"
        );

      return () => {
        tl.kill();
      };
    },
    { scope: containerRef, dependencies: [helloComplete] }
  );

  const handleHelloComplete = () => {
    if (!helloComplete) {
      setHelloComplete(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black"
    >
      <div className="relative transform-gpu">
        <div
          ref={pillRef}
          className="pill-container relative z-20 flex h-[120px] min-w-[280px] items-center justify-center overflow-hidden rounded-full bg-white px-10 text-black opacity-0 shadow-2xl origin-center md:h-[160px] md:min-w-[400px] md:px-16"
        >
          <div className="flex items-center justify-center gap-3 md:gap-5">
            <div className="hello-container flex min-h-[40px] min-w-[100px] flex-shrink-0 items-center justify-center md:min-h-[56px] md:min-w-[140px]">
              {stage >= 2 && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="en"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                  >
                    <AppleHelloEnglishEffect
                      className="h-16 text-black md:h-24"
                      speed={0.8}
                      onAnimationComplete={handleHelloComplete}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <div
              ref={nameRef}
              className="name-container flex items-center opacity-0"
              style={{ width: 0, overflow: "hidden" }}
            >
              <h1 className="flex items-center whitespace-nowrap text-4xl font-bold leading-none tracking-tight text-black md:text-6xl">
                {nameText.split("").map((char, index) => (
                  <span
                    key={index}
                    className="char inline-block"
                    style={{ minWidth: char === " " ? "0.2em" : "auto" }}
                  >
                    {char}
                  </span>
                ))}
              </h1>
            </div>
          </div>
        </div>

        <div
          id="header-pill-ring"
          className="pointer-events-none absolute inset-[-80px] z-10 opacity-0"
        >
          <AnimatedPathText
            path="M 170, 30 L 590, 30 A 140,140 0 0 1 590, 310 L 170, 310 A 140,140 0 0 1 170, 30 Z"
            viewBox="0 0 760 340"
            text={ringText}
            textClassName="text-[14px] font-semibold tracking-[0.12em] uppercase"
            duration={25}
            svgClassName="h-full w-full text-white/40"
            preserveAspectRatio="xMidYMid meet"
            textAnchor="start"
          />
        </div>
      </div>

      <div className="fixed right-12 top-1/2 z-50 flex -translate-y-1/2 flex-col items-end gap-6 text-white mix-blend-difference">
        {navItems.map((item) => (
          <ScrollMaskLink key={item.label} label={item.label} href={item.href} />
        ))}
      </div>

      <div ref={arrowRef} />
    </div>
  );
};

const ScrollMaskLink = ({ label, href }) => {
  const linkRef = useRef(null);
  const curtainRef = useRef(null);

  useGSAP(
    () => {
      const trigger = ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "500px top",
        scrub: true,
        onUpdate: (self) => {
          if (curtainRef.current) {
            gsap.set(curtainRef.current, {
              scaleY: self.progress,
              transformOrigin: "bottom",
            });
          }
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: linkRef }
  );

  return (
    <a
      ref={linkRef}
      href={href}
      className="group relative block overflow-hidden text-lg font-light tracking-wide transition-colors hover:text-white/80"
    >
      <span className="relative z-10 block">{label}</span>
      <div
        ref={curtainRef}
        className="nav-curtain absolute inset-0 z-20 scale-y-100 bg-black origin-bottom"
      />
    </a>
  );
};

export default HeaderHome;
