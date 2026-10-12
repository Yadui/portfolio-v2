import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);

test('Frieren soundtrack is not shipped as a public asset or mounted site-wide', () => {
  const track = new URL('public/assets/audio/Time Flows Ever Onward.mp3', root);
  const layout = readFileSync(new URL('app/layout.tsx', root), 'utf8');
  assert.equal(existsSync(track), false);
  assert.doesNotMatch(layout, /AudioPlayer/);
});
