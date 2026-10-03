import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FiGithub, FiTwitter, FiLinkedin } from "react-icons/fi";
import Image from "next/image";
import AdminEditButton from "@/components/blog/AdminEditButton";
import { ADMIN_ENABLED } from "@/lib/adminEnabled";
import ArticleActions from "@/components/blog/ArticleActions";
import { getSeededBlogPostBySlug, mergeBlogPosts, normalizeStoredPost } from "@/data/blogPosts";
import { getArticleSeoTitle, serializeJsonLd } from "@/lib/seo";
import { generateId, MarkdownComponents } from "@/components/blog/MarkdownComponents";
import { SITE_URL as BASE_URL } from "@/lib/site";


async function getPost(slug) {
  let post = getSeededBlogPostBySlug(slug);
  try {
    const storedPost = await db.select().from(posts).where(eq(posts.slug, slug)).get();
    if (storedPost) post = normalizeStoredPost(storedPost);
  } catch {}
  return post;
}

async function getRelatedPosts(currentPost) {
  let storedPosts = [];
  try {
    storedPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
  } catch {}

  const currentTags = new Set(
    (currentPost.tags ?? "")
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
  );

  return mergeBlogPosts(storedPosts)
    .filter((post) => post.slug !== currentPost.slug)
    .map((post) => ({
      post,
      score: (post.tags ?? "")
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => currentTags.has(tag)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ post }) => post);
}


// Keep descriptions concise as an editorial choice. Google may truncate or
// rewrite snippets; this character limit does not guarantee their display.
const SERP_DESC_MAX = 155;

const clampAtWord = (value, max) => {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return (space > max * 0.5 ? cut.slice(0, space) : cut).replace(/[\s\u2014\u2013,;:.-]+$/, "");
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return {};

  const title = getArticleSeoTitle(post.title, slug);
  const description = clampAtWord(
    post.excerpt || post.content.replace(/[#*`>\[\]]/g, " "),
    SERP_DESC_MAX
  );
  const url = `${BASE_URL}/blog/${slug}`;
  const image = post.coverImage && !post.coverImage.startsWith("data:") ? post.coverImage : `${BASE_URL}/opengraph-image`;
  const tags = post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return {
    // Keep the article title independent of the site's brand suffix template.
    title: { absolute: title },
    description,
    keywords: tags,
    authors: [{ name: "Abhinav Yadav", url: BASE_URL }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime: new Date(post.createdAt).toISOString(),
      authors: ["Abhinav Yadav"],
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// Published posts change rarely, but force-dynamic meant every crawl was an
// uncached DB round trip (~1.6s TTFB, x-vercel-cache: MISS on every request)
// while static pages answered in ~0.13s from cache. For a site Google is
// barely crawling, that cost is paid on every URL. ISR serves them from cache
// and still picks up edits within the window.
export const revalidate = 600;

// Without this the dynamic segment has no known slugs at build time, so Next
// renders it on demand (marked "ƒ") and `revalidate` never takes effect —
// Vercel reported x-vercel-cache: MISS on every request. Prerendering the
// known posts makes them cacheable; posts added later are still rendered on
// demand and then cached, because dynamicParams defaults to true.
export async function generateStaticParams() {
  try {
    const rows = await db.select({ slug: posts.slug }).from(posts);
    return rows.filter((r) => r?.slug).map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

export default async function BlogPost({ params }) {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post);

  const postUrl = `${BASE_URL}/blog/${slug}`;
  const postImage = post.coverImage && !post.coverImage.startsWith("data:") ? post.coverImage : `${BASE_URL}/opengraph-image`;
  const description = post.excerpt || post.content.replace(/[#*`>\[\]]/g, "").slice(0, 155).trim();
  const tagList = post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const wordCount = post.content ? post.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const publishedIso = new Date(post.createdAt).toISOString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${postUrl}#article`,
        headline: post.title,
        name: post.title,
        description,
        url: postUrl,
        datePublished: publishedIso,
        dateModified: publishedIso,
        image: [postImage],
        inLanguage: "en-US",
        wordCount,
        ...(tagList.length > 0
          ? { keywords: tagList.join(", "), articleSection: tagList[0] }
          : {}),
        author: {
          "@type": "Person",
          "@id": `${BASE_URL}/#person`,
          name: "Abhinav Yadav",
          url: BASE_URL,
          sameAs: [
            "https://github.com/Yadui",
            "https://www.linkedin.com/in/abhinavyadav88",
            "https://x.com/abhinav2302055",
          ],
        },
        publisher: {
          "@type": "Person",
          "@id": `${BASE_URL}/#person`,
          name: "Abhinav Yadav",
          url: BASE_URL,
        },
        isPartOf: { "@id": `${BASE_URL}/#website` },
        mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
        ],
      },
    ],
  };

  // Extract headings for TOC
  const headings = [];
  const contentLines = post.content.split("\n");
  contentLines.forEach(line => {
    const match = line.match(/^(#{1,3})\s+(.*)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2],
        id: generateId(match[2])
      });
    }
  });

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
    <div className="min-h-screen bg-[#fffdf8] px-4 pb-20 pt-32 text-[#101828] md:px-8">
      <div className="container mx-auto max-w-[1400px]">
        
        {/* TOP HEADER: Title + Date */}
        <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="mb-6">
                <Link href="/blog">
                    <Button variant="ghost" className="text-[#536074] hover:bg-[#101828]/5 hover:text-[#101828]">
                        ← Back to Blog
                    </Button>
                </Link>
            </div>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-[#101828] md:text-6xl">
                {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-sm text-[#8892a4]">
                <span>
                  By <Link href="/" className="text-[#00805b] hover:underline">Abhinav Yadav</Link>
                </span>
                <span aria-hidden="true">·</span>
                {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>

         <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
             {/* A single client leaf owns the reader actions. There are no
                 fake public counters: this page has no engagement backend. */}
             <aside className="hidden lg:col-span-1 lg:flex lg:items-start lg:justify-center">
               <div className="sticky top-32">
                 <ArticleActions slug={slug} title={post.title} url={postUrl} />
               </div>
             </aside>

            {/* MIDDLE: Main Content */}
             <main className="col-span-1 flex flex-col gap-8 lg:col-span-8">
                 <div className="lg:hidden">
                   <ArticleActions slug={slug} title={post.title} url={postUrl} />
                 </div>
                {/* Image & Tags */}
                <div className="space-y-6">
                    {post.tags && (
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                             {post.tags.split(',').map((tag, i) => (
                                <span key={i} className="rounded-full border border-[#00b86b]/30 bg-[#00ff99]/12 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#00734a]">
                                  {tag.trim()}
                                </span>
                              ))}
                        </div>
                    )}
                    
                    {post.coverImage && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-[#101828]/10 shadow-xl">
                        <img 
                          src={post.coverImage} 
                          alt={post.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                </div>

                {/* Content */}
                <article className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-headings:text-[#101828] prose-p:text-[#2a3648] prose-a:text-[#00805b] hover:prose-a:text-[#101828] prose-strong:text-[#101828] prose-li:text-[#2a3648] prose-code:rounded prose-code:bg-[#101828]/5 prose-code:px-1 prose-code:text-[#00734a] prose-pre:border prose-pre:border-[#101828]/10 prose-img:rounded-2xl">
                    <ReactMarkdown components={MarkdownComponents}>
                        {post.content}
                    </ReactMarkdown>
                </article>

                {relatedPosts.length > 0 && (
                  <aside aria-labelledby="related-posts" className="border-t border-[#101828]/10 pt-8">
                    <h2 id="related-posts" className="mb-4 text-2xl font-light text-[#101828]">Related writing</h2>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/blog/${related.slug}`}
                          className="rounded-xl border border-[#101828]/10 bg-white/70 p-4 transition-colors hover:border-[#00b86b]/50"
                        >
                          <h3 className="text-sm font-medium leading-snug text-[#101828]">{related.title}</h3>
                          <span className="mt-3 block text-xs font-semibold uppercase tracking-wider text-[#00805b]">Read article →</span>
                        </Link>
                      ))}
                    </div>
                  </aside>
                )}
                
                {ADMIN_ENABLED && post.sourceType === "database" && (
                  <AdminEditButton postId={post.id} />
                )}
            </main>

            {/* RIGHT SIDEBAR: Author & TOC (Sticky) */}
             <aside className="order-last col-span-1 flex h-full flex-col gap-8 lg:order-none lg:col-span-3">
                <div className="sticky top-32 flex flex-col gap-8">
                    
                    {/* Author Profile */}
                    <div className="rounded-2xl border border-[#101828]/10 bg-white/80 p-6 shadow-[0_14px_50px_rgba(16,24,40,0.08)] backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#00b86b]">
                                 <Image src="/assets/blog-dp.jpeg" alt="Abhinav" fill sizes="64px" className="object-cover" />
                            </div>
                            <div>
                                <h4 className="text-lg font-light text-[#101828]">Abhinav</h4>
                                <div className="mt-1 flex gap-2 text-[#8892a4]">
                                     <a href="https://github.com/Yadui" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="profile-social-link transition-colors hover:text-[#101828]"><FiGithub /></a>
                                     <a href="https://x.com/abhinav2302055" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="profile-social-link transition-colors hover:text-[#101828]"><FiTwitter /></a>
                                     <a href="https://www.linkedin.com/in/abhinavyadav88" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="profile-social-link transition-colors hover:text-[#101828]"><FiLinkedin /></a>
                                </div>
                            </div>
                        </div>
                        <p className="mb-4 text-sm leading-relaxed text-[#536074]">
                             Cloud and AI engineer writing about systems, interfaces, and the details that make software reliable.
                        </p>
                        <Link href="/" className="block">
                          <Button className="h-9 w-full rounded-lg bg-[#101828] font-bold text-white hover:bg-[#1d2839]">
                              More about me
                          </Button>
                        </Link>
                    </div>

                    {/* Table of Contents */}
                    {headings.length > 0 && (
                        <div className="rounded-2xl border border-[#101828]/10 bg-white/80 p-6 shadow-[0_14px_50px_rgba(16,24,40,0.08)] backdrop-blur-sm">
                            <h4 className="mb-4 border-b border-[#101828]/10 pb-2 text-sm font-light uppercase tracking-wider text-[#101828]">
                                Table of Contents
                            </h4>
                            <nav className="flex flex-col gap-2">
                                {headings.map((heading, i) => (
                                    <a 
                                        key={i} 
                                        href={`#${heading.id}`}
                                        className={`block text-sm transition-colors line-clamp-1 hover:text-[#00805b]
                                            ${heading.level === 1 ? 'font-medium text-[#1d2839]' : 'pl-4 text-[#536074]'}
                                            ${heading.level === 3 ? 'pl-8' : ''}
                                        `}
                                    >
                                        {heading.text}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </aside>

        </div>
      </div>
    </div>
    </>
  );
}
