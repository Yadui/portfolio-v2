# Article corrections: 2026-09-22

## Scope and publication boundary

These corrections apply to **local repository Markdown files, not the live blog database**. A Git commit or push of these editorial sources is not an article import or database publication.

No shared-database writes, seed/import execution, admin submissions, publication-date updates, or indexing requests were performed. Live article bodies were not inspected or verified as corrected.

The three existing article/draft files were Git-tracked and edited in place. Their prior text remains in Git history. This correction record did not exist at the initial inspection; future entries should be appended without replacing this record.

Only these four files are part of this editorial change:

- `scripts/blog-content/02-avd-entra-id.md`
- `scripts/blog-content/13-llm-kv-cache-why-not-query.md`
- `scripts/blog-content/drafts/draft-llm-kv-cache-why-not-query.md`
- `docs/seo/ARTICLE_CORRECTIONS_2026-09-22.md`

The slug manifest and global changelog were not edited by this task. Existing unrelated working-tree changes are outside this commit. The source articles retain their topics, H1 conventions, and existing date/tag metadata; no front matter migration was made.

## Editorial design read

**Design Read:** Existing technical portfolio articles for identity administrators and inference engineers, using clear, source-grounded explanations in the established editorial composition.

- **Mode:** Preserve existing surfaces; scan, diagnose, and correct factual/editorial defects.
- **DESIGN_VARIANCE:** 7, retaining the portfolio's editorial character.
- **MOTION_INTENSITY:** 0, static Markdown-only work.
- **VISUAL_DENSITY:** 4, short sections, selective tables, and a worked calculation.
- **Composition:** Answer first, explain prerequisites and reasoning, attach official citations, finish with a concrete next action.
- **Motion and assets:** None added. UI implementation and visual tokens are outside this correction.

Read before editing: `docs/GEO_SEO_INTEGRATION.md`, `docs/seo/CONTENT_PLAN_2026-09-22.md`, and `docs/PORTFOLIO_TASTE_STANDARD.md`. Consulted the vendored Taste/redesign and GEO/content references through the project adapters.

## Change history

### 2026-09-22

#### [FIX] Correct AVD identity and access guidance

- **Template/File:** `scripts/blog-content/02-avd-entra-id.md`
- **What changed:** Reframed the deployment story as a practical documentation-grounded overview.
- **Before:** Unsupported 200-seat client story, cyber-insurance requirement, 15-year GPO history, credential rollout, 87% ticket reduction, zero-compromise and complete-coverage claims.
- **After:** No asserted customer deployment or measured outcomes. Architecture, prerequisites, and pilot recommendations are explicitly distinguished from execution evidence.
- **Why:** No attributable deployment records accompanied those claims.
- **Fix/Notes:**
  - Replaced advice to target both AVD and its ARM Provider with the documented AVD service and Windows Cloud Login boundaries. Included all three application IDs and an explicit warning not to enforce MFA on the ARM Provider.
  - Removed the invalid illustrative policy payload, including its string-valued authentication-strength field and unsupported combination of MFA and authentication-strength controls. Replaced it with documented policy choices, not replacement executable JSON.
  - Scoped Entra/hybrid host requirements to Entra SSO rather than claiming these are the only AVD identity models. Distinguished user identity from host join state and service, session-host, and in-session authentication.
  - Removed the blanket Intune/compliance prerequisite. Explained that supported local Windows clients need not universally be domain/Entra joined, while Conditional Access may independently require compliance.
  - Removed the incomplete storage PowerShell example with misleading domain/GUID substitutions. Linked the identity-specific FSLogix guide and separated share/file permissions, ticket retrieval, and profile loading from SSO.
  - Distinguished passwordless from phishing-resistant authentication and method registration from policy enforcement.
  - Corrected sign-in frequency: it does not interrupt an established desktop merely because the interval expires. For this flow, Every time is supported only on Windows Cloud Login.
  - Replaced emergency PIM activation dependency with Microsoft's permanent-active Global Administrator guidance, cloud-only accounts, phishing-resistant methods, restrictive-policy exclusions, protected credentials/workstations, monitoring, and regular validation.
  - Added licensing and policy-conflict checks, retained baseline protection, report-only evaluation limits, an enforced pilot, sign-in/profile acceptance checks, and an identified rollback owner.

The detailed `draft-avd-mfa-sso-troubleshooting.md` remains separate and unedited. The overview does not reproduce its symptom-by-symptom diagnostic runbook or imply that the draft has been published.

#### [FIX] Correct KV arithmetic and unsupported serving claims

- **Template/File:** `scripts/blog-content/13-llm-kv-cache-why-not-query.md`; `scripts/blog-content/drafts/draft-llm-kv-cache-why-not-query.md`
- **What changed:** Corrected both sources so the overlapping old draft cannot reintroduce the same errors.
- **Before:** A 32-layer example attributed to Llama-3 70B, approximately 8.6 GB per sequence and approximately 275 GB at batch 32; unsupported quantization-quality, fragmentation, and first-token-latency percentages.
- **After:** An explicitly hypothetical 32-layer, 8-KV-head, 128-dimension, 8,192-token FP16 example: exactly 1 GiB per sequence and 32 GiB for 32 independent equal-length sequences.
- **Why:** The old arithmetic was wrong, the named checkpoint dimensions were not verified, and no workload measurements supported the performance claims.
- **Fix/Notes:**
  - Scoped “never Q” to persistent cache reuse in standard causal autoregressive decoding. Distinguished prefill and temporary kernel storage; stated fixed-parameter, unchanged-prefix and positional assumptions.
  - Added the additive mask to the attention equation and distinguished unscaled scores from probabilities. Future-position logits become negative infinity and have zero softmax probability; their original dot products need not be zero.
  - Scoped the memory formula to uniform decoder-only full attention with equal K/V dimensions and scalar size. Separated logical payload from weights, workspaces, allocation overhead, reserved capacity, sharding, windowing, and prefix sharing.
  - Retained MHA/GQA/MQA head-sharing concepts with an official configuration reference. Removed model-family examples and unsupported quality claims; any head-ratio saving is explicitly arithmetic with other dimensions held fixed.
  - Removed the less-than-0.5% quantization-quality claim, universal “quantize first” advice, 30–60% fragmentation assertion, approximately 40% first-token-latency claim, and the anecdotal RAG/VirtuAI workload evidence.
  - Qualified quantization/offloading trade-offs and distinguished paging from compression. Labeled the cited PagedAttention design as historical, following vLLM's own warning.
  - Explained exact compatible prefix reuse, preceding context, cache identity, and retained entries. Prefix caching saves repeated prefill, not the new-token decode computation itself.
  - Replaced the draft's unverified “Zenn trending (48 likes)” line with an editorial status marking it as an overlapping retained draft, not a separate publication candidate.
  - Added concrete next steps to inspect checkpoint/runtime configuration, calculate payload, and measure representative workloads.

The distinct `draft-kv-cache-memory-sizing.md` was not edited or duplicated into a new article. Existing KV title/date/tag conventions were retained; the old date labels are not new evidence of publication.

## Official source checks

Access date: **2026-09-22**. Verification here means official page content was fetched and reviewed, not that tenant configuration or inference experiments were executed. Read-only extraction/direct HTTP fetching was used; no browser was used.

| Official source | Checked claim or editorial use |
| --- | --- |
| [Microsoft: AVD authentication](https://learn.microsoft.com/en-us/azure/virtual-desktop/authentication) | Three phases; same identity across service and Windows; supported identity distinctions. |
| [Microsoft: AVD MFA setup](https://learn.microsoft.com/en-us/azure/virtual-desktop/set-up-mfa) | Service `9cdead84-a844-4324-93f2-b2e6bb768d07`, Windows Cloud Login `270efc09-cd0d-444b-a71f-39af4910ec45`, ARM Provider `50e95039-b200-4007-bc97-8d5790743a63`; no MFA on ARM Provider; two-policy structure, licensing, policy conflicts, and reauthentication boundaries. |
| [Microsoft: Entra SSO for AVD](https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-single-sign-on) | Host/client prerequisites, no universal local-PC join requirement, RDP enablement, consent groups, conditional Kerberos dependencies, and host-pool SSO. |
| [Microsoft: Authentication strengths](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strengths) | Passwordless versus phishing-resistant methods; MFA and authentication-strength grant controls cannot be combined in one policy. |
| [Microsoft: FSLogix with Azure Files and Entra ID](https://learn.microsoft.com/en-us/fslogix/how-to-configure-profile-container-entra-id-hybrid) | Identity-specific setup paths, share and file permissions, ticket retrieval, and profile tests. Retrieved through the old AVD profile-container URL, which resolved to this canonical FSLogix page. |
| [Microsoft: Emergency access](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access) | At least two cloud-only accounts; phishing-resistant credentials; permanent-active rather than eligible Global Administrator; exclusions, monitoring, secure workstations, and 90-day validation. |
| [Microsoft: Report-only evaluation](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-report-only) | Report-only does not enforce the proposed MFA challenge; “User action required” is not proof that the user can satisfy it. |
| [Hugging Face: How caching works](https://huggingface.co/docs/transformers/en/cache_explanation) | Per-layer K/V reuse, current query, causal-prefix invariance, and cache tensor dimensions. |
| [Hugging Face: Cache strategies](https://huggingface.co/docs/transformers/en/kv_cache) | Static allocation, windowed layers, offloading, quantization/residual storage, and possible short-context latency penalty. |
| [Hugging Face: Qwen2 configuration](https://huggingface.co/docs/transformers/en/model_doc/qwen2) | MHA/GQA/MQA head-count conventions only; not the hypothetical example's checkpoint dimensions. |
| [vLLM: PagedAttention design](https://docs.vllm.ai/en/latest/design/paged_attention/) | Block-based KV layout; explicit warning that this is historical and no longer describes current code. |
| [vLLM: Automatic prefix caching](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/) | Shared-prefix reuse and prefill-versus-decode limits. |
| [vLLM: Prefix-cache design](https://docs.vllm.ai/en/stable/design/prefix_caching/) | Block-token and parent-prefix identity, additional hashes such as LoRA IDs, allocation and eviction. |

The unversioned HF pages returned links to different Transformers versions, and vLLM `/latest/` identifies itself as developer-preview documentation. These articles use conceptual guidance, not pinned or tested API instructions.

Recheck release-specific support and official guidance before implementation. The hypothetical example intentionally makes no assertion about Llama checkpoint dimensions, and no model configuration was fetched as evidence for those operands.

## Arithmetic verification

Independently evaluated with Node.js, without importing application code or loading a model:

```text
2 × 32 × 8 × 128 × 2 = 131,072 bytes per retained token
131,072 × 8,192 = 1,073,741,824 bytes = 1 GiB
1,073,741,824 × 32 = 34,359,738,368 bytes = 32 GiB
64 / 8 = 8, for the otherwise-identical head-count comparison
```

Assertions for exactly `2^30` bytes per sequence and `32 × 2^30` bytes at batch 32 passed. These are logical payload calculations, not device-memory or latency measurements.

## Content-only pre-flight and limitations

- Read all three original files and the separate AVD troubleshooting draft before editing; reviewed each revised article in full afterward.
- Design read, preserve mode, dials, composition, and motion/asset plan are recorded above.
- Existing H1 and date/tag conventions retained. No front matter, slug, navigation, visual-token, dependency, or UI changes were introduced by this task.
- Official citations are attached to consequential claims; unsupported customer stories and performance percentages were removed rather than replaced with invented evidence.
- Both cache examples use the same corrected operands and units. The causal-mask explanation distinguishes scores from probabilities.
- Each article provides a concrete next action. The old overlapping draft is explicitly marked against separate publication.
- No new decorative em/en dash separators, placeholder assets, secrets, or credentials were added. Public Microsoft application IDs are identifiers, not credentials.
- Scoped `git diff --check` passed for the article edits. The commit review is restricted to the four files listed above.
- Application lint/build and mobile/desktop/reduced-motion browser checks are not applicable to these local Markdown corrections. No UI code or live article body was changed, and no rendered-page pass is claimed.
- No Azure tenant test, credential enrollment, profile-storage test, model execution, or performance profiling was performed.

Before any later live correction, obtain a verified export/backup and a separately authorized slug-preserving database update. This report resolves the local-source issues recorded in the content plan; it does not close that plan's live-publication review gates.

### Final staged-content checks

Read-only Node assertions against the Git index passed for all three articles: preserved real H1/date/tag metadata, balanced code fences, no new front matter, official-domain citations, removal of the flagged numerical claims, and concrete next actions.

The checks also confirmed matching corrected KV examples, removal of AVD JSON/PowerShell blocks, the ARM Provider warning, permanent-active emergency access, and exactly the four authorized staged paths.

An initial heading check counted PowerShell comments inside the removed code block as H1s. The check was corrected to exclude fenced code; no article change was required. The corrected check passed in full.
