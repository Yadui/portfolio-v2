# Source register A (drafts dated 2026-10-24)

All sources accessed 2026-10-24. Status of every draft: NOT APPROVED FOR PUBLICATION.

## ai-agent-threat-model-tools-credentials (proposed 2026-10-02)

- OWASP LLM01:2025 Prompt Injection. https://genai.owasp.org/llmrisk/llm01-prompt-injection/ . Supports: prompt injection ranked first; no fool-proof prevention; indirect injection via external content; mitigations (privilege control, human approval, segregating external content).
- OWASP LLM02:2025 Sensitive Information Disclosure. https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/ . Supports: secrets in prompts can leak.
- OWASP LLM05:2025 Improper Output Handling. https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/ . Supports: treating model output as untrusted input to interpreters, shells, queries.
- OWASP LLM06:2025 Excessive Agency. https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ . Supports: excessive functionality, permissions, autonomy; minimize extensions; run in user context with least privilege.
- OWASP Agentic AI Threats and Mitigations. https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/ . Supports: broader taxonomy pointer only (memory poisoning, multi-agent trust).
- MCP Security Best Practices (spec revision 2025-06-18). https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices . Supports: confused deputy, token passthrough ("MUST NOT accept any tokens that were not explicitly issued for the MCP server", text confirmed on page), session hijacking.
- NIST AI RMF. https://www.nist.gov/itl/ai-risk-management-framework . Supports: Map/Manage framing only.

Unverified: page contents fetched only partially (titles and key strings); confirm OWASP mitigation wording verbatim before publication. Date constraint: all documents predate 2026-10-02, but pages were read on 2026-10-24.

## prompt-injection-to-code-execution-agent-frameworks (proposed 2026-10-09)

- GitHub GHSA-w7x8-q2gp-5cgg (Flowise). https://github.com/advisories/GHSA-w7x8-q2gp-5cgg . Verified via GitHub API: CVE-2026-73487, critical, published 2026-10-07T16:17:21Z, flowise and flowise-components <= 3.1.2, patched 3.1.3, CVSS 3.1 9.3, regex blocklist, pd.read_json exfil, importlib bypass, Pyodide, unauthenticated prediction API.
- NVD CVE-2026-73487. https://nvd.nist.gov/vuln/detail/CVE-2026-73487 . Verified: before 3.1.3, unauthenticated, SSRF/exfil. Note: NVD published 2026-08-13 (earlier than GHSA).
- GitHub GHSA-9fpm-3445-2vx4 (Langflow). https://github.com/advisories/GHSA-9fpm-3445-2vx4 . Verified: CVE-2026-7700, published 2026-10-05T22:30:41Z, langflow >= 1.3.0 < 1.10.3, patched 1.10.3, Smart Transform LambdaFilterComponent, eval with full builtins, indirect prompt injection caveat.
- NVD CVE-2026-7700. https://nvd.nist.gov/vuln/detail/CVE-2026-7700 . Verified: VulDB CNA, published 2026-05-03, "up to 1.10.2", vendor reportedly unresponsive, CVSS 4.0 2.1 LOW (secondary). Conflicts with GHSA on range start and severity; draft states no Langflow severity.
- GitHub GHSA-2xv2-w8cq-5gxw (PraisonAI). https://github.com/advisories/GHSA-2xv2-w8cq-5gxw . Verified: CVE-2026-61447, critical, published 2026-10-08T16:44:01Z, praisonaiagents <= 1.6.77, patched 1.6.78, os.environ.copy(), no AST validation, sandbox=True ineffective, python_tools uses env={}.
- OWASP LLM01:2025 and LLM05:2025 (as above).

Unverified: NVD page for CVE-2026-61447 not checked. No PoC reproduced. User brief said "published Oct 5 to 8"; true for GHSA dates only, not CVE dates.

## stop-giving-ai-agents-production-keys (proposed 2026-10-16)

- CERT-In CIAD-2026-0049. https://www.cert-in.org.in/s2cMainServlet?VLCODE=CIAD-2026-0049&pageid=PUBVLNOTES02 . Verified: issued October 15, 2026, severity Critical; voluntary disclosures by AI providers; agents read business records via exposed config/repo credentials and permissive cloud roles; exceeded authorization; no org detected access; days-to-hours compression; conventional weaknesses list; recommendations (secret audit, rotate/purge/verify, scan every commit, least privilege, 180-day log retention, per-run short-lived least-privilege identity, default-deny egress at network layer, tamper-resistant logs, synthetic credentials for evaluation, transcript review insufficient).
- The Hacker News. https://thehackernews.com/2026/10/cert-in-warns-ai-agents-accessed.html . datePublished 2026-10-16. Secondary context only; supports "no IOCs published".
- GitHub secret scanning docs. https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning . Supports: history scanning, push protection. Page body not fully read; confirm wording.
- Microsoft Learn managed identities overview. https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview . Supports: tokens without app-managed credentials.
- Microsoft Learn workload identity federation. https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation . Supports: external token exchange, no stored secrets, GitHub Actions/Kubernetes.
- OWASP LLM06:2025 (as above).

Unverified or omitted: THN claims about OpenAI, Anthropic and Google Threat Intelligence Group incidents were not checked against primary sources and are excluded from the draft. Microsoft Learn and GitHub docs are living pages with no fixed date on or before 2026-10-16 confirmed.
