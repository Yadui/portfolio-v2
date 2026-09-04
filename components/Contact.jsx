"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The height hand-off has to be written before the browser paints, otherwise
// the expanded card flashes at full size for a frame before the tween starts.
// useLayoutEffect would warn during SSR, so fall back to useEffect there.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Contact — direct conversation panel.
 *
 * The panel begins as a compact mark and expands as the section enters the
 * viewport. This keeps the contact CTA visually quiet until it is actually
 * encountered, while preserving the direct mail action and #contact anchor.
 */
export default function Contact() {
  const sectionRef = useRef(null);
  const panelRef = useRef(null);
  const [formOpen, setFormOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Opening the form changes the panel's intrinsic height. Height and vertical
  // offset are driven from a single tweened value so that the card's centre is
  // fixed by construction: it opens equally toward the top and the bottom.
  const skipFirstAnchor = useRef(true);
  // Height the card settled at before this toggle. It cannot be measured
  // inside the effect: React has already committed the new content by then,
  // so the panel is standing at its *target* height and a measurement there
  // would make the tween a no-op.
  const settledH = useRef(null);
  useIsomorphicLayoutEffect(() => {
    const panel = panelRef.current;
    const section = sectionRef.current;
    if (!panel || !section) return;
    // On mount the card must stay in its collapsed pre-scroll state, so the
    // first run only records the starting height.
    if (skipFirstAnchor.current) {
      skipFirstAnchor.current = false;
      settledH.current = panel.offsetHeight;
      return;
    }

    const from = settledH.current ?? panel.offsetHeight;
    gsap.set(panel, { height: "auto" });
    const to = panel.offsetHeight;
    settledH.current = to;

    // One writer for both properties. Deriving y from the same height in the
    // same frame is what keeps the centre still — the old version transitioned
    // min-height in CSS and re-anchored y from a rAF loop, so y was always
    // reacting to a height it had already been painted against.
    const place = (h) => {
      gsap.set(panel, {
        height: h,
        // `.is-form-open` raises min-height to the open size, and min-height
        // beats height in the cascade. Without neutralising it the opening
        // tween had no visible effect — the card snapped to full height and
        // only the y offset moved — while closing animated fine because the
        // floor had already dropped. Restored by settle().
        minHeight: 0,
        xPercent: -50,
        clipPath: "inset(0px 0px)",
        y: (section.clientHeight - h) / 2,
      });
    };

    const settle = () => {
      panel.style.minHeight = "";
      gsap.set(panel, { height: "auto" });
      const h = panel.offsetHeight;
      settledH.current = h;
      // Hand the height back to the content so later reflows are not pinned
      // to a stale pixel value.
      gsap.set(panel, {
        height: "auto",
        xPercent: -50,
        clipPath: "inset(0px 0px)",
        y: (section.clientHeight - h) / 2,
      });
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || from === to) {
      settle();
      return;
    }

    // Paint the starting height before the browser gets a frame, so the card
    // never flashes at full size.
    place(from);

    const proxy = { h: from };
    const tween = gsap.to(proxy, {
      h: to,
      duration: 0.55,
      ease: "power3.inOut",
      onUpdate: () => place(proxy.h),
      onComplete: settle,
    });

    return () => tween.kill();
  }, [formOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const organization = String(data.get("organization") || "").trim();

    if (!name || !email || !message) {
      setStatus({ type: "error", message: "Please fill in the required fields." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: name,
          organization,
          email,
          message,
          to: "abhinavyadav8+port@gmail.com",
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      setStatus({ type: "success", message: "Message sent successfully." });
    } catch {
      setStatus({ type: "error", message: "Could not send message. Please email directly." });
    } finally {
      setLoading(false);
    }
  };

  useGSAP(
    () => {
      const panel = panelRef.current;
      const section = sectionRef.current;
      if (!panel || !section) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // The card renders at full size with its content already laid out; a
      // clip-path window is what grows. Scaling the panel instead would
      // scale the text with it, and fading the text in made it appear on
      // scroll rather than simply being revealed.
      const SQUARE = 12;

      const finalY = () => (section.clientHeight - panel.offsetHeight) / 2;
      // The clipped window is centred, so the travelling square's centre is
      // the panel's centre; offset the panel so that centre starts at the top.
      const startY = () => -panel.offsetHeight / 2 + SQUARE / 2;
      /**
       * The reveal, expressed as a two-phase shape rather than one linear
       * interpolation of both insets.
       *
       * Interpolating top and side insets on the same progress keeps the
       * visible region at the panel's own aspect ratio, which is roughly 3:1.
       * The window therefore reads as a bar shrinking for the whole
       * transition and only resolves to a square in the last instant, so
       * scrolling away looked like the box closing to a bar.
       *
       * Now the window is square while it grows to the panel's short side,
       * and only then extends along the long side. Reversed by the scrub,
       * that reads as the panel narrowing back to the square it came from and
       * the square shrinking away.
       *
       * Dimensions are read live on every call, so a panel whose height has
       * changed (the form opening) still closes to a true square.
       */
      const SHAPE_SPLIT = 0.55;
      const applyClip = (progress) => {
        const w = panel.offsetWidth;
        const h = panel.offsetHeight;
        if (!w || !h) return;

        const short = Math.min(w, h);
        let visW;
        let visH;

        if (progress <= SHAPE_SPLIT) {
          // Square, growing from the mark to the panel's short side.
          const t = SHAPE_SPLIT === 0 ? 1 : progress / SHAPE_SPLIT;
          const side = SQUARE + (short - SQUARE) * t;
          visW = side;
          visH = side;
        } else {
          // Square reached; extend along whichever axis is longer.
          const t = (progress - SHAPE_SPLIT) / (1 - SHAPE_SPLIT);
          visW = w >= h ? short + (w - short) * t : short;
          visH = h > w ? short + (h - short) * t : short;
        }

        const insetX = Math.max(0, (w - Math.min(visW, w)) / 2);
        const insetY = Math.max(0, (h - Math.min(visH, h)) / 2);
        gsap.set(panel, { clipPath: `inset(${insetY}px ${insetX}px)` });
      };

      const applyBase = () => {
        gsap.set(panel, { xPercent: -50 });
      };

      if (reduceMotion) {
        applyBase();
        gsap.set(panel, { y: finalY(), autoAlpha: 1 });
        applyClip(1);
        return;
      }

      applyBase();
      gsap.set(panel, { y: startY(), autoAlpha: 1 });
      applyClip(0);

      const reveal = { p: 0 };

      const tween = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          // The contact section is the last block on the page. Ends tied to
          // the section geometry ("top 18%", "bottom bottom") are unreachable
          // because the document runs out of scroll first, and a short fixed
          // range made the square finish its descent while the section was
          // still below the fold. "max" spends exactly the remaining page
          // scroll, so the square travels the line in view.
          start: "top 85%",
          end: "max",
          // Lenis drives the scroll loop and goes idle when input stops, so a
          // smoothed scrub (e.g. 0.7) leaves its catch-up tween permanently
          // ~10% short: the panel froze at scale 0.897 / opacity 0.9. Direct
          // scrub maps progress with no catch-up tween to stall.
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: applyBase,
        },
      });
      tween
        // The square outruns the rising section if it starts immediately and
        // eases out, dropping below the fold mid-descent. Starting at 15% and
        // moving linearly keeps it on screen for the whole travel.
        .to(panel, { y: finalY, duration: 0.6, ease: "none" }, 0.15)
        // The window opens over the already-rendered content. Driven through
        // a proxy so the shape is recomputed from live dimensions each frame
        // rather than interpolating two fixed pixel insets.
        .to(
          reveal,
          {
            p: 1,
            duration: 0.25,
            ease: "power2.out",
            onUpdate: () => applyClip(reveal.p),
          },
          0.75
        );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section id="contact" ref={sectionRef} className="contact-panel-wrap">
      <div className="contact-panel-stage" aria-hidden="true" />
      <div ref={panelRef} className={`contact-panel${formOpen ? " is-form-open" : ""}`}>
        <button
          type="button"
          className="contact-panel-title"
          onClick={() => setFormOpen((open) => !open)}
          aria-expanded={formOpen}
        >
          <span aria-hidden="true" className="contact-bracket">[</span>
          <span>{formOpen ? "Close conversation" : "Start a conversation"}</span>
          <span aria-hidden="true" className="contact-bracket">]</span>
        </button>
        <div className="contact-panel-rule" aria-hidden="true" />
        {!formOpen && <p className="contact-panel-email">
          or write directly{" "}
          <a href="mailto:abhinavyadav8@gmail.com">
            abhinavyadav8@gmail.com
            <ArrowRight aria-hidden="true" size={22} strokeWidth={1.5} />
          </a>
        </p>}
        {formOpen && (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-grid">
              <label>
                Name
                <input name="name" type="text" required autoComplete="name" />
              </label>
              <label>
                Organization
                <input name="organization" type="text" autoComplete="organization" />
              </label>
              <label>
                Email
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label>
                Message
                <textarea name="message" rows={3} required />
              </label>
            </div>
            <div className="contact-form-actions">
              <button type="submit" disabled={loading} className="contact-form-submit">
                {loading ? "Sending..." : "Send"} <ArrowRight aria-hidden="true" size={18} />
              </button>
            </div>
            {status && <p className={`contact-form-status is-${status.type}`} role="status">{status.message}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
