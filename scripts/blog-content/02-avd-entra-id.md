## Secure the service and the session host

Azure Virtual Desktop (AVD) uses Microsoft Entra ID for service authentication. Entra single sign-on (SSO) extends that authentication to Windows on supported session hosts, enabling passwordless sign-in to the remote desktop.

MFA, SSO, and profile-storage access are separate configuration decisions. This overview follows Microsoft documentation; it does not report a customer deployment or measured security outcomes.

Microsoft distinguishes [three authentication phases](https://learn.microsoft.com/en-us/azure/virtual-desktop/authentication): the AVD service, the remote session, and applications inside that session. Validate each phase your users need.

## Choose the host identity and resource-access model

For **Entra SSO**, session hosts must be Microsoft Entra joined or Microsoft Entra hybrid joined. AD DS-only and Entra Domain Services-joined hosts do not support this particular SSO configuration.

This is an SSO prerequisite, not a complete list of AVD identity options. User identity and device join state are different choices: an Entra-joined host can serve supported cloud-only or hybrid user identities.

- **Entra joined:** evaluate this for a cloud-managed host fleet. Check application and storage authentication separately rather than assuming every dependency becomes cloud-only.
- **Hybrid joined:** evaluate this where hosts still need AD DS membership and existing domain management. Account for domain connectivity and Kerberos dependencies.

Use the same Entra identity for service and session-host sign-in. Microsoft's authentication guidance does not support signing into the service as one account and Windows as another.

## Target the correct Conditional Access applications

For current Azure Resource Manager-based AVD with Entra SSO, Microsoft recommends separate, aligned policies for these resources in its [MFA setup guide](https://learn.microsoft.com/en-us/azure/virtual-desktop/set-up-mfa):

| Resource | Application ID | Authentication boundary |
| --- | --- | --- |
| Azure Virtual Desktop | `9cdead84-a844-4324-93f2-b2e6bb768d07` | Feed subscription and gateway connection |
| Windows Cloud Login | `270efc09-cd0d-444b-a71f-39af4910ec45` | Session-host sign-in with Entra SSO |

Older tenants may display **Windows Virtual Desktop** for the first application. Match the application ID, not just the display name. AVD classic has different guidance.

**Do not enforce MFA on Azure Virtual Desktop Azure Resource Manager Provider**, application ID `50e95039-b200-4007-bc97-8d5790743a63`. Microsoft explicitly warns against targeting this feed-retrieval application.

Scope new policies to a pilot user group. Include the browser and mobile/desktop client categories you intend to support. Review existing all-resource policies, device and location conditions, and Windows App dependencies before enforcement.

Conditional Access requires licenses including Entra ID P1 or P2. It cannot be used with Security Defaults enabled. Plan replacement protection before that transition, and review legacy per-user MFA conflicts on Entra-joined hosts.

## Select passwordless methods deliberately

Enable and register a supported method before requiring it. Check the client, host, and authentication phase: successful passwordless service sign-in does not prove that applications inside the desktop support the same method.

Microsoft's [authentication strengths](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strengths) distinguish passwordless MFA from phishing-resistant MFA. FIDO2 passkeys and Windows Hello for Business are phishing-resistant options.

Authenticator phone sign-in and Authenticator-hosted passkeys are different methods. Do not treat every passwordless or Authenticator flow as having the same phishing resistance.

For a basic MFA policy, use **Require multifactor authentication**. To restrict accepted methods, choose an appropriate **Require authentication strength** control instead. Microsoft does not support combining those two grant controls in one policy.

Use the documented policy workflow rather than treating illustrative JSON as an importable policy. Test enrollment and recovery with the selected strength before requiring it for the pilot.

## Configure SSO and profile access independently

Follow Microsoft's [SSO configuration guide](https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-single-sign-on) for supported host updates and client versions, then complete the tenant and host-pool configuration:

- Enable Entra authentication for RDP on Windows Cloud Login.
- Configure trusted session-host groups for pre-consent where appropriate.
- Create the documented Kerberos server object for hybrid-joined hosts, or Entra-joined hosts accessing on-premises resources in the applicable AD DS scenario.
- Review Conditional Access, then enable Entra SSO on the host pool with `enablerdsaadauth:i:1`.

**Intune enrollment is not a blanket SSO prerequisite.** Supported Windows clients do not universally require a domain-joined or Entra-joined local PC. Your Conditional Access policies can separately require a compliant device.

For FSLogix profiles on Azure Files, choose a supported storage authentication path. Entra Kerberos is one documented option; the host join type alone does not establish all its prerequisites.

The [FSLogix Azure Files guide](https://learn.microsoft.com/en-us/fslogix/how-to-configure-profile-container-entra-id-hybrid) separates hybrid from cloud-only/external identities. Follow the relevant path for permissions and host configuration.

Check share-level and file/directory permissions, ticket retrieval, and actual profile-container loading. A successful desktop sign-in is not proof that profile storage works. Avoid substituting a tenant domain or GUID for AD DS details in commands.

## Understand reauthentication and emergency access

Sign-in frequency is not a timer that interrupts an established desktop. Microsoft documents reauthentication when another authentication and access token are needed, including qualifying reconnects after the interval expires.

For this SSO flow, **Every time** is supported only on Windows Cloud Login. Choose intervals for your requirements and test the actual reconnect and lock behavior instead of promising a fixed prompt count or token lifetime.

Microsoft's [emergency-access guidance](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access) recommends at least two cloud-only emergency accounts with phishing-resistant authentication and independent recovery dependencies.

Their Global Administrator assignments should be **permanent active, not eligible for PIM activation**. Exclude them from Conditional Access policies that block or restrict sign-in; this does not exempt them from Microsoft's mandatory MFA requirements.

Secure the credentials and designated workstations, alert on account use, and validate access at least every 90 days. Emergency access should remain usable when normal administrator authentication or approval paths fail.

## Next action: document and validate a pilot

Start with an inventory of host join types, user identities, supported clients, registered methods, existing policies, and profile storage. Record the current configuration and verify emergency access before changing enforcement.

Evaluate new pilot policies in [report-only mode](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-report-only) while retaining baseline protection. Report-only evaluation cannot prove users can complete an MFA challenge.

Then enforce for the pilot and check service sign-in, desktop launch, reconnect, and profile loading. Inspect both applications' sign-in records for the intended policy results. Agree on a rollback owner and restore the recorded baseline if needed.

Expand only after representative client and user scenarios succeed. This overview defines the architecture and rollout boundary; use Microsoft's linked setup instructions for configuration details and error-specific diagnosis.
