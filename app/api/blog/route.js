import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import slugify from "slugify";
import { eq } from "drizzle-orm"; // Ensure we have eq for the duplicate check code
import { verifyAuth } from "@/lib/auth";

export async function POST(req) {
  const user = await verifyAuth();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, tags, coverImage } = await req.json();
  let slug = slugify(title, { lower: true, strict: true });
  
  // Check for existing slug to avoid unique constraint errors
  const existing = await db.select().from(posts).where(eq(posts.slug, slug)).get();
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-6)}`;
  }

  const excerpt = content.substring(0, 150) + "...";

  try {
    await db.insert(posts).values({
      title,
      slug,
      content,
      excerpt,
      tags,
      coverImage,
      createdAt: new Date(),
    });
    // The index and the article are cached (ISR). Without this an admin
    // created post would not appear until the revalidate window elapsed.
    revalidatePath("/blog");
    revalidatePath("/blog/[slug]", "page");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
