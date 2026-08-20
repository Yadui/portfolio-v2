"use client";

import { projects } from "@/data/projectsMenuData";

import WorkIndex from "./work/WorkIndex";

/**
 * Work section. Presents a curated five-project ledger in the work-orange
 * surface that the hero's scroll wipe resolves into. The full index stays
 * at /work — this is the selected cut, not the archive.
 */

/** Curated selection, by title, with presentation metadata. */
const FEATURED = [
  {
    match: "hidden-order-dex",
    title: "Hidden Order DEX",
    label: "Zero-knowledge exchange",
    year: "2025",
    kind: "PRODUCT FROM SCRATCH",
    tags: "CIRCUITS · PROOFS · SETTLEMENT",
  },
  {
    match: "VirtuAI",
    title: "VirtuAI",
    label: "Multi-model AI platform",
    year: "2024",
    kind: "PRODUCT SYSTEM",
    tags: "ROUTING · QUOTA · BILLING",
  },
  {
    match: "Automify",
    title: "Automify",
    label: "Workflow engine",
    year: "2024",
    kind: "EXECUTION SYSTEM",
    tags: "GRAPHS · RUNS · RETRIES",
  },
  {
    match: "Business OS",
    title: "Business OS",
    label: "Multi-tenant ERP",
    year: "2025",
    kind: "ENTERPRISE SYSTEM",
    tags: "FINANCE · SALES · OPERATIONS",
  },
  {
    match: "structra",
    title: "Structra",
    label: "Report engine",
    year: "2026",
    kind: "PRODUCT FROM SCRATCH",
    tags: "REPORTS · ISOLATION · GUARDRAILS",
  },
];

const byTitle = new Map(projects.map((p) => [p.title, p]));

const items = FEATURED.map((entry, index) => {
  const project = byTitle.get(entry.match);
  const live = project?.links?.live;
  const github = project?.links?.github;
  const href = live || github || "/work";

  return {
    id: project?.id ?? `featured-${index}`,
    title: entry.title,
    label: entry.label,
    year: entry.year,
    kind: entry.kind,
    tags: entry.tags,
    description: project?.thesis ?? "",
    link: href,
    external: Boolean(live || github),
  };
});

export default function Projects({ projectsSectionRef, projectsSurfaceRef }) {
  return (
    <section
      id="projects"
      ref={projectsSectionRef}
      className="work-section relative z-10"
    >
      <div ref={projectsSurfaceRef} className="work-surface">
        <WorkIndex items={items} />
      </div>
    </section>
  );
}
