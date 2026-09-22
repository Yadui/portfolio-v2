---
status: "NOT APPROVED FOR PUBLICATION"
proposed_slug: "azure-ad-entra-passwordless-migration"
proposed_title: "Azure AD to Entra: plan a passwordless migration"
proposed_excerpt: "Compare Entra passkeys, Windows Hello and Authenticator phone sign-in, then plan enrollment, recovery and phased passwordless enforcement."
proposed_tags: [Microsoft Entra ID, Azure AD, Passwordless, Passkeys, Identity, Security]
source_review_date: "2026-09-22"
verified_sources:
  - "https://learn.microsoft.com/en-us/entra/fundamentals/new-name"
  - "https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-passwordless"
  - "https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-deployment"
  - "https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-phone"
  - "https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strengths"
  - "https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-temporary-access-pass"
  - "https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/"
review_notes:
  - "No tenant rollout, enrollment, recovery exercise, or adoption measurement was performed."
  - "Check method-specific platform support, passkey policies, licensing, and tenant availability before approval; avoid generalizing preview features."
  - "The passwordless concept URL currently resolves to Passkeys (FIDO2) guidance, not a general comparison of all methods."
  - "Internal AVD slug verified from repository data; linked overview requires a separate accuracy review before publication."
---

# Azure AD to Entra: plan a passwordless migration

Azure Active Directory passwordless authentication is now documented under Microsoft Entra ID. The product rename does not require moving tenants or recreating users. The practical migration is from password-dependent sign-in to suitable authentication methods, supported enrollment and recovery, and policies that require those methods for selected resources.

Start by choosing the security requirement: passwordless access or phishing-resistant access. They overlap, but they are not interchangeable. Microsoft Authenticator phone sign-in is passwordless; it is not included in the built-in phishing-resistant MFA strength.

## Translate old terminology before changing configuration

Microsoft's [rename guidance](https://learn.microsoft.com/en-us/entra/fundamentals/new-name) confirms that Azure AD became Microsoft Entra ID without requiring changes to existing deployments. Old references to Azure AD Conditional Access and Azure AD joined devices generally map to Microsoft Entra Conditional Access and Microsoft Entra joined devices.

Windows Server Active Directory and Active Directory Domain Services remain distinct products. Renaming Azure AD did not replace domain controllers, remove Kerberos dependencies, or modernize an application's authentication protocol.

Inventory sign-in paths rather than treating the name change as a migration project. Include Windows sign-in, browser applications, remote desktops, mobile applications, and recovery. Identify where a password is actually required and which identity provider handles each step.

## Choose methods by workflow and security requirement

### Passkeys and FIDO2 security keys

[Passkeys](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-passwordless) use origin-bound public-key cryptography. A user unlocks the credential with local verification, such as a PIN or biometric. A FIDO2 security key is a hardware option; Microsoft Authenticator can also hold passkeys in supported configurations.

These are different experiences from approving an Authenticator push notification. Check permitted passkey types, registration policy, browser support, and device capabilities before ordering keys or writing enrollment instructions. Treat moving between shared devices and signing in from a personal phone as separate scenarios.

### Windows Hello for Business

[Windows Hello for Business](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/) combines a device-specific credential with a PIN or biometric gesture. The PIN unlocks that credential; it is not simply the account's reusable network password with fewer characters.

This can suit a user who works primarily on an assigned Windows device. Plan provisioning and access to on-premises resources as well as cloud applications. A successful Windows unlock alone does not prove that every downstream application works without a password.

### Authenticator phone sign-in

[Authenticator phone sign-in](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-phone) provides a passwordless flow using a credential tied to the phone. Enabling it is a separate step after registering the app, and policy must allow it.

Distinguish three things in user instructions: password plus Authenticator approval, Authenticator passwordless phone sign-in, and an Authenticator-hosted passkey. The same app name does not mean the same authentication method or protection.

### Certificate-based authentication

For organizations already operating certificate infrastructure, certificate-based authentication is another option. Microsoft's strength definitions include **multifactor** certificate-based authentication in phishing-resistant MFA. Do not assume every certificate sign-in qualifies: single-factor certificate-based authentication is classified separately.

## Separate method availability from access enforcement

The Authentication methods policy controls which methods users and groups may register and use. Conditional Access authentication strengths constrain acceptable method combinations when accessing a resource.

Microsoft defines [three built-in strengths](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strengths): MFA, passwordless MFA, and phishing-resistant MFA. Windows Hello for Business and FIDO2 credentials can meet phishing-resistant requirements; Authenticator phone sign-in meets passwordless MFA but not that stronger category.

Select the required strength deliberately. Do not combine **Require multifactor authentication** and **Require authentication strength** in the same policy; Microsoft documents that combination as unsupported. Also, a strength requirement does not prevent initial password entry. It determines what authentication must be satisfied before the protected resource becomes accessible.

## Build enrollment and recovery before enforcement

Pilot with users representing the actual device and application mix. Confirm they can register the chosen method and complete a fresh sign-in, not merely reuse an existing session.

A [Temporary Access Pass](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-temporary-access-pass) is a time-limited passcode for bootstrapping authentication methods or recovery. It can be single-use or allow multiple sign-ins. Enable it for the intended users through Authentication methods policy; creating a pass alone does not make an out-of-scope user eligible to use it.

Define how the help desk verifies identity, issues a pass securely, and handles a lost device. Give users a supported recovery path before requiring a method that could become unavailable. TAP is not a replacement for the user's password, and it does not satisfy the built-in passwordless or phishing-resistant MFA strengths. Check that registration policy permits the intended bootstrap flow.

Keep recovery credentials out of tickets and analytics. Record enrollment completion and recovery outcomes without recording secret values.

## Move from a pilot to required use

Use Microsoft's [deployment guidance](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-deployment) to assign owners across identity, endpoint management, support, and application teams. Document license requirements for the features selected, particularly Conditional Access.

Evaluate proposed resource policies in report-only mode, then enforce for the pilot and exercise lost-device recovery. Expand only after each supported workflow has an owner and a demonstrated route through enrollment, sign-in, and recovery. Monitor actual method usage and failed sign-ins; registration counts alone do not show adoption.

### Does enabling passwordless remove passwords everywhere?

No. Enabling a method does not prove legacy dependencies have disappeared or that every resource requires the stronger method. Treat retirement of password-dependent workflows as a separate, evidence-based decision.

### Does this automatically make AVD passwordless?

No. Remote desktop sign-in also depends on the session-host and client authentication path. The [AVD identity overview](/blog/securing-azure-virtual-desktop-with-entra-id-and-passwordless-mfa) provides context; validate current AVD SSO prerequisites before extending an identity pilot to desktops.
