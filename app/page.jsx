import Link from "next/link";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { desc } from "drizzle-orm";
import HomeClient from "@/components/HomeClient";
import Projects from "@/components/Projects";
import WorkStage from "@/components/work/WorkStage";
import Intro from "@/components/Intro";
import Achievements from "@/components/Achievements";
import Contact from "@/components/Contact";
import Timeline from "@/components/Timeline";
import Skills from "@/components/Skills";

const SITE_URL = "https://abhinav.maoverse.xyz";

// The homepage is the only URL Google currently crawls, so every indexable
// page must be reachable from it in one hop. Search Console reported 23 of 27
// URLs as "URL is unknown to Google" — they were only ever advertised in the
// sitemap, and /blog (which links to every post) had itself never been
// crawled, so no post was discoverable by following links.
//
// ISR rather than a static page: the post list comes from the DB, and an
// hourly rebuild keeps new posts linked without making the page dynamic.
export const revalidate = 3600;

async function getPostLinks() {
  // A DB outage must not take the homepage down; an empty list simply means
  // the sitemap remains the only discovery path, which is today's behaviour.
  try {
    const rows = await db
      .select({ slug: posts.slug, title: posts.title })
      .from(posts)
      .orderBy(desc(posts.createdAt));
    return rows.filter((r) => r?.slug);
  } catch {
    return [];
  }
}

// ProfilePage structured data for the homepage. Ties back to the Person
// entity declared site-wide in the root layout (#person).
const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profilepage`,
  url: SITE_URL,
  name: "Abhinav Yadav — Cloud & AI Engineer",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#person` },
  mainEntity: { "@id": `${SITE_URL}/#person` },
  inLanguage: "en-US",
};

export default async function Home() {
  const postLinks = await getPostLinks();

  return (
    <div className="relative isolate bg-black">
      {/* ── Crawlable, screen-reader-accessible intro ──────────────────────
          This markup is in the Server Component so it is present in the
          initial HTML response — Googlebot reads it before any JS runs.
      ──────────────────────────────────────────────────────────────────── */}
      <header className="sr-only">
        {/* Title, description and this H1 must describe the same thing;
            they previously disagreed ("Software Engineer & Creative
            Developer" vs "Cloud & AI Engineer"), which blurs the page topic. */}
        <h1>Abhinav Yadav — Cloud &amp; AI Engineer</h1>
        <p>
          Portfolio of Abhinav Yadav, a Cloud &amp; AI Engineer in Gurugram,
          India, building Azure infrastructure, AI agents, and full-stack web
          applications with React, Next.js, and Python. Explore featured
          projects, achievements, skills, and writing.
        </p>
        <nav aria-label="Primary">
          <ul>
            <li>
              <a
                href="https://drive.google.com/uc?export=download&id=14e4ZxTUuAw0Xs6lieYDKiNrKS_zhpJ-i"
                download
              >
                Résumé
              </a>
            </li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/work">Projects</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <p>Work experience case studies:</p>
          <ul>
            <li><Link href="/work/foetron">Foetron — Cloud and AI Engineer</Link></li>
            <li><Link href="/work/outlier">Outlier — Prompt Engineer</Link></li>
            <li><Link href="/work/vmcoders">Vm Coders — Frontend Developer</Link></li>
          </ul>
          {postLinks.length > 0 && (
            <>
              <p>Writing:</p>
              <ul>
                {postLinks.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`}>{post.title || post.slug}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>
      </header>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageJsonLd) }}
      />

      {/* ── HomeClient wraps ALL interactive sections ───────────────────────
          It owns the Preloader lifecycle and provides IntroContext to
          children (e.g. Projects gates its entrance animation on it).
          The sections themselves are Server-side — HomeClient only adds
          the client-side preloader shell around them.
      ──────────────────────────────────────────────────────────────────── */}
      <HomeClient>
        <Intro />
        {/* The work section pins on exit: the projects are stripped away
            one at a time, then Achievements wipes down over the top of it.
            See components/work/WorkStage.jsx. */}
        <WorkStage next={<Achievements />}>
          <Projects />
        </WorkStage>
        <Timeline />
        <Skills />
        <Contact />
      </HomeClient>
    </div>
  );
}
