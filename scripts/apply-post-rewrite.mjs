/** Replace one live post's title/excerpt/content from a reviewed file (title:, excerpt:, ---, body). Backs up first. */
import { readFile, mkdir, open } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
const [slug, file] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const raw = await readFile(file, 'utf8');
const m = /^title: (.+)\nexcerpt: (.+)\n---\n([\s\S]+)$/.exec(raw);
if (!m) throw new Error('Bad file format');
const [, title, excerpt, body] = m; const content = body.trim() + '\n';
if (title.length > 60 || excerpt.length > 155 || /[—–]/.test(raw) || /^# /m.test(content) || /^\|/m.test(content)) throw new Error('Guard failed');
if (!process.argv.includes('--apply')) { console.log({ slug, title, excerpt, words: content.split(/\s+/).length }); process.exit(0); }
dotenv.config({ path: '.env.local', quiet: true });
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const old = (await db.execute({ sql: 'SELECT * FROM posts WHERE slug=?', args: [slug] })).rows;
if (old.length !== 1) throw new Error('Post not found');
const dir = path.join(process.cwd(), '.local', 'blog-backups'); await mkdir(dir, { recursive: true, mode: 0o700 });
const f = await open(path.join(dir, `rewrite-${slug}-${Date.now()}-${randomUUID()}.json`), 'wx', 0o600); await f.writeFile(JSON.stringify(old)); await f.close();
await db.execute({ sql: 'UPDATE posts SET title=?, excerpt=?, content=? WHERE slug=?', args: [title, excerpt, content, slug] });
const check = (await db.execute({ sql: 'SELECT content FROM posts WHERE slug=?', args: [slug] })).rows[0].content;
if (check !== content) throw new Error('Verify failed; restore from backup');
db.close(); console.log({ applied: slug, title });
