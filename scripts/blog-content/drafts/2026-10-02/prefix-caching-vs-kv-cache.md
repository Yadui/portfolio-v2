---
status: "NOT APPROVED FOR PUBLICATION"
proposed_slug: "prefix-caching-vs-kv-cache"
proposed_title: "Prefix caching vs KV cache: what actually gets reused"
proposed_excerpt: "Separate decode-time KV reuse from cross-request prefix caching, diagnose cache misses, and keep vLLM controls distinct from hosted provider APIs."
proposed_tags: [LLM, KV Cache, Prefix Caching, vLLM, Inference]
proposed_cover: "/blog-covers/ai-editorial-2026-10-02/prefix-reuse.webp"
proposed_cover_alt: "Three repeated crops of supercomputer hardware beside the words Same prefix. Less prefill., an editorial metaphor for prefix reuse."
source_review_date: "2026-10-02"
distinct_intent: "Cross-request reuse, cache misses and tenant isolation, not the existing K/V derivation or memory-sizing draft."
verified_sources:
  - url: "https://huggingface.co/docs/transformers/en/cache_explanation"
    accessed: "2026-10-02"
  - url: "https://docs.vllm.ai/en/stable/features/automatic_prefix_caching/"
    accessed: "2026-10-02"
  - url: "https://docs.vllm.ai/en/stable/design/prefix_caching/"
    accessed: "2026-10-02"
  - url: "https://platform.openai.com/docs/guides/prompt-caching"
    accessed: "2026-10-02"
review_notes:
  - "No model inference, GPU profiling, cache-hit experiment, billing test or measured speedup."
  - "A/B token sequences and four-token blocks are illustrative, not a tokenizer output or serving configuration."
  - "vLLM stable and provider docs are moving references; record the installed runtime and model before reproducing."
  - "OpenAI model-dependent breakpoint, pricing and retention rules are not generalized to other providers."
---

## Two reuse boundaries, one kind of state

A KV cache retains attention keys and values so a model can reuse processed context while generating more tokens. Prefix caching lets a later compatible request reuse KV state for an unchanged beginning of its input. They are not competing cache formats. Prefix caching extends the reuse boundary across requests instead of limiting it to the active generation.

This distinction assumes causal autoregressive inference with compatible model and positional configuration. The [existing K/V explanation](/blog/llm-kv-cache-why-not-query) covers why earlier queries do not need to persist for the next decode step. Here the question is operational: when can another request reuse already computed state, and why might it fail?

## Within a request: avoid recomputing history

During prefill, the model processes prompt tokens and constructs per-layer KV state. During decoding, each new position uses that state together with its new keys and values. The [Hugging Face cache explanation](https://huggingface.co/docs/transformers/en/cache_explanation) describes appending new K/V rather than recomputing the same historical projections each step.

That does not mean decoding becomes free. The model still computes the new position and reads the attention context its architecture permits. Retained history also consumes memory. Windowed and other specialized architectures have different state limits, so this article is not a universal memory formula.

A generation can use a KV cache even if the serving system has no cross-request prefix sharing enabled. Seeing a `past_key_values` object in a model loop proves within-generation reuse, not a shared serving cache.

## Across requests: skip repeated prefill

[vLLM's automatic prefix caching](https://docs.vllm.ai/en/stable/features/automatic_prefix_caching/) reuses KV for a matching prefix from an existing request. The new request skips computing that reusable portion and processes the unmatched suffix normally.

For illustration, imagine these are already token IDs, not words sent through a real tokenizer:

```text
Request A: [10, 11, 12, 13, 20, 21]
Request B: [10, 11, 12, 13, 30, 31]
Shared beginning: [10, 11, 12, 13]
```

If compatible cached state remains available, B can reuse the shared beginning. If B instead starts with a new token followed by A's document, the matching document is not the same prefix. Attention state depends on preceding context, not just a text fragment's identity.

This is not an answer cache. B still generates a new answer. The [OpenAI prompt-caching guide](https://platform.openai.com/docs/guides/prompt-caching) likewise says cached prompts do not change output generation or guarantee identical outputs for identical requests. Reusing intermediate state and returning a previously saved response are different operations.

## Exact prefixes are stricter than similar prompts

In [vLLM's design](https://docs.vllm.ai/en/stable/design/prefix_caching/), a cache-block hash includes its token IDs, parent hash and extra identity inputs such as LoRA IDs, multimodal hashes and cache salts. Matching the current block's words is insufficient if its preceding context differs.

Inspect the final rendered input, not only the template in your application. Different chat templates, reordered tools or changing system instructions can alter the early tokens. A document with the same meaning but revised wording is not an exact token prefix. Even whitespace changes can affect tokenization; compare token IDs before attributing a miss to the serving engine.

The reviewed vLLM design caches full blocks. Its illustrative four-token-block example shows why a ten-token shared prefix can yield only eight cached tokens: the next block is only partly shared. Four is an example size, not a recommended production setting. Specialized model support can differ, so check the implementation for your served architecture.

## Arrange stable context without changing its meaning

Put genuinely stable instructions and shared reference material before changing request content where the message hierarchy allows it. Keep tool definitions and their ordering consistent when the provider's contract permits. Preserve earlier messages and append follow-up turns rather than unnecessarily rewriting the entire history.

Avoid an always-changing timestamp at the beginning of every prompt. If current time is needed, place it in a later appropriate message without weakening instruction precedence. Do not move privileged instructions into user content just to seek a cache hit.

Retrieval introduces another constraint. If the documents or their order change on every query, that portion of the prompt may not be reusable. Cache reusable instructions where possible, but do not freeze retrieval results solely for speed. Correct context matters more than the cache-hit percentage.

## A matching prefix can still miss

Compatibility and availability are separate tests. A matching entry may have been evicted, expired or placed on another serving worker. A different model, adapter or cache isolation group can legitimately select different state.

vLLM's reviewed design describes block eviction within the KV block pool. It does not promise a universal retention duration. Hosted providers define their own lifetime and routing rules. OpenAI's guide states that matching cache entries must be on the machine handling the request and cannot be shared across organizations or regional processing boundaries.

For a miss, check in order: model and rendering configuration, exact leading tokens, supported matching boundaries, identity inputs, and entry availability. Preserve a redacted diagnostic record rather than logging confidential prompts to chase a hit.

## Do not translate provider controls into vLLM flags

The vLLM feature guide documents `enable_prefix_caching=True` for the engine. Its design documents `cache_salt` for request isolation. These are vLLM controls, not universal OpenAI API features merely because a server exposes an OpenAI-compatible endpoint.

OpenAI has its own model-dependent prompt-caching contract. The reviewed guide distinguishes newer explicit and implicit breakpoint behavior from earlier interval-based behavior. It also documents different retention settings and cache-write pricing across model generations. An old rule about one minimum length, one retention field or free cache writes should not be applied to every current model.

Use the provider's usage fields to verify actual reuse and its pricing documentation to calculate cost. A stable `prompt_cache_key` does not make nonmatching content reusable. Nor should it be described as interchangeable with vLLM's `cache_salt`.

## Treat shared caches as a security boundary

vLLM documents optional per-request salting: only requests with the same `cache_salt` can reuse those blocks. The motivation includes preventing timing-based probing of cached content across trust groups. A salt is not encryption, authentication or permission to read a document.

For a multi-tenant service, derive and enforce the intended isolation group in trusted server logic. Allowing arbitrary clients to select another tenant's salt would undermine that policy. Review the hash algorithm as well: the design notes cryptographic hashing and warns that noncryptographic alternatives change collision risk. Neither isolation nor hashing replaces access controls on prompts, logs and tools.

## Measure prefill and decode separately

vLLM explicitly says automatic prefix caching reduces prefill work, not the work of generating new tokens. A workload dominated by long output can show little end-to-end improvement even with reusable input. Short or mostly unique prompts may offer little reusable work.

Compare cold and repeated requests with recorded model, token lengths, concurrency and routing. Track cached input, time to first token, generation time and total cost separately. A faster first response is not proof of a hit without cache evidence. This article reports no benchmark: optimize a verified reuse boundary, then measure whether that boundary matters to your workload.
