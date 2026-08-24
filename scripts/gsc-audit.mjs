#!/usr/bin/env node
/**
 * Search Console audit — why pages are not indexed.
 *
 * Reads a short-lived OAuth access token from the environment. Nothing is
 * written to disk and no credential is ever hardcoded.
 *
 *   export GSC_ACCESS_TOKEN="ya29...."      # webmasters.readonly scope
 *   node scripts/gsc-audit.mjs
 *
 * Optional:
 *   GSC_SITE   explicit property, e.g. "sc-domain:maoverse.xyz"
 *              or "https://abhinav.maoverse.xyz/"
 *   GSC_LIMIT  max URLs to inspect (default 30)
 *
 * The URL Inspection API is quota-limited (~2000/day, 600/min per property),
 * so URLs are inspected serially with a small delay.
 */

const TOKEN = process.env.GSC_ACCESS_TOKEN;
const SITE_OVERRIDE = process.env.GSC_SITE;
const LIMIT = Number(process.env.GSC_LIMIT || 30);
const ORIGIN = "https://abhinav.maoverse.xyz";

if (!TOKEN) {
  console.error("GSC_ACCESS_TOKEN is not set. See the header of this file.");
  process.exit(1);
}

const auth = { Authorization: `Bearer ${TOKEN}` };

async function api(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { ...auth, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = json?.error?.message || res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }
  return json;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function listSites() {
  const data = await api("https://www.googleapis.com/webmasters/v3/sites");
  return data.siteEntry || [];
}

async function sitemapUrls() {
  const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function inspect(siteUrl, inspectionUrl) {
  const data = await api(
    "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
    {
      method: "POST",
      body: JSON.stringify({ inspectionUrl, siteUrl, languageCode: "en-US" }),
    }
  );
  return data.inspectionResult || {};
}

function pick(result) {
  const i = result.indexStatusResult || {};
  return {
    verdict: i.verdict || "—",
    coverageState: i.coverageState || "—",
    robotsTxtState: i.robotsTxtState || "—",
    indexingState: i.indexingState || "—",
    pageFetchState: i.pageFetchState || "—",
    googleCanonical: i.googleCanonical || "—",
    userCanonical: i.userCanonical || "—",
    lastCrawlTime: i.lastCrawlTime || "never",
    referringUrls: (i.referringUrls || []).length,
    sitemaps: (i.sitemap || []).length,
  };
}

(async () => {
  console.log("=== Properties visible to this token ===");
  let sites = [];
  try {
    sites = await listSites();
  } catch (e) {
    console.error("Could not list sites:", e.message);
    console.error("The token likely lacks the webmasters.readonly scope, or has expired.");
    process.exit(1);
  }
  sites.forEach((s) => console.log(`  ${s.permissionLevel.padEnd(18)} ${s.siteUrl}`));

  const site =
    SITE_OVERRIDE ||
    sites.find((s) => s.siteUrl.includes("abhinav.maoverse.xyz"))?.siteUrl ||
    sites.find((s) => s.siteUrl.includes("maoverse.xyz"))?.siteUrl;

  if (!site) {
    console.error("\nNo property matching maoverse.xyz. Set GSC_SITE explicitly.");
    process.exit(1);
  }
  console.log(`\nUsing property: ${site}\n`);

  const urls = (await sitemapUrls()).slice(0, LIMIT);
  console.log(`Inspecting ${urls.length} URLs from the sitemap...\n`);

  const rows = [];
  for (const [n, u] of urls.entries()) {
    try {
      const r = pick(await inspect(site, u));
      rows.push({ url: u, ...r });
      const path = u.replace(ORIGIN, "") || "/";
      console.log(
        `${String(n + 1).padStart(2)}. ${path.slice(0, 52).padEnd(52)} ${r.verdict.padEnd(10)} ${r.coverageState}`
      );
    } catch (e) {
      console.log(`${String(n + 1).padStart(2)}. ${u} -> ERROR ${e.message}`);
      if (/quota|rate/i.test(e.message)) break;
    }
    await sleep(350);
  }

  const group = (key) =>
    rows.reduce((acc, r) => ((acc[r[key]] = (acc[r[key]] || 0) + 1), acc), {});

  console.log("\n=== Coverage state (the 'why' Google reports) ===");
  Object.entries(group("coverageState"))
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}  ${k}`));

  for (const field of ["verdict", "robotsTxtState", "indexingState", "pageFetchState"]) {
    console.log(`\n=== ${field} ===`);
    Object.entries(group(field))
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}  ${k}`));
  }

  const mismatched = rows.filter(
    (r) => r.userCanonical !== "—" && r.googleCanonical !== "—" && r.userCanonical !== r.googleCanonical
  );
  console.log(`\n=== Canonical mismatches (Google disagrees with your canonical) === ${mismatched.length}`);
  mismatched.forEach((r) => console.log(`  ${r.url}\n     yours:  ${r.userCanonical}\n     google: ${r.googleCanonical}`));

  const never = rows.filter((r) => r.lastCrawlTime === "never");
  console.log(`\n=== Never crawled === ${never.length}`);
  never.forEach((r) => console.log(`  ${r.url}`));

  const orphans = rows.filter((r) => r.referringUrls === 0);
  console.log(`\n=== No internal referring URLs known to Google === ${orphans.length}`);
  orphans.forEach((r) => console.log(`  ${r.url}`));
})();
