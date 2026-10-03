import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, open, writeFile, readFile, readdir, stat, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createClient } from '@libsql/client';
import {
  publishCorrections, loadCorrections, prepareContent, parseArgs,
  targetFingerprint, canonicalJson,
} from '../scripts/lib/blog-publisher.mjs';
import { main } from '../scripts/publish-blog-corrections.mjs';

const manifest = [
  { slug: 'securing-azure-virtual-desktop-with-entra-id-and-passwordless-mfa', source: 'scripts/blog-content/02-avd-entra-id.md', excerpt: 'AVD service authentication, Entra SSO, Conditional Access, passwordless methods, and profile-storage prerequisites.' },
  { slug: 'llm-kv-cache-why-not-query', source: 'scripts/blog-content/13-llm-kv-cache-why-not-query.md', excerpt: 'Why causal decoding reuses keys and values, not past queries, and how architecture and retained tokens determine KV cache memory.' },
];
const avd = '## Secure the service\n\nCorrected AVD content.\n';
const preamble = '# Why LLM Inference Caches K and V but Never Q\n\n**Published:** May 29, 2026  \n**Tags:** LLM, AI, Machine Learning, Inference, Transformers, Performance\n\n---\n\n';
const kv = '## Causal decoding\n\nPast queries are not reused.\n';
const digest = (value) => createHash('sha256').update(value).digest('hex');

async function fixture(t, { duplicate = false, url } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'portfolio-publisher-'));
  await mkdir(path.join(root, 'scripts/blog-content'), { recursive: true });
  await writeFile(path.join(root, 'scripts/blog-corrections.json'), JSON.stringify(manifest));
  await writeFile(path.join(root, manifest[0].source), avd);
  await writeFile(path.join(root, manifest[1].source), preamble + kv);
  const databaseUrl = url || `file:${path.join(root, 'posts.db')}`;
  const client = createClient({ url: databaseUrl, intMode: 'bigint' });
  t.after(() => client.close());
  await client.execute(`CREATE TABLE posts (
    id INTEGER PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL ${duplicate ? '' : 'UNIQUE'},
    content TEXT, excerpt TEXT, cover_image TEXT, tags TEXT, created_at INTEGER NOT NULL,
    future_metadata BLOB
  )`);
  for (const [i, slug] of [...manifest.map((item) => item.slug), 'unrelated-post'].entries()) {
    await client.execute({ sql: 'INSERT INTO posts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', args: [
      i + 1, `Protected title ${i}`, slug, i === 0 ? null : `Old content ${i}`, i === 0 ? null : `Old excerpt ${i}`,
      '/covers/original.png', 'original,tags', 9007199254740993n, new Uint8Array([0, 255, i]),
    ] });
  }
  const sql = [];
  const wrap = (db) => new Proxy(db, { get(target, key) {
    if (key === 'execute') return async (query) => { sql.push(typeof query === 'string' ? query : query.sql); return target.execute(query); };
    if (key === 'transaction') return async (mode) => { sql.push(`TRANSACTION ${mode}`); return wrap(await target.transaction(mode)); };
    const value = Reflect.get(target, key, target);
    return typeof value === 'function' ? value.bind(target) : value;
  } });
  const options = { client: wrap(client), databaseUrl, repoRoot: root, backupDir: path.join(root, 'backups') };
  const rows = async () => canonicalJson((await client.execute('SELECT * FROM posts ORDER BY id')).rows.map((row) => Object.fromEntries(Object.keys(row).filter((key) => !/^\d+$/.test(key)).map((key) => [key, row[key]]))));
  return { root, client, options, sql, rows, plan: () => publishCorrections(options), apply: (hash, extra = {}) => publishCorrections({ ...options, apply: true, expectPlan: hash, ...extra }) };
}

test('dry-run is deterministic, private, and performs zero writes or backups', async (t) => {
  const h = await fixture(t);
  const before = await h.rows();
  const plan = await h.plan();
  assert.equal(plan.mode, 'dry-run');
  assert.match(plan.planHash, /^[a-f0-9]{64}$/);
  assert.deepEqual(await h.plan(), plan);
  assert.equal(plan.changedRows, 2);
  assert.equal(plan.articles.length, 2);
  assert.ok(plan.articles.every((row) => row.contentChanged && row.excerptChanged && row.afterWords > 0));
  assert.doesNotMatch(JSON.stringify(plan), /Old content|Protected title|posts\.db|Corrected AVD|Causal decoding/);
  assert.equal(await h.rows(), before);
  assert.ok(h.sql.every((sql) => /^(SELECT|PRAGMA)/.test(sql)));
  await assert.rejects(readdir(h.options.backupDir), { code: 'ENOENT' });
});

test('apply updates only both target bodies/excerpts and writes a verifiable complete private backup', async (t) => {
  const h = await fixture(t);
  const before = await h.rows();
  const plan = await h.plan();
  const result = await h.apply(plan.planHash);
  assert.equal(result.mode, 'applied');
  assert.equal(result.changedRows, 2);
  const raw = await readFile(result.backupPath, 'utf8');
  const backup = JSON.parse(raw);
  assert.equal(backup.sha256, digest(canonicalJson(backup.payload)));
  assert.equal(backup.payload.planHash, plan.planHash);
  assert.equal(backup.payload.targetFingerprint, await targetFingerprint(h.options.databaseUrl));
  assert.equal(backup.payload.articles.length, 2);
  const avdBackup = backup.payload.articles.find((article) => article.slug === manifest[0].slug);
  assert.equal(avdBackup.before.content, null);
  assert.equal(avdBackup.before.created_at.$bigint, '9007199254740993');
  assert.equal(avdBackup.before.future_metadata.$bytes, 'AP8A');
  assert.equal(avdBackup.desiredDigest, digest(canonicalJson(avdBackup.desired)));
  assert.equal(avdBackup.beforeDigest, digest(canonicalJson(avdBackup.before)));
  assert.equal((await stat(result.backupPath)).mode & 0o777, 0o600);
  assert.doesNotMatch(raw, /posts\.db|authToken|TURSO|libsql:/);
  const oldRows = JSON.parse(before);
  const newRows = JSON.parse(await h.rows());
  for (let i = 0; i < 2; i++) {
    assert.deepEqual(newRows[i], { ...oldRows[i], content: i === 0 ? avd : kv, excerpt: manifest[i].excerpt });
  }
  assert.deepEqual(newRows[2], oldRows[2]);
  assert.equal(h.sql.filter((sql) => /^UPDATE/.test(sql)).length, 2);
});

test('unchanged fresh plan applies as a no-op without transaction or second backup', async (t) => {
  const h = await fixture(t);
  await h.apply((await h.plan()).planHash);
  const plan = await h.plan();
  assert.equal(plan.changedRows, 0);
  h.sql.length = 0;
  const result = await h.apply(plan.planHash);
  assert.equal(result.mode, 'no-op');
  assert.equal(result.backupPath, null);
  assert.ok(h.sql.every((sql) => /^(SELECT|PRAGMA)/.test(sql)));
  assert.equal((await readdir(h.options.backupDir)).length, 1);
});

for (const change of ['wrong hash', 'title', 'source', 'excerpt', 'target', 'unknown metadata']) {
  test(`rejects ${change} plan mismatch before any write or backup`, async (t) => {
    const h = await fixture(t);
    const plan = await h.plan();
    let hash = plan.planHash;
    let extra = {};
    if (change === 'wrong hash') hash = '0'.repeat(64);
    if (change === 'title') await h.client.execute("UPDATE posts SET title = 'Concurrent edit' WHERE id = 1");
    if (change === 'unknown metadata') await h.client.execute("UPDATE posts SET future_metadata = X'11' WHERE id = 1");
    if (change === 'source') await writeFile(path.join(h.root, manifest[0].source), avd + '\nSource change.\n');
    if (change === 'excerpt') await writeFile(path.join(h.root, 'scripts/blog-corrections.json'), JSON.stringify(manifest.map((row) => ({ ...row, excerpt: 'New precise excerpt.' }))));
    if (change === 'target') extra = { databaseUrl: 'libsql://different.invalid' };
    const before = await h.rows();
    h.sql.length = 0;
    await assert.rejects(h.apply(hash, extra), /plan hash/i);
    assert.equal(await h.rows(), before);
    assert.ok(h.sql.every((sql) => /^(SELECT|PRAGMA)/.test(sql)));
    await assert.rejects(readdir(h.options.backupDir), { code: 'ENOENT' });
  });
}

test('fresh transaction re-read catches an edit after initial plan check', async (t) => {
  const h = await fixture(t);
  const hash = (await h.plan()).planHash;
  const base = h.options.client;
  const client = new Proxy(base, { get(target, key) {
    if (key === 'transaction') return async (mode) => {
      await h.client.execute("UPDATE posts SET tags = 'Concurrent tags' WHERE id = 2");
      return target.transaction(mode);
    };
    return Reflect.get(target, key);
  } });
  await assert.rejects(h.apply(hash, { client }), /plan hash/i);
  assert.equal((await h.client.execute('SELECT content FROM posts WHERE id = 2')).rows[0].content, 'Old content 1');
  assert.equal(h.sql.filter((sql) => /^UPDATE/.test(sql)).length, 0);
  await assert.rejects(readdir(h.options.backupDir), { code: 'ENOENT' });
});

test('backup failure prevents updates', async (t) => {
  const h = await fixture(t);
  const hash = (await h.plan()).planHash;
  await writeFile(h.options.backupDir, 'not a directory');
  const before = await h.rows();
  await assert.rejects(h.apply(hash), /backup/i);
  assert.equal(await h.rows(), before);
  assert.equal(h.sql.filter((sql) => /^UPDATE/.test(sql)).length, 0);
});

for (const problem of ['missing', 'duplicate', 'schema']) {
  test(`${problem} target/schema fails closed without partial update`, async (t) => {
    const h = await fixture(t, { duplicate: true });
    if (problem === 'missing') await h.client.execute('DELETE FROM posts WHERE id = 2');
    if (problem === 'duplicate') await h.client.execute({ sql: 'INSERT INTO posts SELECT 9, title, slug, content, excerpt, cover_image, tags, created_at, future_metadata FROM posts WHERE id = ?', args: [2] });
    if (problem === 'schema') await h.client.execute('ALTER TABLE posts RENAME COLUMN tags TO labels');
    const before = await h.rows();
    await assert.rejects(h.plan(), /exactly one|schema/i);
    await assert.rejects(h.apply('0'.repeat(64)), /exactly one|schema/i);
    assert.equal(await h.rows(), before);
    assert.ok(h.sql.every((sql) => /^(SELECT|PRAGMA)/.test(sql)));
  });
}

for (const failure of ['second update', 'zero row count', 'CAS mismatch', 'protected metadata', 'body corruption', 'commit']) {
  test(`transaction rolls back all changes on ${failure}`, async (t) => {
    const h = await fixture(t);
    if (failure === 'second update') await h.client.execute("CREATE TRIGGER stop_update BEFORE UPDATE ON posts WHEN OLD.id = 2 BEGIN SELECT RAISE(ABORT, 'stop'); END");
    if (failure === 'zero row count') await h.client.execute("CREATE TRIGGER skip_update BEFORE UPDATE ON posts WHEN OLD.id = 2 BEGIN SELECT RAISE(IGNORE); END");
    if (failure === 'CAS mismatch') await h.client.execute("CREATE TRIGGER race AFTER UPDATE ON posts WHEN OLD.id = 1 BEGIN UPDATE posts SET excerpt = 'raced' WHERE id = 2; END");
    if (failure === 'protected metadata') await h.client.execute("CREATE TRIGGER metadata AFTER UPDATE ON posts WHEN OLD.id = 2 BEGIN UPDATE posts SET title = 'unexpected' WHERE id = 1; END");
    if (failure === 'body corruption') await h.client.execute("CREATE TRIGGER corrupt AFTER UPDATE ON posts WHEN OLD.id = 2 BEGIN UPDATE posts SET content = 'unexpected' WHERE id = 1; END");
    let client = h.options.client;
    if (failure === 'commit') client = new Proxy(client, { get(target, key) {
      if (key === 'transaction') return async (mode) => {
        const tx = await target.transaction(mode);
        return new Proxy(tx, { get(transaction, property) {
          if (property === 'commit') return async () => { throw new Error('simulated commit failure'); };
          return Reflect.get(transaction, property);
        } });
      };
      return Reflect.get(target, key);
    } });
    const before = await h.rows();
    await assert.rejects(h.apply((await h.plan()).planHash, { client }));
    assert.equal(await h.rows(), before);
    assert.equal((await readdir(h.options.backupDir)).length, 1);
  });
}

test('content preserves AVD exactly and strips only the documented KV preamble', () => {
  assert.equal(prepareContent(avd, manifest[0].slug), avd);
  assert.equal(prepareContent(preamble + kv, manifest[1].slug), kv);
  assert.equal(prepareContent(kv, manifest[1].slug), kv);
  assert.throws(() => prepareContent(preamble + kv, manifest[0].slug), /H1/i);
  assert.throws(() => prepareContent(preamble.replace('**Tags:**', 'Other:') + kv, manifest[1].slug), /H1/i);
  assert.equal(prepareContent('## Sample\n\n```md\n# example\n```\n', manifest[0].slug), '## Sample\n\n```md\n# example\n```\n');
});

for (const text of ['---\ndraft: true\n---\n## Body', '+++\ndraft = true\n+++\n## Body', '## DRAFT: pending review', '**Status:** Draft\n\n## Body', '# Extra H1', 'Title\n=====', '## Body\n\n| A | B |\n| --- | --- |\n| 1 | 2 |', '']) {
  test(`refuses unsafe body ${JSON.stringify(text)}`, () => {
    assert.throws(() => prepareContent(text, manifest[0].slug), /front ?matter|draft|H1|table|empty/i);
  });
}

for (const source of ['scripts/blog-content/drafts/02-avd-entra-id.md', '../02-avd-entra-id.md', '/tmp/article.md', 'scripts/blog-content/../blog-content/02-avd-entra-id.md', 'scripts/blog-content/other.md']) {
  test(`refuses non-allowlisted path ${source}`, async (t) => {
    const h = await fixture(t);
    await writeFile(path.join(h.root, 'scripts/blog-corrections.json'), JSON.stringify([{ ...manifest[0], source }, manifest[1]]));
    await assert.rejects(loadCorrections(h.root), /manifest|source/i);
  });
}

test('refuses source symlinks even at the allowlisted path', async (t) => {
  const h = await fixture(t);
  const outside = path.join(h.root, 'outside.md');
  await writeFile(outside, avd);
  // Rename preserves the fixture source; no repository file is touched.
  const { rename } = await import('node:fs/promises');
  await rename(path.join(h.root, manifest[0].source), path.join(h.root, 'original.md'));
  await symlink(outside, path.join(h.root, manifest[0].source));
  await assert.rejects(loadCorrections(h.root), /source/i);
});

for (const invalid of [[], [manifest[0], manifest[0]], [{ ...manifest[0], title: 'not allowed' }, manifest[1]], [{ ...manifest[0], excerpt: 'x'.repeat(156) }, manifest[1]]]) {
  test('rejects incomplete, duplicate, extra-field or overlong-excerpt manifest', async (t) => {
    const h = await fixture(t);
    await writeFile(path.join(h.root, 'scripts/blog-corrections.json'), JSON.stringify(invalid));
    await assert.rejects(loadCorrections(h.root), /manifest|excerpt/i);
  });
}

for (const args of [['--apply'], ['--expect-plan', 'a'.repeat(64)], ['--apply', '--expect-plan', 'bad'], ['--database-url', 'file:test.db'], ['--apply', '--dry-run'], ['--backup-dir'], ['--env-file', '--apply'], ['--apply', '--apply'], ['--bogus'], ['--help', '--apply'], ['--dry-run', '--dry-run']]) {
  test(`invalid CLI flags fail closed: ${args.join(' ')}`, () => assert.throws(() => parseArgs(args)));
}

test('CLI defaults to dry-run and allows only explicit apply with exact SHA256', () => {
  assert.deepEqual(parseArgs([]), { apply: false, backupDir: '.local/blog-backups', envFile: '.env.local' });
  assert.equal(parseArgs(['--apply', '--expect-plan', 'a'.repeat(64)]).expectPlan, 'a'.repeat(64));
});

test('target identity normalizes URL spelling without including credentials', async () => {
  assert.equal(await targetFingerprint('libsql://EXAMPLE.invalid:443/'), await targetFingerprint('libsql://example.invalid'));
  assert.notEqual(await targetFingerprint('libsql://one.invalid'), await targetFingerprint('libsql://two.invalid'));
  for (const url of ['https://user:password@example.invalid', 'libsql://example.invalid?token=secret', 'https://example.invalid#secret']) {
    await assert.rejects(targetFingerprint(url), /database target/i);
  }
});

test('real CLI uses quiet dotenv without overriding existing environment, closes client and applies locally', async (t) => {
  const h = await fixture(t);
  await writeFile(path.join(h.root, '.env.local'), 'TURSO_DATABASE_URL=libsql://must-not-connect.invalid\n');
  const env = { TURSO_DATABASE_URL: h.options.databaseUrl };
  const logs = [];
  const options = { repoRoot: h.root, env, log: (line) => logs.push(line) };
  assert.equal(await main([], options), 0);
  const plan = JSON.parse(logs.pop());
  assert.equal(plan.mode, 'dry-run');
  assert.equal(await main(['--apply', '--expect-plan', plan.planHash], options), 0);
  const applied = JSON.parse(logs.pop());
  assert.equal(applied.mode, 'applied');
  assert.equal(path.dirname(applied.backupPath), path.join(h.root, '.local/blog-backups'));
  assert.equal((await h.client.execute('SELECT content FROM posts WHERE id = 1')).rows[0].content, avd);
  assert.equal(env.TURSO_DATABASE_URL, h.options.databaseUrl);
});

test('CLI help/invalid flags never load dotenv or connect; errors do not echo supplied secrets', async (t) => {
  const h = await fixture(t);
  const logs = [];
  const options = { repoRoot: h.root, env: {}, log: (line) => logs.push(line) };
  assert.equal(await main(['--help'], options), 0);
  assert.match(logs.pop(), /--expect-plan/);
  assert.equal(await main(['--private-secret'], options), 1);
  assert.doesNotMatch(logs.pop(), /private-secret/);
  assert.equal(await main([], options), 1);
  assert.doesNotMatch(logs.pop(), /stack|at main|password|libsql:/);
});

test('in-memory SQLite supports the same apply and CAS path', async (t) => {
  const h = await fixture(t, { url: 'file::memory:' });
  assert.equal((await h.apply((await h.plan()).planHash)).changedRows, 2);
  // libsql detaches the original in-memory connection for transaction ownership.
  // Post-commit repeatability is covered above using a real temporary file DB.
});

test('target fingerprint resolves local aliases and refuses nonexistent files', async (t) => {
  const h = await fixture(t);
  const alias = path.join(h.root, 'alias.db');
  await symlink(path.join(h.root, 'posts.db'), alias);
  assert.equal(await targetFingerprint(`file:${alias}`), await targetFingerprint(h.options.databaseUrl));
  const missing = path.join(h.root, 'missing.db');
  await assert.rejects(targetFingerprint(`file:${missing}`), /database target/);
  await assert.rejects(stat(missing), { code: 'ENOENT' });
});

test('source bytes, including legacy metadata, bind the review hash', async (t) => {
  const h = await fixture(t);
  const plan = await h.plan();
  await writeFile(path.join(h.root, manifest[1].source), kv);
  const fresh = await h.plan();
  assert.notEqual(plan.planHash, fresh.planHash);
  assert.deepEqual(plan.articles, fresh.articles);
  await assert.rejects(h.apply(plan.planHash), /plan hash/);
});

for (const failure of ['fsync', 'read-back corruption']) {
  test(`backup ${failure} prevents every database update`, async (t) => {
    const h = await fixture(t);
    const hash = (await h.plan()).planHash;
    const before = await h.rows();
    const handle = await open(path.join(h.root, 'handle-probe'), 'wx');
    const prototype = Object.getPrototypeOf(handle);
    const original = prototype.sync;
    await handle.close();
    t.mock.method(prototype, 'sync', async function () {
      if (failure === 'fsync') throw new Error('simulated disk failure');
      await original.call(this);
      if ((await this.stat()).isFile()) await this.truncate(0);
    });
    await assert.rejects(h.apply(hash), /backup/i);
    assert.equal(await h.rows(), before);
    assert.equal(h.sql.filter((sql) => /^UPDATE/.test(sql)).length, 0);
  });
}

test('front matter after the stripped legacy preamble is also rejected', () => {
  assert.throws(() => prepareContent(preamble + '---\nauthor: Example\n---\n' + kv, manifest[1].slug), /front matter/i);
});
