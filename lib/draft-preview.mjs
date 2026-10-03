import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { isDraftPreviewEnabled } from './draft-preview-access.mjs';
export { isDraftPreviewEnabled } from './draft-preview-access.mjs';

const SOURCES = Object.freeze({
  'kv-cache-memory-sizing-gqa-optimization': 'draft-kv-cache-memory-sizing.md',
  'foundry-agent-service-production-checklist': '2026-10-02/foundry-agent-service-production-checklist.md',
  'openwebui-fastapi-model-discovery-streaming': '2026-10-02/openwebui-fastapi-model-discovery-streaming.md',
  'prefix-caching-vs-kv-cache': '2026-10-02/prefix-caching-vs-kv-cache.md',
});

async function readDraft(slug) {
  // User-controlled slugs only select a fixed file, never a filesystem path.
  const raw = await readFile(path.join(process.cwd(), 'scripts', 'blog-content', 'drafts', SOURCES[slug]), 'utf8');
  const parsed = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!parsed) throw new Error('Draft metadata is invalid.');
  const value = (key) => {
    const encoded = new RegExp(`^${key}: (".*")$`, 'm').exec(parsed[1])?.[1];
    if (!encoded) throw new Error('Required draft metadata is missing.');
    return JSON.parse(encoded);
  };
  if (value('status') !== 'NOT APPROVED FOR PUBLICATION' || value('proposed_slug') !== slug) {
    throw new Error('Draft status or identity is invalid.');
  }
  const cover = value('proposed_cover');
  if (!/^\/blog-covers\/ai-editorial-2026-10-02\/[a-z-]+\.webp$/.test(cover)) {
    throw new Error('Draft cover is outside the review asset directory.');
  }
  // The retained sizing draft has an editorial H1; the page renders its own H1.
  const content = parsed[2].replace(/^\s*# [^\r\n]+\r?\n/, '').trim();
  return { slug, title: value('proposed_title'), excerpt: value('proposed_excerpt'),
    cover, coverAlt: value('proposed_cover_alt'), content,
    words: content.split(/\s+/).length };
}

export async function listLocalDrafts(env = process.env, host = '') {
  if (!isDraftPreviewEnabled(env, host)) return [];
  return Promise.all(Object.keys(SOURCES).map(readDraft));
}

export async function getLocalDraft(slug, env = process.env, host = '') {
  if (!isDraftPreviewEnabled(env, host) || !Object.hasOwn(SOURCES, slug)) return null;
  return readDraft(slug);
}
