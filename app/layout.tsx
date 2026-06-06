import localFont from "next/font/local";
import "./globals.css";

// Components
import PageTransition from "@/components/PageTransition";
import TabPacman from "@/components/TabPacman";

const morsa = localFont({
  src: "../public/fonts/MORSA.ttf",
  variable: "--font-morsa",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata = {
  metadataBase: new URL("https://abhinav.maoverse.xyz"),
  title: {
    default: "Abhinav Yadav — Software Engineer & Creative Developer",
    template: "%s | Abhinav Yadav",
  },
  description:
    "Abhinav Yadav is a Software Engineer and Creative Developer building cloud, AI, and full-stack web applications with React, Next.js, and Azure.",
  keywords: [
    "Software Engineer",
    "Web Developer",
    "React",
    "Next.js",
    "Creative Developer",
    "Portfolio",
    "Abhinav Yadav",
    "Frontend",
    "Full Stack",
  ],
  authors: [{ name: "Abhinav Yadav" }],
  creator: "Abhinav Yadav",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://abhinav.maoverse.xyz",
    siteName: "Abhinav Yadav Portfolio",
    title: "Abhinav Yadav | Software Engineer & Creative Developer",
    description:
      "Explore the portfolio of Abhinav Yadav, featuring creative web projects and software engineering expertise.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Abhinav Yadav Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abhinav Yadav | Software Engineer & Creative Developer",
    description: "Check out my latest projects and skills in web development.",
    creator: "@abhinavyadav88",
    images: ["/opengraph-image"],
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
      jobTitle: "Software Engineer",
      description:
        "Software Engineer and Creative Developer building cloud, AI, and full-stack web applications.",
      knowsAbout: [
        "Software Engineering",
        "Web Development",
        "React",
        "Next.js",
        "Cloud Architecture",
        "Microsoft Azure",
        "Artificial Intelligence",
        "Full-Stack Development",
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
                const root = document.documentElement;
                const previousVisibility = root.style.visibility;
                let finalized = false;

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

                root.style.visibility = "hidden";

                const scrollToTop = () => {
                  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                };

                const reveal = () => {
                  root.style.visibility = previousVisibility;
                };

                const finalize = () => {
                  if (finalized) {
                    return;
                  }

                  finalized = true;
                  scrollToTop();
                  requestAnimationFrame(() => {
                    scrollToTop();
                    requestAnimationFrame(() => {
                      scrollToTop();
                      reveal();
                    });
                  });
                };

                window.setTimeout(reveal, 1200);

                scrollToTop();
                window.addEventListener("load", finalize, { once: true });
                window.addEventListener("pageshow", finalize, { once: true });
                requestAnimationFrame(finalize);
              })();
            `,
          }}
        />
      </head>
      <body className={morsa.variable}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <TabPacman />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
