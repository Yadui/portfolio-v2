import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql, eq } from "drizzle-orm";
import { users } from "@/lib/schema";
import { hashPassword } from "@/lib/password";
import { isRequestFromAllowedAdminIp } from "@/lib/adminAccess";

/**
 * One-time admin bootstrap.
 *
 * This used to set the admin password to the literal `password123`, which is
 * committed to the repository, and gated only on an IP allowlist derived from
 * `x-forwarded-for` and friends. Those are client-supplied headers, so behind a
 * proxy they are a weak gate for an endpoint that can reset a password.
 *
 * Now it is disabled unless `ADMIN_SETUP_TOKEN` is configured, requires that
 * token in the query string, still checks the IP allowlist, and issues a random
 * password that is shown exactly once and stored only as a hash.
 */
export async function GET(req) {
  try {
    const setupToken = process.env.ADMIN_SETUP_TOKEN;
    const provided = new URL(req.url).searchParams.get("token");

    // No token configured means the route is off. Fail closed.
    if (!setupToken || !provided || provided !== setupToken) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isRequestFromAllowedAdminIp(req.headers)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

    // Random, shown once, never stored in plaintext.
    const generated = randomBytes(18).toString("base64url");
    const hashed = await hashPassword(generated);

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"))
      .get();

    if (existing) {
      await db
        .update(users)
        .set({ password: hashed })
        .where(eq(users.username, "admin"));
      return NextResponse.json({
        message: "Admin password reset. Store this now; it is not shown again.",
        password: generated,
      });
    }

    await db.insert(users).values({ username: "admin", password: hashed });
    return NextResponse.json({
      message: "Admin user created. Store this now; it is not shown again.",
      password: generated,
    });
  } catch (error) {
    console.error(error);
    // Do not echo the internal error message to the client.
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
