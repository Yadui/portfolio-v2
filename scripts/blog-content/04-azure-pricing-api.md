## Why First-Party Pricing Calculators Fall Short

The Azure Pricing Calculator is excellent for static estimates. It falls short the moment you need to answer questions like: "If we move from 8 D4s_v3 nodes to 6 D8s_v4 nodes and shift workloads to East US 2, what's the delta?" Or: "What's the 3-year reserved instance break-even point for this specific SKU in this specific region?"

For the cloud infrastructure consultancy work at Foetron, we built a custom pricing engine that hits the Azure Retail Prices API directly and layers business logic — block size constraints, reserved instance amortisation, licensing included/excluded comparisons — on top.

## The Azure Retail Prices API

The API requires no authentication. Every SKU, every region, every pricing model is queryable:

```
GET https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview
    &$filter=serviceName eq 'Virtual Machines'
             and armRegionName eq 'eastus'
             and skuName eq 'D4s v3'
             and priceType eq 'Consumption'
```

Response shape:

```json
{
  "Items": [
    {
      "currencyCode": "USD",
      "retailPrice": 0.192,
      "unitPrice": 0.192,
      "armRegionName": "eastus",
      "skuName": "D4s v3",
      "productName": "Virtual Machines Dsv3 Series",
      "meterName": "D4s v3",
      "unitOfMeasure": "1 Hour",
      "type": "Consumption",
      "isPrimaryMeterRegion": true
    }
  ]
}
```

## Architectural Constraints That Drive Cost: Block Size

[!INFO] **Block size** is the single most underestimated cost driver in cloud architecture discussions. A workload that perfectly fits a D4s_v3 (4 vCPU, 16 GB RAM) will cost roughly the same as one using 20% of a D8s_v3 (8 vCPU, 32 GB RAM) — if the workload doesn't fit the smaller SKU.

The block size problem manifests when:
- An application requires 18 GB RAM → must use a 32 GB SKU (D8s) → paying for 14 GB of idle RAM
- A database needs 6 vCPUs → must use an 8-vCPU SKU → paying for 2 wasted vCPUs
- A bursty workload needs 20 vCPUs at peak → over-provisioned to 32 vCPU SKU to handle the burst

Our calculation engine models this explicitly:

```python
from dataclasses import dataclass
from typing import List
import httpx

@dataclass
class SkuSpec:
    name: str
    vcpus: int
    memory_gb: float
    hourly_price: float

async def get_vm_skus(region: str, series: str) -> List[SkuSpec]:
    """Fetch all SKUs in a series from the Retail Prices API."""
    url = "https://prices.azure.com/api/retail/prices"
    params = {
        "api-version": "2023-01-01-preview",
        "$filter": (
            f"serviceName eq 'Virtual Machines' "
            f"and armRegionName eq '{region}' "
            f"and priceType eq 'Consumption' "
            f"and contains(skuName, '{series}')"
        )
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        items = resp.json()["Items"]
    return [SkuSpec(
        name=i["skuName"],
        vcpus=parse_vcpus(i["skuName"]),
        memory_gb=parse_memory(i["skuName"]),
        hourly_price=i["retailPrice"]
    ) for i in items]

def optimal_sku(
    required_vcpus: int,
    required_memory_gb: float,
    skus: List[SkuSpec]
) -> SkuSpec:
    """Find the cheapest SKU that meets requirements."""
    eligible = [
        s for s in skus
        if s.vcpus >= required_vcpus and s.memory_gb >= required_memory_gb
    ]
    return min(eligible, key=lambda s: s.hourly_price)
```

## Reserved Instance Break-Even Calculation

The 1-year and 3-year reserved instance prices are in the same API (`priceType eq '1 Year Reserved'`). The break-even point in months:

```python
def reserved_breakeven_months(
    on_demand_hourly: float,
    reserved_annual_upfront: float,
    hours_per_month: float = 730.0
) -> float:
    monthly_on_demand = on_demand_hourly * hours_per_month
    monthly_reserved = reserved_annual_upfront / 12
    # Break-even: when cumulative savings exceed upfront cost
    monthly_saving = monthly_on_demand - monthly_reserved
    return reserved_annual_upfront / monthly_saving if monthly_saving > 0 else float('inf')
```

For most D-series VMs in East US running 24/7, the 1-year RI break-even is around **7–8 months** and the 3-year RI break-even is **14–16 months**.

## A Real Optimisation Example

A client was running 12× D8s_v3 VMs (8 vCPU, 32 GB) on pay-as-you-go for a web tier that needed 6 vCPUs and 20 GB RAM per instance.

The analysis:

| Option | Config | Monthly (USD) |
|---|---|---|
| Current | 12× D8s_v3 PAYG | $2,006 |
| Right-sized | 12× D4s_v3 PAYG | $1,003 |
| Right-sized + 1yr RI | 12× D4s_v3 Reserved | $604 |
| Spot (non-critical tier) | 8× D4s_v3 Spot + 4× PAYG | $389 |

**Outcome:** $1,617/month saving (80.8% reduction) by right-sizing, moving to reserved instances for the base load, and using Spot for the stateless tier — all discovered via the pricing API before touching a single VM.
