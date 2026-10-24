---
status: "NOT APPROVED FOR PUBLICATION"
proposed_slug: "prompt-injection-to-code-execution-agent-frameworks"
proposed_title: "Flowise, Langflow, PraisonAI: prompt injection to RCE"
proposed_excerpt: "October 2026 advisories in Flowise, Langflow and PraisonAI show how prompt injection becomes RCE when LLM-generated code runs without a sandbox."
proposed_tags: [AI Agents, Security, Prompt Injection, Sandboxing, Vulnerabilities]
proposed_cover: "/blog-covers/ai-security-2026-10-24/prompt-injection-code.webp"
proposed_cover_alt: "A single burning match against a black background, photographed by Soulride Photography."
proposed_date: "2026-10-09"
source_review_date: "2026-10-24"
distinct_intent: "Pattern analysis of three code-execution advisories with defensive guidance, not an exploit walkthrough."
verified_sources:
  - url: "https://github.com/advisories/GHSA-w7x8-q2gp-5cgg"
    accessed: "2026-10-24"
  - url: "https://nvd.nist.gov/vuln/detail/CVE-2026-73487"
    accessed: "2026-10-24"
  - url: "https://github.com/advisories/GHSA-9fpm-3445-2vx4"
    accessed: "2026-10-24"
  - url: "https://nvd.nist.gov/vuln/detail/CVE-2026-7700"
    accessed: "2026-10-24"
  - url: "https://github.com/advisories/GHSA-2xv2-w8cq-5gxw"
    accessed: "2026-10-24"
  - url: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/"
    accessed: "2026-10-24"
  - url: "https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/"
    accessed: "2026-10-24"
review_notes:
  - "All three advisories verified through the GitHub Advisory Database API on 2026-10-24. GitHub publication timestamps: Langflow GHSA-9fpm-3445-2vx4 2026-10-05, Flowise GHSA-w7x8-q2gp-5cgg 2026-10-07, PraisonAI GHSA-2xv2-w8cq-5gxw 2026-10-08."
  - "CVE dates differ from GitHub dates: NVD shows CVE-2026-73487 published 2026-08-13 and CVE-2026-7700 published 2026-05-03 (VulDB CNA, status Deferred). Article says 'advisories published' rather than 'CVEs published' for that reason."
  - "Langflow: the NVD/VulDB record says versions up to 1.10.2 and that the vendor did not respond; the GitHub advisory lists affected >= 1.3.0, < 1.10.3 and patched 1.10.3. The draft uses the GitHub advisory and notes the discrepancy. The NVD CVSS 4.0 secondary score (2.1 LOW from VulDB) conflicts with the advisory framing; severity is deliberately not stated for Langflow."
  - "Flowise CVSS 3.1 9.3 and PraisonAI 'critical' are taken from the GitHub advisories."
  - "No exploit was reproduced. Exploit payloads are intentionally not reproduced beyond the class of function named in advisories."
  - "SEO pass 2026-10-24: retitled for search intent, excerpt and opening paragraph carry the primary keyword, internal links added. No new facts introduced."
---

## Three advisories, one pattern

In the first week of October 2026, GitHub published advisories for three popular agent frameworks, Flowise, Langflow and PraisonAI, where prompt injection can lead to remote code execution (RCE). Each describes the same chain: untrusted text reaches a model, the model writes code, and the framework runs that code with more authority than it should.

- **Flowise** [GHSA-w7x8-q2gp-5cgg](https://github.com/advisories/GHSA-w7x8-q2gp-5cgg) (CVE-2026-73487), published on GitHub on 7 October. The `flowise` and `flowise-components` npm packages up to 3.1.2 are affected, and 3.1.3 is the first patched version. The advisory rates it critical with a CVSS 3.1 score of 9.3.
- **Langflow** [GHSA-9fpm-3445-2vx4](https://github.com/advisories/GHSA-9fpm-3445-2vx4) (CVE-2026-7700), published on GitHub on 5 October. The `langflow` package from 1.3.0 up to but not including 1.10.3 is affected. The older [NVD record](https://nvd.nist.gov/vuln/detail/CVE-2026-7700) describes the range as "up to 1.10.2", so check the advisory for the authoritative fix version.
- **PraisonAI** [GHSA-2xv2-w8cq-5gxw](https://github.com/advisories/GHSA-2xv2-w8cq-5gxw) (CVE-2026-61447), published on GitHub on 8 October. The `praisonaiagents` package up to 1.6.77 is affected and 1.6.78 is patched. The advisory rates it critical.

If you run any of these, upgrade first and read the rest later.

## What each one got wrong

**Flowise: a blocklist in front of an interpreter.** According to the advisory, the CSV Agent and Airtable Agent nodes validated LLM-generated Python with a blocklist of regular expressions before running it in Pyodide. The advisory shows several structural bypasses. Pandas functions such as `pd.read_json()` accept URLs, were not blocked, and could send the loaded dataset to an outside server or reach internal services. The `\bimport\b` pattern did not match `importlib`. The [NVD description](https://nvd.nist.gov/vuln/detail/CVE-2026-73487) adds that this was reachable by unauthenticated attackers through the prediction API via prompt injection.

**Langflow: `eval` with full builtins.** The advisory says the Smart Transform component (`LambdaFilterComponent`) asks a model to produce a Python lambda from flow instructions and a preview of input data. It then checks only that the text starts with `lambda` and contains a colon, and evaluates it with Python's full builtins inside the Langflow process. A flow author can exploit this directly. Where an exposed flow passes attacker-controlled content into the component, the advisory says an attacker may exploit it indirectly through prompt injection, subject to the model following the injected instruction.

**PraisonAI: a sandbox flag that did not sandbox.** The advisory says `CodeAgent._execute_python()` writes generated code to a temporary file and runs it in a subprocess with `os.environ.copy()`, the full parent environment. It performs no AST validation and no import restrictions, even when `CodeConfig(sandbox=True)` is set. Every API key, database URL and cloud credential in the parent process was therefore readable by generated code. The advisory notes that a separate tool in the same project already used an empty environment.

## The shared lesson

None of these bugs require a clever model jailbreak. They require only that the model can be influenced, and OWASP's [prompt injection entry (LLM01:2025)](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) is clear that it can. The vulnerability lives in what happens next. OWASP calls that [Improper Output Handling (LLM05:2025)](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/): model output passed to an interpreter or other back end without treating it as untrusted.

Three habits made these cases worse:

1. **Validating code with patterns.** Python and its libraries offer too many routes to the network, filesystem and import system for a blocklist to cover. The Flowise advisory is a catalog of those routes.
2. **Running in the host process or host environment.** Langflow evaluated in-process. PraisonAI copied the environment. Either way, the generated code inherited the application's authority.
3. **Treating data as inert.** In each case the dangerous input could arrive as data: a CSV row, an Airtable record, a tool result, a document. Data that a model reads is an instruction channel.

## How to run generated code safely

If your agent must execute model-written code, design as if the code is written by an attacker, because sometimes it will be.

**Isolate at the operating-system level.** Use a separate container, microVM or dedicated sandbox service, not a subprocess on the application host, and not a language-level restriction. Run as an unprivileged user with a read-only root filesystem and a throwaway working directory. The same container hygiene applies as for any app; see [Dockerizing a complex app with multi-stage builds and secrets](/blog/dockerizing-a-complex-app-lightweight-images-multi-stage-builds-and-secrets).

**Start with an empty environment.** Pass no environment variables by default, then add only what the task needs. Never inherit the parent environment. The PraisonAI advisory shows how one line, `os.environ.copy()`, turns code execution into credential theft.

**Deny network access by default.** Most data-analysis code needs no network. If it does, allow specific hosts at the network layer. The Flowise exfiltration path depended on the code being able to make outbound HTTP requests. Block cloud metadata endpoints and private address ranges explicitly.

**Bound resources.** Set CPU, memory, process count and wall-clock limits, and kill the sandbox after each run rather than reusing it across users or sessions.

**Prefer allowlists to blocklists.** If you cannot sandbox, do not execute arbitrary code. Restrict the model to a small, typed operation set (filter, group, sort with named columns) that your code interprets. That is less flexible, and much easier to reason about.

**Do not expose builders publicly.** Visual flow builders give authors code-execution power by design. Keep the builder and the prediction API behind authentication, and treat any public chat endpoint as reachable by attackers.

**Track framework advisories.** Agent frameworks move quickly and their security surface is large. Watch the GitHub Advisory Database for the packages you depend on, and enable dependency alerts on the repositories that pin them.

## A quick check for your own stack

Search your codebase and dependencies for `eval(`, `exec(`, `subprocess` and Pyodide calls that receive model output. For each hit, answer four questions: does it run outside the host process, does it start with an empty environment, is the network blocked, and is the sandbox discarded after use? Any "no" is a finding worth fixing before the next advisory names your project. Secrets the sandbox never receives cannot leak, which is the case made in [Stop giving AI agents your production keys](/blog/stop-giving-ai-agents-production-keys).
