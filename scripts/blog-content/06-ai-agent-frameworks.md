## What Makes a System "Agentic"?

An LLM that answers questions is not an agent. An agent is a system that can:

1. **Perceive** — receive input from the environment (text, images, API responses, files)
2. **Plan** — decide what actions to take to achieve a goal
3. **Act** — execute tools that affect the real world (call APIs, write files, query databases)
4. **Observe** — receive the results of actions and update its plan accordingly
5. **Iterate** — repeat until the goal is achieved or a stopping condition is met

The loop is what distinguishes an agent from a single LLM call.

## The Architecture of VirtuAI's Agent Framework

VirtuAI is an AI platform for Azure infrastructure management. Its agent needs to answer complex multi-step questions like: "Analyse our current VM fleet, identify over-provisioned instances, calculate the cost saving from right-sizing, and generate a migration plan."

That's 4–6 distinct tool calls with dependencies between them. A single prompt can't do it.

```
User Request
  │
  ▼
Orchestrator LLM (GPT-4o with function calling)
  ├─▶ tool: query_vm_fleet(subscription_id) → fleet data
  ├─▶ tool: get_utilisation_metrics(vm_ids, lookback_days=30) → CPU/RAM stats
  ├─▶ tool: price_lookup(sku, region) → pricing data
  ├─▶ tool: calculate_rightsize_candidates(fleet, metrics, threshold=0.4) → candidates
  └─▶ tool: generate_migration_plan(candidates, pricing) → plan document
  │
  ▼
Final Response (with structured migration plan + cost delta)
```

## Tool Definition and Calling

With the OpenAI function calling API, tools are declared as JSON Schema and the model decides when and how to call them:

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "query_vm_fleet",
            "description": "Retrieve all VMs in an Azure subscription with their current configuration.",
            "parameters": {
                "type": "object",
                "properties": {
                    "subscription_id": {
                        "type": "string",
                        "description": "Azure subscription GUID"
                    },
                    "resource_group": {
                        "type": "string",
                        "description": "Filter to a specific resource group (optional)"
                    }
                },
                "required": ["subscription_id"]
            }
        }
    },
]

async def agent_loop(user_message: str, tools: list, max_iterations: int = 10):
    messages = [{"role": "user", "content": user_message}]

    for _ in range(max_iterations):
        response = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )

        msg = response.choices[0].message
        messages.append(msg)

        # No tool calls → agent is done
        if not msg.tool_calls:
            return msg.content

        # Execute all tool calls and append results
        for tool_call in msg.tool_calls:
            result = await execute_tool(tool_call.function.name, tool_call.function.arguments)
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result)
            })

    return "Max iterations reached."
```

## Memory Management

The naive agent keeps the entire conversation history in context. This works until the context window fills up (expensive) or degrades model performance (long contexts hurt reasoning quality).

We use a three-tier memory architecture:

**Working Memory** — the active conversation buffer (last N messages + current task state)

**Episodic Memory** — summaries of past sessions, stored in a vector DB and retrieved by semantic similarity to the current task

**Semantic Memory** — long-term facts about the user's infrastructure (subscription IDs, common patterns, preferences) stored as structured key-value pairs

```python
class AgentMemory:
    def __init__(self, max_working_tokens: int = 8000):
        self.working: list[dict] = []
        self.max_tokens = max_working_tokens

    def add(self, message: dict):
        self.working.append(message)
        self._compress_if_needed()

    def _compress_if_needed(self):
        """Summarise old messages when approaching token limit."""
        if self._estimate_tokens() > self.max_tokens * 0.8:
            # Summarise the oldest half of working memory
            to_summarise = self.working[:len(self.working)//2]
            summary = self._summarise(to_summarise)
            self.working = [
                {"role": "system", "content": f"[Summary of earlier conversation]: {summary}"}
            ] + self.working[len(self.working)//2:]
```

## Multi-Modal Integration

VirtuAI accepts architecture diagrams (PNG/JPG) as input. Users can photograph a whiteboard diagram and ask "analyse this architecture and identify single points of failure."

The GPT-4o vision capability handles this natively — images are passed as base64 in the message content:

```python
import base64

async def analyse_architecture_diagram(image_path: str, query: str) -> str:
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    response = await openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_data}",
                        "detail": "high"
                    }
                },
                {"type": "text", "text": query}
            ]
        }]
    )
    return response.choices[0].message.content
```

## Where Agent Frameworks Add Value

Frameworks like LangGraph, AutoGen, or custom orchestrators like Hermes (our internal framework) add value in four areas:

1. **State management** — persisting agent state across async tool calls
2. **Retry and error handling** — graceful degradation when tools fail
3. **Observability** — tracing every tool call, token count, and decision
4. **Parallelism** — running independent tool calls concurrently (reducing latency significantly)

[!INFO] For most production use cases, a simple hand-rolled agent loop (like the one above) is more maintainable than adopting a full framework. Use frameworks when you need their specific features, not by default.

The VirtuAI agent handles 500+ requests per day with a median response time of 4.2 seconds — covering tasks that previously required a senior cloud architect and 30 minutes of manual analysis.
