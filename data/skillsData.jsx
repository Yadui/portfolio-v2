"use client";

import {
  FaAws, FaDocker, FaGithub, FaHtml5, FaJs, FaPython, FaReact,
} from "react-icons/fa";
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
  SiN8N,
  SiNextdotjs,
  SiNotion,
  SiNumpy,
  SiOpenai,
  SiPandas,
  SiPostgresql,
  SiPowerautomate,
  SiPowerbi,
  SiPrisma,
  SiRedis,
  SiRedux,
  SiTailwindcss,
  SiTensorflow,
  SiTerraform,
  SiTypescript,
  SiVisualstudiocode,
} from "react-icons/si";

/**
 * Skill inventory, grouped into the four orbital rings of the skills
 * solar system. Ring order runs inward to outward; ring membership is the
 * `group` each entry sits under here.
 *
 * `Icon` is a react-icons component. A few Microsoft products have no
 * react-icons glyph and use a local SVG via `img` instead.
 */
export const SKILL_RINGS = [
  {
    id: "tools",
    label: "Tooling",
    blurb: "The desk",
    skills: [
    { id: "github", name: "GitHub", Icon: FaGithub, color: "#181717" },
    { id: "figma", name: "Figma", Icon: SiFigma, color: "#F24E1E" },
    { id: "notion", name: "Notion", Icon: SiNotion, color: "#000000" },
    { id: "vscode", name: "VS Code", Icon: SiVisualstudiocode, color: "#007ACC" },
    ],
  },
  {
    id: "cloud",
    label: "Cloud and data",
    blurb: "The foundation",
    skills: [
    { id: "azure", name: "Azure", Icon: SiMicrosoftazure, color: "#0078D4" },
    { id: "aws", name: "AWS", Icon: FaAws, color: "#FF9900" },
    { id: "docker", name: "Docker", Icon: FaDocker, color: "#2496ED" },
    { id: "k8s", name: "K8s", Icon: SiKubernetes, color: "#326CE5" },
    { id: "terraform", name: "Terraform", Icon: SiTerraform, color: "#7B42BC" },
    { id: "postgres", name: "Postgres", Icon: SiPostgresql, color: "#336791" },
    { id: "redis", name: "Redis", Icon: SiRedis, color: "#DC382D" },
    { id: "grafana", name: "Grafana", Icon: SiGrafana, color: "#F46800" },
    { id: "powerbi", name: "Power BI", Icon: SiPowerbi, color: "#F2C811" },
    ],
  },
  {
    id: "web",
    label: "Web and product",
    blurb: "The surface",
    skills: [
    { id: "typescript", name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
    { id: "js", name: "JS", Icon: FaJs, color: "#F7DF1E" },
    { id: "react", name: "React", Icon: FaReact, color: "#61DAFB" },
    { id: "next", name: "Next.js", Icon: SiNextdotjs, color: "#000000" },
    { id: "fastapi", name: "FastAPI", Icon: SiFastapi, color: "#009688" },
    { id: "tailwind", name: "Tailwind", Icon: SiTailwindcss, color: "#06B6D4" },
    { id: "html", name: "HTML", Icon: FaHtml5, color: "#E34F26" },
    { id: "redux", name: "Redux", Icon: SiRedux, color: "#764ABC" },
    { id: "prisma", name: "Prisma", Icon: SiPrisma, color: "#2D3748" },
    { id: "express", name: "Express", Icon: SiExpress, color: "#000000" },
    ],
  },
  {
    id: "ai",
    label: "AI and automation",
    blurb: "The specialism",
    skills: [
    { id: "python", name: "Python", Icon: FaPython, color: "#3776AB" },
    { id: "azureai", name: "Azure AI", img: "/icons/AzureAI_scalable.svg", Icon: SiMicrosoftazure, color: "#0078D4" },
    { id: "copilotstudio", name: "Copilot Studio", img: "/icons/CopilotStudio_scalable.svg", Icon: SiGithubcopilot, color: "#8B52F4" },
    { id: "botservice", name: "Bot Service", img: "/icons/AzureBot_scalable.svg", Icon: SiMicrosoftazure, color: "#32BEDD" },
    { id: "openai", name: "OpenAI", Icon: SiOpenai, color: "#10A37F" },
    { id: "huggingface", name: "HuggingFace", Icon: SiHuggingface, color: "#FFCC00" },
    { id: "langchain", name: "LangChain", Icon: SiLangchain, color: "#1C3C3C" },
    { id: "pandas", name: "Pandas", Icon: SiPandas, color: "#150458" },
    { id: "numpy", name: "NumPy", Icon: SiNumpy, color: "#013243" },
    { id: "tensorflow", name: "TensorFlow", Icon: SiTensorflow, color: "#FF6F00" },
    { id: "n8n", name: "n8n", Icon: SiN8N, color: "#EA4B71" },
    { id: "powerautomate", name: "Power Automate", Icon: SiPowerautomate, color: "#0066FF" },
    { id: "copilot", name: "Copilot", Icon: SiGithubcopilot, color: "#000000" },
    ],
  },
];
