import RevealText from "@/components/RevealText";

/**
 * Shared page introduction for the sub-pages (work, services, blog, contact).
 *
 * The four pages had drifted into two dialects: work and services led with a
 * kicker and a revealed display title, while blog and contact led with a plain
 * heading (blog's sat next to a "back" button, contact's inside the form card).
 * This is the single header so the set reads as one site.
 *
 * Left-aligned on purpose. The previous centred stack made every page open the
 * same symmetrical way; anchoring the title left and letting the lede sit in a
 * narrower measure beside it gives the pages an editorial axis to hang from.
 */
export default function PageIntro({ kicker, title, lede, actions = null }) {
  return (
    <header className="mb-14 grid gap-6 md:mb-20 md:grid-cols-12 md:items-end">
      <div className="flex flex-col gap-3 md:col-span-7">
        <span className="portfolio-kicker">{kicker}</span>
        <RevealText as="h1" className="portfolio-title text-5xl md:text-6xl">
          {title}
        </RevealText>
      </div>

      {(lede || actions) && (
        <div className="flex flex-col gap-5 md:col-span-5 md:items-start">
          {lede && (
            /* ~65 characters per line at this width, per the type rules. */
            <p className="portfolio-body max-w-[46ch] text-base leading-relaxed">
              {lede}
            </p>
          )}
          {actions}
        </div>
      )}
    </header>
  );
}
