import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('docs/design/ai-covers-2026-10-02/covers.json', root), 'utf8'));
const drafts = {
  'foundry-agent-service-production-checklist': 'scripts/blog-content/drafts/2026-10-02/foundry-agent-service-production-checklist.md',
  'openwebui-fastapi-model-discovery-streaming': 'scripts/blog-content/drafts/2026-10-02/openwebui-fastapi-model-discovery-streaming.md',
  'prefix-caching-vs-kv-cache': 'scripts/blog-content/drafts/2026-10-02/prefix-caching-vs-kv-cache.md',
  'kv-cache-memory-sizing-gqa-optimization': 'scripts/blog-content/drafts/draft-kv-cache-memory-sizing.md',
};

test('four distinct cover assets map to four unpublished article intents', () => {
  assert.equal(manifest.length, 4);
  assert.equal(new Set(manifest.map(x => x.key)).size, 4);
  assert.equal(new Set(manifest.map(x => x.slug)).size, 4);
  assert.equal(new Set(manifest.map(x => x.sha256)).size, 4);
  assert.equal(new Set(manifest.map(x => x.layout)).size, 4);
});

for (const cover of manifest) {
  test(`${cover.key}: real WebP dimensions, byte budget, digest and supported crops`, async () => {
    assert.match(cover.path, /^\/blog-covers\/ai-editorial-2026-10-02\/[a-z-]+\.webp$/);
    const data = await readFile(new URL('public' + cover.path, root));
    const meta = await sharp(data).metadata();
    assert.equal(meta.format, 'webp');
    assert.equal(meta.width, 1600);
    assert.equal(meta.height, 840);
    assert.equal(data.length, cover.bytes);
    assert.ok(data.length < 300_000);
    assert.equal(createHash('sha256').update(data).digest('hex'), cover.sha256);
    assert.ok(cover.alt.length >= 40);
    const cropped = await sharp(data).resize(260, 164, { fit: 'cover' }).toBuffer();
    const crop = await sharp(cropped).metadata();
    assert.equal(crop.width, 260);
    assert.equal(crop.height, 164);
  });

  test(`${cover.key}: draft declares correct proposed cover without publication metadata`, async () => {
    const source = await readFile(new URL(drafts[cover.slug], root), 'utf8');
    const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(source)?.[1];
    assert.ok(frontmatter);
    assert.match(frontmatter, /status: "NOT APPROVED FOR PUBLICATION"/);
    assert.ok(frontmatter.includes(`proposed_slug: "${cover.slug}"`));
    assert.ok(frontmatter.includes(`proposed_cover: "${cover.path}"`));
    assert.ok(frontmatter.includes(`proposed_cover_alt: "${cover.alt}"`));
    assert.doesNotMatch(frontmatter, /^published_at:/m);
    if (drafts[cover.slug].includes('/2026-10-02/')) {
      const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
      assert.doesNotMatch(body, /^# /m);
      assert.doesNotMatch(body, /^\|[- :|]+\|$/m);
      assert.ok(body.trim(), 'An asset must map to an authored article, not an empty draft');
    }
  });
}
