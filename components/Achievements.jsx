"use client";

import { motion } from "framer-motion";
import { FiAward, FiCalendar, FiMapPin, FiGithub, FiLinkedin } from "react-icons/fi";
import { FaGithub, FaStar } from "react-icons/fa";
import ScrambledText from "@/components/ScrambledText";
import { achievements, certifications } from "@/data/siteContent";

const AchievementCard = ({ achievement, index }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="portfolio-card p-3.5 md:p-4"
    >
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-full"
        style={{ backgroundColor: achievement.accent }}
      />

      <div className="relative z-10 flex h-full flex-col gap-3 pl-3">
        <div className="flex items-center justify-between gap-3 border-b border-[rgba(16,24,40,0.08)] pb-2.5">
          <span
            className="portfolio-chip !px-3 !py-1.5 !text-[0.62rem]"
            style={{
              borderColor: `${achievement.accent}3d`,
              backgroundColor: `${achievement.accent}10`,
              color: achievement.accent,
            }}
          >
            <FiAward />
            {achievement.rank}
          </span>

          <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--portfolio-ink-soft)]">
            <FiCalendar className="text-[var(--portfolio-ink-faint)]" />
            {achievement.year}
          </span>
        </div>

        <div className="space-y-1.5">
          <p className="portfolio-kicker !text-[0.62rem]">
            Recognition Entry {String(index + 1).padStart(2, "0")}
          </p>
          <h3
            className="portfolio-title"
            style={{ fontSize: "clamp(1.1rem, 1.7vw, 1.5rem)" }}
          >
            {achievement.title}
          </h3>
          <p className="portfolio-body line-clamp-3 text-xs md:text-sm">
            {achievement.summary}
          </p>
        </div>

        <div className="mt-auto flex items-start gap-2.5 border-t border-[rgba(16,24,40,0.08)] pt-2.5 text-[var(--portfolio-ink)]">
          <FiMapPin className="mt-0.5 text-[var(--portfolio-ink-faint)]" />
          <div className="flex-1">
            <p className="portfolio-meta-label mb-1 !text-[0.62rem]">Organization</p>
            <p className="text-xs font-medium leading-relaxed md:text-sm">
              {achievement.organization}
            </p>
            <p className="mt-0.5 text-[0.66rem] font-medium uppercase tracking-[0.18em] text-[var(--portfolio-ink-faint)]">
              {achievement.type}
            </p>
            {achievement.projectUrl && (
              <a
                href={achievement.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--portfolio-ink-soft)] underline-offset-2 hover:underline"
              >
                {achievement.projectUrl.includes("linkedin.com") ? (
                  <FiLinkedin className="text-[var(--portfolio-ink-faint)]" />
                ) : (
                  <FiGithub className="text-[var(--portfolio-ink-faint)]" />
                )}
                {achievement.projectUrl.includes("linkedin.com") ? "View Post" : "View Project"}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const BrandLogo = ({ brand }) => {
  if (brand === "GitHub") {
    return <FaGithub className="text-lg text-[#1f2328]" aria-hidden />;
  }
  // Microsoft four-square mark.
  return (
    <span className="grid grid-cols-2 gap-[2px]" aria-hidden>
      <span className="block h-2 w-2" style={{ backgroundColor: "#F25022" }} />
      <span className="block h-2 w-2" style={{ backgroundColor: "#7FBA00" }} />
      <span className="block h-2 w-2" style={{ backgroundColor: "#00A4EF" }} />
      <span className="block h-2 w-2" style={{ backgroundColor: "#FFB900" }} />
    </span>
  );
};

const CertCard = ({ cert, index }) => {
  const Wrapper = cert.url ? motion.a : motion.article;
  const linkProps = cert.url
    ? { href: cert.url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...linkProps}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.45,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="portfolio-card block !rounded-2xl p-0"
    >
      {/* Top accent bar (brand / tier colour). */}
      <span
        className="block h-1.5 w-full"
        style={{ backgroundColor: cert.accent }}
      />
      <div className="p-3 md:p-3.5">
        <div className="flex items-center justify-between">
          <BrandLogo brand={cert.brand} />
          <span className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[var(--portfolio-ink-faint)]">
            {cert.brand}
          </span>
        </div>

        <h4 className="mt-2.5 text-lg font-light leading-none tracking-tight text-black md:text-xl">
          {cert.code}
        </h4>
        <p className="mt-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[var(--portfolio-ink-soft)]">
          {cert.name}
        </p>

        <div className="mt-2.5 flex items-center gap-1.5">
          {cert.badge ? (
            <span className="inline-flex items-center rounded border border-black/15 px-1.5 py-0.5 text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[var(--portfolio-ink-soft)]">
              {cert.badge}
            </span>
          ) : (
            [1, 2, 3].map((s) => (
              <FaStar
                key={s}
                size={12}
                className={s <= (cert.stars || 0) ? "text-amber-400" : "text-black/15"}
              />
            ))
          )}
        </div>
      </div>
    </Wrapper>
  );
};

const Achievements = () => {
  return (
    <section
      id="achievements"
      className="portfolio-section portfolio-paper-stage flex min-h-screen flex-col justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,24,40,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.04) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.28), transparent 88%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-5 max-w-3xl flex-shrink-0 text-center md:mb-6"
        >
          <span className="portfolio-kicker">Selected Recognition</span>
          <ScrambledText
            as="h2"
            text="Achievements"
            triggerOnView
            duration={1.05}
            speed={0.7}
            className="portfolio-title mt-3"
            style={{ fontSize: "clamp(1.75rem, 3.6vw, 3.25rem)" }}
          />
          <p className="portfolio-body mx-auto mt-3 max-w-2xl text-sm md:text-base">
            A quieter record of key wins and placements across hackathons and product builds.
          </p>
        </motion.div>

        <div className="grid gap-3 md:grid-cols-3">
          {achievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={index}
            />
          ))}
        </div>

        {/* Certifications */}
        <div className="mt-8 md:mt-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 flex items-center gap-4"
          >
            <span className="portfolio-kicker whitespace-nowrap">Certifications</span>
            <span className="h-px flex-1 bg-[rgba(16,24,40,0.12)]" />
            <span className="text-xs font-bold tracking-[0.1em] text-[var(--portfolio-ink-faint)]">
              ×{certifications.length}
            </span>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {certifications.map((cert, index) => (
              <CertCard key={cert.code} cert={cert} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Achievements;
