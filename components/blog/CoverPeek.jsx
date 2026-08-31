"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * CoverPeek — cursor-tracked cover preview for the blog archive.
 *
 * Rows publish their art as `data-cover` and this listens once on the archive
 * container, so the index stays a server component and no per-row client
 * component is needed. Only rows with a real cover file carry the attribute:
 * roughly half the posts store a generated `data:` SVG placeholder, and
 * previewing those would flash a grey rectangle at the cursor.
 *
 * The panel is driven entirely by `transform` from a single rAF loop that
 * writes to the DOM node. React state changes only when the hovered post
 * changes, never on pointer movement, so following the cursor cannot cause a
 * render.
 */

const W = 260;
const H = 164;
/** Distance from the cursor, so the panel never sits under the pointer. */
const GAP = 28;
/** Viewport inset, to keep the panel off the edges. */
const EDGE = 12;
/** Follow easing per frame. Low enough to trail the cursor, high enough not
 *  to feel detached from it. */
const EASE = 0.18;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export default function CoverPeek({ scopeId = "blog-archive" }) {
  const boxRef = useRef(null);
  const [cover, setCover] = useState(null);
  const s = useRef({ tx: 0, ty: 0, x: 0, y: 0, raf: 0, running: false });

  useEffect(() => {
    // Pointer-only affordance: touch has no hover, and a panel that chases the
    // cursor is motion, so reduced-motion users opt out of it entirely rather
    // than getting a jumping rectangle.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    const scope = document.getElementById(scopeId);
    const box = boxRef.current;
    if (!scope || !box) return;

    const state = s.current;

    const tick = () => {
      state.x += (state.tx - state.x) * EASE;
      state.y += (state.ty - state.y) * EASE;
      const x = clamp(state.x + GAP, EDGE, window.innerWidth - W - EDGE);
      const y = clamp(state.y - H / 2, EDGE, window.innerHeight - H - EDGE);
      box.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      state.raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (state.running) return;
      state.running = true;
      state.raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!state.running) return;
      state.running = false;
      cancelAnimationFrame(state.raf);
    };

    const hide = () => {
      box.dataset.on = "false";
      stop();
    };

    const onMove = (event) => {
      state.tx = event.clientX;
      state.ty = event.clientY;
    };

    const onOver = (event) => {
      const row = event.target.closest("[data-cover]");
      const src = row?.getAttribute("data-cover");
      if (!src) {
        hide();
        return;
      }
      // Jump straight to the cursor the first time, so the panel does not fly
      // in from the last position it happened to be left at.
      if (box.dataset.on !== "true") {
        state.x = state.tx = event.clientX;
        state.y = state.ty = event.clientY;
      }
      setCover(src);
      box.dataset.on = "true";
      start();
    };

    scope.addEventListener("pointermove", onMove, { passive: true });
    scope.addEventListener("pointerover", onOver);
    scope.addEventListener("pointerleave", hide);
    // A row can be scrolled out from under a stationary cursor.
    window.addEventListener("scroll", hide, { passive: true });

    return () => {
      scope.removeEventListener("pointermove", onMove);
      scope.removeEventListener("pointerover", onOver);
      scope.removeEventListener("pointerleave", hide);
      window.removeEventListener("scroll", hide);
      stop();
    };
  }, [scopeId]);

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      data-on="false"
      style={{ width: W, height: H }}
      /* `motion-reduce:!hidden` is marked important on purpose: Tailwind
         orders the `md:` variant after `motion-reduce:`, so without it the
         responsive `md:block` wins and the reduced-motion guard silently does
         nothing. The effect also bails out in JS; this is the second lock. */
      className="pointer-events-none fixed left-0 top-0 z-50 hidden overflow-hidden rounded-xl border border-[#101828]/10 bg-[#fffdf8] opacity-0 shadow-[0_18px_40px_-18px_rgba(16,24,40,0.35)] transition-[opacity,scale] duration-200 ease-out [scale:0.96] data-[on=true]:opacity-100 data-[on=true]:[scale:1] md:block motion-reduce:!hidden"
    >
      {cover && (
        <Image
          src={cover}
          alt=""
          fill
          sizes="260px"
          className="object-cover"
        />
      )}
    </div>
  );
}
