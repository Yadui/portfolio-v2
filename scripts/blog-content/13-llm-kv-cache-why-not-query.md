# Why LLM Inference Caches K and V but Never Q

**Published:** May 29, 2026  
**Tags:** LLM, AI, Machine Learning, Inference, Transformers, Performance

---

In standard causal autoregressive decoding, the current query reads past keys and values. Past queries are not inputs to the new position's attention output, so retaining them across decode steps provides no reuse for this computation.

That is the scope of “never Q” in the title. It is not a claim about every architecture or temporary kernel buffer. Prefill computes queries for many prompt positions; this article concerns persistent state reused during decoding.

The explanation follows [Hugging Face's cache documentation](https://huggingface.co/docs/transformers/en/cache_explanation). It assumes fixed model parameters and an unchanged token prefix and positional configuration.

## The Question

In Transformer self-attention, each position generates **Query (Q)**, **Key (K)**, and **Value (V)** projections at each layer. A KV cache retains the past keys and values. Past queries need not persist between decode steps.

Why?

## Attention Mechanics

For one attention head, with equal key and value dimensions and an additive causal mask `M`:

```
O = softmax(QK^T / sqrt(d) + M) @ V
```

Here `Q, K, V ∈ R^(s × d)`: sequence length × head dimension. Batch and head axes are omitted. With grouped-query attention, several query heads read the same KV head; the stored KV head count can differ from the query head count.

During one-token-at-a-time **autoregressive decoding**, the model computes the output for the current position `m+1` to predict the following token. Its unscaled dot-product scores are:

```
S[m+1, :] = q[m+1] @ K[1:m+1]^T
```

Expanded across the context:

```
S[m+1, :] = [
  q[m+1] · k[1],
  q[m+1] · k[2],
  ...
  q[m+1] · k[m],
  q[m+1] · k[m+1]   ← new key for current token
]
```

The query here is only `q[m+1]`, for the current position. Past queries `Q[1:m]` appear nowhere. Scale these scores by `1/sqrt(d)` before softmax; all positions shown are causally allowed for this row.

## Why old queries are not reused

As K grows by one each step, should we also compute `Q[1:m] @ k[m+1]^T`, representing past positions attending to the new token?

No. Causal language models apply a causal mask:

```
M[i, j] = 0      if j ≤ i   (attend to past/present)
M[i, j] = -∞     if j > i   (cannot attend to future)
```

Position `i` cannot attend to any `j > i`. Adding the mask makes those future-position logits `-∞`, giving them zero probability after softmax. The dot products themselves are not necessarily zero.

Computing those scores would be wasted work. Caching the past queries to enable that computation later would be doubly wasteful.

> [!INFO]
> With an unchanged causal prefix, appending a token does not change earlier positions' representations. Their per-layer K/V remain reusable; their old Q is not needed to compute the new position's output.

## The Value Side

After computing attention probabilities, the output at step `m+1`:

```
o[m+1] = P[m+1, :] @ V[1:m+1]
       = sum_{j=1}^{m+1} P[m+1, j] * v[j]
```

For full attention, this reads all retained values plus the current one. Caching them avoids recomputing the prefix's value projections. Sliding-window attention only reads the permitted window, so not every model retains all past values.

## Why K and V, Not Q

| Tensor | Used in future steps? | Reason | Cache it? |
|---|---|---|---|
| Query `Q[1:m]` | No | The new output uses the current query, not past queries | No |
| Key `K[1:m]` | Yes | `q[m+1] @ K[1:m]^T` references all past keys | Yes |
| Value `V[1:m]` | Yes | `P[m+1,:] @ V[1:m+1]` references all past values | Yes |

For the full-attention case above:
- **Keys** are compared with the current query to calculate attention weights.
- **Values** provide the vectors combined using those weights.
- **Queries** select information for their own position rather than supplying reusable history to later positions.

## Memory Cost of KV Cache

For uniform decoder-only full attention, equal K/V dimensions, and an unquantized cache, the raw logical payload depends on:
- `L` transformer layers
- `n_kv` KV heads per layer
- `d` head dimension
- `s` retained tokens per sequence, including processed prompt and generated tokens
- `b` equal-length independent sequences without prefix sharing

```
KV cache size = 2 × L × n_kv × d × s × b × sizeof(dtype)
```

Consider an **explicitly hypothetical model**, not a Llama checkpoint: 32 layers, 8 KV heads per layer, head dimension 128, and 8,192 retained tokens. Assume FP16 cache elements occupy 2 bytes each.

```
2 × 32 × 8 × 128 × 8192 × 1 × 2 bytes
= 1,073,741,824 bytes
= 1 GiB per sequence

32 independent sequences × 1 GiB = 32 GiB
```

These are binary units: `1 GiB = 2^30 bytes`, not one decimal GB. The calculation is derived from the tensor dimensions, not measured GPU usage or a benchmark of a named model.

Weights, activations, runtime workspaces, allocation overhead, and reserved capacity are additional costs. For unequal lengths, sum the sequence lengths. Sharding, prefix sharing, and windowed or compressed caches need separate accounting.

## MHA vs GQA vs MQA: Controlling Cache Size

The `n_kv` parameter varies by architecture and directly controls cache size:

| Attention type | Relation | Cache implication, other dimensions equal |
|---|---|---|
| MHA (Multi-Head Attention) | `n_kv = n_q` | One KV head per query head |
| GQA (Grouped Query Attention) | `1 < n_kv < n_q` | Query groups share KV heads |
| MQA (Multi-Query Attention) | `n_kv = 1` | All query heads share one KV head |

These head-count conventions are documented in [HF's Qwen2 configuration reference](https://huggingface.co/docs/transformers/en/model_doc/qwen2). They describe architectural choices, not interchangeable serving flags.

Holding other dimensions fixed, reducing KV heads from 64 to 8 reduces this raw payload by a factor of 8. That arithmetic says nothing about quality or latency, and is not a verified description of a particular checkpoint.

## Practical Serving Implications

### Budget retained tokens and runtime allocation

The formula grows linearly with retained tokens for full attention. Actual allocation depends on the backend: a static cache can reserve unused capacity, while windowed layers can stop growing. KV memory does not universally dominate weights.

### Measure before choosing quantization

[HF's cache strategies guide](https://huggingface.co/docs/transformers/en/kv_cache) describes quantization and offloading as trade-offs. Quantization can hurt latency at short contexts when GPU memory is sufficient.

Check backend support, residual full-precision storage, metadata, task quality, and end-to-end latency. Offloading trades device memory for transfers. Neither option warrants an unconditional “enable it first” recommendation.

### Distinguish paging from compression

[vLLM's PagedAttention design](https://docs.vllm.ai/en/latest/design/paged_attention/) explains block-based KV storage and non-contiguous access. Paging manages allocation; it does not reduce the scalar count of a token's K/V.

That page labels itself a historical design document, not a description of today's kernel code. Use it for the concept, not a guarantee that fragmentation disappears or a measured savings percentage for a current release.

### Reuse exact compatible prefixes

[vLLM automatic prefix caching](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/) reuses KV for matching prefixes to skip repeated prefill work. It does not directly reduce the work of decoding new tokens.

The [prefix-cache design](https://docs.vllm.ai/en/stable/design/prefix_caching/) keys blocks by tokens and preceding context, with additional identity inputs such as adapters. Similar text or the same document at a different prompt position is not enough.

Benefits depend on compatible cache entries being retained and reused. Measure hit rate, time to first token, and decode latency separately on your workload; no deployment speedup is claimed here.

## Key Takeaways

- Standard causal decoding reuses past K/V, not past Q, to compute each new position's output.
- The causal mask makes future-position attention probabilities zero; it does not make the underlying dot products zero.
- The hypothetical FP16 example is **1 GiB per sequence**, or **32 GiB for 32 independent equal-length sequences**.
- Architecture, precision, allocation, and cache sharing determine how the raw payload relates to device memory.
- Prefix caching saves repeated prefill work for compatible prefixes; it is not a universal latency guarantee.

**Next action:** inspect your checkpoint's layer count, KV heads, head dimensions, attention pattern, and runtime cache dtype. Calculate the logical payload, then measure allocation and latency with representative request lengths and concurrency.
