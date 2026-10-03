---
status: "NOT APPROVED FOR PUBLICATION"
proposed_slug: "foundry-agent-service-production-checklist"
proposed_title: "Foundry Agent Service: a production readiness checklist"
proposed_excerpt: "Check Foundry agent identity, tool permissions, conversation state, retries and evaluation before exposing a production endpoint."
proposed_tags: [Microsoft Foundry, Azure, AI Agents, Identity, Production]
proposed_cover: "/blog-covers/ai-editorial-2026-10-02/foundry-boundaries.webp"
proposed_cover_alt: "Editorial collage of a photographed supercomputer behind a green boundary, with the words Agents need boundaries."
source_review_date: "2026-10-02"
distinct_intent: "Operational release checklist, not the existing Foundry cloud-runtime overview or agent-loop tutorial."
verified_sources:
  - url: "https://learn.microsoft.com/en-us/azure/foundry/agents/overview"
    accessed: "2026-10-02"
  - url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/migrate-agent-applications"
    accessed: "2026-10-02"
  - url: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-identity"
    accessed: "2026-10-02"
  - url: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/runtime-components"
    accessed: "2026-10-02"
  - url: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-best-practice"
    accessed: "2026-10-02"
  - url: "https://learn.microsoft.com/en-us/azure/foundry/observability/how-to/evaluate-agent"
    accessed: "2026-10-02"
  - url: "https://learn.microsoft.com/en-us/azure/foundry/observability/concepts/trace-agent-concept"
    accessed: "2026-10-02"
review_notes:
  - "Documentation review only; no Azure deployment, endpoint invocation, evaluation run or measured performance."
  - "Current and legacy identity models coexist in Learn; preview API and feature-header details are recorded in the source register."
  - "Retry budgets and business-operation deduplication are application recommendations, not guarantees provided by Agent Service."
---

## A working playground is not a release gate

A Foundry agent is ready for production only when its deployed identity, tools, state boundaries and failure behavior have been tested together. A successful answer in the playground proves one interaction worked. It does not prove the production principal can reach the same data, a retry will avoid duplicating an action, or a returning user will receive only their own conversation.

This checklist complements the [Foundry cloud-runtime overview](/blog/microsoft-foundry-agent-service-cloud-runtime). It focuses on release evidence rather than product announcements. The [current service overview](https://learn.microsoft.com/en-us/azure/foundry/agents/overview) covers prompt, voice-based prompt and hosted agents, plus direct Responses API use. Choose the applicable path before borrowing a sample from another agent generation.

## Establish the API and endpoint generation

Record the agent type, model deployment, region, endpoint, SDK version and exact agent version. Include every preview dependency in the release record. Model support alone does not establish tool availability: Microsoft's [tool guidance](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-best-practice) requires support from both the model and project region.

Pay particular attention to publishing. The [migration guide](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/migrate-agent-applications) distinguishes legacy Agent Applications from a newer agent object model. Legacy unpublished agents use a shared project identity; publishing an Agent Application creates a distinct identity. In the newer model, newly created agents receive their unique identity and stable endpoint at creation. Selecting an endpoint version and distributing it to Teams or Microsoft 365 are separate concerns.

Do not assume all projects have identical behavior. Inspect the actual identity and endpoint configuration, and follow the matching API documentation. The migration guide's inspection example uses a preview API and feature header. Treat that as a versioned procedure, not evidence that every endpoint property is universally stable.

## Verify the principal that actually calls each tool

Draw three separate trust boundaries: the client invoking the agent, the agent invoking a tool, and the tool accessing its data source. A developer's broad Azure permissions can hide a missing runtime grant.

Microsoft's [identity guidance](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-identity) distinguishes blueprint authentication from the downstream agent principal. In that flow, the project managed identity authenticates the blueprint; the agent identity needs the downstream resource permission. Some connections support other authentication choices, so inspect the configured connection rather than assigning roles by habit.

Test a permitted read and a forbidden read using the deployed path. Then verify the target audience. A token audience must match the downstream service's resource identifier, not simply the MCP server URL. When migration creates a new identity, downstream role assignments do not transfer automatically.

Use the narrowest supported scope and permission. An agent that only reads records should not receive write access merely because a quickstart demonstrates it. For delegated access, test with a user lacking permission as well as one who has it. Service-level authentication is not a substitute for the application's tenant and user authorization.

## Make tools safe before making them convenient

For each tool, document allowed operations, argument validation, credential ownership, timeout handling and data sent outside your environment. Reject unauthorized resource identifiers inside the tool service. Do not rely on the model to keep a subscription, customer or document identifier within scope.

Microsoft recommends treating tool results as untrusted input, validating structured outputs and requiring approval for consequential actions in its [tool best practices](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-best-practice). A retrieved instruction telling the agent to export private data is document content, not an authority to change policy.

Exercise missing results, malformed arguments, access denial and unreachable endpoints. When the agent does not call a tool, inspect whether it is attached and supported before changing instructions. `tool_choice="required"` forces one or more tool calls; it does not guarantee the right tool, correct arguments or authorized execution.

## Define what persistent state means

Foundry's [runtime components](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/runtime-components) separate the reusable agent definition, durable conversation history and individual response. Conversation items can include tool calls and tool outputs, not just displayed chat text.

Map conversation identifiers to authenticated owners in your application. Test a user attempting to substitute another user's identifier. Persistence makes cross-session continuity possible; it does not define your application's access policy or deletion workflow.

Distinguish retained history from active model context. The runtime guide says an oversized conversation can be truncated for model input while the conversation itself remains stored. An old approval remaining in storage does not ensure the model sees it on a later turn. Enforce approvals in application state, not only in historical messages.

If using `store=false`, understand its scope: the guide says the response is not persisted and context must be carried forward by the client. That setting alone is not a statement about all conversations, uploaded files, external tools or telemetry. Review each store separately.

## Bound retries and reconcile uncertain actions

Define an end-to-end deadline, bounded retry policy and maximum tool steps. Record the SDK's retry settings alongside retries in your tool adapter so nested policies do not silently multiply attempts. These are application controls, not a claim that Foundry provides exactly-once execution.

Classify failures before retrying. Invalid arguments and access denial require correction. A temporary read failure may permit a bounded retry. A write that times out after reaching the destination requires reconciliation: query its status using a durable operation identifier before issuing another write. Where supported, implement destination-side deduplication tied to the same authorized business operation.

Test a disconnect after submission and a duplicate request. The desired outcome is a verifiable operation result or an explicit uncertain status, not an invented success message. Replaying a whole agent turn can repeat more than the final failed network call.

## Release evidence must include behavior and traces

Build a test set covering normal questions, unavailable tools, unauthorized requests, injected instructions and follow-up turns. Microsoft's [evaluation guide](https://learn.microsoft.com/en-us/azure/foundry/observability/how-to/evaluate-agent) supports rubrics and additional quality, safety and agent evaluators. Set thresholds for your use case before reviewing results, and inspect failed rows rather than trusting an aggregate score.

Tie evaluations to the exact version you intend to expose. Capture authorized outcomes separately from fluent explanations. A polished response claiming an action occurred is not proof that the destination accepted it.

Finally, verify [tracing](https://learn.microsoft.com/en-us/azure/foundry/observability/concepts/trace-agent-concept) through Application Insights, including access permissions, sampling and retention. Redact secrets and sensitive tool data before telemetry ingestion. Keep a rollback target and an owner for unresolved failures. Release when these checks have evidence, not when the playground answer looks convincing.
