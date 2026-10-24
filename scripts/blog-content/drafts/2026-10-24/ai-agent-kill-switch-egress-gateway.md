---
status: "NOT APPROVED FOR PUBLICATION"
proposed_slug: "ai-agent-kill-switch-egress-gateway"
proposed_title: "AI agent kill switches: NIST, NSA and CISA guidance"
proposed_excerpt: "NIST, NSA and CISA practices call for an egress gateway, automatic shutdown and credential revocation. How to build an AI agent kill switch."
proposed_tags: [AI Agents, Security, Incident Response, Azure, Networking]
proposed_cover: "/blog-covers/ai-security-2026-10-24/kill-switch-egress.webp"
proposed_cover_alt: "Bundle of glowing blue fibre-optic strands in a dark room, photographed by Denny Müller."
proposed_date: "2026-10-20"
source_review_date: "2026-10-24"
distinct_intent: "Implementation guide for containment controls on agent runs, anchored to the October 16, 2026 joint guidance. Not a policy summary."
verified_sources:
  - url: "https://www.nist.gov/news-events/news/2026/10/key-practices-incident-readiness-and-response-super-intelligence-training"
    accessed: "2026-10-24"
  - url: "https://media.defense.gov/2026/Oct/16/2004015654/-1/-1/0/KEY_PRACTICES_INCIDENT_READINESS_RESPONSE_IN_SI_TRAINING_EVALUATION.PDF"
    accessed: "2026-10-24"
  - url: "https://www.cisa.gov/resources-tools/resources/key-practices-incident-readiness-and-response-super-intelligence-training-and-evaluation"
    accessed: "2026-10-24"
  - url: "https://www.nsa.gov/Press-Room/Press-Releases-Statements/Press-Release-View/Article/4629045/nsa-and-others-advise-organizations-with-practices-to-prepare-for-and-manage-su"
    accessed: "2026-10-24"
  - url: "https://learn.microsoft.com/en-us/azure/firewall/overview"
    accessed: "2026-10-24"
  - url: "https://learn.microsoft.com/en-us/azure/nat-gateway/nat-overview"
    accessed: "2026-10-24"
  - url: "https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access"
    accessed: "2026-10-24"
review_notes:
  - "Primary publication located on media.defense.gov (PDF, PP-26-4396, Ver 1.0), with NIST, CISA and NSA landing pages. Practice numbers quoted (1.5, 1.7, 5.3, 6.2, 6.4) were read from the PDF text extraction on 2026-10-24; re-check against the PDF before publication."
  - "The guidance is written for organizations training or evaluating highly capable 'SI' agents and says it may also apply to deployers. The post applies it to ordinary agent deployments as an interpretation, and says so."
  - "Implementation patterns (egress proxy, per-run credentials, cancellation tokens) are the author's recommendations, not requirements from the guidance or guarantees of any Azure service. No deployment or measurement was performed."
  - "Practice 5.3 text was truncated in extraction after 'sufficient to reconstruct'; the post paraphrases only the verified portion."
  - "SEO pass 2026-10-24: retitled for search intent, excerpt and opening paragraph carry the primary keyword, internal links added. No new facts introduced."
---

## The guidance in one sentence

On October 16, 2026, NIST's Center for Advancing Innovation and Standards for Super Intelligence, the NSA Super Intelligence Security Center and CISA published [Key Practices for Incident Readiness and Response in Super Intelligence Training and Evaluation](https://www.nist.gov/news-events/news/2026/10/key-practices-incident-readiness-and-response-super-intelligence-training). It sets out ten voluntary practices across five stages: prepare, detect, respond, recover and report. Read as a deployer, they describe an AI agent kill switch built from an egress gateway, run-scoped credentials and shutdown that does not depend on the agent. The [CISA summary](https://www.cisa.gov/resources-tools/resources/key-practices-incident-readiness-and-response-super-intelligence-training-and-evaluation) and the [NSA release](https://www.nsa.gov/Press-Room/Press-Releases-Statements/Press-Release-View/Article/4629045/nsa-and-others-advise-organizations-with-practices-to-prepare-for-and-manage-su) point to the same document.

The central term is an "SI control incident". The [PDF](https://media.defense.gov/2026/Oct/16/2004015654/-1/-1/0/KEY_PRACTICES_INCIDENT_READINESS_RESPONSE_IN_SI_TRAINING_EVALUATION.PDF) defines it as an occurrence in which one or more agents take significant uninstructed actions that compromise the policies, controls or security measures an operator uses to scope the task or keep human oversight. The document notes that actions caused by prompt injection or a deliberately backdoored model count as instructed, so they fall under ordinary security incident handling instead.

The stated audience is organizations training or evaluating highly capable agents on long-horizon tasks with limited supervision. The document says the practices may also apply to deployers. This post reads them as a deployer would: someone running a tool-using agent against real systems and wanting a way to stop it.

## Four controls worth building first

Several practices translate directly into infrastructure. Quoted from the PDF:

- Practice 1.5: limit agent network access, via a strict allowlist where possible, and route any required network access through a monitored gateway.
- Practice 1.7: build mechanisms to rapidly block, contain or terminate agent activity if an incident or near-miss is detected.
- Practice 6.2: automatically shut down impacted agent trajectories on detection of a control failure or an in-progress incident.
- Practice 6.4: revoke credentials under the organization's control that were accessed during the incident, and rebuild environments that may have been compromised.
- Practice 5.3: retain tamper-resistant logs with reliable timestamps.

None of these is new to security engineering. What changes for agents is the unit of control. The thing you need to stop is a run, not a host or a user, so each control should be keyed to a run identifier.

## Egress: one way out, and it is watched

An agent that can reach any address on the internet can exfiltrate data, call an unexpected API, or fetch code you never reviewed. The fix is architectural. Put agent workloads in a subnet with no default route to the internet, then give them exactly one path out.

On Azure, the [NAT Gateway overview](https://learn.microsoft.com/en-us/azure/nat-gateway/nat-overview) recommends private subnets so that default outbound IPs are not created, with an explicit method of outbound connectivity instead. That gives you a deliberate choke point. [Azure Firewall](https://learn.microsoft.com/en-us/azure/firewall/overview) is a stateful firewall service that inspects north-south traffic, and its Standard tier adds L3 to L7 filtering and threat intelligence alerts for known malicious addresses and domains. If the agent also reaches Azure PaaS services privately, plan DNS carefully; see [the private endpoint DNS gotchas](/blog/private-endpoints-on-azure-the-dns-gotchas-nobody-warns-you-about). Route the agent subnet's traffic through it, default deny, and allow only the fully qualified domain names the task requires: your model endpoint, a package mirror you control, and the specific APIs the tools call.

Two refinements make the gateway useful during an incident rather than only after one:

1. Tag requests with the run. If agent tools go through an application-level HTTP proxy before the firewall, have the proxy require a run identifier header and log it alongside destination, method, byte counts and decision. A firewall log tells you a subnet talked to a domain. A proxy log tells you which run did.
2. Make the allowlist per run, not per fleet. A run that summarizes tickets does not need the same destinations as a run that opens pull requests. Issue the allowlist with the run and let the proxy reject anything outside it. Rejections are useful signals in their own right, because the guidance asks operators to treat near-misses as findings.

Do not rely on the agent's own tool wrapper as the boundary. If the agent can run a shell, it can bypass a wrapper. The network path is the boundary.

## Credentials that belong to one run

Practice 6.4 is only practical if you know which credentials a run could touch. Shared long-lived keys make that question unanswerable.

Give each run its own short-lived credential, minted at start and scoped to the tools that run needs. Record the mapping from run identifier to credential identifiers in the run record. Then revocation becomes a lookup, not an investigation. The identity side of this is covered in [Stop giving AI agents your production keys](/blog/stop-giving-ai-agents-production-keys). For human or workload identities in Microsoft Entra ID, Microsoft documents how to [revoke access in an emergency](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access), including blocking new sign-ins and revoking refresh tokens. Read that page closely: revoking refresh tokens does not instantly invalidate every access token already issued, so short token lifetimes are what bound the window.

Keep model-provider keys out of the agent's environment entirely. Have the gateway or a broker hold them and inject them on the way out. A run that never sees a key cannot leak it.

## Shutdown that does not depend on the agent

A kill switch the agent can ignore is a suggestion. Build termination in layers, each independent of the one above:

1. Cooperative cancellation. The orchestrator checks a cancellation flag between steps and before every tool call. This is clean and preserves state, but it only works if the loop is healthy.
2. Policy denial at the gateway. Flipping the run's status to stopped causes the proxy to reject every subsequent request carrying that run identifier. This works even if the agent loop ignores the flag.
3. Credential revocation. Revoke the run's credentials so that anything which slipped past the proxy fails at the destination.
4. Workload termination. Kill the container or sandbox, and do not restart it from the same image until you know why it stopped.

Practice 6.2 asks for automatic shutdown on detection. Wire your detectors (out-of-allowlist requests, unexpected credential use, writes outside the task scope) to trigger layers 1 through 3 together, then page a human for layer 4 and the investigation. Practice 1.9 asks operators to test and red-team these controls before relying on them; a kill switch nobody has pulled in a drill is untested code.

## Logs the agent cannot edit

Practice 5.3 calls for tamper-resistant logs with reliable timestamps. Practice 5.1 lists what to preserve, including sandbox and network logs and rejected actions and tool calls. The simplest rule follows: the agent's runtime should have no write path to the logs about it. Ship proxy, firewall and orchestrator events to a separate store under a different identity, with retention locks if your platform supports them. Log the rejected calls too. They are often the most informative record of what the agent was trying to do.

## A minimal checklist

- Agent subnet has no default outbound route; all egress passes a monitored gateway with default deny.
- Every outbound request carries a run identifier and is logged with the decision.
- Each run gets short-lived, scoped credentials recorded against its identifier.
- Model and tool secrets are injected by a broker, not placed in the agent environment.
- Stopping a run triggers cancellation, gateway denial and credential revocation together.
- Logs are written to a store the agent identity cannot modify.
- The full shutdown path has been exercised in a drill.

These controls are cheaper to build before the first incident than during it, and they are useful for ordinary bugs as well as for the rare case of an agent acting outside its instructions.
