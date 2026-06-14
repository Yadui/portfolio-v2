"use client";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";

import Preloader from "@/components/Preloader";
import Projects from "@/components/Projects";
import Intro from "@/components/Intro";
import Achievements from "@/components/Achievements";
import Contact from "@/components/Contact";
import Timeline from "@/components/Timeline";
import Skills from "@/components/Skills";
import { getLenis } from "@/lib/smooth-scroll";
import { isIntroDone, markIntroDone } from "@/lib/intro-state";

const SITE_URL = "https://abhinav.maoverse.xyz";

// ProfilePage structured data for the homepage. It ties back to the Person
// entity declared site-wide in the root layout (#person), which is the
// recommended pattern for a personal portfolio's main page.
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

const Home = () => {
  // Preloader plays first; when it finishes, the panel slides up to reveal
  // the Projects section (the first section on the page). Replays are
  // skipped within the same session (client-side navigations back to "/")
  // — the intro only runs on a fresh load.
  const [isIntroActive, setIsIntroActive] = useState(() => !isIntroDone());
  const [introComplete, setIntroComplete] = useState(() => isIntroDone());

  // Lock scrolling (native + Lenis) and keep the viewport at the top until
  // the intro's slide-up reveal has fully finished, so it lands exactly on
  // the Projects section.
  useEffect(() => {
    if (introComplete) return undefined;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    getLenis()?.stop();
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      getLenis()?.start();
    };
  }, [introComplete]);

  return (
    <div className="relative isolate bg-black page-top-offset">
      {/* Crawlable, screen-reader-only intro. */}
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
            <li><Link href="/resume">Résumé</Link></li>
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

      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          setIntroComplete(true);
          markIntroDone();
        }}
      >
        {isIntroActive && (
          <Preloader onComplete={() => setIsIntroActive(false)} />
        )}
      </AnimatePresence>

      {/* Whole-page flow: sections stack naturally and scroll as one page.
          Achievements and Journey share one continuous black stage; the
          Journey's red scroll-drawn line exits its bottom edge straight
          into the Skills section. */}
      <Intro />
      <Projects introComplete={introComplete} />
      <Achievements />
      <Timeline />
      <Skills />
      <Contact />
    </div>
  );
};

export default Home;
