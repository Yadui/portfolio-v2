"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// Floating "Blog" button pinned to the top-right. Sits below the intro
// preloader (z-120) so it's revealed as the panel slides up.
export default function BlogButton() {
  return (
    <motion.div
      className="fixed right-4 top-4 z-[110] md:right-6 md:top-6"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
    >
      {/* gentle continuous hover/float */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
      >
        <Link
          href="/blog"
          aria-label="Read the blog"
          className="group flex items-center gap-2 rounded-full border border-white/15 bg-black/80 px-4 py-2.5 text-sm font-medium tracking-wide text-white shadow-[0_12px_34px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors duration-300 hover:border-[#00ff99]/60 hover:bg-black md:px-5 md:py-3"
        >
          <span className="font-primary">Blog</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#00ff99]" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
