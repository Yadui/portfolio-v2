"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { WorkStageContext } from "@/lib/work-stage-context";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Maps 0..1 across a sub-range, clamped and eased. */
const phase = (p, start, end, ease) => {
  const t = gsap.utils.clamp(0, 1, (p - start) / (end - start));
  return ease ? ease(t) : t;
};

const easeIn = gsap.parseEase("power2.in");
const easeInOut = gsap.parseEase("power2.inOut");

/** Fraction of the pinned scroll spent dismantling before the reveal starts. */
const DISMANTLE_END = 0.62;
/** Where the next section starts wiping down, and where it finishes.
 *  The reveal completes before the end of the pin so the incoming section
 *  is held fully visible for a beat instead of unpinning the instant it
 *  lands and scrolling straight off. */
const REVEAL_START = 0.68;
const REVEAL_END = 0.92;

/**
 * WorkStage — the pinned outro between the work section and whatever follows.
 *
 * Scrolling past the work section does not move the page straight away.
 * Instead the stage pins, and the scroll first strips the projects out one at
 * a time: each row's title, meta, description and arrow fade upward while its
 * number box fills and stays behind as a spent marker. Hovering is disabled
 * for rows that have gone, so nothing can be brought back. Once the list is
 * reduced to numbers and rules, the following section wipes down over the top
 * of it, so the next screen arrives from above rather than scrolling up from
 * below.
 *
 * The per-frame work is done with direct DOM writes against a small attribute
 * contract (`[data-work-row]`, `[data-erase]`) so a scroll frame never causes
 * a React render. Only the whole-number erased count is lifted into state.
 *
 * Below 768px, and for anyone who prefers reduced motion, no pin is created:
 * both sections render in ordinary document flow.
 */
export default function WorkStage({ children, next, continuousNext = false }) {
  const stageRef = useRef(null);
  const pinRef = useRef(null);
  const nextRef = useRef(null);
  const [erased, setErased] = useState(0);
  const [staged, setStaged] = useState(false);

  useGSAP(
    () => {
      const stage = stageRef.current;
      const pin = pinRef.current;
      const nextLayer = nextRef.current;
      // continuousNext only removes the wipe-over reveal — the pin and the
      // row-by-row dismantle ARE the Projects animation, so they must still
      // run. Bailing out here is what silently disabled it.
      if (!stage || !pin) return;
      if (!continuousNext && !nextLayer) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const rows = gsap.utils.toArray("[data-work-row]", stage);
          if (!rows.length) return;

          const count = rows.length;
          // With no wipe-over reveal to follow, the dismantle owns the whole
          // pin; otherwise it would finish at 62% and leave dead scroll.
          const dismantleEnd = continuousNext ? 1 : DISMANTLE_END;
          const per = dismantleEnd / count;
          const eraseTargets = rows.map((row) =>
            row.querySelectorAll("[data-erase]")
          );

          stage.dataset.staged = "true";
          setStaged(true);
          if (nextLayer) gsap.set(nextLayer, { clipPath: "inset(0% 0% 100% 0%)" });

          let lastErased = -1;

          const trigger = ScrollTrigger.create({
            trigger: stage,
            start: "top top",
            end: continuousNext ? `+=${Math.round(320 * DISMANTLE_END)}%` : "+=320%",
            pin: pin,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;

              // Strip each project in turn.
              rows.forEach((row, i) => {
                const t = phase(p, i * per, (i + 1) * per, easeIn);
                gsap.set(eraseTargets[i], {
                  autoAlpha: 1 - t,
                  y: -18 * t,
                });
                // The spent marker latches on only once the row has fully
                // gone, so the box fill reads as a discrete state rather
                // than tracking the fade.
                row.dataset.erased = t >= 1 ? "true" : "false";
              });

              // Note: clamp the *count*, not p/per — clamping the ratio to
              // 1 before flooring would peg the count at 1.
              const erasedNow = gsap.utils.clamp(0, count, Math.floor(p / per));
              if (erasedNow !== lastErased) {
                lastErased = erasedNow;
                setErased(erasedNow);
              }

              // The following section wipes down from the top edge. In
              // continuous mode it simply flows after the pin, so there is
              // nothing to wipe.
              if (nextLayer) {
                const r = phase(p, REVEAL_START, REVEAL_END, easeInOut);
                gsap.set(nextLayer, {
                  clipPath: `inset(0% 0% ${(1 - r) * 100}% 0%)`,
                });
              }
            },
          });

          return () => {
            trigger.kill();
            stage.dataset.staged = "false";
            setStaged(false);
            setErased(0);
            rows.forEach((row, i) => {
              row.dataset.erased = "false";
              gsap.set(eraseTargets[i], { clearProps: "all" });
            });
            if (nextLayer) gsap.set(nextLayer, { clearProps: "clipPath" });
          };
        }
      );

      return () => mm.revert();
    },
    { scope: stageRef }
  );

  return (
    <WorkStageContext.Provider value={{ erased, staged }}>
      <div
        ref={stageRef}
        className="work-stage"
        data-staged="false"
        data-continuous-next={continuousNext ? "true" : "false"}
      >
        <div ref={pinRef} className="work-stage-pin">
          {continuousNext ? (
            <>
              <div className="work-stage-layer">{children}</div>
              {next}
            </>
          ) : (
            <>
              <div className="work-stage-layer">{children}</div>
              <div ref={nextRef} className="work-stage-layer work-stage-next">
                {next}
              </div>
            </>
          )}
        </div>
      </div>
    </WorkStageContext.Provider>
  );
}
