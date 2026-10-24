---
status: "NOT APPROVED FOR PUBLICATION"
proposed_slug: "litellm-1-107-0-incident-response-ai-gateways"
proposed_title: "LiteLLM 1.107.0 compromise: incident response guide"
proposed_excerpt: "The LiteLLM 1.107.0 compromise ran at Python startup. How to investigate safely, rebuild, rotate keys and close the gaps the attack chain exposed."
proposed_tags: [LiteLLM, Supply Chain, Incident Response, AI Gateways, Python]
proposed_cover: "/blog-covers/ai-security-2026-10-24/litellm-supply-chain.webp"
proposed_cover_alt: "Metal chain links lit in blue against a dark background, photographed by Tao Yuan."
proposed_date: "2026-10-23"
source_review_date: "2026-10-24"
distinct_intent: "Defensive response guide for teams running AI gateways, built on the vendor and Microsoft analyses. Not news coverage."
verified_sources:
  - url: "https://www.microsoft.com/en-us/security/blog/2026/10/23/inside-the-litellm-1-107-0-supply-chain-compromise-credential-theft-through-python-startup-hooks/"
    accessed: "2026-10-24"
  - url: "https://docs.litellm.ai/blog/security-incident-oct-21-2026-attack-chain"
    accessed: "2026-10-24"
  - url: "https://docs.litellm.ai/blog/security-incident-oct-21-2026"
    accessed: "2026-10-24"
  - url: "https://docs.python.org/3/library/site.html"
    accessed: "2026-10-24"
  - url: "https://pip.pypa.io/en/stable/topics/secure-installs/"
    accessed: "2026-10-24"
  - url: "https://learn.microsoft.com/entra/identity/users/users-revoke-access"
    accessed: "2026-10-24"
  - url: "https://learn.microsoft.com/azure/networking/design-guide/outbound-egress?pivots=lift-shift"
    accessed: "2026-10-24"
review_notes:
  - "Facts about the payload come from Microsoft's analysis; facts about the attack chain and timeline come from the LiteLLM attack-chain post, which LiteLLM describes as canonical where it disagrees with earlier status updates."
  - "The LiteLLM incident post was still marked 'investigation in progress' (last updated 2026-10-21 16:00 UTC) at extraction. Affected tag list and digests must be copied from that post at publication time, not from this draft."
  - "No IOCs are reproduced beyond file names and the collector domain, which Microsoft publishes defanged. Do not re-fang."
  - "Python site docs and pip secure-installs pages cited from stable documentation; content checked against known behavior, not re-extracted line by line on 2026-10-24."
  - "Check Point 'Aokigahara' infostealer report (reported 2026-10-23) was NOT verified at a primary URL and is omitted from the body."
  - "SEO pass 2026-10-24: retitled for search intent, excerpt and opening paragraph carry the primary keyword, internal links added. No new facts introduced."
---

## What happened

The LiteLLM 1.107.0 compromise began on October 21, 2026, when a compromised `litellm==1.107.0` was published to PyPI and to LiteLLM's container registries. LiteLLM's [incident post](https://docs.litellm.ai/blog/security-incident-oct-21-2026) states that earlier versions are safe, that the affected releases were pulled, and that customers on the private enterprise release were not affected. Its [attack-chain post](https://docs.litellm.ai/blog/security-incident-oct-21-2026-attack-chain) says the artifacts were live for about two hours: PyPI releases were frozen by 13:23 UTC and Docker images removed by 14:20 UTC.

Two hours is enough. LiteLLM is commonly deployed as a gateway between applications and model providers, and [Microsoft's analysis](https://www.microsoft.com/en-us/security/blog/2026/10/23/inside-the-litellm-1-107-0-supply-chain-compromise-credential-theft-through-python-startup-hooks/) notes that in that position it may hold model-provider API keys, database connection strings, workload identities and routing configuration. The same package also sits on developer laptops and build agents. If you run an AI gateway, treat this as a template for the next incident, whichever package it is.

## Why "I never imported it" is not a defence

The malicious wheel shipped `cook.pth`, `cook.py` and `sitecustomize.py` under its `purelib` data directory. On install, Microsoft reports, these files landed in the environment's library directory, outside the `litellm` package folder.

That location matters because of how Python starts. The [`site` module documentation](https://docs.python.org/3/library/site.html) describes how lines in `.pth` files that begin with `import` are executed during interpreter initialization, and how Python then attempts to import a `sitecustomize` module. Microsoft found that `cook.pth` contained a single line, `import cook`, which launched a credential collector in a daemon thread. `sitecustomize.py` carried a separate Unix-oriented loader designed to fetch and execute additional Python code; Microsoft says remote retrieval through that path was not confirmed.

The consequence is stated plainly in the analysis: an application did not need to import LiteLLM for the payload to run. Starting Python in an affected environment could be enough. In one Windows example, a routine Python invocation to install an unrelated dependency activated the collector. And because the startup files lived outside the package folder, deleting `litellm` could leave them behind.

## What the collector went after

Microsoft lists the targets the recovered code was designed to read: AI assistant, IDE and MCP configuration; Git credentials and package-manager configuration; AWS, Azure CLI and Google Cloud credential caches; Kubernetes service-account files and Docker configuration; browser credential data and shell histories; process environments, including other processes' environments readable through procfs on Linux; SSH, GPG and TLS material. On a proxy host, a separate module could use Prisma to read selected fields from two LiteLLM database tables. Microsoft is careful to note that a target appearing in the code does not establish successful access.

Collected data was encrypted with a per-run AES key wrapped by an embedded RSA key and posted to `hxxp://www[.]litellm[.]dev/healthcheck`. Note the lookalike domain.

## Response, in order

Microsoft's guidance and LiteLLM's posts agree on the shape of the response. Here it is as a runbook.

1. Find every copy. Search installed environments, `pip` and `uv` caches, internal mirrors, lock files, build outputs and container images for 1.107.0. LiteLLM's incident post lists affected image tags, including floating ones such as `latest`, and digests. Mutable tags mean "we pinned to latest" is not an answer; you need to know which digest you actually pulled and when.
2. Do not run Python to check. Microsoft is explicit: do not run `python`, `pip` or anything that invokes the affected interpreter during evidence collection. Each start can re-run the payload. Isolate the host, stop Python processes where safe, prevent automation from restarting them, and inspect the filesystem with trusted tools from a known-clean machine.
3. Correlate before declaring compromise. Combine file hashes, Python process ancestry, `.pc_e_` temporary staging directories, connections to the collector domain, and subsequent use of the identities involved. Package presence alone is not a verdict.
4. Rebuild, do not clean. Rebuild environments and images from verified artifacts. Confirm `cook.pth`, `cook.py` and `sitecustomize.py` are gone from the library path. Microsoft states that removing the package or a release tag is not sufficient recovery.
5. Rotate from a clean machine. Rotate everything the affected identity could reach: model-provider keys, cloud and workload credentials, CI/CD secrets, source-control and registry tokens, SSH and GPG keys, AI coding-tool tokens, and on proxy hosts the stored provider credentials and `DATABASE_URL`. Rotating from a compromised workstation hands the new secret to the same collector. The same rotate-from-clean discipline applied to the [Railway breach the same week](/blog/railway-emudhra-sbi-breaches-explained). Revoke sessions as well; Microsoft points to [Entra emergency revocation](https://learn.microsoft.com/entra/identity/users/users-revoke-access) because rotating a password does not immediately invalidate every active token.

## Hardening that would have narrowed the blast radius

Hash-pinned lock files. pip's [secure installs guide](https://pip.pypa.io/en/stable/topics/secure-installs/) describes hash-checking mode, in which every requirement must carry a hash and installation fails on a mismatch. A pinned hash for 1.107.0 would not exist in your lock file unless someone added it, so an unreviewed upgrade fails closed.

Image digests, not tags. Microsoft recommends container digests because they identify immutable content. A deployment that references `@sha256:` does not silently pick up a new `latest`.

Gated internal mirrors. Admit packages to your mirror only after review, with a delay for brand-new releases. The window here was about two hours.

Egress control. Microsoft's guidance says developer workstations, build agents, test systems, containers and AI gateway hosts should not have unrestricted outbound HTTP unless required, and links to Azure's [outbound egress design guide](https://learn.microsoft.com/azure/networking/design-guide/outbound-egress?pivots=lift-shift). A gateway host needs to reach model providers and its database. It does not need to reach an arbitrary domain that merely looks like the vendor's.

Keep secrets out of the gateway's process environment where possible. The collector read environment variables, including other processes' on Linux. Secrets fetched at use time from a vault, with short lifetimes, are worth less to a collector than long-lived keys sitting in `env`.

## The lesson upstream: one unrevoked key, one unscoped token

LiteLLM's attack-chain post is unusually candid, and the root causes are ones every team running agents should check for.

On May 27, 2026, a configuration file committed to a public repository inadvertently contained the master key to a deployment of LiteLLM's internal Agent Platform. The commit was force-pushed over and the key was identified as needing revocation. In LiteLLM's words, key revocation did not occur.

That platform let self-hosted agents open pull requests, so it held a GitHub token. The post says the token was not associated with a service account and was not scoped down: it was a GitHub CLI OAuth token belonging to the organization owner. On October 10, the attacker used the master key against the platform's API, which returned that token. With owner access, they ran throwaway CI workflows that posted repository secrets to an external endpoint, collecting tokens for two more maintainers. On October 21 they used the owner token to override branch protection on the release repository and repoint it to a lookalike fork, used one maintainer token to approve the production gate, and another to delete the run records. LiteLLM notes the release approval rule had been relaxed that week to allow any two engineers to approve.

Three checks follow for any team running agents with repository access:

- An exposed key is revoked, not just hidden. Force-pushing history does not un-publish a secret.
- Agents get their own scoped identity. An agent platform should never hold a human owner's token.
- CI secrets are reachable only from protected branches and approved workflows, so a new branch cannot run a job that prints them. Related: [why persist-credentials in GitHub Actions matters](/blog/github-actions-persist-credentials-security) and [Stop giving AI agents your production keys](/blog/stop-giving-ai-agents-production-keys).

## FAQ

### Was I affected if my application never imported LiteLLM?

Possibly. Microsoft found the payload ran from `.pth` and `sitecustomize.py` startup files, so starting Python in an affected environment could be enough.

### Is uninstalling litellm 1.107.0 enough?

No. The startup files lived outside the package folder, and Microsoft states that removing the package or a release tag is not sufficient recovery. Rebuild from verified artifacts.

### Which secrets should I rotate?

Everything the affected identity could reach, including model-provider keys, cloud and CI/CD credentials, source-control tokens, SSH and GPG keys, and on proxy hosts the stored provider credentials and `DATABASE_URL`. Rotate from a clean machine and revoke sessions.

### How long were the malicious releases available?

About two hours, according to LiteLLM's attack-chain post. PyPI releases were frozen by 13:23 UTC and Docker images removed by 14:20 UTC.

LiteLLM says it will share process changes separately. Until then, the attack-chain post is the clearest public record of how this happened, and it is worth reading in full.
