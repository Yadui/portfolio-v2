export const metadata = {
  title: "Contact",
  description:
    "Hire or collaborate with Abhinav Yadav — Cloud & AI Engineer based in Gurugram, India. Available for Azure infrastructure, AI pipeline development, and full-stack web projects.",
  alternates: {
    canonical: "https://abhinav.maoverse.xyz/contact",
  },
  openGraph: {
    title: "Contact | Abhinav Yadav",
    description:
      "Hire or collaborate with Abhinav Yadav — Cloud & AI Engineer, Gurugram, India. Available for Azure, AI, and full-stack projects.",
    url: "https://abhinav.maoverse.xyz/contact",
    images: [
      {
        url: "https://abhinav.maoverse.xyz/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Contact Abhinav Yadav",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Abhinav Yadav",
    description:
      "Hire or collaborate with Abhinav Yadav — Cloud & AI Engineer, Gurugram, India.",
    images: ["https://abhinav.maoverse.xyz/opengraph-image"],
  },
};

export default function ContactLayout({ children }) {
  return children;
}
