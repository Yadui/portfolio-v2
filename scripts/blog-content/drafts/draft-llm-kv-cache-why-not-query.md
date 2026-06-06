# Why LLM Inference Caches K and V but Never Q

**Tags:** LLM, AI, Machine Learning, Inference, Transformers  
**Date:** 2026-05-29  
**Source inspiration:** Zenn trending (48 likes)

---

KV cache is one of the most important optimizations in LLM inference. Most engineers understand the concept — "we reuse the Key and Value tensors from previous tokens to avoid recomputation." But most can't precisely answer the follow-up: *why do we cache Key and Value but not Query?*

This post works through the math to give a concrete, unambiguous answer.

## The Question

In Transformer self-attention, every token position generates three tensors: **Query (Q)**, **Key (K)**, and **Value (V)**. KV cache stores K and V from previous decode steps and reuses them. Q is discarded after each step.

Why is Q not worth caching?

## Attention Mechanics

Attention output for a sequence of length `s`:

```
O = softmax(QK^T / sqrt(d_k)) * V
```

Where:
- `Q, K, V ∈ R^(s × d)` — sequence dimension × head dimension
- `O ∈ R^(s × d)` — same shape as input

During **autoregressive decoding** (generating one token at a time), at step `m+1` the model needs to compute the output for position `m+1` only. The attention score for that position is:

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

**Observation**: the Query used here is only `q[m+1]` — the query for the *current* position. Past queries `Q[1:m]` appear nowhere in this computation.

## The Causal Mask Is Why Old Queries Are Never Needed

You might wonder: if `K` grows by one each step, shouldn't we also compute `Q[1:m] @ k[m+1]^T` — i.e., how much do past positions attend to the new token?

No. Causal language models apply a causal mask `M`:

```
M[i,j] = 0      if j ≤ i  (can attend to past/present)
M[i,j] = -∞     if j > i  (cannot attend to future)
```

Position `i` cannot attend to position `j > i`. So `Q[1:m] @ k[m+1]^T` — past queries attending to a future key — is entirely masked out. Those scores are multiplied by zero in softmax. Computing them is wasted work, and caching the past queries to compute them later would be pointless.

> [!INFO]
> The causal mask is the structural reason Query caching is unnecessary. Past tokens cannot attend to future tokens by definition — so past queries are provably never needed in future decode steps.

## The Value Side

After computing attention probabilities, the output at position `m+1` is:

```
o[m+1] = P[m+1, :] @ V[1:m+1]
       = sum_{j=1}^{m+1} P[m+1, j] * v[j]
```

This requires `V[1:m+1]` — including all past value vectors `v[1], ..., v[m]`. So Value tensors from previous steps are needed in every future step, making them worth caching.

## Summary: Why K and V but Not Q

| Tensor | Used in future steps? | Worth caching? |
|---|---|---|
| Query `Q[1:m]` | No — causal mask zeroes out past-query × new-key products | No |
| Key `K[1:m]` | Yes — `q[m+1] @ K[1:m]^T` references all past keys | Yes |
| Value `V[1:m]` | Yes — `P[m+1,:] @ V[1:m+1]` references all past values | Yes |

- **Keys** determine which past tokens the current query attends to — `q[m+1] @ K[1:m+1]^T`
- **Values** carry the information retrieved by the attention weights — `P[m+1,:] @ V[1:m+1]`
- **Queries** are one-shot probes — used once to compute their step's attention score, then discarded

## Memory Cost of KV Cache

Understanding this also clarifies why KV cache is expensive. For a model with:
- `L` transformer layers
- `n_kv` KV heads per layer
- `d` head dimension
- `s` sequence length (context)
- batch size `b`

The KV cache size is:

```
2 × L × n_kv × d × s × b × sizeof(dtype)
```

For Llama-3 70B (FP16, 8 KV heads per layer, d=128, 32 layers):

```
2 × 32 × 8 × 128 × 8192 × 1 × 2 bytes ≈ 8.6 GB for a single sequence at 8k context
```

This is why KV cache management — quantization (INT8/INT4 KV), sliding window attention, paged attention (vLLM) — is one of the most active areas in LLM serving infrastructure.

## MHA vs GQA vs MQA

The KV head count `n_kv` varies by architecture, and it directly controls cache size:

| Attention type | Relation | Example |
|---|---|---|
| MHA (Multi-Head Attention) | `n_kv = n_q` (full parity) | GPT-2, early models |
| GQA (Grouped Query Attention) | `1 < n_kv < n_q` | Llama-3, Mistral |
| MQA (Multi-Query Attention) | `n_kv = 1` (single KV head) | Falcon |

GQA is the current mainstream choice — it reduces KV cache size significantly (e.g., 8 KV heads vs 64 query heads → 8× smaller KV cache) with minimal quality impact, verified across many model families.

## Practical Implications for Serving

If you're optimizing an LLM serving stack:

1. **Context length × batch size is your KV cache budget constraint** — not just model weights
2. **Quantize KV cache first** — INT8 KV cache typically costs <0.5% perplexity hit but halves memory pressure
3. **Paged attention** (vLLM, TensorRT-LLM) solves KV cache fragmentation for dynamic batches
4. **Prefix caching** extends KV cache to reuse prefixes across requests — effective for system prompt + RAG context patterns where many requests share a common prefix

The RAG pipeline we built for VirtuAI benefited directly from prefix caching: the system prompt and retrieved context chunks were often identical across thousands of queries about the same Azure VM SKU. Caching that KV state cut first-token latency by ~40% at peak load.

## Key Takeaways

- At decode step `m+1`, only `q[m+1]` is needed — not any past query
- The causal mask guarantees that `Q[1:m] @ k[m+1]^T` is always zeroed out — those computations are structurally unnecessary
- K and V from all previous steps are needed to compute the current output, making them the only tensors worth caching
- KV cache memory scales with `L × n_kv × d × context_length × batch_size` — not just model size
- GQA (fewer KV heads than query heads) is the standard approach for reducing KV cache cost without significant quality loss
