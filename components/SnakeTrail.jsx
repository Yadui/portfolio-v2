"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Anchors expressed as fraction of viewport width per section boundary.
// Trail begins at the top-right of achievements (where the projects snake
// hands off at bottom-right of the projects viewport) and runs through to
// contact as one continuous SVG path.
const ANCHORS = [
  { id: "achievements", at: "top",    x: 0.93 },
  { id: "achievements", at: "bottom", x: 0.18 },
  { id: "timeline",     at: "bottom", x: 0.82 },
  { id: "skills",       at: "bottom", x: 0.18 },
  { id: "contact",      at: 0.20,     x: 0.50 },
];

const SECTION_IDS = ["achievements", "timeline", "skills", "contact"];

const SnakeTrail = () => {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const headRef = useRef(null);
  const containerRef = useRef(null);
  const metricsRef = useRef({ length: 0 });
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;

    const container = containerRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const head = headRef.current;

    if (!container || !svg || !path) return undefined;

    const getSections = () =>
      SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);

    const compute = () => {
      const sections = getSections();
      if (sections.length < 1) return false;

      const firstSection = sections[0];
      const lastSection = sections[sections.length - 1];
      const containerTop = firstSection.offsetTop;
      const bottom = lastSection.offsetTop + lastSection.offsetHeight;
      const totalHeight = bottom - containerTop;
      const width = window.innerWidth;

      container.style.top = `${containerTop}px`;
      container.style.height = `${totalHeight}px`;
      container.style.width = `100%`;

      svg.setAttribute("viewBox", `0 0 ${width} ${totalHeight}`);
      svg.style.width = `${width}px`;
      svg.style.height = `${totalHeight}px`;

      const points = ANCHORS.map((anchor) => {
        const sectionEl = document.getElementById(anchor.id);
        if (!sectionEl) return null;
        const sectionTop = sectionEl.offsetTop - containerTop;
        const sectionHeight = sectionEl.offsetHeight;
        let y;
        if (anchor.at === "top") {
          y = sectionTop;
        } else if (anchor.at === "bottom") {
          y = sectionTop + sectionHeight;
        } else if (anchor.at === "top-offset") {
          y = sectionTop + (anchor.offsetPx || 0);
        } else {
          y = sectionTop + sectionHeight * anchor.at;
        }
        return { x: anchor.x * width, y };
      }).filter(Boolean);

      if (points.length < 2) return;

      let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
      for (let i = 1; i < points.length; i += 1) {
        const prev = points[i - 1];
        const curr = points[i];
        const dy = curr.y - prev.y;
        const c1x = prev.x;
        const c1y = prev.y + dy * 0.45;
        const c2x = curr.x;
        const c2y = curr.y - dy * 0.45;
        d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
      }

      path.setAttribute("d", d);

      const length = path.getTotalLength();
      metricsRef.current.length = length;
      path.setAttribute("stroke-dasharray", `${length} ${length}`);

      return true;
    };

    const update = (progress) => {
      const length = metricsRef.current.length;
      if (!length) return;

      const clamped = gsap.utils.clamp(0, 1, progress);
      const offset = length * (1 - clamped);

      path.setAttribute("stroke-dashoffset", `${offset}`);

      if (head) {
        if (clamped <= 0.001 || clamped >= 0.999) {
          head.setAttribute("opacity", "0");
        } else {
          const point = path.getPointAtLength(length * clamped);
          head.setAttribute("cx", `${point.x}`);
          head.setAttribute("cy", `${point.y}`);
          head.setAttribute("opacity", "0.95");
        }
      }
    };

    const hasSections = compute();
    if (!hasSections) return undefined;

    setReady(true);

    const sections = getSections();
    if (sections.length < 1) return undefined;

    const trigger = ScrollTrigger.create({
      trigger: sections[0],
      start: "top bottom",
      endTrigger: sections[sections.length - 1],
      end: "top top",
      scrub: 1.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => {
        compute();
        update(self.progress);
      },
    });

    update(trigger.progress);

    const handleResize = () => trigger.refresh();
    window.addEventListener("resize", handleResize);

    let resizeFrame = 0;
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            if (resizeFrame) {
              window.cancelAnimationFrame(resizeFrame);
            }

            resizeFrame = window.requestAnimationFrame(() => {
              trigger.refresh();
            });
          });

    sections.forEach((section) => resizeObserver?.observe(section));

    return () => {
      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }

      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      trigger.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-0"
      style={{ zIndex: 5, opacity: ready ? 1 : 0 }}
    >
      <svg
        ref={svgRef}
        className="absolute left-0 top-0 overflow-visible"
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          fill="none"
          stroke="#00ff99"
          strokeWidth="140"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          ref={headRef}
          r="34"
          fill="#00ff99"
          opacity="0"
        />
      </svg>
    </div>
  );
};

export default SnakeTrail;
