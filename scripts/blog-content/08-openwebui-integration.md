## Why OpenWebUI as the Interface Layer

OpenWebUI is an open-source, self-hostable chat interface that supports the OpenAI API spec. That compatibility means any system that implements `/v1/chat/completions` — including your custom agent — can be plugged into OpenWebUI as a backend model.

For VirtuAI, this was the integration path: deploy the agent as a FastAPI service exposing an OpenAI-compatible API, register it in OpenWebUI as a custom model, and users get a polished chat interface without building one from scratch.

## The OpenAI-Compatible API Contract

Your agent needs to implement two endpoints:

```
GET  /v1/models          → list available models
POST /v1/chat/completions → handle chat requests (streaming support required)
```

The chat completions request shape:

```json
{
  "model": "virtuai-v1",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "List all over-provisioned VMs in subscription X"}
  ],
  "stream": true,
  "temperature": 0.1
}
```

## Implementing the Endpoint with FastAPI

```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json, time, uuid

app = FastAPI()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: list[ChatMessage]
    stream: bool = False
    temperature: float = 0.1

@app.get("/v1/models")
async def list_models():
    return {
        "object": "list",
        "data": [{"id": "virtuai-v1", "object": "model", "owned_by": "virtuai"}]
    }

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatRequest, api_key: str = Depends(verify_api_key)):
    if request.stream:
        return StreamingResponse(
            stream_agent_response(request),
            media_type="text/event-stream"
        )
    else:
        result = await run_agent(request.messages)
        return {
            "id": f"chatcmpl-{uuid.uuid4().hex[:8]}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": request.model,
            "choices": [{
                "index": 0,
                "message": {"role": "assistant", "content": result},
                "finish_reason": "stop"
            }],
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        }
```

## Streaming: The UX Non-Negotiable

Non-streaming responses for agentic tasks create terrible UX — the user sees nothing for 10–30 seconds while the agent runs tool calls.

OpenAI's streaming format uses Server-Sent Events with `data: {chunk}` lines:

```python
async def stream_agent_response(request: ChatRequest):
    completion_id = f"chatcmpl-{uuid.uuid4().hex[:8]}"

    async for token in agent_token_stream(request.messages):
        chunk = {
            "id": completion_id,
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": request.model,
            "choices": [{
                "index": 0,
                "delta": {"content": token},
                "finish_reason": None
            }]
        }
        yield f"data: {json.dumps(chunk)}\n\n"

    # Final chunk with finish_reason
    final = {
        "id": completion_id,
        "object": "chat.completion.chunk",
        "created": int(time.time()),
        "model": request.model,
        "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}]
    }
    yield f"data: {json.dumps(final)}\n\n"
    yield "data: [DONE]\n\n"
```

[!INFO] For agentic workflows where tool calls happen before generation, stream **status updates** during the tool execution phase: "Querying VM fleet...", "Analysing utilisation metrics...". This keeps the user informed and dramatically improves perceived performance.

## Authentication Architecture

OpenWebUI → custom agent authentication has two layers:

**Layer 1: OpenWebUI to Agent API**

OpenWebUI passes a bearer token in the `Authorization` header. Your agent verifies this:

```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

security = HTTPBearer()

async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != os.environ["AGENT_API_KEY"]:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials.credentials
```

**Layer 2: Agent to Azure Resources**

The agent itself needs to authenticate to Azure APIs. Use **Managed Identity** when deployed on Azure, never hardcoded credentials:

```python
from azure.identity.aio import DefaultAzureCredential
from azure.mgmt.compute.aio import ComputeManagementClient

async def get_compute_client(subscription_id: str):
    credential = DefaultAzureCredential()
    return ComputeManagementClient(credential, subscription_id)
```

## API Latency Management

Agentic requests are inherently slow — multiple LLM calls, multiple Azure API calls. The strategies we use:

**1. Parallel tool execution** — when tool calls have no dependencies, run them concurrently:

```python
import asyncio

async def execute_tools_parallel(tool_calls: list) -> list:
    tasks = [execute_tool(tc.function.name, tc.function.arguments) for tc in tool_calls]
    return await asyncio.gather(*tasks)
```

**2. Response caching** — Azure resource queries are cached for 5 minutes:

```python
import time

_cache: dict[str, tuple] = {}

async def cached_list_vms(subscription_id: str, ttl: int = 300) -> list:
    cache_key = f"vms:{subscription_id}"
    if cache_key in _cache:
        result, timestamp = _cache[cache_key]
        if time.time() - timestamp < ttl:
            return result
    result = await _fetch_vms(subscription_id)
    _cache[cache_key] = (result, time.time())
    return result
```

**3. Timeout budgets** — each tool call has a hard timeout:

```python
async def execute_tool_with_timeout(name: str, args: dict, timeout: float = 15.0) -> dict:
    try:
        return await asyncio.wait_for(execute_tool(name, args), timeout=timeout)
    except asyncio.TimeoutError:
        return {"error": f"Tool {name} timed out after {timeout}s", "partial": True}
```

The result: median end-to-end latency of 4.2 seconds for simple queries, 12–18 seconds for complex multi-tool workflows — all streamed so the user sees progress the entire time.
