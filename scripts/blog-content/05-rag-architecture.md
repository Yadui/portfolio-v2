## What RAG Actually Solves

Large Language Models hallucinate. They also have a knowledge cutoff. And they can't know about your internal documentation, your product catalogue, or your VM specification database.

Retrieval-Augmented Generation solves all three: instead of asking the model to recall facts from training data, you retrieve the relevant facts at query time and put them directly in the prompt context.

This post documents the end-to-end RAG pipeline I built for VirtuAI — a platform that answers questions about Azure VM configurations, pricing, and workload fit using a proprietary specification database.

## The Architecture

```
User Query
  │
  ▼
Query Embedding (Azure OpenAI text-embedding-3-large)
  │
  ▼
Vector Search (Azure AI Search — Hybrid: vector + BM25)
  │
  ▼
Context Assembly (top-k chunks + metadata)
  │
  ▼
Prompt Construction (system + retrieved context + user query)
  │
  ▼
LLM Generation (GPT-4o — Azure OpenAI)
  │
  ▼
Response + Source Citations
```

## Step 1: Indexing VM Specifications

The data source is a structured JSON database of Azure VM SKUs enriched with workload benchmarks, real-world performance characteristics, and pricing data.

### Chunking Strategy

[!INFO] Chunking is the most important decision in a RAG pipeline. Chunk too large and retrieval precision suffers. Chunk too small and you lose context.

For structured VM spec data, we used a **document-per-SKU** strategy rather than fixed-size text chunking. Each SKU becomes one index document:

```python
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex, SimpleField, SearchableField,
    SearchField, SearchFieldDataType, VectorSearch,
    HnswAlgorithmConfiguration, VectorSearchProfile
)

def create_vm_specs_index(client: SearchIndexClient):
    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SearchableField(name="sku_name", type=SearchFieldDataType.String),
        SearchableField(name="description", type=SearchFieldDataType.String),
        SimpleField(name="vcpus", type=SearchFieldDataType.Int32, filterable=True),
        SimpleField(name="memory_gb", type=SearchFieldDataType.Double, filterable=True),
        SimpleField(name="price_hourly", type=SearchFieldDataType.Double, filterable=True),
        SearchField(
            name="embedding",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=3072,  # text-embedding-3-large
            vector_search_profile_name="vm-hnsw-profile"
        ),
    ]
    vector_search = VectorSearch(
        profiles=[VectorSearchProfile(name="vm-hnsw-profile", algorithm_configuration_name="hnsw")],
        algorithms=[HnswAlgorithmConfiguration(name="hnsw", parameters={"m": 4, "efConstruction": 400})]
    )
    index = SearchIndex(name="vm-specs", fields=fields, vector_search=vector_search)
    client.create_or_update_index(index)
```

### Generating Embeddings

```python
import asyncio
from openai import AsyncAzureOpenAI

async def embed_vm_spec(spec: dict, client: AsyncAzureOpenAI) -> list[float]:
    # Build a rich text representation of the VM spec for embedding
    text = f"""
    SKU: {spec['sku_name']}
    vCPUs: {spec['vcpus']}, Memory: {spec['memory_gb']} GB
    Storage: {spec.get('temp_storage_gb', 'None')} GB temp
    Network: up to {spec.get('network_bandwidth_gbps', '?')} Gbps
    Use cases: {', '.join(spec.get('use_cases', []))}
    Price: ${spec['price_hourly']:.4f}/hour ({spec['region']})
    Benchmark notes: {spec.get('benchmark_notes', '')}
    """
    response = await client.embeddings.create(
        input=text.strip(),
        model="text-embedding-3-large"
    )
    return response.data[0].embedding
```

## Step 2: Hybrid Retrieval (Vector + Keyword)

Pure vector search misses exact matches (e.g., "D4s_v3"). Pure keyword search misses semantic matches ("4 CPU 16 GB general purpose VM"). Hybrid search wins:

```python
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery

async def retrieve_vm_context(
    query: str,
    search_client: SearchClient,
    openai_client: AsyncAzureOpenAI,
    top_k: int = 5
) -> list[dict]:
    # Embed the query
    query_embedding = (await openai_client.embeddings.create(
        input=query, model="text-embedding-3-large"
    )).data[0].embedding

    # Hybrid search: vector + full-text BM25
    results = search_client.search(
        search_text=query,
        vector_queries=[VectorizedQuery(
            vector=query_embedding,
            k_nearest_neighbors=top_k,
            fields="embedding"
        )],
        top=top_k,
        select=["id", "sku_name", "description", "vcpus", "memory_gb", "price_hourly"]
    )
    return [dict(r) for r in results]
```

## Step 3: Prompt Construction and Generation

```python
SYSTEM_PROMPT = """You are VirtuAI, an expert Azure infrastructure advisor.
Answer questions about VM sizing, workload placement, and cost optimisation
using ONLY the provided context. If the context doesn't contain enough
information, say so clearly rather than guessing.
Always cite the specific VM SKU when making recommendations."""

async def generate_answer(
    query: str,
    context_docs: list[dict],
    openai_client: AsyncAzureOpenAI
) -> str:
    context_text = "\n\n".join([
        f"SKU: {doc['sku_name']}\n"
        f"vCPUs: {doc['vcpus']}, Memory: {doc['memory_gb']} GB\n"
        f"Price: ${doc['price_hourly']:.4f}/hr\n"
        f"Details: {doc['description']}"
        for doc in context_docs
    ])

    response = await openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Context:\n{context_text}\n\nQuestion: {query}"}
        ],
        temperature=0.1,  # Low temperature for factual responses
        max_tokens=1024
    )
    return response.choices[0].message.content
```

## Evaluation: What Makes a RAG Pipeline "Good"?

We measure four metrics in production:

| Metric | Description | Target |
|---|---|---|
| Retrieval Recall@5 | Correct doc in top 5 results | > 92% |
| Answer Faithfulness | Answer grounded in context | > 95% |
| Answer Relevance | Answers the actual question | > 90% |
| Latency P95 | End-to-end response time | < 3s |

[!TIP] Use **LLM-as-judge** evaluation: have GPT-4 score faithfulness and relevance on a sample of queries. It's cheap, fast, and correlates well with human evaluation at scale.

The hybrid retrieval approach improved Recall@5 from 78% (vector-only) to 94% — a significant jump for minimal implementation complexity.
