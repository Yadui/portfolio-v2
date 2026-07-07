"use client";

import { motion } from "framer-motion";
import { FiArrowLeft, FiBriefcase, FiCalendar, FiTarget, FiTrendingUp, FiCode } from "react-icons/fi";
import Link from "next/link";

const sectionReveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

export default function WorkDetailClient({ work, nextSlug, nextWork }) {
  return (
    <main className="min-h-screen bg-[#fffdf8] pb-16 pt-28 text-[#101828]">
      <div className="container mx-auto max-w-4xl px-4">

        {/* Back Button */}
        <Link href="/#timeline">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group mb-8 flex items-center gap-2 text-[#536074] transition-colors hover:text-[#00805b]"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Back to Timeline
          </motion.button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-xl bg-[#00ff99]/15 p-3 text-3xl text-[#00805b]">
              <FiBriefcase />
            </span>
            <div>
              <h1 className="portfolio-title text-4xl md:text-5xl">
                {work.position}
              </h1>
              <h2 className="mt-1 text-2xl font-light text-[#00805b]">
                {work.company}
              </h2>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 text-[#384455]">
              <FiCalendar className="text-[#00805b]" />
              {work.duration}
            </span>
            <span className="rounded-full border border-[#00b86b]/40 bg-[#00ff99]/15 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-[#00734a]">
              {work.type}
            </span>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 rounded-2xl border border-[#00b86b]/25 bg-gradient-to-br from-[#00ff99]/10 to-white/60 p-6 shadow-[0_18px_60px_rgba(16,24,40,0.07)]"
        >
          <p className="text-lg leading-relaxed text-[#1d2839]">
            {work.summary}
          </p>
        </motion.div>

        {/* Overview */}
        <motion.section {...sectionReveal} className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <FiTarget className="text-xl text-[#00805b]" />
            <h3 className="text-2xl font-light text-[#101828]">Overview</h3>
          </div>
          <p className="text-base leading-relaxed text-[#536074]">
            {work.overview}
          </p>
        </motion.section>

        {/* Key Achievements */}
        <motion.section {...sectionReveal} className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-xl text-[#00805b]" />
            <h3 className="text-2xl font-light text-[#101828]">Key Achievements</h3>
          </div>
          <ul className="space-y-3">
            {work.achievements.map((achievement, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.05, duration: 0.45 }}
                className="flex items-start gap-3"
              >
                <span className="mt-1.5 flex-shrink-0 text-[#00b86b]">✦</span>
                <span className="text-[#536074]">{achievement}</span>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Responsibilities */}
        <motion.section {...sectionReveal} className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <FiBriefcase className="text-xl text-[#00805b]" />
            <h3 className="text-2xl font-light text-[#101828]">Responsibilities</h3>
          </div>
          <ul className="ml-6 list-outside list-disc space-y-2 marker:text-[#00b86b]">
            {work.responsibilities.map((responsibility, index) => (
              <li key={index} className="leading-relaxed text-[#536074]">
                {responsibility}
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Tech Stack */}
        <motion.section {...sectionReveal} className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <FiCode className="text-xl text-[#00805b]" />
            <h3 className="text-2xl font-light text-[#101828]">Tech Stack</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {work.techStack.map((tech, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.03, duration: 0.35 }}
                className="rounded-lg border border-[#101828]/10 bg-white/70 px-4 py-2 text-sm text-[#384455] transition-all hover:border-[#00b86b]/50 hover:bg-[#00ff99]/10"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* Impact Metrics */}
        {work.impact && (
          <motion.section
            {...sectionReveal}
            className="rounded-2xl border border-[#101828]/10 bg-white/80 p-6 shadow-[0_18px_60px_rgba(16,24,40,0.07)]"
          >
            <h3 className="mb-6 text-2xl font-light text-[#101828]">Impact</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Object.entries(work.impact).map(([key, value], index) => (
                <div key={index} className="flex flex-col gap-1">
                  <span className="text-sm font-semibold uppercase tracking-wider text-[#00805b]">
                    {key}
                  </span>
                  <span className="text-lg font-bold text-[#101828]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Next role — keep the journey moving, never dead-end a juror */}
        {nextWork && (
          <motion.section
            {...sectionReveal}
            className="mt-16 border-t border-[#101828]/10 pt-10"
          >
            <span className="portfolio-kicker">Next role</span>
            <Link
              href={`/work/${nextSlug}`}
              className="group mt-3 flex items-baseline justify-between gap-4"
            >
              <span className="portfolio-title text-4xl transition-colors duration-300 group-hover:text-[#00805b] md:text-6xl">
                {nextWork.company}
              </span>
              <span
                aria-hidden="true"
                className="text-3xl text-[#101828]/60 transition-transform duration-300 ease-out group-hover:translate-x-3 group-hover:text-[#00805b] md:text-4xl"
              >
                →
              </span>
            </Link>
            <p className="mt-2 text-sm text-[#536074]">
              {nextWork.position} · {nextWork.duration}
            </p>
          </motion.section>
        )}

      </div>
    </main>
  );
}
