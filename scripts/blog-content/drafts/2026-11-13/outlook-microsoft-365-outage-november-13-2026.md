---
status: "APPROVED FOR PUBLICATION BY USER"
proposed_slug: "outlook-microsoft-365-outage-november-13-2026"
proposed_title: "Outlook and Microsoft 365 outage: November 13 update"
proposed_excerpt: "Outlook and Microsoft 365 remain disrupted on November 13. What happened, which features are affected, and Microsoft's latest recovery update."
proposed_tags: [Microsoft 365, Outlook, Exchange Online, Service Reliability, Incident Response]
proposed_cover: "/blog-covers/ai-security-2026-10-24/agent-threat-model.webp"
proposed_cover_alt: "Server equipment in an industrial aisle, photographed by İsmail Enes Ayhan. Illustrative image, not Microsoft's affected infrastructure."
proposed_date: "2026-11-13"
source_review_date: "2026-11-13"
review_notes:
  - "User explicitly requested writing and publishing this article. Current-status wording is a timestamped snapshot, not an automatically updated live report. Recheck Microsoft immediately before publication."
  - "Primary status update: 2026-11-13 09:14:20 UTC. Public incident details captured in .local/outage-2026-11-13/status-details.json. No private tenant information used."
  - "News photographs were Reuters, Getty/Bloomberg or Shutterstock with no verified reuse permission. Reused the licensed Unsplash cover already shipped by this project and captured a complete Microsoft public-page screenshot instead. Screenshot displayed without cropping or overlaid text, under Microsoft's published screenshot-use conditions."
  - "Complete browser viewport screenshot captured at 2026-11-13 09:39:14 UTC, 1600 x 1000, showing the top of the public status page. No cropping, annotations or content alteration; lossless WebP conversion only. Microsoft's copyright guidance requires the credit used in the body."
  - "No confirmed recovery ETA or final root cause. Do not equate outage reports with affected users, or the earlier Teams incident with this incident."
verified_sources:
  - url: "https://status.cloud.microsoft/"
    accessed: "2026-11-13"
  - url: "https://status.cloud.microsoft/api/posts/mac"
    accessed: "2026-11-13"
  - url: "https://x.com/MSFT365Status/status/2120938282204688468"
    accessed: "2026-11-13"
  - url: "https://x.com/MSFT365Status/status/2120941584220827979"
    accessed: "2026-11-13"
  - url: "https://x.com/MSFT365Status/status/2120962673911181437"
    accessed: "2026-11-13"
  - url: "https://x.com/MSFT365Status/status/2121147053484937596"
    accessed: "2026-11-13"
  - url: "https://www.theguardian.com/technology/2026/nov/13/microsoft-outage-outlook-teams-word-excel-reports"
    accessed: "2026-11-13"
  - url: "https://www.microsoft.com/en-us/legal/intellectualproperty/permissions"
    accessed: "2026-11-13"
---

## The short version: Outlook is not the whole story

The Outlook and Microsoft 365 outage continued into November 13, 2026, after Microsoft began publicly investigating Exchange Online mailbox-access failures on November 12. If your inbox is inaccessible or your calendar has stopped cooperating today, this is not necessarily a problem with your laptop.

**Status snapshot: Microsoft's 09:14:20 UTC update on November 13 (14:44:20 IST) still reported service degradation. Recovery was ongoing, capacity had not returned to normal, and there was no confirmed recovery ETA in that update.** For anything later than this snapshot, check [Microsoft's public service-health page](https://status.cloud.microsoft/) rather than treating this article as a live dashboard.

The incident is broader than email, but "all of Microsoft is down" is not an accurate description either. The important distinction is which features depend on Exchange Online, Microsoft's hosted email service.

## What happened, and when?

Microsoft's [first public Exchange update](https://x.com/MSFT365Status/status/2120938282204688468), posted on November 12, described problems reaching mailboxes through multiple connection methods in the Americas. A [follow-up](https://x.com/MSFT365Status/status/2120941584220827979) said users in any region could be affected. For users in India, the disruption continued from late Thursday night into Friday's working day.

Microsoft tracks the Exchange issue as **EX1550543** and the broader Microsoft 365 incident as **MO1550821**. Those are useful identifiers when checking your tenant's service-health dashboard or opening a support case.

The most useful early explanation was Microsoft's clarification that the [load was not caused by an increase in traffic](https://x.com/MSFT365Status/status/2120962673911181437). Servers had unexpectedly become unavailable, leaving the remaining infrastructure under pressure.

Think of a road where several lanes suddenly close. Traffic can become overwhelming without any extra cars arriving. Bringing a lane back helps only if it can stay open when the queue reaches it. That is an analogy for the capacity problem, not a claim about Microsoft's final root cause.

The recovery has not been a clean, single restart. [The Guardian's reporting](https://www.theguardian.com/technology/2026/nov/13/microsoft-outage-outlook-teams-word-excel-reports) describes several mitigation attempts and continuing disruption. Microsoft's own latest update describes a cycle of draining traffic, restarting and repairing infrastructure, and gradually returning it to service. Earlier encouraging signs did not amount to an all-clear.

## What's affected, and what still works?

These distinctions come from [Microsoft's public incident details](https://status.cloud.microsoft/), not from assuming that every product mentioned in an outage headline has completely stopped working.

- **Outlook and Exchange Online:** mailbox access may fail in Outlook on the web, desktop Outlook through MAPI, Exchange ActiveSync and REST connections. Email delivery may also be delayed. Switching to a browser is therefore not a guaranteed workaround.
- **Microsoft Teams:** calendar, scheduling, invitations, meeting edits and some Exchange-dependent features can fail. Microsoft says most core functionality, including joining calls and meetings, group chats and channel messages, is not impacted. A working chat and a broken calendar can coexist.
- **Microsoft 365 Copilot:** chat may fail to load or respond, and experiences that need work email, calendar or file data may be affected.
- **SharePoint Online:** some external sharing and Exchange-dependent features are affected. Microsoft explicitly says direct access to files stored in SharePoint Online remains functional.
- **Administration and security:** some Microsoft 365 admin-center pages may not load. Specified Microsoft Defender for Office 365, Microsoft Defender XDR and Microsoft Purview scenarios are affected, including some security-management, investigation and protected-content operations. This is not a claim that every protection has been disabled.
- **Other connected services:** Microsoft lists issues involving Microsoft Graph, Planner, To Do, Intune, Power Apps, education features, Universal Print and sensitivity-label-related Power BI/Fabric operations. The Windows 365 impact it describes is specifically for Cloud PCs configured with Microsoft Purview Customer Key, not every Cloud PC.

This is why a short "up or down" label is inadequate. The same person might still open a SharePoint document and join a Teams call while being unable to load Outlook or send a calendar invite.

[![Microsoft's public Service Health Status page showing Microsoft 365 service degradation on November 13, 2026.](/blog-evidence/2026-11-13/microsoft-service-health.webp)](/blog-evidence/2026-11-13/microsoft-service-health.webp)

*Microsoft Service Health Status, captured November 13 at 09:39 UTC while the 09:14:20 UTC update was current. This unaltered browser screenshot shows the top of the page, not the entire incident notice. Click it for full size. Source: [Microsoft](https://status.cloud.microsoft/). Used with permission from Microsoft under its [published screenshot-use guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/permissions). This is an independent article, not a Microsoft announcement.*

## Current status: recovery, not resolution

At the 09:14:20 UTC checkpoint, Microsoft reported early stabilization but said service capacity was still below normal and health varied as traffic returned. Network and traffic-management work was continuing alongside the staged recovery of servers.

One particularly important detail: **Microsoft said it was extending the email timeout window to 48 hours to help protect delayed messages during recovery.** That is a message-preservation measure. It is not a promise that every email has arrived, and it does not mean the outage is expected to last 48 hours.

Microsoft listed its next update for **10:00 UTC on November 13 (15:30 IST)**. That was a deadline for more information, not a restoration deadline. Check the current dashboard for the update rather than assuming recovery from a quieter outage graph.

Microsoft's same update said it was **not aware of malicious activity causing this incident**. That is the statement available at this checkpoint. There is no basis here to call this a confirmed cyberattack, or to turn an evolving recovery theory into the final root cause.

## What I would do while waiting

For users, avoid turning a service outage into a local troubleshooting marathon. Keep important unsent text saved, verify whether urgent messages actually reached their recipients, and use an organization-approved alternative channel where necessary. Repeatedly resending the same message can create duplicate mail when service recovers.

For administrators and support teams:

1. **Check the incident for your tenant.** Use Health → Service health in the Microsoft 365 admin center and look for EX1550543 or MO1550821. If the admin center is inaccessible, use [the public status page](https://status.cloud.microsoft/).
2. **Communicate by capability.** "Email and calendar are unreliable; existing Teams calls may still work" is more useful than telling everyone that the whole suite is unavailable.
3. **Avoid unnecessary resets.** Reinstalling Outlook or resetting credentials will not repair Microsoft's unavailable servers. Microsoft's notice also specifically advises already-signed-in Power Apps/Field Service mobile users that signing out, clearing app data or reinstalling could worsen their access during this issue.
4. **Do not weaken security to get work moving.** Keep MFA and data-protection controls in place. A broken protected link or export should go through your support process, not become a reason to bypass policy.
5. **Validate recovery with real tasks.** Check mailbox access, send and receive test messages, and test calendar operations before closing your own incident. A successful sign-in alone is not proof that every dependency has recovered.

For a team using [agentic workflows](/blog/designing-agentic-ai-workflows-tool-calling-memory-and-multi-modal-integration), treat failures from mail and calendar tools as dependency failures, not instructions to retry forever. The same production-readiness principle appears in the [Foundry Agent Service checklist](/blog/foundry-agent-service-production-checklist): test what a workflow does when a tool it relies on cannot answer.

## What the incident report needs to explain

The public updates describe a difficult recovery, but they do not yet provide the complete causal chain. I want to understand why servers became unavailable, why returning capacity was hard to sustain, how shared dependencies widened the impact, and which safeguards will prevent the same failure from cascading again.

Microsoft says it will publish a full post-incident report with the root cause and defense-in-depth actions after recovery. That is where those questions belong, rather than in a confident guess made during an outage.

*Cover photo: [İsmail Enes Ayhan / Unsplash](https://unsplash.com/photos/server-room-aisle-with-metal-equipment-racks-lVZjvw-u9V8), used under the Unsplash License. It illustrates server infrastructure; it is not a photograph of the systems involved in this incident.*

Once everyone has their inbox back, that post-incident report is going to be a fun read.
