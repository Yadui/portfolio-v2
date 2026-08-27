import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { Button } from "@/components/ui/button";
import { verifyAuth } from "@/lib/auth";
import DeleteButton from "@/components/DeleteButton";
import LogoutButton from "@/components/LogoutButton";
import { mergeBlogPosts } from "@/data/blogPosts";
import { SITE_URL, SITE_URL as BASE_URL } from "@/lib/site";


export const metadata = {
  // "Blog" becomes the title suffix; root template makes it "Blog | Abhinav Yadav"
  // This page OWNS the blogging/writing cluster — no keyword overlap with homepage.
  title: "Blog",
  description: "Technical writing by Abhinav Yadav — deep-dives on Azure, AI pipelines, full-stack development, and cloud engineering from Gurugram, India.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    title: "Blog | Abhinav Yadav",
    description: "Technical writing by Abhinav Yadav — Azure, AI pipelines, full-stack development, and cloud engineering.",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Abhinav Yadav — Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Abhinav Yadav",
    description: "Technical writing by Abhinav Yadav — Azure, AI pipelines, full-stack development, and cloud engineering.",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export const dynamic = 'force-dynamic';

export default async function BlogList() {
  let storedPosts = [];
  try {
    storedPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }

  const allPosts = mergeBlogPosts(storedPosts);

  const user = await verifyAuth();
  const isAdmin = !!user;
  // Login button always visible — security is enforced by the login API itself
  const canShowLogin = !isAdmin;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${BASE_URL}/blog#blog`,
        url: `${BASE_URL}/blog`,
        name: "Abhinav Yadav — Blog",
        description:
          "Articles on full-stack development, AI, system design, and building software — by Abhinav Yadav.",
        inLanguage: "en-US",
        isPartOf: { "@id": `${BASE_URL}/#website` },
        author: { "@id": `${BASE_URL}/#person` },
        blogPost: allPosts.slice(0, 20).map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          url: `${BASE_URL}/blog/${post.slug}`,
          datePublished: new Date(post.createdAt).toISOString(),
          ...(post.excerpt ? { description: post.excerpt } : {}),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fffdf8] px-4 pt-32 text-[#101828] md:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <div className="container mx-auto">
        <PageIntro
          kicker="Writing"
          title="Blog"
          lede="Notes on cloud architecture, AI systems, and the details that only surface once something is running in production."
          actions={
            isAdmin ? (
              <div className="flex items-center gap-3">
                <Link href="/blog/create">
                  <Button className="bg-accent text-primary transition-all">Create Post</Button>
                </Link>
                <LogoutButton />
              </div>
            ) : canShowLogin ? (
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-[#101828]/20 text-[#101828] hover:bg-[#101828]/5 hover:text-[#101828]"
                >
                  Login
                </Button>
              </Link>
            ) : null
          }
        />

        {/* Editorial list rather than a three-up card grid: the posts differ in
            weight, and equal cards flattened that. Structural rules carry the
            grouping, so no elevation is needed. */}
        <div className="border-t border-[#101828]/10 pb-24">
          {allPosts.map((post, index) => (
            <article
              key={post.id}
              className="group relative border-b border-[#101828]/10"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="grid gap-3 py-8 md:grid-cols-12 md:items-baseline md:gap-8"
              >
                <span className="font-mono text-xs text-[#8892a4] md:col-span-1">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="md:col-span-7">
                  <h2 className="portfolio-title text-2xl transition-colors group-hover:text-[#00805b] md:text-3xl">
                    {post.title}
                  </h2>
                  {(post.excerpt || post.content) && (
                    <p className="portfolio-body mt-2 max-w-[62ch] line-clamp-2 text-sm">
                      {post.excerpt || `${post.content.substring(0, 150)}...`}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:col-span-3 md:justify-end">
                  {post.tags &&
                    post.tags
                      .split(",")
                      .slice(0, 2)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[#8892a4]"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                </div>

                <time
                  dateTime={new Date(post.createdAt).toISOString()}
                  className="font-mono text-xs text-[#8892a4] md:col-span-1 md:text-right"
                >
                  {new Date(post.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </Link>

              {isAdmin && post.sourceType === "database" && (
                <div className="absolute right-0 top-3 z-10 flex items-center gap-1.5">
                  <Link
                    href={`/blog/edit/${post.id}`}
                    className="flex h-8 items-center rounded-full border border-[#101828]/15 px-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-[#536074] transition-colors hover:border-[#101828]/40 hover:text-[#101828]"
                  >
                    Edit
                  </Link>
                  <DeleteButton id={post.id} />
                </div>
              )}
            </article>
          ))}

          {allPosts.length === 0 && (
            <p className="portfolio-body py-16 text-center">
              No posts published yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
