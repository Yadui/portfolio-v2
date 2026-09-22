---
status: "NOT APPROVED FOR PUBLICATION"
proposed_slug: "kv-cache-memory-sizing-gqa-optimization"
proposed_title: "KV cache memory sizing: GQA math and optimization"
proposed_excerpt: "Calculate KV cache bytes from model configuration, work through a Qwen example, and compare context limits, quantization and offloading."
proposed_tags: [LLM, KV Cache, Inference, GQA, Memory, Transformers]
source_review_date: "2026-09-22"
verified_sources:
  - "https://huggingface.co/docs/transformers/en/cache_explanation"
  - "https://huggingface.co/docs/transformers/en/kv_cache"
  - "https://huggingface.co/docs/transformers/en/model_doc/qwen2"
  - "https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/raw/main/config.json"
review_notes:
  - "Arithmetic checked independently with Node.js; no model execution, GPU profiling, latency test, or quality benchmark was performed."
  - "BF16 cache and unsharded full-attention storage are explicit calculation assumptions, not measured runtime settings."
  - "Pin model revision, Transformers version, cache backend and hardware before reproducing or adding executable configuration."
  - "Internal slug verified from data/blogSlugsFallback.json; existing overview and older draft have an arithmetic discrepancy flagged in the editorial plan."
---

# KV cache memory sizing: GQA math and optimization

For a decoder-only transformer with uniform full-attention layers, estimate the raw KV cache as `2 × L × B × T × H_kv × D × S` bytes. Use the number of key/value heads, not query heads. Count retained prompt and generated tokens, then add model weights, runtime allocations, and implementation overhead before deciding whether a workload fits.

This is a capacity-planning calculation, not a GPU benchmark. If you need the underlying explanation, start with [why inference caches keys and values rather than queries](/blog/llm-kv-cache-why-not-query). Here the goal is to build a reproducible memory budget and choose an optimization based on the constraint.

## Read the configuration before calculating

[Hugging Face's cache explanation](https://huggingface.co/docs/transformers/en/cache_explanation) describes separate key and value tensors per layer, with batch, head, sequence, and head-dimension axes. Multiplying those dimensions gives the uncompressed tensor payload.

Define the variables explicitly:

- `L`: number of layers storing this kind of KV cache.
- `B`: number of independent cached sequences, assuming equal retained length.
- `T`: retained tokens per sequence, including prompt and processed generated tokens.
- `H_kv`: key/value heads per layer, often `num_key_value_heads`.
- `H_q`: query heads, often `num_attention_heads`.
- `D`: elements per head. Read an explicit head dimension when available; for the Qwen checkpoint below, it is `hidden_size / H_q`.
- `S`: bytes per cached scalar. BF16 and FP16 use two bytes.

The leading `2` accounts for keys and values. The formula assumes equal key/value dimensions and dtype, no prefix sharing, and no sharding. It excludes allocator overhead, padding, quantization metadata, and temporary tensors.

For unequal lengths in an efficiently packed cache, replace `B × T` with the sum of retained sequence lengths. A padded batch or preallocated static cache may reserve more than that logical payload.

## Use GQA head counts correctly

Grouped-query attention shares key/value heads across groups of query heads. Hugging Face's [Qwen2 configuration reference](https://huggingface.co/docs/transformers/en/model_doc/qwen2) distinguishes multi-head attention (`H_kv = H_q`), multi-query attention (`H_kv = 1`), and grouped-query attention between those cases.

For a model with 28 query heads and four KV heads, there are `28 / 4 = 7` query heads per KV group. Its cache payload is one-seventh of an otherwise equivalent 28-KV-head design. This comparison holds the other dimensions fixed; it is not a quality or throughput claim.

Do not divide hidden size by `H_kv` to derive head dimension. That mistakenly undoes the memory benefit of sharing.

## Work through Qwen2.5-7B-Instruct

The published [checkpoint configuration](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/raw/main/config.json) specifies 28 layers, hidden size 3,584, 28 query heads, and four KV heads. It sets `use_sliding_window` to `false`; the presence of a `sliding_window` field alone does not make the cache windowed.

Assume one sequence with 8,192 retained tokens and a BF16 cache:

```text
D = 3,584 / 28 = 128 elements per head
Bytes per token = 2 × 28 × 4 × 128 × 2
                = 57,344 bytes = 56 KiB

Cache bytes = 57,344 × 8,192
            = 469,762,048 bytes
            = 448 MiB
            = 0.4375 GiB
```

These are binary units: one MiB is `2^20` bytes and one GiB is `2^30` bytes. The same payload is approximately 0.470 decimal GB.

Four independent sequences at that length require `4 × 0.4375 = 1.75 GiB` of raw cache. One sequence at 32,768 tokens also requires `4 × 0.4375 = 1.75 GiB`. These equalities follow from token count, not measured GPU allocation.

If a prompt contains 6,144 tokens and you reserve room for 2,048 generated tokens, the 8,192-token calculation is a useful planning budget. It does not mean every request allocates that amount immediately.

## Turn payload into a serving budget

Subtract model weights and measured runtime overhead from available device memory before assigning a KV budget. Include attention workspaces, compilation-related allocations, temporary activations, and other processes. Keep an explicit margin informed by profiling rather than assuming the entire remaining capacity is usable.

Do not divide total cache bytes by GPU count without checking the serving engine's layout. Tensor parallelism may shard or replicate cache components depending on the model and configuration. Admission limits must reflect the most constrained device.

## Optimize the constraint you actually have

**Bound retained tokens first.** Set intentional input, output, and concurrency limits. Shortening retrieved context helps only if task quality remains acceptable. The formula makes the memory trade-off visible before tuning kernels.

**Choose dynamic or static allocation deliberately.** Hugging Face's [cache strategies guide](https://huggingface.co/docs/transformers/en/kv_cache) explains that dynamic caches grow with generation. Static caches preallocate capacity and support compilation-oriented execution, trading memory for stable shapes. Estimate their reserved maximum, not just current tokens.

**Evaluate cache quantization separately from weight quantization.** Lower-precision model weights do not automatically imply a lower-precision cache. Quantized cache implementations also need metadata and may retain a higher-precision residual region. Do not turn “four-bit” into an exact fourfold end-to-end saving. Measure quality and latency; Hugging Face notes quantization can hurt latency for short contexts.

**Consider offloading when GPU capacity is the bottleneck.** Moving cache layers to CPU memory reduces GPU pressure but introduces transfers. Verify host-memory capacity and throughput under realistic concurrency before adopting it.

**Respect architecture-specific limits.** Sliding-window or chunked layers may stop growing at their attention limit. Sum layer-specific sizes for mixed architectures; do not impose arbitrary eviction on a full-attention model and assume equivalent outputs.

Finish with a recorded model revision, cache dtype, retained-token distribution, concurrency, peak allocation, and task-quality check. Keep calculated tensor payload separate from observed memory and performance so the budget remains auditable.
