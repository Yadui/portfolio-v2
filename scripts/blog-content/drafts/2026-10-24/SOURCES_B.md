# Sources B (drafts 4 and 5), reviewed 2026-10-24

## Post 4: ai-agent-kill-switch-egress-gateway

- NIST news release, Key Practices for Incident Readiness and Response in Super Intelligence Training and Evaluation. https://www.nist.gov/news-events/news/2026/10/key-practices-incident-readiness-and-response-super-intelligence-training (accessed 2026-10-24). Supports: publishing agencies (NIST CAISSI, NSA SISC, CISA), ten practices in five stages, SI control incident framing, grounding in NIST SP 800-61r3.
- Joint PDF, PP-26-4396 Ver 1.0, dated 2026-10-16. https://media.defense.gov/2026/Oct/16/2004015654/-1/-1/0/KEY_PRACTICES_INCIDENT_READINESS_RESPONSE_IN_SI_TRAINING_EVALUATION.PDF (accessed 2026-10-24). Supports: definitions (SI agent, control incident, uninstructed, near-miss), audience statement, practices 1.5 (allowlist + monitored gateway), 1.7, 1.9, 5.1, 5.3 (tamper-resistant logs, reliable timestamps), 6.2 (automatic shutdown), 6.4 (revoke credentials, rebuild).
- CISA resource page. https://www.cisa.gov/resources-tools/resources/key-practices-incident-readiness-and-response-super-intelligence-training-and-evaluation (accessed 2026-10-24). Supports: summary of scope.
- NSA press release. https://www.nsa.gov/Press-Room/Press-Releases-Statements/Press-Release-View/Article/4629045/nsa-and-others-advise-organizations-with-practices-to-prepare-for-and-manage-su (accessed 2026-10-24). Supports: NSA participation.
- Microsoft Learn, Azure Firewall overview. https://learn.microsoft.com/en-us/azure/firewall/overview (accessed 2026-10-24). Supports: stateful firewall, north-south inspection, Standard L3-L7 filtering and threat intel.
- Microsoft Learn, Azure NAT Gateway overview. https://learn.microsoft.com/en-us/azure/nat-gateway/nat-overview (accessed 2026-10-24). Supports: private subnets prevent default outbound IPs; explicit outbound method.
- Microsoft Learn, Revoke user access in an emergency. https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access (accessed 2026-10-24). Supports: block sign-in, revoke refresh tokens.

Unverified or interpretive for post 4:
- Applying the guidance to ordinary deployers is an interpretation; the PDF says the practices "may also apply to deployers".
- PDF practice 5.3 extraction truncated after "sufficient to reconstruct".
- Statement that refresh-token revocation does not instantly invalidate issued access tokens is general Entra behavior; confirm wording on the Learn page before publication.
- Secondary coverage (cybersecuritynews.com, govinfosecurity.com, complexdiscovery.com) seen but not cited.

## Post 5: litellm-1-107-0-incident-response-ai-gateways

- Microsoft Security Blog, 2026-10-23. https://www.microsoft.com/en-us/security/blog/2026/10/23/inside-the-litellm-1-107-0-supply-chain-compromise-credential-theft-through-python-startup-hooks/ (accessed 2026-10-24). Supports: startup files and placement, import-free execution, Windows pip example, collector targets, encryption and defanged collector domain, `.pc_e_` staging, unconfirmed remote loader, full mitigation list (do not run Python, rebuild, rotate from clean machine, revoke sessions, hash-pinned locks, digests, mirrors, egress).
- LiteLLM attack-chain post. https://docs.litellm.ai/blog/security-incident-oct-21-2026-attack-chain (accessed 2026-10-24). Supports: May 27 master key commit and non-revocation, unscoped owner GitHub CLI token, Oct 10 extraction and CI secret exfiltration, Oct 21 branch-protection override, lookalike fork, relaxed approval rule, run deletions, containment times, about two hours live.
- LiteLLM incident post. https://docs.litellm.ai/blog/security-incident-oct-21-2026 (accessed 2026-10-24). Supports: affected artifacts and tags, earlier versions safe, enterprise release unaffected. Status was "investigation in progress" at access.
- Python docs, site module. https://docs.python.org/3/library/site.html (accessed 2026-10-24). Supports: .pth import lines and sitecustomize run at startup.
- pip secure installs. https://pip.pypa.io/en/stable/topics/secure-installs/ (accessed 2026-10-24). Supports: hash-checking mode.
- Microsoft Learn, Entra revoke access; Azure outbound egress design guide (linked from the Microsoft blog). Accessed 2026-10-24.

Unverified for post 5:
- Check Point "Aokigahara" infostealer (reported 2026-10-23): no primary Check Point URL confirmed. Omitted from the draft.
- Exact image digests and tag list: copy from LiteLLM incident post at publication time.
- Microsoft notes it has not independently determined initial access; the draft attributes the chain to LiteLLM.
