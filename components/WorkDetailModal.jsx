"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTarget, FiTrendingUp, FiBriefcase, FiCode, FiCalendar } from "react-icons/fi";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function WorkDetailModal({ work, isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!work || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden pointer-events-auto shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 p-6 z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl text-accent bg-accent/10 p-3 rounded-xl">
                      <FiBriefcase />
                    </span>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-light text-white">
                        {work.position}
                      </h2>
                      <h3 className="text-xl text-accent font-light">
                        {work.company}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className="flex items-center gap-2 text-white/80 text-sm">
                    <FiCalendar className="text-accent" />
                    {work.duration}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/30">
                    {work.type}
                  </span>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6 space-y-8">
                
                {/* Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-accent/5 to-transparent border border-accent/20 rounded-xl p-5"
                >
                  <p className="text-white/90 leading-relaxed">
                    {work.summary}
                  </p>
                </motion.div>

                {/* Overview */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FiTarget className="text-accent text-lg" />
                    <h4 className="text-xl font-light text-white">Overview</h4>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    {work.overview}
                  </p>
                </motion.section>

                {/* Key Achievements */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FiTrendingUp className="text-accent text-lg" />
                    <h4 className="text-xl font-light text-white">Key Achievements</h4>
                  </div>
                  <ul className="space-y-2">
                    {work.achievements.map((achievement, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.03 }}
                        className="flex gap-3 items-start"
                      >
                        <span className="text-accent mt-1.5 flex-shrink-0">✦</span>
                        <span className="text-white/70 leading-relaxed">{achievement}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.section>

                {/* Responsibilities */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FiBriefcase className="text-accent text-lg" />
                    <h4 className="text-xl font-light text-white">Responsibilities</h4>
                  </div>
                  <ul className="list-disc list-outside ml-5 space-y-2">
                    {work.responsibilities.map((responsibility, index) => (
                      <li key={index} className="text-white/60 leading-relaxed">
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </motion.section>

                {/* Tech Stack */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FiCode className="text-accent text-lg" />
                    <h4 className="text-xl font-light text-white">Tech Stack</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {work.techStack.map((tech, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.02 }}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm hover:border-accent/50 hover:bg-accent/5 transition-all"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </motion.section>

                {/* Impact Metrics */}
                {work.impact && (
                  <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-[#18181b] border border-white/10 rounded-xl p-5"
                  >
                    <h4 className="text-xl font-light text-white mb-4">Impact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(work.impact).map(([key, value], index) => (
                        <div key={index} className="flex flex-col gap-1">
                          <span className="text-accent text-xs uppercase tracking-wider font-semibold">
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
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
