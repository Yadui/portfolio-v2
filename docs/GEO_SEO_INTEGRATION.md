# GEO/SEO toolkit integration

## Pinned reference, not a runtime dependency

`vendor/geo-seo-claude/` preserves the MIT-licensed upstream repository at
`f79987f75f369b3aa5e25b7e317c40e8b06db90f`, retrieved on 2026-09-22 from
<https://github.com/zubair-trabzada/geo-seo-claude>.
The license, examples, agents, scripts, schemas and documentation are retained.
Git metadata is excluded. This is an ordinary vendored snapshot, not a submodule.
No installer, global skill installation, auto-update, CRM, or browser download was run.

For this project, use the toolkit through this adapter. Vendoring does not register
upstream `/geo` slash commands in OpenCode or Claude Code; agents can read the
references directly. No toolkit code is imported into the website.

## Audit workflow

1. Establish evidence: inspect current routes, data source, publication controls,
   canonical origin, robots, sitemaps, RSS, metadata, JSON-LD, internal links and
   article bodies. Distinguish deployed observations from local changes.
2. Consult `vendor/geo-seo-claude/geo/SKILL.md`, then the relevant
   `skills/geo-technical/`, `geo-content/`, `geo-schema/`, `geo-crawlers/`,
   `geo-citability/` or `geo-llmstxt/` reference. Adapt publisher/person guidance,
   not ecommerce or LocalBusiness templates.
3. Use Ego Lite for browser work. Respect robots, public-page scope, a maximum
   of 50 pages, bounded timeouts and conservative request rates. Do not execute
   upstream browser/PDF commands as a substitute for the approved browser.
4. Record source URLs and observations in a dated `docs/seo/` report. Label
   untested assumptions and unavailable measurements. Heuristic scores are not
   Google ranking signals or evidence of citation by an AI engine. Omit composite
   scores when the required categories were not measured.
5. Draft content in `scripts/blog-content/drafts/`, grounded in primary sources.
   Preserve existing slugs, avoid keyword-variant duplication, and independently
   check arithmetic and technical procedures. Never invent deployment outcomes,
   backlinks, traffic forecasts, benchmarks, reviews or publication dates.
6. Verify code changes with regression tests, lint and an isolated build. Verify
   affected routes and mobile/desktop rendering when relevant. Record limitations.

## Publication boundary

The runtime blog is database-backed. Markdown files are editorial sources, not
automatically published content. There is no draft column in the current schema.
The local admin UI can write to the shared database: local does not mean staging.

Keep drafts outside `public/` and the seed manifest. Do not execute seed scripts,
submit admin forms, migrate the database, change live articles or request indexing
without explicit authorization. Existing articles need a verified export/backup
and slug-preserving publication path before applying revisions. Draft front matter
must be removed from the published body; the site does not parse it.

## Safety and compatibility review

- Unix installer writes to `~/.claude`, replaces its venv, and rewrites matching
  skill references. Windows uses user-site pip installation. The uninstaller uses
  broad `geo-*` deletion. None belongs in routine Portfolio audits.
- Python dependencies are range-based rather than locked. Keep optional analysis
  dependencies in a disposable venv, outside the application and system Python.
- Fetching scripts can follow redirects and external sitemap locations. They are
  not SSRF-safe fetch services or robots-enforcing crawlers. Do not expose them as
  a public endpoint or run them against private/authenticated resources.
- CRM scripts persist data outside the repo; the Flask UI has no authentication.
  Agency prospecting, outreach, proposals and CRM are outside this integration.
- The PDF skill launches Chrome with `--no-sandbox`; its styles load external
  fonts. Do not use that workflow here. A documented `generate_pdf_report.py`
  does not exist in the pinned tree.
- Despite a documentation claim, `fetch_page.py` uses Requests/BeautifulSoup
  heuristics, not browser rendering. Python Playwright installation is unnecessary
  for its offline tests. Market statistics and scoring weights are upstream
  assertions, not verified facts about this site.
- `llms.txt` is a supplemental discovery file, not a prerequisite or guaranteed
  ranking/citation improvement. The sole project owner is `app/llms.txt/route.ts`.
  Training-bot access and search-bot access are separate policy choices; preserve
  the owner's current robots policy unless a change is requested.

## Optional upstream tests

The reviewed suite uses mocked requests and inline HTML fixtures. Its direct
dependencies are `pytest`, `requests`, `beautifulsoup4`, and `lxml`; no browser is
needed. With those available in an isolated venv:

```sh
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 PYTEST_ADDOPTS= PYTEST_PLUGINS= \
  /path/to/venv/bin/python -I -B -m pytest \
  -c /dev/null --noconftest -p no:cacheprovider \
  vendor/geo-seo-claude/tests/test_fetch_page_ssr.py
```

Mocked-request tests are not a whole-toolkit security review or OS-level network
sandbox. To update the snapshot, review the upstream diff and license first,
preserve the old snapshot, update this pinned revision, and rerun checks. Never
run `/geo update` against this vendored tree.
