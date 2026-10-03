# Local article draft review

Open <http://localhost:3100/drafts> in the running local project.

- <http://localhost:3100/drafts/kv-cache-memory-sizing-gqa-optimization>
- <http://localhost:3100/drafts/foundry-agent-service-production-checklist>
- <http://localhost:3100/drafts/openwebui-fastapi-model-discovery-streaming>
- <http://localhost:3100/drafts/prefix-caching-vs-kv-cache>

The preview displays the full local Markdown body, summary, proposed cover and
photo credit. It strips editorial front matter and the retained sizing draft's
duplicate H1. Body rendering uses the same `MarkdownComponents` as the public
blog, mechanically extracted without changing the existing article behavior.

## Start it later

```sh
npm run dev:drafts
```

This binds Next development to **127.0.0.1:3100**, enables
`PORTFOLIO_DRAFT_PREVIEW=1` for that process, and does not run the normal `predev`
server-killing hook. Check whether port 3100 is already in use before starting it.
Use the existing server if it is running; do not kill another user's process.

During this task the server was started with Turso and Gmail variables explicitly
empty, `VERCEL=1` to keep admin endpoints off, and `VERCEL_ENV` empty. No environment
file was edited, database connection made or email sent. The ordinary public blog
list therefore has no database-backed content in this isolated review process.
Restarting with the bare command above loads your normal local environment; the
draft pages themselves still use local files only, but other routes may use Turso.

## Local-only boundary

The shared pure gate requires all of:

- `NODE_ENV=development`;
- explicit preview flag `1`;
- no Vercel deployment environment;
- localhost, 127.0.0.1 or IPv6 loopback Host.

Middleware rejects unauthorized requests with an empty 404 before streaming.
Server components repeat the gate before loading allowlisted draft files. No
user-controlled filesystem path is read. Filesystem tracing is explicitly scoped
to `scripts/blog-content/drafts`, not the entire repository. Drafts are absent
from sitemap/RSS, carry noindex/nofollow/noarchive metadata and response headers,
and do not create BlogPosting schema or publication dates.

Opening a preview **does not approve or publish** it. There is intentionally no
fake approval/save button. Confirm which articles/covers you approve in the
conversation after reviewing them. Nothing is inserted into Turso or pushed to
GitHub by the preview.

## Verification

- Three preview tests failed before implementation, then passed: explicit gate,
  four allowlisted bodies/cover assignments, production/unknown-path refusal.
- Existing 172 application/publisher tests passed, including actual public blog
  Markdown and metadata checks after the mechanical renderer extraction.
- Production build passed with isolated local SQLite and an ephemeral signing key.
  The initial reused temporary fixture lacked its table; a fresh empty fixture
  fixed the environment. An initial broad filesystem-tracing warning was corrected
  by statically scoping the read. Existing middleware/Edge deprecation warnings remain.
- Actual production HTTP checks: index and article returned **404 with empty
  bodies**, noindex headers, even with the preview flag enabled.
- Development HTTP checks: index and all four articles returned **200** with
  noindex headers. Next dev uses its own no-cache/must-revalidate policy.
- All four article pages checked at **1440px and 390px**: one H1, images loaded with
  meaningful alt text, no horizontal overflow. Shared renderer's inline code is
  inline. Normal/reduced-motion path checked on the Open WebUI preview; no new
  animation was added. Development index/selected article screenshots inspected.
- No Git commit/push, shared-database publication, indexing request or credential
  changes. Temporary production server stopped; local development remains running.

Design Read: existing technical portfolio editorial review, preserve mode;
**DESIGN_VARIANCE 7 / MOTION_INTENSITY 0 / VISUAL_DENSITY 4**. Paper/ink/green palette,
existing fonts, navigation, production URLs and forms preserved. No new dependency.
The draft index is a responsive editorial list, not a new marketing-page rebuild.
