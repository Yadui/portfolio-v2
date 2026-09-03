import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { desc } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import CoverPeek from "@/components/blog/CoverPeek";
import { Button } from "@/components/ui/button";
import { verifyAuth } from "@/lib/auth";
import { ADMIN_ENABLED } from "@/lib/adminEnabled";
import DeleteButton from "@/components/DeleteButton";
import LogoutButton from "@/components/LogoutButton";
import { mergeBlogPosts } from "@/data/blogPosts";
import { SITE_URL, SITE_URL as BASE_URL } from "@/lib/site";


export const metadata = {
  // "Blog" becomes the title suffix; root template makes it "Blog | Abhinav Yadav"
  // This page OWNS the blogging/writing cluster — no keyword overlap with homepage.
  // "Blog" rendered as a 20-character SERP title, well under the useful
  // length. This states the subject the page actually ranks for.
  title: "Cloud & AI Engineering Notes",
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

// force-dynamic meant every crawl and every visitor paid an uncached DB round
// trip: the live index measured 3838ms TTFB, by far the slowest page on the
// site. ISR serves it from cache; the write paths call revalidatePath("/blog")
// so an admin create, edit or delete still shows up immediately.
export const revalidate = 600;

/** Day-month-year, the format already used across the site. */
const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/** First tag only. Rows carry one topic; the full set lives on the post. */
const primaryTag = (tags) =>
  String(tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)[0] || null;

/**
 * Roughly half the posts carry a generated `data:` SVG rather than real cover
 * art. Leading the page with those would be dressing the index in placeholder
 * assets, so only a genuine file path counts as a usable image.
 */
const realCover = (post) =>
  typeof post.coverImage === "string" && post.coverImage.startsWith("/")
    ? post.coverImage
    : null;

export default async function BlogList() {
  let storedPosts = [];
  try {
    storedPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }

  const allPosts = mergeBlogPosts(storedPosts);

  // Only read the session where an admin surface actually exists. This is not
  // just belt and braces: `verifyAuth` calls `cookies()`, and reading cookies
  // opts the route out of static rendering entirely, which is why `revalidate`
  // had no effect and the index kept serving at ~0.8s with x-vercel-cache MISS.
  // With the admin surface gone from production, this page is static there.
  const user = ADMIN_ENABLED ? await verifyAuth() : null;
  const isAdmin = !!user;
  const canShowLogin = ADMIN_ENABLED && !isAdmin;

  // The newest post leads; everything behind it is the archive, grouped by
  // year. `allPosts` is already sorted newest-first, so a single pass groups
  // it without sorting again.
  const [lead, ...archive] = allPosts;
  const leadCover = lead ? realCover(lead) : null;
  const groups = [];
  for (const post of archive) {
    const year = new Date(post.createdAt).getFullYear();
    const current = groups[groups.length - 1];
    if (current && current.year === year) current.posts.push(post);
    else groups.push({ year, posts: [post] });
  }

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

  /** Admin controls, rendered as a sibling of the row link rather than inside
   *  it: nesting a control in an anchor is invalid and steals the row click. */
  const adminControls = (post) =>
    isAdmin && post.sourceType === "database" ? (
      <div className="absolute right-0 top-3 z-10 flex items-center gap-1.5">
        <Link
          href={`/blog/edit/${post.id}`}
          className="flex h-8 items-center rounded-full border border-[#101828]/15 px-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-[#536074] transition-colors hover:border-[#101828]/40 hover:text-[#101828]"
        >
          Edit
        </Link>
        <DeleteButton id={post.id} />
      </div>
    ) : null;

  return (
    <div className="blog-index min-h-screen bg-[#fffdf8] px-4 pt-32 text-[#101828] md:px-12">
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
            ) : null
          }
        />

        {/* Lead post. The newest piece carries the weight the old list gave to
            nothing: larger type, its standfirst, and its cover when a real one
            exists. Everything else is archive. */}
        {lead && (
          <article className="group relative border-t border-[#101828]/10">
            <Link
              href={`/blog/${lead.slug}`}
              className="grid gap-6 py-10 md:grid-cols-12 md:gap-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#101828]"
            >
              <div className={leadCover ? "md:col-span-7" : "md:col-span-9"}>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#8892a4]">
                  <span className="text-[#00805b]">Latest</span>
                  <time dateTime={new Date(lead.createdAt).toISOString()}>
                    {formatDate(lead.createdAt)}
                  </time>
                  {primaryTag(lead.tags) && <span>{primaryTag(lead.tags)}</span>}
                </p>

                <h2 className="portfolio-title mt-4 text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.1] transition-colors group-hover:text-[#00805b]">
                  {lead.title}
                </h2>

                {(lead.excerpt || lead.content) && (
                  <p className="portfolio-body mt-4 max-w-[62ch] text-[0.95rem] leading-relaxed">
                    {lead.excerpt || `${lead.content.substring(0, 190)}...`}
                  </p>
                )}

                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#101828]">
                  Read
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </span>
              </div>

              {leadCover && (
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#101828]/10 md:col-span-5">
                  <Image
                    src={leadCover}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    priority
                  />
                </div>
              )}
            </Link>
            {adminControls(lead)}
          </article>
        )}

        {/* Archive, grouped by year. The year rail replaces the old running
            01..20 counter, which numbered the list without telling the reader
            anything; the group heading sticks so the year stays legible while
            its posts scroll past. */}
        <div id="blog-archive" className="relative pb-24">
          {groups.map((group) => (
            <section
              key={group.year}
              className="border-t border-[#101828]/10 md:grid md:grid-cols-12 md:gap-10"
            >
              <h2 className="pt-8 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#8892a4] md:col-span-2 md:sticky md:top-28 md:self-start">
                {group.year}
              </h2>

              <div className="md:col-span-10">
                {group.posts.map((post) => (
                  <article
                    key={post.id}
                    className="group relative border-b border-[#101828]/10 last:border-b-0"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      data-cover={realCover(post) || undefined}
                      className="flex flex-col gap-1.5 py-6 md:flex-row md:items-baseline md:gap-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#101828]"
                    >
                      {/* Fixed date column plus a truncating tag. Letting the
                          pair wrap made every row with a long tag two lines
                          tall and broke the baseline the list reads along. */}
                      <p className="order-2 flex shrink-0 items-baseline gap-x-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#8892a4] md:order-none md:w-[16rem] md:flex-nowrap">
                        <time
                          dateTime={new Date(post.createdAt).toISOString()}
                          className="shrink-0 tabular-nums"
                        >
                          {formatDate(post.createdAt)}
                        </time>
                        {primaryTag(post.tags) && (
                          <span className="truncate">{primaryTag(post.tags)}</span>
                        )}
                      </p>

                      <h3 className="portfolio-title order-1 text-lg leading-snug transition-colors group-hover:text-[#00805b] md:order-none md:text-xl">
                        {post.title}
                      </h3>
                    </Link>
                    {adminControls(post)}
                  </article>
                ))}
              </div>
            </section>
          ))}

          {allPosts.length === 0 && (
            <div className="border-t border-[#101828]/10 py-20 text-center">
              <p className="portfolio-title text-xl">Nothing published yet.</p>
              <p className="portfolio-body mx-auto mt-3 max-w-[42ch] text-sm">
                Writing on cloud architecture and AI systems will appear here.
                In the meantime, the work is on the{" "}
                <Link href="/work" className="underline underline-offset-4">
                  projects page
                </Link>
                .
              </p>
            </div>
          )}
        </div>

        <CoverPeek />

        {/* Admin entry point. Kept quiet: it is a maintenance door, not a call
            to action, so it no longer competes with the writing for weight.
            Padded to clear the 24px minimum target: at this type size the text
            box alone was only 12px tall. */}
        {canShowLogin && (
          <div className="border-t border-[#101828]/10 py-5">
            <Link
              href="/login"
              className="-mx-2 inline-flex min-h-[2.75rem] items-center px-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#8892a4] underline-offset-4 transition-colors hover:text-[#101828] hover:underline"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
