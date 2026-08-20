"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { useWorkStage } from "@/lib/work-stage-context";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * WorkIndex — the selected-work ledger.
 *
 * Structure: a fixed vertical rule at 60.5% of the width, titles right-aligned
 * against it, numbered boxes straddling it, and category/description copy to
 * its right. Row separators are rendered as an independent set of N+1 rules so
 * that the rule shared between two adjacent rows is never re-animated when
 * focus moves between them — only the outgoing top rule and the incoming
 * bottom rule change state.
 */

/** X position of the vertical rule, as a percentage of the list width. */
const RULE_X = "60.5%";

export default function WorkIndex({ items }) {
  const [hovered, setHovered] = useState(0);
  const { erased } = useWorkStage();
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const markerRef = useRef(null);
  const rowRefs = useRef([]);
  const markerTo = useRef(null);

  const count = items.length;

  // Once the outro starts stripping projects, the focus follows the strip
  // rather than the pointer: the active row is always the next one still
  // standing, which is what leaves the last project highlighted while the
  // earlier ones reduce to spent markers.
  const dismantling = erased > 0;
  const active = dismantling ? Math.min(erased, count - 1) : hovered;

  /* Slide the spine marker to the active row. The number boxes deliberately
     stay put and fill in place, so only the marker travels. */
  useGSAP(
    () => {
      const marker = markerRef.current;
      const list = listRef.current;
      if (!marker || !list) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const place = (animate) => {
        const row = rowRefs.current[active];
        if (!row) return;

        // Measured against the list, not the row: the row is a positioned
        // ancestor, so offsetTop would be row-relative and always ~0.
        const listTop = list.getBoundingClientRect().top;
        const rect = row.getBoundingClientRect();
        gsap.set(marker, { height: rect.height });

        if (!animate) {
          gsap.set(marker, { y: rect.top - listTop });
          return;
        }

        if (!markerTo.current) {
          markerTo.current = gsap.quickTo(marker, "y", {
            duration: 0.55,
            ease: "power3.out",
          });
        }
        markerTo.current(rect.top - listTop);
      };

      place(!reduceMotion);

      // Row heights are viewport-relative, so re-measure on resize.
      const observer = new ResizeObserver(() => {
        markerTo.current = null;
        place(false);
      });
      observer.observe(list);

      return () => observer.disconnect();
    },
    { scope: rootRef, dependencies: [active] }
  );

  /* Section reveal — plays as the orange hero wipe reaches full bleed. */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const targets = root.querySelectorAll("[data-reveal]");
      if (!targets.length) return;

      if (reduceMotion) {
        gsap.set(targets, { y: 0, autoAlpha: 1 });
        return;
      }

      gsap.set(targets, { y: 28, autoAlpha: 0 });

      const tween = gsap.to(targets, {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.055,
        scrollTrigger: {
          trigger: root,
          // Fires while the hero's orange fill is still expanding, so the
          // ledger arrives into colour rather than after it.
          start: "top 78%",
          once: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: rootRef }
  );

  // Rows that have been stripped cannot be brought back by hovering.
  const activate = useCallback(
    (index) => {
      if (erased > 0) return;
      setHovered(index);
    },
    [erased]
  );

  const pad = (n) => String(n + 1).padStart(2, "0");

  return (
    <div ref={rootRef} className="work-index">
      {/* Full-height spine running the whole section, as in the reference */}
      <span
        aria-hidden="true"
        className="work-spine-full"
        style={{ left: RULE_X }}
      />

      {/* ── Section header ─────────────────────────────────────────── */}
      <div className="work-head" data-reveal>
        <span className="work-eyebrow">Selected work</span>
        <span className="work-counter" aria-live="polite">
          Active {pad(active)} / {pad(count - 1)}
        </span>
      </div>

      <div className="work-intro">
        <h2 className="work-title" data-reveal>
          Selected work,
          <br />
          shaped as systems.
        </h2>
        <p className="work-standfirst" data-reveal>
          Cloud, AI and product work, each one resolved as a single connected
          system rather than a pile of features.
        </p>
      </div>

      {/* ── Ledger ─────────────────────────────────────────────────── */}
      <div
        ref={listRef}
        className="work-list"
        data-reveal
        onMouseLeave={() => {
          if (erased === 0) setHovered(0);
        }}
      >
        {/* Vertical rule + travelling marker */}
        <div className="work-spine" aria-hidden="true" style={{ left: RULE_X }}>
          <div ref={markerRef} className="work-spine-marker" />
        </div>

        {/* Separator rules: one per boundary, N + 1 total. */}
        {Array.from({ length: count + 1 }).map((_, i) => (
          <span
            key={`rule-${i}`}
            aria-hidden="true"
            className="work-sep"
            data-lit={i === active || i === active + 1 ? "true" : "false"}
            style={{ "--sep-index": i }}
          />
        ))}

        <ul className="work-rows">
          {items.map((item, i) => {
            const isActive = i === active;
            return (
              <li
                key={item.id}
                ref={(node) => {
                  rowRefs.current[i] = node;
                }}
                className="work-row"
                data-work-row
                data-erased="false"
                data-active={isActive ? "true" : "false"}
                onMouseEnter={() => activate(i)}
              >
                <a
                  className="work-row-link"
                  href={item.link}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onFocus={() => activate(i)}
                  aria-label={`${item.title} — ${item.label}. ${item.description}`}
                >
                  {/* Left meta bracket (active only) */}
                  <span className="work-meta" data-erase aria-hidden="true">
                    [ {item.year} · {item.kind}
                    <br />
                    {item.tags} ]
                  </span>

                  {/* Title, right-aligned against the spine */}
                  <span className="work-row-title" data-erase>
                    {item.title}
                  </span>

                  {/* Number box straddling the spine */}
                  <span className="work-num" data-num-box aria-hidden="true">
                    <span>{pad(i)}</span>
                  </span>

                  {/* Category + description, right of the spine */}
                  <span className="work-row-body" data-erase>
                    <span className="work-row-label">{item.label}</span>
                    <span className="work-row-desc">{item.description}</span>
                  </span>

                  <span className="work-arrow" data-erase aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
