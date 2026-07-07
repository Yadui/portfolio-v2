"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Greetings — each with a language label. Ends on Hindi.
const words = [
  { text: "Hello",      lang: "EN" },
  { text: "Bonjour",    lang: "FR" },
  { text: "Ciao",       lang: "IT" },
  { text: "Hola",       lang: "ES" },
  { text: "こんにちは",  lang: "JA" },
  { text: "नमस्ते",     lang: "HI" },
];

// Timing per word (ms)
const HOLD_FIRST = 900;   // "Hello" holds longer
const HOLD_REST  = 320;   // others cycle faster but readable

// Panel slides up off the top to reveal the page underneath
const slideUp = {
  initial: { y: 0 },
  exit: {
    y: "-100vh",
    transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1], delay: 0.05 },
  },
};

export default function Preloader({ onComplete }) {
  const [index, setIndex]       = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const completedRef            = useRef(false);

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // Cycle through words, then fire onComplete after the last one holds briefly
  useEffect(() => {
    if (index === words.length - 1) {
      if (completedRef.current) return undefined;
      completedRef.current = true;
      const t = setTimeout(() => onComplete?.(), 280);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => setIndex((p) => p + 1),
      index === 0 ? HOLD_FIRST : HOLD_REST
    );
    return () => clearTimeout(t);
  }, [index, onComplete]);

  // Curved bottom edge on the sliding panel — bulges then flattens on exit
  const initialPath = dimension.width > 0
    ? `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height} L0 0`
    : "";
  const targetPath = dimension.width > 0
    ? `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`
    : "";

  const curve = {
    initial: { d: initialPath },
    exit: {
      d: targetPath,
      transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1], delay: 0.1 },
    },
  };

  const progress = (index + 1) / words.length; // 0→1

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      exit="exit"
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black"
    >
      {/* Curved exit mask */}
      {dimension.width > 0 && (
        <svg className="pointer-events-none absolute top-0 left-0 h-[calc(100%+300px)] w-full">
          <motion.path variants={curve} initial="initial" exit="exit" fill="#000000" />
        </svg>
      )}

      {/* ── Center stage ── */}
      <div className="relative z-[1] flex w-full flex-col items-center gap-6 px-6">

        {/* Word — each one slides up in and out */}
        <div className="relative flex h-[clamp(56px,10vh,100px)] w-full items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ y: "60%", opacity: 0, filter: "blur(6px)" }}
              animate={{ y: "0%",  opacity: 1, filter: "blur(0px)" }}
              exit={{    y: "-50%", opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute font-heading text-[clamp(2.2rem,7vw,4.5rem)] font-light leading-none tracking-tight text-white"
            >
              {words[index].text}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Language label */}
        <AnimatePresence mode="wait">
          <motion.span
            key={`lang-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="font-body text-[0.6rem] font-bold uppercase tracking-[0.32em] text-white/30"
          >
            {words[index].lang}
          </motion.span>
        </AnimatePresence>

        {/* Progress line */}
        <div className="relative h-px w-[clamp(80px,12vw,140px)] overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="absolute inset-y-0 left-0 bg-[#00ff99]"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          />
        </div>

      </div>

      {/* Corner index counter */}
      <div className="absolute bottom-8 right-8 z-[1]">
        <AnimatePresence mode="wait">
          <motion.span
            key={`count-${index}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="font-body text-[0.6rem] font-bold tabular-nums tracking-[0.2em] text-white/20"
          >
            {String(index + 1).padStart(2, "0")} / {String(words.length).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
