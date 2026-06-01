import { workDetails } from "@/data/workDetails";

export async function generateMetadata({ params }) {
  const work = workDetails[params.company];
  if (!work) {
    return { title: "Work | Abhinav Yadav" };
  }
  return {
    title: `${work.company} — ${work.position}`,
    description: work.summary,
    alternates: {
      canonical: `https://abhinavyadav.dev/work/${params.company}`,
    },
    openGraph: {
      title: `${work.company} | Abhinav Yadav`,
      description: work.summary,
      url: `https://abhinavyadav.dev/work/${params.company}`,
    },
  };
}

export default function WorkCompanyLayout({ children }) {
  return children;
}
