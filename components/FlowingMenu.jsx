"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import styles from "./FlowingMenu.module.css";

const animationDefaults = { duration: 0.6, ease: "expo.out" };

const distMetric = (x, y, x2, y2) => {
  const xDiff = x - x2;
  const yDiff = y - y2;

  return xDiff * xDiff + yDiff * yDiff;
};

const findClosestEdge = (mouseX, mouseY, width, height) => {
  const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
  const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);

  return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
};

const getEdgeFromEvent = (event, element) => {
  if (
    !element ||
    typeof event?.clientX !== "number" ||
    typeof event?.clientY !== "number"
  ) {
    return "bottom";
  }

  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  return findClosestEdge(x, y, rect.width, rect.height);
};

function FlowingMenu({
  items = [],
  speed = 15,
  textColor = "#fff",
  bgColor = "#120F17",
  marqueeBgColor = "#fff",
  marqueeTextColor = "#120F17",
  borderColor = "#fff",
  onItemActivate,
}) {
  return (
    <div className={styles.menuWrap} style={{ backgroundColor: bgColor }}>
      <nav className={styles.menu} aria-label="Projects menu">
        {items.map((item) => (
          <MenuItem
            key={item.id ?? item.text}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            onActivate={() => onItemActivate?.(item.id)}
          />
        ))}
      </nav>
    </div>
  );
}

function MenuItem({
  link,
  text,
  image,
  category,
  metaText,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  onActivate,
}) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const animationRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!itemRef.current || !marqueeInnerRef.current) {
        return;
      }

      const marqueeContent = marqueeInnerRef.current.querySelector(
        `.${styles.marqueePart}`
      );

      if (!marqueeContent) {
        return;
      }

      const contentWidth = marqueeContent.offsetWidth;
      const itemWidth = itemRef.current.offsetWidth;

      if (!contentWidth || !itemWidth) {
        return;
      }

      const needed = Math.ceil(itemWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);

    return () => {
      window.removeEventListener("resize", calculateRepetitions);
    };
  }, [text, image, category, metaText]);

  useEffect(() => {
    let frameId = 0;

    const setupMarquee = () => {
      if (!marqueeInnerRef.current) {
        return;
      }

      const marqueeContent = marqueeInnerRef.current.querySelector(
        `.${styles.marqueePart}`
      );

      if (!marqueeContent) {
        return;
      }

      const contentWidth = marqueeContent.offsetWidth;

      if (!contentWidth) {
        return;
      }

      animationRef.current?.kill();
      gsap.set(marqueeInnerRef.current, { x: 0 });
      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };

    frameId = window.requestAnimationFrame(setupMarquee);

    return () => {
      window.cancelAnimationFrame(frameId);
      animationRef.current?.kill();
    };
  }, [text, image, category, metaText, repetitions, speed]);

  const runEnter = (edge) => {
    if (!marqueeRef.current || !marqueeInnerRef.current) {
      return;
    }

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const runLeave = (edge) => {
    if (!marqueeRef.current || !marqueeInnerRef.current) {
      return;
    }

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };

  const handleMouseEnter = (event) => {
    setIsHighlighted(true);
    onActivate?.();
    runEnter(getEdgeFromEvent(event, itemRef.current));
  };

  const handleMouseLeave = (event) => {
    setIsHighlighted(false);
    runLeave(getEdgeFromEvent(event, itemRef.current));
  };

  const handleFocus = () => {
    setIsHighlighted(true);
    onActivate?.();
    runEnter("bottom");
  };

  const handleBlur = () => {
    setIsHighlighted(false);
    runLeave("top");
  };

  const handleTouchStart = () => {
    setIsHighlighted(true);
    onActivate?.();
    runEnter("bottom");
  };

  const handleMouseMove = () => {
    onActivate?.();
  };

  return (
    <div
      ref={itemRef}
      className={styles.menuItem}
      style={{ borderColor }}
    >
      <a
        className={styles.menuItemLink}
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onTouchStart={handleTouchStart}
        style={{ color: textColor }}
      >
        <div
          className={`${styles.menuItemCopy} ${
            isHighlighted ? styles.menuItemContentHidden : ""
          }`}
        >
          <span className={styles.menuItemEyebrow}>{category}</span>
          <span className={styles.menuItemTitle}>{text}</span>
        </div>

        <div
          className={`${styles.menuItemMeta} ${
            isHighlighted ? styles.menuItemContentHidden : ""
          }`}
        >
          <span className={styles.menuItemMetaText}>{metaText}</span>
          <span className={styles.menuItemArrow}>Open</span>
        </div>
      </a>

      <div
        className={styles.marquee}
        ref={marqueeRef}
        style={{ backgroundColor: marqueeBgColor }}
      >
        <div className={styles.marqueeInnerWrap}>
          <div className={styles.marqueeInner} ref={marqueeInnerRef} aria-hidden="true">
            {Array.from({ length: repetitions }).map((_, index) => (
              <div
                className={styles.marqueePart}
                key={`${text}-${index}`}
                style={{ color: marqueeTextColor }}
              >
                <span className={styles.marqueeLabel}>{text}</span>
                {image ? (
                  <div
                    className={styles.marqueeImage}
                    style={{ backgroundImage: `url(${image})` }}
                  />
                ) : (
                  <div className={styles.marqueeFallback}>{category}</div>
                )}
                <span className={styles.marqueeLabel}>{metaText}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;