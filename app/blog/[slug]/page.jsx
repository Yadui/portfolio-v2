import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import React from "react";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FiHeart, FiBookmark, FiShare2, FiGithub, FiTwitter, FiLinkedin, FiLink, FiInfo, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import Image from "next/image";
import { verifyAuth } from "@/lib/auth";
import { getSeededBlogPostBySlug, normalizeStoredPost } from "@/data/blogPosts";

const BASE_URL = "https://abhinav.maoverse.xyz";

async function getPost(slug) {
  let post = getSeededBlogPostBySlug(slug);
  try {
    const storedPost = await db.select().from(posts).where(eq(posts.slug, slug)).get();
    if (storedPost) post = normalizeStoredPost(storedPost);
  } catch {}
  return post;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return {};

  const title = post.title;
  const description = post.excerpt || post.content.replace(/[#*`>\[\]]/g, "").slice(0, 155).trim();
  const url = `${BASE_URL}/blog/${slug}`;
  const image = post.coverImage && !post.coverImage.startsWith("data:") ? post.coverImage : `${BASE_URL}/og-image.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime: new Date(post.createdAt).toISOString(),
      authors: ["Abhinav Yadav"],
      tags: post.tags ? post.tags.split(",").map((t) => t.trim()) : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// Helper to generate IDs for headings
function generateId(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

import { CodeBlock, CodeBlockCopyButton } from "@/components/ai-elements/code-block";

// Custom Markdown Components for Coloring and IDs
const MarkdownComponents = {
  h1: ({ children }) => <h1 id={generateId(children.toString())} className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
  h2: ({ children }) => <h2 id={generateId(children.toString())} className="text-2xl font-bold mt-8 mb-4 text-white border-l-4 border-accent pl-4">{children}</h2>,
  h3: ({ children }) => <h3 id={generateId(children.toString())} className="text-xl font-bold mt-6 mb-3 text-white/90">{children}</h3>,
  
  // Links with special styling for resources
  a: ({ href, children }) => {
    const isGithub = href.includes("github.com");
    const isTwitter = href.includes("twitter.com") || href.includes("x.com");
    const isLinkedin = href.includes("linkedin.com");
    
    const baseStyle = "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all no-underline mb-2 mr-2";

    if (isGithub) {
      return (
        <a href={href} className={`${baseStyle} bg-[#24292e] text-white hover:bg-[#2f363d] shadow-lg shadow-black/20 transform hover:-translate-y-0.5`} target="_blank" rel="noopener noreferrer">
          <FiGithub size={16} />
          {children}
        </a>
      );
    }
    if (isTwitter) {
        return (
          <a href={href} className={`${baseStyle} bg-[#1DA1F2] text-white hover:bg-[#1a91da] shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5`} target="_blank" rel="noopener noreferrer">
            <FiTwitter size={16} />
            {children}
          </a>
        );
      }
    if (isLinkedin) {
        return (
          <a href={href} className={`${baseStyle} bg-[#0077b5] text-white hover:bg-[#006399] shadow-lg shadow-blue-700/20 transform hover:-translate-y-0.5`} target="_blank" rel="noopener noreferrer">
            <FiLinkedin size={16} />
            {children}
          </a>
        );
      }

    return (
      <a href={href} className="text-accent font-medium hover:text-white transition-all underline decoration-accent/30 hover:decoration-accent underline-offset-4" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },

  // Images
  img: ({ src, alt }) => (
    <div className="relative w-full aspect-video my-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {alt && <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-xs text-center text-white/70">{alt}</div>}
    </div>
  ),

  // Custom Blockquote (Generic style for quotes)
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-white/20 pl-6 my-6 italic text-white/60">
      {children}
    </blockquote>
  ),

  // Custom Paragraphs (intercept for Callouts)
  p: ({ children }) => {
    // Check if the paragraph starts with a callout flag
    const contentArr = React.Children.toArray(children);
    const firstChild = contentArr[0];
    
    if (typeof firstChild === 'string') {
        const match = firstChild.match(/^\[!(NOTE|INFO|WARNING|DANGER|ERROR|SUCCESS|TIP)\]/i);
        if (match) {
            const typeKey = match[1].toUpperCase();
            let type = "default";
            if (typeKey === "WARNING") type = "warning";
            else if (typeKey === "DANGER" || typeKey === "ERROR") type = "danger";
            else if (typeKey === "SUCCESS" || typeKey === "TIP") type = "success";
            else if (typeKey === "NOTE" || typeKey === "INFO") type = "info";

            // Remove the flag from the text
            const cleanText = firstChild.replace(match[0], "").trim();
            const newChildren = [cleanText, ...contentArr.slice(1)];
            
            const styles = {
                default: "border-accent bg-zinc-900/50 text-white/80",
                info: "border-blue-500 bg-blue-500/10 text-blue-200",
                warning: "border-yellow-500 bg-yellow-500/10 text-yellow-200",
                danger: "border-red-500 bg-red-500/10 text-red-200",
                success: "border-green-500 bg-green-500/10 text-green-200",
            };

            const icons = {
                default: <FiInfo size={24} className="text-accent" />,
                info: <FiInfo size={24} className="text-blue-500" />,
                warning: <FiAlertCircle size={24} className="text-yellow-500" />,
                danger: <FiAlertCircle size={24} className="text-red-500" />,
                success: <FiCheckCircle size={24} className="text-green-500" />,
            };

            return (
                <div className={`border-l-4 p-6 my-6 rounded-r-lg relative overflow-hidden flex gap-4 items-start shadow-md ${styles[type]}`}>
                     <div className="shrink-0 mt-1 opacity-90">{icons[type]}</div>
                     <div className="w-full">{newChildren}</div>
                </div>
            );
        }
    }
    
    // Normal paragraph (using div to avoid hydration errors with nested divs like images/code)
    return <div className="mb-6 leading-relaxed text-white/80">{children}</div>;
  },

  // Unwrap pre to avoid hydration mismatches with div-in-pre
  pre: ({ children }) => <>{children}</>,

  // Code Blocks
  code: ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    const lang = match ? match[1] : "";
    const isMultiLine = !inline;
    const content = String(children).replace(/\n$/, "");

    if (isMultiLine) {
       return (
         <CodeBlock code={content} language={lang || "plaintext"} className="my-6 border-white/10 shadow-2xl">
            <CodeBlockCopyButton />
         </CodeBlock>
       );
    } 

    return (
      <code className="px-1.5 py-0.5 rounded bg-white/10 text-accent font-mono text-sm border border-white/5" {...props}>
        {children}
      </code>
    );
  },
};

export const dynamic = 'force-dynamic';

export default async function BlogPost({ params }) {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const postUrl = `${BASE_URL}/blog/${slug}`;
  const postImage = post.coverImage && !post.coverImage.startsWith("data:") ? post.coverImage : `${BASE_URL}/og-image.png`;
  const description = post.excerpt || post.content.replace(/[#*`>\[\]]/g, "").slice(0, 155).trim();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    url: postUrl,
    datePublished: new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.createdAt).toISOString(),
    image: postImage,
    author: {
      "@type": "Person",
      name: "Abhinav Yadav",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Abhinav Yadav",
      url: BASE_URL,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    keywords: post.tags ? post.tags.split(",").map((t) => t.trim()).join(", ") : "",
  };

  const user = await verifyAuth();
  const isAdmin = !!user;

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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div className="min-h-screen bg-primary pt-32 px-4 md:px-8 pb-20">
      <div className="container mx-auto max-w-[1400px]">
        
        {/* TOP HEADER: Title + Date */}
        <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="mb-6">
                <Link href="/blog">
                    <Button variant="ghost" className="text-white/40 hover:text-white hover:bg-white/10">
                        ← Back to Blog
                    </Button>
                </Link>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                {post.title}
            </h1>
            <div className="text-white/40 font-mono">
                {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT SIDEBAR: Actions (Sticky) */}
            <aside className="hidden lg:flex flex-col gap-6 col-span-1 sticky top-32 h-fit items-center">
                <div className="flex flex-col gap-4 bg-zinc-900/50 p-3 rounded-full border border-white/5 backdrop-blur-sm">
                    <button className="p-3 text-white/40 hover:text-red-500 hover:bg-white/5 rounded-full transition-all group relative">
                        <FiHeart size={22} className="group-hover:fill-current" />
                        <span className="absolute left-10 md:left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white text-black text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity">Like</span>
                    </button>
                    <button className="p-3 text-white/40 hover:text-accent hover:bg-white/5 rounded-full transition-all group relative">
                        <FiBookmark size={22} className="group-hover:fill-current" />
                        <span className="absolute left-10 md:left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white text-black text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity">Bookmark</span>
                    </button>
                    <div className="h-px w-6 bg-white/10 mx-auto my-1"></div>
                    <button className="p-3 text-white/40 hover:text-blue-400 hover:bg-white/5 rounded-full transition-all">
                        <FiTwitter size={20} />
                    </button>
                     <button className="p-3 text-white/40 hover:text-blue-600 hover:bg-white/5 rounded-full transition-all">
                        <FiLinkedin size={20} />
                    </button>
                    <button className="p-3 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all">
                        <FiLink size={20} />
                    </button>
                </div>
            </aside>

            {/* MIDDLE: Main Content */}
            <main className="col-span-1 lg:col-span-8 flex flex-col gap-8">
                {/* Image & Tags */}
                <div className="space-y-6">
                    {post.tags && (
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                             {post.tags.split(',').map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
                                  {tag.trim()}
                                </span>
                              ))}
                        </div>
                    )}
                    
                    {post.coverImage && (
                      <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        <img 
                          src={post.coverImage} 
                          alt={post.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                </div>

                {/* Content */}
                <article className="prose prose-invert prose-lg max-w-none prose-headings:scroll-mt-24 prose-a:text-accent hover:prose-a:text-accent/80 prose-strong:text-white prose-code:text-accent prose-code:bg-white/5 prose-code:px-1 prose-code:rounded prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-white/10 prose-img:rounded-2xl">
                    <ReactMarkdown components={MarkdownComponents}>
                        {post.content}
                    </ReactMarkdown>
                </article>
                
                {isAdmin && post.sourceType === "database" && (
                  <div className="flex justify-end pt-10 border-t border-white/10">
                    <Link href={`/blog/edit/${post.id}`}>
                      <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                        Edit Post
                      </Button>
                    </Link>
                  </div>
                )}
            </main>

            {/* RIGHT SIDEBAR: Author & TOC (Sticky) */}
            <aside className="flex flex-col gap-8 col-span-1 lg:col-span-3 h-full order-last lg:order-none">
                <div className="sticky top-32 flex flex-col gap-8">
                    
                    {/* Author Profile */}
                    <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-accent">
                                <Image src="/assets/photo.png" alt="Abhinav" fill className="object-cover" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Abhinav</h4>
                                <div className="flex gap-2 text-white/40 mt-1">
                                    <a href="#" className="hover:text-white transition-colors"><FiGithub /></a>
                                    <a href="#" className="hover:text-blue-400 transition-colors"><FiTwitter /></a>
                                    <a href="#" className="hover:text-blue-600 transition-colors"><FiLinkedin /></a>
                                </div>
                            </div>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed mb-4">
                            Full Stack Engineer passionate about building scalable web apps and AI solutions.
                        </p>
                        <Button className="w-full bg-white text-black hover:bg-gray-200 font-bold rounded-lg h-9">
                            Follow
                        </Button>
                    </div>

                    {/* Table of Contents */}
                    {headings.length > 0 && (
                        <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
                                Table of Contents
                            </h4>
                            <nav className="flex flex-col gap-2">
                                {headings.map((heading, i) => (
                                    <a 
                                        key={i} 
                                        href={`#${heading.id}`}
                                        className={`text-sm transition-colors hover:text-accent line-clamp-1 block
                                            ${heading.level === 1 ? 'text-white/90 font-medium' : 'text-white/60 pl-4'}
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
