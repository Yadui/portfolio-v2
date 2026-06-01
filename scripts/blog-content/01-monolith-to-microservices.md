## Why the Monolith Had to Go

Every engineering org reaches the same inflection point: the codebase that once shipped features in a weekend now requires a war room to deploy. That was the reality at Foetron when we started planning the migration of a multi-tenant SaaS platform from a single-process Django/PostgreSQL monolith to a load-balanced microservices topology on Azure.

This post is the playbook we wish we'd had.

## The Decision Framework: What Gets Split First?

[!INFO] The cardinal rule of microservice decomposition: split on *business capability*, not on technical layer.

The wrong approach is to extract "the database layer" or "the API layer." The right approach is to draw boundaries around things that change for different reasons.

We used the following decision matrix:

| Service Candidate | Change Frequency | Team Ownership | Data Coupling | Decision |
|---|---|---|---|---|
| Auth & Identity | Low | Platform | Isolated | ✅ Split early |
| Billing & Subscriptions | Medium | Finance | Isolated | ✅ Split early |
| Core VM Provisioning | High | Engineering | Deeply coupled | ⚠️ Split last |
| Reporting & Analytics | Medium | Data | Read-heavy | ✅ Split early |
| Notifications | Low | Platform | Isolated | ✅ Split early |

The provisioning engine was the most tempting to split (it was the biggest bottleneck) but it was also the most coupled to shared state. We left it for last and built the strangler fig around it.

## Database Workload vs. Compute Node Splitting

This is where most migrations go wrong. Teams focus on containerizing application code but leave a single monolithic PostgreSQL instance underneath — and it becomes the new bottleneck.

### Splitting Compute First (The Strangler Fig)

We routed traffic through an Azure Application Gateway and incrementally extracted services behind it:

```
Internet
  └─▶ Azure Application Gateway (WAF v2)
        ├─▶ /api/auth/*          → Auth Service (Container App)
        ├─▶ /api/billing/*       → Billing Service (Container App)
        ├─▶ /api/notifications/* → Notification Worker (Container App)
        └─▶ /*                   → Legacy Monolith (App Service, shrinking)
```

Each extracted service got its own Azure Container Apps environment with autoscale rules. The monolith kept running, handling everything not yet migrated.

### Splitting the Database Workload

Once compute was separated, we tackled data. The pattern we used:

**Phase 1 — Read replicas for analytics**
Azure Database for PostgreSQL Flexible Server supports read replicas natively. We pointed the reporting service at the read replica immediately — zero code change on the monolith, instant load reduction.

**Phase 2 — Schema-per-service with logical isolation**
Each new service got its own schema within the same Flexible Server instance first. This reduced operational overhead while providing logical isolation.

```sql
-- Before: everything in public schema
SELECT * FROM public.vm_deployments;

-- After: service-owned schemas
SELECT * FROM provisioning.deployments;
SELECT * FROM billing.subscriptions;
```

**Phase 3 — Physical database separation for high-churn services**
The billing service was moved to its own Flexible Server instance. Reasons: PCI compliance requirements, independent backup/restore, and significantly different IOPS profile.

[!WARNING] Don't rush Phase 3. Physical database separation introduces distributed transaction complexity. Make sure your services are truly decoupled before splitting storage.

## The Load Balancer Configuration That Tripped Us Up

Azure Application Gateway uses backend health probes. Every service needs a `/health` endpoint, or the gateway will mark it unhealthy and drop traffic. Simple in theory, painful to retrofit across 6 services simultaneously.

```python
# FastAPI health endpoint pattern we standardised across all services
@app.get("/health")
async def health():
    checks = {
        "db": await check_db_connection(),
        "cache": await check_redis_connection(),
    }
    status = "healthy" if all(checks.values()) else "degraded"
    return {"status": status, "checks": checks}
```

## Traffic Migration: The 10/50/100 Rule

We never cut over 100% of traffic at once. The pattern:

1. **10%** to new service via Application Gateway weighted routing — monitor error rates for 48 hours
2. **50%** if error rate is within 0.1% of baseline
3. **100%** after 7 days at 50% with no regressions
4. Decommission the monolith handler only after 30 days at 100%

## Results

After six months of incremental migration:

- **Deploy frequency**: from 1x/week to 15+ deploys/day
- **Mean time to recovery**: from 45 minutes to 4 minutes
- **Database CPU at peak**: from 94% (monolith PostgreSQL) to 38% average across distributed instances
- **P99 API latency**: improved 40% due to right-sized compute per service

The migration is never "done" — but the strangler fig pattern meant production was never at risk. Users didn't notice a thing.
