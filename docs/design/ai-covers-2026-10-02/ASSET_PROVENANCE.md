# AI cover assets: sources and rights

These are original editorial photo/type treatments, not generated product
screenshots, model benchmarks or pictures of a Microsoft Foundry deployment.
They remain proposed assets; no existing cover was replaced in Turso.

## Photography

### Network cables

- Photographer: **Taylor Vick**, verified on the Unsplash photo page.
- Source: <https://unsplash.com/photos/cable-network-M5tzZtFCOfs>.
- Download: <https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=2000&q=90&fit=max&fm=jpg>.
- Local source: `sources/taylor-vick-network.jpg`.
- License: [Unsplash License](https://unsplash.com/license), reviewed in Ego Lite
  on 2026-10-02. Download, modification and commercial/non-commercial use permitted;
  no stock-photo resale or competing image service. Not an Unsplash+ asset.
- Treatment: monochrome, crop, ink overlay, typographic composition and green bands.
- Used in: `openwebui-stream.webp`. No endorsement or deployment provenance implied.

### Discover supercomputer photographs

- Photographer/source credit: **NASA / Pat Izzo**, from NASA Image and Video Library metadata.
- Source metadata: <https://images-api.nasa.gov/search?q=supercomputer&media_type=image&page_size=5>.
- Detail ID: `GSFC_20171208_Archive_e002032`, **Discover Supercomputer 4**.
- Room ID: `GSFC_20171208_Archive_e002034`, **Discover Supercomputer 1**.
- Detail download: <https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e002032/GSFC_20171208_Archive_e002032~large.jpg>.
- Room download: <https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e002034/GSFC_20171208_Archive_e002034~large.jpg>.
- Local sources: `sources/nasa-discover-detail.jpg`, `sources/nasa-discover-room.jpg`.
- Usage terms: [NASA Images and Media Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/),
  reviewed 2026-10-02. NASA imagery is generally usable for informational/editorial
  purposes subject to guidelines, source acknowledgement and no endorsement.
  NASA marks/third-party copyrighted images/personality rights have separate rules.
- No identifiable person or NASA insignia appears in the selected photos. They
  contain hardware manufacturer marks; monochrome/cropped editorial context is not
  an endorsement. These covers are educational/editorial, not paid advertisements,
  merchandise, NFTs, model-training assets or a NASA attribution for the article's
  technical claims. Reassess rights if their usage changes to promotional material.
- Treatment: monochrome, crop/repetition and original typography. Credit is included
  in the exported assets. Repetition is a visual metaphor, not measured cache state.
- Used in: `foundry-boundaries.webp`, `prefix-reuse.webp`, `kv-memory.webp`.

## Font, output and reproduction

- Existing repository font: `public/fonts/ClashDisplay-Variable.ttf`. No new font
  download or library migration. Existing font usage terms remain applicable.
- All covers: **1600×840 WebP**, under 300 KB; paths and SHA256 checksums in `covers.json`.
- Build: `node scripts/build-ai-editorial-covers.mjs`. Uses the existing Sharp
  installation, local sources and typography; no image-generation API or network
  access during rendering. Sharp is transitive through Next, not a new dependency.
- Review: `review.html` is a self-contained private review document in `docs/`,
  not an indexable website route. Includes full, 16:10 and 260×164 views.
- Original photographs preserved for reproducibility. New output directory is
  `public/blog-covers/ai-editorial-2026-10-02/`; old files are untouched.

## Publication gate

Before publication, confirm article/body approval, corresponding cover path and
alt text, upload/deploy assets first, then update the database. Keep photographer
acknowledgement accessible. Covers are not evidence of Google thumbnail eligibility
or increased search CTR. No Google Discover performance is inferred from this Web
Search export.
