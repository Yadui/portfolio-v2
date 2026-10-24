---
status: "NOT APPROVED FOR PUBLICATION"
proposed_slug: "railway-emudhra-sbi-breaches-explained"
proposed_title: "Railway, eMudhra and SBI breaches explained"
proposed_excerpt: "The Railway breach, eMudhra's broken certificates and SBI's data loss explained in plain language: what is confirmed and what to do now."
proposed_tags: [Railway, eMudhra, Data Breach, Secrets Management, Cybersecurity]
proposed_cover: "/blog-covers/ai-security-2026-10-24/india-attacks.webp"
proposed_cover_alt: "Parallel railway tracks crossing at a switch in low evening light, photographed by Mihai Lazăr."
proposed_date: "2026-10-24"
source_review_date: "2026-10-24"
distinct_intent: "Plain-language explainer for non-experts on three October 2026 security incidents (Railway, eMudhra, SBI), separating confirmed facts from reports, with practical checklists."
verified_sources:
  - url: "https://blog.railway.com/p/security-disclosure-wednesday-october-21st"
    accessed: "2026-10-24"
  - url: "https://blog.railway.com/p/preliminary-report-october-security-incident"
    accessed: "2026-10-24"
  - url: "https://status.railway.com/incident/QH8L8B3E"
    accessed: "2026-10-24"
  - url: "https://thehackernews.com/2026/10/railway-says-intruder-may-have-accessed.html"
    accessed: "2026-10-24"
  - url: "https://bugzilla.mozilla.org/show_bug.cgi?id=2083449"
    accessed: "2026-10-24"
  - url: "https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates"
    accessed: "2026-10-24"
  - url: "https://blog.google/security/protecting-chrome-and-android-users-from-compromised-emudhra-intermediate-ca-certificates"
    accessed: "2026-10-24"
  - url: "https://natlawreview.com/press-releases/emudhra-statement-distrust-select-global-tls-intermediate-and-one-root-ca"
    accessed: "2026-10-24"
  - url: "https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-emudhra-info-ScS22A1r"
    accessed: "2026-10-24"
  - url: "https://internetfreedom.in/sbi-told-investors-its-data-breach-doesnt-matter-what-about-the-3-897-customers-it-affected"
    accessed: "2026-10-24"
review_notes:
  - "Railway: facts come from Railway's own disclosure (2026-10-21), preliminary report (dated 2026-10-22) and status incident QH8L8B3E (resolved 2026-10-23 22:06 UTC), all fetched in full on 2026-10-24. The Hacker News (2026-10-22) is secondary."
  - "Railway investigation is ongoing; the report is explicitly preliminary. Railway has not ruled out access to user source code and has not disclosed the exploit details. Re-check for a final report before publication."
  - "Railway figures '1.85% of workspaces, about 100,000' are Railway's own upper bound, quoted as such."
  - "Crypto wallet draining is secondary-only (security researcher Taylor Monahan via THN); labelled as reported."
  - "Railway's report names 'SpaceXSI' among vendors; copied as written, not cited in body."
  - "eMudhra and SBI research used search-engine extracts on 2026-10-24; re-check quoted figures against primary pages before publication."
  - "CERT-In advisory of 2026-10-21 on eMudhra: primary URL not located. Content from secondary reports. Labelled as reported."
  - "eMudhra exit from global TLS business (2026-10-22 exchange filing): filing not located; cited via cybersecuritynews.com. Labelled as reported."
  - "eMudhra's statement is an EIN Presswire release mirrored on natlawreview.com."
  - "SBI: Regulation 30 filing not opened; facts come from IFF's write-up, which quotes and links the filing. The group name claimed in social posts is unverified and omitted."
  - "SEO pass 2026-10-24: retitled for search intent, excerpt and opening paragraph carry the primary keyword, internal links added. No new facts introduced."
---

## The short version

Three security stories broke in the second half of October 2026, starting with the Railway breach. Railway, a US cloud hosting platform used by many developers and startups, says an attacker got into its internal systems and decrypted some customers' stored secrets. eMudhra, an Indian company that vouches for websites' identities, had broken keys that forced browsers to block part of its business. And the State Bank of India disclosed that customer records had surfaced on the dark web. Here is what is confirmed, what is only reported, and what to do.

## Railway: when your hosting company leaks your keys

**What a PaaS is.** Railway is a platform as a service, or PaaS. Instead of renting and managing your own servers, you hand Railway your code and it builds, runs and scales the app for you. It is like renting a fully serviced flat instead of building a house.

**Why a platform breach hits customers.** Apps need secrets to work: database passwords, payment keys, AI service keys, GitHub tokens. Good practice says never write these into your code, so you store them as environment variables, small named settings the platform injects into your app when it runs. That keeps secrets out of your code, but it means the platform holds all of them. If the platform's own systems are breached, the attacker does not need to hack each customer. The keys are in one place.

**What Railway says happened.** In its [security disclosure of October 21](https://blog.railway.com/p/security-disclosure-wednesday-october-21st), Railway said it detected "anomalous activity involving systems that store customer environment variables" and that an unauthorized party "may have accessed encrypted environment variables and, for some of them, obtained the decrypted contents." All deployments were paused while it investigated.

Its [preliminary report](https://blog.railway.com/p/preliminary-report-october-security-incident), dated October 22, adds detail. Railway says:

- The attack ran from October 20 at 13:58 UTC to October 22 at 03:32 UTC, when it confirmed the attacker no longer had access.
- The attacker first escalated privileges in the build system, then got credentials for Railway's CI environment, and used them to decrypt a subset of encrypted environment variables.
- At most 1.85% of workspaces, about 100,000, had some environment variables potentially compromised. Railway cannot tell exactly which variables were decrypted.
- The attacker appeared to be hunting AI provider API keys, likely to run "distillation attacks" (using stolen access to a commercial AI model to train a copy).
- Railway user accounts were not logged into. Running apps stayed online. Railway is "not ruling out" access to user source code and will confirm in its final report.
- On October 21 it asked vendors including GitHub, GitLab, Anthropic, OpenAI, OpenRouter and Stripe to revoke potentially exposed keys, in some cases all keys stored on the platform. So a revocation email from a vendor does not by itself mean your key was stolen.
- It rotated storage bucket credentials, invalidated all Railway API tokens and reinstalled its GitHub App connections.

The [status page incident](https://status.railway.com/incident/QH8L8B3E) was marked resolved on October 23 at 22:06 UTC. Railway says it has emailed workspaces it judges higher risk, mainly those with many variables or many AI keys, but adds that other workspaces "are not confirmed safe from compromise." New signups were still paused at that time.

**What is only reported.** [The Hacker News](https://thehackernews.com/2026/10/railway-says-intruder-may-have-accessed.html) cites security researcher Taylor Monahan saying the attackers drained cryptocurrency wallets whose private keys were stored on Railway, with the first theft about two hours before the public disclosure. Railway has not confirmed this.

**Checklist for Railway users.** Railway recommends rotation for everyone who signed up before October 21, even without an email.

- Rotate every secret in your environment variables: database passwords, API keys for AI, payment and email services, and private registry credentials. Create new values at each provider, revoke the old ones there, update Railway, then redeploy.
- Change database passwords, and remove public network access to databases if you do not need it, as Railway advises.
- Check usage and billing at your AI, payment and cloud providers for activity since October 20. Unexpected AI spend is the clearest sign of a stolen key.
- Review your GitHub audit log and authorized apps, and the audit logs of any container registry such as Docker Hub.
- Recreate Railway CLI and CI tokens, since old ones were invalidated, and reconnect GitHub if deploys fail.
- Check deploy logs and service logs for unfamiliar deployments or requests.
- If any wallet private key ever lived in an environment variable, move the funds to a fresh wallet now.
- Turn on two-factor authentication for Railway, GitHub and every provider whose keys you rotated.

If you deploy elsewhere, the same pattern applies; see [how to handle deployment secrets with GitHub Actions and Azure App Service](/blog/automating-azure-app-service-deployments-with-github-actions-and-secure-secrets).

## eMudhra: when a website's "ID checker" fails

**What a certificate authority is.** The padlock in your browser means it checked a digital ID card called a certificate. Certificate authorities (CAs) issue those cards. They usually sign through "intermediate" certificates, like branch offices, each with a private key that must be impossible to guess. Whoever holds that key can issue IDs the whole internet will believe.

**What happened.** On October 17, a researcher reported to Mozilla that eight eMudhra intermediate certificates had private keys anyone could work out from the public certificate. Mozilla's ticket, [Bugzilla 2083449](https://bugzilla.mozilla.org/show_bug.cgi?id=2083449), says the problem "enables even technically unsophisticated individuals to easily recover the private keys" and records that eMudhra revoked them on October 18. This was a broken setup rather than a break-in; [Cisco's advisory](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-emudhra-info-ScS22A1r) traces it to a key ceremony in April 2025.

**How browsers reacted.** [Mozilla](https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates) says it blocked the certificates in under three hours and is removing the parent root. [Google](https://blog.google/security/protecting-chrome-and-android-users-from-compromised-emudhra-intermediate-ca-certificates) blocked them in Chrome and Android and found no website certificates from these intermediates in public Certificate Transparency logs. There is no public evidence of abuse against modern browsers.

**What eMudhra says.** Its [October 21 statement](https://natlawreview.com/press-releases/emudhra-statement-distrust-select-global-tls-intermediate-and-one-root-ca) says Indian Digital Signature Certificate and eSign services are unaffected and there was "no infrastructure compromise or data breach". The company reportedly told exchanges on October 22 that it will leave the global SSL/TLS business ([cybersecuritynews.com](https://cybersecuritynews.com/emudhra-exits-global-ssl-tls-certificate); filing not seen by us). A CERT-In advisory reportedly said the same about DSC and eSign (primary advisory not located). Older devices, servers and container images with their own trust lists may still trust the bad certificates until updated.

## SBI: customer records on the dark web

According to the [Internet Freedom Foundation's analysis](https://internetfreedom.in/sbi-told-investors-its-data-breach-doesnt-matter-what-about-the-3-897-customers-it-affected) of SBI's filing, the bank told the stock exchanges on October 21 of an "Incident involving Data Loss". It was alerted on October 16. Of about 3.75 lakh records found on the dark web, SBI identified 3,897 customer records with names, mobile numbers, dates of birth, addresses, customer IDs and loan details. How the data got out, and by whom, is not public. IFF's criticism is that the filing addressed investors without saying whether customers were told. The practical risk is convincing scam calls from someone who knows your details.

## What everyone else should do

- Keep browsers, phones and laptops updated. That is how the eMudhra fix reaches you.
- Never click past a certificate warning on banking or government sites.
- Treat calls that quote your personal details as suspicious. Banks will not ask for OTPs or PINs. In India, report fraud at 1930 or cybercrime.gov.in.
- If you run servers, rebuild container images and update runtimes so revoked certificates drop out, and never disable certificate checks in code.

## The bigger lesson

The Railway case shows the trade-off of convenience: putting every secret on one platform means one breach reaches thousands of apps. The defence is not avoiding platforms but making secrets cheap to replace. Use short-lived, narrowly scoped keys (the approach in [Stop giving AI agents your production keys](/blog/stop-giving-ai-agents-production-keys)), set spending limits at AI providers, and know how you would rotate everything in an afternoon. The same week, the [LiteLLM 1.107.0 compromise](/blog/litellm-1-107-0-incident-response-ai-gateways) made the case again from the supply-chain side. The eMudhra and SBI stories make the same point from other angles: quiet failures, then fast, clear response, matter more than headlines.

## FAQ

### Was my Railway app affected?

Railway says at most 1.85% of workspaces, about 100,000, had some environment variables potentially compromised, and it cannot tell exactly which. It recommends rotation for everyone who signed up before October 21, even without an email.

### Do I need to do anything about eMudhra certificates?

Keep browsers, phones and servers updated. Mozilla and Google blocked the certificates, and there is no public evidence of abuse against modern browsers, but older devices and container images may still trust them until updated.

### What data was exposed in the SBI incident?

According to IFF's analysis of SBI's filing, 3,897 customer records with names, mobile numbers, dates of birth, addresses, customer IDs and loan details. The main risk is convincing scam calls.
