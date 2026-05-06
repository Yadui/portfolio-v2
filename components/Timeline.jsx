"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FiArrowUpRight,
  FiAward,
  FiBriefcase,
  FiCalendar,
} from "react-icons/fi";
import WorkDetailModal from "./WorkDetailModal";
import { workDetails } from "@/data/workDetails";
import ScrambledText from "@/components/ScrambledText";

const experience = [
  {
    company: "Foetron",
    slug: "foetron",
    position: "Cloud and AI Engineer",
    duration: "Sep 2024 - Present",
    type: "Full-Time",
    description: "Cloud & AI Engineer — architected Azure infrastructure, built AI pipelines, and led hybrid-cloud deployments.",
    skills: "Microsoft Azure, Azure OpenAI, Azure Cognitive Services, Data Engineering, SQL Server, Sophos Firewall"
  },
  {
    company: "Outlier",
    slug: "outlier",
    position: "Prompt Engineer",
    duration: "Jun 2024 - Present",
    type: "Freelance",
    description: "Prompt Engineer — designed multi-modal AI prompts for Google Genesis project (VTT, ATT, ITT).",
    skills: "Prompt Engineering, Prompt Design, Multi-modal AI, NLP, Conversational AI, Machine Learning"
  },
  {
    company: "Vm Coders",
    slug: "vmcoders",
    position: "Frontend Developer",
    duration: "Jan 2024 - Jun 2024",
    type: "Internship",
    description: "Frontend Developer — built marketing websites with React, TailwindCSS, and Figma designs.",
    skills: "ReactJS, TailwindCSS, Figma, Web Design, SEO, Responsive Design, JavaScript"
  },
];

const education = [
  {
    institution: "JC Bose University, YMCA",
    degree: "Computer Engineering",
    duration: "2020 - 2024",
    type: "Degree",
    description: "Focused on software engineering, algorithms, and system design.",
  },
];

const timelineStats = [
  {
    value: `${experience.length}`.padStart(2, "0"),
    label: "roles shipped",
  },
  {
    value: `${education.length}`.padStart(2, "0"),
    label: "degrees listed",
  },
  {
    value: "2024",
    label: "career pivot",
  },
];

const TimelineLabel = ({ title, containerRef, scrollYProgress, className = "" }) => {
  const labelRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const calculateThreshold = () => {
      if (!labelRef.current || !containerRef.current) return 0;
      const labelRect = labelRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate position relative to container top
      const relativeTop = labelRect.top - containerRect.top;
      // Trigger when line reaches the center of the label
      const threshold = (relativeTop + labelRect.height / 2) / containerRect.height;
      return threshold;
    };

    let threshold = calculateThreshold();

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (typeof threshold === "number") {
        setIsActive(latest >= threshold);
      }
    });

    const handleResize = () => {
      threshold = calculateThreshold();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [containerRef, scrollYProgress]);

  return (
    <div ref={labelRef} className={`relative z-20 pl-16 md:pl-20 ${className}`}>
      <motion.div
        animate={{
          scale: isActive ? 1.02 : 1,
          y: isActive ? 0 : 2,
          borderColor: isActive
            ? "rgba(0,255,153,0.28)"
            : "rgba(16,24,40,0.1)",
          backgroundColor: isActive
            ? "rgba(255,255,255,0.86)"
            : "rgba(255,255,255,0.68)",
          boxShadow: isActive
            ? "0 22px 60px rgba(16,24,40,0.12)"
            : "0 14px 38px rgba(16,24,40,0.08)",
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex items-center gap-3 rounded-full border px-4 py-2.5 md:px-5"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--portfolio-accent)]" />
        <span className="portfolio-kicker !text-[var(--portfolio-ink)]">
          {title}
        </span>
      </motion.div>
    </div>
  );
};

const TimelineItem = ({ item, index, icon, containerRef, scrollYProgress, onOpenModal }) => {
  const itemRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const calculateThreshold = () => {
      if (!itemRef.current || !containerRef.current) return 0;
      const itemRect = itemRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const relativeTop = itemRect.top - containerRect.top;
      const threshold = (relativeTop + itemRect.height / 2) / containerRect.height;
      return threshold;
    };

    let threshold = calculateThreshold();

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (typeof threshold === "number") {
        setIsActive(latest >= threshold);
      }
    });

    const handleResize = () => {
      threshold = calculateThreshold();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [containerRef, scrollYProgress]);

  const skillList = item.skills ? item.skills.split(", ") : [];

  return (
    <div ref={itemRef} className="relative pb-8 pl-16 md:pl-20">
      <motion.div
        animate={{
          scale: isActive ? 1.04 : 1,
          boxShadow: isActive
            ? "0 0 0 10px rgba(0,255,153,0.08)"
            : "0 0 0 0 rgba(0,255,153,0)",
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 top-9 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(16,24,40,0.12)] bg-white/90 text-[var(--portfolio-accent)] shadow-[0_16px_36px_rgba(16,24,40,0.1)]"
      >
        {icon}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.58, delay: Math.min(index * 0.06, 0.24), ease: [0.22, 1, 0.36, 1] }}
      >
        <article className="portfolio-card p-6 md:p-7 xl:p-8">
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100" />

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="portfolio-chip !bg-[var(--portfolio-accent-soft)] !text-[var(--portfolio-accent)] !border-[rgba(0,255,153,0.24)]">
                    {item.type}
                  </span>
                  <span className="portfolio-chip">
                    <FiCalendar className="text-[var(--portfolio-ink-faint)]" />
                    {item.duration}
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="portfolio-kicker">
                    {item.company ? "Career Entry" : "Education Entry"} {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="portfolio-title text-3xl md:text-[2.35rem]">
                    {item.position || item.degree}
                  </h3>
                  <p className="text-base font-semibold tracking-[-0.02em] text-[var(--portfolio-ink)] md:text-lg">
                    {item.company || item.institution}
                  </p>
                </div>
              </div>

              {item.slug ? (
                <button
                  onClick={() => onOpenModal(item.slug)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--portfolio-line)] bg-white/80 px-4 py-2 text-sm font-semibold tracking-[0.08em] text-[var(--portfolio-ink)] transition-colors hover:border-[rgba(0,255,153,0.24)] hover:text-[var(--portfolio-accent)]"
                >
                  View full work
                  <FiArrowUpRight className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                </button>
              ) : null}
            </div>

            <p className="portfolio-body max-w-2xl text-sm md:text-base">
              {item.description}
            </p>

            {skillList.length > 0 ? (
              <div className="flex flex-wrap gap-2.5 border-t border-[rgba(16,24,40,0.08)] pt-4">
                {skillList.map((skill) => (
                  <span
                    key={skill}
                    className="portfolio-chip !bg-white/84 !px-3 !py-2 !text-[0.64rem] !tracking-[0.18em]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      </motion.div>
    </div>
  );
};

const Timeline = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);

  const handleOpenModal = (slug) => {
    const work = workDetails[slug];
    if (work) {
      setSelectedWork(work);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedWork(null), 300); // Clear after animation
  };

  return (
    <>
      <section id="timeline" className="portfolio-section portfolio-paper-stage">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage:
              "linear-gradient(rgba(16,24,40,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.04) 1px, transparent 1px)",
            backgroundSize: "92px 92px",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,0.42), transparent 100%)",
          }} />
          <div className="absolute left-[8%] top-20 h-52 w-52 rounded-full bg-[var(--portfolio-accent-soft)] blur-3xl" />
          <div className="absolute right-[10%] top-28 h-56 w-56 rounded-full bg-[var(--portfolio-sun-soft)] blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="portfolio-shell p-8 md:p-10 xl:sticky xl:top-24"
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-[var(--portfolio-line)] bg-white/72 px-4 py-2.5">
                <span className="text-xl">↳</span>
                <span className="portfolio-kicker !text-[var(--portfolio-ink)]">Career Ledger</span>
              </div>

              <ScrambledText
                as="h2"
                text="My Journey"
                triggerOnView
                duration={1.05}
                speed={0.7}
                className="portfolio-title mt-6 text-4xl md:text-5xl xl:text-6xl"
              />
              <p className="portfolio-body mt-5 max-w-xl text-base md:text-lg">
                Experience and education translated into a cleaner desktop rail: less dead space, stronger hierarchy, and direct access to the work details that matter.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                {timelineStats.map((item) => (
                  <div key={item.label} className="portfolio-metric">
                    <p className="text-3xl font-semibold tracking-[-0.06em] text-[var(--portfolio-ink)] md:text-4xl">
                      {item.value}
                    </p>
                    <p className="portfolio-meta-label mt-2">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div ref={containerRef} className="relative">
              <div className="absolute bottom-0 left-5 top-0 hidden w-px bg-[rgba(16,24,40,0.08)] md:block" />
              <motion.div
                style={{ height: lineHeight }}
                className="absolute left-5 top-0 hidden w-px bg-[linear-gradient(180deg,var(--portfolio-accent),rgba(0,255,153,0.18))] md:block"
              />

              <div className="space-y-10 pb-4 md:space-y-12">
                <TimelineLabel
                  title="Experience"
                  containerRef={containerRef}
                  scrollYProgress={scrollYProgress}
                  className="pt-2"
                />

                <div className="space-y-1">
                  {experience.map((item, index) => (
                    <TimelineItem
                      key={`exp-${index}`}
                      item={item}
                      index={index}
                      icon={<FiBriefcase />}
                      containerRef={containerRef}
                      scrollYProgress={scrollYProgress}
                      onOpenModal={handleOpenModal}
                    />
                  ))}
                </div>

                <TimelineLabel
                  title="Education"
                  containerRef={containerRef}
                  scrollYProgress={scrollYProgress}
                  className="pt-4"
                />

                <div className="space-y-1">
                  {education.map((item, index) => (
                    <TimelineItem
                      key={`edu-${index}`}
                      item={item}
                      index={index + experience.length}
                      icon={<FiAward />}
                      containerRef={containerRef}
                      scrollYProgress={scrollYProgress}
                      onOpenModal={handleOpenModal}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
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
