/**
 * Canonical site origin — the single source of truth.
 *
 * Every absolute URL the site emits (canonicals, Open Graph, JSON-LD,
 * sitemap, RSS, robots, llms.txt) derives from this. It was previously
 * duplicated as ten separate constants across fifteen files, which made
 * changing domains a find-and-replace with no way to verify completeness.
 *
 * Override per environment with NEXT_PUBLIC_SITE_URL, e.g.
 *   NEXT_PUBLIC_SITE_URL=https://abhinavyadav.com
 * so a domain migration is a single env change plus a redirect.
 */
const FALLBACK_ORIGIN = "https://abhinav.maoverse.xyz";

function normalise(value: string): string {
  // Trailing slashes would double up in `${SITE_URL}/blog`.
  return value.trim().replace(/\/+$/, "");
}

export const SITE_URL: string = normalise(
  process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_ORIGIN
);

/** Bare hostname, used by the canonical-host redirect in middleware. */
export const SITE_HOST: string = new URL(SITE_URL).host;

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
