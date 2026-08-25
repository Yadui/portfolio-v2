import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

// Admin status as a tiny client-callable endpoint.
//
// The blog post page used to call verifyAuth() during render purely to decide
// whether to show an "Edit Post" button. verifyAuth() reads cookies(), which
// forces the whole route to render dynamically — every crawl became an
// uncached DB round trip. Moving the check here lets the page be prerendered
// and cached while the button still appears for signed-in admins.
export async function GET() {
  const user = await verifyAuth();
  return NextResponse.json(
    { isAdmin: !!user },
    // Per-user state: never store this in a shared cache.
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
