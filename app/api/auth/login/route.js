import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { login } from "@/lib/auth";
import { hashPassword, isHashed, verifyPassword } from "@/lib/password";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    // Validate before touching the database.
    if (!username || !password || username.length > 64 || password.length > 200) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = await db.select().from(users).where(eq(users.username, username)).get();

    // Same response and roughly the same work for unknown user and wrong
    // password, so the endpoint does not confirm which usernames exist.
    if (!user) {
      await verifyPassword(password, "scrypt$16384$00$00");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Transparent migration: the first correct login on a legacy plaintext row
    // replaces it with a hash, so no password reset is needed.
    if (!isHashed(user.password)) {
      try {
        await db
          .update(users)
          .set({ password: await hashPassword(password) })
          .where(eq(users.id, user.id));
      } catch (error) {
        console.error("Password upgrade failed:", error);
      }
    }

    await login({ username: user.username, id: user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
