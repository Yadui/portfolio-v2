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
  SiRedis, SiHuggingface, SiTensorflow, SiNotion, SiFigma
} from "react-icons/si";
import * as d3force from "d3-force";
import ScrambledText from "@/components/ScrambledText";

const initialSkills = [
  // Frontal and crown arc
  { id: "js", name: "JS", icon: <FaJs />, color: "#F7DF1E", bx: 30, by: -25, zone: "frontalPole", group: "web", connections: ["react", "python"] },
  { id: "python", name: "Python", icon: <FaPython />, color: "#3776AB", bx: -4, by: -35, zone: "crown", group: "ai", connections: ["js", "openai", "pandas"] },
  { id: "react", name: "React", icon: <FaReact />, color: "#61DAFB", bx: 18, by: -12, zone: "frontalLobe", group: "web", connections: ["js", "next", "tailwind", "html"] },
  { id: "redux", name: "Redux", icon: <SiRedux />, color: "#764ABC", bx: 26, by: 4, zone: "frontalLobe", group: "web", connections: ["react"] },

  // Upper rear cortex
  { id: "express", name: "Express", icon: <SiExpress />, color: "#000000", bx: 22, by: 18, zone: "temporalLobe", group: "web", connections: ["next"] },
  { id: "huggingface", name: "HuggingFace", icon: <SiHuggingface />, color: "#FFCC00", bx: -20, by: -20, zone: "parietalLobe", group: "ai", connections: ["openai"] },
  { id: "openai", name: "OpenAI", icon: <SiOpenai />, color: "#10A37F", bx: -6, by: -12, zone: "crown", group: "ai", connections: ["python", "azure", "copilot"] },
  { id: "aws", name: "AWS", icon: <FaAws />, color: "#FF9900", bx: 18, by: 32, zone: "temporalLobe", group: "cloud", connections: ["docker", "terraform"] },
  { id: "copilot", name: "Copilot", icon: <SiGithubcopilot />, color: "#000000", bx: -15, by: 2, zone: "parietalLobe", group: "ai", connections: ["openai", "vscode", "numpy"] },

  // Mid-body and lower lobe
  { id: "next", name: "Next.js", icon: <SiNextdotjs />, color: "#000000", bx: 8, by: -2, zone: "frontalLobe", group: "web", connections: ["react", "azure"] },
  { id: "html", name: "HTML", icon: <FaHtml5 />, color: "#E34F26", bx: 13, by: 20, zone: "temporalLobe", group: "web", connections: ["react", "tailwind"] },
  { id: "tailwind", name: "Tailwind", icon: <SiTailwindcss />, color: "#06B6D4", bx: 0, by: 24, zone: "temporalLobe", group: "web", connections: ["react", "html"] },
  { id: "docker", name: "Docker", icon: <FaDocker />, color: "#2496ED", bx: 4, by: 16, zone: "temporalLobe", group: "cloud", connections: ["azure", "aws", "k8s"] },
  { id: "azure", name: "Azure", icon: <SiMicrosoftazure />, color: "#0078D4", bx: -6, by: 8, zone: "parietalLobe", group: "cloud", connections: ["next", "docker", "openai"] },
  { id: "pandas", name: "Pandas", icon: <SiPandas />, color: "#150458", bx: -28, by: 12, zone: "occipitalLobe", group: "ai", connections: ["python", "numpy"] },
  { id: "vscode", name: "VS Code", icon: <SiVisualstudiocode />, color: "#007ACC", bx: -14, by: 30, zone: "stemUpper", group: "tools", connections: ["copilot", "github"] },
  { id: "numpy", name: "NumPy", icon: <SiNumpy />, color: "#013243", bx: -30, by: -2, zone: "occipitalLobe", group: "ai", connections: ["pandas", "copilot"] },

  // Rear lobe and stem
  { id: "postgres", name: "Postgres", icon: <SiPostgresql />, color: "#336791", bx: -26, by: 28, zone: "cerebellum", group: "cloud", connections: ["docker"] },
  { id: "redis", name: "Redis", icon: <SiRedis />, color: "#DC382D", bx: -35, by: 33, zone: "cerebellum", group: "cloud", connections: ["docker"] },
  { id: "tensorflow", name: "TensorFlow", icon: <SiTensorflow />, color: "#FF6F00", bx: -16, by: 24, zone: "cerebellum", group: "ai", connections: ["numpy"] },
  { id: "figma", name: "Figma", icon: <SiFigma />, color: "#F24E1E", bx: 28, by: 12, zone: "frontalPole", group: "tools", connections: ["vscode"] },
  { id: "k8s", name: "K8s", icon: <SiKubernetes />, color: "#326CE5", bx: -10, by: 38, zone: "stemUpper", group: "cloud", connections: ["docker", "terraform"] },
  { id: "terraform", name: "Terraform", icon: <SiTerraform />, color: "#7B42BC", bx: -12, by: 49, zone: "stemLower", group: "cloud", connections: ["aws", "k8s"] },
  { id: "github", name: "GitHub", icon: <FaGithub />, color: "#181717", bx: -8, by: 60, zone: "stemLower", group: "tools", connections: ["vscode"] },
  { id: "notion", name: "Notion", icon: <SiNotion />, color: "#000000", bx: -13, by: 70, zone: "stemLower", group: "tools", connections: ["github"] },
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

const getDistributedTargets = (
  width: number,
  height: number,
  nodeRadius: number
) => {
  const count = initialSkills.length;
  const columns = Math.max(
    4,
    Math.round(Math.sqrt((count * width) / Math.max(height, 1)))
  );
  const rows = Math.ceil(count / columns);
  const minX = (-width / 2) + Math.max(nodeRadius * 1.75, width * 0.1);
  const maxX = (width / 2) - Math.max(nodeRadius * 1.75, width * 0.1);
  const minY = (-height / 2) + Math.max(nodeRadius * 1.75, height * 0.12);
  const maxY = (height / 2) - Math.max(nodeRadius * 1.75, height * 0.12);

  const sortedSkills = [...initialSkills].sort((a, b) => {
    if (a.by === b.by) {
      return (a.bx * BRAIN_X_STRETCH) - (b.bx * BRAIN_X_STRETCH);
    }

    return a.by - b.by;
  });

  return sortedSkills.reduce((acc, skill, index) => {
    const row = Math.floor(index / columns);
    const rowStart = row * columns;
    const itemsInRow = Math.min(columns, sortedSkills.length - rowStart);
    const column = index - rowStart;
    const rowProgress = rows <= 1 ? 0.5 : row / (rows - 1);
    const columnProgress = itemsInRow <= 1 ? 0.5 : column / (itemsInRow - 1);
    const x = minX + ((maxX - minX) * columnProgress);
    const y = minY + ((maxY - minY) * rowProgress);

    acc[skill.id] = { x, y };
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
    ["next", "postgres"],
    ["next", "redis"],
    ["docker", "tensorflow"],
    ["docker", "redis"],
    ["azure", "aws"],
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

  const root: SkillId = "notion";
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
        stroke={isRelated ? "#10b981" : "#cbd5e1"}
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
          animate={reduceMotion ? { opacity: pulseOpacity } : { opacity: pulseOpacity, strokeDashoffset: [-1014, 14] }}
          transition={
            reduceMotion
              ? { duration: 0 }
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

  useEffect(() => {
    if (!containerRef.current) return;

    const currentNodes = nodesRef.current.length > 0 ? nodesRef.current : initialSkills.map(s => ({ ...s } as SkillNode));
    const rect = containerRef.current.getBoundingClientRect();
    const nodeRadius = getNodeRadius(window.innerWidth);
    const distributedTargets = getDistributedTargets(rect.width, rect.height, nodeRadius);

    currentNodes.forEach((node, i) => {
      const target = distributedTargets[node.id];
      const tx = target.x;
      const ty = target.y;

      node.targetX = tx;
      node.targetY = ty;

      if (nodesRef.current.length === 0) {
        node.x = tx;
        node.y = ty;
      }
    });

    nodesRef.current = currentNodes;
    const nodes = currentNodes;
    const canvasBounds = {
      minX: (-rect.width / 2) + nodeRadius,
      maxX: (rect.width / 2) - nodeRadius,
      minY: (-rect.height / 2) + nodeRadius,
      maxY: (rect.height / 2) - nodeRadius,
    };

    canvasBoundsRef.current = canvasBounds;

    const links = skillLinks
      .map(({ source, target }) => {
        const sourceNode = nodes.find((node) => node.id === source);
        const targetNode = nodes.find((node) => node.id === target);

        return sourceNode && targetNode ? { source: sourceNode, target: targetNode } : null;
      })
      .filter(Boolean) as { source: SkillNode; target: SkillNode }[];

    const repulsionStrength = -nodeRadius * 2.2;
    const collisionRadius = nodeRadius * 1.18;

    const clampNodeToCanvas = (node: SkillNode) => {
      node.x = clampValue(node.x, canvasBounds.minX, canvasBounds.maxX);
      node.y = clampValue(node.y, canvasBounds.minY, canvasBounds.maxY);

      if (typeof node.fx === "number") {
        node.fx = clampValue(node.fx, canvasBounds.minX, canvasBounds.maxX);
      }

      if (typeof node.fy === "number") {
        node.fy = clampValue(node.fy, canvasBounds.minY, canvasBounds.maxY);
      }
    };

    const forceSpreadTargets = (alpha: number) => {
      nodes.forEach((node) => {
        node.x += ((node.targetX ?? 0) - node.x) * alpha * 0.26;
        node.y += ((node.targetY ?? 0) - node.y) * alpha * 0.26;
        clampNodeToCanvas(node);
      });
    };

    const forceCanvasBounds = () => {
      nodes.forEach(clampNodeToCanvas);
    };

    const simulation = d3force.forceSimulation(nodes as any)
      .force("charge", d3force.forceManyBody().strength(repulsionStrength))
      .force(
        "link",
        d3force.forceLink(links).distance((link: any) => {
          const sourceNode = link.source as SkillNode;
          const targetNode = link.target as SkillNode;
          const targetDistance = Math.hypot(
            (sourceNode.targetX ?? 0) - (targetNode.targetX ?? 0),
            (sourceNode.targetY ?? 0) - (targetNode.targetY ?? 0)
          );

          return Math.max(targetDistance * 0.6, nodeRadius * 3.8);
        }).strength(0.05)
      )
      .force("collide", d3force.forceCollide(collisionRadius).strength(0.95))
      .force("x", d3force.forceX((d: any) => d.targetX).strength(0.2))
      .force("y", d3force.forceY((d: any) => d.targetY).strength(0.22))
      .force("spread-targets", forceSpreadTargets as any)
      .force("canvas-bounds", forceCanvasBounds as any)
      .velocityDecay(0.24)
      .alphaDecay(0.028)
      .alpha(1)
      .alphaMin(0.001);

    simulation.on("tick", () => {
      nodes.forEach((node) => {
        clampNodeToCanvas(node);
        positions[node.id].x.set(node.x);
        positions[node.id].y.set(node.y);
      });
    });

    (containerRef.current as any).__simulation = simulation;

    return () => {
      simulation.stop();
    };
  }, [positions, scale]);

  const handleDragStart = (id: string) => {
    setDraggingId(id);
    const simulation = (containerRef.current as any)?.__simulation;
    const node = nodesRef.current.find((n) => n.id === id);
    if (simulation && node) {
      simulation.alphaTarget(0.3).restart();
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

  const handleDragEnd = (id: string) => {
    setDraggingId(null);
    const simulation = (containerRef.current as any)?.__simulation;
    const node = nodesRef.current.find((n) => n.id === id);
    if (simulation && node) {
      node.fx = null;
      node.fy = null;

      simulation.alphaTarget(0).restart();
      simulation.alpha(0.4);
    }
  };


  return (
    <section
      id="skills"
      className="portfolio-section portfolio-paper-stage flex min-h-screen flex-col items-center justify-center"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16,24,40,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.04) 1px, transparent 1px)",
            backgroundSize: "86px 86px",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,0.42), transparent 100%)",
          }}
        />
        <div className="absolute left-[8%] top-20 h-48 w-48 rounded-full bg-[var(--portfolio-accent-soft)] blur-3xl" />
        <div className="absolute right-[12%] top-28 h-56 w-56 rounded-full bg-[rgba(202,212,227,0.24)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 md:px-6">
        <ScrambledText
          as="h2"
          text="Skills"
          triggerOnView
          duration={1.05}
          speed={0.7}
          className="portfolio-title text-center text-4xl md:text-5xl"
        />

        <div className="portfolio-card mt-8 w-full p-6 md:p-7 xl:p-8">
            <div
              ref={containerRef}
              className="relative mx-auto flex h-[430px] w-full items-center justify-center overflow-hidden rounded-[1.75rem] border border-[rgba(16,24,40,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,244,236,0.76))] sm:h-[500px] md:h-[620px] xl:h-[760px]"
              style={{
                transform: "translateZ(0) scale(1)",
                transformOrigin: "center center",
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,153,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,191,115,0.12),transparent_22%)]" />

              <svg
                className="absolute inset-0 z-10 h-full w-full pointer-events-none"
                style={{ overflow: "visible", transform: "translate(50%, 50%)" }}
              >
                <g>
                  {skillLinks.map((link) => {
                    const isRelated =
                      draggingId !== null &&
                      (link.source === draggingId || link.target === draggingId);

                    return (
                      <SkillConnection
                        key={getSkillLinkKey(link.source, link.target)}
                        x1={positions[link.source].x}
                        y1={positions[link.source].y}
                        x2={positions[link.target].x}
                        y2={positions[link.target].y}
                        isRelated={isRelated}
                        shouldReveal={shouldRevealGraph}
                        revealDelay={
                          linkRevealDelayByKey[
                            getSkillLinkKey(link.source, link.target)
                          ]
                        }
                        reduceMotion={reduceMotion}
                        entranceComplete={entranceComplete}
                      />
                    );
                  })}
                </g>
              </svg>

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
                    onDragEnd={() => handleDragEnd(skill.id)}
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
                      className={`-ml-4 -mt-4 flex h-8 w-8 cursor-grab items-center justify-center rounded-full border border-[rgba(16,24,40,0.08)] bg-white shadow-xl transition-[opacity,filter,box-shadow] duration-200 group active:cursor-grabbing sm:-ml-5 sm:-mt-5 sm:h-10 sm:w-10 md:-ml-6 md:-mt-6 md:h-12 md:w-12 lg:-ml-7 lg:-mt-7 lg:h-14 lg:w-14 ${isOther ? "opacity-50 blur-[1px]" : "opacity-100"}`}
                    >
                      <div
                        className="text-base sm:text-xl md:text-2xl lg:text-3xl"
                        style={{ color: skill.color }}
                      >
                        {skill.icon}
                      </div>

                      <div className="pointer-events-none absolute -bottom-6 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[9px] font-bold tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100 sm:-bottom-8 sm:text-[10px] md:text-xs">
                        {skill.name}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
        </div>
      </div>
    </section>
  );
}
