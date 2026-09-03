/**
 * Whether the admin surface exists in this environment.
 *
 * The blog is authored locally and writes to the shared Turso database, so
 * production never needs login, create, edit, delete or upload. Removing that
 * surface from production removes the entire authentication attack surface
 * with it: no session to forge, no credential to leak, no destructive endpoint
 * to reach.
 *
 * Default is off on every Vercel deployment, including previews. `VERCEL` is
 * set to "1" on all of them, so local `next dev` and a local production build
 * both keep the admin UI while nothing deployed does.
 *
 * ADMIN_ENABLED=true is an explicit escape hatch. It is deliberately not set
 * anywhere by default; turning it on in a deployed environment re-exposes the
 * auth surface and should be treated as a temporary action.
 */
export const ADMIN_ENABLED: boolean =
  process.env.ADMIN_ENABLED === "true" || process.env.VERCEL !== "1";

/**
 * Route prefixes that only make sense when the admin surface is enabled.
 * Kept here so the middleware and the pages cannot drift apart.
 */
export const ADMIN_PATHS: readonly string[] = [
  "/login",
  "/blog/create",
  "/blog/edit",
  "/api/auth",
  "/api/upload",
  "/api/blog/edit",
  "/api/blog/delete",
  "/api/blog/get",
];

/** True when the path belongs to the admin surface. */
export function isAdminPath(pathname: string): boolean {
  if (ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  // `/api/blog` itself is the create endpoint; only its write methods are
  // admin. The path is matched here and the method is checked by the caller.
  return pathname === "/api/blog";
}

/** Write methods on /api/blog. A GET there is not an admin action. */
export const ADMIN_WRITE_METHODS: readonly string[] = [
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
];
