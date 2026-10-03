# AI draft source register

**Review date:** 2026-10-02. **Publication status:** not approved. These are local editorial drafts only. No database access, seed-manifest changes, environment-file access, deployment, publication, indexing request, dependency installation, commit or push was performed for this assignment.

## Scope and distinct reader intent

- `scripts/blog-content/drafts/2026-10-02/foundry-agent-service-production-checklist.md`: operational release evidence for identity, tools, persisted state, retries and evaluation. Complements the existing 601-word Foundry runtime overview instead of repeating its announcements.
- `scripts/blog-content/drafts/2026-10-02/openwebui-fastapi-model-discovery-streaming.md`: a failure-diagnostic sequence from network path through discovery, authentication and Chat Completions SSE. Complements the existing architecture article, which contains incomplete application functions and deployment anecdotes. None of those anecdotes or timing claims were reused.
- `scripts/blog-content/drafts/2026-10-02/prefix-caching-vs-kv-cache.md`: cross-request reuse, exact-prefix misses, provider-specific controls and cache isolation. Does not repeat the attention derivation in the existing K/V article or the pending memory-sizing calculation.

The delegated brief supplied these GSC leads: KV cache 82 impressions and 2 clicks; Foundry 21 impressions with average position 45.76; Open WebUI 11 impressions with average position 21. These were not independently retrieved in this assignment. They are topic-selection inputs, not per-keyword mappings, search-volume estimates, evidence of causation or promises of additional clicks. Obtain comparable query-by-page exports before attributing outcomes to new content.

Repository context read: `docs/GEO_SEO_INTEGRATION.md`, `docs/PORTFOLIO_TASTE_STANDARD.md`, the vendored GEO overview and content reference, AI numbered articles 05, 06, 07, 08, 09 and 13, the retained K/V draft, and the memory-sizing draft. No UI implementation or token change was made; the visual pre-flight, build and browser-layout checks are not applicable to unpublished Markdown. The editorial checks below remain applicable.

## Foundry: verified first-party documentation

All source URLs below were retrieved and read on **2026-10-02**. Microsoft Learn metadata dates describe the source, not a proposed blog publication date.

### Service and runtime contract

- <https://learn.microsoft.com/en-us/azure/foundry/agents/overview>. Source `ms.date`: 2026-09-25. The legacy `/azure/ai-foundry/agents/overview` request returned this canonical `/azure/foundry/` page. Supports the current overview's prompt, voice-based prompt and hosted paths plus direct Responses API use. The draft does not repeat the older article's workflow-agent taxonomy as the current exhaustive list.
- <https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/runtime-components>. Source `ms.date`: 2026-08-19. Supports agent definitions, conversations, responses, durable conversation items, active-context truncation and response `store=false`. Its Python examples specify `azure-ai-projects>=2.0.0`; JavaScript prerequisites identify Node.js 22+ with `@azure/ai-projects` 2.4.0. These are documentation prerequisites, not locally installed or tested versions. Verified sample API names include `AIProjectClient`, `PromptAgentDefinition`, `project.agents.create_version`, `project.get_openai_client`, `openai.responses.create` and `openai.conversations.create`. The draft deliberately avoids an executable SDK sample.

### Identity transition and tool permissions

- <https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/migrate-agent-applications>. Source `ms.date`: 2026-07-21; retrieved metadata `updated_at`: 2026-09-25. Supports separate legacy Agent Applications versus the new agent object model, unique identities at new-agent creation, separate endpoint/version selection and M365 distribution, and permission reassignment on migration. Its inspection request is `GET {endpoint}/agents/{agent_name}?api-version=2025-11-15-preview` with `Foundry-Features: AgentEndpoints=V1Preview`, checking `instance_identity`. Other prose uses `agent.identity`. This preview example is not generalized into a stable API guarantee.
- <https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-identity>. Source `ms.date`: 2026-08-21; retrieved metadata `updated_at`: 2026-09-24. Supports blueprint authentication, downstream token audiences, agent-principal permissions, delegated versus unattended access and authentication differences by tool. The page explicitly says its publishing section describes the older Agent Application model and links to the migration guide. Therefore the draft does not state that every agent changes identity when published. Foundry RBAC role-name transitions are noted in Learn; no new role assignment command is supplied in the draft.
- <https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-best-practice>. Source `ms.date`: 2026-09-11. Supports model-plus-region availability, `tool_choice` values `auto`, `required` and `none`, schema validation, treating tool outputs as untrusted, approval for consequential actions and diagnostic checks. Forcing a call is not presented as a correctness or authorization guarantee.

### Evaluation and observability

- <https://learn.microsoft.com/en-us/azure/foundry/observability/how-to/evaluate-agent>. Source `ms.date`: 2026-09-25; retrieved metadata `updated_at`: 2026-09-30. Supports rubric-plus-additional evaluators, JSONL datasets, exact target versions and row-level analysis. Its Python setup specifies `azure-ai-projects>=2.4.0`, different from the runtime guide's minimum. `project_client.beta.evaluators.begin_create_generation_job` is a beta namespace in the documented example. No installation, rubric generation, evaluation score or acceptance percentage is claimed.
- <https://learn.microsoft.com/en-us/azure/foundry/observability/concepts/trace-agent-concept>. Source `ms.date`: 2026-08-28. Supports Application Insights-backed tracing, tool inputs/results, retry and latency visibility, telemetry access, retention and redaction. The page states tracing is generally available for prompt and hosted agents while workflow/external agents are preview, and says GenAI semantic conventions have Development status. The draft does not imply traces are automatically enabled or stable across every agent type.

**Application recommendations, not service guarantees:** end-to-end deadlines, retry classification, avoiding nested retry amplification, destination-side deduplication, authorization on conversation ownership and reconciling uncertain writes. No exactly-once Agent Service guarantee was found or claimed. `store=false` is described only for the documented response-storage boundary, not as deletion of every data store or telemetry stream.

## Open WebUI and FastAPI: verified contracts

- <https://docs.openwebui.com/getting-started/quick-start/connect-a-provider/starting-with-openai-compatible>. Retrieved 2026-10-02. Supports current connection controls, server base URLs, bearer-based verification, manually configured Model IDs, recommended `/v1/models`, required `/v1/chat/completions`, optional modality endpoints and forwarded parameters. Saving a connection is not verification. Discovery failure is not universally equivalent to chat incompatibility.
- <https://docs.openwebui.com/features/extensibility/plugin/tools/openapi-servers>. Retrieved 2026-10-02. Supports the separate OpenAPI tool-server boundary and its complete-result, non-token-streaming responses. A FastAPI OpenAPI schema does not establish Chat Completions compatibility. No filesystem-tool setup or externally privileged example was copied.
- <https://platform.openai.com/docs/api-reference/models/list>. Retrieved 2026-10-02. Supports the list response and model fields `id`, `object`, `created` and `owned_by`. The example uses fictional `demo-agent`, owner `local-demo` and fixture timestamp `0`, not an actual available model or launch date.
- <https://cookbook.openai.com/examples/how_to_stream_completions>. Retrieved 2026-10-02. First-party historical Chat Completions example supports data-only SSE, `choices[].delta`, role/content deltas and final `finish_reason`. Its timing output and model names are not reused as current performance evidence. Its usage example has a final empty `choices` array when `stream_options.include_usage` is enabled; the draft's fixture is a simpler text-only stream without usage reporting, tools or multimodal content.
- <https://github.com/openai/openai-python/blob/main/src/openai/_streaming.py>. Source retrieved through the equivalent raw GitHub URL on 2026-10-02. Supports blank-line event parsing and recognition of `[DONE]` in sync/async stream consumers. `main` is a moving source reference, not a verified release pin or tested installed SDK version.
- <https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse>. Retrieved 2026-10-02. Supports normal/async iterators in `StreamingResponse` and cancellation concerns for async generators lacking an `await`. No FastAPI release was installed or runtime validated; the article provides wire fixtures and reader-run checks rather than a supposedly runnable server.
- <https://fastapi.tiangolo.com/tutorial/security/first-steps/>. Retrieved 2026-10-02. Supports the distinction between bearer extraction and credential validation. The page uses `OAuth2PasswordBearer`, but the draft does not prescribe password flow or pretend that this validates an API key or JWT.

**Docs discovery:** older candidate Open WebUI paths without `/connect-a-provider/`, and the older `/features/plugin/tools/` path, returned 404. Current routes were discovered through <https://docs.openwebui.com/llms.txt>, generated 2026-10-01. The drafts cite working canonical HTML routes, not failed paths or the index. No tested Open WebUI or FastAPI release number is claimed.

**Wire scope:** simple text Chat Completions with one choice. No full tool-call implementation, model inference, multimodal compatibility, HTTP server, upstream model, end-to-end auth, browser integration, proxy-buffering experiment or latency measurement was executed. Network-path, proxy comparison and user-identity advice are diagnostic recommendations, not observed deployment outcomes.

## KV/prefix caching: verified first-party sources

- <https://huggingface.co/docs/transformers/en/cache_explanation>. Retrieved 2026-10-02. Supports per-layer K/V retention and appending current K/V during causal decoding. The retrieved page's generated reference links point to Transformers **v5.17.0**. This identifies the documentation surface, not an installed runtime; no Transformers APIs or model weights were executed.
- <https://docs.vllm.ai/en/stable/features/automatic_prefix_caching/>. Retrieved 2026-10-02; displayed source date 2026-09-08. Supports cross-request reuse, `enable_prefix_caching=True` and the limitation that APC saves prefill work rather than decode work. Current page also contains specialized Hybrid Mamba behavior. The draft explicitly confines the full-block illustration to the reviewed block design and warns that specialized architectures differ.
- <https://docs.vllm.ai/en/stable/design/prefix_caching/>. Retrieved 2026-10-02; displayed source date 2026-06-23. Supports parent hash, exact token IDs, LoRA/multimodal/salt identity inputs, full blocks in the described design, eviction and optional request `cache_salt`. The page says SHA-256 is the default as of v0.11 and documents `--prefix-caching-hash-algo` alternatives. This is source text, not proof of the user's installed version or default. No CLI command or default-version recommendation is supplied. Four-token blocks and A/B token lists in the draft are explicit illustrations, not real tokenizer output.
- <https://platform.openai.com/docs/guides/prompt-caching>. Retrieved 2026-10-02. Supports provider-specific exact rendered-prefix matching, model-dependent boundaries, machine routing, organization/region separation, model-dependent lifetime, `prompt_cache_key`, usage accounting and unchanged output generation. The reviewed page distinguishes GPT-5.6-and-later `prompt_cache_options`/breakpoints from earlier `prompt_cache_retention` and interval-based behavior. It also documents different read/write rates and minimum-length behavior. The draft intentionally avoids hardcoding a universal 1,024-token threshold, 128-token increment, retention duration, discount or free cache writes.

**Separation:** vLLM `cache_salt` is not presented as an OpenAI-hosted request field or interchangeable with `prompt_cache_key`. Provider cache policy is not inferred from HTTP compatibility. Server-enforced tenant salt selection is an application security recommendation based on the documented isolation mechanism, not a claim that arbitrary client salts provide authorization. No inference, GPU profiling, cache-hit experiment, billing experiment, benchmark or measured speedup was performed.

## Existing article checks and editorial caveats

Internal destinations were checked against `data/blogSlugsFallback.json`:

- `/blog/microsoft-foundry-agent-service-cloud-runtime`
- `/blog/connecting-custom-ai-agents-to-openwebui-auth-latency-and-api-design`
- `/blog/llm-kv-cache-why-not-query`

The existing Foundry article was additionally read at <https://yadui.dev/blog/microsoft-foundry-agent-service-cloud-runtime> on 2026-10-02. Its April overview uses a workflow-agent taxonomy and older publishing sequence. Those details deserve a separately authorized, slug-preserving accuracy review against current Learn before publication of the companion; no existing article was changed here. The two other links were verified from the canonical fallback inventory, not re-crawled in this assignment. No draft links to any proposed unpublished slug.

No old first-person deployment anecdote, traffic forecast, invented benchmark, fabricated author experience or unsupported source statistic was added. Cover assets and slug-to-cover mappings are outside this agent's write ownership and remain with the main session.

## Local verification

After drafting, a dependency-free Python check verified:

- All bodies start with `##`, with no body H1.
- Excerpts are respectively 129, 139 and 146 characters, within the 155-character limit.
- Internal article links exist in the fallback inventory.
- Model-list JSON and each SSE JSON event parse successfully.
- Both reader-run shell examples pass `zsh -n` syntax checking; the requests themselves were not executed.
- All drafts have explicit not-approved status, proposed metadata, access dates and caveats.
- No decorative em/en dash, emoji, pipe table or proposed-slug internal link appears in the bodies.

Whitespace-delimited body counts, including code, are **1,041 Foundry**, **994 Open WebUI**, and **1,169 prefix caching**. Counts after removing fenced code and Markdown link destinations are **1,041**, **935**, and **1,145**, respectively. These are editorial word counts, not tokenization results.

No site lint/build or visual rendering result is claimed: this assignment changes only unpublished draft Markdown and this register. Before approval, review actual deployment/version choices, confirm the existing related articles' accuracy, remove editorial front matter from the published body, and use a separately authorized publication workflow.
