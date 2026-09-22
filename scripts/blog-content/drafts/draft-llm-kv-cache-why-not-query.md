# Why LLM Inference Caches K and V but Never Q

**Tags:** LLM, AI, Machine Learning, Inference, Transformers  
**Date:** 2026-05-29  
**Editorial status:** Retained overlapping draft of the existing article, not a separate publication candidate. Technical corrections checked against the official sources below.

---

In standard causal autoregressive decoding, each new position uses its own query to read earlier keys and values. Past queries do not contribute to that position's output, so they need not be retained across decode steps.

“Never Q” refers to this persistent decode cache, not every architecture or temporary kernel buffer. Prefill computes queries for multiple prompt tokens. Assume fixed parameters and an unchanged prefix and positional configuration.

This derivation follows [Hugging Face's cache explanation](https://huggingface.co/docs/transformers/en/cache_explanation), not a measured deployment.

## The Question

At each layer, Transformer self-attention produces **Query (Q)**, **Key (K)**, and **Value (V)** projections. The KV cache retains past K/V. Old Q is unnecessary as persistent state for subsequent decode steps.

Why is Q not worth caching?

## Attention Mechanics

For one attention head with equal K/V dimensions, sequence length `s`, and additive causal mask `M`:

```
O = softmax(QK^T / sqrt(d) + M) @ V
```

Where:
- `Q, K, V ∈ R^(s × d)`: sequence length × head dimension
- `O ∈ R^(s × d)`: per-head output, with batch/head axes omitted

During one-token-at-a-time decoding, the output at position `m+1` predicts the following token. Its unscaled dot-product scores are:

```
S[m+1, :] = q[m+1] @ K[1:m+1]^T
```

Expanded:

```
S[m+1, :] = [
  q[m+1] · k[1],
  q[m+1] · k[2],
  ...
  q[m+1] · k[m],
  q[m+1] · k[m+1]
]
```

Only the current query `q[m+1]` appears here, not `Q[1:m]`. Scale the scores by `1/sqrt(d)` before softmax. Every key in this row is causally allowed.

## Why old queries are not reused

If `K` grows by one each step, should we compute `Q[1:m] @ k[m+1]^T`, representing past positions attending to the new token?

No. Causal language models apply a causal mask `M`:

```
M[i,j] = 0      if j ≤ i  (can attend to past/present)
M[i,j] = -∞     if j > i  (cannot attend to future)
```

Position `i` cannot attend to `j > i`. Adding the mask makes those logits `-∞`, yielding zero probability after softmax. The dot products are not themselves zero, nor are scores simply multiplied by zero inside softmax.

> [!INFO]
> Appending to an unchanged causal prefix does not update earlier representations. Their K/V remain reusable at each layer, but their old queries are not needed for the new output.

## The Value Side

After computing attention probabilities, the output at position `m+1` is:

```
o[m+1] = P[m+1, :] @ V[1:m+1]
       = sum_{j=1}^{m+1} P[m+1, j] * v[j]
```

Full attention reads the retained past values and the current one. Sliding-window attention only reads its allowed window. Retaining all past values is therefore not a universal requirement across architectures.

## Summary: Why K and V but Not Q

| Tensor | Used in future steps? | Worth caching? |
|---|---|---|
| Query `Q[1:m]` | No; new output uses the current query | No |
| Key `K[1:m]` | Yes; full attention reads retained keys | Yes |
| Value `V[1:m]` | Yes; full attention reads retained values | Yes |

- **Keys** are compared with the current query to form attention weights.
- **Values** are combined using those weights.
- **Queries** select information for their own positions rather than supplying reusable history to later positions.

## Memory Cost of KV Cache

For uniform decoder-only full attention, equal K/V dimensions, and an unquantized cache, use:
- `L` transformer layers
- `n_kv` KV heads per layer
- `d` head dimension
- `s` retained tokens per sequence, including processed prompt and generated tokens
- `b` equal-length independent sequences without prefix sharing

The raw logical KV payload in bytes is:

```
2 × L × n_kv × d × s × b × sizeof(dtype)
```

Use an **explicitly hypothetical model**, not a Llama checkpoint: 32 layers, 8 KV heads per layer, head dimension 128, and 8,192 retained tokens. Assume FP16 cache elements occupy 2 bytes each.

```
2 × 32 × 8 × 128 × 8192 × 1 × 2 bytes
= 1,073,741,824 bytes
= 1 GiB per sequence

32 independent sequences × 1 GiB = 32 GiB
```

`1 GiB = 2^30 bytes`. These are calculated binary units, not measured GPU usage. Weights, activations, workspaces, allocation overhead, and reserved capacity are additional costs.

For unequal sequence lengths, sum their lengths. Windowed layers, prefix sharing, sharding, and compressed caches require different accounting; this formula is not a universal model-memory estimator.

## MHA vs GQA vs MQA

The KV head count `n_kv` varies by architecture, and it directly controls cache size:

| Attention type | Relation | Cache implication, other dimensions equal |
|---|---|---|
| MHA (Multi-Head Attention) | `n_kv = n_q` | One KV head per query head |
| GQA (Grouped Query Attention) | `1 < n_kv < n_q` | Query groups share KV heads |
| MQA (Multi-Query Attention) | `n_kv = 1` | All query heads share one KV head |

See [HF's Qwen2 configuration reference](https://huggingface.co/docs/transformers/en/model_doc/qwen2) for these conventions. Head sharing is an architectural choice, not an interchangeable runtime setting.

Holding other dimensions fixed, 8 rather than 64 KV heads gives an 8-fold reduction in raw payload. This is arithmetic, not evidence about checkpoint dimensions, model quality, or serving speed.

## Practical Implications for Serving

**Budget cache and runtime memory separately.** Static caches can reserve unused capacity; windowed layers stop growing at their window limit. KV memory does not always dominate weights.

**Evaluate quantization instead of enabling it by default.** [HF's cache strategies](https://huggingface.co/docs/transformers/en/kv_cache) warn that quantization can hurt latency for short contexts when memory is sufficient.

Check backend support, residual full-precision storage, metadata, quality, and latency. Offloading introduces transfers in exchange for lower device-memory use. No universal quality-loss or speedup percentage is justified here.

**Use paging as an allocation technique.** [vLLM's PagedAttention document](https://docs.vllm.ai/en/latest/design/paged_attention/) explains block-based, non-contiguous KV access; it does not establish zero allocation waste.

The page explicitly describes historical design rather than current kernel code. Paging does not change the raw scalar payload per token. Verify your actual backend before making implementation or savings claims.

**Reuse compatible prefixes.** [vLLM automatic prefix caching](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/) skips repeated prefill work for matching prefixes. It does not directly accelerate new-token decoding.

The [prefix-cache design](https://docs.vllm.ai/en/stable/design/prefix_caching/) uses block tokens, preceding context, and additional identity inputs such as adapters. Similar prompts alone do not ensure reuse; compatible entries must remain available.

## Key Takeaways

- Standard causal decoding reuses past K/V, not past Q.
- Causal masking sets future-position probabilities to zero after softmax, not the original dot products.
- The hypothetical FP16 example needs **1 GiB per sequence**, or **32 GiB for 32 independent equal-length sequences**.
- Architecture and allocation determine how logical payload relates to device memory.
- Quantization, paging, and prefix reuse solve different problems and need workload-specific evaluation.

**Next action:** inspect the checkpoint and runtime cache configuration, calculate its logical payload, then measure allocated memory, prefix hit rate, time to first token, and decode latency. This draft contains no verified deployment benchmark.
