import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { build } from "esbuild";
import React from "react";
import ReactMarkdown from "react-markdown";
import { renderToStaticMarkup } from "react-dom/server";

const post = {
  slug: "renderer-regression",
  title: '</script><script>alert("article")</script>',
  excerpt: "Characters: <&>\u2028\u2029",
  createdAt: "2026-09-22T00:00:00.000Z",
  content: [
    "Use `npm install` here and `a < b && c > d` safely.",
    "```js\nconst answer = 42;\n```",
    "```\nunlabelled\n  indented\n\n```",
    "```\n```",
    "    indented block",
    "## Heading with `inline code`",
    "- List with `inline code`",
  ].join("\n\n"),
};

const avdPost = {
  ...post,
  slug: "securing-azure-virtual-desktop-with-entra-id-and-passwordless-mfa",
  title: "Securing Azure Virtual Desktop with Entra ID and Passwordless MFA",
};
const longTitlePosts = [
  {
    ...post,
    slug: "azure-identity-rollout",
    title: "  Azure identity rollout:\n Conditional Access, passwordless authentication,\tand recovery planning  ",
    expectedTitle: "Azure identity rollout: Conditional Access, passwordless authentication, and recovery planning",
  },
  {
    ...post,
    slug: `${avdPost.slug}-troubleshooting`,
    title: "Securing Azure Virtual Desktop with Entra ID and Passwordless MFA: troubleshooting client sign-in",
    expectedTitle: "Securing Azure Virtual Desktop with Entra ID and Passwordless MFA: troubleshooting client sign-in",
  },
];
const fixturePosts = Object.fromEntries(
  [post, avdPost, ...longTitlePosts].map((fixture) => [fixture.slug, fixture])
);

// Compile the actual page in memory with the already-installed esbuild.
// Only I/O and unrelated Next/client leaves are stubbed; ReactMarkdown,
// all article handlers, CodeBlock and the SEO helpers are real.
const stubs = {
  "@/lib/db": "export const db = { select() { throw new Error('Database disabled in renderer tests'); } };",
  "@/lib/schema": "export const posts = {};",
  "@/data/blogPosts": `const posts = ${JSON.stringify(fixturePosts)};
    export const getSeededBlogPostBySlug = (slug) => posts[slug];
    export const mergeBlogPosts = () => [];
    export const normalizeStoredPost = (post) => post;`,
  "@/components/blog/AdminEditButton": "export default function AdminEditButton() { return null; }",
  "@/components/blog/ArticleActions": "export default function ArticleActions() { return null; }",
  "next/navigation": "export function notFound() { throw new Error('Not found'); }",
  "next/link": 'import React from "react"; export default function Link({ children, ...props }) { return React.createElement("a", props, children); }',
  "next/image": "export default function Image() { return null; }",
};
const root = fileURLToPath(new URL("../", import.meta.url));
const compiled = await build({
  absWorkingDir: root,
  entryPoints: ["app/blog/[slug]/page.jsx"],
  bundle: true,
  write: false,
  platform: "node",
  format: "cjs",
  packages: "external",
  jsx: "automatic",
  logLevel: "silent",
  plugins: [{
    name: "offline-article-boundaries",
    setup(build) {
      build.onResolve({ filter: /.*/ }, ({ path }) =>
        Object.hasOwn(stubs, path) ? { path, namespace: "article-test" } : undefined
      );
      build.onLoad({ filter: /.*/, namespace: "article-test" }, ({ path }) => ({
        contents: stubs[path],
        resolveDir: root,
      }));
    },
  }],
});
const compiledModule = { exports: {} };
new Function("require", "module", "exports", compiled.outputFiles[0].text)(
  createRequire(import.meta.url), compiledModule, compiledModule.exports
);
const page = await compiledModule.exports.default({ params: Promise.resolve({ slug: post.slug }) });

function findElements(element, predicate) {
  if (!React.isValidElement(element)) return [];
  return [
    ...(predicate(element) ? [element] : []),
    ...React.Children.toArray(element.props.children).flatMap((child) => findElements(child, predicate)),
  ];
}

const [markdown] = findElements(page, (element) => element.type === ReactMarkdown);
assert.ok(markdown, "The article must render its content through ReactMarkdown");
const markup = renderToStaticMarkup(markdown);

test("article inline code remains inline with no CodeBlock or copy button", () => {
  assert.match(markup, /Use <code\b[^>]*>npm install<\/code> here/);
  assert.match(markup, /<code\b[^>]*>a &lt; b &amp;&amp; c &gt; d<\/code>/);
  assert.match(markup, /<h2\b[^>]*>Heading with <code\b[^>]*>inline code<\/code><\/h2>/);
  assert.match(markup, /<li>List with <code\b[^>]*>inline code<\/code><\/li>/);
  assert.equal((markup.match(/<button\b/g) ?? []).length, 4, "Only the four blocks get copy buttons");
  assert.doesNotMatch(markup, /<code\b[^>]*\bnode=/);
});

test("pre handles labelled, unlabelled, empty and indented blocks with existing CodeBlock", () => {
  const parsed = ReactMarkdown(markdown.props);
  const preNodes = findElements(parsed, (element) => element.type === markdown.props.components.pre);
  assert.equal(preNodes.length, 4);
  const blocks = preNodes.map((element) => element.type(element.props));
  assert.deepEqual(blocks.map(({ props }) => [props.language, props.code]), [
    ["js", "const answer = 42;"],
    ["plaintext", "unlabelled\n  indented\n"],
    ["plaintext", ""],
    ["plaintext", "indented block"],
  ]);
  for (const block of blocks) {
    assert.equal(block.type.name, "CodeBlock");
    assert.equal(block.props.children.type.name, "CodeBlockCopyButton");
    assert.match(renderToStaticMarkup(block), /<button\b/);
    assert.doesNotMatch(renderToStaticMarkup(block), /<pre\b[^>]*>\s*<div\b/);
  }
});

test("article JSON-LD cannot close its script and preserves its data", () => {
  const [script] = findElements(page, (element) => element.type === "script" && element.props.type === "application/ld+json");
  const serialized = script.props.dangerouslySetInnerHTML.__html;
  assert.equal(/[<>&\u2028\u2029]/.test(serialized), false);
  const data = JSON.parse(serialized);
  assert.equal(data["@graph"][0].headline, post.title);
  assert.equal(data["@graph"][0].description, post.excerpt);
  assert.equal((renderToStaticMarkup(script).match(/<\/script>/g) ?? []).length, 1);
});

test("actual article metadata retains AVD passwordless MFA intent and the existing canonical slug", async () => {
  const { SITE_URL } = await import("../lib/site.ts");
  const metadata = await compiledModule.exports.generateMetadata({
    params: Promise.resolve({ slug: avdPost.slug }),
  });
  const expectedTitle = "Azure Virtual Desktop: Passwordless MFA with Entra ID";
  assert.deepEqual(metadata.title, { absolute: expectedTitle });
  assert.match(metadata.title.absolute, /Passwordless MFA/);
  assert.equal(metadata.openGraph.title, expectedTitle);
  assert.equal(metadata.twitter.title, expectedTitle);
  const canonical = `${SITE_URL}/blog/securing-azure-virtual-desktop-with-entra-id-and-passwordless-mfa`;
  assert.equal(metadata.alternates.canonical, canonical);
  assert.equal(metadata.openGraph.url, canonical);
});

test("actual article metadata preserves other long titles, normalizing only whitespace", async () => {
  for (const fixture of longTitlePosts) {
    const metadata = await compiledModule.exports.generateMetadata({
      params: Promise.resolve({ slug: fixture.slug }),
    });
    assert.deepEqual(metadata.title, { absolute: fixture.expectedTitle });
    assert.equal(metadata.openGraph.title, fixture.expectedTitle);
    assert.equal(metadata.twitter.title, fixture.expectedTitle);
  }
});

test("AVD heading and schema retain the original public title", async () => {
  const article = await compiledModule.exports.default({
    params: Promise.resolve({ slug: avdPost.slug }),
  });
  const [heading] = findElements(article, (element) => element.type === "h1");
  assert.equal(heading.props.children, avdPost.title);
  const [script] = findElements(article, (element) => element.type === "script" && element.props.type === "application/ld+json");
  const data = JSON.parse(script.props.dangerouslySetInnerHTML.__html);
  assert.equal(data["@graph"][0].headline, avdPost.title);
  assert.equal(data["@graph"][0].name, avdPost.title);
  assert.equal(data["@graph"][1].itemListElement[2].name, avdPost.title);
});
