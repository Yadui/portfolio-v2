---
status: "NOT APPROVED FOR PUBLICATION"
proposed_slug: "openwebui-fastapi-model-discovery-streaming"
proposed_title: "Open WebUI + FastAPI: fix model discovery and streaming"
proposed_excerpt: "Diagnose missing models, bearer-auth failures and buffered chat streams when connecting an OpenAI-compatible FastAPI backend to Open WebUI."
proposed_tags: [Open WebUI, FastAPI, OpenAI Compatible, Streaming, API Design]
proposed_cover: "/blog-covers/ai-editorial-2026-10-02/openwebui-stream.webp"
proposed_cover_alt: "Monochrome network-cable photograph with green stream bands and the words Make the stream work."
source_review_date: "2026-10-02"
distinct_intent: "Diagnostic runbook for discovery and wire-format failures, not the existing agent-integration architecture tutorial."
verified_sources:
  - url: "https://docs.openwebui.com/getting-started/quick-start/connect-a-provider/starting-with-openai-compatible"
    accessed: "2026-10-02"
  - url: "https://docs.openwebui.com/features/extensibility/plugin/tools/openapi-servers"
    accessed: "2026-10-02"
  - url: "https://platform.openai.com/docs/api-reference/models/list"
    accessed: "2026-10-02"
  - url: "https://cookbook.openai.com/examples/how_to_stream_completions"
    accessed: "2026-10-02"
  - url: "https://github.com/openai/openai-python/blob/main/src/openai/_streaming.py"
    accessed: "2026-10-02"
  - url: "https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse"
    accessed: "2026-10-02"
  - url: "https://fastapi.tiangolo.com/tutorial/security/first-steps/"
    accessed: "2026-10-02"
review_notes:
  - "Wire fixtures and reader-run curl checks only; no runnable FastAPI server or dependency installation."
  - "No live Open WebUI, upstream model, proxy or authentication test was performed."
  - "demo-agent is a fictional model identifier; created=0 is a fixture timestamp, not a deployment date."
  - "Current unversioned docs were reviewed; no tested Open WebUI, FastAPI or OpenAI SDK release is claimed."
---

## Diagnose the boundary, not the chat window

When a custom FastAPI backend fails in Open WebUI, separate three questions: can the application reach the server, can it discover a model, and can it consume that model's chat response? A working `/docs` page answers none of these completely. A successful model-list request does not prove chat streaming works.

This runbook supplements the [custom-agent integration overview](/blog/connecting-custom-ai-agents-to-openwebui-auth-latency-and-api-design). It uses precise wire examples and checks you can run against your service. They are not output from a tested deployment, and no complete FastAPI implementation is implied.

## Choose a model connection or a tool connection

An OpenAI-compatible model connection supplies chat completions. An OpenAPI tool server exposes operations a model can call. The names are similar, but the contracts are different.

FastAPI generating `openapi.json` does not automatically implement Chat Completions. Conversely, returning `/v1/chat/completions` does not configure the service as an OpenAPI tool. Open WebUI's [tool-server documentation](https://docs.openwebui.com/features/extensibility/plugin/tools/openapi-servers) says those tool responses are complete results, not token-by-token streams. Do not use that limitation to diagnose a model connection.

For a custom chat backend, follow the [OpenAI-compatible connection guide](https://docs.openwebui.com/getting-started/quick-start/connect-a-provider/starting-with-openai-compatible). Configure a base URL such as `http://agent-api:8000/v1`, not the full chat endpoint. The client appends endpoint paths. Confirm your deployed routes avoid both missing and duplicated `/v1` segments.

## Resolve reachability before authentication

For an admin-configured server connection, test from the Open WebUI server's network context. Container loopback points to that container, not automatically to the host running FastAPI. The official guide recommends `host.docker.internal` when Open WebUI runs in Docker and the model server runs on the host; verify that hostname exists in your deployment. For separate containers, use the configured service name and network.

Check DNS, port, bind address, TLS trust and proxy routing first. A timeout has a different remedy from a 401. Browser-side direct connections have a different network path, so identify which connection type you selected before adjusting CORS. Adding permissive CORS cannot repair a server-to-server routing failure.

Keep transport encrypted outside a controlled local test. Never paste real authorization headers into an issue or diagnostic transcript.

## Restore model discovery deliberately

The current guide recommends `GET /v1/models`, but permits manually configured Model IDs when a provider lacks discovery. Saving a connection is not a test. The Verify Connection button calls `/models` using a standard bearer token.

For a backend you own, provide discovery rather than masking a broken route with a manual allowlist. A minimal response fixture, following the [OpenAI model-list schema](https://platform.openai.com/docs/api-reference/models/list), is:

```json
{
  "object": "list",
  "data": [
    {"id": "demo-agent", "object": "model", "created": 0, "owned_by": "local-demo"}
  ]
}
```

Here `demo-agent` is a fictional identifier and zero is a fixture timestamp. Your chat handler must recognize the exact returned identifier. A display label and an upstream model ID are not necessarily interchangeable.

For these reader-run checks, set `BASE_URL` to your authorized test server's base URL, `MODEL_ID` to a real served ID, and `AGENT_API_KEY` through your approved secret mechanism. `curl` and `jq` must be available. The body below uses the fictional ID; replace it before sending.

```sh
curl --silent --show-error --fail-with-body \
  "$BASE_URL/models" \
  -H "Authorization: Bearer $AGENT_API_KEY"
```

Expect a JSON list with a nonempty `data` array. A 404 suggests path configuration. A 200 HTML page suggests a proxy or login redirect. A 401 or 403 calls for inspecting the selected connection credential and backend policy, not changing the model name.

## Authenticate both discovery and chat

Protect both routes consistently. Allowing unauthenticated discovery can disclose model inventory even if chat is protected. Verify a missing or invalid token is rejected and a valid, authorized token succeeds.

Bearer extraction alone is insufficient. FastAPI's [security tutorial](https://fastapi.tiangolo.com/tutorial/security/first-steps/) explicitly distinguishes reading the bearer string from validating its value. Validate the credential against your actual scheme; JWT validation, API-key comparison and delegated user authorization are different jobs.

Do not assume a connection-wide key identifies the human using the chat window. A shared service credential authenticates Open WebUI to your backend. If tools can access user-specific data, design and verify the additional identity boundary instead of trusting a submitted user identifier.

## Establish non-streaming behavior first

Send a text-only request with `stream=false` before investigating SSE. This isolates model lookup, body validation and generation from streaming transport.

```sh
curl --silent --show-error --fail-with-body \
  "$BASE_URL/chat/completions" \
  -H "Authorization: Bearer $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{"model":"demo-agent","messages":[{"role":"user","content":"Reply hello."}],"stream":false}'
```

Look for `object="chat.completion"` and assistant content under `choices[0].message.content`. If FastAPI returns 422, inspect its validation detail and the redacted received payload. The connection guide lists parameters Open WebUI may send, including `tools`, `tool_choice` and token limits. Define which are supported. Silently ignoring tool requests or output limits can be a correctness problem, not just a compatibility shortcut.

## Check SSE framing and completion

Repeat with `stream=true` and `curl --no-buffer --include`, keeping the same URL, headers and body otherwise. Inspect both response headers and arriving events. `text/event-stream` is necessary but does not repair an incorrectly framed body.

The [OpenAI streaming example](https://cookbook.openai.com/examples/how_to_stream_completions) uses `delta`, not `message`, inside streamed choices. A short illustrative stream is:

```text
data: {"id":"chatcmpl-demo","object":"chat.completion.chunk","created":0,"model":"demo-agent","choices":[{"index":0,"delta":{"role":"assistant","content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-demo","object":"chat.completion.chunk","created":0,"model":"demo-agent","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]

```

Each event ends with a blank line, including the terminal sentinel. The [official Python stream parser](https://github.com/openai/openai-python/blob/main/src/openai/_streaming.py) recognizes `[DONE]`. Do not substitute newline-delimited raw tokens or Responses API semantic events into a Chat Completions stream.

## Distinguish generation delay from buffering

FastAPI's [StreamingResponse](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse) streams an iterator or async generator. An async handler that first waits for a complete upstream answer and only then yields fragments has not made generation incremental. Avoid blocking work in the async path and ensure cancellation closes upstream resources.

Compare the direct FastAPI path with the same request through your proxy. Incremental direct events arriving together through the proxy suggest buffering or timeout configuration. No events on either path may indicate backend work before the first yield. Once transport is correct, verify the final stop event, interrupted streams and unsupported parameters in Open WebUI itself. Keep this evidence separate from any latency claim: this runbook reports no measured performance improvement.
