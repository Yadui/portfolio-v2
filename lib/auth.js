import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Session signing key.
 *
 * This previously fell back to a hardcoded string. With JWT_SECRET unset, that
 * value signs every session, and because it is committed to the repository
 * anyone could mint a valid admin session. In production we now fail closed
 * rather than silently accept a public secret; development keeps a default so
 * a fresh clone still runs.
 */
const DEV_FALLBACK_SECRET = "dev-only-insecure-secret";
const secretKey = process.env.JWT_SECRET || DEV_FALLBACK_SECRET;

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not set. Refusing to sign sessions with a public fallback."
  );
}

const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input) {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function login(userData) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  const session = await encrypt({ user: userData, expires });
  
  const cookieStore = await cookies();
  cookieStore.set("session", session, { 
    expires, 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/" 
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function verifyAuth() {
  const session = await getSession();
  if (!session?.user) return null;
  return session.user;
}
