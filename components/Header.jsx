"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedPathText from "@/components/fancy/text/text-along-path";
import ScrambledText from "@/components/ScrambledText";
import FaultyTerminal from "@/components/FaultyTerminal";

const createCapsuleRingGeometry = (pillWidth, pillHeight, gap, textPadding) => {
  const ringWidth = Math.max(pillWidth + gap * 2, 1);
  const ringHeight = Math.max(pillHeight + gap * 2, 1);
  const radius = ringHeight / 2;
  const inset = Math.max(textPadding, 0);
  const width = ringWidth + inset * 2;
  const height = ringHeight + inset * 2;
  const path = [
    `M ${inset + radius} ${inset}`,
    `H ${inset + ringWidth - radius}`,
    `A ${radius} ${radius} 0 0 1 ${inset + ringWidth} ${inset + radius}`,
    `V ${inset + ringHeight - radius}`,
    `A ${radius} ${radius} 0 0 1 ${inset + ringWidth - radius} ${inset + ringHeight}`,
    `H ${inset + radius}`,
    `A ${radius} ${radius} 0 0 1 ${inset} ${inset + ringHeight - radius}`,
    `V ${inset + radius}`,
    `A ${radius} ${radius} 0 0 1 ${inset + radius} ${inset}`,
    "Z",
  ].join(" ");

  return {
    path,
    viewBox: `0 0 ${width} ${height}`,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      left: `${-(gap + inset)}px`,
      top: `${-(gap + inset)}px`,
    },
  };
};

const Header = ({ projectsSectionRef, projectsSurfaceRef, disableScrollTransition = false }) => {
  const containerRef = useRef(null);
  const heroStageRef = useRef(null);
  const pillShellRef = useRef(null);
  const pillRef = useRef(null);
  const pillContentRef = useRef(null);
  const nameRef = useRef(null);
  const ringRef = useRef(null);
  const navRailRef = useRef(null);
  const sunriseRef = useRef(null);
  const sunriseGlowRef = useRef(null);
  const whiteWashRef = useRef(null);
  const transitionStartedRef = useRef(false);

  const [stage, setStage] = useState(0);
  const [helloComplete, setHelloComplete] = useState(false);
  const [ringGeometry, setRingGeometry] = useState(() =>
    createCapsuleRingGeometry(400, 160, 72, 40)
  );

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
      if (!pillRef.current || !navRailRef.current) return undefined;

      const alignNavRail = () => {
        gsap.set(navRailRef.current, { y: 0 });

        const pillRect = pillRef.current.getBoundingClientRect();
        const navRect = navRailRef.current.getBoundingClientRect();
        const pillCenter = pillRect.top + pillRect.height / 2;
        const navCenter = navRect.top + navRect.height / 2;

        gsap.set(navRailRef.current, { y: pillCenter - navCenter });
      };

      alignNavRail();
      window.addEventListener("resize", alignNavRail);
      ScrollTrigger.addEventListener("refreshInit", alignNavRail);

      return () => {
        window.removeEventListener("resize", alignNavRail);
        ScrollTrigger.removeEventListener("refreshInit", alignNavRail);
      };
    },
    { scope: containerRef }
  );

  useGSAP(
    () => {
      if (!pillRef.current) {
        return undefined;
      }

      const updateRingGeometry = () => {
        const rect = pillRef.current.getBoundingClientRect();
        const gap = window.innerWidth < 768 ? 56 : 72;
        const textPadding = window.innerWidth < 768 ? 24 : 40;
        const next = createCapsuleRingGeometry(
          rect.width,
          rect.height,
          gap,
          textPadding
        );

        setRingGeometry((current) => {
          if (
            current.path === next.path &&
            current.viewBox === next.viewBox &&
            current.style.width === next.style.width &&
            current.style.height === next.style.height &&
            current.style.left === next.style.left &&
            current.style.top === next.style.top
          ) {
            return current;
          }

          return next;
        });
      };

      updateRingGeometry();
      const observer = new ResizeObserver(() => {
        updateRingGeometry();
      });
      observer.observe(pillRef.current);
      window.addEventListener("resize", updateRingGeometry);

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateRingGeometry);
      };
    },
    { scope: containerRef }
  );

  useGSAP(
    () => {
      if (disableScrollTransition) {
        return undefined;
      }

      let frameId;
      let activeTimeline;
      let removeListeners;
      let unlockScroll;
      let forceFinalizeTimeoutId;

      const setup = () => {
        if (
          !containerRef.current ||
          !pillShellRef.current ||
          !pillRef.current ||
          !projectsSectionRef?.current ||
          !projectsSurfaceRef?.current ||
          !sunriseRef.current ||
          !sunriseGlowRef.current ||
          !whiteWashRef.current
        ) {
          frameId = window.requestAnimationFrame(setup);
          return;
        }

        const projectsSurface = projectsSurfaceRef.current;
        const projectsSection = projectsSectionRef.current;

        gsap.set(projectsSurface, { autoAlpha: 0, y: 88 });
        gsap.set(sunriseRef.current, {
          autoAlpha: 0,
          scale: 1,
          yPercent: 46,
          transformOrigin: "center bottom",
        });
        gsap.set(sunriseGlowRef.current, {
          autoAlpha: 0,
          scaleY: 0,
          transformOrigin: "center bottom",
        });
        gsap.set(whiteWashRef.current, { autoAlpha: 0 });

        const getDropDistance = () => {
          const heroHeight = containerRef.current.offsetHeight;
          const pillRect = pillShellRef.current.getBoundingClientRect();
          const dropMargin = window.innerWidth < 768 ? 28 : 40;

          return heroHeight / 2 - pillRect.height / 2 - dropMargin;
        };

        const lockScroll = () => {
          const html = document.documentElement;
          const body = document.body;
          const prevHtmlOverflow = html.style.overflow;
          const prevBodyOverflow = body.style.overflow;

          html.style.overflow = "hidden";
          body.style.overflow = "hidden";

          return () => {
            html.style.overflow = prevHtmlOverflow;
            body.style.overflow = prevBodyOverflow;
          };
        };

        const playTransition = () => {
          if (transitionStartedRef.current) return;

          transitionStartedRef.current = true;
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          unlockScroll = lockScroll();

          const resetHeroVisualState = () => {
            gsap.set(containerRef.current, { autoAlpha: 1 });
            gsap.set(whiteWashRef.current, { autoAlpha: 0 });
            gsap.set(sunriseRef.current, {
              autoAlpha: 0,
              scale: 1,
              yPercent: 46,
            });
            gsap.set(sunriseGlowRef.current, {
              autoAlpha: 0,
              scaleY: 0,
            });
            gsap.set(heroStageRef.current, { autoAlpha: 1 });
            gsap.set(pillShellRef.current, { autoAlpha: 1, y: 0 });
            gsap.set(pillRef.current, {
              autoAlpha: 1,
              width: "",
              minWidth: "",
              height: "",
              paddingLeft: "",
              paddingRight: "",
              borderRadius: "",
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
              boxShadow: "",
            });
            gsap.set([pillContentRef.current, ringRef.current, navRailRef.current], {
              autoAlpha: 1,
              y: 0,
            });
          };

          let finalized = false;
          const finalizeTransition = () => {
            if (finalized) return;
            finalized = true;

            if (forceFinalizeTimeoutId) {
              window.clearTimeout(forceFinalizeTimeoutId);
              forceFinalizeTimeoutId = null;
            }

            unlockScroll?.();
            unlockScroll = null;
            resetHeroVisualState();
          };

          activeTimeline = gsap.timeline({
            onComplete: finalizeTransition,
            onInterrupt: finalizeTransition,
          });

          forceFinalizeTimeoutId = window.setTimeout(finalizeTransition, 5200);

          const jumpToProjects = () => {
            if (projectsSection) {
              window.scrollTo({ top: projectsSection.offsetTop, left: 0, behavior: "auto" });
            }
          };

          activeTimeline
            .to(
              [pillContentRef.current, ringRef.current, navRailRef.current],
              {
                autoAlpha: 0,
                y: -18,
                duration: 0.34,
                ease: "power2.out",
              },
              0
            )
            .to(
              pillRef.current,
              {
                width: () => (window.innerWidth < 768 ? 64 : Math.min(80, window.innerHeight * 0.1)),
                minWidth: () => (window.innerWidth < 768 ? 64 : Math.min(80, window.innerHeight * 0.1)),
                height: () => (window.innerWidth < 768 ? 64 : Math.min(80, window.innerHeight * 0.1)),
                paddingLeft: 0,
                paddingRight: 0,
                borderRadius: "9999px",
                rotation: 0,
                boxShadow: "0 26px 70px rgba(255,255,255,0.24)",
                duration: 0.48,
                ease: "power2.inOut",
              },
              0.18
            )
            .to(
              pillShellRef.current,
              {
                y: () => getDropDistance(),
                duration: 1.06,
                ease: "power2.in",
              },
              0.34
            )
            .to(
              pillRef.current,
              {
                scaleX: 1.2,
                scaleY: 0.72,
                transformOrigin: "center bottom",
                duration: 0.07,
                ease: "power1.in",
                overwrite: "auto",
              },
              1.4
            )
            .to(
              [pillRef.current, pillShellRef.current],
              {
                autoAlpha: 0,
                duration: 0.04,
                ease: "none",
                overwrite: "auto",
              },
              1.47
            )
            .to(
              sunriseRef.current,
              {
                autoAlpha: 1,
                yPercent: -12,
                duration: 1.34,
                ease: "power2.inOut",
              },
              1.6
            )
            .to(
              heroStageRef.current,
              {
                autoAlpha: 0,
                duration: 0.28,
                ease: "power2.out",
              },
              3.04
            )
            .add(jumpToProjects, 3.22)
            .to(
              projectsSurface,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.56,
                ease: "power2.out",
              },
              3.24
            )
            .to(
              whiteWashRef.current,
              {
                autoAlpha: 0,
                duration: 0.58,
                ease: "power1.out",
              },
              3.28
            );
        };

        let touchStartY = 0;

        const onWheel = (event) => {
          if (transitionStartedRef.current || event.deltaY <= 0) return;
          event.preventDefault();
          playTransition();
        };

        const onTouchStart = (event) => {
          touchStartY = event.touches[0]?.clientY ?? 0;
        };

        const onTouchMove = (event) => {
          if (transitionStartedRef.current) return;

          const currentY = event.touches[0]?.clientY ?? touchStartY;
          if (touchStartY - currentY > 10) {
            event.preventDefault();
            playTransition();
          }
        };

        const onKeyDown = (event) => {
          if (transitionStartedRef.current) return;

          if (["ArrowDown", "PageDown", "Space"].includes(event.code)) {
            event.preventDefault();
            playTransition();
          }
        };

        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("keydown", onKeyDown);

        removeListeners = () => {
          window.removeEventListener("wheel", onWheel);
          window.removeEventListener("touchstart", onTouchStart);
          window.removeEventListener("touchmove", onTouchMove);
          window.removeEventListener("keydown", onKeyDown);
        };
      };

      setup();

      return () => {
        if (frameId) {
          window.cancelAnimationFrame(frameId);
        }

        removeListeners?.();
        unlockScroll?.();
        if (forceFinalizeTimeoutId) {
          window.clearTimeout(forceFinalizeTimeoutId);
        }
        activeTimeline?.kill();
      };
    },
    { scope: containerRef, dependencies: [disableScrollTransition] }
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
          ringRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: "power2.out" },
          "-=0.1"
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
      className="relative z-20 flex h-screen w-full items-center justify-center overflow-hidden bg-black"
    >
      <div className="absolute inset-0 z-0">
        <FaultyTerminal
          className="h-full w-full"
          scale={1.5}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={0.5}
          pause={false}
          dpr={1}
          scanlineIntensity={0.5}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0.1}
          tint="#A7EF9E"
          mouseReact
          mouseStrength={0.5}
          pageLoadAnimation
          brightness={0.6}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(167,239,158,0.08),transparent_36%),linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.45)_100%)]" />
      <div
        ref={sunriseGlowRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[42vh] bg-gradient-to-t from-white via-white/90 to-transparent opacity-0"
      />
      <div
        ref={sunriseRef}
        className="pointer-events-none absolute bottom-[-72vw] left-1/2 z-20 h-[150vw] w-[150vw] -translate-x-1/2 rounded-full bg-white opacity-0"
      />
      <div
        ref={whiteWashRef}
        className="pointer-events-none absolute inset-0 z-30 bg-white opacity-0"
      />

      <div ref={heroStageRef} className="relative z-10 px-10 py-10 transform-gpu md:px-14 md:py-14">
        <div
          ref={pillShellRef}
          className="relative transform-gpu will-change-transform"
        >
          <div
            ref={pillRef}
            className="pill-container relative z-20 flex items-center justify-center overflow-hidden rounded-full border border-white/12 bg-black px-10 text-white opacity-0 shadow-[0_32px_120px_rgba(0,0,0,0.72)] origin-center md:px-16"
            style={{ height: "clamp(90px, 11vh, 150px)", minWidth: "clamp(220px, 28vw, 420px)" }}
          >
            <div
              ref={pillContentRef}
              className="flex items-center justify-center gap-3 md:gap-5"
            >
              <div className="hello-container flex flex-shrink-0 items-center justify-center" style={{ minHeight: "clamp(36px, 5vh, 56px)", minWidth: "clamp(90px, 10vw, 140px)" }}>
                {stage >= 2 && (
                  <ScrambledText
                    as="span"
                    text="Hello"
                    active={stage >= 2}
                    duration={0.95}
                    speed={0.8}
                    onComplete={handleHelloComplete}
                    className="font-primary inline-flex items-center whitespace-nowrap text-[clamp(0.9rem,1.4vw,1.55rem)] font-medium tracking-[0.08em] text-white"
                  />
                )}
              </div>

              <div
                ref={nameRef}
                className="name-container flex items-center opacity-0"
                style={{ width: 0, overflow: "hidden" }}
              >
                <ScrambledText
                  as="h1"
                  text={nameText}
                  active={stage >= 3}
                  duration={1.1}
                  speed={0.75}
                  className="font-primary flex items-center whitespace-nowrap text-[clamp(1.2rem,2.2vw,2.7rem)] font-semibold tracking-[0.08em] text-white"
                />
              </div>
            </div>
          </div>

          <div
            ref={ringRef}
            id="header-pill-ring"
            className="pointer-events-none absolute z-10 origin-center scale-[0.88] opacity-0 sm:scale-[0.93] md:scale-100"
            style={ringGeometry.style}
          >
            <AnimatedPathText
              path={ringGeometry.path}
              viewBox={ringGeometry.viewBox}
              text={ringText}
              textClassName="text-[11px] font-semibold tracking-[0.12em] uppercase sm:text-[12px] md:text-[14px]"
              duration={25}
              svgClassName="h-full w-full overflow-visible text-white"
              preserveAspectRatio="xMidYMid meet"
              textAnchor="start"
            />
          </div>
        </div>
      </div>

      <div
        ref={navRailRef}
        className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-6 text-white/88 will-change-transform md:flex md:right-12"
      >
        <div className="rounded-[1.9rem] border border-white/14 bg-black/88 px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <div className="flex flex-col items-end gap-5">
            {navItems.map((item) => (
              <ScrollMaskLink key={item.label} label={item.label} href={item.href} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScrollMaskLink = ({ label, href }) => {
  const linkRef = useRef(null);
  const curtainRef = useRef(null);

  return (
    <a
      ref={linkRef}
      href={href}
      className="group relative block overflow-hidden text-lg font-light tracking-wide transition-colors hover:text-white/80"
    >
      <span className="relative z-10 block">{label}</span>
      <div
        ref={curtainRef}
        className="nav-curtain absolute inset-0 z-20 origin-bottom scale-y-100 bg-black"
      />
    </a>
  );
};

export default Header;
