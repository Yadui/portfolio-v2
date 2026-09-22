import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { build } from "esbuild";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";

const root = fileURLToPath(new URL("../", import.meta.url));
// Compile the real handler and schema, replacing only external I/O boundaries.
// Every test gets a fresh in-memory SQLite DB; no environment URL is consulted.
const stubs = {
  "@/lib/db": "export const db = fixture.db;",
  "@/lib/auth": "export const verifyAuth = fixture.verifyAuth;",
  "next/cache": "export const revalidatePath = fixture.revalidatePath;",
};
const compiled = await build({
  absWorkingDir: root,
  stdin: {
    contents: 'export { POST } from "./app/api/blog/edit/route.js"; export { posts } from "./lib/schema.js";',
    resolveDir: root,
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "cjs",
  packages: "external",
  logLevel: "silent",
  plugins: [{
    name: "offline-blog-edit-boundaries",
    setup(build) {
      build.onResolve({ filter: /.*/ }, ({ path }) =>
        Object.hasOwn(stubs, path) ? { path, namespace: "edit-test" } : undefined
      );
      build.onLoad({ filter: /.*/, namespace: "edit-test" }, ({ path }) => ({
        contents: stubs[path], resolveDir: root,
      }));
    },
  }],
});

const originalSlug = "Keep_My-Custom.Slug-2024";
const valid = { id: "7", title: "A changed title", content: "  Markdown\n\n```js\nconst n = 1;\n```\n" };
const request = (body) => new Request("http://localhost/api/blog/edit", {
  method: "POST", body: JSON.stringify(body),
});

async function harness(t, { authenticated = true, slug = originalSlug, id = 7, failDb = false } = {}) {
  const client = createClient({ url: "file::memory:" });
  t.after(() => client.close());
  await client.execute(`CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE, content TEXT NOT NULL, excerpt TEXT,
    cover_image TEXT, tags TEXT, created_at INTEGER NOT NULL
  )`);
  const queries = [];
  const database = drizzle(client, { logger: { logQuery(sql, params) { queries.push({ sql, params }); } } });
  const paths = [];
  const logs = [];
  const events = [];
  const fixture = {
    db: new Proxy(database, {
      get(target, property) {
        events.push("db");
        if (failDb) throw new Error("private submitted content and connection token");
        const value = Reflect.get(target, property, target);
        return typeof value === "function" ? value.bind(target) : value;
      },
    }),
    verifyAuth: async () => { events.push("auth"); return authenticated ? { id: 1 } : null; },
    revalidatePath: (...args) => paths.push(args),
  };
  const compiledModule = { exports: {} };
  new Function("require", "module", "exports", "fixture", "console", compiled.outputFiles[0].text)(
    createRequire(import.meta.url), compiledModule, compiledModule.exports, fixture,
    { error: (...args) => logs.push(args) }
  );
  const { POST, posts } = compiledModule.exports;
  await database.insert(posts).values([
    { id, title: "Original title", slug, content: "Original body", excerpt: "Original excerpt", tags: "azure,cloud", coverImage: "/images/old.png", createdAt: new Date(0) },
    { id: 8, title: "Other post", slug: "other-post", content: "Other body", createdAt: new Date(0) },
  ]);
  queries.length = 0;
  return {
    POST, paths, logs, events, queries,
    row: async (rowId = id) => (await database.select().from(posts).where(eq(posts.id, rowId)))[0],
  };
}

test("authenticated title edit preserves the exact custom slug and other rows using bound SQL", async (t) => {
  const h = await harness(t);
  const title = "Robert'); UPDATE posts SET slug = 'hijacked'; --";
  const response = await h.POST(request({ ...valid, title }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  const updates = h.queries.filter(({ sql }) => /^update /i.test(sql));
  assert.equal(updates.length, 1);
  assert.match(updates[0].sql, /where "posts"\."id" = \?/i);
  assert.doesNotMatch(updates[0].sql, /"slug"\s*=/i);
  assert.equal(updates[0].sql.includes(title), false);
  assert.ok(updates[0].params.includes(title));
  assert.equal(updates[0].params.at(-1), 7);
  const row = await h.row();
  assert.equal(row.slug, originalSlug);
  assert.equal(row.title, title);
  assert.equal(row.content, valid.content);
  assert.equal(row.excerpt, valid.content.substring(0, 150) + "...");
  assert.equal(row.createdAt.getTime(), 0);
  assert.equal((await h.row(8)).title, "Other post");
  assert.equal(h.events[0], "auth");
});

test("ignores caller slug and arbitrary revalidation paths; invalidates original article and discovery routes", async (t) => {
  const h = await harness(t);
  const response = await h.POST(request({ ...valid, slug: "../../admin", path: "/admin", revalidatePath: "/" }));
  assert.equal(response.status, 200);
  assert.equal((await h.row()).slug, originalSlug);
  assert.deepEqual(h.paths.map(([path]) => path).sort(), [
    `/blog/${originalSlug}`, "/blog", "/rss.xml", "/sitemap.xml", "/sitemap.txt",
  ].sort());
  assert.ok(h.paths.every((args) => args.length === 1));
});

for (const id of [1, "7", "0007", Number.MAX_SAFE_INTEGER, String(Number.MAX_SAFE_INTEGER)]) {
  test(`accepts positive safe integer ID ${JSON.stringify(id)}`, async (t) => {
    const h = await harness(t, { id: Number(id) });
    assert.equal((await h.POST(request({ ...valid, id }))).status, 200);
    assert.equal((await h.row()).slug, originalSlug);
  });
}

for (const id of [undefined, null, false, true, 0, -1, 1.5, "", " ", "7junk", "7.5", "7e0", "0x7", "7 OR 1=1", "-7", "+7", " 7 ", "7\n", "0", [], [7], {}, Number.MAX_SAFE_INTEGER + 1, "9007199254740993"]) {
  test(`rejects invalid ID ${JSON.stringify(id)} before DB access`, async (t) => {
    const h = await harness(t);
    assert.equal((await h.POST(request({ ...valid, id }))).status, 400);
    assert.deepEqual(h.events, ["auth"]);
    assert.deepEqual(h.paths, []);
  });
}

for (const field of ["title", "content"]) {
  for (const value of [undefined, null, "", " \n\t", 42, false, [], {}]) {
    test(`rejects ${field} = ${JSON.stringify(value)} before DB access`, async (t) => {
      const h = await harness(t);
      assert.equal((await h.POST(request({ ...valid, [field]: value }))).status, 400);
      assert.deepEqual(h.events, ["auth"]);
      assert.deepEqual(h.paths, []);
    });
  }
}

for (const body of [null, [], "text", 42]) {
  test(`rejects non-object body ${JSON.stringify(body)}`, async (t) => {
    const h = await harness(t);
    assert.equal((await h.POST(request(body))).status, 400);
    assert.deepEqual(h.events, ["auth"]);
  });
}

test("malformed JSON returns 400 without DB access or logging supplied text", async (t) => {
  const h = await harness(t);
  const response = await h.POST(new Request("http://localhost/api/blog/edit", { method: "POST", body: '{"private-body":' }));
  assert.equal(response.status, 400);
  assert.deepEqual(h.events, ["auth"]);
  assert.deepEqual(h.logs, []);
  assert.deepEqual(h.paths, []);
});

for (const field of ["tags", "coverImage"]) {
  for (const value of [undefined, null, "", field === "tags" ? "azure,cloud" : "/uploads/cover.png"]) {
    test(`accepts optional ${field} = ${JSON.stringify(value)}`, async (t) => {
      const h = await harness(t);
      const before = await h.row();
      assert.equal((await h.POST(request({ ...valid, [field]: value }))).status, 200);
      assert.equal((await h.row())[field], value === undefined ? before[field] : value);
    });
  }
  for (const value of [42, false, [], {}]) {
    test(`rejects invalid ${field} = ${JSON.stringify(value)}`, async (t) => {
      const h = await harness(t);
      assert.equal((await h.POST(request({ ...valid, [field]: value }))).status, 400);
      assert.deepEqual(h.events, ["auth"]);
    });
  }
}

test("unknown ID returns 404 without cache invalidation or changing another post", async (t) => {
  const h = await harness(t);
  const before = await h.row();
  const response = await h.POST(request({ ...valid, id: "999" }));
  assert.equal(response.status, 404);
  assert.equal(typeof (await response.json()).error, "string");
  assert.deepEqual(await h.row(), before);
  assert.deepEqual(h.paths, []);
});

test("unauthenticated request returns 401 before reading body or accessing DB", async (t) => {
  const h = await harness(t, { authenticated: false, failDb: true });
  const response = await h.POST({ json() { throw new Error("Body must not be read"); } });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Unauthorized" });
  assert.deepEqual(h.events, ["auth"]);
  assert.deepEqual(h.paths, []);
});

test("database failures return generic 500 and log no error object, content or connection details", async (t) => {
  const h = await harness(t, { failDb: true });
  const response = await h.POST(request(valid));
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: "Failed to update post" });
  assert.ok(h.logs.length > 0);
  assert.ok(h.logs.flat().every((item) => typeof item === "string"));
  assert.doesNotMatch(JSON.stringify(h.logs), /private submitted|connection token/);
  assert.deepEqual(h.paths, []);
});

for (const slug of ["..", "../admin", "nested/path", "a\\..\\admin", "a?query=1", "a#hash", "%2e%2e", "[slug]", "safe\n", "x".repeat(1025)]) {
  test(`unsafe legacy slug uses fixed article pattern (${slug.length > 30 ? "overlong" : JSON.stringify(slug)})`, async (t) => {
    const h = await harness(t, { slug });
    assert.equal((await h.POST(request(valid))).status, 200);
    assert.equal((await h.row()).slug, slug);
    assert.deepEqual(h.paths.filter(([path]) => path.startsWith("/blog/")), [["/blog/[slug]", "page"]]);
    assert.ok(h.paths.every(([path]) => ["/blog", "/blog/[slug]", "/rss.xml", "/sitemap.xml", "/sitemap.txt"].includes(path)));
  });
}
