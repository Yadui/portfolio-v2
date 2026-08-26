import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { mergeBlogPosts } from "@/data/blogPosts";
import { SITE_URL as BASE_URL } from "@/lib/site";

const FEED_TITLE = "Abhinav Yadav — Blog";
const FEED_DESCRIPTION =
  "Articles on full-stack development, AI, system design, and building software — by Abhinav Yadav.";

// Regenerate the feed at most once an hour so newly published posts appear
// without a full rebuild (mirrors the sitemap revalidation cadence).
export const revalidate = 3600;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripMarkdown = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export async function GET() {
  let storedPosts: unknown[] = [];
  try {
    storedPosts = await (db as any)
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));
  } catch {
    // DB unreachable at request time — fall back to seeded posts only.
  }

  const allPosts = mergeBlogPosts(storedPosts as any);
  const lastBuildDate = (
    allPosts.length > 0 ? new Date(allPosts[0].createdAt) : new Date()
  ).toUTCString();

  const items = allPosts
    .map((post: any) => {
      const url = `${BASE_URL}/blog/${post.slug}`;
      const description =
        post.excerpt?.trim() ||
        stripMarkdown(String(post.content || "")).slice(0, 280);
      const pubDate = new Date(post.createdAt).toUTCString();
      const categories = (post.tags ? String(post.tags).split(",") : [])
        .map((tag: string) => tag.trim())
        .filter(Boolean)
        .map((tag: string) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n");

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
${categories}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${BASE_URL}/blog</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
