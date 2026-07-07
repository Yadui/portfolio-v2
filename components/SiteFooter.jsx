"use client";

import { usePathname } from "next/navigation";

const HIDDEN_PREFIXES = ["/login", "/blog/create", "/blog/edit"];

/* ═══════════════════════════════════════════════════════════════════════════════
   MICROGRAPHICS FOOTER
   A single self-contained SVG. White-on-black technical-graphic field.

   Layout: the field is divided into vertical COLUMNS of varying heights
   (a skyline / equalizer silhouette). Each column is a stack of graphic
   "tiles" — some small icon-glyphs, some large multi-cell compositions
   (wireframe globes, barcodes, warning labels, registration marks, world
   maps, big metro marks…). Random cells are left EMPTY for breathing room.
   ═══════════════════════════════════════════════════════════════════════════════ */

// Deterministic LCG → repeatable randomness
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296; // 0..1
  };
}

/* ───────────────────────────────────────────────────────────────────────────────
   SMALL GLYPHS — drawn in an 18×18 box, occupy 1×1 tile
   ─────────────────────────────────────────────────────────────────────────────── */
const GLYPHS = [
  (k) => <g key={k}><circle cx="9" cy="9.5" r="6" fill="none" stroke="#fff" strokeWidth="1.3"/><line x1="9" y1="3" x2="9" y2="7" stroke="#fff" strokeWidth="1.5"/></g>, // power
  (k) => <g key={k}><line x1="9" y1="2" x2="9" y2="9" stroke="#fff" strokeWidth="1.3"/><line x1="4" y1="9" x2="14" y2="9" stroke="#fff" strokeWidth="1.3"/><line x1="6" y1="12" x2="12" y2="12" stroke="#fff" strokeWidth="1.3"/><line x1="8" y1="15" x2="10" y2="15" stroke="#fff" strokeWidth="1.3"/></g>, // ground
  (k) => <g key={k}><circle cx="9" cy="9" r="7" fill="none" stroke="#fff" strokeWidth="1.2"/><line x1="4.5" y1="4.5" x2="13.5" y2="13.5" stroke="#fff" strokeWidth="1.2"/><line x1="13.5" y1="4.5" x2="4.5" y2="13.5" stroke="#fff" strokeWidth="1.2"/></g>, // circle-x
  (k) => <g key={k}><polygon points="9,1 17,16 1,16" fill="none" stroke="#fff" strokeWidth="1.2"/><line x1="9" y1="6" x2="9" y2="11.5" stroke="#fff" strokeWidth="1.3"/><circle cx="9" cy="13.5" r="0.9" fill="#fff"/></g>, // warning
  (k) => <g key={k}><polygon points="11,1 4,10 8.5,10 7,17 14,8 9.5,8" fill="none" stroke="#fff" strokeWidth="1.2"/></g>, // bolt
  (k) => <g key={k}><circle cx="9" cy="9" r="2.5" fill="none" stroke="#fff" strokeWidth="1.1"/><path d="M9,6.5 L9,1" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><path d="M9,6.5 L9,1" stroke="#fff" strokeWidth="3" strokeLinecap="round" transform="rotate(120,9,9)"/><path d="M9,6.5 L9,1" stroke="#fff" strokeWidth="3" strokeLinecap="round" transform="rotate(240,9,9)"/><circle cx="9" cy="9" r="7" fill="none" stroke="#fff" strokeWidth="1"/></g>, // radiation
  (k) => <g key={k}><ellipse cx="9" cy="7" rx="5" ry="5" fill="none" stroke="#fff" strokeWidth="1.2"/><rect x="5.5" y="11" width="7" height="4" rx="1" fill="none" stroke="#fff" strokeWidth="1.1"/><circle cx="7" cy="7" r="1.3" fill="#fff"/><circle cx="11" cy="7" r="1.3" fill="#fff"/></g>, // skull
  (k) => <g key={k}><path d="M9,16 C5,16 3,12 4,9 C5,7 6,8 6,8 C6,5 8,2 9,1 C9,4 11,3 11,6 C12,5 13,5 13,7 C15,6 15,9 14,11 C13,14 11,16 9,16Z" fill="none" stroke="#fff" strokeWidth="1.2"/></g>, // flame
  (k) => <g key={k}><polygon points="3,2 17,9 3,16" fill="none" stroke="#fff" strokeWidth="1.3"/></g>, // play
  (k) => <g key={k}><rect x="3" y="2" width="4.5" height="14" rx="1" fill="none" stroke="#fff" strokeWidth="1.2"/><rect x="10.5" y="2" width="4.5" height="14" rx="1" fill="none" stroke="#fff" strokeWidth="1.2"/></g>, // pause
  (k) => <g key={k}><polygon points="1,3 9,9 1,15" fill="none" stroke="#fff" strokeWidth="1.2"/><polygon points="9,3 17,9 9,15" fill="none" stroke="#fff" strokeWidth="1.2"/></g>, // ff
  (k) => <g key={k}><path d="M3,10 A6,6 0 0,1 15,10" fill="none" stroke="#fff" strokeWidth="1.2"/><rect x="1" y="9" width="3" height="5.5" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.1"/><rect x="14" y="9" width="3" height="5.5" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.1"/></g>, // headphones
  (k) => <g key={k}><line x1="12" y1="2" x2="12" y2="12" stroke="#fff" strokeWidth="1.2"/><line x1="7" y1="4" x2="7" y2="14" stroke="#fff" strokeWidth="1.2"/><line x1="7" y1="4" x2="12" y2="2" stroke="#fff" strokeWidth="1.2"/><ellipse cx="10.5" cy="12.5" rx="2.5" ry="1.5" fill="none" stroke="#fff" strokeWidth="1.1"/><ellipse cx="5.5" cy="14.5" rx="2.5" ry="1.5" fill="none" stroke="#fff" strokeWidth="1.1"/></g>, // note
  (k) => <g key={k}><line x1="9" y1="2" x2="9" y2="16" stroke="#fff" strokeWidth="1.3"/><polyline points="4,7 9,2 14,7" fill="none" stroke="#fff" strokeWidth="1.3"/></g>, // up arrow
  (k) => <g key={k}><line x1="2" y1="9" x2="16" y2="9" stroke="#fff" strokeWidth="1.3"/><polyline points="5.5,5.5 2,9 5.5,12.5" fill="none" stroke="#fff" strokeWidth="1.3"/><polyline points="12.5,5.5 16,9 12.5,12.5" fill="none" stroke="#fff" strokeWidth="1.3"/></g>, // lr arrows
  (k) => <g key={k}><path d="M9,2 A7,7 0 0,1 9,16 Z" fill="#fff" opacity="0.7"/><circle cx="9" cy="9" r="7" fill="none" stroke="#fff" strokeWidth="1.1"/></g>, // half moon
  (k) => <g key={k}><path d="M4,9 C4,6 6.5,5 8.5,7 C9.5,8 10.5,9 11.5,9 C11.5,9 10.5,10 9.5,11 C7.5,13 4,12 4,9Z" fill="none" stroke="#fff" strokeWidth="1.2"/><path d="M14,9 C14,12 11.5,13 9.5,11 C8.5,10 7.5,9 6.5,9 C6.5,9 7.5,8 8.5,7 C10.5,5 14,6 14,9Z" fill="none" stroke="#fff" strokeWidth="1.2"/></g>, // infinity
  (k) => <g key={k}><rect x="2" y="2" width="14" height="14" fill="none" stroke="#fff" strokeWidth="1.1"/><line x1="2" y1="2" x2="16" y2="16" stroke="#fff" strokeWidth="1"/><line x1="16" y1="2" x2="2" y2="16" stroke="#fff" strokeWidth="1"/></g>, // reg square
  (k) => <g key={k}><path d="M0,9 C2.5,4 5,4 7,9 C9,14 11,14 13,9 C15,4 17,4 18,7" fill="none" stroke="#fff" strokeWidth="1.3"/></g>, // ac wave
  (k) => <g key={k}><line x1="9" y1="2" x2="9" y2="16" stroke="#fff" strokeWidth="1.4"/><line x1="2" y1="9" x2="16" y2="9" stroke="#fff" strokeWidth="1.4"/></g>, // plus
  (k) => <g key={k}><circle cx="9" cy="9" r="7" fill="none" stroke="#fff" strokeWidth="1.1"/><line x1="9" y1="9" x2="14" y2="4" stroke="#fff" strokeWidth="1.5"/><circle cx="9" cy="9" r="1.3" fill="#fff"/></g>, // compass
  (k) => <g key={k}><rect x="2" y="5" width="12.5" height="8" rx="1" fill="none" stroke="#fff" strokeWidth="1.2"/><rect x="14.5" y="7" width="2.5" height="4" rx="0.5" fill="#fff" opacity="0.7"/><line x1="5" y1="9" x2="10" y2="9" stroke="#fff" strokeWidth="1.3"/><line x1="7.5" y1="6.5" x2="7.5" y2="11.5" stroke="#fff" strokeWidth="1.3"/></g>, // battery
  (k) => <g key={k}><rect x="2" y="2" width="6" height="6" fill="#fff" opacity="0.8"/><rect x="10" y="2" width="6" height="6" fill="none" stroke="#fff" strokeWidth="1"/><rect x="2" y="10" width="6" height="6" fill="none" stroke="#fff" strokeWidth="1"/><rect x="10" y="10" width="6" height="6" fill="#fff" opacity="0.8"/></g>, // checker
  (k) => <g key={k}><line x1="9" y1="9" x2="9" y2="16" stroke="#fff" strokeWidth="1.2"/><path d="M5.5,6.5 A4.5,4.5 0 0,1 12.5,6.5" fill="none" stroke="#fff" strokeWidth="1.1"/><path d="M3,4 A7.5,7.5 0 0,1 15,4" fill="none" stroke="#fff" strokeWidth="1.1"/><circle cx="9" cy="9" r="1.5" fill="#fff"/></g>, // antenna
  (k) => <g key={k}><polygon points="2,6 6,6 10,2 10,16 6,12 2,12" fill="none" stroke="#fff" strokeWidth="1.1"/><path d="M12.5,6 A4,4 0 0,1 12.5,12" fill="none" stroke="#fff" strokeWidth="1.1"/><path d="M14.5,4 A7,7 0 0,1 14.5,14" fill="none" stroke="#fff" strokeWidth="1.1"/></g>, // speaker
  (k) => <g key={k}><polygon points="9,1 17,9 9,17 1,9" fill="none" stroke="#fff" strokeWidth="1.3"/></g>, // diamond
  (k) => <g key={k}><polygon points="9,3 15,9 9,15 3,9" fill="#fff" opacity="0.6"/></g>, // filled diamond
  (k) => <g key={k}><polygon points="2,2 16,2 9,9" fill="none" stroke="#fff" strokeWidth="1.2"/><polygon points="2,16 16,16 9,9" fill="none" stroke="#fff" strokeWidth="1.2"/></g>, // hourglass
  (k) => <g key={k}><circle cx="9" cy="9" r="3.5" fill="none" stroke="#fff" strokeWidth="1.3"/>{[0,45,90,135,180,225,270,315].map(a => <rect key={a} x="8.1" y="0.5" width="1.8" height="3" fill="#fff" opacity="0.85" transform={`rotate(${a},9,9)`}/>)}</g>, // gear
  (k) => <g key={k}><path d="M1.5,9 C4,4.5 7,3 9,3 C11,3 14,4.5 16.5,9 C14,13.5 11,15 9,15 C7,15 4,13.5 1.5,9Z" fill="none" stroke="#fff" strokeWidth="1.1"/><circle cx="9" cy="9" r="3" fill="none" stroke="#fff" strokeWidth="1.1"/><circle cx="9" cy="9" r="1.4" fill="#fff"/></g>, // eye
  (k) => <g key={k}><rect x="3" y="8" width="12" height="9" rx="2" fill="none" stroke="#fff" strokeWidth="1.3"/><path d="M5.5,8 L5.5,5.5 A3.5,3.5 0 0,1 12.5,5.5 L12.5,8" fill="none" stroke="#fff" strokeWidth="1.2"/></g>, // lock
  (k) => <g key={k}>{[0,45,90,135].map(a => <line key={a} x1="9" y1="2" x2="9" y2="16" stroke="#fff" strokeWidth="1.4" transform={`rotate(${a},9,9)`}/>)}</g>, // asterisk
  (k) => <g key={k}><circle cx="9" cy="9" r="7.5" fill="none" stroke="#fff" strokeWidth="1"/><circle cx="9" cy="9" r="5" fill="none" stroke="#fff" strokeWidth="1"/><circle cx="9" cy="9" r="2.5" fill="none" stroke="#fff" strokeWidth="1"/></g>, // concentric
  (k) => <g key={k}><polyline points="4,3 10.5,9 4,15" fill="none" stroke="#fff" strokeWidth="1.5"/><polyline points="9,3 15.5,9 9,15" fill="none" stroke="#fff" strokeWidth="1.5"/></g>, // chevrons
  (k) => <g key={k}><circle cx="9" cy="5.5" r="3.2" fill="none" stroke="#fff" strokeWidth="1.2"/><path d="M2.5,17 C2.5,11.5 15.5,11.5 15.5,17" fill="none" stroke="#fff" strokeWidth="1.2"/></g>, // person
  (k) => <g key={k}><circle cx="7.5" cy="7.5" r="5.5" fill="none" stroke="#fff" strokeWidth="1.3"/><line x1="11.5" y1="11.5" x2="17" y2="17" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></g>, // magnifier
  (k) => <g key={k}>{[3,9,15].flatMap(x => [3,9,15].map(y => <circle key={`${x}${y}`} cx={x} cy={y} r="1.4" fill="#fff" opacity="0.85"/>))}</g>, // dot grid
  (k) => <g key={k}><circle cx="9" cy="9" r="7" fill="none" stroke="#fff" strokeWidth="1.2"/><line x1="9" y1="8" x2="9" y2="14" stroke="#fff" strokeWidth="1.6"/><circle cx="9" cy="5.5" r="1" fill="#fff"/></g>, // info
  (k) => <g key={k}><circle cx="6.5" cy="9" r="5" fill="none" stroke="#fff" strokeWidth="1.2"/><circle cx="11.5" cy="9" r="5" fill="none" stroke="#fff" strokeWidth="1.2"/></g>, // venn
  (k) => <g key={k}><polyline points="14,2 4,2 10,9 4,16 14,16" fill="none" stroke="#fff" strokeWidth="1.4"/></g>, // sigma
  (k) => <g key={k}><line x1="1" y1="12" x2="17" y2="12" stroke="#fff" strokeWidth="1.3"/><line x1="1" y1="9" x2="1" y2="15" stroke="#fff" strokeWidth="1.3"/><line x1="17" y1="9" x2="17" y2="15" stroke="#fff" strokeWidth="1.3"/><line x1="5" y1="10.5" x2="5" y2="13.5" stroke="#fff" strokeWidth="1"/><line x1="9" y1="10" x2="9" y2="14" stroke="#fff" strokeWidth="1"/><line x1="13" y1="10.5" x2="13" y2="13.5" stroke="#fff" strokeWidth="1"/></g>, // ruler
  (k) => <g key={k}><path d="M14,5 A6,6 0 1,0 14,13" fill="none" stroke="#fff" strokeWidth="1.4"/><line x1="8" y1="9" x2="14" y2="9" stroke="#fff" strokeWidth="1.2"/></g>, // CE-ish
  (k) => <g key={k}><line x1="9" y1="2" x2="9" y2="16" stroke="#fff" strokeWidth="1.3"/><polyline points="4,11 9,16 14,11" fill="none" stroke="#fff" strokeWidth="1.3"/></g>, // down arrow
  (k) => <g key={k}><polyline points="1,9 7,5 7,13" fill="none" stroke="#fff" strokeWidth="1.3"/><polyline points="17,9 11,5 11,13" fill="none" stroke="#fff" strokeWidth="1.3"/></g>, // converge
  (k) => <g key={k}><line x1="2" y1="5" x2="16" y2="5" stroke="#fff" strokeWidth="1.3"/><line x1="2" y1="9" x2="16" y2="9" stroke="#fff" strokeWidth="1.3"/><line x1="2" y1="13" x2="16" y2="13" stroke="#fff" strokeWidth="1.3"/></g>, // menu
  (k) => <g key={k}><polyline points="1,9 4,9 5,3 7,15 9,3 11,15 13,9 14,9 17,9" fill="none" stroke="#fff" strokeWidth="1.2"/></g>, // pulse
  (k) => <g key={k}><line x1="4" y1="2" x2="4" y2="16" stroke="#fff" strokeWidth="1.3"/><polygon points="4,2 15.5,5.5 4,9" fill="none" stroke="#fff" strokeWidth="1.1"/></g>, // flag
  (k) => <g key={k}><circle cx="5" cy="4.5" r="2.5" fill="none" stroke="#fff" strokeWidth="1.1"/><circle cx="5" cy="13.5" r="2.5" fill="none" stroke="#fff" strokeWidth="1.1"/><line x1="7" y1="6" x2="16.5" y2="14.5" stroke="#fff" strokeWidth="1.2"/><line x1="7" y1="12" x2="16.5" y2="3.5" stroke="#fff" strokeWidth="1.2"/></g>, // scissors
  (k) => <g key={k}><path d="M9,1 L10.2,7.8 L17,9 L10.2,10.2 L9,17 L7.8,10.2 L1,9 L7.8,7.8 Z" fill="none" stroke="#fff" strokeWidth="1.2"/></g>, // sparkle
];

/* ───────────────────────────────────────────────────────────────────────────────
   BIG COMPOSITIONS — drawn in a wXh tile span. Each returns {w, h, render}.
   These are the "unique graphics": wireframe globes, barcodes, label blocks,
   world maps, big metro marks, compliance stamps, data matrices…
   Render functions draw inside a box of (w*CELL)×(h*CELL) px.
   ─────────────────────────────────────────────────────────────────────────────── */
const COMPOS = [
  // ── Wireframe globe (latitude/longitude) — 3×3
  {
    w: 3, h: 3,
    render: (k, S) => {
      const r = S * 1.3, cx = (3 * S) / 2, cy = (3 * S) / 2;
      return (
        <g key={k} fill="none" stroke="#fff" strokeWidth="1">
          <circle cx={cx} cy={cy} r={r} />
          {[0.35, 0.7].map((f, i) => <ellipse key={`v${i}`} cx={cx} cy={cy} rx={r * f} ry={r} />)}
          <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
          {[-0.6, 0.6].map((f, i) => {
            const yy = cy + r * f;
            const hw = Math.sqrt(Math.max(0, r * r - (r * f) * (r * f)));
            return <line key={`h${i}`} x1={cx - hw} y1={yy} x2={cx + hw} y2={yy} />;
          })}
        </g>
      );
    },
  },
  // ── Dotted hemisphere globe — 3×3
  {
    w: 3, h: 3,
    render: (k, S) => {
      const r = S * 1.25, cx = (3 * S) / 2, cy = (3 * S) / 2;
      const dots = [];
      const rng = makeRng(1234 + Math.round(r));
      for (let i = 0; i < 90; i++) {
        const ang = rng() * Math.PI * 2;
        const rad = Math.sqrt(rng()) * r;
        dots.push(<circle key={i} cx={cx + Math.cos(ang) * rad} cy={cy + Math.sin(ang) * rad} r="0.7" fill="#fff" opacity="0.8" />);
      }
      return <g key={k}><circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth="1" />{dots}</g>;
    },
  },
  // ── Tall barcode — 2×4
  {
    w: 2, h: 4,
    render: (k, S) => {
      const W = 2 * S, H = 4 * S;
      const rng = makeRng(777 + Math.round(H));
      const bars = [];
      let x = S * 0.3;
      while (x < W - S * 0.3) {
        const bw = 0.8 + rng() * 2.6;
        bars.push(<rect key={x} x={x} y={S * 0.3} width={bw} height={H - S * 0.6} fill="#fff" opacity="0.9" />);
        x += bw + 1 + rng() * 2.4;
      }
      return <g key={k}>{bars}</g>;
    },
  },
  // ── Wide barcode strip — 4×1
  {
    w: 4, h: 1,
    render: (k, S) => {
      const W = 4 * S, H = S;
      const rng = makeRng(555 + Math.round(W));
      const bars = [];
      let x = 2;
      while (x < W - 2) {
        const bw = 0.8 + rng() * 2.2;
        bars.push(<rect key={x} x={x} y={H * 0.18} width={bw} height={H * 0.64} fill="#fff" opacity="0.9" />);
        x += bw + 1 + rng() * 2;
      }
      return <g key={k}>{bars}</g>;
    },
  },
  // ── "CAUTION" warning label block — 4×1
  {
    w: 4, h: 1,
    render: (k, S) => {
      const W = 4 * S, H = S;
      return (
        <g key={k}>
          <rect x="1" y={H * 0.12} width={W - 2} height={H * 0.76} fill="none" stroke="#fff" strokeWidth="1" />
          <polygon points={`${S * 0.45},${H * 0.7} ${S * 0.78},${H * 0.25} ${S * 1.11},${H * 0.7}`} fill="none" stroke="#fff" strokeWidth="1" />
          <line x1={S * 0.78} y1={H * 0.4} x2={S * 0.78} y2={H * 0.56} stroke="#fff" strokeWidth="1" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={S * 1.45 + i * S * 0.6} y={H * 0.42} width={S * 0.42} height={H * 0.16} fill="#fff" opacity="0.85" />
          ))}
        </g>
      );
    },
  },
  // ── Registration roundel (concentric + ticks) — 2×2
  {
    w: 2, h: 2,
    render: (k, S) => {
      const cx = S, cy = S, r = S * 0.8;
      return (
        <g key={k} fill="none" stroke="#fff" strokeWidth="1">
          <circle cx={cx} cy={cy} r={r} />
          <circle cx={cx} cy={cy} r={r * 0.5} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={cx + Math.cos(a) * r} y1={cy + Math.sin(a) * r} x2={cx + Math.cos(a) * (r + 3)} y2={cy + Math.sin(a) * (r + 3)} />;
          })}
          <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} />
          <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
        </g>
      );
    },
  },
  // ── World-map dot scatter — 5×2
  {
    w: 5, h: 2,
    render: (k, S) => {
      const W = 5 * S, H = 2 * S;
      const rng = makeRng(9090);
      const dots = [];
      // crude continent-ish clusters
      const clusters = [[0.18, 0.5], [0.3, 0.35], [0.5, 0.55], [0.62, 0.4], [0.78, 0.6], [0.85, 0.45]];
      clusters.forEach(([cxf, cyf], ci) => {
        for (let i = 0; i < 22; i++) {
          const dx = (rng() - 0.5) * W * 0.16;
          const dy = (rng() - 0.5) * H * 0.4;
          dots.push(<circle key={`${ci}-${i}`} cx={cxf * W + dx} cy={cyf * H + dy} r="0.85" fill="#fff" opacity="0.75" />);
        }
      });
      return <g key={k}>{dots}</g>;
    },
  },
  // ── Big "M" metro mark with vertical bars — 2×3
  {
    w: 2, h: 3,
    render: (k, S) => {
      const W = 2 * S, H = 3 * S;
      return (
        <g key={k}>
          <path d={`M${W * 0.12},${H * 0.78} L${W * 0.12},${H * 0.22} L${W * 0.32},${H * 0.55} L${W * 0.52},${H * 0.22} L${W * 0.52},${H * 0.78}`} fill="none" stroke="#fff" strokeWidth="2.4" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={W * 0.62 + i * 5} y={H * 0.22} width="2.4" height={H * 0.56} fill="#fff" opacity="0.9" />
          ))}
        </g>
      );
    },
  },
  // ── CE compliance composite — 2×1
  {
    w: 2, h: 1,
    render: (k, S) => {
      const H = S;
      return (
        <g key={k} fill="none" stroke="#fff" strokeWidth="1.4">
          <path d={`M${S * 0.55},${H * 0.2} A${H * 0.3},${H * 0.3} 0 1,0 ${S * 0.55},${H * 0.8}`} />
          <path d={`M${S * 1.05},${H * 0.2} A${H * 0.3},${H * 0.3} 0 1,0 ${S * 1.05},${H * 0.8}`} />
          <line x1={S * 0.78} y1={H * 0.5} x2={S * 1.02} y2={H * 0.5} />
        </g>
      );
    },
  },
  // ── Data matrix (QR-ish) — 2×2
  {
    w: 2, h: 2,
    render: (k, S) => {
      const W = 2 * S, n = 9, cell = (W - 4) / n;
      const rng = makeRng(4242);
      const cells = [];
      for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++)
          if (rng() > 0.5)
            cells.push(<rect key={`${r}-${c}`} x={2 + c * cell} y={2 + r * cell} width={cell} height={cell} fill="#fff" opacity="0.85" />);
      // finder corners
      const finder = (ox, oy) => (
        <g>
          <rect x={2 + ox} y={2 + oy} width={cell * 3} height={cell * 3} fill="none" stroke="#fff" strokeWidth="1" />
          <rect x={2 + ox + cell} y={2 + oy + cell} width={cell} height={cell} fill="#fff" />
        </g>
      );
      return <g key={k}>{cells}{finder(0, 0)}{finder((n - 3) * cell, 0)}{finder(0, (n - 3) * cell)}</g>;
    },
  },
  // ── Sine/oscilloscope trace box — 3×2
  {
    w: 3, h: 2,
    render: (k, S) => {
      const W = 3 * S, H = 2 * S;
      let d = `M2,${H / 2}`;
      for (let x = 2; x <= W - 2; x += 3) {
        const y = H / 2 + Math.sin((x / W) * Math.PI * 4) * (H * 0.32);
        d += ` L${x},${y}`;
      }
      return (
        <g key={k}>
          <rect x="1" y="1" width={W - 2} height={H - 2} fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
          <path d={d} fill="none" stroke="#fff" strokeWidth="1.3" />
        </g>
      );
    },
  },
  // ── Stacked equalizer bars — 3×3
  {
    w: 3, h: 3,
    render: (k, S) => {
      const W = 3 * S, H = 3 * S;
      const rng = makeRng(6161);
      const bars = [];
      const n = 7;
      const bw = (W - 4) / n;
      for (let i = 0; i < n; i++) {
        const bh = (0.25 + rng() * 0.7) * (H - 4);
        bars.push(<rect key={i} x={2 + i * bw} y={H - 2 - bh} width={bw * 0.7} height={bh} fill="#fff" opacity="0.85" />);
      }
      return <g key={k}>{bars}</g>;
    },
  },
  // ── Hazard triangle pictogram set — 4×1
  {
    w: 4, h: 1,
    render: (k, S) => {
      const H = S;
      const tri = (ox, inner) => (
        <g>
          <polygon points={`${ox + S * 0.4},${H * 0.78} ${ox + S * 0.7},${H * 0.2} ${ox + S},${H * 0.78}`} fill="none" stroke="#fff" strokeWidth="1" />
          {inner}
        </g>
      );
      return (
        <g key={k}>
          {tri(0, <circle cx={S * 0.7} cy={H * 0.55} r="2.5" fill="#fff" />)}
          {tri(S, <line x1={S * 1.7} y1={H * 0.38} x2={S * 1.7} y2={H * 0.65} stroke="#fff" strokeWidth="1.5" />)}
          {tri(S * 2, <polygon points={`${S * 2.62},${H * 0.5} ${S * 2.78},${H * 0.38} ${S * 2.78},${H * 0.62}`} fill="#fff" />)}
        </g>
      );
    },
  },
  // ── Crosshair / reticle big — 3×3
  {
    w: 3, h: 3,
    render: (k, S) => {
      const cx = (3 * S) / 2, cy = (3 * S) / 2, r = S * 1.2;
      return (
        <g key={k} fill="none" stroke="#fff" strokeWidth="1">
          <circle cx={cx} cy={cy} r={r} />
          <circle cx={cx} cy={cy} r={r * 0.45} />
          <line x1={cx} y1={cy - r - 3} x2={cx} y2={cy - r * 0.45} />
          <line x1={cx} y1={cy + r * 0.45} x2={cx} y2={cy + r + 3} />
          <line x1={cx - r - 3} y1={cy} x2={cx - r * 0.45} y2={cy} />
          <line x1={cx + r * 0.45} y1={cy} x2={cx + r + 3} y2={cy} />
          <circle cx={cx} cy={cy} r="1.4" fill="#fff" />
        </g>
      );
    },
  },
  // ── Recycling / triangle arrows big — 2×2
  {
    w: 2, h: 2,
    render: (k, S) => {
      const cx = S, cy = S;
      return (
        <g key={k} fill="none" stroke="#fff" strokeWidth="1.4">
          {[0, 120, 240].map((deg) => (
            <path key={deg} d={`M${cx},${cy - S * 0.55} l${S * 0.28},${S * 0.16} l-${S * 0.1},${S * 0.05}`} transform={`rotate(${deg},${cx},${cy})`} />
          ))}
          {[0, 120, 240].map((deg) => (
            <line key={`l${deg}`} x1={cx} y1={cy - S * 0.55} x2={cx + S * 0.34} y2={cy - S * 0.35} transform={`rotate(${deg},${cx},${cy})`} />
          ))}
          <circle cx={cx} cy={cy} r={S * 0.18} />
        </g>
      );
    },
  },
  // ── Numeric strip "1234567890" — 4×1
  {
    w: 4, h: 1,
    render: (k, S) => {
      const W = 4 * S, H = S;
      return (
        <text key={k} x={W / 2} y={H * 0.72} fontSize={H * 0.62} fill="#fff" opacity="0.85" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
          1234567890
        </text>
      );
    },
  },
  // ── Vertical barcode (rotated bars) — 1×4
  {
    w: 1, h: 4,
    render: (k, S) => {
      const W = S, H = 4 * S;
      const rng = makeRng(321 + Math.round(H));
      const bars = [];
      let y = 2;
      while (y < H - 2) {
        const bh = 0.8 + rng() * 2.4;
        bars.push(<rect key={y} x={W * 0.18} y={y} width={W * 0.64} height={bh} fill="#fff" opacity="0.9" />);
        y += bh + 1 + rng() * 2.2;
      }
      return <g key={k}>{bars}</g>;
    },
  },
  // ── Wireframe torus / ring-perspective — 3×2
  {
    w: 3, h: 2,
    render: (k, S) => {
      const cx = (3 * S) / 2, cy = S, rx = S * 1.2, ry = S * 0.55;
      return (
        <g key={k} fill="none" stroke="#fff" strokeWidth="1">
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
          <ellipse cx={cx} cy={cy} rx={rx * 0.55} ry={ry * 0.55} />
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <line key={i} x1={cx + Math.cos(a) * rx * 0.55} y1={cy + Math.sin(a) * ry * 0.55} x2={cx + Math.cos(a) * rx} y2={cy + Math.sin(a) * ry} />;
          })}
        </g>
      );
    },
  },
  // ── Circuit trace / PCB routing — 4×2
  {
    w: 4, h: 2,
    render: (k, S) => {
      const W = 4 * S, H = 2 * S;
      const rng = makeRng(8123);
      const nodes = [];
      const lines = [];
      const pts = [];
      for (let i = 0; i < 6; i++) pts.push([4 + rng() * (W - 8), 4 + rng() * (H - 8)]);
      pts.forEach(([x, y], i) => {
        nodes.push(<circle key={`n${i}`} cx={x} cy={y} r="1.8" fill="#fff" opacity="0.9" />);
        if (i > 0) {
          const [px, py] = pts[i - 1];
          const midx = px; // right-angle traces
          lines.push(<polyline key={`l${i}`} points={`${px},${py} ${midx},${y} ${x},${y}`} fill="none" stroke="#fff" strokeWidth="1" opacity="0.7" />);
        }
      });
      return <g key={k}>{lines}{nodes}</g>;
    },
  },
  // ── ISO label box with text-lines + QR corner — 4×2
  {
    w: 4, h: 2,
    render: (k, S) => {
      const W = 4 * S, H = 2 * S;
      return (
        <g key={k}>
          <rect x="1" y="1" width={W - 2} height={H - 2} fill="none" stroke="#fff" strokeWidth="1" />
          <line x1="1" y1={H * 0.32} x2={W - 1} y2={H * 0.32} stroke="#fff" strokeWidth="0.8" opacity="0.6" />
          {/* mini text lines */}
          {[0.45, 0.6, 0.75].map((f, i) => (
            <rect key={i} x={S * 0.3} y={H * f} width={(2 + (i % 2)) * S} height="1.6" fill="#fff" opacity="0.7" />
          ))}
          {/* qr block */}
          {Array.from({ length: 4 }).flatMap((_, r) =>
            Array.from({ length: 4 }).map((__, c) =>
              (r + c) % 2 === 0 ? <rect key={`${r}-${c}`} x={W - S * 1.6 + c * S * 0.35} y={H * 0.42 + r * S * 0.35} width={S * 0.32} height={S * 0.32} fill="#fff" opacity="0.85" /> : null
            )
          )}
          <text x={S * 0.32} y={H * 0.24} fontSize={H * 0.18} fill="#fff" opacity="0.85" fontFamily="monospace" fontWeight="bold">OPEN GFX</text>
        </g>
      );
    },
  },
  // ── Atom / orbital paths — 2×2
  {
    w: 2, h: 2,
    render: (k, S) => {
      const cx = S, cy = S, rx = S * 0.8, ry = S * 0.32;
      return (
        <g key={k} fill="none" stroke="#fff" strokeWidth="1">
          {[0, 60, 120].map((deg) => (
            <ellipse key={deg} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${deg},${cx},${cy})`} />
          ))}
          <circle cx={cx} cy={cy} r={S * 0.16} fill="#fff" />
        </g>
      );
    },
  },
  // ── Topographic contour lines — 3×3
  {
    w: 3, h: 3,
    render: (k, S) => {
      const cx = (3 * S) / 2, cy = (3 * S) / 2;
      return (
        <g key={k} fill="none" stroke="#fff" strokeWidth="0.9">
          {[1.3, 1.0, 0.7, 0.4].map((f, i) => (
            <path key={i} d={`M${cx - S * f},${cy} a${S * f},${S * f * 0.8} 0 1,0 ${S * f * 2},0 a${S * f},${S * f * 0.8} 0 1,0 ${-S * f * 2},0`} opacity={0.85 - i * 0.1} />
          ))}
        </g>
      );
    },
  },
  // ── Bracketed measurement / dimension callout — 4×1
  {
    w: 4, h: 1,
    render: (k, S) => {
      const W = 4 * S, H = S;
      return (
        <g key={k} stroke="#fff" strokeWidth="1.2" fill="none">
          <line x1={S * 0.3} y1={H * 0.3} x2={S * 0.3} y2={H * 0.7} />
          <line x1={W - S * 0.3} y1={H * 0.3} x2={W - S * 0.3} y2={H * 0.7} />
          <line x1={S * 0.3} y1={H * 0.5} x2={W - S * 0.3} y2={H * 0.5} />
          <polyline points={`${S * 0.7},${H * 0.35} ${S * 0.3},${H * 0.5} ${S * 0.7},${H * 0.65}`} />
          <polyline points={`${W - S * 0.7},${H * 0.35} ${W - S * 0.3},${H * 0.5} ${W - S * 0.7},${H * 0.65}`} />
          <text x={W / 2} y={H * 0.42} fontSize={H * 0.34} fill="#fff" stroke="none" opacity="0.85" fontFamily="monospace" textAnchor="middle">625.4</text>
        </g>
      );
    },
  },
  // ── Snowflake / radial crystal — 2×2
  {
    w: 2, h: 2,
    render: (k, S) => {
      const cx = S, cy = S, r = S * 0.78;
      return (
        <g key={k} stroke="#fff" strokeWidth="1" fill="none">
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            const ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r;
            const bx = cx + Math.cos(a) * r * 0.55, by = cy + Math.sin(a) * r * 0.55;
            const pa = a + 0.5, pb = a - 0.5;
            return (
              <g key={i}>
                <line x1={cx} y1={cy} x2={ex} y2={ey} />
                <line x1={bx} y1={by} x2={bx + Math.cos(pa) * r * 0.3} y2={by + Math.sin(pa) * r * 0.3} />
                <line x1={bx} y1={by} x2={bx + Math.cos(pb) * r * 0.3} y2={by + Math.sin(pb) * r * 0.3} />
              </g>
            );
          })}
        </g>
      );
    },
  },
  // ── DNA / double-helix strip — 1×4
  {
    w: 1, h: 4,
    render: (k, S) => {
      const W = S, H = 4 * S;
      const rungs = [];
      const left = [], right = [];
      const n = 16;
      for (let i = 0; i <= n; i++) {
        const y = (i / n) * (H - 4) + 2;
        const ph = (i / n) * Math.PI * 3;
        const lx = W / 2 + Math.sin(ph) * W * 0.32;
        const rx = W / 2 - Math.sin(ph) * W * 0.32;
        left.push(`${lx},${y}`);
        right.push(`${rx},${y}`);
        if (i % 2 === 0) rungs.push(<line key={i} x1={lx} y1={y} x2={rx} y2={y} stroke="#fff" strokeWidth="0.7" opacity="0.6" />);
      }
      return (
        <g key={k}>
          <polyline points={left.join(" ")} fill="none" stroke="#fff" strokeWidth="1" />
          <polyline points={right.join(" ")} fill="none" stroke="#fff" strokeWidth="1" />
          {rungs}
        </g>
      );
    },
  },
  // ── Big "®/©" certification stamp ring — 2×2
  {
    w: 2, h: 2,
    render: (k, S) => {
      const cx = S, cy = S, r = S * 0.78;
      return (
        <g key={k} fill="none" stroke="#fff" strokeWidth="1.1">
          <circle cx={cx} cy={cy} r={r} />
          <circle cx={cx} cy={cy} r={r * 0.62} />
          {/* serration */}
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return <line key={i} x1={cx + Math.cos(a) * r} y1={cy + Math.sin(a) * r} x2={cx + Math.cos(a) * (r + 2.2)} y2={cy + Math.sin(a) * (r + 2.2)} />;
          })}
          <text x={cx} y={cy + S * 0.18} fontSize={S * 0.5} fill="#fff" stroke="none" textAnchor="middle" fontFamily="serif">R</text>
        </g>
      );
    },
  },
  // ── Waveform packet / signal burst — 3×1
  {
    w: 3, h: 1,
    render: (k, S) => {
      const W = 3 * S, H = S;
      const rng = makeRng(4711);
      let d = `M2,${H / 2}`;
      for (let x = 2; x <= W - 2; x += 2) {
        const env = Math.sin((x / W) * Math.PI); // amplitude envelope
        const y = H / 2 + (rng() - 0.5) * H * 0.9 * env;
        d += ` L${x},${y}`;
      }
      return <path key={k} d={d} fill="none" stroke="#fff" strokeWidth="1" />;
    },
  },
  // ── Nested rotated squares — 2×2
  {
    w: 2, h: 2,
    render: (k, S) => {
      const cx = S, cy = S;
      return (
        <g key={k} fill="none" stroke="#fff" strokeWidth="1">
          {[0.8, 0.6, 0.4].map((f, i) => {
            const r = S * f;
            return <rect key={i} x={cx - r} y={cy - r} width={r * 2} height={r * 2} transform={`rotate(${i * 22},${cx},${cy})`} opacity={0.9 - i * 0.15} />;
          })}
        </g>
      );
    },
  },
  // ── Arrow-cycle / sync loop — 2×2
  {
    w: 2, h: 2,
    render: (k, S) => {
      const cx = S, cy = S, r = S * 0.6;
      return (
        <g key={k} fill="none" stroke="#fff" strokeWidth="1.3">
          <path d={`M${cx + r},${cy} A${r},${r} 0 1,1 ${cx},${cy - r}`} />
          <polyline points={`${cx - 3},${cy - r - 3} ${cx},${cy - r} ${cx + 3},${cy - r - 3}`} />
          <path d={`M${cx - r},${cy} A${r},${r} 0 1,1 ${cx},${cy + r}`} />
          <polyline points={`${cx + 3},${cy + r + 3} ${cx},${cy + r} ${cx - 3},${cy + r + 3}`} />
        </g>
      );
    },
  },
  // ── Mini world-map (simplified continents outline) — 5×3
  {
    w: 5, h: 3,
    render: (k, S) => {
      const W = 5 * S, H = 3 * S;
      const rng = makeRng(2024);
      const blobs = [];
      const centers = [[0.2, 0.45, 0.9, 0.7], [0.32, 0.62, 0.55, 0.6], [0.5, 0.5, 0.7, 0.9], [0.6, 0.42, 0.6, 0.55], [0.78, 0.58, 0.85, 0.75], [0.84, 0.4, 0.45, 0.4]];
      centers.forEach(([cxf, cyf, sw, sh], ci) => {
        const cx = cxf * W, cy = cyf * H, rw = sw * S, rh = sh * S;
        let d = "";
        const n = 10;
        for (let i = 0; i <= n; i++) {
          const a = (i / n) * Math.PI * 2;
          const rr = 0.6 + rng() * 0.6;
          const x = cx + Math.cos(a) * rw * rr;
          const y = cy + Math.sin(a) * rh * rr;
          d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
        }
        d += " Z";
        blobs.push(<path key={ci} d={d} fill="none" stroke="#fff" strokeWidth="1" opacity="0.8" />);
      });
      return <g key={k}>{blobs}</g>;
    },
  },
  // ── Pie / sector gauge — 2×2
  {
    w: 2, h: 2,
    render: (k, S) => {
      const cx = S, cy = S, r = S * 0.78;
      return (
        <g key={k} stroke="#fff" strokeWidth="1" fill="none">
          <circle cx={cx} cy={cy} r={r} />
          <line x1={cx} y1={cy} x2={cx} y2={cy - r} />
          <line x1={cx} y1={cy} x2={cx + r * 0.85} y2={cy + r * 0.5} />
          <path d={`M${cx},${cy - r} A${r},${r} 0 0,1 ${cx + r * 0.85},${cy + r * 0.5} L${cx},${cy} Z`} fill="#fff" opacity="0.25" stroke="none" />
        </g>
      );
    },
  },
  // ── Stacked horizontal data bars (varying widths) — 3×2
  {
    w: 3, h: 2,
    render: (k, S) => {
      const W = 3 * S, H = 2 * S;
      const rng = makeRng(9988);
      const rows = [];
      const n = 5;
      for (let i = 0; i < n; i++) {
        const bw = (0.3 + rng() * 0.65) * (W - 6);
        rows.push(<rect key={i} x="2" y={2 + i * ((H - 4) / n)} width={bw} height={(H - 4) / n - 2} fill="#fff" opacity={0.5 + rng() * 0.4} />);
      }
      return <g key={k}>{rows}</g>;
    },
  },
];

/* ───────────────────────────────────────────────────────────────────────────────
   BAND GEOMETRY
   ─────────────────────────────────────────────────────────────────────────────── */
const VB_W = 1400;
const VB_H = 360;
const CELL = 20; // px per tile
const COLS = Math.floor(VB_W / CELL);   // 70
const ROWS = Math.floor(VB_H / CELL);   // 18

/* Build the column-skyline + tile placement.
   Distribution is EDGE-WEIGHTED: tall, dense columns at the left & right
   sides, short & sparse in the middle (a basin / valley profile).
   1. Decide a height (in rows) for each column, biased by distance-from-center.
   2. Within the filled region of each column, place tiles top-down:
      occasionally a big composition (occupying multiple cols/rows),
      otherwise a glyph, with random empty gaps (more gaps toward the middle). */
function buildField(seed) {
  const rng = makeRng(seed);

  // edgeFactor: 1.0 at the far left/right edges → ~0.55 in the dead center.
  // High center floor + steep rise = sides reach nearly full height.
  const edgeFactor = (c) => {
    const t = Math.abs(c - (COLS - 1) / 2) / ((COLS - 1) / 2); // 0 center → 1 edge
    return 0.55 + Math.pow(t, 1.3) * 0.45; // 0.55 .. 1.0
  };

  // Column heights — jagged skyline modulated by the edge profile.
  const colHeights = [];
  let jitter = 0;
  for (let c = 0; c < COLS; c++) {
    const ef = edgeFactor(c);
    // base target height grows toward the edges; push sides to (near) full height
    const target = ef * ROWS;
    // random walk jitter on top, scaled down in the middle
    jitter += (rng() - 0.5) * 3;
    jitter = Math.max(-3, Math.min(3, jitter));
    let h = Math.round(target + jitter * ef);
    if (rng() > 0.92) h = Math.round(target + (rng() - 0.5) * 4); // occasional spike
    // sides nearly full, middle still tall
    const sideMin = c < 8 || c > COLS - 9 ? ROWS - 2 : 6;
    h = Math.max(sideMin, Math.min(ROWS, h));
    colHeights.push(h);
  }

  // occupancy grid (true = taken)
  const taken = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  // a cell is "available" only if it's within the column's filled height
  const inColumn = (col, row) => row >= ROWS - colHeights[col];

  const items = []; // {x,y,w,h,type,fn,op}

  const canPlace = (col, row, w, hh) => {
    if (col + w > COLS || row + hh > ROWS) return false;
    for (let r = row; r < row + hh; r++)
      for (let c = col; c < col + w; c++) {
        if (!inColumn(c, r)) return false;
        if (taken[r][c]) return false;
      }
    return true;
  };
  const mark = (col, row, w, hh) => {
    for (let r = row; r < row + hh; r++)
      for (let c = col; c < col + w; c++) taken[r][c] = true;
  };

  // sweep cells, denser placement of big comps first
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!inColumn(col, row) || taken[row][col]) continue;

      const ef = edgeFactor(col);

      // try a big composition — more often toward the edges
      const compChance = 0.20 + ef * 0.22; // ~0.24 center, ~0.42 edges
      if (rng() < compChance) {
        const comp = COMPOS[Math.floor(rng() * COMPOS.length)];
        if (canPlace(col, row, comp.w, comp.h)) {
          mark(col, row, comp.w, comp.h);
          items.push({
            x: col * CELL, y: row * CELL,
            w: comp.w * CELL, h: comp.h * CELL,
            type: "comp", fn: comp.render,
            op: 0.7 + rng() * 0.3,
          });
          continue;
        }
      }

      // otherwise a single glyph
      const g = GLYPHS[Math.floor(rng() * GLYPHS.length)];
      mark(col, row, 1, 1);
      items.push({
        x: col * CELL, y: row * CELL, w: CELL, h: CELL,
        type: "glyph", fn: g,
        op: 0.5 + rng() * 0.45,
      });
    }
  }

  return { items, colHeights };
}

function MicrographicsBand() {
  const { items } = buildField(20260616);

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMax slice"
      className="block w-full"
      style={{ height: "clamp(200px, 26vw, 380px)" }}
      aria-hidden="true"
      focusable="false"
    >
      {/* solid black background */}
      <rect width={VB_W} height={VB_H} fill="#000" />

      {/* graphics field */}
      <g>
        {items.map((it, i) => {
          if (it.type === "glyph") {
            return (
              <g key={i} transform={`translate(${it.x + 1},${it.y + 1})`} opacity={it.op}>
                <svg viewBox="0 0 18 18" width={CELL - 2} height={CELL - 2}>
                  {it.fn(i)}
                </svg>
              </g>
            );
          }
          // composition: render in its own px box, scale factor S = CELL
          return (
            <g key={i} transform={`translate(${it.x + 1},${it.y + 1})`} opacity={it.op}>
              {it.fn(i, CELL)}
            </g>
          );
        })}
      </g>

      {/* faint scanlines for the photocopied-sheet texture */}
      <rect
        width={VB_W} height={VB_H}
        fill="url(#mgfx-scan)"
      />
      <defs>
        <pattern id="mgfx-scan" x="0" y="0" width="1" height="4" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="rgba(255,255,255,0.045)" />
        </pattern>
      </defs>
    </svg>
  );
}

export default function SiteFooter() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) {
    return null;
  }

  return (
    <footer className="relative z-[20] overflow-hidden bg-black text-white">
      <h2 className="sr-only">Abhinav Yadav</h2>

      {/* ── MICROGRAPHICS COLUMN BAND ──────────────────────────────────────── */}
      <MicrographicsBand />

      {/* OLD FOOTER (info bar + copyright) hidden for now — see git history. */}
    </footer>
  );
}
