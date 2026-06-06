import { MetadataRoute } from "next";

const BASE_URL = "https://abhinav.maoverse.xyz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Only block non-content routes. Do NOT block /_next/ — Googlebot
        // needs the JS/CSS there to render this client-side app. Admin/utility
        // pages (blog/create, blog/edit) are kept crawlable so Google can read
        // their `noindex` meta tag and drop them; /login already returns 404
        // for non-admin requests, so it never gets indexed.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
