import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { seededBlogPosts } from "@/data/blogPosts";

const BASE_URL = "https://abhinav.maoverse.xyz";

// Regenerate the sitemap at most once an hour so blog posts added to the DB
// after a deploy are picked up automatically (without a full rebuild).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Evergreen pages.
  //
  // `lastModified` is intentionally omitted here: we have no authentic
  // per-page modified date, and an unverifiable / "always today" date is worse
  // than none — Google only uses lastmod it can trust, and a fudged date is a
  // hindrance. `changeFrequency` and `priority` are omitted for the same
  // reason (Google ignores them). Honest URLs only.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL },
    { url: `${BASE_URL}/blog` },
    { url: `${BASE_URL}/services` },
    { url: `${BASE_URL}/contact` },
    { url: `${BASE_URL}/resume` },
  ];

  // Work case-study pages (slugs from the experience data).
  const workSlugs = ["foetron", "outlier", "vmcoders"];
  const workRoutes: MetadataRoute.Sitemap = workSlugs
    .filter((slug) => typeof slug === "string" && slug.trim().length > 0)
    .map((slug) => ({ url: `${BASE_URL}/work/${slug}` }));

  // Blog post pages. The publish date (createdAt) is the one authentic date we
  // have, so it is the only place we attach `lastModified`. Fetch from DB, fall
  // back to seeded slugs when the DB is unavailable.
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

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs
    .filter(({ slug }) => typeof slug === "string" && slug.trim().length > 0)
    .map(({ slug, createdAt }) => ({
      url: `${BASE_URL}/blog/${slug.trim()}`,
      lastModified: createdAt instanceof Date ? createdAt : new Date(createdAt),
    }));

  return [...staticRoutes, ...workRoutes, ...blogRoutes];
}
