/**
 * Existing-article corrections only. Never seeds rows or changes schema/metadata.
 *
 * node scripts/publish-blog-corrections.mjs
 * node scripts/publish-blog-corrections.mjs --apply --expect-plan <printed SHA256>
 *
 * Read credentials ONLY from TURSO_DATABASE_URL / TURSO_AUTH_TOKEN. dotenv loads
 * --env-file (default .env.local) quietly, without overriding the environment.
 * A local file URL is supported for isolated tests; the DB must already exist.
 * Backups default to .local/blog-backups; keep this directory ignored and private.
 *
 * Recovery handoff (no automatic rollback command): retain the backup even when
 * apply fails. Verify envelope.sha256 over canonicalJson(envelope.payload), the
 * target fingerprint and each before/desired digest. Tagged $bigint / $bytes
 * values restore as BigInt / base64-decoded bytes. Inspect current rows first;
 * with separate authorization, restore ONLY content/excerpt in one transaction
 * using id/slug and CAS against the backed-up desired values. Abort on divergence,
 * preserve all metadata, verify restored rows before commit. Never blindly replay
 * a backup over subsequent edits. A lost commit acknowledgement requires checking
 * actual rows before retrying. This script does not invalidate Next.js caches.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { normalizeDatabaseTarget, parseArgs, publishCorrections, PublisherError } from './lib/blog-publisher.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const HELP = `Existing article publisher (default: dry-run)
  node scripts/publish-blog-corrections.mjs [--dry-run]
  node scripts/publish-blog-corrections.mjs --apply --expect-plan SHA256
  Optional: --env-file PATH (default .env.local)
            --backup-dir PATH (default .local/blog-backups)
Paths are relative to the repository root. Database URL/token are environment-only:
TURSO_DATABASE_URL / TURSO_AUTH_TOKEN. Review the dry-run hash before applying.
Sources must contain no front matter, draft labels, body H1 or pipe tables.`;

export async function main(args = process.argv.slice(2), { repoRoot = ROOT, env = process.env, log = console.log } = {}) {
  let client;
  try {
    const options = parseArgs(args);
    if (options.help) { log(HELP); return 0; }
    const loaded = dotenv.config({ path: path.resolve(repoRoot, options.envFile), quiet: true, override: false, processEnv: env });
    if (loaded.error && (loaded.error.code !== 'ENOENT' || options.envFile !== '.env.local')) throw new PublisherError('Cannot load the selected environment file.');
    const databaseUrl = await normalizeDatabaseTarget(env.TURSO_DATABASE_URL);
    client = createClient({ url: databaseUrl, authToken: env.TURSO_AUTH_TOKEN, intMode: 'bigint' });
    const result = await publishCorrections({
      client, databaseUrl, repoRoot, apply: options.apply, expectPlan: options.expectPlan,
      backupDir: path.resolve(repoRoot, options.backupDir),
    });
    log(JSON.stringify(result));
    return 0;
  } catch (error) {
    // Driver/OS errors can contain connection URLs, tokens or article contents.
    log(JSON.stringify({ error: error instanceof PublisherError ? error.message : 'Publisher failed. No successful commit confirmed; inspect the database and any retained backup before retrying.' }));
    return 1;
  } finally { client?.close(); }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  process.exitCode = await main();
}
