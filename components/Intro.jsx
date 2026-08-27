"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";


gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Half-width of the resting rule, in px. The rule is RULE_W * 2 wide.
 *  A true hairline at rest — the reference is a 2px rule — so all of the
 *  drama comes from the stretch response when the pointer moves. */
const RULE_W = 1;

/** How long the rule holds its width after the pointer stops, in ms. */
const OPEN_HOLD_MS = 1500;

/** Hard ceiling on the open band, as a fraction of viewport width. The rule
 *  never exceeds this however fast or however long the pointer moves. */
const MAX_BAND_FRACTION = 0.14;

/** Maps 0..1 across a sub-range of the scroll, clamped and eased. */
const phase = (p, start, end, ease) => {
  const t = gsap.utils.clamp(0, 1, (p - start) / (end - start));
  return ease ? ease(t) : t;
};

const easeInOut = gsap.parseEase("power2.inOut");
const easeOut = gsap.parseEase("power2.out");
const easeIn = gsap.parseEase("power2.in");

/**
 * Intro — the hero choreography.
 *
 * Load sequence:
 *   1. The shader field holds full-bleed for 1s while it settles.
 *   2. "Hello" wipes in from the right, centred in the viewport.
 *   3. The field slices down to a slim vertical rule under the cursor
 *      (viewport centre if the pointer has not moved). At the end of the
 *      slice the live shader hands off to a DOM rule carrying the same
 *      gradient, so the resting rule can be moved with pure transforms.
 *   4. The name and role lines reveal, and the header pill is released.
 *
 * At rest the rule trails the cursor, stretching while it has ground to
 * cover and settling back to its base width once it arrives.
 *
 * Scroll sequence: the rule recolours to the work orange and scales out from
 * wherever it was last sitting until it fills the viewport. The same geometry
 * is published as `--band-x` / `--band-h` on the document element, which the
 * work section uses to clip itself, so the section is only ever visible
 * inside the orange band.
 */
export default function Intro() {
  const rootRef = useRef(null);
  const fieldRef = useRef(null);
  const ruleRef = useRef(null);
  const fillRef = useRef(null);
  const helloRef = useRef(null);
  const copyRef = useRef(null);

  // Live pointer X. Ref-only: never sets state, so pointer movement cannot
  // trigger a React render.
  const pointerXRef = useRef(null);
  // Timestamp of the last pointer movement. The rule stays open for a beat
  // after the pointer stops before it collapses back to the hairline.
  const lastMoveRef = useRef(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const onMove = (event) => {
      const now = performance.now();
      pointerXRef.current = event.clientX;
      lastMoveRef.current = now;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const handleContactClick = useCallback(
    (event) => {
      event.preventDefault();
      const contact = document.getElementById("contact");
      if (!contact) return;
      contact.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    },
    [reduce]
  );

  useGSAP(
    () => {
      const field = fieldRef.current;
      const rule = ruleRef.current;
      const fill = fillRef.current;
      const hello = helloRef.current;
      const copy = copyRef.current;
      if (!field || !rule || !fill || !hello || !copy) return;

      const doc = document.documentElement;
      const copyLines = copy.querySelectorAll("[data-hero-line] > *");
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const releaseHeader = () => doc.classList.remove("intro-running");
      // Hand the hero copy over to GSAP. Must run immediately after the
      // initial states are set, otherwise the first-paint guard would also
      // suppress the greeting it is meant to sequence.
      const releasePaint = () => doc.classList.remove("hero-unpainted");

      /**
       * The bar's geometry expressed as a clip on the painting layer. Both the
       * bar and the painting are viewport-fixed, so the same centre/half-width
       * describes both and the window can never drift out of register.
       */
      const clipForBand = (centerX, halfWidth) => {
        const vw = window.innerWidth;
        const left = Math.max(0, centerX - halfWidth);
        const right = Math.max(0, vw - centerX - halfWidth);
        return `inset(0px ${right}px 0px ${left}px)`;
      };

      /** Publishes the band geometry the work section clips itself against. */
      const publishBand = (centerX, halfWidth) => {
        const vw = window.innerWidth || 1;
        doc.style.setProperty("--band-x", `${(centerX / vw) * 100}%`);
        doc.style.setProperty("--band-h", `${(halfWidth / vw) * 100}%`);
      };

      /* ---------------------------------------------------------------
       * Reduced motion: no performance, no shader, no wipe. Show the
       * resting state and leave the work section fully revealed.
       * ------------------------------------------------------------- */
      if (reduceMotion) {
        const x = window.innerWidth / 2;
        // The painting is not hidden any more; it is clipped to the resting
        // bar so the window still reads correctly without any animation.
        gsap.set(field, {
          autoAlpha: 1,
          clipPath: clipForBand(x, RULE_W),
        });
        gsap.set(rule, { autoAlpha: 1, x, scaleX: 1 });
        gsap.set(hello, { autoAlpha: 0 });
        gsap.set(copyLines, { yPercent: 0, autoAlpha: 1 });
        doc.style.setProperty("--band-h", "100%");
        releasePaint();
        releaseHeader();
        return;
      }

      /* ---------------------------------------------------------------
       * Load choreography
       * ------------------------------------------------------------- */
      const startX = () => {
        const x = pointerXRef.current;
        const vw = window.innerWidth;
        if (x == null || Number.isNaN(x)) return vw / 2;
        return gsap.utils.clamp(RULE_W, vw - RULE_W, x);
      };

      gsap.set(field, { clipPath: "inset(0px 0px 0px 0px)", autoAlpha: 1 });
      gsap.set(rule, { autoAlpha: 0, x: window.innerWidth / 2, scaleX: 1 });
      gsap.set(fill, { autoAlpha: 0 });
      gsap.set(hello, { autoAlpha: 0, xPercent: 12, clipPath: "inset(0 0 0 100%)" });
      gsap.set(copyLines, { yPercent: 115, autoAlpha: 0 });
      doc.style.setProperty("--band-h", "0%");
      releasePaint();

      let restedX = window.innerWidth / 2;

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .to(
          hello,
          {
            autoAlpha: 1,
            xPercent: 0,
            clipPath: "inset(0 0 0 0%)",
            duration: 0.9,
            ease: "power4.out",
          },
          1
        )
        .to(
          hello,
          { autoAlpha: 0, xPercent: -6, duration: 0.5, ease: "power2.in" },
          // Longer beat on the full-bleed painting before it closes down.
          "+=1.7"
        )
        .to(
          field,
          {
            duration: 1.15,
            ease: "power3.inOut",
            clipPath: () => {
              restedX = startX();
              return clipForBand(restedX, RULE_W);
            },
            onComplete: () => {
              // No hand-off to a painted bar any more. The rule becomes an
              // empty frame that only carries the scroll fill, while the
              // painting layer stays visible and is clipped to the same
              // geometry every frame by the ticker below.
              gsap.set(rule, { x: restedX, scaleX: 1, autoAlpha: 1 });
              publishBand(restedX, RULE_W);
              startRender(restedX);
            },
          },
          "<0.15"
        )
        .to(
          copyLines,
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.85,
            stagger: 0.12,
            ease: "power3.out",
            onStart: releaseHeader,
          },
          "-=0.5"
        );

      /* ---------------------------------------------------------------
       * Rule renderer.
       *
       * One always-on ticker owns both `x` and `scaleX`. An earlier version
       * used a quickTo for `x` while the scroll handler wrote `x` directly
       * with gsap.set; the surviving tween and the scroll writes then fought
       * each other every frame, which is what made the rule jitter on the way
       * into the work section. With a single writer and manual smoothing the
       * hand-over between cursor-follow and scroll-fill is continuous, so no
       * mode change can produce a snap.
       * ------------------------------------------------------------- */
      // Assigned further down. Declared here so `render` can read it without
      // depending on declaration order — the ticker only ever starts after
      // the trigger exists, but a `const` in the temporal dead zone would
      // throw rather than fall back if that ever stopped being true.
      let scrollTrigger = null;
      let curX = window.innerWidth / 2;
      let curScale = 1;
      let anchorX = null;
      // After the scroll returns to the top the rule glides back to the
      // pointer at its base width before the stretch response is re-armed,
      // so it does not lunge across the screen the moment the hero lands.
      let settling = false;
      let rendering = false;
      const render = () => {
        // Progress is read from the trigger rather than pushed in from
        // onUpdate. onUpdate only fires for scrolls ScrollTrigger hears
        // about, so a programmatic jump that bypasses Lenis would leave a
        // pushed value stale and strand the rule mid-fill.
        const p = scrollTrigger ? scrollTrigger.progress : 0;

        if (p > 0.0005) {
          // Freeze the launch point at wherever the rule was last sitting.
          if (anchorX == null) anchorX = curX;
        } else if (anchorX != null) {
          // Back at the top with the hero fully in view: hand control back
          // to the pointer, but settle first.
          anchorX = null;
          settling = true;
        }

        gsap.set(fill, { autoAlpha: phase(p, 0, 0.18, easeOut) });

        // `hello` is deliberately excluded: it has already been retired by
        // the intro timeline, and writing autoAlpha here at progress 0
        // would bring it back.
        const out = phase(p, 0.06, 0.36, easeIn);
        gsap.set(copy, { autoAlpha: 1 - out, y: -40 * out });

        const vw = window.innerWidth;
        let targetX;
        let targetScale;
        let kx;
        let kUp;
        let kDown;

        if (p <= 0.0005) {
          targetX = startX();
          const distance = Math.abs(targetX - curX);
          if (settling) {
            targetScale = 1;
            if (distance < 2) settling = false;
          } else {
            // Explicit two-state gate: any pointer movement opens the rule to
            // the fixed cap. Every subsequent event restarts the 1.5s idle
            // timer, so continuous movement cannot make it grow further and
            // cannot start the collapse. Only a full idle interval closes it.
            const hasMoved = lastMoveRef.current > 0;
            const idleFor = performance.now() - lastMoveRef.current;
            const shouldStayOpen = hasMoved && idleFor < OPEN_HOLD_MS;
            const cappedScale = (vw * MAX_BAND_FRACTION) / (RULE_W * 2);
            targetScale = shouldStayOpen ? cappedScale : 1;
          }
          kx = 0.12;
          // Fast attack, slow release: the rule snaps open when it has
          // ground to cover and eases back as it arrives.
          kUp = 0.3;
          kDown = 0.1;
        } else {
          targetX = anchorX;
          // Distance from the launch point to the furthest viewport edge.
          // A 2px epsilon avoids a sub-pixel seam without an overshoot
          // factor, which would reach full coverage before the end of the
          // scroll and make the fill look like it finished early.
          const reach = Math.max(targetX, vw - targetX) + 2;
          const half =
            RULE_W + (reach - RULE_W) * phase(p, 0.05, 1, easeInOut);
          targetScale = half / RULE_W;
          kx = 0.3;
          kUp = 0.24;
          kDown = 0.24;
        }

        curX += (targetX - curX) * kx;
        curScale +=
          (targetScale - curScale) * (targetScale > curScale ? kUp : kDown);

        const halfWidth = RULE_W * curScale;
        gsap.set(rule, { x: curX, scaleX: curScale });
        // The window travels with the bar. Clipping the fixed painting layer
        // (rather than transforming artwork inside the bar) keeps the image
        // locked to the viewport, so the bar uncovers the painting instead of
        // dragging it along.
        gsap.set(field, { clipPath: clipForBand(curX, halfWidth) });
        restedX = curX;
        publishBand(curX, halfWidth);
      };

      function startRender(x) {
        if (typeof x === "number") {
          curX = x;
          curScale = 1;
        }
        if (rendering) return;
        rendering = true;
        gsap.ticker.add(render);
      }

      function stopRender() {
        if (!rendering) return;
        rendering = false;
        gsap.ticker.remove(render);
      }

      /* ---------------------------------------------------------------
       * Scroll sequence. Driven from onUpdate rather than a scrubbed
       * tween so the rule and the work-section band are derived from one
       * progress value and can never drift apart. Lenis already smooths
       * the scroll, so no additional scrub is needed.
       * ------------------------------------------------------------- */
      scrollTrigger = ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom top",
        invalidateOnRefresh: true,
        onLeave: () => {
          // Fully filled: the work section covers the viewport, so release
          // the rule and let the section own the surface.
          gsap.set(rule, { autoAlpha: 0 });
          doc.style.setProperty("--band-h", "100%");
        },
        onEnterBack: () => {
          gsap.set(rule, { autoAlpha: 1 });
        },
      });

      const onResize = () => {
        if (intro.progress() < 1) return;
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        stopRender();
        intro.kill();
        scrollTrigger?.kill();
        releaseHeader();
      };
    },
    { scope: rootRef }
  );

  return (
    <section
      id="intro"
      ref={rootRef}
      className="hero-stage relative isolate z-0 min-h-[100dvh] overflow-hidden"
    >
      {/* The painting. Opens full bleed, then is sliced down to the bar and
          stays there — the bar is a window onto this layer, not a painted
          object of its own. Fixed so it stays registered with the fixed bar
          and with the dark backdrop on .hero-stage. */}
      <div
        ref={fieldRef}
        className="hero-painting z-0"
        aria-hidden="true"
      />

      {/* The rule. Carries the shader's gradient at rest and the work orange
          once the scroll wipe takes over. Fixed so it stays in the viewport
          while it fills. */}
      <div
        ref={ruleRef}
        aria-hidden="true"
        className="hero-rule pointer-events-none fixed inset-y-0 left-0 z-[1]"
        style={{
          width: RULE_W * 2,
          marginLeft: -RULE_W,
          transformOrigin: "50% 50%",
          willChange: "transform",
        }}
      >
        <div ref={fillRef} className="hero-rule-fill" />
      </div>

      {/* Centred greeting */}
      <div
        ref={helloRef}
        aria-hidden="true"
        className="hero-hello-layer pointer-events-none absolute inset-0 z-[2] flex items-center justify-center"
      >
        <span className="hero-hello font-heading">Hello</span>
      </div>

      {/* Left column: name, role, action */}
      <div
        ref={copyRef}
        className="relative z-[3] flex min-h-[100dvh] flex-col justify-center px-[clamp(1.25rem,4vw,4rem)]"
      >
        <h2
          className="hero-name font-heading text-white"
          aria-label="I'm Abhinav, an Azure and AI engineer based in Gurugram, India"
        >
          <span data-hero-line className="block overflow-hidden pb-[0.08em]">
            <span className="block">I&apos;m Abhinav</span>
          </span>
        </h2>

        <p className="hero-role mt-[clamp(0.75rem,2vh,1.5rem)] max-w-[34ch] text-white/70">
          <span data-hero-line className="block overflow-hidden pb-[0.12em]">
            <span className="block">
              Azure and AI engineer, based in Gurugram, India.
            </span>
          </span>
        </p>

        <div data-hero-line className="mt-[clamp(1.25rem,3vh,2rem)] overflow-hidden">
          <a
            href="#contact"
            onClick={handleContactClick}
            className="hero-action inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white focus-visible:text-white"
          >
            <span aria-hidden="true">↗</span>
            Let&apos;s work together
          </a>
        </div>
      </div>
    </section>
  );
}
