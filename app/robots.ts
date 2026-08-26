import { MetadataRoute } from "next";
import { SITE_URL as BASE_URL } from "@/lib/site";


export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Only block non-content routes. Do NOT block /_next/ — Googlebot
        // needs the JS/CSS there to render this client-side app. Admin/utility
        // pages remain reachable so their noindex metadata can be observed.
        disallow: ["/api/"],
      },
      // Explicitly allow search/citation crawlers. No AI training-only crawler
      // is blocked; the public blog is intended to be discoverable and cited.
      ...["Googlebot", "Bingbot", "GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended"].map(
        (userAgent) => ({ userAgent, allow: "/", disallow: ["/api/"] })
      ),
    ],
    sitemap: [`${BASE_URL}/sitemap.xml`, `${BASE_URL}/sitemap.txt`],
    host: BASE_URL,
  };
}
