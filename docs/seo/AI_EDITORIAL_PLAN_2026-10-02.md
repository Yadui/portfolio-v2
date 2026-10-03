# AI editorial expansion and cover-art plan

## Scope and progress

- [x] Read the seven CSV files and existing article/cover surfaces.
- [x] Record export calculations, query privacy caveats and content priorities.
- [x] Write three distinct AI companion drafts against current primary sources.
- [x] Produce four art-directed cover assets with source/rights records.
- [x] Review the artwork at social, article and archive-preview crops.
- [x] Verify draft structure, assets and existing tests; report remaining review gates.

This pass prepares repository content and art; it does not publish new database
rows, replace existing covers, commit/push, or change the portfolio layout. The
previously authorized two-article publisher and other uncommitted work are retained.

## Design Read

Technical portfolio editorial work for AI engineers, with bold photographic
collage and tactile typography, within the existing paper/ink/green system.

- Mode: preserve existing site; new cover compositions and companion content.
- `DESIGN_VARIANCE`: 8, varied crops, scale and editorial hierarchy.
- `MOTION_INTENSITY`: 0, exported still images, no animation dependency.
- `VISUAL_DENSITY`: 3, one visual idea and short headline per cover.
- Composition: asymmetric photo/type split for agent boundaries; full photographic
  stream image for Open WebUI; repeat-image collage for prefix reuse; mechanical
  close crop for KV memory. No fake screenshots, robots or glowing brains.
- Assets: no image-generation tool is available; use verified licensed photographs
  and original typographic/crop treatments. Preserve existing cover files.
- Export: 1600×840 WebP, matching the 1200×630 social ratio. Check centered 16:10
  and 260×164 crops because the existing lead/hover images use those proportions.
- Fonts: existing Clash Display, palette from `docs/DESIGN_SYSTEM.md`.

## Data-led intent boundaries

The KV conceptual article already exists, and a sizing draft is already written.
Do not create a second “what is KV cache” page or multiple spelling-variant pages.
Create a cache-reuse companion and package the existing sizing draft as the next
priority. Foundry has a current overview; write readiness decisions rather than
another launch/news summary. Open WebUI has a broad integration overview; a
discovery/streaming diagnostic guide is a narrower task.

Detailed computed findings: `GSC_ANALYSIS_2026-10-02.md`.
Primary-source verification: `AI_SOURCE_REGISTER_2026-10-02.md`.

## Candidate package

1. Existing KV sizing draft: configuration, formula, explicit units and assumptions.
2. Foundry Agent Service: production-readiness and tool/identity boundaries.
3. Open WebUI + FastAPI: model discovery and streaming diagnosis.
4. Prefix caching vs KV cache: within-request versus cross-request reuse and misses.

Priority is editorial judgement, not a traffic forecast. The export contains few
clicks and separate query/page aggregations, not matched keyword-to-page records.
Cover quality can improve on-site recognition and sharing; it is not evidence that
a Web search snippet will display the image or receive more clicks.

## Deliverables and release decisions

- New complete bodies: Foundry 1,041 words, Open WebUI 994, prefix caching 1,169
  (whitespace-delimited, including code). Approximately **3,204 words**, not search
  engine token counts or an imposed publication-length target.
- Existing memory-sizing draft remains the recommended first candidate and now has
  proposed cover/alt metadata. It is not duplicated or silently imported.
- All four covers are 1600×840 WebP with meaningful proposed alt text and source
  attribution. Sizes: **62,250 / 205,008 / 59,544 / 96,384 bytes** in manifest order.
- Self-contained visual review: `docs/design/ai-covers-2026-10-02/review.html`.
  Source/rights: `docs/design/ai-covers-2026-10-02/ASSET_PROVENANCE.md`.
- Inspect the existing Foundry overview before adding a reciprocal link: current
  first-party docs distinguish legacy Agent Applications from the newer identity
  model. The new draft explicitly documents that boundary rather than repeating
  obsolete publishing behavior. Existing article was not modified in this pass.
- Review the new bodies first. If approved, deploy cover files before inserting
  database rows; the current corrections publisher intentionally supports updates
  to only two existing slugs and cannot publish these new drafts. New-row publication
  needs an explicit manifest/approval and a separate guarded import path.
- Never backdate new entries or publish editorial front matter as article content.
- Maintain original overviews and add contextual links to the new companion pages
  only when those pages resolve. Record real publication times and measure matched
  page-filtered query exports for comparable windows.

## Visual and editorial verification

Existing surface audited in Ego Lite. The blog uses a 16:10 lead and 260×164 archive
hover image; full article cover uses 16:9. Artboard 1600×840 retains main text in
centered crops. Review document includes full/social and both index crops.

At **1440px and 390px**, all 12 review images loaded at their expected natural width
and the page had no horizontal overflow. The 260×164 samples retain both principal
title lines. Original photographs and full-resolution exports were inspected; no
fake product UI, generated faces or fabricated infrastructure metrics are shown.
Small source acknowledgements are available in the full image and provenance doc;
at thumbnail scale only the main title is expected to be readable. The cover type
does not replace semantic article headings or accessible alt text.

Palette, fonts and website architecture are preserved; no site UI, hero, forms,
navigation, animation or responsive tokens changed. Motion checks are not relevant
to these still-image assets; this is not a claim of a new site-wide accessibility
or reduced-motion audit. No image-generation tool was available. The builder uses
only local licensed sources; process-local Fontconfig avoids changing system fonts.

Independent review recomputed the data, rechecked consequential documentation,
validated fixtures and found no blocker to retaining the unapproved package.
Tenant/client/GPU execution and publishing remain unperformed, explicit gates.

Checks passed: **172 existing application/publisher tests**, **9 editorial asset
tests**, **3 CSV analyzer tests**, full lint **0 errors / 12 existing warnings**,
and diff whitespace checks. Cover-metadata checks initially failed for all four
missing assignments, then passed after the proposed paths/alt text were attached.
No application code or dependencies changed; the app build was not rerun for this
offline content/art package. `npm run covers:build` rebuilds the art locally;
`npm run test:editorial` verifies dimensions, crops, hashes and draft assignments.
