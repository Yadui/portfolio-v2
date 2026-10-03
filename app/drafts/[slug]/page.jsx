import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getLocalDraft } from '@/lib/draft-preview.mjs';
import { MarkdownComponents } from '@/components/blog/MarkdownComponents';

export const dynamic = 'force-dynamic';

async function loadDraft(params) {
  const { slug } = await params;
  return getLocalDraft(slug, process.env, (await headers()).get('host'));
}

export async function generateMetadata({ params }) {
  const draft = await loadDraft(params);
  return draft ? {
    title: { absolute: `Draft: ${draft.title}` }, description: draft.excerpt,
    robots: { index: false, follow: false, noarchive: true }, alternates: { canonical: null },
  } : {};
}

export default async function DraftArticle({ params }) {
  const draft = await loadDraft(params);
  if (!draft) notFound();

  return (
    <main className="min-h-screen bg-[#fffdf8] px-4 pb-20 pt-28 text-[#101828] md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/drafts" className="inline-block rounded text-sm font-semibold text-[#00734a] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00734a]">← All drafts</Link>
        <header className="mb-8 mt-8">
          <p className="mb-3 text-sm font-semibold text-[#00734a]">Draft · Not published</p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">{draft.title}</h1>
          <p className="portfolio-body mt-4 max-w-[65ch]">{draft.excerpt}</p>
        </header>
        <figure className="mb-10">
          <Image src={draft.cover} alt={draft.coverAlt} width={1600} height={840} sizes="(max-width: 768px) 100vw, 896px" priority className="h-auto w-full rounded-2xl border border-[#101828]/10" />
          <figcaption className="mt-3 text-sm leading-relaxed text-[#536074]">Proposed editorial cover. {draft.cover.includes('openwebui') ? 'Photo: Taylor Vick / Unsplash.' : 'Photo: NASA / Pat Izzo.'} The artwork is a visual metaphor, not a product screenshot or deployment claim.</figcaption>
        </figure>
        <article className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-headings:text-[#101828] prose-p:text-[#2a3648] prose-a:text-[#00805b] hover:prose-a:text-[#101828] prose-strong:text-[#101828] prose-li:text-[#2a3648] prose-code:rounded prose-code:bg-[#101828]/5 prose-code:px-1 prose-code:text-[#00734a] prose-pre:border prose-pre:border-[#101828]/10 prose-img:rounded-2xl">
          <ReactMarkdown components={MarkdownComponents}>{draft.content}</ReactMarkdown>
        </article>
        <footer className="mt-10 border-t border-[#101828]/10 pt-6">
          <p className="mb-4 text-sm leading-relaxed text-[#536074]">Review-only preview. Opening this page does not approve or publish the article.</p>
          <Link href="/drafts" className="rounded font-semibold text-[#00734a] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00734a]">Back to all drafts →</Link>
        </footer>
      </div>
    </main>
  );
}
