import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

const root = process.cwd();
const backupDir = path.join(root, '.local', 'blog-backups');
const manifest = [
  { slug: 'kv-cache-memory-sizing-gqa-optimization', source: 'scripts/blog-content/drafts/draft-kv-cache-memory-sizing.md', title: 'KV cache memory sizing: GQA math and optimization', excerpt: 'Calculate KV cache bytes from model configuration, work through a Qwen example, and compare context limits, quantization and offloading.', tags: 'LLM, KV Cache, Inference, GQA, Memory, Transformers', cover: '/blog-covers/ai-editorial-2026-10-02/kv-memory.webp', createdAt: '2026-09-07T09:00:00.000Z' },
  { slug: 'foundry-agent-service-production-checklist', source: 'scripts/blog-content/drafts/2026-10-02/foundry-agent-service-production-checklist.md', title: 'Foundry Agent Service: a production readiness checklist', excerpt: 'Check Foundry agent identity, tool permissions, conversation state, retries and evaluation before exposing a production endpoint.', tags: 'Microsoft Foundry, Azure, AI Agents, Identity, Production', cover: '/blog-covers/ai-editorial-2026-10-02/foundry-boundaries.webp', createdAt: '2026-09-14T09:00:00.000Z' },
  { slug: 'openwebui-fastapi-model-discovery-streaming', source: 'scripts/blog-content/drafts/2026-10-02/openwebui-fastapi-model-discovery-streaming.md', title: 'Open WebUI + FastAPI: fix model discovery and streaming', excerpt: 'Diagnose missing models, bearer-auth failures and buffered chat streams when connecting an OpenAI-compatible FastAPI backend to Open WebUI.', tags: 'Open WebUI, FastAPI, OpenAI Compatible, Streaming, API Design', cover: '/blog-covers/ai-editorial-2026-10-02/openwebui-stream.webp', createdAt: '2026-09-21T09:00:00.000Z' },
  { slug: 'prefix-caching-vs-kv-cache', source: 'scripts/blog-content/drafts/2026-10-02/prefix-caching-vs-kv-cache.md', title: 'Prefix caching vs KV cache: what actually gets reused', excerpt: 'Separate decode-time KV reuse from cross-request prefix caching, diagnose cache misses, and keep vLLM controls distinct from hosted provider APIs.', tags: 'LLM, KV Cache, Prefix Caching, vLLM, Inference', cover: '/blog-covers/ai-editorial-2026-10-02/prefix-reuse.webp', createdAt: '2026-09-28T09:00:00.000Z' },
];
const sha = (x) => createHash('sha256').update(x).digest('hex');
const clean = (raw, slug) => {
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/^\s*# [^\r\n]+\r?\n/, '').trim();
  if (!body || /^# /m.test(body) || /^\|/m.test(body)) throw new Error(`Unsafe body: ${slug}`);
  return body;
};

async function run() {
  const apply = process.argv.includes('--apply');
  if (!apply) { console.log(JSON.stringify({ mode: 'dry-run', articles: manifest.map(x => ({ slug: x.slug, date: x.createdAt })) })); return; }
  dotenv.config({ path: '.env.local', quiet: true });
  if (!process.env.TURSO_DATABASE_URL) throw new Error('TURSO_DATABASE_URL is not configured.');
  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN, intMode: 'bigint' });
  const articles = await Promise.all(manifest.map(async x => ({ ...x, content: clean(await readFile(path.join(root, x.source), 'utf8'), x.slug) })));
  const existing = await db.execute('SELECT slug FROM posts WHERE slug IN (' + manifest.map(() => '?').join(',') + ')', manifest.map(x => x.slug));
  if (existing.rows.length) throw new Error(`Refusing duplicate slugs: ${existing.rows.map(x => x.slug).join(', ')}`);
  const payload = { version: 1, createdAt: new Date().toISOString(), articles: articles.map(({ content, ...x }) => ({ ...x, contentDigest: sha(content) })) };
  await mkdir(backupDir, { recursive: true, mode: 0o700 });
  const backupPath = path.join(backupDir, `ai-drafts-${Date.now()}-${randomUUID()}.json`);
  const backup = JSON.stringify(payload, null, 2) + '\n';
  const file = await open(backupPath, 'wx', 0o600); await file.writeFile(backup); await file.sync(); await file.close();
  const tx = await db.transaction('write');
  try {
    for (const article of articles) await tx.execute({ sql: 'INSERT INTO posts (title,slug,content,excerpt,cover_image,tags,created_at) VALUES (?,?,?,?,?,?,?)', args: [article.title, article.slug, article.content, article.excerpt, article.cover, article.tags, Math.floor(Date.parse(article.createdAt) / 1000)] });
    const rows = await tx.execute({ sql: 'SELECT slug,title,created_at,cover_image FROM posts WHERE slug IN (' + manifest.map(() => '?').join(',') + ')', args: manifest.map(x => x.slug) });
    if (rows.rows.length !== articles.length || rows.rows.some(row => !articles.some(x => x.slug === row.slug && x.title === row.title && x.cover === row.cover_image && String(row.created_at) === String(Math.floor(Date.parse(x.createdAt) / 1000))))) throw new Error('Post verification failed; rolling back.');
    await tx.commit();
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); db.close(); }
  console.log(JSON.stringify({ mode: 'applied', articles: articles.map(x => ({ slug: x.slug, createdAt: x.createdAt })), backupPath }));
}
run().catch(error => { console.error(JSON.stringify({ error: error.message })); process.exitCode = 1; });
