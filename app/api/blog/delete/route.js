import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAuth } from "@/lib/auth";

/**
 * Delete a post.
 *
 * The auth check here had been commented out, which left the endpoint open:
 * `GET /api/blog/delete?id=1` deleted a post for anyone who sent it. robots.txt
 * disallows /api/, but that is advisory and stops only well-behaved crawlers,
 * so it was not protecting anything. Auth is restored below.
 *
 * GET is also gone. A destructive action must not be reachable by navigation:
 * any prefetch, link preview, or crawler that ignores robots.txt would have
 * fired it. The admin UI already submits a POST form, so nothing legitimate
 * depended on it.
 */
async function handleDelete(req) {
  const user = await verifyAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const numericId = Number.parseInt(id, 10);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    await db.delete(posts).where(eq(posts.id, numericId));
    // The index and articles are cached (ISR); without this the deleted post
    // would keep being served until the revalidate window elapsed.
    revalidatePath("/blog");
    revalidatePath("/blog/[slug]", "page");
    return NextResponse.redirect(new URL("/blog", req.url));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

export async function POST(req) {
  return handleDelete(req);
}

export async function DELETE(req) {
  return handleDelete(req);
}
