"use client";

import { useEffect, useRef } from "react";

/**
 * NotFoundDots — the "404" rendered as a particle field.
 *
 * The glyph positions are sampled from the site's own display face rather than
 * hard-coded, so the shape stays correct if the type changes. Each dot springs
 * to its sampled home and is pushed away from the pointer, which is the whole
 * interaction: the number scatters as you reach for it and reassembles when
 * you leave.
 *
 * Everything runs on one rAF loop writing to a canvas. No React state is
 * touched per frame, and the loop is cancelled on unmount.
 */

/**
 * Sampling grid and dot size both scale with the rendered glyph. A fixed 6px
 * step looked right at the old 300px cap, but at full-bleed size it would
 * multiply the particle count several times over for no visual gain and cost
 * frame time. Scaling both keeps the density ratio and the look constant, so
 * the field simply gets bigger rather than denser.
 */
const stepFor = (size) => Math.max(6, Math.min(14, Math.round(size / 44)));
const dotFor = (size) => Math.max(1.7, Math.min(3.6, size / 150));
/** Radius around the pointer that pushes dots away. Scales with the glyph so
 *  the hole the cursor opens stays proportional at any size. */
const REPEL_BASE = 110;
const REPEL_STRENGTH = 34;
/** Spring back toward home, and velocity damping. */
const RETURN = 0.055;
const DAMPING = 0.86;

export default function NotFoundDots() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const state = { dots: [], raf: 0, px: -9999, py: -9999, dpr: 1, step: 6, dot: 1.7, repel: REPEL_BASE };

    /** Read the real display face so the dots match the site's type. */
    const displayFont = () => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "position:absolute;visibility:hidden;font-family:var(--font-clash-display),var(--font-clash-grotesk),sans-serif";
      document.body.appendChild(probe);
      const family = getComputedStyle(probe).fontFamily;
      probe.remove();
      return family || "sans-serif";
    };

    /**
     * Rasterise "404" once into an offscreen canvas and keep one dot per
     * opaque sample. This is what makes the field an actual glyph rather than
     * a hand-placed approximation.
     */
    const build = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = w * state.dpr;
      canvas.height = h * state.dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      // Full-bleed: the number is the page, so it takes the width it can get.
      // Still bounded by height so it cannot overflow a short viewport.
      const size = Math.min(w * 0.52, h * 0.95);
      state.repel = Math.max(REPEL_BASE, size * 0.55);
      state.step = stepFor(size);
      state.dot = dotFor(size);
      octx.fillStyle = "#000";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.font = `600 ${size}px ${displayFont()}`;
      octx.fillText("404", w / 2, h / 2);

      const { data } = octx.getImageData(0, 0, w, h);
      const dots = [];
      const step = state.step;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          // Alpha channel of this pixel; anything mostly opaque becomes a dot.
          if (data[(y * w + x) * 4 + 3] > 128) {
            dots.push({ hx: x, hy: y, x, y, vx: 0, vy: 0 });
          }
        }
      }
      state.dots = dots;
    };

    const paint = () => {
      const rect = wrap.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = "#101828";
      for (const d of state.dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, state.dot, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const d of state.dots) {
        const dx = d.x - state.px;
        const dy = d.y - state.py;
        const dist = Math.hypot(dx, dy);

        const radius = state.repel;
        if (dist < radius && dist > 0.01) {
          // Falls off with distance, so the edge of the field barely moves.
          const force = (1 - dist / radius) * REPEL_STRENGTH;
          d.vx += (dx / dist) * force * 0.08;
          d.vy += (dy / dist) * force * 0.08;
        }

        d.vx += (d.hx - d.x) * RETURN;
        d.vy += (d.hy - d.y) * RETURN;
        d.vx *= DAMPING;
        d.vy *= DAMPING;
        d.x += d.vx;
        d.y += d.vy;
      }
      paint();
      state.raf = requestAnimationFrame(step);
    };

    const onPointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      state.px = event.clientX - rect.left;
      state.py = event.clientY - rect.top;
    };
    const clearPointer = () => {
      state.px = -9999;
      state.py = -9999;
    };

    const start = () => {
      build();
      if (reduce.matches) {
        // Static field: the shape still reads, with no motion and no listeners.
        paint();
        return;
      }
      cancelAnimationFrame(state.raf);
      state.raf = requestAnimationFrame(step);
    };

    // Web fonts change the glyph outline, so sample after they resolve.
    let cancelled = false;
    const boot = () => {
      if (!cancelled) start();
    };
    if (document.fonts?.ready) document.fonts.ready.then(boot).catch(boot);
    else boot();

    const onResize = () => {
      build();
      if (reduce.matches) paint();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", clearPointer);
    reduce.addEventListener?.("change", start);

    return () => {
      cancelled = true;
      cancelAnimationFrame(state.raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", clearPointer);
      reduce.removeEventListener?.("change", start);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-[clamp(10rem,34vw,26rem)] w-full max-w-[min(94vw,84rem)]"
      role="img"
      aria-label="404"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
