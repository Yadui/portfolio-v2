"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_PREFIXES = ["/login", "/blog/create", "/blog/edit"];

// Site-wide navigation. Before this, the only links to /work, /services and
// /contact lived in a visually hidden sr-only block on the homepage, so every
// other page was a dead end and Search Console reported 23 URLs as
// "Discovered - currently not indexed" with no crawl. These are real, visible
// links present on every page.
const LINKS = [
  { href: "/work", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

/** Minimal site footer. Decorative micrographics were removed by request. */
export default function SiteFooter() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) return null;

  return (
    <footer className="site-footer-minimal">
      <span>Abhinav Yadav</span>

      <nav aria-label="Footer" className="site-footer-nav">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>

      <span>© {new Date().getFullYear()}</span>
    </footer>
  );
}
