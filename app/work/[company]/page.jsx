import { notFound } from "next/navigation";
import { workDetails } from "@/data/workDetails";
import WorkDetailClient from "@/components/WorkDetailClient";

const BASE_URL = "https://abhinav.maoverse.xyz";

export async function generateStaticParams() {
  return Object.keys(workDetails).map((company) => ({ company }));
}

export async function generateMetadata({ params }) {
  const { company } = await params;
  const work = workDetails[company];

  if (!work) return {};

  const title = `${work.position} at ${work.company}`;
  const description = work.summary;
  const url = `${BASE_URL}/work/${company}`;
  const techKeywords = work.techStack;

  return {
    title,
    description,
    keywords: techKeywords,
    authors: [{ name: "Abhinav Yadav", url: BASE_URL }],
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      title: `${title} | Abhinav Yadav`,
      description,
      images: [
        {
          url: `${BASE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${work.company} — ${work.position}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Abhinav Yadav`,
      description,
      images: [`${BASE_URL}/opengraph-image`],
    },
  };
}

export default async function WorkDetailPage({ params }) {
  const { company } = await params;
  const work = workDetails[company];

  if (!work) {
    notFound();
  }

  const slugs = Object.keys(workDetails);
  const nextSlug = slugs[(slugs.indexOf(company) + 1) % slugs.length];
  const nextWork = workDetails[nextSlug];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Work", item: `${BASE_URL}/work` },
          { "@type": "ListItem", position: 3, name: work.company, item: `${BASE_URL}/work/${company}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WorkDetailClient work={work} nextSlug={nextSlug} nextWork={nextWork} />
    </>
  );
}
