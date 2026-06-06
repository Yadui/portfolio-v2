import { workDetails } from "@/data/workDetails";

const BASE_URL = "https://abhinav.maoverse.xyz";

export async function generateMetadata({ params }) {
  const { company } = await params;
  const work = workDetails[company];
  if (!work) {
    return { title: "Work | Abhinav Yadav" };
  }
  return {
    title: `${work.company} — ${work.position}`,
    description: work.summary,
    alternates: {
      canonical: `${BASE_URL}/work/${company}`,
    },
    openGraph: {
      type: "profile",
      title: `${work.company} | Abhinav Yadav`,
      description: work.summary,
      url: `${BASE_URL}/work/${company}`,
    },
  };
}

export default async function WorkCompanyLayout({ children, params }) {
  const { company } = await params;
  const work = workDetails[company];

  if (!work) {
    return children;
  }

  const url = `${BASE_URL}/work/${company}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: `${work.company} — ${work.position}`,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
