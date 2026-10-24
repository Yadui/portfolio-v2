---
status: "NOT APPROVED FOR PUBLICATION"
proposed_slug: "ai-agent-threat-model-tools-credentials"
proposed_title: "AI agent security: a threat model for tools and MCP"
proposed_excerpt: "AI agent security starts with trust boundaries: prompts, retrieved data, MCP tools, credentials, files, network egress and human approval."
proposed_tags: [AI Agents, Security, Threat Modeling, MCP, Prompt Injection]
proposed_cover: "/blog-covers/ai-security-2026-10-24/agent-threat-model.webp"
proposed_cover_alt: "Long aisle of grey server and equipment racks in an industrial hall, photographed by İsmail Enes Ayhan."
proposed_date: "2026-10-02"
source_review_date: "2026-10-24"
distinct_intent: "Evergreen threat-modeling method for tool-using agents, not a product checklist or incident write-up."
verified_sources:
  - url: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/"
    accessed: "2026-10-24"
  - url: "https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/"
    accessed: "2026-10-24"
  - url: "https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/"
    accessed: "2026-10-24"
  - url: "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/"
    accessed: "2026-10-24"
  - url: "https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/"
    accessed: "2026-10-24"
  - url: "https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices"
    accessed: "2026-10-24"
  - url: "https://www.nist.gov/itl/ai-risk-management-framework"
    accessed: "2026-10-24"
review_notes:
  - "Sources were accessed on 2026-10-24 but all cited documents were published before 2026-10-02; confirm no material revision changes a cited claim before publishing."
  - "The MCP citation points to the 2025-06-18 specification revision; check whether a newer revision moved or renamed sections."
  - "No system was tested. The threat model is a method, not a report of findings."
  - "Examples are illustrative and describe no real organization or incident."
  - "SEO pass 2026-10-24: retitled for search intent, excerpt and opening paragraph carry the primary keyword, internal links added. No new facts introduced."
---

## Start from what the agent can touch

AI agent security begins with a simple observation: a chat model that only returns text has a small blast radius. Give it tools, credentials, file access and a network path, and it starts acting with real authority. The useful security question stops being "can the model be tricked?" It can. Ask instead what an attacker gains once it is.

OWASP puts this plainly. [Prompt injection (LLM01:2025)](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) is listed first, and its guidance accepts that no current technique fully prevents it. [Excessive Agency (LLM06:2025)](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) names the multiplier: too much functionality, too many permissions or too much autonomy. A threat model for an agent is therefore mostly a map of authority. You decide where untrusted text enters, where authority is exercised, and which controls sit between the two that do not depend on the model behaving.

The method below walks seven boundaries. For each one, write down what crosses it, who controls that input, and what enforces the limit.

## Boundary 1: the instructions

System prompts and developer instructions feel trusted because you wrote them. Treat them as configuration, not as a security control. OWASP's prompt injection entry recommends constraining model behavior in instructions, but pairs that with privilege control, human approval and segregation of external content, because instructions can be overridden.

Two consequences follow. Never place secrets in a system prompt, since [sensitive information disclosure (LLM02:2025)](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/) includes leaking prompt contents. And never rely on a sentence such as "do not call the delete tool" to stop a destructive action. If the action must not happen, remove the tool or block it in code. Real advisories show what goes wrong when this is skipped; see [how prompt injection became code execution in Flowise, Langflow and PraisonAI](/blog/prompt-injection-to-code-execution-agent-frameworks).

## Boundary 2: retrieved and ingested data

Web pages, emails, tickets, PDFs, repository files and RAG chunks all arrive as text in the same context window as your instructions. The model has no reliable way to tell data from commands. This is indirect prompt injection, and OWASP describes it as content from external sources altering model behavior.

In the threat model, label every input source with its owner. A support inbox is attacker-writable. A public web page is attacker-writable. A shared drive may be writable by every employee. Any tool call that happens after reading attacker-writable content should be treated as attacker-influenced. That single rule clarifies most later decisions.

## Boundary 3: tools and MCP servers

Tools turn text into action, and MCP standardizes how agents discover and call them. The [MCP security best practices](https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices) describe specific attack classes worth copying into your model:

- **Confused deputy.** An MCP proxy server using a static client identity with a third-party authorization server can be abused to obtain authorization without the user's real consent.
- **Token passthrough.** The specification says MCP servers MUST NOT accept any tokens that were not explicitly issued for the MCP server. Forwarding a client's token to a downstream API bypasses audience checks and breaks auditability.
- **Session hijacking.** Session identifiers must not be used for authentication, and should be bound to user-specific information.

For each tool, record what it can read, what it can change, whether the change is reversible, and whose identity it runs as. Prefer narrow tools ("create a draft reply") over general ones ("run a shell command"). OWASP's Excessive Agency guidance recommends exactly this: minimize extensions and their functionality, and avoid open-ended capabilities where a specific one will do.

Third-party MCP servers are also supply chain. Pin versions, review what they request, and treat a server update as a code change.

## Boundary 4: credentials

The credential the agent uses defines the maximum damage of a successful injection. OWASP recommends executing extensions in the user's context with minimum privileges rather than a broad service account.

Ask three questions for every credential. Is it scoped to only the resources this task needs? Does it expire soon? Can its use be attributed to one agent run? A long-lived admin key in an environment variable fails all three. Keep secrets out of the model context entirely, so the tool layer holds the credential and the model only sees results. The steps for doing this on Azure and GitHub are in [Stop giving AI agents your production keys](/blog/stop-giving-ai-agents-production-keys).

## Boundary 5: files and generated code

Agents that write files or run generated code cross into the host. [Improper Output Handling (LLM05:2025)](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/) covers the case where model output is passed to an interpreter, shell, query engine or browser without validation. Treat model output as untrusted user input to whatever consumes it.

Practical limits: a dedicated working directory, no access to the user's home or SSH keys, parameterized queries rather than generated SQL strings, and code execution in an isolated sandbox with an empty environment.

## Boundary 6: network egress

Exfiltration needs a way out. Many injection attacks end with the agent fetching an attacker URL with data embedded in it, or rendering a markdown image that does the same. If the agent's runtime can reach any host on the internet, every read permission becomes a potential leak.

Default-deny egress with an allowlist is one of the few controls that holds even when the model is fully compromised, because it is enforced by the network rather than by the model. For a build-out of this control with run-level shutdown, see [AI agent kill switches and egress gateways](/blog/ai-agent-kill-switch-egress-gateway). Include internal addresses in the model too: an agent that can reach cloud metadata endpoints or internal admin APIs is an SSRF primitive.

## Boundary 7: human approval

Human-in-the-loop is a real control, listed in both OWASP entries, but only when it is designed well. An approval prompt that says "Allow tool call?" with no detail trains people to click yes.

Require approval for irreversible or high-impact actions, show the exact parameters, and present the content that triggered the action. Make the approval check happen in code outside the model, so an injected instruction cannot claim approval was already given.

## Putting the model on one page

For each boundary, write a short entry: input, owner, worst outcome, enforcing control, and whether that control depends on the model. Anything whose only control is "the model should refuse" is an open finding.

The [OWASP Agentic AI threats and mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/) resource offers a broader taxonomy if you need to extend this, including memory poisoning and multi-agent trust. If your organization uses the [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework), this boundary map fits naturally into its Map and Manage functions as the record of where risk enters and how it is treated.

## What to do first

If you only have an afternoon, do these in order. List every tool and the credential behind it. Remove tools the agent does not need. Replace broad credentials with scoped, short-lived ones. Block outbound network access except named destinations. Add approval gates for irreversible actions. Then assume prompt injection will succeed, and check what is left.
