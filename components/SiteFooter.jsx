"use client";

import { usePathname } from "next/navigation";

const HIDDEN_PREFIXES = ["/login", "/blog/create", "/blog/edit"];

/** Minimal site footer. Decorative micrographics were removed by request. */
export default function SiteFooter() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) return null;

  return (
    <footer className="site-footer-minimal">
      <span>Abhinav Yadav</span>
      <span>© {new Date().getFullYear()}</span>
    </footer>
  );
}
