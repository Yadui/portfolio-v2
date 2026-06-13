"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGithub, FaLinkedinIn, FaXTwitter, FaArrowUp } from "react-icons/fa6";

import { getLenis } from "@/lib/smooth-scroll";
import { socialLinks, contactLinks } from "@/data/siteContent";

const SOCIAL_ICONS = {
  github: <FaGithub />,
  linkedin: <FaLinkedinIn />,
  twitter: <FaXTwitter />,
};

// Admin / utility routes where the footer would get in the way.
const HIDDEN_PREFIXES = ["/login", "/blog/create", "/blog/edit"];

export default function SiteFooter() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) {
    return null;
  }

  const email = contactLinks.find((link) => link.type === "email");
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }
  };

  return (
    <footer className="relative z-[20] bg-black text-white">
      <h2 className="sr-only">Abhinav Yadav</h2>

      {/* Info bar */}
      <div className="flex flex-col gap-5 border-b border-white/10 px-[clamp(1.25rem,3vw,3rem)] py-7 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-body text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/40">
            Have an idea?
          </span>
          <Link
            href="/contact"
            className="group font-heading text-2xl font-light tracking-tight transition-colors duration-200 hover:text-[#00ff99] md:text-3xl"
          >
            Let&apos;s build it
            <span
              aria-hidden="true"
              className="ml-3 inline-block transition-transform duration-300 ease-out group-hover:translate-x-2"
            >
              →
            </span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {email && (
            <a
              href={email.href}
              className="font-body text-sm text-white/60 transition-colors duration-200 hover:text-white"
            >
              {email.value}
            </a>
          )}

          <span className="hidden h-4 w-px bg-white/15 md:block" aria-hidden="true" />

          <ul className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <li key={social.type}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.type}
                  className="block text-lg text-white/60 transition-all duration-200 hover:-translate-y-0.5 hover:text-white"
                >
                  {SOCIAL_ICONS[social.type]}
                </a>
              </li>
            ))}
          </ul>

          <span className="hidden h-4 w-px bg-white/15 md:block" aria-hidden="true" />

          <button
            type="button"
            onClick={scrollToTop}
            className="group flex items-center gap-2 font-body text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white/60 transition-colors duration-200 hover:text-white"
          >
            Back to top
            <FaArrowUp
              aria-hidden="true"
              className="transition-transform duration-300 ease-out group-hover:-translate-y-1"
            />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-[clamp(1.25rem,3vw,3rem)] py-4 text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/35">
        <span>© {year} Abhinav Yadav</span>
        <span className="hidden md:block">Cloud &amp; AI Engineer — Gurgaon, IN</span>
        <span>Built with Next.js</span>
      </div>
    </footer>
  );
}
