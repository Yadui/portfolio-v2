"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// "Hello" across a few languages — ends on Hindi.
const words = ["Hello", "Bonjour", "Ciao", "Hola", "こんにちは", "नमस्ते"];

// The whole panel slides up off the top of the viewport on exit,
// revealing the Projects section underneath — quick bring-up.
const slideUp = {
  initial: { y: 0 },
  exit: {
    y: "-100vh",
    transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: 0.08 },
  },
};

export default function Preloader({ onComplete }) {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const completedRef = useRef(false);

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // Cycle through the greetings, then signal completion after a short hold.
  useEffect(() => {
    if (index === words.length - 1) {
      if (completedRef.current) return undefined;
      completedRef.current = true;
      const timeout = setTimeout(() => onComplete?.(), 150);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(
      () => setIndex((prev) => prev + 1),
      index === 0 ? 1000 : 180
    );
    return () => clearTimeout(timeout);
  }, [index, onComplete]);

  // Curved bottom edge: bulges below the viewport while loading, then
  // flattens as the panel slides up for a smooth liquid reveal.
  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height} L0 0`;
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`;

  const curve = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1], delay: 0.12 },
    },
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      exit="exit"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-white"
    >
      {/* Curve needs measured dimensions; it only matters for the exit reveal */}
      {dimension.width > 0 && (
        <svg className="absolute top-0 left-0 h-[calc(100%+300px)] w-full">
          <motion.path
            variants={curve}
            initial="initial"
            exit="exit"
            fill="#ffffff"
          />
        </svg>
      )}

      {/* Greeting — blank white first, then "Hello" fades in ~0.5s after page
          load (element persists, so later words swap instantly with no fade) */}
      <div className="relative z-[1] flex h-[clamp(110px,18vh,180px)] w-full items-center justify-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.5, ease: "easeOut" }}
          className="font-heading text-[clamp(2rem,6vw,3.5rem)] font-light leading-none tracking-tight text-black"
        >
          {words[index]}
        </motion.span>
      </div>
    </motion.div>
  );
}
