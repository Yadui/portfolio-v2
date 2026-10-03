# Guarded article publishing to Turso

## Scope

This is an on-demand publishing pipeline, not a scheduled importer or an automatic
publish-on-push hook. It updates only the two approved existing articles listed in
`scripts/blog-corrections.json`. The module independently restricts both slugs and
source paths. New articles and files under `drafts/` are not eligible.

It changes **content and excerpt only**. IDs, slugs, titles, cover images, tags,
original publication dates and any additional columns must remain identical.
No insert, delete, schema migration, backdating or automatic indexing request occurs.

## Run

Use the configured `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. The CLI quietly
loads `.env.local` without overriding existing environment variables. Never put
credentials in the manifest, command arguments or Git. Existing local SQLite
files are also supported for isolated testing.

```sh
# Read-only: review the two slugs, changed-row count and source word counts.
npm run blog:plan

# Only after reviewing the output. Paste that exact planHash, not a stored old one.
npm run blog:publish -- --expect-plan <SHA256_FROM_PLAN>

# Read back from the configured database: expect changedRows = 0.
npm run blog:plan
```

Optional flags: `--env-file PATH`, `--backup-dir PATH`. Relative paths resolve from
the repository root. Unknown/duplicate flags, missing apply hashes and conflicting
modes fail closed. The publisher exits nonzero with a sanitized message on failure.

## Source format and rendering

- Edit the existing numbered Markdown sources, not the overlapping retained draft.
- AVD begins at its H2 and is preserved as authored.
- KV has a specifically recognized legacy H1/Published/Tags preamble, stripped by
  the publisher. No generic front matter parser silently guesses how to import.
- Body H1s, draft labels, unsupported pipe tables and unclosed fences are rejected.
- The two articles use lists rather than pipe tables for the current renderer.
- Excerpts are reviewed plain-text values in the manifest, at most 155 characters.

## Safety gates

1. Verify existing schema columns and exactly one row for each approved slug.
2. Bind source bytes, desired body/summary, full existing rows and target fingerprint
   into a deterministic SHA256 plan. Connection URLs/tokens are not printed.
3. Require that reviewed plan on apply; reread sources and rows inside a write
   transaction. Any intervening change fails the hash check.
4. Create a unique `0600` backup in ignored `.local/blog-backups/`, fsync file and
   directories, and verify exact bytes/checksum from disk before database updates.
5. Perform null-safe compare-and-swap updates and require exactly one affected row
   per changed article. Verify complete rows after both updates and before commit.
6. Roll back the transaction on failure. Repeated application of an unchanged fresh
   plan is a no-op, without another backup or write transaction.

An interrupted or timed-out commit can have an ambiguous acknowledgement. Do not
assume rollback: inspect current rows with a fresh plan before retrying. Remote
transaction timeouts can fail a run; do not bypass the backup or verification gates.

## Backups and rollback

Keep `.local/blog-backups/` private and excluded from deployment artifacts. Backups
contain original article rows, desired values and checksums, not connection tokens.
Copy them to an approved durable private backup location for long-term retention.

Rollback is intentionally a separate reviewed operation. Verify the envelope SHA256,
target fingerprint and individual digests. Inspect current rows first. Restore only
body/excerpt in a transaction with CAS against the backed-up desired values; abort
if another editor changed them. Preserve all other fields and verify before commit.
The backup's `$bigint` and `$bytes` tags encode SQLite integer/blob values. Do not
blindly execute a backup or overwrite subsequent edits.

## Cache visibility

Direct Turso updates do not invoke Next.js `revalidatePath` on the remote deployment.
Articles/blog use 600-second revalidation and RSS uses 3600 seconds. After expiry,
the first request may still serve stale content while regeneration runs; fetch
again afterward. These intervals are eligibility windows, not hard propagation SLAs.
Verify both canonical article bodies, meta descriptions and original URLs. Do not
add a public unauthenticated cache-purge endpoint as a shortcut.

## Tests

`npm test` includes 60 publisher regressions using disposable SQLite only, plus the
existing 112 tests. Cases cover stale plans, missing rows/schema, invalid sources,
backup fsync/readback failures, row-count mismatches, triggers altering metadata,
partial-update rollback, CLI validation and idempotence. No test sends real mail
or connects to the shared database.

## 2026-09-22 publication record

The user explicitly authorized publishing the corrected articles to Turso.

- Reviewed plan: `e9887aa202d1d24e23ab03f3e43a951e382e69e7eeb09a6cc578fac076b40b43`.
- Apply confirmed **2 rows updated** in one transaction.
- Backup: `.local/blog-backups/corrections-1790071380452-66e6a5a5-8ed4-4015-83f8-45f835d945dd.json`.
- Fresh database plan: **0 changed rows** for both bodies and excerpts.
- KV source body: 1,301 whitespace-delimited Markdown tokens; AVD: 1,010. These
  counts include markup and are not identical to rendered text word counts.
- All preserved fields verified inside the transaction. Three new drafts remain
  unpublished. The provider credential has not been rotated by this operation.
- After ISR regenerated, both canonical URLs returned HTTP 200 with cache HIT and
  the corrected text/summary. Old 200-seat, 87%, 8.6GB/275GB claims were absent.
  Live checks at 1440px and 390px showed one H1, valid JSON-LD and document width
  equal to viewport width. Mobile screenshots were inspected. Original publication
  dates remained October 3, 2025 and May 29, 2026.
- `npm test`: 172 passed. Full lint: zero errors, 12 existing warnings. This pass
  changes scripts/content only; no application code or dependency changes, so the
  application build was not rerun. RSS cache propagation was not independently
  verified. No Git commit/push of the new publisher was performed in this pass.
