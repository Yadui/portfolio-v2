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
    blurb: "Private order flow with verifiable settlement fairness.",
    title: "Hidden Order DEX",
    label: "Zero-knowledge exchange",
    year: "2025",
    kind: "PRODUCT FROM SCRATCH",
    tags: "CIRCUITS · PROOFS · SETTLEMENT",
  },
  {
    match: "VirtuAI",
    blurb: "One layer across providers, quota and billing.",
    title: "VirtuAI",
    label: "Multi-model AI platform",
    year: "2024",
    kind: "PRODUCT SYSTEM",
    tags: "ROUTING · QUOTA · BILLING",
  },
  {
    match: "Automify",
    blurb: "Trigger-based graphs with persisted runs and retries.",
    title: "Automify",
    label: "Workflow engine",
    year: "2024",
    kind: "EXECUTION SYSTEM",
    tags: "GRAPHS · RUNS · RETRIES",
  },
  {
    match: "Business OS",
    blurb: "Finance, sales and operations in one tenant.",
    title: "Business OS",
    label: "Multi-tenant ERP",
    year: "2025",
    kind: "ENTERPRISE SYSTEM",
    tags: "FINANCE · SALES · OPERATIONS",
  },
  {
    match: "structra",
    blurb: "Isolated environments and guardrails for TRF reports.",
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
    // Deliberately short: the ledger row gives this one line, and the
    // full thesis overflowed the row and collided with the separator.
    description: entry.blurb,
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
