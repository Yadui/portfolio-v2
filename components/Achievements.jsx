"use client";

import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

import Floating, { FloatingElement } from "@/components/fancy/image/parallax-floating";
import EdgeLines from "@/components/EdgeLines";
import RevealText from "@/components/RevealText";
import { achievements, certifications } from "@/data/siteContent";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Rounds computed geometry to a fixed precision.
 *
 * Raw doubles out of Math.sin/cos can serialise to slightly different strings
 * in Node and in the browser (e.g. -105.65509926170148 vs -105.6550992617015).
 * Rendered straight into SVG attributes that difference is a genuine React
 * hydration mismatch, which is what produces the large diff in the terminal.
 * Snapping to 3dp makes both sides emit identical markup.
 */
const snap = (value) => Math.round(value * 1000) / 1000;


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay, ease: EASE },
});

/** Single achievement card */
const AchievementCard = ({ item, delay = 0 }) => {
  const isLink = Boolean(item.projectUrl);
  const Wrapper = isLink ? motion.a : motion.div;
  const linkProps = isLink
    ? { href: item.projectUrl, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...linkProps}
      {...fadeUp(delay)}
      className="group block w-full border border-white/15 bg-[#0b0b0f]/90 p-5 backdrop-blur-sm transition-colors duration-300 hover:bg-[#11111a] md:w-[260px]"
      style={{ borderTop: `2px solid ${item.accent || "rgba(255,255,255,0.15)"}` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/35">
          {item.type} — {item.year}
        </span>
        {isLink && (
          <FiArrowUpRight
            className="shrink-0 text-white/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
            size={13}
          />
        )}
      </div>
      <h3 className="mt-3 font-heading text-base font-light leading-snug tracking-tight text-white">
        {item.title}
      </h3>
      <p className="mt-2 text-[0.7rem] leading-relaxed text-white/45">
        {item.summary}
      </p>
      <span
        className="mt-3 flex items-center gap-2 font-heading text-lg font-light text-white"
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: item.accent }}
        />
        {item.rank}
      </span>
      <p className="mt-0.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/35">
        {item.organization}
      </p>
    </Wrapper>
  );
};

/** Certifications card */
const CertCard = ({ delay = 0 }) => (
  <motion.div
    {...fadeUp(delay)}
    className="w-full border border-white/15 bg-[#0b0b0f]/90 p-5 backdrop-blur-sm md:w-[220px]"
  >
    <p className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-white/35">
      Certifications ×{certifications.length}
    </p>
    <ul className="mt-4 flex flex-col gap-3">
      {certifications.map((cert) => (
        <li key={cert.code} className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-heading text-base font-light tracking-tight text-white">
              {cert.code}
            </p>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/40">
              {cert.brand} — {cert.name}
            </p>
          </div>
          {/* Star rating — filled up to cert.stars (out of 3) */}
          <span
            className="mt-0.5 flex shrink-0 items-center gap-0.5"
            aria-label={`${cert.stars ?? 0} out of 3`}
          >
            {[1, 2, 3].map((s) => (
              <FaStar
                key={s}
                size={10}
                className={s <= (cert.stars ?? 0) ? "text-amber-400" : "text-white/15"}
              />
            ))}
          </span>
        </li>
      ))}
    </ul>
  </motion.div>
);

const Achievements = () => {
  const [first, second, third] = achievements;

  return (
    <section
      id="achievements"
      className="relative flex items-center justify-center overflow-clip bg-black py-20 text-white md:min-h-screen md:py-0"
    >
      <EdgeLines />

      {/* ── Desktop / tablet: floating parallax layer (md and up) ── */}
      <div className="hidden md:block">
        <Floating sensitivity={0.8} easingFactor={0.04}>
          {/* Left-top — achievement 1 */}
          <FloatingElement depth={1.2} className="top-1/2 left-1/2" style={{ translate: "-520px -280px" }}>
            <AchievementCard item={first} delay={0.05} />
          </FloatingElement>

          {/* Right-top — achievement 2 */}
          <FloatingElement depth={0.7} className="top-1/2 left-1/2" style={{ translate: "260px -260px" }}>
            <AchievementCard item={second} delay={0.12} />
          </FloatingElement>

          {/* Left-bottom — achievement 3 */}
          <FloatingElement depth={1.6} className="top-1/2 left-1/2" style={{ translate: "-500px 120px" }}>
            <AchievementCard item={third} delay={0.18} />
          </FloatingElement>

          {/* Right-bottom — certifications */}
          <FloatingElement depth={0.9} className="top-1/2 left-1/2" style={{ translate: "280px 120px" }}>
            <CertCard delay={0.22} />
          </FloatingElement>
        </Floating>
      </div>

      {/* ── Centered title ── */}
      <div className="relative z-10 flex w-full flex-col items-center px-5 text-center md:px-4">
        {/* Micrographic radial emblem — award-seal geometry behind the title */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          width="320" height="320" viewBox="-160 -160 320 320"
          style={{ opacity: 0.055 }}
        >
          {/* Outer ring */}
          <circle cx="0" cy="0" r="148" fill="none" stroke="white" strokeWidth="0.75" />
          {/* Inner ring */}
          <circle cx="0" cy="0" r="120" fill="none" stroke="white" strokeWidth="0.5" />
          {/* Dashed mid ring */}
          <circle cx="0" cy="0" r="134" fill="none" stroke="white" strokeWidth="0.4" strokeDasharray="4 6" />
          {/* 12 radial spokes */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={snap(Math.cos(angle) * 122)}
                y1={snap(Math.sin(angle) * 122)}
                x2={snap(Math.cos(angle) * 146)}
                y2={snap(Math.sin(angle) * 146)}
                stroke="white"
                strokeWidth="0.75"
              />
            );
          })}
          {/* 6 long diagonal cross-lines */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={snap(Math.cos(angle) * -118)}
                y1={snap(Math.sin(angle) * -118)}
                x2={snap(Math.cos(angle) * 118)}
                y2={snap(Math.sin(angle) * 118)}
                stroke="white"
                strokeWidth="0.3"
              />
            );
          })}
          {/* Center dot */}
          <circle cx="0" cy="0" r="3" fill="white" />
          <circle cx="0" cy="0" r="8" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>

        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40"
        >
          Selected Recognition
        </motion.span>
        <RevealText
          as="h2"
          className="portfolio-title mt-3 text-5xl uppercase text-white md:text-6xl xl:text-7xl"
        >
          Achievements
        </RevealText>

        {/* ── Mobile: simple stacked cards (below md) ── */}
        <div className="mt-10 flex w-full max-w-sm flex-col gap-4 text-left md:hidden">
          <AchievementCard item={first} delay={0.05} />
          <AchievementCard item={second} delay={0.1} />
          <AchievementCard item={third} delay={0.15} />
          <CertCard delay={0.2} />
        </div>
      </div>
    </section>
  );
};

export default Achievements;
