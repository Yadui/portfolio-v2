import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { listLocalDrafts, isDraftPreviewEnabled } from '@/lib/draft-preview.mjs';

export const dynamic = 'force-dynamic';

export default async function DraftIndex() {
  const host = (await headers()).get('host');
  if (!isDraftPreviewEnabled(process.env, host)) notFound();
  const drafts = await listLocalDrafts(process.env, host);

  return (
    <main className="min-h-screen bg-[#fffdf8] px-4 pb-20 pt-28 text-[#101828] md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-[#00734a]">Local review only</p>
          <h1 className="portfolio-title text-4xl md:text-5xl">AI article drafts</h1>
          <p className="portfolio-body mt-4 max-w-[62ch]">
            Four articles and their proposed covers. None is published. Open a draft to review the full text, sources and artwork before approval.
          </p>
        </header>
        <div className="divide-y divide-[#101828]/10 border-y border-[#101828]/10">
          {drafts.map((draft) => (
            <article key={draft.slug} className="py-8">
              <Link href={`/drafts/${draft.slug}`} className="group grid items-center gap-6 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#00734a] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
                <Image src={draft.cover} alt={draft.coverAlt} width={1600} height={840} sizes="(max-width: 768px) 100vw, 440px" className="h-auto w-full rounded-xl border border-[#101828]/10" />
                <div className="min-w-0">
                  <h2 className="portfolio-title text-2xl leading-tight group-hover:text-[#00734a] md:text-3xl">{draft.title}</h2>
                  <p className="portfolio-body mt-3">{draft.excerpt}</p>
                  <p className="mt-4 text-sm text-[#536074]">Unpublished draft · About {draft.words.toLocaleString('en-US')} words</p>
                  <span className="mt-4 inline-block font-semibold text-[#00734a]">Read draft →</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-8 max-w-[65ch] text-sm leading-relaxed text-[#536074]">This review area reads local Markdown files only. It does not connect to Turso, record approval or publish content. These routes return 404 in production.</p>
      </div>
    </main>
  );
}
