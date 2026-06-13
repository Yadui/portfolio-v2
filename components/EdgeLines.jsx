/**
 * EdgeLines — decorative L-shaped corner brackets that extend outward from
 * each corner of the element. Each bracket is a single SVG with two arms
 * (horizontal + vertical) meeting at the corner point, drawn as a dotted
 * stroke so it reads as one connected line, not two separate segments.
 *
 * Place directly inside a `position: relative` wrapper.
 * Desktop-only (hidden below md).
 */

const LINE_COLOR = "#ffffff";
const ARM = 72;          // px length of each arm
const SW   = 2;          // stroke-width
const GAP  = 7;          // gap between dots
const DOT  = 3;          // dot length

// Corner → SVG viewport origin and path direction
const CORNERS = [
  {
    id: "top-left",
    style: { top: 0, left: 0, transform: "translate(-100%, -100%)" },
    // arms extend right and down from (ARM, ARM)
    path: `M ${ARM} 0 L ${ARM} ${ARM} L ${ARM * 2} ${ARM}`,
  },
  {
    id: "top-right",
    style: { top: 0, right: 0, transform: "translate(100%, -100%)" },
    // arms extend left and down from (0, ARM)
    path: `M 0 ${ARM} L ${ARM} ${ARM} L ${ARM} 0`,
  },
  {
    id: "bottom-left",
    style: { bottom: 0, left: 0, transform: "translate(-100%, 100%)" },
    // arms extend right and up from (ARM, 0)
    path: `M ${ARM * 2} 0 L ${ARM} 0 L ${ARM} ${ARM}`,
  },
  {
    id: "bottom-right",
    style: { bottom: 0, right: 0, transform: "translate(100%, 100%)" },
    // arms extend left and up from (0, 0)
    path: `M 0 0 L ${ARM} 0 L ${ARM} ${ARM}`,
  },
];

export default function EdgeLines({ omit = [] }) {
  return (
    <>
      {CORNERS.filter((c) => !omit.includes(c.id)).map((c) => (
        <svg
          key={c.id}
          aria-hidden="true"
          width={ARM * 2}
          height={ARM * 2}
          viewBox={`0 0 ${ARM * 2} ${ARM * 2}`}
          className="pointer-events-none absolute hidden md:block"
          style={{ ...c.style, overflow: "visible" }}
        >
          <path
            d={c.path}
            fill="none"
            stroke={LINE_COLOR}
            strokeWidth={SW}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${DOT} ${GAP}`}
          />
        </svg>
      ))}
    </>
  );
}
