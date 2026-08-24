"use client";

// Based on the OrbitImages component from React Bits by Dominik Koch
// https://reactbits.dev  ·  https://x.com/dominikkoch
//
// Local adaptations:
//  1. Imports come from `framer-motion` (installed) rather than `motion/react`
//     (not installed). This project already ships framer-motion v11, which
//     exports motion, useMotionValue, useTransform and animate, so pulling in
//     the separate `motion` package would have duplicated the runtime.
//  2. Added an `items` prop that accepts arbitrary React nodes. The upstream
//     public API is images-only, but the internal OrbitItem already renders a
//     node, so this exposes what was already there — needed because the skill
//     glyphs are react-icons components, not image URLs.

import { useMemo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

import "./OrbitImages.css";

function generateEllipsePath(cx, cy, rx, ry) {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function generateCirclePath(cx, cy, r) {
  return generateEllipsePath(cx, cy, r, r);
}

function OrbitItem({
  item,
  index,
  totalItems,
  path,
  itemSize,
  rotation,
  progress,
  fill,
  phase,
}) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0;

  const offsetDistance = useTransform(progress, (p) => {
    const offset = (((p + itemOffset + phase) % 100) + 100) % 100;
    return `${offset}%`;
  });

  return (
    <motion.div
      className="orbit-item"
      style={{
        width: itemSize,
        height: itemSize,
        offsetPath: `path("${path}")`,
        offsetRotate: "0deg",
        offsetAnchor: "center center",
        offsetDistance,
      }}
    >
      {/* Counter-rotates so the payload stays upright on a tilted orbit. */}
      <div style={{ transform: `rotate(${-rotation}deg)` }}>{item}</div>
    </motion.div>
  );
}

export default function OrbitImages({
  images = [],
  items: itemNodes,
  altPrefix = "Orbiting image",
  shape = "ellipse",
  customPath,
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  radius = 300,
  rotation = -8,
  duration = 40,
  itemSize = 64,
  direction = "normal",
  fill = true,
  width = 100,
  height = 100,
  className = "",
  showPath = false,
  pathColor = "rgba(0,0,0,0.1)",
  pathWidth = 2,
  easing = "linear",
  paused = false,
  progressValue,
  // Local additions:
  //  `phase`  — starting position along the path, 0-100. Needed because a
  //             ring carrying a single item always begins at 0%, so every
  //             single-item ring would otherwise start aligned.
  //  `speed`  — rate multiplier applied to the frame driver.
  phase = 0,
  speed = 1,
  centerContent,
  responsive = false,
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(null);

  const designCenterX = baseWidth / 2;
  const designCenterY = baseWidth / 2;

  const path = useMemo(() => {
    switch (shape) {
      case "circle":
        return generateCirclePath(designCenterX, designCenterY, radius);
      case "custom":
        return customPath || generateCirclePath(designCenterX, designCenterY, radius);
      case "ellipse":
      default:
        return generateEllipsePath(designCenterX, designCenterY, radiusX, radiusY);
    }
  }, [shape, customPath, designCenterX, designCenterY, radiusX, radiusY, radius]);

  useLayoutEffect(() => {
    if (!responsive || !containerRef.current) return undefined;
    const node = containerRef.current;
    const updateScale = () => setScale(node.clientWidth / baseWidth);
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, [responsive, baseWidth]);

  const progress = useMotionValue(0);

  // Local adaptation: progress is advanced by hand each frame instead of by
  // a tween.
  //
  // The upstream approach animates a motion value to 100 on a loop. Pausing,
  // resuming or re-rating that tween all re-derive its start time, which
  // seeks the playhead — measured as single-frame jumps of up to 9% of an
  // orbit when focus moved between planets. Because this integrates a rate
  // over elapsed time, progress can only ever move by `dt * rate`, so a seek
  // is not expressible. Rate and direction are read from refs so changing
  // them never restarts the loop, and `last` is re-seeded on resume so a
  // pause cannot accumulate into a catch-up leap.
  //
  // The driver is linear-only, which is the sole easing this project uses.
  const speedRef = useRef(speed);
  const dirRef = useRef(direction === "reverse" ? -1 : 1);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    dirRef.current = direction === "reverse" ? -1 : 1;
  }, [direction]);

  useEffect(() => {
    if (progressValue || paused) return undefined;
    let frame = 0;
    let last = performance.now();
    const perSecond = 100 / duration;

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      const next = progress.get() + dirRef.current * perSecond * speedRef.current * dt;
      progress.set(((next % 100) + 100) % 100);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, duration, progress, progressValue]);

  const containerWidth = responsive
    ? "100%"
    : typeof width === "number"
      ? width
      : "100%";
  const containerHeight = responsive
    ? "auto"
    : typeof height === "number"
      ? height
      : typeof width === "number"
        ? width
        : "auto";

  const renderedItems =
    itemNodes ??
    images.map((src, index) => (
      <img
        key={src}
        src={src}
        alt={`${altPrefix} ${index + 1}`}
        draggable={false}
        className="orbit-image"
      />
    ));

  return (
    <div
      ref={containerRef}
      className={`orbit-container ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        aspectRatio: responsive ? "1 / 1" : undefined,
      }}
      aria-hidden="true"
    >
      <div
        className={
          responsive
            ? "orbit-scaling-container orbit-scaling-container--responsive"
            : "orbit-scaling-container"
        }
        style={{
          width: responsive ? baseWidth : "100%",
          height: responsive ? baseWidth : "100%",
          transform:
            responsive && scale !== null
              ? `translate(-50%, -50%) scale(${scale})`
              : undefined,
          visibility: responsive && scale === null ? "hidden" : undefined,
        }}
      >
        <div
          className="orbit-rotation-wrapper"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {showPath && (
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${baseWidth} ${baseWidth}`}
              className="orbit-path-svg"
            >
              <path
                d={path}
                fill="none"
                stroke={pathColor}
                strokeWidth={pathWidth / (scale ?? 1)}
              />
            </svg>
          )}

          {renderedItems.map((item, index) => (
            <OrbitItem
              key={index}
              item={item}
              index={index}
              totalItems={renderedItems.length}
              path={path}
              itemSize={itemSize}
              rotation={rotation}
              progress={progressValue ?? progress}
              fill={fill}
              phase={phase}
            />
          ))}
        </div>
      </div>

      {centerContent && (
        <div className="orbit-center-content">{centerContent}</div>
      )}
    </div>
  );
}
