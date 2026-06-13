// Shared "liquid curve" SVG path builder — the site's single transition
// identity. Used by the preloader exit, the overlay menu edge, and the
// route-change veil so every wipe shares the same leading-edge motion.
//
// The paths describe a fin hanging below a panel: a rectangle's bottom edge
// (from x=0 to x=width at y=0) with a quadratic bulge sagging down to
// `bulge` px. A bulge of 0 collapses the fin to an invisible flat line.
export const CURVE_HEIGHT = 300;

export const buildCurvePath = (width, bulge) =>
  `M0 0 L${width} 0 L${width} 0 Q${width / 2} ${bulge} 0 0 L0 0`;

export const curvePaths = (width) => ({
  flat: buildCurvePath(width, 0),
  bulge: buildCurvePath(width, CURVE_HEIGHT),
});
