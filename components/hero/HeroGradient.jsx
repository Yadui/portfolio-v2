"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * HeroGradient — isolated client leaf that owns the WebGL shader field.
 *
 * The shader stack (@shadergradient/react) is ~800KB and bundles its own
 * three/fiber runtime, so it is dynamically imported and never included in the
 * initial bundle. Until it resolves — and permanently for reduced-motion or
 * WebGL-less visitors — a static CSS gradient stands in. The static layer uses
 * the same colour stops as the shader, so the swap is not a visible jump.
 */

const ShaderGradientCanvas = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradientCanvas),
  { ssr: false }
);

const ShaderGradient = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradient),
  { ssr: false }
);

/**
 * Shader configuration — the upstream "Halo" preset.
 *
 * Kept as an explicit prop object rather than a `urlString` so the values are
 * readable and reviewable in-repo. Halo is a simple two-tone plane whose warm
 * orange lead colour runs straight into the work section's orange, so the
 * hero resolves into the rest of the page rather than fighting it.
 * Grain is turned off; at this scale it reads as noise rather than texture.
 */
const GRADIENT = {
  control: "props",
  type: "plane",
  animate: "on",
  uAmplitude: 1,
  uDensity: 1.3,
  uSpeed: 0.4,
  uStrength: 4,
  uTime: 0,
  uFrequency: 5.5,
  color1: "#ff5005",
  color2: "#dbba95",
  color3: "#d0bce1",
  brightness: 1.2,
  grain: "off",
  lightType: "3d",
  envPreset: "city",
  reflection: 0.1,
  cAzimuthAngle: 180,
  cPolarAngle: 90,
  cDistance: 3.6,
  cameraZoom: 1,
  positionX: -1.4,
  positionY: 0,
  positionZ: 0,
  rotationX: 0,
  rotationY: 10,
  rotationZ: 50,
};

/** Static stand-in that mirrors the shader's palette. */
function GradientFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(120% 100% at 22% 18%, #ff5005 0%, transparent 58%), radial-gradient(110% 90% at 82% 82%, #d0bce1 0%, transparent 60%), linear-gradient(135deg, #ff5005 0%, #dbba95 52%, #d0bce1 100%)",
      }}
    />
  );
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function HeroGradient({ active = true }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Reduced-motion visitors keep the static gradient: an animated shader
    // field is exactly the kind of perpetual motion that must collapse.
    if (reduceMotion || !supportsWebGL()) return;
    setEnabled(true);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <GradientFallback />

      {enabled && active && (
        <ShaderGradientCanvas
          className="hero-shader-canvas"
          pointerEvents="none"
          pixelDensity={1}
          fov={40}
          // The hero is above the fold, so the package's own
          // IntersectionObserver gate only causes the canvas to drop out
          // once the field is clipped down to the rule. The `active` prop
          // handles unmounting deliberately instead.
          lazyLoad={false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <ShaderGradient {...GRADIENT} />
        </ShaderGradientCanvas>
      )}
    </div>
  );
}
