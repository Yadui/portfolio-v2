import Link from "next/link";
import NotFoundDots from "@/components/NotFoundDots";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  title: "Page not found",
  description: "That page does not exist.",
  alternates: { canonical: `${SITE_URL}/404` },
  // A 404 must never enter the index, and should not pass weight onward.
  robots: { index: false, follow: false },
};

/**
 * 404.
 *
 * Deliberately almost empty: the Blog and Resume pill already comes from the
 * root layout, so the page itself is the number, one line of explanation, and
 * one way out. The previous version was a dark panel with a green glow and
 * three competing calls to action, which matched neither the paper-and-ink
 * system nor the job of getting someone unstuck.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#fffdf8] px-6 text-[#101828]">
      <NotFoundDots />

      <p className="portfolio-body mt-6 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#8892a4]">
        Page not found
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex min-h-[2.75rem] items-center rounded-full px-4 text-[clamp(1.1rem,2vw,1.4rem)] text-[#101828] underline decoration-[#101828]/25 underline-offset-[6px] transition-colors hover:decoration-[#101828] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#101828]"
      >
        Home?
      </Link>
    </main>
  );
}
