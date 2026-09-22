import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAuth } from "@/lib/auth";

export async function POST(req) {
  const user = await verifyAuth();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid post data" }, { status: 400 });
  }

  const { id, title, content, tags, coverImage } = body;
  // The edit form sends a string ID. Accept decimal digits, never a parsed prefix.
  const numericId = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
  if (!Number.isSafeInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  if (
    typeof title !== "string" || !title.trim() ||
    typeof content !== "string" || !content.trim() ||
    (tags != null && typeof tags !== "string") ||
    (coverImage != null && typeof coverImage !== "string")
  ) {
    return NextResponse.json({ error: "Invalid post data" }, { status: 400 });
  }

  const excerpt = content.substring(0, 150) + "...";

  try {
    // Slugs are permanent identifiers. Omitting slug also ignores any caller
    // override; RETURNING checks existence atomically without a read/write race.
    const [updated] = await db.update(posts)
      .set({
        title,
        content,
        excerpt,
        tags,
        coverImage,
      })
      .where(eq(posts.id, numericId))
      .returning({ slug: posts.slug });

    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only construct a concrete path for a safe, bounded single URL segment.
    // Unusual legacy slugs stay untouched; invalidate the fixed page pattern
    // instead of interpreting their separators, query strings or route syntax.
    const { slug } = updated;
    const articlePath = `/blog/${slug}`;
    if (
      /^[A-Za-z0-9._~-]+$/.test(slug) && slug !== "." && slug !== ".." &&
      articlePath.length < 1024
    ) {
      revalidatePath(articlePath);
    } else {
      revalidatePath("/blog/[slug]", "page");
    }
    revalidatePath("/blog");
    revalidatePath("/rss.xml");
    revalidatePath("/sitemap.xml");
    revalidatePath("/sitemap.txt");
    return NextResponse.json({ success: true });
  } catch {
    // Driver errors may contain SQL parameters (article content) or credentials.
    console.error("Failed to update post");
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
