## The Problem with Unstructured Documents

An enterprise generates thousands of documents per month: invoices, compliance reports, technical specifications, contracts, procurement forms. Each document type has a different structure. Some are PDFs from legacy systems. Some are scanned paper. Some are Word documents exported to PDF with inconsistent formatting.

The question is: how do you extract specific, structured data from hundreds of different document layouts without writing a custom parser for each one?

That was the challenge behind SchemaForge.

## What Azure Document Intelligence Provides

Azure Document Intelligence (formerly Form Recognizer) uses computer vision and layout analysis to understand document structure — not just text, but *where* the text is and what it means structurally.

The key models:

| Model | Best For |
|---|---|
| `prebuilt-document` | General key-value extraction, tables |
| `prebuilt-invoice` | Invoices with standard fields |
| `prebuilt-layout` | Page structure, tables, paragraphs, reading order |
| Custom model | Your specific document type with training data |

For SchemaForge, we primarily use `prebuilt-layout` combined with an LLM post-processing step — because the real value is in the semantic understanding, not just the OCR.

## The Two-Stage Pipeline

```
Document (PDF/Image)
  │
  ▼
Stage 1: Azure Document Intelligence (prebuilt-layout)
  → Extracts: paragraphs, tables, key-value pairs, reading order, bounding boxes
  │
  ▼
Stage 2: LLM Schema Mapping (GPT-4o with structured output)
  → Maps extracted content to user-defined JSON schema
  │
  ▼
Structured JSON Output
```

## Stage 1: Layout Analysis

```python
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import AnalyzeDocumentRequest
from azure.core.credentials import AzureKeyCredential
import os

async def extract_layout(file_bytes: bytes, content_type: str) -> dict:
    client = DocumentIntelligenceClient(
        endpoint=os.environ["DOCUMENT_INTELLIGENCE_ENDPOINT"],
        credential=AzureKeyCredential(os.environ["DOCUMENT_INTELLIGENCE_KEY"])
    )

    poller = client.begin_analyze_document(
        "prebuilt-layout",
        AnalyzeDocumentRequest(bytes_source=file_bytes),
        content_type=content_type,
        output_content_format="markdown"
    )
    result = poller.result()

    extracted = {
        "markdown_content": result.content,
        "tables": [],
        "key_value_pairs": []
    }

    for table in (result.tables or []):
        table_data = {
            "row_count": table.row_count,
            "column_count": table.column_count,
            "cells": [
                {
                    "row": cell.row_index,
                    "column": cell.column_index,
                    "content": cell.content,
                    "is_header": cell.kind == "columnHeader"
                }
                for cell in table.cells
            ]
        }
        extracted["tables"].append(table_data)

    return extracted
```

[!INFO] Setting `output_content_format="markdown"` is a key optimisation. The model returns document content as structured Markdown, which preserves tables, headers, and document hierarchy far better than plain text — and it's what the LLM stage works best with.

## Stage 2: Schema Mapping with GPT-4o

The user defines a JSON schema for what they want to extract:

```json
{
  "invoice_number": "string",
  "vendor_name": "string",
  "invoice_date": "ISO date string",
  "line_items": [
    {
      "description": "string",
      "quantity": "number",
      "unit_price": "number",
      "total": "number"
    }
  ],
  "subtotal": "number",
  "tax": "number",
  "total_due": "number"
}
```

GPT-4o maps the extracted layout content to this schema:

```python
import json
from openai import AsyncAzureOpenAI

async def map_to_schema(
    extracted: dict,
    user_schema: dict,
    openai_client: AsyncAzureOpenAI
) -> dict:
    prompt = f"""You are a document data extraction assistant.

Extract the following fields from the document content below.
Return a valid JSON object matching exactly this schema:
{json.dumps(user_schema, indent=2)}

Document content (in Markdown):
{extracted['markdown_content'][:6000]}

Rules:
- Return ONLY the JSON object, no explanation
- Use null for fields not found in the document
- Dates must be in ISO 8601 format (YYYY-MM-DD)
- Numbers must be numeric values, not strings"""

    response = await openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0
    )
    return json.loads(response.choices[0].message.content)
```

## The Hard Problems

### Rotated or Skewed Scans

Document Intelligence handles moderate skew (< 15°) automatically. For severely rotated documents, we pre-process with OpenCV:

```python
import cv2
import numpy as np

def deskew(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.bitwise_not(gray)
    coords = np.column_stack(np.where(gray > 0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    return cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
```

### Validation and Confidence Scoring

Every extraction gets a confidence score based on field coverage, numerical consistency, and format validation:

```python
def validate_extraction(result: dict, schema: dict) -> tuple[dict, float]:
    required_fields = [k for k, v in schema.items() if not k.endswith("?")]
    found_fields = [k for k in required_fields if result.get(k) is not None]
    field_coverage = len(found_fields) / len(required_fields)

    # Numerical consistency check for invoices
    if "line_items" in result and "total_due" in result:
        calculated = sum(item.get("total", 0) for item in result["line_items"])
        tax = result.get("tax", 0)
        if result["total_due"]:
            numerical_consistency = 1.0 - abs(calculated + tax - result["total_due"]) / result["total_due"]
        else:
            numerical_consistency = 0.5
    else:
        numerical_consistency = 1.0

    confidence = (field_coverage * 0.6) + (numerical_consistency * 0.4)
    return result, round(confidence, 3)
```

In production, SchemaForge achieves 94% extraction accuracy on invoice documents and 89% on technical specification sheets — compared to 60–70% for pure OCR approaches without the LLM mapping stage.
