import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { verifyAuth } from "@/lib/auth";

export async function POST(req) {
  const user = await verifyAuth();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, title, content, tags, coverImage } = await req.json();
  const slug = slugify(title, { lower: true, strict: true });
  const excerpt = content.substring(0, 150) + "...";

  try {
    await db.update(posts)
      .set({
        title,
        slug,
        content,
        excerpt,
        tags,
        coverImage,
      })
      .where(eq(posts.id, parseInt(id)));
      
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
