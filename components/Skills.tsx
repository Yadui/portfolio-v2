"use client";

import { useRef, useState, useEffect } from "react";
import { motion, MotionValue, motionValue, useInView, useReducedMotion } from "framer-motion";
import {
  FaHtml5, FaJs, FaReact, FaPython, FaGithub, FaDocker, FaAws
} from "react-icons/fa";
import {
  SiTailwindcss, SiNextdotjs, SiMicrosoftazure, SiNumpy,
  SiPandas, SiOpenai, SiVisualstudiocode, SiGithubcopilot,
  SiKubernetes, SiTerraform, SiRedux, SiExpress, SiPostgresql,
  SiRedis, SiHuggingface, SiTensorflow, SiNotion, SiFigma,
  SiFastapi, SiTypescript, SiGrafana, SiPowerbi, SiPrisma,
  SiLangchain, SiN8N, SiPowerautomate
} from "react-icons/si";
import * as d3force from "d3-force";
import RevealText from "@/components/RevealText";

const initialSkills = [
  // ── Layer 1: Cloud foundation — who you are ───────────────────────────
  { id: "azure", name: "Azure", icon: <SiMicrosoftazure />, color: "#0078D4", bx: -6, by: 8, zone: "parietalLobe", group: "cloud", connections: ["aws", "docker", "next"] },
  { id: "aws", name: "AWS", icon: <FaAws />, color: "#FF9900", bx: 18, by: 32, zone: "temporalLobe", group: "cloud", connections: ["azure", "docker", "terraform"] },

  // ── Layer 2: Core languages — what you build with ────────────────────
  { id: "python", name: "Python", icon: <FaPython />, color: "#3776AB", bx: -4, by: -35, zone: "crown", group: "ai", connections: ["azure", "fastapi", "pandas"] },
  { id: "typescript", name: "TypeScript", icon: <SiTypescript />, color: "#3178C6", bx: 14, by: -6, zone: "frontalLobe", group: "web", connections: ["azure", "react", "next"] },
  { id: "js", name: "JS", icon: <FaJs />, color: "#F7DF1E", bx: 30, by: -25, zone: "frontalPole", group: "web", connections: ["typescript", "react"] },

  // ── Layer 3: Frameworks — how you build ──────────────────────────────
  { id: "react", name: "React", icon: <FaReact />, color: "#61DAFB", bx: 18, by: -12, zone: "frontalLobe", group: "web", connections: ["typescript", "next", "tailwind"] },
  { id: "next", name: "Next.js", icon: <SiNextdotjs />, color: "#000000", bx: 8, by: -2, zone: "frontalLobe", group: "web", connections: ["react", "azure", "postgres"] },
  { id: "fastapi", name: "FastAPI", icon: <SiFastapi />, color: "#009688", bx: 6, by: 6, zone: "frontalLobe", group: "web", connections: ["python", "postgres"] },

  // ── Layer 4: AI stack — your differentiator ───────────────────────────
  { id: "azureai", name: "Azure AI", img: "/icons/AzureAI_scalable.svg", icon: <SiMicrosoftazure />, color: "#0078D4", bx: -10, by: 4, zone: "parietalLobe", group: "ai", connections: ["azure", "openai", "copilotstudio"] },
  { id: "copilotstudio", name: "Copilot Studio", img: "/icons/CopilotStudio_scalable.svg", icon: <SiGithubcopilot />, color: "#8B52F4", bx: -2, by: 10, zone: "temporalLobe", group: "ai", connections: ["azureai", "powerautomate", "botservice"] },
  { id: "botservice", name: "Bot Service", img: "/icons/AzureBot_scalable.svg", icon: <SiMicrosoftazure />, color: "#32BEDD", bx: -6, by: 22, zone: "temporalLobe", group: "ai", connections: ["copilotstudio", "azureai"] },
  { id: "openai", name: "OpenAI", icon: <SiOpenai />, color: "#10A37F", bx: -6, by: -12, zone: "crown", group: "ai", connections: ["python", "azure", "langchain"] },
  { id: "huggingface", name: "HuggingFace", icon: <SiHuggingface />, color: "#FFCC00", bx: -20, by: -20, zone: "parietalLobe", group: "ai", connections: ["python", "openai"] },
  { id: "langchain", name: "LangChain", icon: <SiLangchain />, color: "#1C3C3C", bx: -8, by: -18, zone: "crown", group: "ai", connections: ["openai", "python", "fastapi"] },

  // ── Layer 5: DevOps / infra depth ─────────────────────────────────────
  { id: "docker", name: "Docker", icon: <FaDocker />, color: "#2496ED", bx: 4, by: 16, zone: "temporalLobe", group: "cloud", connections: ["azure", "aws", "k8s"] },
  { id: "k8s", name: "K8s", icon: <SiKubernetes />, color: "#326CE5", bx: -10, by: 38, zone: "stemUpper", group: "cloud", connections: ["docker", "terraform", "azure"] },
  { id: "terraform", name: "Terraform", icon: <SiTerraform />, color: "#7B42BC", bx: -12, by: 49, zone: "stemLower", group: "cloud", connections: ["aws", "k8s"] },
  { id: "github", name: "GitHub", icon: <FaGithub />, color: "#181717", bx: -8, by: 60, zone: "stemLower", group: "tools", connections: ["docker", "terraform"] },

  // ── Layer 6: Data layer ───────────────────────────────────────────────
  { id: "postgres", name: "Postgres", icon: <SiPostgresql />, color: "#336791", bx: -26, by: 28, zone: "cerebellum", group: "cloud", connections: ["docker", "fastapi", "prisma"] },
  { id: "redis", name: "Redis", icon: <SiRedis />, color: "#DC382D", bx: -35, by: 33, zone: "cerebellum", group: "cloud", connections: ["docker", "next"] },
  { id: "pandas", name: "Pandas", icon: <SiPandas />, color: "#150458", bx: -28, by: 12, zone: "occipitalLobe", group: "ai", connections: ["python", "numpy"] },
  { id: "numpy", name: "NumPy", icon: <SiNumpy />, color: "#013243", bx: -30, by: -2, zone: "occipitalLobe", group: "ai", connections: ["pandas", "tensorflow"] },
  { id: "tensorflow", name: "TensorFlow", icon: <SiTensorflow />, color: "#FF6F00", bx: -16, by: 24, zone: "cerebellum", group: "ai", connections: ["numpy", "python"] },

  // ── Layer 7: Supporting cast ──────────────────────────────────────────
  { id: "tailwind", name: "Tailwind", icon: <SiTailwindcss />, color: "#06B6D4", bx: 0, by: 24, zone: "temporalLobe", group: "web", connections: ["react", "html"] },
  { id: "figma", name: "Figma", icon: <SiFigma />, color: "#F24E1E", bx: 28, by: 12, zone: "frontalPole", group: "tools", connections: ["react", "tailwind"] },
  { id: "html", name: "HTML", icon: <FaHtml5 />, color: "#E34F26", bx: 13, by: 20, zone: "temporalLobe", group: "web", connections: ["react", "tailwind"] },
  { id: "redux", name: "Redux", icon: <SiRedux />, color: "#764ABC", bx: 26, by: 4, zone: "frontalLobe", group: "web", connections: ["react"] },
  { id: "prisma", name: "Prisma", icon: <SiPrisma />, color: "#2D3748", bx: -22, by: 22, zone: "cerebellum", group: "web", connections: ["postgres", "next"] },
  { id: "express", name: "Express", icon: <SiExpress />, color: "#000000", bx: 22, by: 18, zone: "temporalLobe", group: "web", connections: ["next", "fastapi"] },

  // ── Layer 8: Tooling ──────────────────────────────────────────────────
  { id: "n8n", name: "n8n", icon: <SiN8N />, color: "#EA4B71", bx: -16, by: 44, zone: "stemUpper", group: "ai", connections: ["notion", "powerautomate"] },
  { id: "powerautomate", name: "Power Automate", icon: <SiPowerautomate />, color: "#0066FF", bx: -4, by: 18, zone: "temporalLobe", group: "ai", connections: ["azure", "copilotstudio"] },
  { id: "notion", name: "Notion", icon: <SiNotion />, color: "#000000", bx: -13, by: 70, zone: "stemLower", group: "tools", connections: ["github", "n8n"] },
  { id: "grafana", name: "Grafana", icon: <SiGrafana />, color: "#F46800", bx: -10, by: 14, zone: "parietalLobe", group: "cloud", connections: ["azure", "postgres"] },
  { id: "powerbi", name: "Power BI", icon: <SiPowerbi />, color: "#F2C811", bx: -2, by: 12, zone: "parietalLobe", group: "cloud", connections: ["azure", "grafana"] },
  { id: "vscode", name: "VS Code", icon: <SiVisualstudiocode />, color: "#007ACC", bx: -14, by: 30, zone: "stemUpper", group: "tools", connections: ["github", "docker"] },
  { id: "copilot", name: "Copilot", icon: <SiGithubcopilot />, color: "#000000", bx: -15, by: 2, zone: "parietalLobe", group: "ai", connections: ["openai", "vscode"] },
] as const;

type SkillId = (typeof initialSkills)[number]["id"];
type SkillDefinition = (typeof initialSkills)[number];
type BrainZoneKey = SkillDefinition["zone"];
type SkillLink = {
  source: SkillId;
  target: SkillId;
};

type SkillNode = {
  id: SkillId;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  targetX?: number;
  targetY?: number;
} & SkillDefinition;

const BRAIN_X_STRETCH = 1.22;

const REVEAL_START_DELAY = 0.12;
const REVEAL_STEP_DELAY = 0.58;
const NODE_REVEAL_DURATION = 0.42;
const EDGE_REVEAL_DURATION = 0.34;
const EDGE_REVEAL_OFFSET = 0.28;

const baseBrainZones: Record<BrainZoneKey, { cx: number; cy: number; rx: number; ry: number }> = {
  frontalPole: { cx: 30, cy: -20, rx: 10, ry: 14 },
  frontalLobe: { cx: 18, cy: -2, rx: 16, ry: 23 },
  crown: { cx: -4, cy: -24, rx: 18, ry: 12 },
  parietalLobe: { cx: -18, cy: -4, rx: 18, ry: 21 },
  occipitalLobe: { cx: -33, cy: 5, rx: 10, ry: 16 },
  temporalLobe: { cx: 10, cy: 19, rx: 17, ry: 13 },
  cerebellum: { cx: -26, cy: 29, rx: 11, ry: 9 },
  stemUpper: { cx: -12, cy: 38, rx: 7, ry: 8 },
  stemLower: { cx: -11, cy: 55, rx: 7, ry: 14 },
};

const getBrainZones = (scale: number) =>
  Object.fromEntries(
    Object.entries(baseBrainZones).map(([zoneKey, zone]) => [
      zoneKey,
      {
        cx: zone.cx * scale * BRAIN_X_STRETCH,
        cy: zone.cy * scale,
        rx: zone.rx * scale * BRAIN_X_STRETCH,
        ry: zone.ry * scale,
      },
    ])
  ) as Record<BrainZoneKey, { cx: number; cy: number; rx: number; ry: number }>;

const baseBrainBounds = (() => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  initialSkills.forEach(({ bx, by }) => {
    const stretchedX = bx * BRAIN_X_STRETCH;
    minX = Math.min(minX, stretchedX);
    maxX = Math.max(maxX, stretchedX);
    minY = Math.min(minY, by);
    maxY = Math.max(maxY, by);
  });

  Object.values(baseBrainZones).forEach(({ cx, cy, rx, ry }) => {
    minX = Math.min(minX, (cx - rx) * BRAIN_X_STRETCH);
    maxX = Math.max(maxX, (cx + rx) * BRAIN_X_STRETCH);
    minY = Math.min(minY, cy - ry);
    maxY = Math.max(maxY, cy + ry);
  });

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
})();

const getNodeRadius = (viewportWidth: number) => {
  if (viewportWidth < 640) {
    return 16;
  }

  if (viewportWidth < 768) {
    return 20;
  }

  if (viewportWidth < 1024) {
    return 24;
  }

  return 28;
};

const clampValue = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Target points forming the "A" monogram (Abhinav) — normalized coords,
 * x/y ∈ [-1, 1] with y pointing down. Parametric in node count so the
 * silhouette survives skills being added/removed:
 *  - 1 apex point
 *  - two legs from the apex to the bottom corners
 *  - an interior crossbar (the legs provide the bar's ends)
 */
const buildMonogramPoints = (count: number): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = [];
  const barCount = Math.max(3, Math.round(count * 0.24));
  const legTotal = Math.max(2, count - 1 - barCount);
  const leftCount = Math.ceil(legTotal / 2);
  const rightCount = legTotal - leftCount;

  // Apex
  points.push({ x: 0, y: -1 });

  // Legs: apex → bottom corners
  for (let i = 1; i <= leftCount; i += 1) {
    const t = i / leftCount;
    points.push({ x: -0.85 * t, y: -1 + 2 * t });
  }
  for (let i = 1; i <= rightCount; i += 1) {
    const t = i / rightCount;
    points.push({ x: 0.85 * t, y: -1 + 2 * t });
  }

  // Crossbar (interior points only)
  const barY = 0.35;
  for (let i = 0; i < barCount && points.length < count; i += 1) {
    const t = barCount === 1 ? 0.5 : i / (barCount - 1);
    points.push({ x: -0.45 + 0.9 * t, y: barY });
  }

  // Safety: if rounding left us short, pad along the centerline.
  while (points.length < count) {
    points.push({ x: 0, y: -0.2 + (points.length % 5) * 0.12 });
  }

  return points.slice(0, count);
};

const getDistributedTargets = (
  width: number,
  height: number,
  nodeRadius: number
) => {
  const count = initialSkills.length;
  const marginX = Math.max(nodeRadius * 1.75, width * 0.1);
  const marginY = Math.max(nodeRadius * 1.75, height * 0.12);
  const halfW = Math.max((width / 2) - marginX, nodeRadius * 2);
  const halfH = Math.max((height / 2) - marginY, nodeRadius * 2);
  // Keep the monogram's proportions: never wider than 1.4× its height.
  const shapeHalfW = Math.min(halfW, halfH * 1.4);

  const shapePoints = buildMonogramPoints(count)
    .map((point) => ({ x: point.x * shapeHalfW, y: point.y * halfH }))
    // Reading order (top → bottom, left → right) for stable assignment.
    .sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));

  const sortedSkills = [...initialSkills].sort((a, b) => {
    if (a.by === b.by) {
      return (a.bx * BRAIN_X_STRETCH) - (b.bx * BRAIN_X_STRETCH);
    }

    return a.by - b.by;
  });

  return sortedSkills.reduce((acc, skill, index) => {
    const point = shapePoints[Math.min(index, shapePoints.length - 1)];
    acc[skill.id] = { x: point.x, y: point.y };
    return acc;
  }, {} as Record<SkillId, { x: number; y: number }>);
};

const getSkillLinkKey = (source: SkillId, target: SkillId) =>
  [source, target].sort().join("::");

const skillLinks = (() => {
  const seen = new Set<string>();
  const links: SkillLink[] = [];
  const extraConnections: Array<[SkillId, SkillId]> = [
    ["react", "openai"],
    ["react", "azure"],
    ["next", "redis"],
    ["docker", "tensorflow"],
    ["docker", "redis"],
    ["azure", "k8s"],
    ["aws", "k8s"],
    ["python", "tensorflow"],
    ["python", "huggingface"],
    ["numpy", "tensorflow"],
    ["openai", "huggingface"],
    ["pandas", "tensorflow"],
    ["vscode", "next"],
    ["vscode", "docker"],
    ["github", "docker"],
    ["github", "terraform"],
    ["figma", "react"],
    ["notion", "vscode"],
  ];

  initialSkills.forEach((skill) => {
    skill.connections.forEach((target) => {
      const key = getSkillLinkKey(skill.id, target);
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      const [sourceId, targetId] = [skill.id, target].sort() as [SkillId, SkillId];
      links.push({ source: sourceId, target: targetId });
    });
  });

  extraConnections.forEach(([source, target]) => {
    const key = getSkillLinkKey(source, target);
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    const [sourceId, targetId] = [source, target].sort() as [SkillId, SkillId];
    links.push({ source: sourceId, target: targetId });
  });

  return links;
})();

const revealDepthById = (() => {
  const adjacency = new Map<SkillId, SkillId[]>(
    initialSkills.map((skill) => [skill.id, []])
  );

  skillLinks.forEach(({ source, target }) => {
    adjacency.get(source)?.push(target);
    adjacency.get(target)?.push(source);
  });

  const root: SkillId = "azure";
  const queue: SkillId[] = [root];
  const depths = new Map<SkillId, number>([[root, 0]]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const currentDepth = depths.get(current) ?? 0;
    adjacency.get(current)?.forEach((neighbor) => {
      if (depths.has(neighbor)) {
        return;
      }

      depths.set(neighbor, currentDepth + 1);
      queue.push(neighbor);
    });
  }

  const fallbackDepth = Math.max(...Array.from(depths.values()), 0) + 1;

  return initialSkills.reduce((acc, skill, index) => {
    acc[skill.id] = depths.get(skill.id) ?? fallbackDepth + index;
    return acc;
  }, {} as Record<SkillId, number>);
})();

const nodeRevealDelayById = initialSkills.reduce((acc, skill) => {
  acc[skill.id] = REVEAL_START_DELAY + (revealDepthById[skill.id] * REVEAL_STEP_DELAY);
  return acc;
}, {} as Record<SkillId, number>);

const linkRevealDelayByKey = skillLinks.reduce((acc, link) => {
  const sourceDepth = revealDepthById[link.source];
  const targetDepth = revealDepthById[link.target];
  const shallowerDepth = Math.min(sourceDepth, targetDepth);
  const deeperDepth = Math.max(sourceDepth, targetDepth);

  acc[getSkillLinkKey(link.source, link.target)] =
    REVEAL_START_DELAY + ((deeperDepth === shallowerDepth + 1 ? shallowerDepth : deeperDepth) * REVEAL_STEP_DELAY) + EDGE_REVEAL_OFFSET;

  return acc;
}, {} as Record<string, number>);

const totalRevealTimeMs = (
  Math.max(
    ...Object.values(nodeRevealDelayById),
    ...Object.values(linkRevealDelayByKey)
  ) + NODE_REVEAL_DURATION + 0.35
) * 1000;

const getZoneBoundaryPoint = (
  x: number,
  y: number,
  zone: { cx: number; cy: number; rx: number; ry: number }
) => {
  const dx = x - zone.cx;
  const dy = y - zone.cy;
  const normalized = (dx * dx) / (zone.rx * zone.rx) + (dy * dy) / (zone.ry * zone.ry);

  if (normalized <= 1) {
    return null;
  }

  const angle = Math.atan2(dy / zone.ry, dx / zone.rx);

  return {
    x: zone.cx + (Math.cos(angle) * zone.rx),
    y: zone.cy + (Math.sin(angle) * zone.ry),
  };
};

const SkillConnection = ({
  x1, y1, x2, y2,
  isRelated,
  shouldReveal,
  revealDelay,
  reduceMotion,
  entranceComplete,
  active,
}: {
  x1: MotionValue<number>;
  y1: MotionValue<number>;
  x2: MotionValue<number>;
  y2: MotionValue<number>;
  isRelated: boolean;
  shouldReveal: boolean;
  revealDelay: number;
  reduceMotion: boolean;
  entranceComplete: boolean;
  active: boolean;
}) => {
  const [timing, setTiming] = useState<{ duration: number; delay: number; repeatDelay: number } | null>(null);

  useEffect(() => {
    const duration = 1.8 + (Math.random() * 2.1);
    const delay = Math.random() * 0.8;
    const repeatDelay = 1.1 + (Math.random() * 2.4);

    setTiming({ duration, delay, repeatDelay });
  }, []);

  const baseOpacity = isRelated ? 1 : 0.28;
  const pulseOpacity = isRelated ? 1 : 0.45;
  const baseTransition = reduceMotion
    ? { duration: 0 }
    : entranceComplete
      ? { duration: 0.18 }
      : {
          duration: EDGE_REVEAL_DURATION,
          delay: revealDelay,
          ease: [0.22, 1, 0.36, 1],
        };

  return (
    <>
      <motion.line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={isRelated ? "#10b981" : "rgba(255,255,255,0.22)"}
        strokeWidth={isRelated ? 2.2 : 1.1}
        strokeLinecap="round"
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={
          shouldReveal
            ? { pathLength: 1, opacity: baseOpacity }
            : { pathLength: reduceMotion ? 1 : 0, opacity: 0 }
        }
        transition={baseTransition}
      />
      {timing && shouldReveal && (
        <motion.line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={isRelated ? "#10b981" : "#4ade80"}
          strokeWidth={isRelated ? 2.4 : 2.8}
          strokeLinecap="round"
          strokeDasharray="14 1000"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={
            reduceMotion
              ? { opacity: pulseOpacity }
              : active
                ? { opacity: pulseOpacity, strokeDashoffset: [-1014, 14] }
                : { opacity: 0 }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : !active
                ? { opacity: { duration: 0.2 } }
                : {
                    opacity: entranceComplete
                      ? { duration: 0.18 }
                      : { duration: 0.24, delay: revealDelay + 0.08 },
                    strokeDashoffset: {
                      duration: timing.duration,
                      repeat: Infinity,
                      repeatDelay: timing.repeatDelay,
                      delay: revealDelay + timing.delay,
                      ease: "linear",
                    },
                  }
          }
        />
      )}
    </>
  );
};

export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [entranceComplete, setEntranceComplete] = useState(false);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(containerRef, { once: true, amount: 0.35 });
  // Live visibility (not `once`): pauses the gas simulation and the ~30
  // infinite edge pulses the moment the section scrolls away.
  const isOnScreen = useInView(containerRef, { amount: 0.1 });
  const isOnScreenRef = useRef(isOnScreen);
  isOnScreenRef.current = isOnScreen;
  const canvasBoundsRef = useRef<{ minX: number; maxX: number; minY: number; maxY: number } | null>(null);

  const positionsRef = useRef<Record<string, { x: MotionValue<number>; y: MotionValue<number> }> | null>(null);
  if (!positionsRef.current) {
    positionsRef.current = initialSkills.reduce((acc, s) => {
      acc[s.id] = { x: motionValue(0), y: motionValue(0) };
      return acc;
    }, {} as Record<string, { x: MotionValue<number>; y: MotionValue<number> }>);
  }
  const positions = positionsRef.current;

  const [scale, setScale] = useState(1);
  const nodesRef = useRef<SkillNode[]>([]);
  const shouldRevealGraph = isInView;

  useEffect(() => {
    if (!shouldRevealGraph) {
      return;
    }

    if (reduceMotion) {
      setEntranceComplete(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setEntranceComplete(true);
    }, totalRevealTimeMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [reduceMotion, shouldRevealGraph]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateScale = () => {
      const rect = container.getBoundingClientRect();
      const nodeRadius = getNodeRadius(window.innerWidth);
      const availableWidth = Math.max(rect.width - ((nodeRadius + 18) * 2), 1);
      const availableHeight = Math.max(rect.height - ((nodeRadius + 26) * 2), 1);
      const fittedScale = Math.min(
        availableWidth / baseBrainBounds.width,
        availableHeight / baseBrainBounds.height
      );

      setScale(clampValue(fittedScale * 0.94, 2.4, 6.2));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(container);
    window.addEventListener("resize", updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  // ── Gas-particle simulation ──────────────────────────────────────────
  // The nodes behave like slow gas molecules in a chamber: frictionless
  // drift (velocityDecay 0), perpetual motion (alphaDecay 0), elastic wall
  // bounces, soft node-node collisions via forceCollide, a whisper of
  // Brownian jitter, and a speed band that keeps the cloud calm enough to
  // read and hover.
  useEffect(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const nodeRadius = getNodeRadius(window.innerWidth);

    const bounds = {
      minX: (-rect.width / 2) + nodeRadius,
      maxX: (rect.width / 2) - nodeRadius,
      minY: (-rect.height / 2) + nodeRadius,
      maxY: (rect.height / 2) - nodeRadius,
    };
    canvasBoundsRef.current = bounds;

    const MIN_SPEED = 0.22; // px per tick (~13 px/s) — lazy drift
    const MAX_SPEED = 0.6; //  px per tick (~36 px/s) — post-fling cap
    const JITTER = 0.014;

    const existing = nodesRef.current;
    const nodes: SkillNode[] =
      existing.length > 0
        ? existing
        : initialSkills.map((s) => {
            const angle = Math.random() * Math.PI * 2;
            const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
            return {
              ...s,
              x: (Math.random() * 2 - 1) * Math.max(rect.width / 2 - nodeRadius * 2.5, 1),
              y: (Math.random() * 2 - 1) * Math.max(rect.height / 2 - nodeRadius * 2.5, 1),
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
            } as SkillNode;
          });
    nodesRef.current = nodes;

    // After a resize, pull any stragglers back inside the new chamber.
    nodes.forEach((node) => {
      node.x = clampValue(node.x, bounds.minX, bounds.maxX);
      node.y = clampValue(node.y, bounds.minY, bounds.maxY);
    });

    const gasForce = () => {
      nodes.forEach((node: any) => {
        if (typeof node.fx === "number") return; // pinned by an active drag

        // Elastic walls: reflect the velocity at the chamber edges.
        if (node.x <= bounds.minX) {
          node.x = bounds.minX;
          node.vx = Math.abs(node.vx ?? MIN_SPEED);
        } else if (node.x >= bounds.maxX) {
          node.x = bounds.maxX;
          node.vx = -Math.abs(node.vx ?? MIN_SPEED);
        }
        if (node.y <= bounds.minY) {
          node.y = bounds.minY;
          node.vy = Math.abs(node.vy ?? MIN_SPEED);
        } else if (node.y >= bounds.maxY) {
          node.y = bounds.maxY;
          node.vy = -Math.abs(node.vy ?? MIN_SPEED);
        }

        // Brownian jitter keeps the cloud from settling into lanes.
        node.vx = (node.vx ?? 0) + (Math.random() - 0.5) * JITTER;
        node.vy = (node.vy ?? 0) + (Math.random() - 0.5) * JITTER;

        // Regulate speed into the gas band.
        const speed = Math.hypot(node.vx, node.vy) || MIN_SPEED;
        if (speed > MAX_SPEED) {
          node.vx = (node.vx / speed) * MAX_SPEED;
          node.vy = (node.vy / speed) * MAX_SPEED;
        } else if (speed < MIN_SPEED) {
          node.vx = (node.vx / speed) * MIN_SPEED;
          node.vy = (node.vy / speed) * MIN_SPEED;
        }
      });
    };

    const simulation = d3force.forceSimulation(nodes as any)
      .force("collide", d3force.forceCollide(nodeRadius * 1.25).strength(0.9))
      .force("gas", gasForce as any)
      .velocityDecay(0) // a gas has no friction
      .alpha(1)
      .alphaDecay(0) // never cools down — perpetual drift
      .alphaMin(0);

    simulation.on("tick", () => {
      nodes.forEach((node) => {
        positions[node.id].x.set(node.x);
        positions[node.id].y.set(node.y);
      });
    });

    if (reduceMotion) {
      // Static scatter: resolve overlaps once, then freeze.
      simulation.stop();
      for (let i = 0; i < 60; i += 1) simulation.tick();
      nodes.forEach((node) => {
        positions[node.id].x.set(node.x);
        positions[node.id].y.set(node.y);
      });
    } else if (!isOnScreenRef.current) {
      simulation.stop();
    }

    (containerRef.current as any).__simulation = simulation;

    return () => {
      simulation.stop();
    };
  }, [positions, scale, reduceMotion]);

  // Pause the chamber whenever it scrolls off-screen; resume on return.
  useEffect(() => {
    if (reduceMotion) return;
    const simulation = (containerRef.current as any)?.__simulation;
    if (!simulation) return;
    if (isOnScreen) {
      simulation.restart();
    } else {
      simulation.stop();
    }
  }, [isOnScreen, reduceMotion]);

  const handleDragStart = (id: string) => {
    setDraggingId(id);
    const simulation = (containerRef.current as any)?.__simulation;
    const node = nodesRef.current.find((n) => n.id === id);
    if (simulation && node) {
      if (!reduceMotion) simulation.restart();
      node.fx = node.x;
      node.fy = node.y;
    }
  };

  const handleDrag = (id: string, info: any) => {
    const node = nodesRef.current.find((n) => n.id === id);
    const bounds = canvasBoundsRef.current;

    if (node && bounds) {
      const nextX = clampValue(positions[id].x.get(), bounds.minX, bounds.maxX);
      const nextY = clampValue(positions[id].y.get(), bounds.minY, bounds.maxY);

      positions[id].x.set(nextX);
      positions[id].y.set(nextY);
      node.fx = nextX;
      node.fy = nextY;
    }
  };

  const handleDragEnd = (id: string, info?: any) => {
    setDraggingId(null);
    const simulation = (containerRef.current as any)?.__simulation;
    const node = nodesRef.current.find((n) => n.id === id) as any;
    if (simulation && node) {
      node.fx = null;
      node.fy = null;

      // Fling: hand the drag velocity (px/s → px/tick) to the gas. The
      // speed band in gasForce gradually tames it back to a drift.
      if (info?.velocity) {
        node.vx = clampValue(info.velocity.x / 60, -2.5, 2.5);
        node.vy = clampValue(info.velocity.y / 60, -2.5, 2.5);
      }

      if (!reduceMotion && isOnScreenRef.current) {
        simulation.restart();
      }
    }
  };


  return (
    <section
      id="skills"
      className="relative flex h-below-nav flex-col overflow-hidden bg-black pb-[clamp(1.5rem,4vh,5rem)] text-white"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "86px 86px",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,0.55), transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col pt-[clamp(1.25rem,3vh,2rem)]">
        <div className="flex-shrink-0 px-[clamp(1.25rem,3vw,3rem)]">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">
            Capabilities
          </span>
          <RevealText
            as="h2"
            className="portfolio-title mt-1 text-4xl uppercase text-white md:text-5xl"
          >
            Skills
          </RevealText>
        </div>

        {/* Borderless, full-bleed gas chamber — the nodes drift and bounce
            edge to edge with nothing visibly boxing them in. */}
        <div
          ref={containerRef}
          className="relative mt-2 flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden"
          style={{
            transform: "translateZ(0) scale(1)",
            transformOrigin: "center center",
          }}
        >
              {/* Node connections intentionally hidden — pure free-floating
                  gas. The SkillConnection renderer is kept above in case
                  the constellation look ever comes back. */}

              {initialSkills.map((skill) => {
                const isDragging = draggingId === skill.id;
                const isOther = draggingId && draggingId !== skill.id;

                return (
                  <motion.div
                    key={skill.id}
                    drag={shouldRevealGraph}
                    dragElastic={0.2}
                    onDragStart={() => handleDragStart(skill.id)}
                    onDrag={(e, info) => handleDrag(skill.id, info)}
                    onDragEnd={(e, info) => handleDragEnd(skill.id, info)}
                    style={{
                      x: positions[skill.id].x,
                      y: positions[skill.id].y,
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      zIndex: isDragging ? 40 : 20,
                      pointerEvents: shouldRevealGraph ? "auto" : "none",
                    }}
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, scale: 0.35, filter: "blur(12px)" }
                    }
                    animate={{
                      opacity: shouldRevealGraph ? 1 : 0,
                      scale: shouldRevealGraph ? 1 : 0.35,
                      filter: shouldRevealGraph ? "blur(0px)" : "blur(12px)",
                    }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : entranceComplete
                          ? { duration: 0.18 }
                          : {
                              duration: NODE_REVEAL_DURATION,
                              delay: nodeRevealDelayById[skill.id],
                              ease: [0.22, 1, 0.36, 1],
                            }
                    }
                  >
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        scale: isDragging ? 1.18 : 1,
                      }}
                      transition={{ duration: 0.18 }}
                      className={`-ml-4 -mt-4 flex h-8 w-8 cursor-grab items-center justify-center rounded-full border border-white/20 bg-white shadow-xl transition-[opacity,filter,box-shadow] duration-200 group active:cursor-grabbing sm:-ml-5 sm:-mt-5 sm:h-10 sm:w-10 md:-ml-6 md:-mt-6 md:h-12 md:w-12 lg:-ml-7 lg:-mt-7 lg:h-14 lg:w-14 ${isOther ? "opacity-50 blur-[1px]" : "opacity-100"}`}
                    >
                      {"img" in skill ? (
                        <img
                          src={skill.img}
                          alt={skill.name}
                          draggable={false}
                          className="h-5 w-5 select-none object-contain sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-9 lg:w-9"
                        />
                      ) : (
                        <div
                          className="text-base sm:text-xl md:text-2xl lg:text-3xl"
                          style={{ color: skill.color }}
                        >
                          {skill.icon}
                        </div>
                      )}

                      <div className="pointer-events-none absolute -bottom-6 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[9px] font-bold tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100 sm:-bottom-8 sm:text-[10px] md:text-xs">
                        {skill.name}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
