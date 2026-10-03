import assert from 'node:assert/strict';
import { test } from 'node:test';

const load = () => import('../lib/draft-preview.mjs');
const local = { NODE_ENV: 'development', PORTFOLIO_DRAFT_PREVIEW: '1' };

test('draft preview requires explicit development mode and a local host', async () => {
  const { isDraftPreviewEnabled } = await load();
  assert.equal(isDraftPreviewEnabled(local, 'localhost:3100'), true);
  assert.equal(isDraftPreviewEnabled(local, '127.0.0.1:3100'), true);
  assert.equal(isDraftPreviewEnabled(local, '[::1]:3100'), true);
  for (const host of ['yadui.dev', 'localhost.evil.test', 'evil.test:3100', '', 'localhost:bad']) {
    assert.equal(isDraftPreviewEnabled(local, host), false);
  }
  for (const env of [{}, { ...local, NODE_ENV: 'production' }, { ...local, PORTFOLIO_DRAFT_PREVIEW: '' }, { ...local, VERCEL_ENV: 'preview' }]) {
    assert.equal(isDraftPreviewEnabled(env, 'localhost:3100'), false);
  }
});

test('four allowlisted local drafts contain body and approved asset assignments, without editorial headers', async () => {
  const { listLocalDrafts } = await load();
  const drafts = await listLocalDrafts(local, 'localhost:3100');
  assert.equal(drafts.length, 4);
  assert.equal(new Set(drafts.map(x => x.slug)).size, 4);
  for (const draft of drafts) {
    assert.ok(draft.title);
    assert.ok(draft.excerpt);
    assert.ok(draft.coverAlt);
    assert.match(draft.cover, /^\/blog-covers\/ai-editorial-2026-10-02\/[a-z-]+\.webp$/);
    assert.doesNotMatch(draft.content, /^# /m);
    assert.doesNotMatch(draft.content, /^(status:|proposed_title:|\*\*Published:\*\*)/m);
  }
});

test('production and unknown slugs do not load or expose draft contents', async () => {
  const { listLocalDrafts, getLocalDraft } = await load();
  assert.deepEqual(await listLocalDrafts({ ...local, NODE_ENV: 'production' }, 'localhost:3100'), []);
  assert.equal(await getLocalDraft('../.env.local', local, 'localhost:3100'), null);
  assert.equal(await getLocalDraft('unknown', local, 'localhost:3100'), null);
  assert.equal(await getLocalDraft('kv-cache-memory-sizing-gqa-optimization', local, 'yadui.dev'), null);
});
