import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { login } from "@/lib/auth";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // Find user
    const user = await db.select().from(users).where(eq(users.username, username)).get();

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.password !== password) {
       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create session
    await login({ username: user.username, id: user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
