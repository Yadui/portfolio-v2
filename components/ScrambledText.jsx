"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_SCRAMBLE_CHARS = "!@#$%^&*()-_=+[]{}|;:,.<>/?";
const randomFrom = (pool) => pool[Math.floor(Math.random() * pool.length)] || " ";
const scramblePreview = (value, pool) =>
  Array.from(value).map((char) => (char === " " ? " " : randomFrom(pool))).join("");

const ScrambledText = ({
  text = "",
  children = "",
  as = "span",
  className = "",
  style = undefined,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = DEFAULT_SCRAMBLE_CHARS,
  active = true,
  triggerOnView = false,
  once = true,
  onComplete = undefined,
}) => {
  const Tag = as;
  const rootRef = useRef(null);
  const startedRef = useRef(false);
  const isRunningRef = useRef(false);

  const targetText = useMemo(() => {
    if (typeof text === "string") return text;
    if (typeof children === "string") return children;
    return String(children ?? "");
  }, [children, text]);
  const resolvedChars = useMemo(
    () => (scrambleChars.length > 0 ? scrambleChars : DEFAULT_SCRAMBLE_CHARS),
    [scrambleChars]
  );

  const [displayText, setDisplayText] = useState(() =>
    scramblePreview(targetText, resolvedChars)
  );
  const [inView, setInView] = useState(!triggerOnView);

  useEffect(() => {
    startedRef.current = false;
    isRunningRef.current = false;
    setDisplayText(scramblePreview(targetText, resolvedChars));
  }, [resolvedChars, targetText]);

  useEffect(() => {
    if (!triggerOnView || !rootRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
          startedRef.current = false;
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [once, triggerOnView]);

  useEffect(() => {
    const canRun = active && inView;
    if (!canRun || !targetText || (once && startedRef.current) || isRunningRef.current) {
      return undefined;
    }

    startedRef.current = true;
    isRunningRef.current = true;
    let completed = false;

    const total = targetText.length;
    const frameMs = Math.max(16, Math.round(42 - speed * 18));
    const durationMs = Math.max(260, duration * 1000);
    const start = performance.now();

    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const revealCount = Math.floor(progress * total);

      let next = "";
      for (let index = 0; index < total; index += 1) {
        const original = targetText[index];
        if (original === " ") {
          next += " ";
        } else if (index < revealCount || progress === 1) {
          next += original;
        } else {
          next += randomFrom(resolvedChars);
        }
      }

      setDisplayText(next);

      if (progress >= 1) {
        completed = true;
        window.clearInterval(timer);
        setDisplayText(targetText);
        isRunningRef.current = false;
        onComplete?.();
      }
    }, frameMs);

    return () => {
      window.clearInterval(timer);
      isRunningRef.current = false;
      if (!completed) {
        startedRef.current = false;
      }
    };
  }, [active, duration, inView, onComplete, once, resolvedChars, speed, targetText]);

  return (
    <Tag ref={rootRef} className={className} style={style} aria-label={targetText}>
      {displayText}
    </Tag>
  );
};

export default ScrambledText;