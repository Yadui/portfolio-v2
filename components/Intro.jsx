"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SiOpenai, SiHuggingface, SiGithubcopilot, SiTensorflow,
  SiMicrosoftazure, SiAzuredevops, SiKubernetes, SiTerraform,
} from "react-icons/si";
import { FaAws, FaDocker } from "react-icons/fa";
import { FaPython } from "react-icons/fa";
import MediaBetweenText from "@/components/fancy/MediaBetweenText";
import Image from "next/image";

/* ─── Claude SVG ─────────────────────────────────────────────────────────── */
const ClaudeIcon = () => (
  <svg height="1em" width="1em" viewBox="0 0 24 24" aria-label="Claude" style={{ display: "inline-block", flexShrink: 0 }}>
    <path clipRule="evenodd" d="M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z" fill="#D97757" fillRule="evenodd" />
  </svg>
);

/* ─── Icon lists (from the skills section, correct groups) ─────────────────
   AI  → Claude, OpenAI, HuggingFace, GitHub Copilot, Python, TensorFlow
   Cloud → Azure, Docker, K8s, Terraform, AWS, Azure DevOps
───────────────────────────────────────────────────────────────────────────── */
const AI_ICONS = [
  { el: <ClaudeIcon />,                            label: "Claude"         },
  { el: <SiOpenai       color="#10A37F" />,        label: "OpenAI"         },
  { el: <SiHuggingface  color="#FFCC00" />,        label: "HuggingFace"    },
  { el: <SiGithubcopilot color="#8957e5" />,       label: "GitHub Copilot" },
  { el: <FaPython        color="#3776AB" />,       label: "Python"         },
  { el: <SiTensorflow    color="#FF6F00" />,       label: "TensorFlow"     },
];

const CLOUD_ICONS = [
  { el: <SiMicrosoftazure color="#0078D4" />,      label: "Azure"          },
  { el: <FaDocker         color="#2496ED" />,      label: "Docker"         },
  { el: <SiKubernetes     color="#326CE5" />,      label: "Kubernetes"     },
  { el: <SiTerraform      color="#7B42BC" />,      label: "Terraform"      },
  { el: <FaAws            color="#FF9900" />,      label: "AWS"            },
  { el: <SiAzuredevops    color="#0072C6" />,      label: "Azure DevOps"   },
];

const AI_ROTATE    = 1400; // AI icons cycle faster
const CLOUD_ROTATE = 2200; // cloud icons cycle slower → the two desync

/* ─── RotatingIcon ───────────────────────────────────────────────────────── */
const RotatingIcon = ({ icons, fontSize, interval = 1800, startDelay = 0 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let id;
    const startTimer = setTimeout(() => {
      id = setInterval(() => setIndex(i => (i + 1) % icons.length), interval);
    }, startDelay);
    return () => {
      clearTimeout(startTimer);
      if (id) clearInterval(id);
    };
  }, [icons.length, interval, startDelay]);

  const { el, label } = icons[index];

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        initial={{ opacity: 0, scale: 0.55, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.55, y: -5 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        aria-label={label}
        title={label}
        className="inline-flex items-center justify-center"
        style={{ fontSize }}
      >
        {el}
      </motion.span>
    </AnimatePresence>
  );
};

/* ─── Constants ──────────────────────────────────────────────────────────── */
const headingSize = "clamp(2.2rem,7.5vw,5.5rem)";
const iconSize    = "clamp(1.8rem,5.6vw,4.4rem)";
const iconSlotH   = "clamp(2.2rem,6.8vw,5rem)";

// No bg — bare icon, centered in its slot
const slotCls = "overflow-hidden mx-[0.06em] flex items-center justify-center self-center";

// Spread open on reveal; starts collapsed (width:0)
const spreadVariant = (delay = 0) => ({
  initial: { width: 0, opacity: 0 },
  animate: {
    width: iconSlotH,
    opacity: 1,
    transition: { duration: 0.55, type: "spring", bounce: 0.25, delay },
  },
});

// Connecting words ("I build", "and", "the things in between") — reduced
// to 0.78em so they sit at the same optical size as the highlight fonts,
// which keeps the whole line visually level.
const segCls       = "font-heading font-light tracking-tight text-white leading-none text-[0.78em]";
const lettersCls   = "font-letters leading-none";
const lettersIICls = "font-letters-ii leading-none";

/* ─── Spread-controlled MediaBetweenText wrapper ────────────────────────────
   Uses triggerType="ref" so the spread fires exactly when `open` flips true
   (i.e. when the section reveals), giving the "text spreads apart" effect.
───────────────────────────────────────────────────────────────────────────── */
const SpreadSlot = ({ icons, open, delay, reduceMotion, rotateInterval, rotateStartDelay = 0 }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (open) ref.current?.animate();
    else ref.current?.reset();
  }, [open]);

  return (
    <MediaBetweenText
      ref={ref}
      firstText="" secondText="" mediaUrl="" mediaType="image"
      triggerType="ref"
      className="inline-flex items-center"
      mediaContainerClassName={slotCls}
      animationVariants={
        reduceMotion
          ? { initial: { width: 0, opacity: 0 }, animate: { width: iconSlotH, opacity: 1, transition: { duration: 0 } } }
          : spreadVariant(delay)
      }
    >
      <span className="flex h-full w-full items-center justify-center" style={{ height: iconSlotH }}>
        <RotatingIcon
          icons={icons}
          fontSize={iconSize}
          interval={rotateInterval}
          startDelay={rotateStartDelay}
        />
      </span>
    </MediaBetweenText>
  );
};

/* ─── Section ────────────────────────────────────────────────────────────── */
const Intro = () => {
  const sectionRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); io.disconnect(); } },
      { threshold: 0.25 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const show = reduce || revealed;

  const handleContactClick = useCallback((e) => {
    e.preventDefault();
    const el = document.getElementById("contact");
    if (!el) return;
    if (reduce) { el.scrollIntoView({ behavior: "auto", block: "start" }); return; }
    el.style.transition = "none";
    el.style.opacity = "0";
    el.scrollIntoView({ behavior: "auto", block: "start" });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition = "opacity 0.65s ease";
      el.style.opacity = "1";
      el.addEventListener("transitionend", () => { el.style.transition = ""; el.style.opacity = ""; }, { once: true });
    }));
  }, [reduce]);

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center overflow-hidden bg-black px-6 py-[clamp(3.5rem,10vh,8rem)] sm:min-h-below-nav"
    >
      {/* Radial glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 55% at 50% 54%, rgba(0,255,153,0.07) 0%, transparent 70%)" }} />

      {/* ── Map left-half — desktop only, hidden on mobile to protect LCP ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden sm:block"
        style={{
          width: "clamp(260px, 38vw, 580px)",
          WebkitMaskImage:
            "linear-gradient(to right, black 0%, black 25%, rgba(0,0,0,0.5) 60%, transparent 100%), linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, black 0%, black 25%, rgba(0,0,0,0.5) 60%, transparent 100%), linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
          WebkitMaskComposite: "intersect",
          maskComposite: "intersect",
          mixBlendMode: "screen",
          opacity: 0.85,
        }}
      >
        <Image
          src="/delhi-map-left.webp"
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center left", transform: "scale(0.72)", transformOrigin: "top left" }}
          priority={false}
          sizes="38vw"
        />
      </div>

      {/* ── Map right-half — desktop only, hidden on mobile to protect LCP ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden sm:block"
        style={{
          width: "clamp(260px, 38vw, 580px)",
          WebkitMaskImage:
            "linear-gradient(to left, black 0%, black 25%, rgba(0,0,0,0.5) 60%, transparent 100%), linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
          maskImage:
            "linear-gradient(to left, black 0%, black 25%, rgba(0,0,0,0.5) 60%, transparent 100%), linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
          WebkitMaskComposite: "intersect",
          maskComposite: "intersect",
          mixBlendMode: "screen",
          opacity: 0.85,
        }}
      >
        <Image
          src="/delhi-map-right.webp"
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center right", transform: "scale(0.72)", transformOrigin: "top right" }}
          priority={false}
          sizes="38vw"
        />
      </div>

      <div
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(32px)",
          transition: reduce ? "none" : "opacity 0.85s ease, transform 0.85s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Kicker */}
        <p className="font-body text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-white/40">
          Abhinav Yadav — Cloud &amp; AI Engineer
        </p>

        {/* ── Mobile headline: clean, no special fonts, no animations ──────── */}
        <h2
          className="mt-5 w-full sm:hidden"
          style={{ fontSize: "clamp(2.4rem, 11vw, 3.4rem)", lineHeight: 1.1 }}
          aria-label="I build AI systems, cloud infrastructure, and the things in between"
        >
          <span className="block font-heading font-light tracking-tight text-white">
            I build{" "}
            <span style={{ color: "#00ff99" }}>AI</span>
            {" "}systems,
          </span>
          <span className="mt-1 block font-heading font-light tracking-tight text-white">
            cloud
          </span>
          <span className="block font-heading font-light tracking-tight text-white">
            infrastructure
          </span>
          <span className="mt-1 block font-heading font-light tracking-tight text-white/50" style={{ fontSize: "0.72em" }}>
            and the things in between
          </span>
        </h2>

        {/* ── Desktop headline: full animated version (sm and up) ───────────── */}
        <h2
          className="mt-6 hidden w-full sm:block"
          style={{ fontSize: headingSize }}
          aria-label="I build AI systems, cloud infrastructure, and the things in between"
        >
          {/* Line 1 · I build AI [icon] systems */}
          <span className="flex flex-wrap items-center justify-center gap-x-[0.18em] leading-[1]">
            <span className={`${segCls} inline-flex items-center`}>I build</span>

            <span className={`${lettersCls} ay-shimmer inline-flex items-center${show && !reduce ? " ay-shimmer-go" : ""}`} style={{ color: "#00ff99" }}>
              AI
            </span>

            {/* Icon slot opens between "AI" and "systems" */}
            <SpreadSlot icons={AI_ICONS} open={show} delay={0.05} reduceMotion={reduce} rotateInterval={AI_ROTATE} />

            <span className={`${lettersCls} ay-shimmer inline-flex items-center${show && !reduce ? " ay-shimmer-go" : ""}`} style={{ color: "#00ff99" }}>
              systems
            </span>
          </span>

          {/* Line 2 · cloud [icon] infrastructure */}
          <span className="mt-[0.15em] flex flex-wrap items-center justify-center gap-x-[0.18em] leading-[1]">
            <span className={`${lettersIICls} inline-flex items-center`} style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.9)", WebkitTextFillColor: "transparent", color: "transparent" }}>
              cloud
            </span>

            {/* Icon slot opens between "cloud" and "infrastructure" */}
            <SpreadSlot icons={CLOUD_ICONS} open={show} delay={0.2} reduceMotion={reduce} rotateInterval={CLOUD_ROTATE} rotateStartDelay={700} />

            <span className={`${lettersIICls} inline-flex items-center`} style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.9)", WebkitTextFillColor: "transparent", color: "transparent" }}>
              infrastructure
            </span>
          </span>

          {/* Line 3 · and the things in between */}
          <span className="mt-[0.15em] flex flex-wrap items-center justify-center gap-x-[0.18em] leading-[1]">
            <span className={`${segCls} inline-flex items-center`}>and</span>
            <span className={`${segCls} inline-flex items-center`}>
              the things in between
            </span>
          </span>
        </h2>

        {/* Sub-line + CTA */}
        <div
          className="mt-7 flex flex-col items-center gap-5"
          style={{ opacity: show ? 1 : 0, transition: reduce ? "none" : "opacity 0.7s ease 0.5s" }}
        >
          <p className="max-w-sm px-2 font-body text-[clamp(0.85rem,1.5vw,1.05rem)] leading-relaxed text-white/50 sm:max-w-xl sm:px-0">
            Currently at{" "}
            <a href="https://foetron.vercel.app" target="_blank" rel="noopener noreferrer" className="text-white/80 underline underline-offset-4 transition-colors hover:text-[#00ff99]">
              Foetron
            </a>
            , building on Azure — shipping cloud + AI in production.
          </p>

          <a
            href="#contact"
            onClick={handleContactClick}
            className="group mt-1 flex items-center gap-3 font-heading text-lg font-light tracking-tight text-white transition-all duration-300 hover:text-[#00ff99] md:text-xl"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/20 transition-all duration-300 group-hover:border-[#00ff99] group-hover:bg-[#00ff99]/10">
              <span className="text-sm transition-transform duration-300 ease-out group-hover:rotate-45">↗</span>
            </span>
            Let&apos;s work together
          </a>
        </div>
      </div>
    </section>
  );
};

export default Intro;
