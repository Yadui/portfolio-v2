"use client";

import {
  FaAws, FaCode, FaDocker, FaGithub, FaHtml5, FaJs, FaLayerGroup, FaPython, FaReact, FaTerminal,
} from "react-icons/fa";
import { FaBrain } from "react-icons/fa6";
import {
  SiExpress,
  SiFastapi,
  SiFigma,
  SiGithubcopilot,
  SiGrafana,
  SiHuggingface,
  SiKubernetes,
  SiLangchain,
  SiMicrosoftazure,
  SiAnthropic,
  SiN8N,
  SiNextdotjs,
  SiNotion,
  SiNumpy,
  SiPandas,
  SiPostgresql,
  SiPowerapps,
  SiPowerautomate,
  SiPowerbi,
  SiPrisma,
  SiRedis,
  SiRedux,
  SiTailwindcss,
  SiTerraform,
  SiTypescript,
  SiVisualstudiocode,
} from "react-icons/si";

/**
 * The skills system, modelled as planets and moons.
 *
 * Seven planets, each with an orbit of its own — no two planets share a ring,
 * as in an actual solar system. Ordered inner to outer, so the specialism
 * sits closest to the star and general tooling furthest out.
 *
 * A planet is either a product that genuinely anchors its group (Azure,
 * Docker, GitHub) or a category mark standing for a discipline (Power
 * Platform, AI, Code, Web). Category planets are labels rather than skills,
 * so every one of the 36 skills still appears exactly once — as a planet in
 * the first case, or as a moon in the second.
 *
 * `Icon` is a react-icons component. A few Microsoft products have no
 * react-icons glyph and use a local SVG via `img` instead.
 */
export const SKILL_PLANETS = [
  {
    id: "azure",
    name: "Azure",
    Icon: SiMicrosoftazure,
    color: "#3FA0EF",
    ring: 0,
    isSkill: true,
    moons: [
      { id: "azureai", name: "Azure AI", img: "/icons/AzureAI_scalable.svg", Icon: SiMicrosoftazure, color: "#3FA0EF" },
      { id: "botservice", name: "Bot Service", img: "/icons/AzureBot_scalable.svg", Icon: SiMicrosoftazure, color: "#32BEDD" },
      { id: "aws", name: "AWS", Icon: FaAws, color: "#FF9900" },
      { id: "grafana", name: "Grafana", Icon: SiGrafana, color: "#F46800" },
    ],
  },
  {
    id: "power-platform",
    name: "Power Platform",
    Icon: SiPowerapps,
    color: "#B36BE0",
    ring: 0,
    moons: [
      { id: "powerautomate", name: "Power Automate", Icon: SiPowerautomate, color: "#3D7BFF" },
      { id: "powerbi", name: "Power BI", Icon: SiPowerbi, color: "#F2C811" },
      { id: "copilotstudio", name: "Copilot Studio", img: "/icons/CopilotStudio_scalable.svg", Icon: SiGithubcopilot, color: "#8B52F4" },
      { id: "copilot", name: "Copilot", Icon: SiGithubcopilot, color: "#FFFFFF" },
    ],
  },
  {
    id: "ai",
    name: "AI",
    Icon: FaBrain,
    color: "#FF7A4D",
    ring: 1,
    moons: [
      { id: "claudecode", name: "Claude Code", img: "/icons/claudecode-color.svg", Icon: SiAnthropic, color: "#D97757" },
      // No brand glyph ships for OpenCode in react-icons and no local asset
      // exists, so a terminal mark stands in rather than hand-rolling a
      // fake logo. Drop an SVG in /public/icons and set `img` to swap it.
      { id: "opencode", name: "OpenCode", Icon: FaTerminal, color: "#E8E8E8" },
      { id: "huggingface", name: "HuggingFace", Icon: SiHuggingface, color: "#FFCC00" },
      { id: "langchain", name: "LangChain", Icon: SiLangchain, color: "#4FC3A1" },
      { id: "n8n", name: "n8n", Icon: SiN8N, color: "#EA4B71" },
    ],
  },
  {
    id: "code",
    name: "Code",
    Icon: FaCode,
    color: "#8FA6C4",
    ring: 1,
    moons: [
      { id: "python", name: "Python", Icon: FaPython, color: "#4B8BBE" },
      { id: "typescript", name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
      { id: "js", name: "JavaScript", Icon: FaJs, color: "#F7DF1E" },
      { id: "fastapi", name: "FastAPI", Icon: SiFastapi, color: "#009688" },
      { id: "pandas", name: "Pandas", Icon: SiPandas, color: "#8A6FD4" },
      { id: "numpy", name: "NumPy", Icon: SiNumpy, color: "#4DABCF" },
    ],
  },
  {
    id: "docker",
    name: "Docker",
    Icon: FaDocker,
    color: "#2496ED",
    ring: 2,
    isSkill: true,
    moons: [
      { id: "k8s", name: "Kubernetes", Icon: SiKubernetes, color: "#326CE5" },
      { id: "terraform", name: "Terraform", Icon: SiTerraform, color: "#9B6BE0" },
      { id: "postgres", name: "Postgres", Icon: SiPostgresql, color: "#4A90D9" },
      { id: "redis", name: "Redis", Icon: SiRedis, color: "#DC382D" },
      { id: "prisma", name: "Prisma", Icon: SiPrisma, color: "#7BA7C7" },
    ],
  },
  {
    id: "web",
    name: "Web",
    Icon: FaLayerGroup,
    color: "#6FD3E0",
    ring: 2,
    moons: [
      { id: "react", name: "React", Icon: FaReact, color: "#61DAFB" },
      { id: "next", name: "Next.js", Icon: SiNextdotjs, color: "#FFFFFF" },
      { id: "tailwind", name: "Tailwind", Icon: SiTailwindcss, color: "#06B6D4" },
      { id: "html", name: "HTML", Icon: FaHtml5, color: "#E34F26" },
      { id: "redux", name: "Redux", Icon: SiRedux, color: "#9B6BE0" },
      { id: "express", name: "Express", Icon: SiExpress, color: "#FFFFFF" },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    Icon: FaGithub,
    color: "#FFFFFF",
    ring: 3,
    isSkill: true,
    moons: [
      { id: "vscode", name: "VS Code", Icon: SiVisualstudiocode, color: "#007ACC" },
      { id: "figma", name: "Figma", Icon: SiFigma, color: "#F24E1E" },
      { id: "notion", name: "Notion", Icon: SiNotion, color: "#FFFFFF" },
    ],
  },
];
