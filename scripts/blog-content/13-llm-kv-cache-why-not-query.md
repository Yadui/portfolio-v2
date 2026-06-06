# Why LLM Inference Caches K and V but Never Q

**Published:** May 29, 2026  
**Tags:** LLM, AI, Machine Learning, Inference, Transformers, Performance

---

KV cache is one of the most important optimizations in LLM inference. Most engineers understand the concept — "we reuse the Key and Value tensors from previous tokens to avoid recomputation." But most can't precisely answer the follow-up: *why do we cache Key and Value but not Query?*

This post works through the math to give a concrete, unambiguous answer — and connects it to practical implications for serving infrastructure.

## The Question

In Transformer self-attention, every token position generates three tensors: **Query (Q)**, **Key (K)**, and **Value (V)**. KV cache stores K and V from previous decode steps and reuses them. Q is discarded after each step.

Why?

## Attention Mechanics

Standard self-attention output:

```
O = softmax(QK^T / sqrt(d_k)) * V
```

Where `Q, K, V ∈ R^(s × d)` — sequence length × head dimension.

During **autoregressive decoding** (generating one token at a time), at step `m+1` the model only needs to compute the output for the *current* position. The attention score for that position is:

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

The Query here is only `q[m+1]` — the query for the *current* position. Past queries `Q[1:m]` appear nowhere. They are not used to compute this step's output.

## The Causal Mask Is Why Old Queries Are Never Needed

You might wonder: as K grows by one each step, shouldn't we also compute `Q[1:m] @ k[m+1]^T` — past positions attending to the new token?

No. Causal language models apply a causal mask:

```
M[i, j] = 0      if j ≤ i   (attend to past/present)
M[i, j] = -∞     if j > i   (cannot attend to future)
```

Position `i` cannot attend to any `j > i`. So `Q[1:m] @ k[m+1]^T` — past queries attending to a future key — is entirely masked to `-∞` and contributes zero after softmax.

Computing those scores would be wasted work. Caching the past queries to enable that computation later would be doubly wasteful.

> [!INFO]
> The causal mask is the structural reason Query caching is unnecessary. Past tokens cannot attend to future tokens by model design — so past queries are provably never needed in future decode steps.

## The Value Side

After computing attention probabilities, the output at step `m+1`:

```
o[m+1] = P[m+1, :] @ V[1:m+1]
       = sum_{j=1}^{m+1} P[m+1, j] * v[j]
```

This requires `V[1:m+1]` — all past value vectors `v[1], ..., v[m]` plus the current one. Every future step needs these past values again. Caching them avoids recomputing the entire context's value projections on every decode step.

## Why K and V, Not Q

| Tensor | Used in future steps? | Reason | Cache it? |
|---|---|---|---|
| Query `Q[1:m]` | No | Causal mask zeroes out past-query × new-key products | No |
| Key `K[1:m]` | Yes | `q[m+1] @ K[1:m]^T` references all past keys | Yes |
| Value `V[1:m]` | Yes | `P[m+1,:] @ V[1:m+1]` references all past values | Yes |

The intuition:
- **Keys** — "what topics are stored at each past position" — consulted by every future query
- **Values** — "what information to retrieve from each past position" — weighted and summed on every decode step
- **Queries** — "what is the current token looking for" — a one-shot probe, used once and discarded

## Memory Cost of KV Cache

This also explains why KV cache is expensive. For a model with:
- `L` transformer layers
- `n_kv` KV heads per layer
- `d` head dimension
- `s` context length
- batch size `b`

```
KV cache size = 2 × L × n_kv × d × s × b × sizeof(dtype)
```

For Llama-3 70B at FP16, with 8 KV heads, d=128, 32 layers, single sequence at 8k context:

```
2 × 32 × 8 × 128 × 8192 × 1 × 2 bytes ≈ 8.6 GB
```

That's per sequence, before model weights. At batch=32, it's ~275 GB of KV cache alone. This is why serving Llama 70B at scale is a memory management problem as much as a compute problem.

## MHA vs GQA vs MQA: Controlling Cache Size

The `n_kv` parameter varies by architecture and directly controls cache size:

| Attention type | `n_kv` vs `n_q` | KV cache size | Example models |
|---|---|---|---|
| MHA (Multi-Head Attention) | `n_kv = n_q` | Full | GPT-2, early GPT |
| GQA (Grouped Query Attention) | `1 < n_kv < n_q` | Reduced (e.g. 8× smaller) | Llama-3, Mistral |
| MQA (Multi-Query Attention) | `n_kv = 1` | Minimum | Falcon |

GQA is the mainstream choice today. Llama-3 70B uses 8 KV heads vs 64 query heads — an 8× reduction in KV cache memory with minimal perplexity impact. This is directly why modern large models are more feasible to serve than older architectures of similar parameter count.

## Practical Serving Implications

If you're tuning an LLM serving stack, the KV cache shapes every major decision:

**1. Context length × batch size is the binding constraint**

Model weights are static. KV cache grows linearly with context × batch. At long contexts, KV cache often exceeds model weight memory. Plan GPU allocation accordingly.

**2. Quantize KV cache before anything else**

INT8 KV cache typically costs <0.5% perplexity hit but halves cache memory pressure. Most frameworks (vLLM, TensorRT-LLM) support this. Enable it.

**3. Paged attention for dynamic batches**

vLLM's PagedAttention treats KV cache like virtual memory — allocates cache in fixed-size blocks and maps them non-contiguously. This eliminates fragmentation waste, which on naive implementations can consume 30–60% of KV cache memory.

**4. Prefix caching for repeated context**

If many requests share a common prefix (system prompt, RAG context for the same document), the KV state for that prefix can be cached and reused across requests. 

For a RAG pipeline serving queries about Azure VM SKUs, the system prompt and top retrieved chunks were often identical across hundreds of queries per minute. Prefix caching reduced first-token latency by ~40% at peak batch load — because the expensive prefill step for the shared prefix only ran once.

## Key Takeaways

- At decode step `m+1`, only `q[m+1]` is needed — not any past query
- The causal mask guarantees `Q[1:m] @ k[m+1]^T` is always zeroed — those computations are structurally unnecessary
- K and V from all previous steps are required to compute the current output, making them the only tensors worth caching
- KV cache memory scales with `L × n_kv × d × context_length × batch_size` — at scale, this dominates model weight memory
- GQA reduces `n_kv` relative to `n_q` — the standard trade-off for serving efficiency in modern architectures
- Prefix caching extends the value of KV cache to shared context across requests — high leverage for RAG workloads
