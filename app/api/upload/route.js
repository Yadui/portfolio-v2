import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { verifyAuth } from "@/lib/auth";

/**
 * Image upload for the post editor.
 *
 * Previously this had no auth (the check was commented out), no type or size
 * limit, and built its filename from `file.name` with only spaces replaced, so
 * a name containing `../` could escape the upload directory.
 */
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
]);

export async function POST(req) {
  const user = await verifyAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json(
      { error: `Unsupported type. Allowed: ${[...ALLOWED.keys()].join(", ")}` },
      { status: 415 }
    );
  }

  if (typeof file.size === "number" && file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 413 });
  }

  // Build the name ourselves. `path.basename` strips any directory component,
  // and the character class removes anything that could alter the path.
  const base = path
    .basename(String(file.name || "upload"))
    .replace(/\.[^.]*$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(0, 60) || "upload";
  const filename = `${Date.now()}_${base}.${ext}`;

  try {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    const target = path.join(uploadDir, filename);
    // Belt and braces: refuse anything that still resolves outside the folder.
    if (!target.startsWith(uploadDir + path.sep)) {
      return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
    }

    await writeFile(target, buffer);
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to save file." }, { status: 500 });
  }
}
