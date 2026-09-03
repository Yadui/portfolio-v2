import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_HOST as CANONICAL_HOST } from "@/lib/site";
import {
  ADMIN_ENABLED,
  ADMIN_WRITE_METHODS,
  isAdminPath,
} from "@/lib/adminEnabled";

// The single canonical host. Every production request served on a different
// host (e.g. the default *.vercel.app alias) is 308-redirected here so search
// engines and backlinks consolidate onto one domain instead of a duplicate.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin surface ──────────────────────────────────────────────────────
  // Blocked before anything else, and on every deployed environment rather
  // than production only, so a preview URL is not a way around it. 404 rather
  // than 403: a deployed site should not confirm that these routes exist.
  if (!ADMIN_ENABLED && isAdminPath(pathname)) {
    const isBlogCreate =
      pathname === "/api/blog" &&
      !ADMIN_WRITE_METHODS.includes(request.method.toUpperCase());

    if (!isBlogCreate) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // ── Canonical host ─────────────────────────────────────────────────────
  // Only enforced on real production deployments. Local dev (`next dev`) and
  // Vercel preview/branch deployments keep their own URLs.
  if (process.env.VERCEL_ENV !== "production") {
    return NextResponse.next();
  }

  const host = request.headers.get("host");

  if (host && host !== CANONICAL_HOST) {
    const url = new URL(request.url);
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    url.port = "";
    // 308 = permanent redirect that preserves the request method.
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Page routes, for host canonicalization. Skips Next internals and any
    // path containing a dot (static files), which need no rewriting.
    "/((?!_next/|api/|.*\\..*).*)",
    // The admin API routes are matched explicitly, because the page matcher
    // above deliberately excludes `api/`. Without these the write endpoints
    // would stay reachable in production.
    "/api/auth/:path*",
    "/api/upload",
    "/api/blog",
    "/api/blog/:path*",
  ],
};
