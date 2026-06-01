import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { seededBlogPosts } from "@/data/blogPosts";

const BASE_URL = "https://abhinav.maoverse.xyz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/resume`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Work detail pages (slugs from siteContent.ts experience array)
  const workSlugs = ["foetron", "outlier", "vmcoders"];
  const workRoutes: MetadataRoute.Sitemap = workSlugs.map((slug) => ({
    url: `${BASE_URL}/work/${slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  // Blog post pages — fetch from DB, fall back to seeded slugs
  let blogSlugs: { slug: string; createdAt: Date | number }[] = seededBlogPosts.map(
    (p: { slug: string; createdAt: string }) => ({ slug: p.slug, createdAt: new Date(p.createdAt) })
  );
  try {
    const dbPosts = await (db as any).select({ slug: posts.slug, createdAt: posts.createdAt }).from(posts).orderBy(desc(posts.createdAt));
    if (dbPosts.length > 0) {
      // Merge: DB posts override seeded ones, then append any seeded not in DB
      const dbSlugsSet = new Set(dbPosts.map((p) => p.slug));
      const seededOnly = blogSlugs.filter((p) => !dbSlugsSet.has(p.slug));
      blogSlugs = [...dbPosts, ...seededOnly];
    }
  } catch {}

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map(({ slug, createdAt }) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: createdAt instanceof Date ? createdAt : new Date(createdAt),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...workRoutes, ...blogRoutes];
}
