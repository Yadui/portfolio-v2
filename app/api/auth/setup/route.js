import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql, eq } from "drizzle-orm";
import { users } from "@/lib/schema";
import { isRequestFromAllowedAdminIp } from "@/lib/adminAccess";

export async function GET(req) {
  try {
    if (!isRequestFromAllowedAdminIp(req.headers)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create users table if not exists (SQLite syntax)
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

    // Check if admin exists
    const existing = await db.select().from(users).where(eq(users.username, 'admin')).get();
    
    if (existing) {
       // Update password
       await db.update(users).set({ password: 'password123' }).where(eq(users.username, 'admin'));
       return NextResponse.json({ message: "Admin user updated. Password set to 'password123'" });
    } else {
       // Create new
       await db.insert(users).values({ username: 'admin', password: 'password123' });
       return NextResponse.json({ message: "Admin user created. Password is 'password123'" });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
