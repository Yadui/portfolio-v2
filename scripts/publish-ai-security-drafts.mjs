/** Guarded insert of the October 2026 AI/security drafts (threat-model post deliberately held). */
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

const root = process.cwd();
const backupDir = path.join(root, '.local', 'blog-backups');
const dir = 'scripts/blog-content/drafts/2026-10-24';
const slugs = ['prompt-injection-to-code-execution-agent-frameworks', 'stop-giving-ai-agents-production-keys', 'ai-agent-kill-switch-egress-gateway', 'php2shell-cve-2026-109618-109619-patch-guide', 'litellm-1-107-0-incident-response-ai-gateways', 'railway-emudhra-sbi-breaches-explained'];
const fm = (raw, key) => { const m = new RegExp(`^${key}: (.*)$`, 'm').exec(raw.split(/\r?\n---\r?\n/)[0]); if (!m) throw new Error(`Missing ${key}`); return m[1]; };
// Front matter is the single source of truth; dates are 09:00Z except today's post (03:00Z, already past).
const manifest = await Promise.all(slugs.map(async (slug) => {
  const source = `${dir}/${slug}.md`;
  const raw = await readFile(path.join(root, source), 'utf8');
  if (JSON.parse(fm(raw, 'proposed_slug')) !== slug) throw new Error(`Slug mismatch: ${slug}`);
  const date = JSON.parse(fm(raw, 'proposed_date'));
  const tags = fm(raw, 'proposed_tags').replace(/^\[|\]$/g, '').split(',').map(x => x.trim().replace(/^"|"$/g, '')).join(', ');
  return { slug, source, title: JSON.parse(fm(raw, 'proposed_title')), excerpt: JSON.parse(fm(raw, 'proposed_excerpt')), tags,
    cover: JSON.parse(fm(raw, 'proposed_cover')), createdAt: `${date}T${date === '2026-10-24' ? '03' : '09'}:00:00.000Z` };
}));
for (const x of manifest) if (Date.parse(x.createdAt) > Date.now()) throw new Error(`Future date refused: ${x.slug}`);
const sha = (x) => createHash('sha256').update(x).digest('hex');
const clean = (raw, slug) => {
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/^\s*# [^\r\n]+\r?\n/, '').trim();
  if (!body || /^# /m.test(body) || /^\|/m.test(body)) throw new Error(`Unsafe body: ${slug}`);
  return body;
};

async function run() {
  const apply = process.argv.includes('--apply');
  if (!apply) { console.log(JSON.stringify({ mode: 'dry-run', articles: manifest.map(({ slug, title, createdAt, tags, cover, excerpt }) => ({ slug, title, createdAt, tags, cover, excerptLength: excerpt.length })) })); return; }
  dotenv.config({ path: '.env.local', quiet: true });
  if (!process.env.TURSO_DATABASE_URL) throw new Error('TURSO_DATABASE_URL is not configured.');
  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN, intMode: 'bigint' });
  const articles = await Promise.all(manifest.map(async x => ({ ...x, content: clean(await readFile(path.join(root, x.source), 'utf8'), x.slug) })));
  const existing = await db.execute('SELECT slug FROM posts WHERE slug IN (' + manifest.map(() => '?').join(',') + ')', manifest.map(x => x.slug));
  if (existing.rows.length) throw new Error(`Refusing duplicate slugs: ${existing.rows.map(x => x.slug).join(', ')}`);
  const payload = { version: 1, createdAt: new Date().toISOString(), articles: articles.map(({ content, ...x }) => ({ ...x, contentDigest: sha(content) })) };
  await mkdir(backupDir, { recursive: true, mode: 0o700 });
  const backupPath = path.join(backupDir, `ai-security-drafts-${Date.now()}-${randomUUID()}.json`);
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
