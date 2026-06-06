# Stop Using Soft Deletes: Design DB State with Separate Tables

**Tags:** Database, Architecture, PostgreSQL, Production, Backend  
**Date:** 2026-05-28  
**Source inspiration:** Zenn trending (183 likes)

---

Soft deletes are one of those patterns that feel pragmatic the first time you reach for them. Add a `deleted_at` column, filter it everywhere, done. The data is preserved, and recovery is one SQL statement away.

In practice, soft deletes consistently become one of the most painful parts of a production schema. This post covers the real problems they introduce and a cleaner alternative: splitting state into separate tables.

## What Soft Deletes Look Like in Practice

The standard implementation:

```sql
ALTER TABLE orders ADD COLUMN deleted_at TIMESTAMPTZ;

-- "Delete"
UPDATE orders SET deleted_at = NOW() WHERE id = $1;

-- Query active records
SELECT * FROM orders WHERE deleted_at IS NULL;
```

Straightforward. But notice the implicit rule: *every query against this table now requires* `WHERE deleted_at IS NULL`. That's not enforced by the schema — it's enforced by convention.

## Problem 1: The Missing Filter

You add the filter to every query at first. But over 18 months, your codebase grows. A new engineer writes:

```python
order = session.query(Order).filter(Order.id == order_id).first()
```

They didn't know about `deleted_at`. The code runs fine in tests (test data doesn't have `deleted_at` set). It runs fine in staging. In production, a deleted order comes back to life in the UI.

This isn't a hypothetical. It happens on virtually every team that uses soft deletes long enough.

ORMs try to help with global query filters (Django `objects.filter(deleted_at__isnull=True)` as a custom manager, SQLAlchemy with `@event.listens_for`), but these filters are easy to bypass and hard to verify across all query paths.

## Problem 2: Index Bloat and Query Performance

A partial index helps:

```sql
CREATE INDEX idx_orders_active ON orders (user_id) WHERE deleted_at IS NULL;
```

But now you have two populations of data in the same table: active rows (the ones your application actually touches 99% of the time) and deleted rows (accumulating indefinitely). The deleted rows pollute your indexes, bloat your table statistics, and slow down your autovacuum.

As table size grows, `WHERE deleted_at IS NULL` stops being trivially fast even with the partial index, because the planner still has to reason about the full dataset.

## Problem 3: Foreign Key Confusion

What does it mean when an `order_item` references an `order` that has `deleted_at` set?

```sql
-- Is this valid? The order is "deleted" but the row still exists
SELECT * FROM order_items WHERE order_id = 42;
-- order 42 has deleted_at = '2025-01-01'
```

Your foreign key constraint (`order_items.order_id REFERENCES orders(id)`) still holds — the row exists. But your application logic treats that order as deleted. Now every join that crosses this boundary has to account for the soft-delete state of the parent.

This compounds with each layer. If orders join to customers who also have soft deletes, you're filtering three tables for `deleted_at IS NULL` to get a result set that makes business sense.

## The Alternative: Separate Tables by State

Instead of a flag column, move records to a separate table when they transition to a terminal state.

```sql
-- Active orders
CREATE TABLE orders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    total       NUMERIC(10,2) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deleted / archived orders
CREATE TABLE orders_deleted (
    id          UUID PRIMARY KEY,
    user_id     UUID NOT NULL,
    total       NUMERIC(10,2) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL,
    deleted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_by  UUID  -- who triggered the deletion
);
```

When an order is deleted:

```sql
BEGIN;
  INSERT INTO orders_deleted
    SELECT id, user_id, total, created_at, NOW(), $deleted_by
    FROM orders
    WHERE id = $order_id;

  DELETE FROM orders WHERE id = $order_id;
COMMIT;
```

Recovery is equally straightforward — move it back.

## Why This Is Cleaner

| Concern | Soft delete | Separate tables |
|---|---|---|
| Accidental inclusion | Easy — any query without the filter | Impossible — wrong table |
| Index size | Bloated with deleted rows | `orders` index covers only active rows |
| Foreign key semantics | Ambiguous (`deleted_at` ≠ absence) | Clear — presence in `orders` means active |
| Table statistics | Skewed by deleted population | Accurate for query planner |
| Audit trail | One column | Richer schema: `deleted_at`, `deleted_by`, reason |

The key insight is that **the database schema should make illegal states unrepresentable**. "An active order" and "a deleted order" are different things. Modeling them as the same table with a nullable column smuggles a business state distinction into a SQL filter convention — and conventions leak.

## Handling Non-Terminal States

Some records have multiple lifecycle states, not just active/deleted:

```
draft → submitted → processing → fulfilled → cancelled
```

The same principle applies: model each stable state as its own table, or (for high-churn states) use an explicit `status` enum column with a check constraint.

```sql
CREATE TYPE order_status AS ENUM ('draft', 'submitted', 'processing', 'fulfilled', 'cancelled');

CREATE TABLE orders (
    id      UUID PRIMARY KEY,
    status  order_status NOT NULL DEFAULT 'draft',
    -- ...
);

-- Partial indexes per status
CREATE INDEX idx_orders_processing ON orders (created_at) WHERE status = 'processing';
```

The difference from soft delete: the status is explicit, checked at the DB level, and you create targeted indexes per state rather than one giant "not deleted" filter.

## When Soft Deletes Are Acceptable

There are cases where soft deletes are fine:

- **Small tables** that will never exceed ~100k rows
- **Audit-heavy domains** where you genuinely need the original row in place with its FK relationships intact
- **Prototypes** where you're still figuring out the data model

The problem is teams start with "this is a prototype" and end up with 50M rows and a query that's silently returning deleted data in production.

## Migration Strategy

If you're already sitting on a table with `deleted_at`, migrating isn't immediate but is worth planning:

1. Create the `_deleted` shadow table with the same schema plus audit columns
2. Migrate existing soft-deleted rows in batches during low traffic
3. Update application write paths to use the move-to-deleted transaction
4. Remove `deleted_at` column and associated ORM filters once read paths are clean

The read path migration is the hard part — audit every query that could hit the old table and ensure it doesn't need to see deleted data.

## Key Takeaways

- Soft deletes enforce their constraint at the application layer, not the database layer — that constraint leaks
- Separate tables make the distinction structurally enforced: you cannot accidentally query deleted data from the active table
- Index size, query planner accuracy, and FK semantics all improve when active and deleted records are physically separated
- For multi-state workflows, explicit enum columns with partial indexes per state are cleaner than nullable flag columns
