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
    coverImage: '/blog-covers/microservices.jpg',
  },
  {
    title: 'Securing Azure Virtual Desktop with Entra ID and Passwordless MFA',
    tags: 'Azure, AVD, Entra ID, Security, MFA, Passwordless',
    createdAt: new Date('2025-10-03T09:00:00.000Z'),
    contentFile: '02-avd-entra-id.md',
    coverImage: '/blog-covers/avd-entra-id.jpg',
  },
  {
    title: 'Private Endpoints on Azure: The DNS Gotchas Nobody Warns You About',
    tags: 'Azure, Networking, DNS, Private Endpoints, VNet',
    createdAt: new Date('2025-10-28T09:00:00.000Z'),
    contentFile: '03-private-endpoints-dns.md',
    coverImage: '/blog-covers/private-endpoints-dns.jpg',
  },
  {
    title: 'Building a Cloud Cost Calculator with the Azure Retail Prices API',
    tags: 'Azure, Cost Optimization, Pricing API, Cloud Economics, Architecture',
    createdAt: new Date('2025-11-15T09:00:00.000Z'),
    contentFile: '04-azure-pricing-api.md',
    coverImage: '/blog-covers/azure-pricing.jpg',
  },
  {
    title: 'Building a Production RAG Pipeline with Azure AI Search and GPT-4',
    tags: 'AI, RAG, Azure AI Search, LLM, Vector Search, Python',
    createdAt: new Date('2025-11-29T09:00:00.000Z'),
    contentFile: '05-rag-architecture.md',
    coverImage: '/blog-covers/rag-pipeline.jpg',
  },
  {
    title: 'Designing Agentic AI Workflows: Tool-Calling, Memory, and Multi-Modal Integration',
    tags: 'AI Agents, LLM, Tool Calling, Memory, Multi-Modal, VirtuAI',
    createdAt: new Date('2025-12-12T09:00:00.000Z'),
    contentFile: '06-ai-agent-frameworks.md',
    coverImage: '/blog-covers/ai-agents.jpg',
  },
  {
    title: 'SchemaForge: Extracting Structured Data from Unstructured Documents with Azure AI',
    tags: 'Azure AI, Document Intelligence, Computer Vision, OCR, Python, SchemaForge',
    createdAt: new Date('2026-01-08T09:00:00.000Z'),
    contentFile: '07-schemaforge-document-intelligence.md',
    coverImage: '/blog-covers/schemaforge.jpg',
  },
  {
    title: 'Connecting Custom AI Agents to OpenWebUI: Auth, Latency, and API Design',
    tags: 'AI, OpenWebUI, API Design, Authentication, FastAPI, Integration',
    createdAt: new Date('2026-01-24T09:00:00.000Z'),
    contentFile: '08-openwebui-integration.md',
    coverImage: '/blog-covers/openwebui.jpg',
  },
  {
    title: 'Next.js + FastAPI: The Full-Stack Combination That Replaced Our Monolith',
    tags: 'Next.js, FastAPI, Full Stack, Performance, Tailwind, DX',
    createdAt: new Date('2026-02-05T09:00:00.000Z'),
    contentFile: '09-nextjs-fastapi-stack.md',
    coverImage: '/blog-covers/nextjs-fastapi.jpg',
  },
  {
    title: 'Dockerizing a Complex App: Lightweight Images, Multi-Stage Builds, and Secrets',
    tags: 'Docker, Containers, DevOps, Security, Multi-Stage Build, CI/CD',
    createdAt: new Date('2026-02-20T09:00:00.000Z'),
    contentFile: '10-dockerizing-apps.md',
    coverImage: '/blog-covers/docker.jpg',
  },
  {
    title: 'Automating Azure App Service Deployments with GitHub Actions and Secure Secrets',
    tags: 'CI/CD, GitHub Actions, Azure App Service, Secrets, DevOps, YAML',
    createdAt: new Date('2026-03-07T09:00:00.000Z'),
    contentFile: '11-github-actions-azure-cicd.md',
    coverImage: '/blog-covers/github-actions-azure.jpg',
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
