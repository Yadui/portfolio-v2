"use client";

import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiBriefcase, FiCalendar, FiTarget, FiTrendingUp, FiCode } from "react-icons/fi";
import Link from "next/link";
import { workDetails } from "@/data/workDetails";

export default function WorkDetailPage({ params }) {
  const companyKey = params.company;
  const work = workDetails[companyKey];

  if (!work) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Back Button */}
        <Link href="/#timeline">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-white/60 hover:text-accent transition-colors mb-8 group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
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
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl text-accent bg-accent/10 p-3 rounded-xl">
              <FiBriefcase />
            </span>
            <div>
              <h1 className="text-4xl md:text-5xl font-light text-white">
                {work.position}
              </h1>
              <h2 className="text-2xl text-accent font-light mt-1">
                {work.company}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <span className="flex items-center gap-2 text-white/80">
              <FiCalendar className="text-accent" />
              {work.duration}
            </span>
            <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/30">
              {work.type}
            </span>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-accent/5 to-transparent border border-accent/20 rounded-2xl p-6 mb-12"
        >
          <p className="text-white/90 text-lg leading-relaxed">
            {work.summary}
          </p>
        </motion.div>

        {/* Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiTarget className="text-accent text-xl" />
            <h3 className="text-2xl font-light text-white">Overview</h3>
          </div>
          <p className="text-white/70 text-base leading-relaxed">
            {work.overview}
          </p>
        </motion.section>

        {/* Key Achievements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="text-accent text-xl" />
            <h3 className="text-2xl font-light text-white">Key Achievements</h3>
          </div>
          <ul className="space-y-3">
            {work.achievements.map((achievement, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex gap-3 items-start"
              >
                <span className="text-accent mt-1.5 flex-shrink-0">✦</span>
                <span className="text-white/70">{achievement}</span>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Responsibilities */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiBriefcase className="text-accent text-xl" />
            <h3 className="text-2xl font-light text-white">Responsibilities</h3>
          </div>
          <ul className="list-disc list-outside ml-6 space-y-2">
            {work.responsibilities.map((responsibility, index) => (
              <li key={index} className="text-white/60 leading-relaxed">
                {responsibility}
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiCode className="text-accent text-xl" />
            <h3 className="text-2xl font-light text-white">Tech Stack</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {work.techStack.map((tech, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.03 }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm hover:border-accent/50 hover:bg-accent/5 transition-all"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* Impact Metrics */}
        {work.impact && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-[#18181b] border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-2xl font-light text-white mb-6">Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(work.impact).map(([key, value], index) => (
                <div key={index} className="flex flex-col gap-1">
                  <span className="text-accent text-sm uppercase tracking-wider font-semibold">
                    {key}
                  </span>
                  <span className="text-white text-lg font-bold">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

      </div>
    </main>
  );
}
