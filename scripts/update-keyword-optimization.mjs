import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, readFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

const root = process.cwd();
const entries = [
  { slug: 'securing-azure-virtual-desktop-with-entra-id-and-passwordless-mfa', source: 'scripts/blog-content/02-avd-entra-id.md', excerpt: 'Azure Virtual Desktop MFA, Azure Active Directory passwordless authentication, Windows Virtual Desktop MFA, Entra SSO, and profile-storage prerequisites.' },
  { slug: 'kv-cache-memory-sizing-gqa-optimization', source: 'scripts/blog-content/drafts/draft-kv-cache-memory-sizing.md', excerpt: 'Calculate KV cache size and memory from model configuration, GQA head counts, retained tokens, precision, and serving overhead.' },
];
const sha = value => createHash('sha256').update(value).digest('hex');
const body = raw => raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/^\s*# [^\r\n]+\r?\n/, '').trim();

async function main() {
  if (!process.argv.includes('--apply')) { console.log(JSON.stringify({ mode: 'dry-run', slugs: entries.map(x => x.slug) })); return; }
  dotenv.config({ path: '.env.local', quiet: true });
  if (!process.env.TURSO_DATABASE_URL) throw new Error('TURSO_DATABASE_URL is not configured.');
  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN, intMode: 'bigint' });
  const desired = await Promise.all(entries.map(async x => ({ ...x, content: body(await readFile(path.join(root, x.source), 'utf8')) })));
  const placeholders = entries.map(() => '?').join(',');
  const result = await db.execute({ sql: `SELECT * FROM posts WHERE slug IN (${placeholders})`, args: entries.map(x => x.slug) });
  if (result.rows.length !== entries.length) throw new Error('Expected both keyword-optimization rows.');
  const rows = Object.fromEntries(result.rows.map(row => [row.slug, Object.fromEntries(result.columns.map((column, index) => [column, row[index]]))]));
  const payload = { createdAt: new Date().toISOString(), entries: desired.map(x => ({ slug: x.slug, beforeContent: sha(rows[x.slug].content), desiredContent: sha(x.content), beforeExcerpt: rows[x.slug].excerpt, desiredExcerpt: x.excerpt })) };
  const backupDir = path.join(root, '.local', 'blog-backups'); await mkdir(backupDir, { recursive: true, mode: 0o700 });
  const backupPath = path.join(backupDir, `keyword-optimization-${Date.now()}-${randomUUID()}.json`); const file = await open(backupPath, 'wx', 0o600); await file.writeFile(JSON.stringify({ payload, rows }, (_, value) => typeof value === 'bigint' ? { $bigint: value.toString() } : value, 2)); await file.sync(); await file.close();
  const tx = await db.transaction('write');
  try {
    for (const item of desired) {
      const row = rows[item.slug];
      const updated = await tx.execute({ sql: 'UPDATE posts SET content = ?, excerpt = ? WHERE id IS ? AND slug IS ? COLLATE BINARY AND content IS ? COLLATE BINARY AND excerpt IS ? COLLATE BINARY', args: [item.content, item.excerpt, row.id, item.slug, row.content, row.excerpt] });
      if (updated.rowsAffected !== 1) throw new Error(`Compare-and-swap failed for ${item.slug}`);
    }
    await tx.commit();
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); db.close(); }
  console.log(JSON.stringify({ mode: 'applied', backupPath, updated: desired.map(x => x.slug) }));
}
main().catch(error => { console.error(JSON.stringify({ error: error.message })); process.exitCode = 1; });
