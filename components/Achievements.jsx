"use client";

import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

import Floating, { FloatingElement } from "@/components/fancy/image/parallax-floating";
import EdgeLines from "@/components/EdgeLines";
import RevealText from "@/components/RevealText";
import { achievements, certifications } from "@/data/siteContent";

const EASE = [0.22, 1, 0.36, 1];

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
      className="group block w-[260px] border border-white/15 bg-[#0b0b0f]/90 p-5 backdrop-blur-sm transition-colors duration-300 hover:bg-[#11111a]"
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
    className="w-[220px] border border-white/15 bg-[#0b0b0f]/90 p-5 backdrop-blur-sm"
  >
    <p className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-white/35">
      Certifications ×{certifications.length}
    </p>
    <ul className="mt-4 flex flex-col gap-2.5">
      {certifications.map((cert) => (
        <li key={cert.code}>
          <p className="font-heading text-base font-light tracking-tight text-white">
            {cert.code}
          </p>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/40">
            {cert.brand} — {cert.name}
          </p>
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
      className="relative flex min-h-screen items-center justify-center overflow-clip bg-black text-white"
    >
      <EdgeLines />

      {/* Floating parallax layer — absolutely fills the section */}
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

      {/* Centered title — sits above the floating layer */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
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
      </div>
    </section>
  );
};

export default Achievements;
