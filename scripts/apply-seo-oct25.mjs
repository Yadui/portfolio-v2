/** Guarded SEO edits to live posts (2026-10-25): backup, exact-match replace, verify, transactional. */
import { randomUUID } from 'node:crypto';
import { mkdir, open } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

const after = (anchor, text) => ({ anchor, text });
const edits = {
  'prefix-caching-vs-kv-cache': {
    title: 'Prefix caching vs KV cache: what is the difference?',
    excerpt: 'KV cache reuses keys and values inside one request; prefix caching reuses them across requests. How they differ, when hits fail and how to check.',
  },
  'securing-azure-virtual-desktop-with-entra-id-and-passwordless-mfa': {
    title: 'Azure Virtual Desktop Passwordless MFA and SSO with Entra',
    excerpt: 'Set up Azure Virtual Desktop MFA, single sign-on and passwordless sign-in with Entra ID: Conditional Access targets, SSO steps and FSLogix access.',
    replace: [
      ['If you are searching for Azure Active Directory passwordless authentication, MFA for VDI, Azure Virtual Desktop MFA, Windows Virtual Desktop MFA, or Azure Virtual Desktop single sign-on, start by separating these service, session-host, and in-session boundaries.',
       'Whether you need MFA for VDI, passwordless sign-in or AVD single sign-on, start by separating these service, session-host, and in-session boundaries.'],
      ['## Target the correct Conditional Access applications', '## Enforce Azure Virtual Desktop MFA with Conditional Access'],
      ['## Configure SSO and profile access independently', '## Configure Azure Virtual Desktop SSO and profile access separately'],
    ],
  },
  'llm-kv-cache-why-not-query': {
    append: '\n\nTo turn this into a number for your own model, work through [KV cache memory sizing with GQA](/blog/kv-cache-memory-sizing-gqa-optimization). For reuse across requests, see [prefix caching vs KV cache](/blog/prefix-caching-vs-kv-cache).',
  },
  'github-actions-persist-credentials-security': {
    append: '\n\nThe same lesson applies to AI tooling: a token that sits where other code can read it will eventually be read. See [stop giving AI agents your production keys](/blog/stop-giving-ai-agents-production-keys) and the [LiteLLM 1.107.0 incident response guide](/blog/litellm-1-107-0-incident-response-ai-gateways) for what that looks like in practice.',
  },
  'foundry-agent-service-production-checklist': {
    append: '\n\nFor the identity and network side of agent security in more depth, see [stop giving AI agents your production keys](/blog/stop-giving-ai-agents-production-keys) and [AI agent kill switches and egress gateways](/blog/ai-agent-kill-switch-egress-gateway).',
  },
  'designing-agentic-ai-workflows-tool-calling-memory-and-multi-modal-integration': {
    append: '\n\nIf your agent can generate and run code, read [how prompt injection became remote code execution in Flowise, Langflow and PraisonAI](/blog/prompt-injection-to-code-execution-agent-frameworks) before you ship that tool.',
  },
  'dockerizing-a-complex-app-lightweight-images-multi-stage-builds-and-secrets': {
    append: '\n\nPinning matters for dependencies too. The [LiteLLM 1.107.0 compromise](/blog/litellm-1-107-0-incident-response-ai-gateways) shows why hash-pinned lock files and image digests are worth the extra step.',
  },
  'automating-azure-app-service-deployments-with-github-actions-and-secure-secrets': {
    append: '\n\nKeeping secrets out of your hosting platform where you can is not paranoia: the [Railway breach](/blog/railway-emudhra-sbi-breaches-explained) exposed customer environment variables. Prefer managed identity and Key Vault references over stored values.',
  },
  'microsoft-foundry-agent-service-cloud-runtime': {
    append: '\n\nReady to ship one? Use the [Foundry Agent Service production readiness checklist](/blog/foundry-agent-service-production-checklist).',
  },
};

// Replace auto-truncated or over-long meta descriptions (ending in "..." or >160 chars).
const excerpts = {
 "monolith-to-microservices-on-azure-a-production-migration-playbook": "How we split a Django and PostgreSQL monolith into microservices on Azure: what to split first, load balancer pitfalls and a staged traffic cutover.",
 "private-endpoints-on-azure-the-dns-gotchas-nobody-warns-you-about": "Azure Private Endpoint DNS troubleshooting: unlinked private DNS zones, VNet peering, on-premises forwarding and Azure SQL split-horizon fixes.",
 "building-a-cloud-cost-calculator-with-the-azure-retail-prices-api": "Build an Azure cost calculator on the Retail Prices API: query SKU prices, compare regions and work out reserved instance break-even points.",
 "building-a-production-rag-pipeline-with-azure-ai-search-and-gpt-4": "An end-to-end RAG pipeline on Azure AI Search and Azure OpenAI: indexing, hybrid vector and keyword retrieval, prompt construction and evaluation.",
 "designing-agentic-ai-workflows-tool-calling-memory-and-multi-modal-integration": "How to design agentic AI workflows: tool definitions and calling, memory management, multi-modal input and where agent frameworks add value.",
 "schemaforge-extracting-structured-data-from-unstructured-documents-with-azure-ai": "Extract structured data from PDFs and scans with Azure Document Intelligence layout analysis and GPT-4o schema mapping, plus the hard edge cases.",
 "connecting-custom-ai-agents-to-openwebui-auth-latency-and-api-design": "Connect a custom AI agent to Open WebUI through an OpenAI-compatible FastAPI endpoint: API contract, streaming, authentication and latency.",
 "nextjs-fastapi-the-full-stack-combination-that-replaced-our-monolith": "Why we replaced a Flask and jQuery monolith with Next.js and FastAPI: the performance case, backend choice, Tailwind and the integration layer.",
 "dockerizing-a-complex-app-lightweight-images-multi-stage-builds-and-secrets": "Shrink Docker images with multi-stage builds, use the build cache well, keep secrets out of images and write a .dockerignore that actually helps.",
 "automating-azure-app-service-deployments-with-github-actions-and-secure-secrets": "Deploy to Azure App Service with GitHub Actions: OIDC instead of stored secrets, Azure Container Registry, slot swaps and Key Vault configuration.",
 "jwt-localstorage-cookie-auth": "Why storing JWTs in localStorage is risky: the XSS attack surface, the CSRF trade-off of cookies and the short-lived token plus HttpOnly pattern.",
 "github-actions-persist-credentials-security": "actions/checkout leaves a GitHub token on disk by default. Why persist-credentials: false matters, how it is exploited and how to keep git auth.",
 "microsoft-foundry-agent-service-cloud-runtime": "Microsoft Foundry Agent Service now acts as a managed agent runtime: identity, tools, tracing and deployment. What it means for Azure teams.",
 "gpt-5-4-coding-and-computer-use": "GPT-5.4 combines coding, tool search and computer use in one model. What changed for developers building coding agents and web automation.",
 "vercel-ai-sdk-5-type-safe-agents": "Vercel AI SDK 5 brings typed UI messages and first-class agent loops to the frontend. What shipped, why it matters and how to migrate.",
 "openai-responses-api-agentic-web-apps": "The OpenAI Responses API puts tools, search, files and multi-step agents behind one primitive. What shipped and what it changes for web apps.",
 "ego-lite-browser-for-ai-agents": "ego (lite) lets a coding agent use your logged-in browser in its own space without stealing focus. How it works, where it fits and its limits."
};
for (const [slug, excerpt] of Object.entries(excerpts)) edits[slug] = { ...(edits[slug] || {}), excerpt };

dotenv.config({ path: '.env.local', quiet: true });
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const slugs = Object.keys(edits);
const rows = (await db.execute({ sql: `SELECT * FROM posts WHERE slug IN (${slugs.map(() => '?').join(',')})`, args: slugs })).rows;
if (rows.length !== slugs.length) throw new Error('Missing posts');
const planned = rows.map((row) => {
  const e = edits[row.slug]; let content = row.content;
  for (const [a, b] of e.replace || []) { if (!content.includes(a)) throw new Error(`Anchor missing in ${row.slug}: ${a.slice(0, 40)}`); content = content.replace(a, b); }
  if (e.append) { const target = e.append.match(/\/blog\/[a-z0-9-]+/g); if (target.every((t) => content.includes(t + ')'))) throw new Error(`Already applied: ${row.slug}`); content = content.trimEnd() + e.append + '\n'; }
  if (/[—–]/.test((e.append || '') + (e.title || '') + (e.excerpt || ''))) throw new Error('dash');
  if (e.excerpt && e.excerpt.length > 155) throw new Error(`excerpt long ${row.slug}`);
  if (e.title && e.title.length > 60) throw new Error(`title long ${row.slug}`);
  return { slug: row.slug, title: e.title || row.title, excerpt: e.excerpt || row.excerpt, content };
});
if (!process.argv.includes('--apply')) { console.log(JSON.stringify(planned.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt })), null, 1)); process.exit(0); }
const dir = path.join(process.cwd(), '.local', 'blog-backups'); await mkdir(dir, { recursive: true, mode: 0o700 });
const bp = path.join(dir, `seo-oct25-${Date.now()}-${randomUUID()}.json`);
const f = await open(bp, 'wx', 0o600); await f.writeFile(JSON.stringify(rows, null, 1)); await f.sync(); await f.close();
const tx = await db.transaction('write');
try {
  for (const p of planned) await tx.execute({ sql: 'UPDATE posts SET title=?, excerpt=?, content=? WHERE slug=?', args: [p.title, p.excerpt, p.content, p.slug] });
  const check = (await tx.execute({ sql: `SELECT slug,title,content FROM posts WHERE slug IN (${slugs.map(() => '?').join(',')})`, args: slugs })).rows;
  if (check.some((r) => { const p = planned.find((x) => x.slug === r.slug); return r.title !== p.title || r.content !== p.content; })) throw new Error('verify failed');
  await tx.commit();
} catch (e) { await tx.rollback(); throw e; } finally { tx.close(); db.close(); }
console.log(JSON.stringify({ applied: slugs.length, backup: bp }));
