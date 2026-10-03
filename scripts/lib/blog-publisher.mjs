import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, open, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ALLOWED = Object.freeze({
  'securing-azure-virtual-desktop-with-entra-id-and-passwordless-mfa': 'scripts/blog-content/02-avd-entra-id.md',
  'llm-kv-cache-why-not-query': 'scripts/blog-content/13-llm-kv-cache-why-not-query.md',
});
const COLUMNS = ['id', 'title', 'slug', 'content', 'excerpt', 'cover_image', 'tags', 'created_at'];
const SHA256 = /^[a-f0-9]{64}$/;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

// Only deliberately authored messages may cross the CLI logging boundary.
export class PublisherError extends Error {}
const refuse = (message) => { throw new PublisherError(message); };

// Sorted keys plus tagged integers/blobs preserve full SQLite values in plans/backups.
// Backup readers restore {$bigint: decimal} / {$bytes: base64} to native bind values.
export function canonicalJson(value) {
  return JSON.stringify(value, (_key, item) => {
    if (typeof item === 'bigint') return { $bigint: item.toString() };
    if (item instanceof ArrayBuffer) return { $bytes: Buffer.from(item).toString('base64') };
    if (ArrayBuffer.isView(item)) return { $bytes: Buffer.from(item.buffer, item.byteOffset, item.byteLength).toString('base64') };
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      return Object.fromEntries(Object.keys(item).sort().map((key) => [key, item[key]]));
    }
    return item;
  });
}

export function parseArgs(args) {
  if (args.length === 1 && args[0] === '--help') return { help: true };
  const options = { apply: false, backupDir: '.local/blog-backups', envFile: '.env.local' };
  const seen = new Set();
  const values = { '--expect-plan': 'expectPlan', '--backup-dir': 'backupDir', '--env-file': 'envFile' };
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (seen.has(flag)) refuse('Duplicate CLI flag. See --help.');
    seen.add(flag);
    if (flag === '--apply') options.apply = true;
    else if (flag === '--dry-run') options.apply = false;
    else if (Object.hasOwn(values, flag)) {
      const value = args[++i];
      if (!value || value.startsWith('--') || /[\x00-\x1f\x7f]/.test(value)) refuse('Missing or invalid CLI value. See --help.');
      options[values[flag]] = value;
    } else refuse('Unknown CLI flag. See --help.');
  }
  if (seen.has('--apply') && seen.has('--dry-run')) refuse('Conflicting CLI modes.');
  if (options.apply ? !SHA256.test(options.expectPlan || '') : options.expectPlan !== undefined) {
    refuse('Apply requires --expect-plan with the exact SHA256 from a previous dry-run.');
  }
  return options;
}

// No credentials, query parameters or fragments are accepted in target URLs.
// Local files must already exist, so even a dry-run cannot create a database.
export async function normalizeDatabaseTarget(raw) {
  try {
    if (typeof raw !== 'string' || !raw || raw !== raw.trim()) throw new Error();
    if (raw === 'file::memory:') return raw;
    const url = new URL(raw);
    if (url.username || url.password || url.search || url.hash) throw new Error();
    if (url.protocol === 'file:') {
      if (url.hostname && url.hostname !== 'localhost') throw new Error();
      const local = raw.startsWith('file://') ? fileURLToPath(url) : path.resolve(decodeURIComponent(raw.slice(5)));
      const resolved = await realpath(local);
      if (!(await lstat(resolved)).isFile()) throw new Error();
      return pathToFileURL(resolved).href;
    }
    if (!['libsql:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error();
    url.hostname = url.hostname.toLowerCase();
    if (url.port === '443') url.port = '';
    return url.href.replace(/\/$/, '');
  } catch {
    refuse('Invalid database target; use an existing local file or a credential-free libsql/HTTPS URL.');
  }
}

export async function targetFingerprint(raw) {
  return sha256(await normalizeDatabaseTarget(raw));
}

export function prepareContent(source, slug) {
  if (typeof source !== 'string' || !source.trim()) refuse('Article source is empty.');
  if (!Object.hasOwn(ALLOWED, slug)) refuse('Article slug is outside the manifest allowlist.');
  if (/^(?:---|\+\+\+)(?:\r?\n|$)/.test(source.trimStart())) refuse('Article front matter must be removed before publishing.');
  let content = source;
  // The ONLY stripped metadata is the documented, exact legacy KV header.
  // AVD starts with ## and is passed through byte-for-byte, as are modern KV bodies.
  if (slug === 'llm-kv-cache-why-not-query') {
    content = content.replace(/^# Why LLM Inference Caches K and V but Never Q\r?\n\r?\n\*\*Published:\*\* May 29, 2026 {0,2}\r?\n\*\*Tags:\*\* LLM, AI, Machine Learning, Inference, Transformers, Performance\r?\n\r?\n---\r?\n\r?\n/, '');
  }
  if (/^(?:---|\+\+\+)(?:\r?\n|$)/.test(content.trimStart())) refuse('Article front matter must be removed before publishing.');
  if (!content.trim()) refuse('Article source is empty after preamble removal.');
  let fence = null;
  let previous = '';
  for (const line of content.split(/\r?\n/)) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && line.slice(marker[0].length).trim() === '') fence = null;
      continue;
    }
    if (marker) { fence = marker[1]; previous = ''; continue; }
    if (/^ {0,3}#(?:\s|$)/.test(line) || /<h1(?:\s|>)/i.test(line) || (previous.trim() && /^ {0,3}=+\s*$/.test(line))) refuse('Article body must not contain an H1.');
    if (/^\s*(?:(?:#{1,6}|>|\*\*)\s*)?(?:draft\b|(?:status|publication status)\s*:?\*{0,2}:?\s*draft\b)/i.test(line)) refuse('Article contains a draft label.');
    if (/^\s*\|?\s*:?-{3,}:?\s*\|\s*:?-{3,}:?(?:\s*\|.*)?\s*$/.test(line)) refuse('Convert pipe tables to supported Markdown lists before publishing.');
    previous = line;
  }
  if (fence) refuse('Article contains an unclosed code fence.');
  return content;
}

export async function loadCorrections(repoRoot) {
  const root = await realpath(repoRoot);
  let manifest;
  try { manifest = JSON.parse(await readFile(path.join(root, 'scripts/blog-corrections.json'), 'utf8')); }
  catch { refuse('Cannot read corrections manifest.'); }
  if (!Array.isArray(manifest) || manifest.length !== 2) refuse('Corrections manifest must contain exactly the two existing articles.');
  const seen = new Set();
  const articles = [];
  for (const item of manifest) {
    if (!item || typeof item !== 'object' || Object.keys(item).sort().join(',') !== 'excerpt,slug,source' ||
        !Object.hasOwn(ALLOWED, item.slug) || seen.has(item.slug) || item.source !== ALLOWED[item.slug]) refuse('Invalid manifest slug, source, or fields.');
    seen.add(item.slug);
    if (typeof item.excerpt !== 'string' || !item.excerpt.trim() || item.excerpt !== item.excerpt.trim() ||
        [...item.excerpt].length > 155 || /[\r\n\x00]/.test(item.excerpt)) refuse('Manifest excerpt must be plain text, nonempty, and at most 155 characters.');
    const filename = path.join(root, item.source);
    let source;
    try {
      // Equality also rejects symlinked parent directories and draft/outside targets.
      if (await realpath(filename) !== filename || !(await lstat(filename)).isFile()) throw new Error();
      source = await readFile(filename, 'utf8');
    } catch { refuse('Cannot load the exact allowlisted article source.'); }
    articles.push({ ...item, sourceDigest: sha256(source), content: prepareContent(source, item.slug) });
  }
  return articles.sort((a, b) => a.slug.localeCompare(b.slug, 'en'));
}

async function readRows(db, articles) {
  const schema = await db.execute('PRAGMA table_info(posts)');
  const names = schema.rows.map((row) => row.name);
  if (COLUMNS.some((name) => !names.includes(name))) refuse('Posts schema is missing required columns.');
  const rows = [];
  for (const article of articles) {
    const result = await db.execute({ sql: 'SELECT * FROM posts WHERE slug = ? COLLATE BINARY', args: [article.slug] });
    if (result.rows.length !== 1) refuse('Expected exactly one existing row for each manifest slug.');
    const row = Object.fromEntries(result.columns.map((name) => [name, result.rows[0][name]]));
    if (row.slug !== article.slug || row.id === null || !['number', 'bigint'].includes(typeof row.id)) refuse('Existing article identity is invalid.');
    if (![row.content, row.excerpt].every((value) => value === null || typeof value === 'string')) refuse('Existing content/excerpt must be text or null.');
    rows.push(row);
  }
  return rows;
}

function makePlan(fingerprint, articles, rows) {
  const entries = articles.map((article, i) => ({
    slug: article.slug, source: article.source, sourceDigest: article.sourceDigest,
    before: rows[i], desired: { content: article.content, excerpt: article.excerpt },
  }));
  const identity = { version: 1, targetFingerprint: fingerprint, articles: entries };
  return { ...identity, planHash: sha256(canonicalJson(identity)) };
}

const changed = (entry) => entry.before.content !== entry.desired.content || entry.before.excerpt !== entry.desired.excerpt;
const wordCount = (text) => text?.trim() ? text.trim().split(/\s+/u).length : 0;

function summary(plan, mode, backupPath = null) {
  return {
    mode, planHash: plan.planHash, changedRows: plan.articles.filter(changed).length, backupPath,
    articles: plan.articles.map(({ slug, before, desired }) => ({
      slug, contentChanged: before.content !== desired.content, excerptChanged: before.excerpt !== desired.excerpt,
      beforeWords: wordCount(before.content), afterWords: wordCount(desired.content),
    })),
  };
}

async function syncDirectory(directory) {
  const handle = await open(directory, 'r');
  try { await handle.sync(); } finally { await handle.close(); }
}

async function writeBackup(plan, backupDir) {
  try {
    const directory = path.resolve(backupDir);
    const firstCreated = await mkdir(directory, { recursive: true, mode: 0o700 });
    const payload = {
      version: 1, createdAt: new Date().toISOString(), planHash: plan.planHash,
      targetFingerprint: plan.targetFingerprint,
      articles: plan.articles.map(({ slug, source, sourceDigest, before, desired }) => ({
        slug, source, sourceDigest, before, desired,
        beforeDigest: sha256(canonicalJson(before)), desiredDigest: sha256(canonicalJson(desired)),
      })),
    };
    const bytes = canonicalJson({ payload, sha256: sha256(canonicalJson(payload)) }) + '\n';
    const filename = path.join(directory, `corrections-${Date.now()}-${randomUUID()}.json`);
    const file = await open(filename, 'wx', 0o600);
    try { await file.writeFile(bytes, 'utf8'); await file.sync(); }
    finally { await file.close(); }
    // Persist the directory entry, including every directory newly created above it.
    await syncDirectory(directory);
    if (firstCreated) {
      const stop = path.dirname(firstCreated);
      let current = directory;
      while (current !== stop) { current = path.dirname(current); await syncDirectory(current); }
    }
    const info = await lstat(filename);
    const readBack = await readFile(filename, 'utf8');
    const verified = JSON.parse(readBack);
    if (!info.isFile() || (info.mode & 0o777) !== 0o600 || info.nlink !== 1 || readBack !== bytes ||
        sha256(canonicalJson(verified.payload)) !== verified.sha256) throw new Error();
    return filename;
  } catch { refuse('Durable backup creation or read-back verification failed; no article updates attempted.'); }
}

// Caller owns the client. CLI below always closes it; tests use only disposable SQLite.
export async function publishCorrections({ client, databaseUrl, repoRoot, apply = false, expectPlan, backupDir = path.join(repoRoot, '.local/blog-backups') }) {
  if (typeof apply !== 'boolean' || (apply ? !SHA256.test(expectPlan || '') : expectPlan !== undefined)) refuse('Invalid apply mode or expected plan hash.');
  const articles = await loadCorrections(repoRoot);
  const fingerprint = await targetFingerprint(databaseUrl);
  const plan = makePlan(fingerprint, articles, await readRows(client, articles));
  if (!apply) return summary(plan, 'dry-run');
  if (plan.planHash !== expectPlan) refuse('Expected plan hash does not match. Run a new dry-run and review it.');
  if (!plan.articles.some(changed)) return summary(plan, 'no-op');

  const tx = await client.transaction('write');
  try {
    // Re-read sources as well as full rows under the write lock. No stale dry-run data.
    const freshArticles = await loadCorrections(repoRoot);
    const fresh = makePlan(await targetFingerprint(databaseUrl), freshArticles, await readRows(tx, freshArticles));
    if (fresh.planHash !== expectPlan) refuse('Expected plan hash changed before the write transaction.');
    const backupPath = await writeBackup(fresh, backupDir);
    for (const { before, desired } of fresh.articles.filter(changed)) {
      // IS handles null exactly; BINARY prevents collation-based CAS false matches.
      const result = await tx.execute({
        sql: 'UPDATE posts SET content = ?, excerpt = ? WHERE id IS ? AND slug IS ? COLLATE BINARY AND content IS ? COLLATE BINARY AND excerpt IS ? COLLATE BINARY',
        args: [desired.content, desired.excerpt, before.id, before.slug, before.content, before.excerpt],
      });
      if (result.rowsAffected !== 1) refuse('Article compare-and-swap failed; rolling back both articles.');
    }
    // Verify all rows after ALL updates, catching triggers that change the first row later.
    const after = await readRows(tx, freshArticles);
    for (let i = 0; i < after.length; i++) {
      const entry = fresh.articles[i];
      if (canonicalJson(after[i]) !== canonicalJson({ ...entry.before, ...entry.desired })) refuse('Article verification failed; rolling back both articles.');
    }
    await tx.commit();
    return summary(fresh, 'applied', backupPath);
  } catch (error) {
    try { await tx.rollback(); }
    catch { refuse('Transaction failed and rollback could not be confirmed. Inspect the database and retained backup before retrying.'); }
    throw error;
  } finally { tx.close(); }
}
