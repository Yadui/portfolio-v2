# Search Console analysis: 2026-10-02 export

**Outcome:** The supplied daily chart records **2 clicks / 294 impressions / 0.6803% CTR**, with an **approximately 38.42 impression-weighted position**, over **2026-08-26 through 2026-09-29 inclusive**. This is a small discovery baseline, not evidence of sustained traffic growth. Prioritize useful, distinct tasks in the existing identity and AI content clusters rather than producing keyword-variant articles.

## Evidence and method

- Read-only source: `/Users/abhinavyadav/Downloads/yadui.dev-Performance-on-Search-2026-10-02/`.
- `Filters.csv` says **Web / Last 3 months**; `Chart.csv` actually supplies **35 consecutive daily dates**, including two zero-impression days (August 26–27). Do not infer the missing months, a site launch date, or zero activity outside these rows. The export filename is not its final measurement date: there is **no September 30–October 2 daily data**.
- Parsed with Python's standard-library `csv.reader`, UTF-8 BOM support, `newline=""` and strict column validation. `Queries.csv` contains **31 records**, not 32: the quoted “cache me if you must: adaptive key-value quantization for large language \nmodels” query spans two physical lines. Its newline is retained in the JSON.
- Recomputed CTR as `100 × Σclicks / Σimpressions`; did not average exported CTR percentages. Position is `Σ(impressions × exported position) / Σimpressions`, excluding zero-impression rows with blank positions. Exported rounded positions make this an approximation, not a recovered unrounded GSC value.
- All parsed rows, exact dates, source SHA-256 hashes, byte counts, dimension totals, window calculations and explicit query-cluster membership are in [gsc-2026-10-02-summary.json](gsc-2026-10-02-summary.json). Numbers below round those computations for readability. JSON raw cells remain strings to preserve source precision; computed metrics are numeric and undefined metrics are `null`.
- Daily dates use Google's **Pacific Time** convention [G3]. This is an offline export analysis, not an authenticated GSC, live-page, indexing, analytics or database inspection.

### Chart versus table totals

Delta is the table sum minus the daily chart total. Weighted table positions summarize only their own exported rows; they are not substitutes for the property chart position.

| Source | Records | Clicks | Impressions | Click delta | Impression delta | Recomputed CTR | Weighted position |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Chart.csv | 35 | 2 | 294 | 0 | 0 | 0.6803% | 38.4214 |
| Queries.csv | 31 | 0 | 111 | -2 | -183 | 0% | 58.0461 |
| Pages.csv | 15 | 2 | 294 | 0 | 0 | 0.6803% | 38.4150 |
| Countries.csv | 39 | 2 | 294 | 0 | 0 | 0.6803% | 38.4130 |
| Devices.csv | 3 | 2 | 294 | 0 | 0 | 0.6803% | 38.4138 |
| Search appearance.csv | 0 | 0 | 0 | -2 | -294 | Undefined | Undefined |

**The named-query table covers 111/294 = 37.7551% of chart impressions; 183 impressions (62.2449%) and both clicks are absent from its named rows.** Google's documentation explains anonymized rare-query omission, table limits and aggregation differences [G1, G3]. This is consistent with privacy suppression, but these CSVs cannot prove the entire shortfall's cause or recover omitted query text. There are only 31 query rows, so the 1,000-row display limit is not an observed saturation here.

Page, country and device click/impression sums happen to equal the chart in this export. **GSC aggregation does not require every table to reconcile**: the chart is property-aggregated, while Pages and Search appearance use page aggregation [G1, G2]. Small weighted-position differences also reflect rounded source values and possibly differing aggregation; do not force them to match. The empty Search appearance file means no exported appearance rows, not proof of no rich results or no AI-feature exposure.

### Exactly what the two clicks establish

- `Chart.csv`: **one click on August 30** (33 impressions, exported daily CTR 3.03%) and **one on August 31** (28 impressions, 3.57%). Every other exported date has zero clicks, including all September dates.
- `Pages.csv`: **both clicks credited to `/blog/llm-kv-cache-why-not-query`** (82 impressions, exported CTR 2.44%; recomputed 2.4390%).
- `Countries.csv`: India has both clicks (56 impressions, exported CTR 3.57%). `Devices.csv`: Desktop has both clicks (267 impressions, exported CTR 0.75%). These are agreeing marginal totals, not user-level logs or proof of two distinct people.
- **Every named query has zero clicks.** Do not say “kv cache,” a memory keyword, or any other known query drove these clicks. No named keyword-to-click attribution is available, even though the clicked page's topic is known.

## Comparable recent periods, not month-over-month

These are adjacent, equal-length, inclusive windows anchored to the latest available day. Each pair has the same weekday coverage. Only daily property-level metrics can be compared; query/page/country/device files have no per-day breakdown.

| Window | Dates (2026, PT) | Days | Clicks | Impressions | CTR | Weighted position |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Previous 7 days | September 16–22 | 7 | 0 | 50 | 0% | 38.4340 |
| Latest 7 days | September 23–29 | 7 | 0 | 34 | 0% | 27.3882 |
| Previous 14 days | September 2–15 | 14 | 0 | 115 | 0% | 31.5783 |
| Latest 14 days | September 16–29 | 14 | 0 | 84 | 0% | 33.9631 |

- **7-day:** impressions **-16 (-32.0%)**, clicks unchanged at zero, position **-11.0458** (numerically better).
- **14-day:** impressions **-31 (-26.9565%)**, clicks unchanged at zero, position **+2.3848** (numerically worse).
- A better aggregate position alongside fewer impressions is not necessarily a ranking gain: query/device/country mix can change. Both comparisons have tiny counts and no clicks. Neither supports a CTR win, reliable growth forecast or diagnosis of a penalty.
- **No month-over-month claim:** only part of August and September is present; there are not two complete comparable months. The earlier plan's screenshot transcription (**2 clicks / 244 impressions / 0.8% / 40.7**) lacks exact matching dates and was not independently retrieved. It is historical context, not a denominator for a growth percentage [R1].

### September 22 correction boundary

The latest dated correction/publication records reviewed are **2026-09-22**. The source-correction and release reports distinguish repository/deployment work from database publication [R2, R3]; the subsequent publisher record explicitly documents **two corrected AVD/KV bodies and excerpts applied to Turso on September 22**, a verified backup, a zero-change readback and live checks after cache regeneration [R5]. This is documented publication evidence, not an independently repeated live check by this analysis. Recrawl timing remains unknown.

Only September 23–29 provides a full seven-day chart window strictly after that documented date. Its comparator includes September 22 and is not a clean pre-update week. Both actual clicks predate the correction record. **No observed change is attributed causally to the corrections**; publication, crawl timing, page/query histories and confounding factors are unavailable.

## Named query clusters: demand hints, not landing-page attribution

These are editorial groupings of query text, with disjoint membership in the JSON. All have zero clicks. Shares or totals refer to **111 visible query impressions**, not all 294 property impressions. **Do not join query clusters to Pages.csv**: those are separate marginal exports without a query × page cross-tab.

| Cluster | Query rows | Impressions | Weighted position | Interpretation |
| --- | ---: | ---: | ---: | --- |
| AVD MFA / SSO | 4 | 24 | 29.6250 | `mfa for vdi` 10, `azure virtual desktop mfa` 7, `windows virtual desktop mfa` 5, SSO 2. Most promising observed identity-task cluster; do not generalize AVD to all VDI. |
| Passwordless identity | 1 | 16 | 38.8800 | Exact query: `azure active directory passwordless`; explain legacy naming and a concrete migration task. |
| KV concepts / head terms / variants | 8 | 35 | 86.1446 | `kv cache` 13 at 90.54 and `kv caching` 12 at 81.17 dominate; variants belong in one conceptual resource. |
| KV memory / math long-tail | 4 | 4 | 86.5000 | `kv cache math`, `what is kv cache memory`, `kv cache memory`, `kv cache size`: one impression each. Distinct sizing job, but very weak volume evidence. |
| KV named-paper query | 1 | 1 | 54.0000 | Specific paper-title lookup; not automatically demand for a generic quantization tutorial. |
| Microsoft Foundry candidate intent | 3 | 12 | 41.7475 | `foundry agent service` 9, `foundry service` 2, `microsoft foundry agent service` 1. The generic “foundry service” wording remains ambiguous. |
| Cloud Foundry managed services | 1 | 7 | 62.8600 | Keep separate from Microsoft Foundry; not a Microsoft AI keyword opportunity by itself. |
| SQL backup to Blob | 3 | 5 | 65.1980 | SQL Server versus Azure SQL Database wording requires product/operation disambiguation before drafting. |
| Private endpoints | 2 | 2 | 48.0000 | DNS and subresource-name troubleshooting; existing article already covers the topic. |
| Document extraction | 1 | 2 | 87.5000 | Exact `extracting structured data from templatic documents`; tentative task signal. |
| Azure RAG | 1 | 1 | 58.0000 | `azure openai rag`; insufficient evidence to commission another broad RAG guide. |
| Unresolved/noise | 2 | 2 | 49.5000 | `execut inurl:reel` and `kc cache`; do not silently relabel the latter as KV demand. |

Identity totals **40 visible impressions** across five query rows. Unambiguous KV concept/memory/paper groups also total **40**, but the practical memory subgroup is only **4**. These are observed exposure counts, not search-volume estimates or measurements of keyword difficulty.

## Page evidence, kept separate

Paths below are relative to `https://yadui.dev`. Values come directly from `Pages.csv`; exported page positions are not recomputed from query clusters. All non-KV pages have zero clicks and 0% exported CTR.

| Page | Clicks | Impressions | Exported position |
| --- | ---: | ---: | ---: |
| `/blog/llm-kv-cache-why-not-query` | 2 | 82 | 49.70 |
| `/blog/securing-azure-virtual-desktop-with-entra-id-and-passwordless-mfa` | 0 | 66 | 25.86 |
| `/blog/automating-azure-app-service-deployments-with-github-actions-and-secure-secrets` | 0 | 33 | 52.42 |
| `/blog/microsoft-foundry-agent-service-cloud-runtime` | 0 | 21 | 45.76 |
| `/blog/sql-database-scheduled-backup-to-azure-blob` | 0 | 18 | 56.50 |
| `/contact` | 0 | 16 | 8.69 |
| `/` | 0 | 13 | 7.23 |
| `/blog/connecting-custom-ai-agents-to-openwebui-auth-latency-and-api-design` | 0 | 11 | 21.00 |
| `/blog/building-a-production-rag-pipeline-with-azure-ai-search-and-gpt-4` | 0 | 7 | 33.43 |
| `/blog/schemaforge-extracting-structured-data-from-unstructured-documents-with-azure-ai` | 0 | 7 | 38.86 |
| `/blog/monolith-to-microservices-on-azure-a-production-migration-playbook` | 0 | 7 | 60.14 |
| `/work` | 0 | 5 | 32.20 |
| `/blog` | 0 | 3 | 9.00 |
| `/blog/private-endpoints-on-azure-the-dns-gotchas-nobody-warns-you-about` | 0 | 3 | 35.33 |
| `/blog/dockerizing-a-complex-app-lightweight-images-multi-stage-builds-and-secrets` | 0 | 2 | 59.50 |

KV and AVD account for **148/294 = 50.3401% of page-table impressions**. The 11 blog rows total **257 impressions**, while the four non-blog rows total **37**. Page-topic exposure plus a thematically similar query cluster helps set an editorial hypothesis, not a proven query-to-page match. A page row confirms recorded Search exposure, not current indexing or live article accuracy. Pages absent from the export are not proven unindexed.

### Country and device context

- United States: **135 impressions (45.9184%)**, 0 clicks, position 39.93; India: **56 (19.0476%)**, 2 clicks, 3.5714% recomputed CTR, position 37.73; United Kingdom: **11 (3.7415%)**, 0 clicks, position 44.18. The remaining 36 country rows total **92 impressions** and 0 clicks; all are retained in JSON.
- Desktop: **267 impressions (90.8163%)**, 2 clicks, **0.7491% CTR**, position 40.59. Mobile: **26 (8.8435%)**, 0 clicks, position 17.12. Tablet: **1 (0.3401%)**, 0 clicks, position 11.
- Do not infer device UX problems, target-country conversion quality, localization needs or country-specific content winners from these aggregates. Mobile's better position may reflect a different query mix; there is no cross-tab or conversion data.

## Recommended editorial order

**General priority:** approved accuracy corrections first, then the already-written AVD troubleshooting and passwordless migration companions. Identity has the strongest observed task-specific exposure/position combination. AI-focused work can proceed in the following order without duplicating those identity drafts.

| AI priority | Action and distinctive reader job | Data anchor | Duplication/review boundary |
| --- | --- | --- | --- |
| 1 | **Review the existing KV sizing draft**, not another “what is KV cache” article. Explain raw bytes/token, KV heads versus query heads, retained context, concurrency and allocation overhead with a reproducible worked example. | KV page: 82 impressions and both historical clicks. Named KV head/variant group: 35 impressions at ~86.14; sizing terms: only 4. | Reuse `scripts/blog-content/drafts/draft-kv-cache-memory-sizing.md`, proposed slug `kv-cache-memory-sizing-gqa-optimization`. Keep `/blog/llm-kv-cache-why-not-query` conceptual. The old `draft-llm-kv-cache-why-not-query.md` overlaps and is explicitly not a separate publication candidate [R1, R2]. Pin configuration/revisions and recheck math before approval. |
| 2 | **Review the existing Foundry production-readiness companion** for precise product/version, identity, tool-permission and state boundaries. | Microsoft-intent candidate queries: 12 impressions at ~41.75; existing Foundry page: 21 at 45.76. | Reuse `scripts/blog-content/drafts/2026-10-02/foundry-agent-service-production-checklist.md`. Preserve `/blog/microsoft-foundry-agent-service-cloud-runtime`; no second broad overview or Cloud Foundry article chasing its 7 mismatched impressions. The operational checklist is a reader-job hypothesis, not an observed checklist keyword. |
| 3 | **Review the existing Open WebUI/FastAPI discovery/streaming companion** rather than commission a generic agent guide. Require clear wire fixtures and runtime-review gates. | Page: 11 impressions at 21.00; **no named query in this export establishes this intent**. | Reuse `scripts/blog-content/drafts/2026-10-02/openwebui-fastapi-model-discovery-streaming.md`; keep it diagnostic, distinct from `scripts/blog-content/08-openwebui-integration.md`. Page-led hypothesis, not demonstrated keyword demand or a latency benchmark. |
| 4 | **Review the existing prefix-reuse companion as an optional experiment**, below sizing on direct query evidence. Focus on cross-request compatibility, misses and isolation. | KV group: 40 visible impressions and KV page: 82; **no named prefix-caching query**. | Reuse `scripts/blog-content/drafts/2026-10-02/prefix-caching-vs-kv-cache.md`. Do not merge it with memory sizing or repeat the attention derivation. Specific prefix demand and performance remain unmeasured. |
| 5 | **Maintain the existing Azure RAG guide**; narrow a section to a retrieval/citation diagnostic only if full-body audit finds a gap. | RAG query: 1 impression at 58; RAG page: 7 at 33.43. | Existing `scripts/blog-content/05-rag-architecture.md`; defer another broad RAG article. These counts do not establish demand for a new troubleshooting topic. |
| 6 | **Audit SchemaForge extraction coverage** before considering a template/validation failure companion. | Extraction query: 2 impressions at 87.50; SchemaForge page: 7 at 38.86. | Existing `scripts/blog-content/07-schemaforge-document-intelligence.md`; new task demand is tentative and must not duplicate its schema/extraction discussion. |

**Head versus long-tail:** Broad KV queries currently have poor observed positions; attempting to win “kv cache” with another explainer is less useful editorially than solving a precise sizing job. This is a strategic judgment, **not a measured competition score**: GSC supplies no competitor set or keyword-difficulty metric here. The long-tail also has poor position and only four impressions, so do not promise easier rankings, traffic or an AI citation.

**Identity companions already exist:** `draft-avd-mfa-sso-troubleshooting.md` and `draft-entra-passwordless-migration.md`, proposed slugs `azure-virtual-desktop-mfa-sso-troubleshooting` and `azure-ad-entra-passwordless-migration`. Their boundaries are AVD failure tracing versus workforce method/enrollment/recovery planning [R1]. Review these, do not commission duplicates. The three September 22 companion drafts remain marked **NOT APPROVED FOR PUBLICATION** in their front matter; approval/live state was not queried.

**October 2 package cross-check:** The parallel editorial plan already packages sizing, prefix reuse, Open WebUI diagnostics and Foundry readiness [R6]. Its three new draft files and source register exist and are marked **NOT APPROVED FOR PUBLICATION** [R7]. The ranking above refines evidence strength; it does not commission additional versions. Their proposed slugs are `prefix-caching-vs-kv-cache`, `openwebui-fastapi-model-discovery-streaming` and `foundry-agent-service-production-checklist`. Source-register technical review claims belong to that separate drafting work and were not independently re-executed here.

**Other maintenance:** App Service CI/CD has 33 page impressions but no named CI/CD query, so audit the existing article rather than infer a keyword winner. The existing `draft-github-actions-persist-credentials-security.md` is a narrower credentials-security draft, not automatically a new deployment guide. SQL backup has 18 page impressions and 5 related query impressions, but these are not joined; first distinguish SQL Server backup, Azure SQL Database export and restore goals. Private-endpoint DNS/subresource tasks belong in the existing article unless a distinct unmet job is established. Do not allocate content to `execut inurl:reel` or guess the meaning of `kc cache`.

## Search and AI-discovery approach

Use answer-first introductions, exact product/version names, primary citations close to technical claims, explicit assumptions/units, and genuine verification artifacts when available. Keep one article per reader job and add contextual reciprocal links only once the destinations are actually published. Do not invent firsthand experience or inflate word count to satisfy an upstream heuristic.

Google says the same foundational SEO practices apply to AI Overviews and AI Mode; there are **no special AI-file/schema requirements or guaranteed inclusion** [G4]. Their traffic is included in GSC **Web**, but these files do not isolate AI features. They provide no evidence of citations in Google AI features, ChatGPT, Perplexity or other engines. No “GEO score” or citation forecast is warranted. Preserve crawler policy and use the project's integration boundary [R4].

### Next measurement, after separately authorized publication

1. Record the actual live publication/update time, URL, body verification and crawl/index observations; distinguish them from September 22 source edits. Use the approved backup/dry-run workflow for existing corrections [R5]. Do not republish old dates as new evidence.
2. Obtain same-window **page-filtered query exports** (or a query × page report), plus daily page-level metrics, to test which article answers which cluster. Anonymous-query limitations still apply. Do not reconstruct a join from these files.
3. Compare non-overlapping 7/14-day windows with identical filters and weekday coverage; prefer longer windows when volume allows. Report absolute counts, query coverage, CTR and position together. A before/after difference alone is not causal attribution.
4. Track useful outcomes separately, such as qualified contact or project visits, using existing analytics with appropriate permissions. No conversion counts are available here. For optional AI-citation checks, record the exact prompt, engine, URL and observation time, not a guaranteed GEO result.

## Reproducibility, provenance and checks

The analyzer is pure standard-library Python: no app imports, network, credential/environment reads, database access or source writes. It prints JSON to stdout only.

```sh
python3 -B scripts/analyze-gsc-export.py --self-test
python3 -B scripts/analyze-gsc-export.py '/Users/abhinavyadav/Downloads/yadui.dev-Performance-on-Search-2026-10-02'
```

Compare the parsed stdout JSON to the saved summary semantically (whitespace/order do not matter). Checks passed for multiline CSV parsing, weighted position/CTR with zero-impression handling, and distinct Foundry/KV intents. Independent source arithmetic and complete regenerated-summary equality were also checked; no lint/build/browser pass is claimed for these documentation/offline-analysis deliverables.

| Source file | Bytes | SHA-256 |
| --- | ---: | --- |
| Chart.csv | 829 | `351debc1420789548ad299388ea138cbe7f3ffdb8e549531107b39b1050c2cf5` |
| Queries.csv | 1,152 | `cf32d531868315033f2f3dc9729a1a1fa6576adb127b284e24e116e42005d544` |
| Pages.csv | 1,266 | `7495fa4bb90dda9a73e698286b693d3e73f2a19cd8d0dca445f5d23ca5b0c7d6` |
| Countries.csv | 811 | `ba30439b7991884377b1cc76f1d5427e7808a2cc94be2e37353df92147d4d72e` |
| Devices.csv | 102 | `1f1783d42eb4f6bda8ce8bd193f3d49ed3ac54bdc7eab69293fdb4d0d493576c` |
| Filters.csv | 47 | `163c07d6839b411e21df0e69bc8ae8a86013b42179da00682150503d1400951f` |
| Search appearance.csv | 49 | `eed9ceafb9193e5e3d034f5897ad992bc851f1998204cd98f0b0f6873fbfc8b2` |

Scope/pre-flight: Markdown report and JSON analysis only, plus the optional analyzer. No UI/content edits, visual tokens, animation, assets or public rendering; UI design/lint/build/mobile/reduced-motion checks are not applicable. Source directory and existing uncommitted publisher/article changes were preserved. No DB/browser/credential operation, publication, commit, push or indexing request.

### Primary Google sources (fetched 2026-10-02)

- **[G1]** [Performance report overview](https://support.google.com/webmasters/answer/7576553?hl=en): metric definitions, property/page aggregation and chart/table differences.
- **[G2]** [Impressions, position and clicks](https://support.google.com/webmasters/answer/7042828?hl=en): impression-averaged topmost position, property versus page counting, canonical attribution and result-type caveats.
- **[G3]** [Troubleshooting data discrepancies](https://support.google.com/webmasters/answer/17010575?hl=en): anonymized-query omission, 1,000-row limit, processing/aggregation differences, reporting lag and Pacific Time daily dates.
- **[G4]** [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features): standard SEO requirements, no special AI files/schema, no inclusion guarantee and reporting within Web search.

### Repository context (read, not live-publication verification)

- **[R1]** [CONTENT_PLAN_2026-09-22.md](CONTENT_PLAN_2026-09-22.md): earlier screenshot limitations, existing draft boundaries and approval gates.
- **[R2]** [ARTICLE_CORRECTIONS_2026-09-22.md](ARTICLE_CORRECTIONS_2026-09-22.md): latest dated local-source corrections, corrected arithmetic and no shared-database publication claim.
- **[R3]** [RELEASE_2026-09-22.md](RELEASE_2026-09-22.md): recorded deployment/metadata work versus separately required body publication.
- **[R4]** [GEO_SEO_INTEGRATION.md](../GEO_SEO_INTEGRATION.md): source-grounding, no invented outcomes, publication boundary and adapter precedence over vendored scoring assertions.
- **[R5]** [BLOG_PUBLISHER.md](BLOG_PUBLISHER.md): guarded correction workflow; reading it grants no authorization to publish.
- **[R6]** [AI_EDITORIAL_PLAN_2026-10-02.md](AI_EDITORIAL_PLAN_2026-10-02.md): concurrent draft package and intent boundaries; work-in-progress state at review.
- **[R7]** [AI_SOURCE_REGISTER_2026-10-02.md](AI_SOURCE_REGISTER_2026-10-02.md): separate drafting task's primary-source review, existing-body review and limitations.
- Draft front matter and relevant openings in `scripts/blog-content/drafts/`, including `2026-10-02/`; file inventory in `scripts/blog-content/`; `data/blogSlugsFallback.json` for existing routes. This analysis did not inspect full live Foundry/SQL article bodies.
