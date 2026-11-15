/** Guarded Nov 15 updates: outage post restoration/RCA update + CTR title/description rewrites. */
import { createHash, randomUUID } from 'node:crypto';
import { readFile, mkdir, open } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

const outageContent = await readFile('.local/seo-nov15/outage.new.md', 'utf8');
const edits = {
  'outlook-microsoft-365-outage-november-13-2026': {
    title: 'Outlook and Microsoft 365 outage: cause and timeline',
    excerpt: "The Nov 12-13 Outlook and Microsoft 365 outage is over. Timeline, affected features and Microsoft's preliminary root cause, ahead of the final report.",
    content: outageContent,
  },
  'github-actions-persist-credentials-security': {
    title: 'persist-credentials: false in actions/checkout, explained',
    excerpt: 'What persist-credentials: false does in actions/checkout, why the default token left on disk is risky, and how to still push from a workflow.',
  },
  'php2shell-cve-2026-109618-109619-patch-guide': {
    title: 'PHP2Shell (CVE-2026-109618): am I affected? Patch guide',
    excerpt: 'Check if PHP2Shell affects your server, including distro PHP packages, which PHP versions fix it, and the stopgap to apply right now.',
  },
  'securing-azure-virtual-desktop-with-entra-id-and-passwordless-mfa': {
    title: 'AVD MFA and SSO with Entra: passwordless setup for VDI',
    excerpt: 'Set up MFA and single sign-on for Azure Virtual Desktop (AVD) with Entra ID: Conditional Access, SSO, passwordless sign-in and FSLogix.',
  },
};

for (const [slug, e] of Object.entries(edits)) {
  if (e.title.length > 60 || e.excerpt.length > 155) throw new Error(`Length guard: ${slug} ${e.title.length}/${e.excerpt.length}`);
  if (/[—–]/.test(e.title + e.excerpt + (e.content || ''))) throw new Error(`Dash guard: ${slug}`);
}
const planHash = createHash('sha256').update(JSON.stringify(edits)).digest('hex');
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ planHash, edits: Object.fromEntries(Object.entries(edits).map(([s, e]) => [s, { title: e.title, excerpt: e.excerpt, contentWords: e.content?.split(/\s+/).length }])) }, null, 1));
  process.exit(0);
}
if (process.argv[process.argv.indexOf('--apply') + 1] !== planHash) throw new Error('Exact reviewed plan hash required');
dotenv.config({ path: '.env.local', quiet: true });
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const slugs = Object.keys(edits);
const rows = (await db.execute({ sql: `SELECT * FROM posts WHERE slug IN (${slugs.map(() => '?').join(',')})`, args: slugs })).rows;
if (rows.length !== slugs.length) throw new Error('Missing post');
const dir = path.join(process.cwd(), '.local', 'blog-backups'); await mkdir(dir, { recursive: true, mode: 0o700 });
const backupPath = path.join(dir, `seo-nov15-${Date.now()}-${randomUUID()}.json`);
const f = await open(backupPath, 'wx', 0o600); await f.writeFile(JSON.stringify(rows)); await f.sync(); await f.close();
const tx = await db.transaction('write');
try {
  for (const row of rows) {
    const e = edits[row.slug];
    await tx.execute({ sql: 'UPDATE posts SET title=?, excerpt=?, content=? WHERE slug=?', args: [e.title, e.excerpt, e.content ?? row.content, row.slug] });
  }
  const check = (await tx.execute({ sql: `SELECT slug,title,excerpt,content FROM posts WHERE slug IN (${slugs.map(() => '?').join(',')})`, args: slugs })).rows;
  for (const r of check) { const e = edits[r.slug]; if (r.title !== e.title || r.excerpt !== e.excerpt || (e.content && r.content !== e.content)) throw new Error('Verify failed'); }
  await tx.commit();
} catch (err) { await tx.rollback(); throw err; } finally { tx.close(); db.close(); }
console.log(JSON.stringify({ applied: slugs, backupPath }));
