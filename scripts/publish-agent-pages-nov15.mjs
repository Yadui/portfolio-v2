/** One-time, hash-confirmed insert. Never updates or replaces existing posts. */
import { createHash, randomUUID } from 'node:crypto';
import { readFile, mkdir, open } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

const root = process.cwd();
const slug = 'openchamber-agent-pages-visual-decisions';
const source = path.join(root, 'scripts/blog-content/drafts/2026-11-15', `${slug}.md`);
const digest = value => createHash('sha256').update(value).digest('hex');

async function main() {
  const raw = await readFile(source, 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!match) throw new Error('Invalid front matter');
  const value = key => JSON.parse(new RegExp(`^${key}: (".*")$`, 'm').exec(match[1])?.[1] || 'null');
  const tags = /^proposed_tags: \[([^\]]+)\]$/m.exec(match[1])?.[1];
  const content = match[2].trim();
  const title = value('proposed_title'), excerpt = value('proposed_excerpt'), cover = value('proposed_cover');
  if (value('status') !== 'APPROVED FOR PUBLICATION BY USER' || value('proposed_slug') !== slug) throw new Error('Unapproved identity');
  if (!title || title.length > 65 || !excerpt || excerpt.length > 155 || !tags || !cover) throw new Error('Invalid metadata');
  if (!content.startsWith('## ') || /^# /m.test(content) || /TBD|TODO|proposed_title:/.test(content)) throw new Error('Unfinished article');
  const coverBytes = await readFile(path.join(root, 'public', cover));
  const planHash = digest(raw + digest(coverBytes));
  if (!process.argv.includes('--apply')) {
    console.log(JSON.stringify({ mode: 'dry-run', slug, title, excerpt, words: content.split(/\s+/).length,
      cover, publicationTime: 'actual time of insertion', planHash }, null, 2));
    return;
  }
  if (process.argv[process.argv.indexOf('--apply') + 1] !== planHash) throw new Error('Exact reviewed plan hash required');
  dotenv.config({ path: '.env.local', quiet: true });
  if (!process.env.TURSO_DATABASE_URL) throw new Error('Database environment missing');
  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  const tx = await db.transaction('write');
  let backupPath;
  try {
    const duplicates = await tx.execute({ sql: 'SELECT id FROM posts WHERE slug=?', args: [slug] });
    if (duplicates.rows.length) throw new Error('Slug already exists; refusing duplicate publication');
    const before = await tx.execute('SELECT * FROM posts ORDER BY id');
    const payload = JSON.stringify({ timestamp: new Date().toISOString(), planHash, source, posts: before.rows });
    const dir = path.join(root, '.local/blog-backups');
    await mkdir(dir, { recursive: true, mode: 0o700 });
    backupPath = path.join(dir, `agent-pages-${Date.now()}-${randomUUID()}.json`);
    const file = await open(backupPath, 'wx', 0o600);
    try { await file.writeFile(payload); await file.sync(); } finally { await file.close(); }
    if (digest(await readFile(backupPath)) !== digest(payload)) throw new Error('Backup verification failed');
    const createdAt = Math.floor(Date.now() / 1000);
    await tx.execute({ sql: 'INSERT INTO posts (slug,title,excerpt,content,cover_image,tags,created_at) VALUES (?,?,?,?,?,?,?)',
      args: [slug, title, excerpt, content, cover, tags, createdAt] });
    const stored = (await tx.execute({ sql: 'SELECT * FROM posts WHERE slug=?', args: [slug] })).rows[0];
    if (stored?.content !== content || stored?.title !== title || stored?.excerpt !== excerpt || stored?.cover_image !== cover || Number(stored?.created_at) !== createdAt) throw new Error('Inserted article verification failed');
    await tx.commit();
    console.log(JSON.stringify({ mode: 'published', slug, id: stored.id, createdAt, backupPath, planHash }));
  } catch (e) { await tx.rollback(); throw e; }
  finally { tx.close(); db.close(); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
