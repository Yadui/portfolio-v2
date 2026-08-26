import localFont from "next/font/local";
import "./globals.css";

// Components
import PageTransition from "@/components/PageTransition";
import SiteFooter from "@/components/SiteFooter";
import TabPacman from "@/components/TabPacman";
import SmoothScroll from "@/components/SmoothScroll";
import SiteHeader from "@/components/SiteHeader";
import AudioPlayer from "@/components/AudioPlayer";

const morsa = localFont({
  src: "../public/fonts/MORSA.ttf",
  variable: "--font-morsa",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

// Body / normal text
const clashDisplay = localFont({
  src: "../public/fonts/ClashDisplay-Variable.ttf",
  variable: "--font-clash-display",
  display: "swap",
  weight: "200 700",
  fallback: ["ui-sans-serif", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

// Headings
const clashGrotesk = localFont({
  src: "../public/fonts/ClashGrotesk-Variable.ttf",
  variable: "--font-clash-grotesk",
  display: "swap",
  weight: "200 700",
  fallback: ["ui-sans-serif", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

// Funky accent / highlight text (hero)
const ffComma = localFont({
  src: "../public/fonts/FFCommaTrial-Regular.ttf",
  variable: "--font-ff-comma",
  display: "swap",
  fallback: ["Georgia", "ui-serif", "serif"],
});

// Hero highlight fonts — Letters & Letters II by Fenotype
const letters = localFont({
  src: "../public/fonts/Letters.ttf",
  variable: "--font-letters",
  display: "swap",
  fallback: ["Georgia", "ui-serif", "serif"],
});

const lettersII = localFont({
  src: "../public/fonts/LettersII.ttf",
  variable: "--font-letters-ii",
  display: "swap",
  fallback: ["Georgia", "ui-serif", "serif"],
});

const fluctuation = localFont({
  src: "../public/fonts/Fluctuation-Lt.otf",
  variable: "--font-fluctuation",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata = {
  metadataBase: new URL("https://abhinav.maoverse.xyz"),
  title: {
    // Homepage owns the personal brand query. Sub-pages get "Page | Abhinav Yadav".
    default: "Abhinav Yadav — Cloud & AI Engineer | Gurugram, India",
    template: "%s | Abhinav Yadav",
  },
  description:
    "Abhinav Yadav is a Cloud & AI Engineer at Foetron, Gurugram. Builds Azure infrastructure, AI pipelines, and full-stack web apps with Next.js and React. Open to freelance and full-time roles.",
  alternates: {
    canonical: "https://abhinav.maoverse.xyz/",
  },
  keywords: [
    "Abhinav Yadav",
    "Abhinav Yadav engineer",
    "Abhinav Yadav Azure",
    "Abhinav Yadav Foetron",
    "Cloud AI Engineer Gurugram",
    "Azure engineer India",
    "AI engineer Delhi NCR",
    "software engineer portfolio India",
    "Next.js developer India",
    "cloud infrastructure engineer",
    "Azure OpenAI engineer",
    "full-stack developer Gurugram",
  ],
  authors: [{ name: "Abhinav Yadav", url: "https://abhinav.maoverse.xyz" }],
  creator: "Abhinav Yadav",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://abhinav.maoverse.xyz/",
    siteName: "Abhinav Yadav",
    title: "Abhinav Yadav — Cloud & AI Engineer | Gurugram, India",
    description:
      "Portfolio of Abhinav Yadav — Cloud & AI Engineer at Foetron, Gurugram. Azure infrastructure, AI pipelines, and full-stack web projects.",
    images: [
      {
        url: "https://abhinav.maoverse.xyz/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Abhinav Yadav — Cloud & AI Engineer, Gurugram India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abhinav Yadav — Cloud & AI Engineer | Gurugram, India",
    description:
      "Portfolio of Abhinav Yadav — Cloud & AI Engineer at Foetron, Gurugram. Azure infrastructure, AI pipelines, and full-stack projects.",
    creator: "@abhinavyadav88",
    images: ["https://abhinav.maoverse.xyz/opengraph-image"],
  },
  icons: {
    icon: "/pacman.svg",
    shortcut: "/pacman.svg",
    apple: "/pacman.svg",
  },
};

// Site-wide structured data (JSON-LD). A Person + WebSite graph helps Google
// understand the entity behind the site (knowledge-graph / rich-result signals)
// and is especially valuable for a personal brand / portfolio.
const SITE_URL = "https://abhinav.maoverse.xyz";
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Abhinav Yadav",
      url: SITE_URL,
      image: `${SITE_URL}/assets/Abhinav_Yadav.png`,
      jobTitle: "Cloud & AI Engineer",
      worksFor: {
        "@type": "Organization",
        name: "Foetron",
        url: "https://foetron.vercel.app",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Gurugram",
        addressRegion: "Haryana",
        addressCountry: "IN",
      },
      description:
        "Cloud & AI Engineer at Foetron, Gurugram, India — building Azure infrastructure, AI pipelines, and full-stack web applications.",
      knowsAbout: [
        "Microsoft Azure",
        "Cloud Architecture",
        "Artificial Intelligence",
        "AI Pipelines",
        "Software Engineering",
        "Web Development",
        "React",
        "Next.js",
        "Full-Stack Development",
        "Azure OpenAI",
      ],
      sameAs: [
        "https://github.com/Yadui",
        "https://www.linkedin.com/in/abhinavyadav88",
        "https://x.com/abhinav2302055",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Abhinav Yadav Portfolio",
      description:
        "Portfolio of Abhinav Yadav — Software Engineer & Creative Developer.",
      publisher: { "@id": `${SITE_URL}/#person` },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Disable browser scroll-restoration so every page load starts at the hero */}
      <head>
        {/* RSS feed discovery for readers, aggregators, and crawlers */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Abhinav Yadav — Blog"
          href="/rss.xml"
        />
        <script
          dangerouslySetInnerHTML={{
              __html: `
               (() => {
                 if ("scrollRestoration" in history) {
                   history.scrollRestoration = "manual";
                 }

                const navigationEntry = performance.getEntriesByType("navigation")[0];
                const isReload = navigationEntry
                  ? navigationEntry.type === "reload"
                  : performance.navigation && performance.navigation.type === 1;

                 if (location.pathname === "/" && isReload && location.hash) {
                   history.replaceState(null, "", location.pathname + location.search);
                 }

                 const scrollToTop = () => {
                   window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                 };
                 scrollToTop();
                 requestAnimationFrame(scrollToTop);

                 // The home hero runs a load sequence that the header pill
                 // must stay out of. Set the flag before first paint so the
                 // pill never flashes; the hero clears it when it finishes.
                 // The timeout is a failsafe so the header cannot be lost if
                 // the hero never mounts.
                 if (location.pathname === "/") {
                   var root = document.documentElement;
                   root.classList.add("intro-running", "hero-unpainted");
                   setTimeout(function () {
                     root.classList.remove("intro-running", "hero-unpainted");
                   }, 9000);
                 }
               })();
             `,
          }}
        />
      </head>
      <body className={`${clashDisplay.variable} ${clashGrotesk.variable} ${morsa.variable} ${ffComma.variable} ${letters.variable} ${lettersII.variable} ${fluctuation.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <TabPacman />
        <SmoothScroll />
        <SiteHeader />
        <PageTransition>{children}</PageTransition>
        <SiteFooter />
        <AudioPlayer />
      </body>
    </html>
  );
}
