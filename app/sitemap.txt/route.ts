import sitemap from "@/app/sitemap";

export const revalidate = 3600;

/**
 * Plain-text sitemap fallback. Google supports one absolute URL per line;
 * this intentionally reuses the XML sitemap's source so the two cannot drift.
 */
export async function GET() {
  const entries = await sitemap();
  const body = entries.map(({ url }) => url).join("\n") + "\n";

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
