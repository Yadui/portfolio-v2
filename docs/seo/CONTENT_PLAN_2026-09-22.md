# Source-grounded editorial plan

**Plan date:** 2026-09-22
**Status:** All three associated drafts are **NOT APPROVED FOR PUBLICATION**.

## Design and scope read

**Design Read:** Existing technical portfolio editorial content for identity administrators and inference engineers, using the established readable, task-oriented editorial composition.

- **Mode:** Existing-content companion drafting; audit first, then distinct task coverage.
- **DESIGN_VARIANCE:** 7, retaining the portfolio's existing editorial character.
- **MOTION_INTENSITY:** 0, because this is static content-only work.
- **VISUAL_DENSITY:** 4, using short sections, concrete procedures, and one worked calculation.
- **Composition:** Existing editorial article flow, answer-first introduction, task-oriented headings, contextual citations, and verified internal links.
- **Motion and assets:** None required. No UI implementation or visual-token changes.
- **Deliverables:** Three Markdown drafts under `scripts/blog-content/drafts/` and this source/review plan. Publication metadata stays in front matter, outside each article body.

## Search evidence and its limits

User-supplied GSC screenshot transcription: **2 clicks, 244 impressions, 0.8% CTR, average position 40.7**. These figures were not independently retrieved from Search Console. The screenshot selects **3 months**, **Web** search, and **weekly** aggregation; the exact start/end dates, complete page/country/device breakdowns, and query-to-page mapping are unavailable.

| Query as supplied | Impressions | Editorial response |
| --- | ---: | --- |
| azure active directory passwordless | 16 | Clarify old terminology and guide method selection, enrollment, recovery, and enforcement. |
| kv caching | 12 | Support the existing conceptual explainer with practical sizing. |
| kv cache | 12 | Same topic cluster, not a second near-duplicate article. |
| kv-cache | 3 | Same cluster; avoid keyword-variant pages. |
| mfa for vdi | 8 | AVD-specific troubleshooting; do not imply coverage of every VDI platform. |
| azure virtual desktop mfa | 6 | Diagnose service versus session-host authentication and stage policy rollout. |
| windows virtual desktop mfa | 3 | Explain the legacy display name inside the same AVD article. |
| cloud foundry managed services | 4 | Defer. Cloud Foundry and Microsoft Foundry are different products; this query needs page-level intent research before commissioning content. |

These low-volume observations prioritize useful companion material; they do not establish why CTR is low or justify a ranking, traffic, or AI-citation forecast. Obtain a query/page export for the same reporting window before deciding which existing title or snippet needs revision.

## Existing-content audit and intent boundaries

Read in full before drafting:

- `scripts/blog-content/02-avd-entra-id.md`: broad AVD identity architecture, MFA and passwordless overview with deployment-story claims.
- `scripts/blog-content/13-llm-kv-cache-why-not-query.md`: conceptual explanation of why K/V are reusable and past Q is not, followed by serving implications.
- `scripts/blog-content/drafts/draft-llm-kv-cache-why-not-query.md`: overlapping conceptual draft, including the same sizing and performance assertions.

| Draft file | Proposed slug | Unique reader job | Boundary |
| --- | --- | --- | --- |
| `draft-avd-mfa-sso-troubleshooting.md` | `azure-virtual-desktop-mfa-sso-troubleshooting` | Trace a failed or repeated sign-in across two applications and roll out changes in stages. | Not another AVD architecture overview or deployment case study. |
| `draft-entra-passwordless-migration.md` | `azure-ad-entra-passwordless-migration` | Select methods and plan migration from password-dependent workflows. | General workforce identity lifecycle, not AVD setup. |
| `draft-kv-cache-memory-sizing.md` | `kv-cache-memory-sizing-gqa-optimization` | Calculate raw cache payload, budget capacity, and evaluate memory options. | Does not repeat the causal-mask derivation from the existing explainer. |

## Verified source register

Verification means official page content was retrieved and reviewed during this task, not that the procedure was executed. Search results were used for discovery; substantive claims were checked against fetched Microsoft Learn, Hugging Face, and model-publisher content. URLs were accessed on 2026-09-22. No source publication date has been inferred from access time.

### AVD and Conditional Access

1. [AVD MFA setup](https://learn.microsoft.com/en-us/azure/virtual-desktop/set-up-mfa): application IDs, ARM Provider exclusion, two-policy structure, licensing, Security Defaults conflict, per-user MFA conflicts, Windows App dependency, sign-in frequency behavior. Full Markdown fetched after initial extraction included noisy page chrome.
2. [AVD Entra SSO configuration](https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-single-sign-on): host/client prerequisites, RDP authentication, `enablerdsaadauth`, consent groups, Kerberos conditions, session-lock behavior, and no blanket local-PC join requirement.
3. [SSO/Conditional Access troubleshooting](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-sso-conditional-access): symptom categories and error-specific diagnostic paths. Extraction omitted some list content; detailed procedures in the draft rely on the fuller setup/configuration sources above.
4. [Report-only evaluation](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-report-only): result meanings, unenforced interactive challenges, and device-certificate prompt caveat.
5. [Conditional Access insights/reporting](https://learn.microsoft.com/en-us/entra/identity/conditional-access/howto-conditional-access-insights-reporting): evaluation outcomes, workbook prerequisites, and why changing an existing enforced policy to report-only removes that enforcement.

### Passwordless migration

6. [Azure AD naming change](https://learn.microsoft.com/en-us/entra/fundamentals/new-name): rename continuity and distinction from Windows Server Active Directory. Used only for naming facts; historical tooling-lifecycle passages are not treated as current migration guidance.
7. [Passkeys authentication](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-passwordless): current content at this legacy-looking URL covers FIDO2 passkeys and origin-bound cryptography.
8. [Passwordless deployment guidance](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-deployment): stakeholder responsibilities, role/licensing review, and deployment planning. Feature lists include evolving capabilities, so the draft avoids universal availability claims.
9. [Authenticator phone sign-in](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-phone): device-bound credential, enablement separate from app registration, and policy dependency.
10. [Authentication strengths](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strengths): passwordless versus phishing-resistant classification, multifactor CBA, TAP classification, initial-authentication limitation, and unsupported combination of MFA and strength grant controls.
11. [Temporary Access Pass](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-temporary-access-pass): time-limited bootstrap/recovery, one-time versus multiuse, policy scoping, and no automatic password replacement.
12. [Windows Hello for Business](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/): device-specific key and local PIN/biometric gesture.

### Cache sizing

13. [HF cache explanation](https://huggingface.co/docs/transformers/en/cache_explanation): per-layer K/V tensors and their shape; basis for the derived scalar-count formula.
14. [HF cache strategies](https://huggingface.co/docs/transformers/en/kv_cache): dynamic/static allocation, windowed layers, quantization caveats, offloading trade-offs, and model-specific caches.
15. [HF Qwen2 model documentation](https://huggingface.co/docs/transformers/en/model_doc/qwen2): GQA configuration and relationship of KV heads to query heads.
16. [Qwen2.5-7B-Instruct publisher configuration](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/raw/main/config.json): `num_hidden_layers=28`, `hidden_size=3584`, `num_attention_heads=28`, `num_key_value_heads=4`, `use_sliding_window=false`, and stored BF16 dtype declaration. Retrieved with both extraction and direct fetch. The example assumes a BF16 cache; config dtype alone does not prove runtime cache precision.

The unversioned HF documentation retrieved by the tools contained links to different Transformers versions. Before adding runnable examples or approving publication, select a coherent documentation/library version and pin the model revision. Current draft advice is conceptual and explicitly avoids backend-specific tested claims.

## Arithmetic verification

Independently evaluated with Node.js, without importing project code or loading a model:

```text
2 × 28 × 4 × 128 × 2 = 57,344 bytes per token = 56 KiB
57,344 × 8,192 = 469,762,048 bytes = 448 MiB = 0.4375 GiB
4 × 0.4375 = 1.75 GiB for four equal independent sequences
57,344 × 32,768 / 2^30 = 1.75 GiB for one longer sequence
28 / 4 = 7 query heads per KV group
```

Formula scope: uniform decoder-only full attention, equal K/V dimensions and scalar size, unsharded logical payload, independent sequences. Padding, static reservation, packed lengths, quantization residuals/metadata, prefix sharing, and architecture-specific attention require separate treatment. Runtime memory and latency remain unmeasured.

## Existing accuracy gaps requiring owner review

These findings are recorded for the main editor; the existing numbered articles and prior draft were not edited by this task.

1. **AVD ARM Provider targeting:** `02-avd-entra-id.md` says both the AVD application and ARM resource need coverage. Current Microsoft guidance explicitly says not to enforce MFA on the Azure Virtual Desktop Azure Resource Manager Provider. Review and correct the operational wording before publishing companion links.
2. **AVD grant-control example:** Existing JSON combines MFA and an authentication-strength field. Microsoft documents that Require MFA and Require authentication strength cannot be combined in one policy. An editor should validate any replacement against the actual API schema rather than treating the existing illustrative JSON as executable.
3. **Blanket Intune/SSO claim:** Existing copy says SSO requires an Intune-enrolled feed or compliant device. Current prerequisites explicitly permit supported Windows clients without local-PC domain/Entra join; compliance is a separate policy condition. Review that distinction and the old article's sign-in-frequency assertions.
4. **Deployment evidence:** Existing AVD and KV articles contain customer scale, security outcomes, performance improvements, and quality percentages without supporting evidence in the files reviewed. Obtain attributable records or remove those claims through a separately authorized edit. None were reused in these drafts.
5. **KV arithmetic:** Both existing KV files label `2 × 32 × 8 × 128 × 8192 × 2` as approximately 8.6 GB. Independent arithmetic gives **1,073,741,824 bytes = 1 GiB** for those operands. Also re-verify the claimed Llama-3 70B layer count against that exact checkpoint; this task did not fetch its configuration. Do not present the operands as verified Llama-70B architecture.
6. **Unconditional optimization advice:** Existing recommendations to quantize first and implied universal quality/latency benefits need workload-specific evidence. HF documents latency trade-offs. The new sizing draft uses a decision process instead.

## Internal linking and publication review

Verified repository slugs in `data/blogSlugsFallback.json`, with route shape confirmed in `app/blog/[slug]/page.jsx`:

- `/blog/securing-azure-virtual-desktop-with-entra-id-and-passwordless-mfa`: linked from the AVD runbook and passwordless migration draft for architectural context.
- `/blog/llm-kv-cache-why-not-query`: linked from the sizing draft for conceptual background.

This is repository-level verification, not a live HTTP or database-content check. Before approval, verify each deployed destination and resolve the accuracy gaps above. Proposed new slugs are not linked as if published. After publication is separately authorized, consider contextual reciprocal links from the existing overview articles; avoid bulk keyword-rich link insertion.

### Review gates

- Identity reviewer: verify application IDs, supported clients/hosts, method classification, licensing, enrollment and recovery flow, and policy interaction against current Learn guidance.
- Inference reviewer: verify checkpoint revision, head dimension, cache dtype assumptions, units and arithmetic; profile only if adding empirical performance claims.
- Editor: confirm each article solves its distinct reader task; strip editorial front matter from the publishable body; retain useful citations; approve proposed title, slug, excerpt and tags.
- Site owner/main agent: verify live internal destinations, resolve source-article gaps, and handle any import, publication dates, sitemap, indexing, structured-data, or GEO-toolkit work separately.

## SEO/GEO editorial approach and measurement

Answer the question immediately, name the exact product and configuration, attach primary-source links near consequential claims, and label calculations as calculations. Use FAQs only where they resolve a real misconception. Do not add fictitious deployment experience, author credentials, test results, or source dates to imply authority.

After separately approved publication, record the actual publish date and baseline query/page export. Compare equivalent GSC windows, segmented by page and query cluster, with device/country context. Track indexing, impressions, clicks, CTR, and position together; low-volume percentage changes alone are weak evidence. Check whether new pages answer distinct queries rather than displacing the overview with near-identical intent. AI-answer citation checks, if desired, should record exact prompts, engine and observation time; presence or absence is an observation, not a guaranteed GEO outcome.

## Content-only pre-flight

- Body word counts, excluding front matter and counting whitespace-delimited Markdown tokens (including headings and calculation blocks): **883** AVD troubleshooting, **904** passwordless migration, **903** KV sizing. All three meet the requested approximate 700-1,000-word range.
- Design Read, dials 7/0/4, existing-content audit, composition and asset/motion plan are explicit.
- Drafts contain complete answer-first bodies, proposed metadata, official citations, source-review notes, and verified repository internal slugs.
- No new customer stories, measured outcomes, benchmark percentages, or publication dates are asserted.
- No decorative em/en dash separators, assets, placeholders, UI changes, secrets, or credentials are introduced.
- Mathematical values were computed independently; editorial metadata and internal links receive local structural checks.
- UI token, hero, layout, responsive, interaction, motion, lint/build, and browser-render checks are not applicable to these Markdown-only draft deliverables. No rendered-page verification is claimed.
- Source documents and deployed links should be rechecked at approval time; tenant execution and model profiling remain explicit review gaps.
