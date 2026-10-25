import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);

test('sitemap is rendered per request so DB-only posts appear without a redeploy', () => {
  const sitemap = readFileSync(new URL('app/sitemap.ts', root), 'utf8');
  assert.match(sitemap, /export const dynamic = "force-dynamic"/);
  assert.doesNotMatch(sitemap, /export const revalidate/);
});
