import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The single canonical host. Every production request served on a different
// host (e.g. the default *.vercel.app alias) is 308-redirected here so search
// engines and backlinks consolidate onto one domain instead of a duplicate.
const CANONICAL_HOST = "abhinav.maoverse.xyz";

export function middleware(request: NextRequest) {
  // Only enforce the canonical host on real production deployments. Local dev
  // (`next dev`) and Vercel preview/branch deployments are left untouched so
  // their URLs keep working.
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
  // Run on page routes only. Skips Next internals (_next), API routes, and any
  // path containing a dot (static files like .svg/.xml/.ico/.txt), which are
  // already served correctly and don't need host canonicalization.
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
