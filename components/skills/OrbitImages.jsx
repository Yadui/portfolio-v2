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
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

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
}) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0;

  const offsetDistance = useTransform(progress, (p) => {
    const offset = (((p + itemOffset) % 100) + 100) % 100;
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

  useEffect(() => {
    if (paused) return undefined;
    const controls = animate(progress, direction === "reverse" ? -100 : 100, {
      duration,
      ease: easing,
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => controls.stop();
  }, [progress, duration, easing, direction, paused]);

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
              progress={progress}
              fill={fill}
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
