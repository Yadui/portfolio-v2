## Why Private Endpoints Break Your DNS (And How to Fix It)

Private Endpoints are one of Azure's most powerful security features — they pull a PaaS service (like Azure SQL, Storage, or Key Vault) into your VNet with a private IP. No public internet exposure. Traffic never leaves the Microsoft backbone.

They also break DNS in at least four non-obvious ways.

This is the troubleshooting guide I wish existed when I spent a Friday night at 11pm debugging why `mystorageaccount.blob.core.windows.net` was resolving to `20.150.x.x` from inside a peered VNet instead of the private IP.

## How Private Endpoint DNS Is Supposed to Work

When you create a Private Endpoint for a Storage account:

1. Azure creates a NIC in your subnet with a private IP (e.g., `10.0.1.4`)
2. A **Private DNS Zone** (`privatelink.blob.core.windows.net`) is created
3. A DNS A record maps `mystorageaccount.privatelink.blob.core.windows.net` → `10.0.1.4`
4. The public DNS CNAME chain redirects to the privatelink zone:

```
mystorageaccount.blob.core.windows.net
  └─▶ CNAME: mystorageaccount.privatelink.blob.core.windows.net
        └─▶ A: 10.0.1.4  (resolved from Private DNS Zone linked to VNet)
```

Simple. Until it isn't.

## Gotcha #1: The Private DNS Zone Is Not Linked to Your VNet

This is the most common error. You create the Private Endpoint, the Private DNS Zone gets created, but **nobody linked the zone to the VNet**.

**Symptom:** `nslookup mystorageaccount.blob.core.windows.net` from a VM in the VNet returns the public IP.

**Fix:**
```bash
# Check zone links
az network private-dns link vnet list \
  --resource-group rg-networking \
  --zone-name privatelink.blob.core.windows.net

# Create the missing link
az network private-dns link vnet create \
  --resource-group rg-networking \
  --zone-name privatelink.blob.core.windows.net \
  --name link-to-prod-vnet \
  --virtual-network /subscriptions/.../virtualNetworks/vnet-prod \
  --registration-enabled false
```

## Gotcha #2: VNet Peering Doesn't Share DNS Zones

You have two VNets — `vnet-hub` and `vnet-spoke` — connected via peering. The Private DNS Zone is linked to `vnet-hub`. VMs in `vnet-spoke` still can't resolve the private endpoint.

[!WARNING] VNet peering forwards **IP traffic** but does NOT forward DNS queries across the peering link by default. Each VNet needs its own link to the Private DNS Zone.

**Symptom:** DNS works from VMs in `vnet-hub`, fails from `vnet-spoke` even though routing works.

**Fix:** Link the Private DNS Zone to every VNet that needs to resolve it:

```bash
az network private-dns link vnet create \
  --resource-group rg-networking \
  --zone-name privatelink.blob.core.windows.net \
  --name link-to-spoke-vnet \
  --virtual-network /subscriptions/.../virtualNetworks/vnet-spoke \
  --registration-enabled false
```

If you have a hub-spoke topology with many spokes, automate this with a policy:

```json
{
  "policyRule": {
    "if": {
      "field": "type",
      "equals": "Microsoft.Network/privateEndpoints"
    },
    "then": {
      "effect": "deployIfNotExists",
      "details": {
        "type": "Microsoft.Network/privateDnsZones/virtualNetworkLinks"
      }
    }
  }
}
```

## Gotcha #3: On-Premises DNS Forwarding

Your on-premises DNS server is forwarding all `.azure.com` queries to Azure. But it's forwarding to `168.63.129.16` (Azure's magic DNS IP) which only works from **within an Azure VNet** — not from your on-premises network.

**Symptom:** DNS for private endpoints works from Azure VMs, fails from on-premises servers.

**Architecture fix:** Set up an **Azure Private DNS Resolver** (or a DNS forwarder VM in your VNet) and configure your on-premises DNS to forward `privatelink.*` zones to it:

```
On-prem DNS Server
  └─▶ Forward *.privatelink.blob.core.windows.net
        └─▶ Azure Private DNS Resolver Inbound Endpoint (10.0.2.4)
              └─▶ Private DNS Zone (10.0.1.4 for the storage account)
```

## Gotcha #4: The Split-Horizon Problem with Azure SQL

Azure SQL's Private Endpoint configuration uses a different FQDN pattern. The `server.database.windows.net` CNAME chain goes through a redirect:

```
myserver.database.windows.net
  └─▶ CNAME: myserver.privatelink.database.windows.net
        └─▶ CNAME: cr000000001.eastus1-a.worker.database.windows.net
              └─▶ A: 10.0.1.5
```

The inner CNAME (`cr000000001.eastus1-a.worker...`) is a **publicly resolvable name** that maps to the private IP. If your firewall does DNS inspection and blocks external lookups, this chain breaks.

**Fix:** Ensure your DNS resolver can reach `*.worker.database.windows.net` or configure a conditional forwarder specifically for it.

## Diagnostic Checklist

When a Private Endpoint DNS resolution fails, run through this in order:

```bash
# 1. Confirm the private endpoint exists and is approved
az network private-endpoint show \
  --name pe-mystorageaccount \
  --resource-group rg-prod \
  --query "privateLinkServiceConnections[].privateLinkServiceConnectionState"

# 2. Confirm the DNS zone has an A record
az network private-dns record-set a list \
  --resource-group rg-networking \
  --zone-name privatelink.blob.core.windows.net

# 3. Confirm the VNet link exists
az network private-dns link vnet list \
  --resource-group rg-networking \
  --zone-name privatelink.blob.core.windows.net

# 4. Test resolution from inside the VNet
# (SSH into a VM and run:)
nslookup mystorageaccount.blob.core.windows.net
dig mystorageaccount.privatelink.blob.core.windows.net
```

[!TIP] Use `dig` over `nslookup` — it shows the full CNAME chain and the server that answered the query, making split-horizon issues immediately visible.
