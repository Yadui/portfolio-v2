import Link from "next/link";
import HomeClient from "@/components/HomeClient";
import Projects from "@/components/Projects";
import WorkStage from "@/components/work/WorkStage";
import Intro from "@/components/Intro";
import Achievements from "@/components/Achievements";
import Contact from "@/components/Contact";
import Timeline from "@/components/Timeline";
import Skills from "@/components/Skills";

const SITE_URL = "https://abhinav.maoverse.xyz";

// ProfilePage structured data for the homepage. Ties back to the Person
// entity declared site-wide in the root layout (#person).
const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profilepage`,
  url: SITE_URL,
  name: "Abhinav Yadav — Software Engineer & Creative Developer",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#person` },
  mainEntity: { "@id": `${SITE_URL}/#person` },
  inLanguage: "en-US",
};

export default function Home() {
  return (
    <div className="relative isolate bg-black">
      {/* ── Crawlable, screen-reader-accessible intro ──────────────────────
          This markup is in the Server Component so it is present in the
          initial HTML response — Googlebot reads it before any JS runs.
      ──────────────────────────────────────────────────────────────────── */}
      <header className="sr-only">
        <h1>Abhinav Yadav — Software Engineer &amp; Creative Developer</h1>
        <p>
          Portfolio of Abhinav Yadav, a software engineer and creative developer
          building cloud, AI, and full-stack web applications with React,
          Next.js, and Azure. Explore featured projects, achievements, skills,
          and writing.
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
          </ul>
          <p>Work experience case studies:</p>
          <ul>
            <li><Link href="/work/foetron">Foetron — Cloud and AI Engineer</Link></li>
            <li><Link href="/work/outlier">Outlier — Prompt Engineer</Link></li>
            <li><Link href="/work/vmcoders">Vm Coders — Frontend Developer</Link></li>
          </ul>
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
