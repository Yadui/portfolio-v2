"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import Link from "next/link";

import Floating, { FloatingElement } from "@/components/fancy/image/parallax-floating";
import WorkDetailModal from "./WorkDetailModal";
import RevealText from "@/components/RevealText";
import { workDetails } from "@/data/workDetails";
import { experience, education } from "@/data/siteContent";

const EASE = [0.22, 1, 0.36, 1];
const PATH_COLOR = "#ff2d2d";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay, ease: EASE },
});

/** A single journey stop card */
const JourneyCard = ({ item, index, onOpenModal, delay = 0 }) => {
  const isWork = Boolean(item.slug);
  const skills = item.skills ? item.skills.split(", ").slice(0, 4) : [];

  const inner = (
    <motion.div
      {...fadeUp(delay)}
      className="group w-[260px] border border-white/15 bg-[#0b0b0f]/90 p-5 backdrop-blur-sm transition-colors duration-300 hover:bg-[#11111a]"
    >
      <div className="flex items-baseline gap-2">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 translate-y-px rounded-full"
          style={{ backgroundColor: PATH_COLOR }}
        />
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/35">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white/35">
          {item.type} — {item.duration}
        </span>
      </div>

      <h3 className="mt-3 font-heading text-base font-light leading-snug tracking-tight text-white">
        {item.position || item.degree}
      </h3>
      <p className="mt-1 text-xs font-semibold tracking-[-0.01em] text-white/70">
        {item.company || item.institution}
      </p>
      <p className="mt-2 text-[0.7rem] leading-relaxed text-white/45">
        {item.description}
      </p>

      {skills.length > 0 && (
        <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/30">
          {skills.join(" · ")}
        </p>
      )}

      {isWork && (
        <span className="mt-3 flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/35 transition-colors duration-300 group-hover:text-white">
          Case study
          <FiArrowUpRight
            className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            size={11}
          />
        </span>
      )}
    </motion.div>
  );

  if (!isWork) return inner;

  return (
    <Link
      href={`/work/${item.slug}`}
      className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00ff99]"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
        e.preventDefault();
        onOpenModal(item.slug);
      }}
    >
      {inner}
    </Link>
  );
};

// Fixed positions: all anchored at center, offset via inline style translate
const CARD_POSITIONS = [
  { depth: 1.2, style: { translate: "-520px -270px" } }, // left-top
  { depth: 0.7, style: { translate:  "260px -250px" } }, // right-top
  { depth: 1.5, style: { translate: "-510px  120px" } }, // left-bottom
  { depth: 0.9, style: { translate:  "270px  120px" } }, // right-bottom
];

const Timeline = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);

  const handleOpenModal = (slug) => {
    const work = workDetails[slug];
    if (work) { setSelectedWork(work); setIsModalOpen(true); }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedWork(null), 300);
  };

  const stops = [...experience, ...education];

  return (
    <>
      <section
        id="timeline"
        className="relative flex min-h-screen items-center justify-center overflow-clip bg-black text-white"
      >
        {/* Floating parallax layer */}
        <Floating sensitivity={0.8} easingFactor={0.04}>
          {stops.map((item, i) => {
            const pos = CARD_POSITIONS[i] ?? CARD_POSITIONS[i % CARD_POSITIONS.length];
            return (
              <FloatingElement
                key={item.slug ?? `stop-${i}`}
                depth={pos.depth}
                className="top-1/2 left-1/2"
                style={pos.style}
              >
                <JourneyCard
                  item={item}
                  index={i}
                  onOpenModal={handleOpenModal}
                  delay={0.06 * i}
                />
              </FloatingElement>
            );
          })}
        </Floating>

        {/* Centered title */}
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40"
          >
            Experience &amp; Education
          </motion.span>
          <RevealText
            as="h2"
            className="portfolio-title mt-3 text-5xl uppercase text-white md:text-6xl xl:text-7xl"
          >
            My Journey
          </RevealText>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
            className="mt-4 max-w-xs text-sm leading-relaxed text-white/50"
          >
            Three roles and a degree — how I got from classroom algorithms to
            shipping cloud and AI systems in production.
          </motion.p>
        </div>
      </section>

      <WorkDetailModal
        work={selectedWork}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default Timeline;
