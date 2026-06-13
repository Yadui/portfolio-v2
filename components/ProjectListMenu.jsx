"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

import styles from "./ProjectListMenu.module.css";

/**
 * ProjectListMenu — a centered list of project titles (two columns on
 * desktop). Resting titles sit dimmed; the hovered one turns white while a
 * floating preview follows the cursor BEHIND the text (the list paints on
 * top of it). Each time the hovered project changes, the new media is
 * revealed by un-clipping outward from the center while the media itself
 * settles from a zoomed-in state — a quick but smooth "pan from center to
 * edges".
 */

// Gradient palettes for projects without a screenshot, keyed by workCategory.
const PLACEHOLDER_PALETTES = {
  AI: ["#150b2e", "#3b1d8f", "#7c3aed"],
  Cloud: ["#04121f", "#0a3a5c", "#0ea5e9"],
  Web: ["#03150e", "#0b4f3a", "#10b981"],
  default: ["#0d0d12", "#1f1f28", "#3f3f4b"],
};

// Built imperatively (not JSX): layers are spawned per hover change so GSAP
// can animate them independently of React's render cycle.
const buildMediaElement = (item) => {
  if (item.image) {
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = "";
    img.draggable = false;
    img.className = styles.layerMedia;
    return img;
  }

  const palette =
    PLACEHOLDER_PALETTES[item.workCategory] ?? PLACEHOLDER_PALETTES.default;
  const wrap = document.createElement("div");
  wrap.className = `${styles.layerMedia} ${styles.placeholder}`;
  wrap.style.background = `radial-gradient(circle at 30% 18%, ${palette[2]}40, transparent 52%), linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 58%, ${palette[2]} 145%)`;

  const tag = document.createElement("span");
  tag.className = styles.placeholderTag;
  tag.textContent = item.category ?? "";

  const label = document.createElement("span");
  label.className = styles.placeholderTitle;
  label.textContent = item.text ?? "";

  wrap.append(tag, label);
  return wrap;
};

// Kill a layer's reveal timeline (if still running) and drop it from the DOM.
const removeLayer = (node) => {
  if (!node) return;
  node.__revealTl?.kill();
  delete node.__revealTl;
  if (node.firstChild) gsap.killTweensOf(node.firstChild);
  node.remove();
};

function ProjectListMenu({ items = [] }) {
  const wrapRef = useRef(null);
  const previewRef = useRef(null);
  const layersRef = useRef(null);
  const moveRef = useRef(null);
  const visibleRef = useRef(false);
  const activeKeyRef = useRef(null);
  const hideCallRef = useRef(null);
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  // The hover preview is desktop-only candy: fine pointers, motion allowed.
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setPreviewEnabled(fine && !reduce);
  }, []);

  // Warm the image cache so the first hover doesn't flash empty.
  useEffect(() => {
    if (!previewEnabled) return;
    items.forEach((item) => {
      if (item.image) {
        const img = new Image();
        img.src = item.image;
      }
    });
  }, [items, previewEnabled]);

  // Cursor-follow setup. quickTo gives the preview a soft trailing motion.
  useEffect(() => {
    const el = previewRef.current;
    if (!previewEnabled || !el) return undefined;

    gsap.set(el, { autoAlpha: 0, scale: 0.92, transformOrigin: "center center" });
    moveRef.current = {
      x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" }),
    };

    return () => {
      moveRef.current = null;
      hideCallRef.current?.kill();
      hideCallRef.current = null;
      gsap.killTweensOf(el);
    };
  }, [previewEnabled]);

  // The preview is absolutely positioned inside the list wrapper (so it can
  // sit behind the titles), so viewport cursor coordinates are converted to
  // wrapper-local space, centered on the cursor and clamped to the list.
  const positionPreview = useCallback((clientX, clientY, immediate = false) => {
    const el = previewRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;

    const bounds = wrap.getBoundingClientRect();
    const width = el.offsetWidth || 240;
    const height = el.offsetHeight || 150;
    const pad = 8;
    const x = gsap.utils.clamp(
      pad,
      Math.max(pad, bounds.width - width - pad),
      clientX - bounds.left - width / 2
    );
    const y = gsap.utils.clamp(
      pad,
      Math.max(pad, bounds.height - height - pad),
      clientY - bounds.top - height / 2
    );

    if (immediate) {
      // Snap before scaling in so the preview never flies across screen.
      gsap.set(el, { x, y });
    }
    moveRef.current?.x(x);
    moveRef.current?.y(y);
  }, []);

  // Swap the preview media with the center→edges reveal.
  const setPreviewMedia = useCallback((item) => {
    const host = layersRef.current;
    if (!host) return;

    const key = item.id ?? item.text;
    if (activeKeyRef.current === key) return;
    activeKeyRef.current = key;

    const layer = document.createElement("div");
    layer.className = styles.layer;
    const media = buildMediaElement(item);
    layer.appendChild(media);
    host.appendChild(layer);

    // Cap the stack so rapid hover sweeps can't pile up layers.
    while (host.children.length > 4) {
      removeLayer(host.firstChild);
    }

    // Center → outer edges. A proxy value drives all four insets via direct
    // style writes: browsers serialize `inset(50% 50% 50% 50%)` to the
    // shorthand `inset(50%)`, which made GSAP's string tween animate only
    // the TOP inset (a bottom-up wipe). The proxy keeps the expansion
    // perfectly symmetric while the media settles from a zoomed state.
    const reveal = { inset: 50 };
    layer.style.clipPath = "inset(50% 50% 50% 50%)";
    gsap.set(media, { scale: 1.55, transformOrigin: "center center" });

    const tl = gsap.timeline({
      onComplete: () => {
        delete layer.__revealTl;
        // Once fully revealed, drop the layers it covered.
        while (host.firstChild && host.firstChild !== layer) {
          removeLayer(host.firstChild);
        }
      },
    });
    tl.to(
      reveal,
      {
        inset: 0,
        duration: 0.5,
        ease: "expo.out",
        onUpdate: () => {
          layer.style.clipPath = `inset(${reveal.inset}%)`;
        },
      },
      0
    ).to(media, { scale: 1, duration: 0.5, ease: "expo.out" }, 0);

    layer.__revealTl = tl;
  }, []);

  const showPreview = useCallback(
    (item, clientX, clientY) => {
      const el = previewRef.current;
      if (!el) return;

      hideCallRef.current?.kill();
      hideCallRef.current = null;

      setPreviewMedia(item);

      if (!visibleRef.current) {
        visibleRef.current = true;
        if (typeof clientX === "number" && typeof clientY === "number") {
          positionPreview(clientX, clientY, true);
        }
        gsap.to(el, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.35,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    },
    [positionPreview, setPreviewMedia]
  );

  // Delayed by default so crossing the gap between adjacent titles doesn't
  // flicker the preview; immediate when truly leaving the list.
  const hidePreview = useCallback((immediate = false) => {
    const el = previewRef.current;
    hideCallRef.current?.kill();
    hideCallRef.current = null;
    if (!el || !visibleRef.current) return;

    const run = () => {
      hideCallRef.current = null;
      visibleRef.current = false;
      activeKeyRef.current = null;
      gsap.to(el, {
        autoAlpha: 0,
        scale: 0.92,
        duration: 0.28,
        ease: "power2.in",
        overwrite: "auto",
      });
    };

    if (immediate) {
      run();
    } else {
      hideCallRef.current = gsap.delayedCall(0.12, run);
    }
  }, []);

  // Leaving the tab (project links open in a new tab) must reset the list,
  // or the dimmed/hover state lingers until the visitor interacts again.
  useEffect(() => {
    const reset = () => {
      setHoveredId(null);
      hidePreview(true);
    };

    window.addEventListener("blur", reset);
    window.addEventListener("pagehide", reset);
    return () => {
      window.removeEventListener("blur", reset);
      window.removeEventListener("pagehide", reset);
    };
  }, [hidePreview]);

  const handleListMouseMove = useCallback(
    (event) => {
      if (!visibleRef.current) return;
      positionPreview(event.clientX, event.clientY);
    },
    [positionPreview]
  );

  const handleListMouseLeave = useCallback(() => {
    setHoveredId(null);
    hidePreview(true);
  }, [hidePreview]);

  const handleItemEnter = useCallback(
    (item, event) => {
      setHoveredId(item.id ?? item.text);
      if (previewEnabled) {
        showPreview(item, event.clientX, event.clientY);
      }
    },
    [previewEnabled, showPreview]
  );

  const handleItemLeave = useCallback(() => {
    setHoveredId(null);
    if (previewEnabled) {
      hidePreview(false);
    }
  }, [previewEnabled, hidePreview]);

  // Keyboard parity: anchor the preview beside the focused title.
  const handleItemFocus = useCallback(
    (item, event) => {
      setHoveredId(item.id ?? item.text);
      if (!previewEnabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      showPreview(item, rect.right, rect.top + rect.height / 2);
    },
    [previewEnabled, showPreview]
  );

  const handleItemBlur = useCallback(() => {
    setHoveredId(null);
    if (previewEnabled) {
      hidePreview(true);
    }
  }, [previewEnabled, hidePreview]);

  // Two reading-order columns on desktop (1–10 left, 11–19 right), a single
  // sequential column on mobile.
  const midpoint = Math.ceil(items.length / 2);
  const columns =
    items.length > 6
      ? [items.slice(0, midpoint), items.slice(midpoint)]
      : [items];

  const renderItem = (item) => {
    const key = item.id ?? item.text;
    const isActive = hoveredId === key;
    const dimmed = hoveredId != null && !isActive;

    return (
      <a
        key={key}
        data-menu-row
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${item.text} — ${item.category}`}
        onMouseEnter={(event) => handleItemEnter(item, event)}
        onMouseLeave={handleItemLeave}
        onFocus={(event) => handleItemFocus(item, event)}
        onBlur={handleItemBlur}
        className={`block cursor-pointer select-none py-[0.18em] text-center font-heading font-medium leading-[1.05] tracking-tight transition-colors duration-300 ease-out will-change-transform focus:outline-none ${
          isActive
            ? "text-white"
            : dimmed
              ? "text-white/20"
              : "text-white/40"
        }`}
        style={{ fontSize: "clamp(1.55rem, 2.7vw, 2.8rem)" }}
      >
        {item.text}
      </a>
    );
  };

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      onMouseMove={previewEnabled ? handleListMouseMove : undefined}
      onMouseLeave={handleListMouseLeave}
    >
      {/* Preview floats behind the titles: absolute layer under the nav. */}
      {previewEnabled && (
        <div ref={previewRef} aria-hidden="true" className={styles.preview}>
          <div ref={layersRef} className={styles.previewLayers} />
        </div>
      )}

      <nav
        aria-label="Projects"
        className="relative z-[2] mx-auto flex w-full max-w-6xl flex-col gap-y-0 md:flex-row md:items-start md:justify-center md:gap-x-[clamp(2rem,4vw,4.5rem)]"
      >
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex w-full min-w-0 flex-col md:flex-1"
          >
            {column.map(renderItem)}
          </div>
        ))}
      </nav>
    </div>
  );
}

export default ProjectListMenu;
