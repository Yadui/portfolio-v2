import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";

const root = new URL("../", import.meta.url);
const now = new Date("2026-09-22T12:00:00.000Z");
// Dynamic import keeps the ownership/data regressions runnable before the helper exists.
const loadSeo = () => import(new URL("lib/seo.ts", root).href);

test("article SEO title uses the editorial AVD title only for its exact existing slug", async () => {
  const { getArticleSeoTitle } = await loadSeo();
  const title = "Securing Azure Virtual Desktop with Entra ID and Passwordless MFA";
  const slug = "securing-azure-virtual-desktop-with-entra-id-and-passwordless-mfa";
  assert.equal(getArticleSeoTitle(title, slug), "Azure Virtual Desktop: Passwordless MFA with Entra ID");
  assert.equal(getArticleSeoTitle(title, `${slug}-troubleshooting`), title);
});

test("article SEO title normalizes whitespace without discarding meaningful title text", async () => {
  const { getArticleSeoTitle } = await loadSeo();
  const cases = [
    ["  Azure\n identity\t rollout  ", "Azure identity rollout"],
    ["Azure deployment troubleshooting: managed identity, private endpoints, and passwordless MFA", "Azure deployment troubleshooting: managed identity, private endpoints, and passwordless MFA"],
    ["  KV cache sizing:\n memory budgets, concurrent requests,\tand production capacity planning  ", "KV cache sizing: memory budgets, concurrent requests, and production capacity planning"],
    ["", ""],
  ];
  for (const [title, expected] of cases) {
    assert.equal(getArticleSeoTitle(title, "another-article"), expected);
  }
});

test("sitemap omits missing, malformed, impossible and future dates", async () => {
  const { sitemapLastModified } = await loadSeo();
  for (const value of [
    undefined, null, "", "not-a-date", new Date(NaN), NaN, Infinity,
    "+058634-09-24T03:12:00.000Z", "2026-02-30", "2025-02-29",
    "2026-13-01", "2026-04-31T09:00:00.000Z", "0000-01-01",
    "2026-09-22T12:00:00.001Z", now.getTime() + 1,
    new Date("2027-01-01T00:00:00.000Z"),
  ]) {
    const entry = sitemapLastModified(value, now);
    assert.deepEqual(entry, {});
    assert.equal(Object.hasOwn(entry, "lastModified"), false);
  }
});

test("sitemap preserves real dates, milliseconds, leap days and the present boundary", async () => {
  const { sitemapLastModified } = await loadSeo();
  const cases: [string | number | Date, string][] = [
    ["2026-05-29T00:00:00.000Z", "2026-05-29T00:00:00.000Z"],
    ["2024-02-29", "2024-02-29T00:00:00.000Z"],
    ["2026-05-29T05:30:00+05:30", "2026-05-29T00:00:00.000Z"],
    [0, "1970-01-01T00:00:00.000Z"],
    [1770000000000, "2026-02-02T02:40:00.000Z"],
    [new Date("2025-12-12T11:09:35.000Z"), "2025-12-12T11:09:35.000Z"],
    [now, "2026-09-22T12:00:00.000Z"],
  ];
  for (const [value, expected] of cases) {
    assert.equal(sitemapLastModified(value, now).lastModified?.toISOString(), expected);
  }
});

test("fallback keeps all 20 blog URLs while the unverified date is null", () => {
  const posts = JSON.parse(readFileSync(new URL("data/blogSlugsFallback.json", root), "utf8"));
  assert.equal(posts.length, 20);
  assert.equal(new Set(posts.map((post: { slug: string }) => post.slug)).size, 20);
  assert.equal(posts.find((post: { slug: string }) => post.slug === "ego-lite-browser-for-ai-agents").createdAt, null);
});

test("llms.txt has one public owner and its static predecessor is archived verbatim", () => {
  assert.equal(existsSync(new URL("public/llms.txt", root)), false);
  assert.equal(existsSync(new URL("app/llms.txt/route.ts", root)), true);
  const archived = readFileSync(new URL("docs/seo/archive/llms-static-before-2026-09-22.txt", root));
  const hash = createHash("sha1").update(`blob ${archived.length}\0`).update(archived).digest("hex");
  assert.equal(hash, "41e37955deceb32a35d3bdb60e88fe634f12f7d3");
});

test("JSON-LD cannot terminate its script element and round-trips its data", async () => {
  const { serializeJsonLd } = await loadSeo();
  const data = { name: '</script><script>alert("x")</script>', text: "<&>\u2028\u2029", count: 3 };
  const serialized = serializeJsonLd(data);
  assert.equal(/[<>&\u2028\u2029]/.test(serialized), false);
  assert.deepEqual(JSON.parse(serialized), data);
});

test("database probe uses environment configuration and fails before client creation when missing", () => {
  const source = readFileSync(new URL("test-db.js", root), "utf8");
  // Boolean assertions ensure a regression never prints credential-bearing source.
  assert.equal(/const url = process\.env\.TURSO_DATABASE_URL;/.test(source), true);
  assert.equal(/const authToken = process\.env\.TURSO_AUTH_TOKEN;/.test(source), true);
  assert.equal(/(?:libsql|https?):\/\//.test(source), false);
  const offlineSource = source.replace(/^import .* from ['"]@libsql\/client['"];\s*/m, "");
  for (const env of [{}, { TURSO_DATABASE_URL: "configured" }, { TURSO_AUTH_TOKEN: "configured" }]) {
    let clientCreated = false;
    let errorMessage = "";
    try {
      runInNewContext(offlineSource, {
        process: { env },
        createClient: () => { clientCreated = true; throw new Error("Unexpected client creation"); },
      });
    } catch (error) {
      errorMessage = String((error as Error).message);
    }
    assert.equal(clientCreated, false);
    assert.equal(errorMessage.includes("TURSO_DATABASE_URL") && errorMessage.includes("TURSO_AUTH_TOKEN"), true);
  }
});
