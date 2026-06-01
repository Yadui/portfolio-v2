import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050816] flex flex-col items-center justify-center px-6 text-center">
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(0,255,153,0.07) 0%, transparent 70%)",
        }}
      />

      <p className="text-[#00ff99] font-mono text-sm uppercase tracking-[0.2em] mb-4">
        404 — Page not found
      </p>

      <h1 className="text-[8rem] md:text-[12rem] font-extrabold text-white/5 leading-none select-none">
        404
      </h1>

      <div className="-mt-8 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Lost in the void
        </h2>
        <p className="text-white/40 max-w-sm mx-auto text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-3 bg-[#00ff99] text-black font-bold text-sm rounded-xl hover:bg-[#00e68a] transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/blog"
          className="px-6 py-3 border border-white/15 text-white/70 font-medium text-sm rounded-xl hover:border-white/30 hover:text-white transition-colors"
        >
          Read the Blog
        </Link>
        <Link
          href="/work"
          className="px-6 py-3 border border-white/15 text-white/70 font-medium text-sm rounded-xl hover:border-white/30 hover:text-white transition-colors"
        >
          View Projects
        </Link>
      </div>
    </main>
  );
}
