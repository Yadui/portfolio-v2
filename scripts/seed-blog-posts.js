/**
 * Seed blog posts into the Turso database with backdated timestamps.
 * Run with: node scripts/seed-blog-posts.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { sqliteTable, text, integer } = require('drizzle-orm/sqlite-core');
const { eq } = require('drizzle-orm');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

if (!process.env.TURSO_DATABASE_URL) {
  console.error('Error: TURSO_DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  tags: text('tags'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

const db = drizzle(client, { schema: { posts } });

// ─── Cover image generator (SVG data URI) ─────────────────────────────────────
const escapeXml = (v) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function cover({ eyebrow, lines, from, to, glow }) {
  const lineMarkup = lines
    .map((line, i) => {
      const y = 366 + i * 86;
      return `<text x="88" y="${y}" fill="#f8fafc" font-family="JetBrains Mono, Arial, sans-serif" font-size="68" font-weight="700">${escapeXml(line)}</text>`;
    })
    .join('');
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" fill="none">`,
    `<defs>`,
    `<linearGradient id="bg" x1="0" y1="0" x2="1600" y2="900" gradientUnits="userSpaceOnUse">`,
    `<stop stop-color="#050816"/><stop offset="1" stop-color="#111827"/>`,
    `</linearGradient>`,
    `<linearGradient id="accent" x1="88" y1="96" x2="1512" y2="804" gradientUnits="userSpaceOnUse">`,
    `<stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/>`,
    `</linearGradient>`,
    `<radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1260 160) rotate(128) scale(520 420)">`,
    `<stop stop-color="${glow}" stop-opacity="0.7"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/>`,
    `</radialGradient>`,
    `</defs>`,
    `<rect width="1600" height="900" rx="48" fill="url(#bg)"/>`,
    `<rect width="1600" height="900" rx="48" fill="url(#glow)"/>`,
    `<rect x="88" y="88" width="1424" height="724" rx="36" fill="rgba(15,23,42,0.78)" stroke="rgba(248,250,252,0.12)"/>`,
    `<rect x="88" y="88" width="1424" height="16" fill="url(#accent)"/>`,
    `<text x="88" y="176" fill="rgba(248,250,252,0.72)" font-family="JetBrains Mono, Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="6">${escapeXml(eyebrow.toUpperCase())}</text>`,
    lineMarkup,
    `<text x="88" y="770" fill="rgba(248,250,252,0.52)" font-family="JetBrains Mono, Arial, sans-serif" font-size="26" letter-spacing="3">abhinav.maoverse.xyz / blog</text>`,
    `</svg>`,
  ].join('');
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// ─── Helper to read a .md file ─────────────────────────────────────────────────
function readMd(filename) {
  return fs.readFileSync(path.join(__dirname, 'blog-content', filename), 'utf8').trim();
}

// ─── Blog post metadata ────────────────────────────────────────────────────────
const blogPosts = [
  {
    title: 'Monolith to Microservices on Azure: A Production Migration Playbook',
    tags: 'Azure, Architecture, Microservices, Migration, Cloud',
    createdAt: new Date('2025-09-12T09:00:00.000Z'),
    contentFile: '01-monolith-to-microservices.md',
    coverImage: cover({
      eyebrow: 'Azure Architecture',
      lines: ['Monolith to', 'Microservices'],
      from: '#3b82f6', to: '#6366f1', glow: '#4f46e5',
    }),
  },
  {
    title: 'Securing Azure Virtual Desktop with Entra ID and Passwordless MFA',
    tags: 'Azure, AVD, Entra ID, Security, MFA, Passwordless',
    createdAt: new Date('2025-10-03T09:00:00.000Z'),
    contentFile: '02-avd-entra-id.md',
    coverImage: cover({
      eyebrow: 'Azure Security',
      lines: ['AVD + Entra ID', 'Zero Password'],
      from: '#10b981', to: '#06b6d4', glow: '#0891b2',
    }),
  },
  {
    title: 'Private Endpoints on Azure: The DNS Gotchas Nobody Warns You About',
    tags: 'Azure, Networking, DNS, Private Endpoints, VNet',
    createdAt: new Date('2025-10-28T09:00:00.000Z'),
    contentFile: '03-private-endpoints-dns.md',
    coverImage: cover({
      eyebrow: 'Azure Networking',
      lines: ['Private Endpoints', '& DNS Hell'],
      from: '#f59e0b', to: '#ef4444', glow: '#f97316',
    }),
  },
  {
    title: 'Building a Cloud Cost Calculator with the Azure Retail Prices API',
    tags: 'Azure, Cost Optimization, Pricing API, Cloud Economics, Architecture',
    createdAt: new Date('2025-11-15T09:00:00.000Z'),
    contentFile: '04-azure-pricing-api.md',
    coverImage: cover({
      eyebrow: 'Cloud Economics',
      lines: ['Azure Pricing', 'API Deep Dive'],
      from: '#8b5cf6', to: '#ec4899', glow: '#a855f7',
    }),
  },
  {
    title: 'Building a Production RAG Pipeline with Azure AI Search and GPT-4',
    tags: 'AI, RAG, Azure AI Search, LLM, Vector Search, Python',
    createdAt: new Date('2025-11-29T09:00:00.000Z'),
    contentFile: '05-rag-architecture.md',
    coverImage: cover({
      eyebrow: 'AI Engineering',
      lines: ['RAG Architecture', 'End to End'],
      from: '#00ff99', to: '#22d3ee', glow: '#10b981',
    }),
  },
  {
    title: 'Designing Agentic AI Workflows: Tool-Calling, Memory, and Multi-Modal Integration',
    tags: 'AI Agents, LLM, Tool Calling, Memory, Multi-Modal, VirtuAI',
    createdAt: new Date('2025-12-12T09:00:00.000Z'),
    contentFile: '06-ai-agent-frameworks.md',
    coverImage: cover({
      eyebrow: 'AI Agent Design',
      lines: ['Agentic Systems', 'Deep Dive'],
      from: '#a78bfa', to: '#f472b6', glow: '#8b5cf6',
    }),
  },
  {
    title: 'SchemaForge: Extracting Structured Data from Unstructured Documents with Azure AI',
    tags: 'Azure AI, Document Intelligence, Computer Vision, OCR, Python, SchemaForge',
    createdAt: new Date('2026-01-08T09:00:00.000Z'),
    contentFile: '07-schemaforge-document-intelligence.md',
    coverImage: cover({
      eyebrow: 'Document AI',
      lines: ['SchemaForge', 'Layout Analysis'],
      from: '#f59e0b', to: '#10b981', glow: '#f59e0b',
    }),
  },
  {
    title: 'Connecting Custom AI Agents to OpenWebUI: Auth, Latency, and API Design',
    tags: 'AI, OpenWebUI, API Design, Authentication, FastAPI, Integration',
    createdAt: new Date('2026-01-24T09:00:00.000Z'),
    contentFile: '08-openwebui-integration.md',
    coverImage: cover({
      eyebrow: 'Platform Integration',
      lines: ['Custom Agents', '+ OpenWebUI'],
      from: '#06b6d4', to: '#3b82f6', glow: '#0ea5e9',
    }),
  },
  {
    title: 'Next.js + FastAPI: The Full-Stack Combination That Replaced Our Monolith',
    tags: 'Next.js, FastAPI, Full Stack, Performance, Tailwind, DX',
    createdAt: new Date('2026-02-05T09:00:00.000Z'),
    contentFile: '09-nextjs-fastapi-stack.md',
    coverImage: cover({
      eyebrow: 'Full Stack Dev',
      lines: ['Next.js + FastAPI', 'vs Monolith'],
      from: '#000000', to: '#3b82f6', glow: '#1d4ed8',
    }),
  },
  {
    title: 'Dockerizing a Complex App: Lightweight Images, Multi-Stage Builds, and Secrets',
    tags: 'Docker, Containers, DevOps, Security, Multi-Stage Build, CI/CD',
    createdAt: new Date('2026-02-20T09:00:00.000Z'),
    contentFile: '10-dockerizing-apps.md',
    coverImage: cover({
      eyebrow: 'Containerisation',
      lines: ['Docker Deep', 'Dive'],
      from: '#2563eb', to: '#06b6d4', glow: '#3b82f6',
    }),
  },
  {
    title: 'Automating Azure App Service Deployments with GitHub Actions and Secure Secrets',
    tags: 'CI/CD, GitHub Actions, Azure App Service, Secrets, DevOps, YAML',
    createdAt: new Date('2026-03-07T09:00:00.000Z'),
    contentFile: '11-github-actions-azure-cicd.md',
    coverImage: cover({
      eyebrow: 'CI/CD & DevOps',
      lines: ['GitHub Actions', '+ Azure Deploy'],
      from: '#1a1a2e', to: '#16213e', glow: '#0f3460',
    }),
  },
];

// ─── Insert ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Seeding ${blogPosts.length} blog posts...\n`);

  for (const post of blogPosts) {
    const slug = slugify(post.title, { lower: true, strict: true });
    const content = readMd(post.contentFile);
    const excerpt = content.replace(/[#*`>\[\]|]/g, '').replace(/\s+/g, ' ').trim().substring(0, 200) + '...';

    const existing = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).get();
    if (existing) {
      console.log(`  ⚠️  Skipping (already exists): ${slug}`);
      continue;
    }

    await db.insert(posts).values({
      title: post.title,
      slug,
      content,
      excerpt,
      tags: post.tags,
      coverImage: post.coverImage,
      createdAt: post.createdAt,
    });

    console.log(`  ✅ Inserted: ${slug} (${post.createdAt.toISOString().split('T')[0]})`);
  }

  console.log('\nDone.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
