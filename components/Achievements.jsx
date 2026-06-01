"use client";

import { motion } from "framer-motion";
import { FiAward, FiCalendar, FiMapPin, FiGithub } from "react-icons/fi";
import ScrambledText from "@/components/ScrambledText";
import { achievements } from "@/data/siteContent";

const AchievementCard = ({ achievement, index }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="portfolio-card h-full p-6 md:p-7 xl:p-8"
    >
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-full"
        style={{ backgroundColor: achievement.accent }}
      />

      <div className="relative z-10 flex h-full flex-col gap-6 pl-3">
        <div className="flex items-center justify-between gap-4 border-b border-[rgba(16,24,40,0.08)] pb-4">
          <span
            className="portfolio-chip"
            style={{
              borderColor: `${achievement.accent}3d`,
              backgroundColor: `${achievement.accent}10`,
              color: achievement.accent,
            }}
          >
            <FiAward />
            {achievement.rank}
          </span>

          <span className="flex items-center gap-2 text-sm font-medium text-[var(--portfolio-ink-soft)]">
            <FiCalendar className="text-[var(--portfolio-ink-faint)]" />
            {achievement.year}
          </span>
        </div>

        <div className="space-y-3">
          <p className="portfolio-kicker">
            Recognition Entry {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="portfolio-title text-[2rem] md:text-[2.25rem]">
            {achievement.title}
          </h3>
          <p className="portfolio-body text-sm md:text-base">
            {achievement.summary}
          </p>
        </div>

        <div className="mt-auto flex items-start gap-3 border-t border-[rgba(16,24,40,0.08)] pt-4 text-[var(--portfolio-ink)]">
          <FiMapPin className="mt-1 text-[var(--portfolio-ink-faint)]" />
          <div className="flex-1">
            <p className="portfolio-meta-label mb-2">Organization</p>
            <p className="text-sm font-medium leading-relaxed md:text-base">
              {achievement.organization}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--portfolio-ink-faint)] md:text-[0.78rem]">
              {achievement.type}
            </p>
            {achievement.projectUrl && (
              <a
                href={achievement.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--portfolio-ink-soft)] underline-offset-2 hover:underline"
              >
                <FiGithub className="text-[var(--portfolio-ink-faint)]" />
                View Project
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const Achievements = () => {
  return (
    <section
      id="achievements"
      className="portfolio-section portfolio-paper-stage flex min-h-screen items-start"
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

      <div className="relative z-10 mx-auto -mt-4 w-full max-w-7xl px-4 md:-mt-6 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-10 max-w-3xl text-center md:mb-12"
        >
          <span className="portfolio-kicker">Selected Recognition</span>
          <ScrambledText
            as="h2"
            text="Achievements"
            triggerOnView
            duration={1.05}
            speed={0.7}
            className="portfolio-title mt-4 text-4xl md:text-5xl lg:text-6xl"
          />
          <p className="portfolio-body mx-auto mt-4 max-w-2xl text-base md:text-lg">
            A quieter record of key wins and placements across hackathons and product builds.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {achievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
