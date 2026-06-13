"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const previewRef = useRef(null);
  const previewImgRef = useRef(null);
  const moveRef = useRef(null);
  const previewVisibleRef = useRef(false);
  const [previewEnabled, setPreviewEnabled] = useState(false);

  // The hover preview is desktop-only candy: fine pointers, motion allowed.
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPreviewEnabled(fine && !reduce);
  }, []);

  // Warm the image cache so the first hover doesn't flash empty.
  useEffect(() => {
    if (!previewEnabled) return;
    items.forEach((item) => {
      if (item.image) {
        const img = new Image();
        img.src = item.image;
      }
    });
  }, [items, previewEnabled]);

  // Follow setup — the preview lives in a portal on <body>, because the
  // home page translates this section's wrapper (transform breaks
  // position:fixed for descendants).
  useEffect(() => {
    const el = previewRef.current;
    if (!previewEnabled || !el) return undefined;

    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0, rotation: -5 });
    moveRef.current = {
      x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }),
    };

    return () => {
      moveRef.current = null;
      gsap.killTweensOf(el);
    };
  }, [previewEnabled]);

  const handlePointerMove = useCallback((event) => {
    moveRef.current?.x(event.clientX);
    moveRef.current?.y(event.clientY);
  }, []);

  const showPreview = useCallback((item, event) => {
    const el = previewRef.current;
    if (!el) return;

    if (previewImgRef.current && item?.image) {
      previewImgRef.current.src = item.image;
      previewImgRef.current.style.display = "";
    } else if (previewImgRef.current) {
      previewImgRef.current.style.display = "none";
    }

    // Snap to the cursor before scaling in so it never flies across screen.
    if (event && !previewVisibleRef.current) {
      gsap.set(el, { x: event.clientX, y: event.clientY });
    }

    if (!previewVisibleRef.current) {
      previewVisibleRef.current = true;
      gsap.to(el, {
        scale: 1,
        rotation: 0,
        duration: 0.45,
        ease: "back.out(1.5)",
        overwrite: "auto",
      });
    }
  }, []);

  const hidePreview = useCallback(() => {
    const el = previewRef.current;
    if (!el || !previewVisibleRef.current) return;
    previewVisibleRef.current = false;
    gsap.to(el, {
      scale: 0,
      rotation: -5,
      duration: 0.3,
      ease: "power3.in",
      overwrite: "auto",
    });
  }, []);

  return (
    <div
      className={styles.menuWrap}
      style={{ backgroundColor: bgColor }}
      onMouseMove={previewEnabled ? handlePointerMove : undefined}
      onMouseLeave={previewEnabled ? hidePreview : undefined}
    >
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
            onPreview={
              previewEnabled ? (event) => showPreview(item, event) : undefined
            }
          />
        ))}
      </nav>

      {previewEnabled &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={previewRef}
            aria-hidden="true"
            // Inline zIndex (not a class): must always paint above the
            // stacked sticky sections (z 10-14), below the fixed chrome
            // (veil 100 / menu 105 / header 110).
            style={{ zIndex: 95 }}
            className="pointer-events-none fixed left-0 top-0 h-[clamp(170px,24vw,300px)] w-[clamp(170px,24vw,300px)] overflow-hidden rounded-lg shadow-[0_30px_90px_rgba(0,0,0,0.45)] will-change-transform"
          >
            <img
              ref={previewImgRef}
              src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
              alt=""
              draggable={false}
              className="h-full w-full object-cover"
            />
          </div>,
          document.body
        )}
    </div>
  );
}

function MenuItem({
  link,
  text,
  category,
  metaText,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  onActivate,
  onPreview,
}) {
  const itemRef = useRef(null);
  const linkRef = useRef(null);
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
  }, [text, category, metaText]);

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
  }, [text, category, metaText, repetitions, speed]);

  // Return the item to its resting state. Project links open in a new tab
  // (target="_blank"), which steals window focus but leaves the clicked <a>
  // still focused in this document. The :focus-within CSS rule (and the
  // highlight state) then keep the title/meta at opacity:0, so the content
  // looks "gone" until a reload. Clearing focus + collapsing the marquee when
  // the tab is left fixes the content disappearing on return.
  const resetToResting = useCallback(() => {
    setIsHighlighted(false);
    if (marqueeRef.current) {
      gsap.set(marqueeRef.current, { y: "101%" });
    }
    if (marqueeInnerRef.current) {
      gsap.set(marqueeInnerRef.current, { y: "-101%" });
    }
    const link = linkRef.current;
    if (link && document.activeElement === link) {
      link.blur();
    }
  }, []);

  useEffect(() => {
    const handleHidden = () => {
      if (document.visibilityState === "hidden") {
        resetToResting();
      }
    };

    window.addEventListener("blur", resetToResting);
    window.addEventListener("pagehide", resetToResting);
    document.addEventListener("visibilitychange", handleHidden);

    return () => {
      window.removeEventListener("blur", resetToResting);
      window.removeEventListener("pagehide", resetToResting);
      document.removeEventListener("visibilitychange", handleHidden);
    };
  }, [resetToResting]);

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
    onPreview?.(event);
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
      data-menu-row
      className={styles.menuItem}
      style={{ borderColor }}
    >
      <a
        ref={linkRef}
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
                <span className={styles.marqueeSep} aria-hidden="true">
                  ✦
                </span>
                <span className={styles.marqueeLabel}>{metaText}</span>
                <span className={styles.marqueeSep} aria-hidden="true">
                  ✦
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;
