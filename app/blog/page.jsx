import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { verifyAuth } from "@/lib/auth";
import { isCurrentRequestFromAllowedAdminIp } from "@/lib/adminAccess";
import DeleteButton from "@/components/DeleteButton";
import LogoutButton from "@/components/LogoutButton";
import { mergeBlogPosts } from "@/data/blogPosts";

const BASE_URL = "https://abhinav.maoverse.xyz";

export const metadata = {
  title: "Blog",
  description: "Articles on full-stack development, AI, system design, and building software — by Abhinav Yadav.",
  alternates: { canonical: "https://abhinav.maoverse.xyz/blog" },
  openGraph: {
    type: "website",
    url: "https://abhinav.maoverse.xyz/blog",
    title: "Blog | Abhinav Yadav",
    description: "Articles on full-stack development, AI, system design, and building software — by Abhinav Yadav.",
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
  const canShowLogin = !isAdmin && await isCurrentRequestFromAllowedAdminIp();

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
    <div className="min-h-screen px-4 pt-32 md:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-12">
          {/* ... Home Link and Title */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                className="gap-2 border-[#101828]/20 text-[#101828] hover:bg-[#101828]/5 hover:text-[#101828]"
              >
                ← Home
              </Button>
            </Link>
            <h1 className="text-4xl font-light text-[#101828]">Blog</h1>
          </div>

          <div className="flex gap-4 items-center">
            {isAdmin ? (
              <>
                <Link href="/blog/create">
                  <Button className="bg-accent text-primary transition-all">Create Post</Button>
                </Link>
                <LogoutButton />
              </>
            ) : canShowLogin ? (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-[#101828]/20 text-[#101828] hover:bg-[#101828]/5 hover:text-[#101828]"
                  >
                    Login
                  </Button>
                </Link>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {allPosts.map((post) => (
            <div key={post.id} className="group relative h-full">
              <Link href={`/blog/${post.slug}`} className="block h-full">
                <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#101828]/10 bg-white/80 shadow-[0_14px_50px_rgba(16,24,40,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00b86b]/50 hover:shadow-[0_24px_80px_rgba(16,24,40,0.12)]">
                  {post.coverImage && (
                    <div className="relative w-full h-48 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="mb-3 text-2xl font-light text-[#101828] transition-colors group-hover:text-[#00805b]">{post.title}</h2>

                    {post.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.split(',').map((tag, i) => (
                          <span key={i} className="rounded-full bg-[#101828]/5 px-2 py-1 text-xs text-[#536074]">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mb-4 flex-grow text-[#536074] line-clamp-3">{post.excerpt || post.content.substring(0, 150)}...</p>
                    <div className="mt-auto border-t border-[#101828]/5 pt-4 text-sm text-[#8892a4]">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>

              {isAdmin && post.sourceType === "database" && (
                <DeleteButton id={post.id} />
              )}
            </div>
          ))}
          {allPosts.length === 0 && (
            <p className="col-span-full text-center text-[#536074]">No posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
