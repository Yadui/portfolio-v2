import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Components
import PageTransition from "@/components/PageTransition";
import TabPacman from "@/components/TabPacman";
import ResourceMonitor from "@/components/ResourceMonitor";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jetbrainsMono",
});

export const metadata = {
  metadataBase: new URL("https://abhinav.maoverse.xyz"),
  title: {
    default: "Abhinav · · · Yadav",
    template: "%s | Abhinav Yadav",
  },
  description:
    "Portfolio of Abhinav · · · Yadav, a passionate Software Engineer and Creative Developer.",
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
        url: "/og-image.png",
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
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/pacman.svg",
    shortcut: "/pacman.svg",
    apple: "/pacman.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Disable browser scroll-restoration so every page load starts at the hero */}
      <head>
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
      <body className={jetbrainsMono.variable}>
        <ResourceMonitor />
        <TabPacman />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
