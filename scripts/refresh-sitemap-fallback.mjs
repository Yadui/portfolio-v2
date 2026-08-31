#!/usr/bin/env node
/**
 * Refresh data/blogSlugsFallback.json from the live sitemap.
 *
 * That file is the sitemap's last-resort source when the DB is unreachable.
 * It only needs to be roughly current: serving a slightly stale but complete
 * list beats dropping every post URL.
 *
 *   node scripts/refresh-sitemap-fallback.mjs
 */
import fs from "node:fs";

const ORIGIN =
  process.env.SITE_ORIGIN ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  // Canonical origin since the migration. The old maoverse host still 308s
  // here, but pointing at it meant regenerating the fallback from a redirect
  // chain rather than the live sitemap.
  "https://yadui.dev";
const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();

const entries = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)]
  .filter(([, loc]) => loc.includes("/blog/"))
  .map(([, loc, lastmod]) => ({ slug: loc.split("/").pop(), createdAt: lastmod || null }))
  .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

if (!entries.length) {
  console.error("Refusing to write an empty fallback.");
  process.exit(1);
}
fs.writeFileSync("data/blogSlugsFallback.json", JSON.stringify(entries, null, 2) + "\n");
console.log(`Wrote ${entries.length} slugs to data/blogSlugsFallback.json`);
