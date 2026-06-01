## The Problem with Passwords in VDI Environments

Traditional Virtual Desktop Infrastructure relies on Active Directory and password-based authentication. In a cloud-first world, that model has three critical failure points: password spray attacks, stale credentials in hybrid sync, and no conditional access at the session level.

When we deployed Azure Virtual Desktop for a 200-seat enterprise client, passwordless authentication wasn't optional — it was a compliance requirement under their cyber insurance policy.

## Entra ID vs. Active Directory: The Architecture Decision

[!INFO] Azure Virtual Desktop supports two identity models: **Entra ID-joined** (cloud-native) and **Hybrid Entra ID-joined** (synced from on-premises AD). The right choice depends on your existing identity footprint.

### Entra ID-Joined (Pure Cloud)

Best for: greenfield deployments, remote-first orgs, no on-premises DC.

```
User Device → Entra ID Authentication → Conditional Access Evaluation
     → AVD Session Host (Entra ID-joined) → FSLogix Profile (Azure Files)
```

Key configuration: the session hosts must be joined to Entra ID, not a local domain. This means your Azure Files share for FSLogix profiles needs **Kerberos authentication via Entra ID** — a step that's easy to miss.

### Hybrid Entra ID-Joined

Best for: organisations with existing AD DS, line-of-business apps requiring Kerberos, or complex GPO requirements.

```
User Device → Entra ID (cloud) ↔ Azure AD Connect Sync ↔ On-prem AD DS
     → AVD Session Host (Hybrid Joined) → SMB share (domain auth)
```

We went hybrid because the client had 15 years of Group Policy Objects managing software deployments that were not worth rewriting.

## Configuring MFA-Enforced Authentication

### Step 1: Conditional Access Policy

Create a policy targeting the **Windows Virtual Desktop** cloud app:

```json
{
  "displayName": "AVD - Require MFA",
  "conditions": {
    "applications": {
      "includeApplications": ["9cdead84-a844-4324-93f2-b2e6bb768d07"]
    },
    "users": {
      "includeGroups": ["avd-users-group-id"]
    }
  },
  "grantControls": {
    "operator": "AND",
    "builtInControls": ["mfa"],
    "authenticationStrength": "passwordlessMFA"
  }
}
```

[!WARNING] The application ID `9cdead84-a844-4324-93f2-b2e6bb768d07` is the **Windows Virtual Desktop** service principal. Do not confuse it with the Azure Virtual Desktop ARM resource. Both need to be targeted for full coverage.

### Step 2: Passwordless Credential Options

We rolled out **FIDO2 security keys** (YubiKey 5) for privileged users and **Microsoft Authenticator passkeys** for standard users.

Entra ID configuration:
1. **Authentication Methods Policy** → Enable FIDO2 Security Keys + Authenticator passkeys
2. **Named Locations** — restrict AVD access to corporate IPs for non-compliant devices
3. **Sign-in risk policy** → Block High, require MFA on Medium

### Step 3: FSLogix + Azure Files with Entra Kerberos

This is the configuration step that most guides skip. FSLogix stores roaming user profiles on Azure Files via SMB. For Entra ID-joined hosts, you need Kerberos tickets issued by Entra ID, not an on-prem DC.

```powershell
# Enable Entra Kerberos on the storage account
Update-AzStorageAccount `
  -ResourceGroupName "rg-avd-prod" `
  -Name "stavdprofiles" `
  -EnableAzureActiveDirectoryKerberosForFile $true `
  -ActiveDirectoryDomainName "yourtenant.onmicrosoft.com" `
  -ActiveDirectoryDomainGuid "your-tenant-guid"

# Assign Storage File Data SMB Share Contributor to AVD users group
New-AzRoleAssignment `
  -ObjectId "avd-users-group-object-id" `
  -RoleDefinitionName "Storage File Data SMB Share Contributor" `
  -Scope "/subscriptions/.../resourceGroups/rg-avd-prod/providers/Microsoft.Storage/storageAccounts/stavdprofiles"
```

## The Nuances Nobody Tells You

**Single Sign-On requires the AVD feed to be enrolled via Intune or a compliant device.** If a user's personal device isn't Intune-managed, they'll get a second authentication prompt when launching a session app — even with SSO configured.

**Conditional Access re-evaluation at session level** is enabled via the `Sign-in frequency` setting. We set it to 4 hours for privileged roles and 8 hours for standard users. Without this, a stolen session token is valid until the session terminates.

**Break-glass accounts** must be excluded from passwordless policies. We maintain two emergency accounts with long passwords, hardware TOTP, and Entra ID Privileged Identity Management activation — and they've never been used outside of quarterly DR drills.

## Security Outcomes

Post-deployment security metrics (90-day window):

- **Phishing-related credential compromise attempts**: 0 (down from 3 in prior quarter)
- **Password reset tickets**: down 87% (from 42/month to 5/month)
- **MFA fatigue attack surface**: eliminated — no push notifications, only presence-based FIDO2
- **Conditional Access policy coverage**: 100% of AVD app access
