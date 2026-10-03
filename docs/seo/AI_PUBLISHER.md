# AI draft publisher

The four approved AI articles were inserted into Turso on **2026-10-03** using
`scripts/publish-ai-drafts.mjs`.

```sh
# Review the exact staged dates and slugs. Read-only.
npm run blog:plan:new

# Apply the four-row insert with a private backup and one write transaction.
npm run blog:publish:new
```

The manifest is intentionally hard-coded to the four reviewed slugs and source
files. It refuses duplicate slugs, rejects front matter/body H1s and pipe tables,
backs up the intended rows as a private 0600 JSON record, inserts only the allowlist,
and verifies IDs, titles, covers and timestamps before commit. A failed first
attempt rolled back cleanly because its verification compared the wrong result key;
the corrected retry succeeded. The failed backup remains private under `.local`.

## Publication schedule

The latest existing article at inspection was `ego-lite-browser-for-ai-agents`,
published **2026-08-31**. New posts are staggered weekly, with no future dates:

| Date | Article |
| --- | --- |
| 2026-09-07 | KV cache memory sizing: GQA math and optimization |
| 2026-09-14 | Foundry Agent Service: a production readiness checklist |
| 2026-09-21 | Open WebUI + FastAPI: fix model discovery and streaming |
| 2026-09-28 | Prefix caching vs KV cache: what actually gets reused |

These dates are explicit editorial publication dates, not current-date claims. The
articles are now database-backed and will appear after the normal ISR/sitemap/RSS
cache windows regenerate. No indexing request was sent.

## Cover policy

The four cover files are deployed from `public/blog-covers/ai-editorial-2026-10-02/`.
They contain **no visible text**. Attribution and descriptions live in
`docs/design/ai-covers-2026-10-02/ASSET_PROVENANCE.md` and article alt metadata,
not inside the pixels. The original sources are preserved and rights notes remain
available. Covers are editorial metaphors, not product screenshots or evidence of
deployment performance.

## Verification

- Turso readback returned IDs **25–28** in chronological order and the exact four
  proposed cover paths/dates.
- The first failed transaction returned `Post verification failed; rolling back`;
  it inserted no durable rows. The subsequent run reported `mode: applied` and
  created a private backup.
- Existing application tests: **172 passed**. Draft-preview tests: **3 passed**.
  Editorial cover tests: **9 passed**. CSV analyzer self-tests: **3 passed**.
- Full lint remains **0 errors / 12 existing warnings**. Build passed with an
  isolated database fixture. The production deployment must rebuild before public
  article/asset verification.
- No credentials were printed or committed. No existing post was edited, deleted
  or re-dated. The four local draft pages remain review tools; new rows are now
  published in Turso and are not dependent on those routes.
