import { SITE_URL } from "@/lib/site";
const BASE_URL = SITE_URL;

// Mirrors the visible services on /services (app/services/page.jsx) so the
// structured data matches on-page content.
const services = [
  {
    name: "Cloud Architect",
    description:
      "Designing and implementing scalable cloud architectures for modern applications, ensuring reliability, performance, and security.",
  },
  {
    name: "AI Tool Creator",
    description:
      "Developing innovative AI tools and solutions, optimizing models to solve real-world problems effectively.",
  },
  {
    name: "Web Development",
    description:
      "Building modern web applications using React, Next.js, and Node.js — responsive, high-performance sites with clean, maintainable code.",
  },
  {
    name: "AI Training",
    description:
      "Training AI models to perform specific tasks, fine-tuning algorithms, and creating intelligent solutions.",
  },
];

export const metadata = {
  title: "Services",
  description:
    "Professional services offered by Abhinav Yadav — Cloud Architecture, AI Tool Development, Full-Stack Web Development, and AI Model Training.",
  alternates: {
    canonical: `${BASE_URL}/services`,
  },
  openGraph: {
    title: "Services | Abhinav Yadav",
    description:
      "Cloud architecture, AI solutions, and web development services by Abhinav Yadav.",
    url: `${BASE_URL}/services`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/services#webpage`,
      url: `${BASE_URL}/services`,
      name: "Services | Abhinav Yadav",
      description:
        "Professional services offered by Abhinav Yadav — cloud architecture, AI tooling, web development, and AI training.",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      about: { "@id": `${BASE_URL}/#person` },
      inLanguage: "en-US",
    },
    {
      "@type": "ItemList",
      name: "Professional services",
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: service.name,
          serviceType: service.name,
          description: service.description,
          url: `${BASE_URL}/services`,
          areaServed: "Worldwide",
          provider: { "@id": `${BASE_URL}/#person` },
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Services",
          item: `${BASE_URL}/services`,
        },
      ],
    },
  ],
};

export default function ServicesLayout({ children }) {
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
