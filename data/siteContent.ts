/**
 * Site Content Configuration
 *
 * This file centralizes editable personal / portfolio content.
 * Update values here to change copy across the site without touching components.
 *
 * Schema documentation:
 * - personal      : Name, role, and hero text used in Header / HeaderHome.
 * - nav           : Right-side nav rail links (Header + HeaderHome).
 * - meta          : Page metadata used in app/layout.tsx (title, description, OG, twitter).
 * - contact       : Contact section links + the form destination email.
 * - socials       : Footer / social icon bar links.
 * - stats         : Home-page stat counters.
 * - achievements  : Selected recognition cards.
 * - timeline      : Experience and education entries.
 * - services      : Service offerings page cards.
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface ContactLink {
  type: "linkedin" | "email" | "location";
  label: string;
  value: string;
  href: string | null;
  external: boolean;
}

export interface SocialLink {
  type: "github" | "linkedin" | "twitter";
  href: string;
}

export interface StatItem {
  num: number | string;
  text: string;
}

export interface AchievementItem {
  id: number;
  title: string;
  rank: string;
  organization: string;
  type: string;
  year: string;
  summary: string;
  accent: string;
  projectUrl?: string;
}

export interface TimelineEntry {
  company?: string;
  institution?: string;
  slug?: string;
  position?: string;
  degree?: string;
  duration: string;
  type: string;
  description: string;
  skills: string;
}

export interface ServiceItem {
  num: string;
  title: string;
  description: string;
  href: string;
}

export interface SiteMeta {
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  authorName: string;
  creatorName: string;
  url: string;
  siteName: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterHandle: string;
}

/* ------------------------------------------------------------------ */
/* Personal / Hero                                                    */
/* ------------------------------------------------------------------ */
export const personal = {
  /** Shown after the "Hello" animation inside the pill. */
  name: "I'm Abhinav",
  /** Rotating ring text beneath the hero pill (specialties). */
  specialties:
    "Cloud Architect · AI Solutions · Data Engineering · UI/UX · Platform Engineering · Automation · DevOps · Cloud Security · Product Systems · Integrations · Scalable APIs ·",
};

/* ------------------------------------------------------------------ */
/* Navigation                                                         */
/* ------------------------------------------------------------------ */
export const navItems: NavItem[] = [
  { label: "Projects", href: "#projects" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "#timeline" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "#contact" },
];

/* ------------------------------------------------------------------ */
/* Page Metadata (app/layout.tsx)                                     */
/* ------------------------------------------------------------------ */
export const siteMeta: SiteMeta = {
  defaultTitle: "Abhinav · · · Yadav",
  titleTemplate: "%s | Abhinav Yadav",
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
  authorName: "Abhinav Yadav",
  creatorName: "Abhinav Yadav",
  url: "https://abhinav.maoverse.xyz",
  siteName: "Abhinav Yadav Portfolio",
  ogTitle: "Abhinav Yadav | Software Engineer & Creative Developer",
  ogDescription:
    "Explore the portfolio of Abhinav Yadav, featuring creative web projects and software engineering expertise.",
  ogImage: "/og-image.png",
  twitterHandle: "@abhinavyadav88",
};

/* ------------------------------------------------------------------ */
/* Contact Section                                                    */
/* ------------------------------------------------------------------ */
export const contactLinks: ContactLink[] = [
  {
    type: "linkedin",
    label: "LinkedIn",
    value: "abhinavyadav88",
    href: "https://www.linkedin.com/in/abhinavyadav88",
    external: true,
  },
  {
    type: "email",
    label: "Email",
    value: "abhinavyadav8@gmail.com",
    href: "mailto:abhinavyadav8@gmail.com",
    external: false,
  },
  {
    type: "location",
    label: "Location",
    value: "Gurgaon",
    href: null,
    external: false,
  },
];

/** Destination email for the contact form API payload. */
export const contactFormEmail = "abhinavyadav8+port@gmail.com";

/* ------------------------------------------------------------------ */
/* Socials (icon bar)                                                 */
/* ------------------------------------------------------------------ */
export const socialLinks: SocialLink[] = [
  { type: "github", href: "https://github.com/Yadui" },
  { type: "linkedin", href: "https://www.linkedin.com/in/abhinavyadav88" },
  { type: "twitter", href: "https://x.com/abhinav2302055" },
];

/* ------------------------------------------------------------------ */
/* Stats                                                              */
/* ------------------------------------------------------------------ */
export const stats: StatItem[] = [
  { num: 1, text: "Years of experience" },
  { num: 10, text: "Projects completed" },
  { num: "5+", text: "Techonologies mastered" },
  { num: 100, text: "Code commits" },
];

/* ------------------------------------------------------------------ */
/* Achievements                                                       */
/* ------------------------------------------------------------------ */
export const achievements: AchievementItem[] = [
  {
    id: 1,
    title: "Midnight Summit Hackathon",
    rank: "1st Place",
    organization: "Midnight Foundation",
    type: "In-Person",
    year: "2025",
    summary:
      "Top-finish recognition for fast execution, product clarity, and a strong live delivery under hackathon constraints.",
    accent: "#ffbf73",
  },
  {
    id: 2,
    title: "Microsoft Hackathon & Ideathon",
    rank: "1st Place",
    organization: "Microsoft",
    type: "Hackathon",
    year: "2025",
    summary:
      "Recognized for pairing concept strength with technical execution and a polished end-to-end presentation.",
    accent: "#00ff99",
  },
  {
    id: 3,
    title: "Midnight | MLH Hackathon",
    rank: "Winner",
    organization: "Midnight Foundation × MLH",
    type: "Online",
    year: "2026",
    summary:
      "Built ConfidentialLottery — a provably fair, privacy-preserving lottery on the Midnight blockchain using zero-knowledge proofs.",
    accent: "#a78bfa",
    projectUrl: "https://github.com/Yadui/ConfidentialLottery",
  },
  {
    id: 4,
    title: "INTO The MIDNIGHT Hackathon",
    rank: "Prize Winner",
    organization: "Midnight Foundation",
    type: "Online",
    year: "2026",
    summary:
      "Built Midnight_Alphashield — a privacy-first identity-protection tool; competed in a $6,000 prize pool hackathon.",
    accent: "#38bdf8",
    projectUrl: "https://github.com/Yadui/Midnight_Alphashield",
  },
];

/* ------------------------------------------------------------------ */
/* Timeline (Experience + Education)                                  */
/* ------------------------------------------------------------------ */
export const experience: TimelineEntry[] = [
  {
    company: "Foetron",
    slug: "foetron",
    position: "Cloud and AI Engineer",
    duration: "Sep 2024 - Present",
    type: "Full-Time",
    description:
      "Cloud & AI Engineer — architected Azure infrastructure, built AI pipelines, and led hybrid-cloud deployments.",
    skills: "Microsoft Azure, Azure OpenAI, Azure Cognitive Services, Data Engineering, SQL Server, Sophos Firewall",
  },
  {
    company: "Outlier",
    slug: "outlier",
    position: "Prompt Engineer",
    duration: "Jun 2024 - Present",
    type: "Freelance",
    description:
      "Prompt Engineer — designed multi-modal AI prompts for Google Genesis project (VTT, ATT, ITT).",
    skills: "Prompt Engineering, Prompt Design, Multi-modal AI, NLP, Conversational AI, Machine Learning",
  },
  {
    company: "Vm Coders",
    slug: "vmcoders",
    position: "Frontend Developer",
    duration: "Jan 2024 - Jun 2024",
    type: "Internship",
    description:
      "Frontend Developer — built marketing websites with React, TailwindCSS, and Figma designs.",
    skills: "ReactJS, TailwindCSS, Figma, Web Design, SEO, Responsive Design, JavaScript",
  },
];

export const education: TimelineEntry[] = [
  {
    institution: "JC Bose University, YMCA",
    degree: "Computer Engineering",
    duration: "2020 - 2024",
    type: "Degree",
    description: "Focused on software engineering, algorithms, and system design.",
    skills: "",
  },
];

/* ------------------------------------------------------------------ */
/* Services                                                           */
/* ------------------------------------------------------------------ */
export const services: ServiceItem[] = [
  {
    num: "01",
    title: "Cloud Architect",
    description:
      "Designing and implementing scalable cloud architectures for modern applications, ensuring reliability, performance, and security.",
    href: "/services#cloud-architect",
  },
  {
    num: "02",
    title: "AI Tool Creator",
    description:
      "Developing innovative AI tools and solutions, optimizing models to solve real-world problems effectively.",
    href: "/services#ai-tool-creator",
  },
  {
    num: "03",
    title: "Web Development",
    description:
      "Expert in building modern web applications using React, Next.js, and Node.js. I create responsive, high-performance websites with clean, maintainable code.",
    href: "/services#web-development",
  },
  {
    num: "04",
    title: "AI Training",
    description:
      "Specializing in training AI models to perform specific tasks, fine-tuning algorithms, and creating intelligent solutions.",
    href: "/services#ai-training",
  },
];

/* ------------------------------------------------------------------ */
/* Runtime validation (dev-only)                                      */
/* ------------------------------------------------------------------ */
function validateRequired<T>(value: T | undefined | null, name: string): T {
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    throw new Error(`[siteContent] Missing required field: ${name}`);
  }
  return value;
}

function validateInDev() {
  if (process.env.NODE_ENV !== "development") return;

  try {
    validateRequired(personal.name, "personal.name");
    validateRequired(personal.specialties, "personal.specialties");
    validateRequired(siteMeta.defaultTitle, "siteMeta.defaultTitle");
    validateRequired(siteMeta.description, "siteMeta.description");
    validateRequired(siteMeta.url, "siteMeta.url");
    validateRequired(contactFormEmail, "contactFormEmail");

    if (navItems.length === 0) throw new Error("[siteContent] navItems cannot be empty");
    if (socialLinks.length === 0) throw new Error("[siteContent] socialLinks cannot be empty");
    if (stats.length === 0) throw new Error("[siteContent] stats cannot be empty");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[siteContent] Validation failed:", err);
  }
}

validateInDev();
