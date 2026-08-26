import { SITE_URL } from "@/lib/site";
export const metadata = {
  // This page OWNS the "projects" cluster — separate from case studies (/work/[company])
  title: "Projects",
  description:
    "Cloud, AI, and web projects by Abhinav Yadav — production-grade apps and tools built with Azure, Next.js, React, and Python.",
  alternates: {
    canonical: `${SITE_URL}/work`,
  },
  openGraph: {
    title: "Projects | Abhinav Yadav",
    description:
      "Cloud, AI, and web projects by Abhinav Yadav — production-grade apps and tools built with Azure, Next.js, React, and Python.",
    url: `${SITE_URL}/work`,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Projects by Abhinav Yadav",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Abhinav Yadav",
    description:
      "Cloud, AI, and web projects by Abhinav Yadav — Azure, Next.js, React, and Python.",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function WorkLayout({ children }) {
  return children;
}
